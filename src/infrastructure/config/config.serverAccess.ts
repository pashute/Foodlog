// Filename: config.serverAccess.ts
// Client-side wrapper for config server endpoints (theme, timezone)

import { storageApiUrl } from '../config/config.ts'

export async function getConfig(key: 'theme' | 'timezonehrs' | 'timezonename') {
  if (!storageApiUrl) throw new Error('Cloudflare config URL is not configured')
  const response = await fetch(`${storageApiUrl}/${key}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`Config read failed: ${response.status}`)
  const body = await response.json()
  return body.value
}

export async function setConfig(key: 'theme' | 'timezonehrs' | 'timezonename', value: string) {
  if (!storageApiUrl) throw new Error('Cloudflare config URL is not configured')
  const response = await fetch(`${storageApiUrl}/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  if (!response.ok) throw new Error(`Config write failed: ${response.status}`)
  if (response.status === 204) return undefined
  const body = await response.json()
  return body.value
}
