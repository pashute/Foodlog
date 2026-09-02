// Filename: auth.servercode.ts
// Cloudflare Worker for OAuth token exchange and refresh
// Routes: POST /api/auth/exchange, POST /api/auth/refresh

export interface Env {
  FOODLOG_SECURE_KV: KVNamespace
  SESSION_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

const encoder = new TextEncoder()
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SESSION_EXPIRY_DAYS = 7

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}

function base64Url(bytes: Uint8Array): string {
  let text = ''
  for (const byte of bytes) text += String.fromCharCode(byte)
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}

function createSessionToken(userId: string, secret: string): Promise<string> {
  const expires = Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  const payload = base64Url(encoder.encode(JSON.stringify({ userId, expires })))
  return sign(payload, secret).then((signature) => `${payload}.${signature}`)
}

async function decodeJwt(jwt: string): Promise<any> {
  const parts = jwt.split('.')
  if (parts.length !== 3) return null
  try {
    const decoded = decodeBase64Url(parts[1])
    return JSON.parse(new TextDecoder().decode(decoded))
  } catch {
    return null
  }
}

async function exchangeGoogleCode(code: string, clientId: string, redirectUri: string, clientSecret: string, codeVerifier: string): Promise<any> {
  console.log('[exchangeGoogleCode] Sending to Google:', { code: code.substring(0, 20) + '...', clientId, redirectUri, grant_type: 'authorization_code' })

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
    }).toString(),
  })

  console.log('[exchangeGoogleCode] Google response:', { status: response.status, ok: response.ok })

  if (!response.ok) {
    const error = await response.text()
    console.error('[exchangeGoogleCode] Google error:', { status: response.status, error, body: error.substring(0, 500) })
    throw new Error(`Google token exchange failed: ${response.status} ${error}`)
  }

  const tokens = await response.json()
  console.log('[exchangeGoogleCode] Google success:', { hasAccessToken: !!tokens.access_token, hasIdToken: !!tokens.id_token })
  return tokens
}

async function refreshGoogleToken(refreshToken: string, clientId: string, clientSecret: string): Promise<any> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }).toString(),
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

async function handleExchange(request: Request, env: Env): Promise<Response> {
  try {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [handleExchange] Request received`)

    // Check if secrets are loaded
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) {
      console.error('Missing env config:', { hasClientId: !!env.GOOGLE_CLIENT_ID, hasClientSecret: !!env.GOOGLE_CLIENT_SECRET, hasSessionSecret: !!env.SESSION_SECRET })
      return json({ error: 'server_misconfigured' }, 500)
    }
    const body = await request.json()
    console.log('[handleExchange] Request body:', { code: body.code ? body.code.substring(0, 20) + '...' : 'missing', redirectUri: body.redirectUri, codeVerifier: body.codeVerifier ? body.codeVerifier.substring(0, 20) + '...' : 'MISSING', platform: body.platform })

    const { code, redirectUri, codeVerifier, platform } = body as any

    console.log('[handleExchange] Parsed values:', { code: !!code, redirectUri: !!redirectUri, codeVerifier: !!codeVerifier, platform: !!platform })

    if (!code || !redirectUri || !codeVerifier || !platform) {
      console.error('[handleExchange] Missing params:', { code: !code, redirectUri: !redirectUri, codeVerifier: !codeVerifier, platform: !platform })
      return json({ error: 'missing_params', missing: { code: !code, redirectUri: !redirectUri, codeVerifier: !codeVerifier, platform: !platform } }, 400)
    }

    // Exchange code for tokens via Google (using server's credentials)
    const googleResponse = await exchangeGoogleCode(code, env.GOOGLE_CLIENT_ID, redirectUri, env.GOOGLE_CLIENT_SECRET, codeVerifier)
    if (!googleResponse.access_token || !googleResponse.id_token) {
      return json({ error: 'google_token_invalid' }, 400)
    }

    // Decode id_token to extract userId
    console.log('[handleExchange] Decoding id_token')
    const idTokenPayload = await decodeJwt(googleResponse.id_token)
    console.log('[handleExchange] id_token decoded:', { hasSub: !!idTokenPayload?.sub })
    if (!idTokenPayload?.sub) {
      console.error('[handleExchange] Invalid id_token: no sub claim')
      return json({ error: 'invalid_id_token' }, 400)
    }

    const userId = idTokenPayload.sub
    console.log('[handleExchange] userId extracted:', userId.substring(0, 20) + '...')

    // Store refresh_token in KV (for native platforms that have offline access)
    if (googleResponse.refresh_token) {
      console.log('[handleExchange] Storing refresh_token in KV')
      await env.FOODLOG_SECURE_KV.put(`token:${userId}`, googleResponse.refresh_token)
    }

    // Create session token (HMAC-signed JWT)
    console.log('[handleExchange] Creating session token')
    const sessionToken = await createSessionToken(userId, env.SESSION_SECRET)

    console.log('[handleExchange] Success! Returning tokens')
    return json({
      sessionToken,
      accessToken: googleResponse.access_token,
      scope: 'drive.file',
      expiresIn: googleResponse.expires_in || 3600,
    })
  } catch (error) {
    return json({ error: (error as Error).message || 'exchange_failed' }, 500)
  }
}

async function handleVerify(env: Env): Promise<Response> {
  try {
    const clientSecretHash = base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(env.GOOGLE_CLIENT_SECRET))))
    const sessionSecretHash = base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(env.SESSION_SECRET))))

    return json({
      googleClientId: env.GOOGLE_CLIENT_ID,
      clientSecretHash,
      sessionSecretHash,
      configured: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET && !!env.SESSION_SECRET,
    })
  } catch (error) {
    return json({ error: String(error) }, 500)
  }
}

async function handleRefresh(request: Request, env: Env): Promise<Response> {
  try {
    // Extract and validate sessionToken from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'unauthorized' }, 401)
    }

    const sessionToken = authHeader.slice(7)
    const parts = sessionToken.split('.')
    if (parts.length !== 2) {
      return json({ error: 'invalid_token' }, 401)
    }

    const [payload, signature] = parts
    const expectedSig = await sign(payload, env.SESSION_SECRET)
    if (signature !== expectedSig) {
      return json({ error: 'invalid_signature' }, 401)
    }

    // Decode session token to get userId
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)))
    if (!session.userId || session.expires < Date.now()) {
      return json({ error: 'token_expired' }, 401)
    }

    const userId = session.userId

    // Retrieve refresh_token from KV
    const refreshToken = await env.FOODLOG_SECURE_KV.get(`token:${userId}`)
    if (!refreshToken) {
      return json({ error: 'no_refresh_token' }, 401)
    }

    // Call Google to refresh
    const googleResponse = await refreshGoogleToken(refreshToken, env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET)
    if (!googleResponse || !googleResponse.access_token) {
      return json({ error: 'refresh_failed' }, 401)
    }

    return json({
      accessToken: googleResponse.access_token,
      expiresIn: googleResponse.expires_in || 3600,
    })
  } catch (error) {
    return json({ error: (error as Error).message || 'refresh_error' }, 500)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url)

      if (request.method === 'GET' && url.pathname === '/api/auth/verify') {
        return await handleVerify(env)
      }

      if (request.method === 'POST' && url.pathname === '/api/auth/exchange') {
        return await handleExchange(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/auth/refresh') {
        return await handleRefresh(request, env)
      }

      return json({ error: 'not_found' }, 404)
    } catch (error) {
      console.error('Top-level error:', error)
      return json({ error: String(error) }, 500)
    }
  },
}
