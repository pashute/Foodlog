/**
 * Auth Module  Version 0.2.1
 *
 * Thin dispatcher (requirements.md "OAuth login" / "OAuth - implementation
 * notes"). login() shows the starter popup, awaits the user's continue/
 * cancel choice, then dispatches to the platform-specific real login
 * (oauth.tauri.ts / oauth.android.ts / oauth.ios.ts) or the prototype mock
 * (src/prototype/oauth/oauth.mock.ts), validates the result, and persists
 * the token + usermail to secure storage.
 *
 * All React-Native-touching or JSX modules are dynamically imported (never
 * at top level) so plain `node --test` never has to parse them.
 */

import { isPrototype } from '../environment.ts'
import { appConstants } from '../config/config.ts'
import { get as storageGet, update as storageUpdate, remove as storageRemove, KEYS } from '../storage/storage.ts'

// Now sourced from config (urls.drive-safe) instead of a locally duplicated
// literal — was previously copy-pasted here and in starter.ts separately.
// Website location still to be decided (see requirements.md).
export const driveSafeUrl = appConstants.urls.driveSafe

const _platformModule = async () => {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return import('./oauth.tauri.ts')
  }
  const { Platform } = await import('react-native')
  if (Platform.OS === 'android') {
    return import('./oauth.android.ts')
  }
  if (Platform.OS === 'ios') {
    return import('./oauth.ios.ts')
  }
  if (Platform.OS === 'web') {
    return import('./oauth.web.ts')
  }
  throw new Error('Not implemented yet')
}

async function _oauthModule() {
  if (isPrototype()) {
    return import('../../prototype/oauth/oauth.mock.ts')
  }
  return _platformModule()
}

// Native platforms (Tauri/Android/iOS) return a refreshToken; web can't —
// Google's browser-side Identity Services library only ever hands back a
// short-lived accessToken (refresh tokens are meant to stay server-side).
// An accessToken is itself already bearer-usable for Drive/Sheets calls, so
// accepting either shape here and storing whichever is present (below) is
// correct for both cases, not a workaround.
export function _isFreshDriveFileToken(result) {
  return Boolean(result?.refreshToken || result?.accessToken) && result?.scope === 'drive.file'
}

// Shows the pre-login starter popup; awaits true (continue) / false
// (cancel). On continue, dispatches to real or mock OAuth login, validates
// the result is a fresh drive.file refresh token, and stores the token +
// usermail in secure storage.
export async function login() {
  const { popup } = await import('./starter.ts')
  const continueLogin = await popup()
  if (!continueLogin) {
    return { success: false, error: 'popup_closed_by_user' }
  }

  // storage.get() returns a plain value in prototype mode, a Promise in
  // real mode (see storage.ts) — Promise.resolve() handles both uniformly.
  const usermail = await Promise.resolve(storageGet(KEYS.usermail))

  const oauth = await _oauthModule()
  const result = await oauth.login(usermail ? { usermail } : undefined)

  if (result?.error) {
    return { success: false, error: result.error }
  }
  if (!_isFreshDriveFileToken(result)) {
    return { success: false, error: 'invalid_token' }
  }

  const token = result.refreshToken ?? result.accessToken
  await storageUpdate(KEYS.authToken, token)
  if (result.usermail) await storageUpdate(KEYS.usermail, result.usermail)
  return { success: true, usermail: result.usermail ?? usermail }
}

export async function trySilentLogin() {
  const oauth = await _oauthModule()
  return oauth.trySilentLogin()
}

export async function isLoggedIn() {
  const oauth = await _oauthModule()
  return oauth.isLoggedIn()
}

// Clears the 3 secret keys (auth, ai, sheets) on logout — usermail is kept
// (see @auth.app-closed in oauth.feature: "the usermail will stay in the
// storage").
export async function logout() {
  const oauth = await _oauthModule()
  oauth.logout()
  await Promise.all([
    storageRemove(KEYS.authToken),
    storageRemove(KEYS.aiApiKey),
    storageRemove(KEYS.sheetId),
  ])
}
