// Shared production OAuth Session flow for web, desktop, Android, and iOS.

import * as AuthSession from 'expo-auth-session'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { appConstants, authRedirectUrl, desktopAuthRedirectUrl, storageApiUrl } from '../config/config.ts'
import { getSessionToken } from '../storage/storage.ts'

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
}

function redirectUri(platform) {
  if (platform === 'web') return authRedirectUrl
  if (platform === 'desktop') return desktopAuthRedirectUrl
  return AuthSession.makeRedirectUri({ scheme: 'com.foodlog', path: 'auth' })
}

export async function authorize(clientId, platform) {
  const redirect = redirectUri(platform)
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri: redirect,
    responseType: AuthSession.ResponseType.Code,
    scopes: [appConstants.urls.driveFileScope, 'openid', 'email'],
    usePKCE: true,
    extraParams: { access_type: 'offline', prompt: 'consent' },
    state: btoa(JSON.stringify({ platform, nonce: crypto.randomUUID() })),
  })
  let code
  if (platform === 'desktop') {
    code = await authorizeDesktop(request)
  } else {
    const result = await request.promptAsync(discovery)
    if (result.type !== 'success' || !result.params?.code) {
      throw new Error(result.params?.error ?? 'popup_closed_by_user')
    }
    code = result.params.code
  }
  return exchange('/auth/exchange', {
    code,
    clientId,
    redirectUri: redirect,
    codeVerifier: request.codeVerifier,
    platform,
  })
}

export async function refresh(refreshToken, platform) {
  return exchange('/auth/refresh', { platform })
}

async function exchange(path, body) {
  if (!storageApiUrl) throw new Error('Cloudflare storage URL is not configured')
  const response = await fetch(`${storageApiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(getSessionToken() ? { Authorization: `Bearer ${getSessionToken()}` } : {}) },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`OAuth exchange failed: ${response.status}`)
  return response.json()
}

async function authorizeDesktop(request) {
  const state = request.state
  return new Promise(async (resolve, reject) => {
    const unlisten = await listen('oauth-callback', (event) => {
      const url = new URL(event.payload)
      if (url.searchParams.get('state') !== state) return
      unlisten()
      const error = url.searchParams.get('error')
      if (error) reject(new Error(error))
      else resolve(url.searchParams.get('code'))
    })
    try {
      const authUrl = await request.makeAuthUrlAsync(discovery)
      await invoke('oauth_start', { authUrl })
    } catch (error) {
      unlisten()
      reject(error)
    }
  })
}