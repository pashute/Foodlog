export interface Env {
  FOODLOG_CONFIG_KV: KVNamespace
  SESSION_SECRET: string
}

const prefixes = {
  theme: 'theme:',
  timezoneAbbrev: 'timezoneAbbrev:',
  timezoneOffset: 'timezoneOffset:',
  timezoneLocation: 'timezoneLocation:',
} as const

const encoder = new TextEncoder()

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}

function base64Url(bytes: Uint8Array): string {
  let text = ''
  for (const byte of bytes) text += String.fromCharCode(byte)
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))))
}

async function userId(request: Request, secret: string): Promise<string | undefined> {
  const [payload, signature] = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '').split('.') ?? []
  if (!payload || !signature || signature !== await sign(payload, secret)) return undefined
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((payload.length + 3) % 4)
    const session = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))))
    return typeof session.userId === 'string' && session.expires > Date.now() ? session.userId : undefined
  } catch {
    return undefined
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const user = await userId(request, env.SESSION_SECRET)
    if (!user) return json({ error: 'unauthorized' }, 401)
    const name = new URL(request.url).pathname.split('/').filter(Boolean)[0] as keyof typeof prefixes
    const prefix = prefixes[name]
    if (!prefix) return json({ error: 'not_found' }, 404)
    const key = `${prefix}${user}`
    if (request.method === 'GET') return json({ value: await env.FOODLOG_CONFIG_KV.get(key) })
    if (request.method === 'POST') {
      const { value } = await request.json<{ value: string | null }>()
      if (value === null) await env.FOODLOG_CONFIG_KV.delete(key)
      else await env.FOODLOG_CONFIG_KV.put(key, value)
      return json({ value })
    }
    return json({ error: 'method_not_allowed' }, 405)
  },
}