// Shared production OAuth Session flow for web, desktop, Android, and iOS.

import * as AuthSession from 'expo-auth-session'
import { appConstants, authRedirectUrl, desktopAuthRedirectUrl } from '../config/config.ts'
import * as authServer from './auth.serverAccess'

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
    scopes: [appConstants.urls.driveFileScope],
    usePKCE: true,
    extraParams: { access_type: 'offline', prompt: 'consent' },
    state: btoa(JSON.stringify({ platform, nonce: crypto.randomUUID() })),
  })
  let code
  if (platform === 'desktop') {
    code = await authorizeDesktop(request)
  } else if (platform === 'web') {
    code = await authorizeWeb(request, redirect)
  } else {
    const result = await request.promptAsync(discovery)
    if (result.type !== 'success' || !result.params?.code) {
      throw new Error(result.params?.error ?? 'popup_closed_by_user')
    }
    code = result.params.code
  }
  return authServer.exchangeAuthCode({
    code,
    clientId,
    redirectUri: redirect,
    codeVerifier: request.codeVerifier,
    platform,
  })
}

export async function refresh(sessionToken: string, platform: string) {
  return authServer.refreshAccessToken(sessionToken, platform)
}

async function authorizeWeb(request, redirectUri) {
  return new Promise(async (resolve, reject) => {
    try {
      const authUrl = await request.makeAuthUrlAsync(discovery)
      const popup = window.open(authUrl, 'foodlog-oauth', 'width=600,height=700')

      if (!popup) {
        reject(new Error('popup_blocked'))
        return
      }

      const handleMessage = (event) => {
        if (event.data?.type === 'oauth-callback') {
          window.removeEventListener('message', handleMessage)
          clearTimeout(timeoutId)

          if (event.data.error) {
            reject(new Error(event.data.error))
          } else if (event.data.code) {
            resolve(event.data.code)
          } else {
            reject(new Error('no_code_received'))
          }

          try {
            popup?.close()
          } catch (e) {
            // Ignore errors closing popup
          }
        }
      }

      window.addEventListener('message', handleMessage)

      // Timeout after 5 minutes
      const timeoutId = setTimeout(() => {
        window.removeEventListener('message', handleMessage)
        reject(new Error('authorization_timeout'))
      }, 300000)
    } catch (error) {
      reject(error)
    }
  })
}

async function authorizeDesktop(request) {
  const state = request.state
  return new Promise(async (resolve, reject) => {
    try {
      // Dynamically import Tauri APIs only on desktop
      const { invoke } = await import('@tauri-apps/api/core')
      const { listen } = await import('@tauri-apps/api/event')

      const unlisten = await listen('oauth-callback', (event) => {
        const url = new URL(event.payload)
        if (url.searchParams.get('state') !== state) return
        unlisten()
        const error = url.searchParams.get('error')
        if (error) reject(new Error(error))
        else resolve(url.searchParams.get('code'))
      })

      const authUrl = await request.makeAuthUrlAsync(discovery)
      await invoke('oauth_start', { authUrl })
    } catch (error) {
      reject(error)
    }
  })
}