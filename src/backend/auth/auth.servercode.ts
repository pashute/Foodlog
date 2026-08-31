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

async function exchangeGoogleCode(code: string, clientId: string, redirectUri: string, clientSecret: string): Promise<any> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google token exchange failed: ${response.status} ${error}`)
  }

  return response.json()
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
    const { code, clientId, redirectUri, codeVerifier, platform } = (await request.json()) as any

    if (!code || !clientId || !redirectUri || !codeVerifier || !platform) {
      return json({ error: 'missing_params' }, 400)
    }

    // Exchange code for tokens via Google
    const googleResponse = await exchangeGoogleCode(code, clientId, redirectUri, env.GOOGLE_CLIENT_SECRET)
    if (!googleResponse.access_token || !googleResponse.id_token) {
      return json({ error: 'google_token_invalid' }, 400)
    }

    // Decode id_token to extract userId
    const idTokenPayload = await decodeJwt(googleResponse.id_token)
    if (!idTokenPayload?.sub) {
      return json({ error: 'invalid_id_token' }, 400)
    }

    const userId = idTokenPayload.sub

    // Store refresh_token in KV (for native platforms that have offline access)
    if (googleResponse.refresh_token) {
      await env.FOODLOG_SECURE_KV.put(`token:${userId}`, googleResponse.refresh_token)
    }

    // Create session token (HMAC-signed JWT)
    const sessionToken = await createSessionToken(userId, env.SESSION_SECRET)

    return json({
      sessionToken,
      accessToken: googleResponse.access_token,
      expiresIn: googleResponse.expires_in || 3600,
    })
  } catch (error) {
    return json({ error: (error as Error).message || 'exchange_failed' }, 500)
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
    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname === '/api/auth/exchange') {
      return handleExchange(request, env)
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/refresh') {
      return handleRefresh(request, env)
    }

    return json({ error: 'not_found' }, 404)
  },
}
