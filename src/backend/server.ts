// Filename: server.ts
// Version: 0.2.6

// Cloudflare Worker main entry point — routes requests to auth/storage/config modules
import authHandler from './auth.servercode.ts'
import storageHandler from './storage.servercode.ts'
import configHandler from './config.servercode.ts'

export interface Env {
  FOODLOG_SECURE_KV: KVNamespace
  FOODLOG_CONFIG_KV: KVNamespace
  FOODLOG_CLIENT_ID: string
  FOODLOG_CLIENT_SECRET: string
  SESSION_SECRET: string
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function withCors(response: Response): Response {
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }))
    }

    const path = new URL(request.url).pathname

    // Route to appropriate handler based on path
    let response: Response
    if (path.startsWith('/api/auth/')) response = await authHandler.fetch(request, env)
    else if (path.startsWith('/token') || path.startsWith('/aikey') || path.startsWith('/sheetid'))
      response = await storageHandler.fetch(request, env)
    else if (path.startsWith('/theme') || path.startsWith('/timezoneAbbrev') || path.startsWith('/timezoneOffset') || path.startsWith('/timezoneLocation'))
      response = await configHandler.fetch(request, env)
    else response = new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    return withCors(response)
  },
}