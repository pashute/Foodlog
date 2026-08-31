// Filename: auth.serverAccess.ts
// Client-side wrapper for auth server endpoints (/api/auth/exchange, /api/auth/refresh)

import { storageApiUrl } from '../config/config.ts'

export async function exchangeAuthCode(payload: {
  code: string
  clientId: string
  redirectUri: string
  codeVerifier: string
  platform: string
}) {
  if (!storageApiUrl) throw new Error('Cloudflare auth URL is not configured')
  const response = await fetch(`${storageApiUrl}/api/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Auth exchange failed: ${response.status}`)
  return response.json()
}

export async function refreshAccessToken(refreshToken: string, platform: string) {
  if (!storageApiUrl) throw new Error('Cloudflare auth URL is not configured')
  const response = await fetch(`${storageApiUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, platform }),
  })
  if (!response.ok) throw new Error(`Auth refresh failed: ${response.status}`)
  return response.json()
}
