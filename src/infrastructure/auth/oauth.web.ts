// Filename: oauth.web.ts  Version 0.2.1

// Real login for Expo web — Google Identity Services (GIS) token client.
// Browser-only, client-side flow: no refresh token. Google's GIS library
// deliberately never hands a refresh token to browser-visible JS (refresh
// tokens are long-lived secrets meant to stay server-side) — it gives a
// short-lived access token instead, which is itself already bearer-usable
// for Drive/Sheets calls (see auth.ts's _isFreshDriveFileToken, which
// accepts either shape). Re-auth is silent as long as the browser still
// has an active Google session — see trySilentLogin(). Confirmed with the
// developer (Aug 19) over the alternative (authcode+PKCE for a real
// refresh token, which Google's Web-application client type typically
// wants a client secret for — unsafe to embed in a pure client-side app).
// See dev/docs/develop.md 4.3 for the Cloud Console setup.

import { isPrototype } from '../environment.ts'
import { appConstants } from '../config/config.ts'
import * as authMock from '../../prototype/oauth/oauth.mock.ts'
import { client_id_web } from './authClientIds.ts'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

let _gisReady = null
let _lastAccessToken = null

function _loadGis() {
  if (_gisReady) return _gisReady
  _gisReady = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return _gisReady
}

// prompt: 'consent' forces the account/consent chooser (first login);
// prompt: '' asks GIS to reuse an existing Google session silently, with
// no popup at all if one isn't available (used by trySilentLogin below).
function _requestAccessToken(prompt) {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: client_id_web,
      scope: appConstants.urls.driveFileScope,
      prompt,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }
        resolve(response)
      },
    })
    client.requestAccessToken()
  })
}

export const login = async () => {
  if (isPrototype()) return authMock.login()
  await _loadGis()
  try {
    const response = await _requestAccessToken('consent')
    _lastAccessToken = response.access_token
    return {
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      scope: 'drive.file',
      // GIS's drive.file-only scope doesn't include profile/email — the
      // driveSafe pitch is minimal-scope-by-design, so this stays empty
      // rather than requesting a broader scope just to get an address.
      usermail: null,
    }
  } catch (e) {
    return { error: e.message === 'access_denied' ? 'access_denied' : 'popup_closed_by_user' }
  }
}

// Skips the consent screen if the browser still has an active Google
// session for this app — App.tsx's crash-recovery effect calls this on
// mount the same way it does for the other platforms.
export const trySilentLogin = async () => {
  if (isPrototype()) return authMock.trySilentLogin()
  await _loadGis()
  try {
    const response = await _requestAccessToken('')
    _lastAccessToken = response.access_token
    return { accessToken: response.access_token, expiresIn: response.expires_in, scope: 'drive.file' }
  } catch {
    return null
  }
}

// No persistent SDK session object to query for a token client (unlike
// GoogleSignin's native session) — auth.ts's own isLoggedIn() dispatch
// exists for interface parity with the other platform modules, but the
// real source of truth is whether a token is in secure storage (see
// storage.ts / App.tsx's crash-recovery check), not this function.
export const isLoggedIn = () => {
  if (isPrototype()) return authMock.isLoggedIn()
  return Boolean(_lastAccessToken)
}

export const logout = () => {
  if (isPrototype()) return authMock.logout()
  if (_lastAccessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(_lastAccessToken)
  }
  _lastAccessToken = null
}
