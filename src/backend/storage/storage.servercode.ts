export interface Env {
  FOODLOG_SECURE_KV: KVNamespace
  SESSION_SECRET: string
}

const securePrefixes = {
  token: 'token:',
  aikey: 'aikey:',
  sheetid: 'sheetid:',
  usermail: 'usermail:',
} as const

type SecureName = keyof typeof securePrefixes

const encoder = new TextEncoder()

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}

function routeName(pathname: string): string | undefined {
  return pathname.split('/').filter(Boolean)[0]
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

async function userId(request: Request, secret: string): Promise<string | undefined> {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '')
  const [payload, signature] = token?.split('.') ?? []
  if (!payload || !signature || signature !== await sign(payload, secret)) return undefined
  try {
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)))
    return typeof session.userId === 'string' && session.expires > Date.now() ? session.userId : undefined
  } catch {
    return undefined
  }
}

async function accessNamespace(request: Request, namespace: KVNamespace, prefix: string, owner: string): Promise<Response> {
  const key = `${prefix}${owner}`
  if (request.method === 'GET') return json({ value: await namespace.get(key) })
  if (request.method === 'POST') {
    const { value } = await request.json<{ value: string | null }>()
    if (value === null) await namespace.delete(key)
    else await namespace.put(key, value)
    return json({ value })
  }
  return json({ error: 'method_not_allowed' }, 405)
}

function rejectUnauthorized(): Response {
  return json({ error: 'unauthorized' }, 401)
}

async function accessStorage(request: Request, env: Env, name: SecureName, owner: string): Promise<Response> {
  return accessNamespace(request, env.FOODLOG_SECURE_KV, securePrefixes[name], owner)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const name = routeName(new URL(request.url).pathname)
    const owner = await userId(request, env.SESSION_SECRET)
    if (!owner) return rejectUnauthorized()
    if (name in securePrefixes) return accessStorage(request, env, name as SecureName, owner)
    return json({ error: 'not_found' }, 404)
  },
}
