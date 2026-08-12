/**
 * Auth Module  Version 0.4.0
 *
 * Thin dispatcher (requirements.md "OAuth login" / "OAuth - implementation
 * notes"). login() shows the starter popup, awaits the user's continue/
 * cancel choice, then dispatches to the platform-specific real login
 * (oauth.tauri.js / oauth.android.js / oauth.ios.js) or the prototype mock
 * (src/prototype/oauth/oauth.mock.js), validates the result, and persists
 * the token + usermail to secure storage.
 *
 * All React-Native-touching or JSX modules are dynamically imported (never
 * at top level) so plain `node --test` never has to parse them.
 */

import { isPrototype } from '../config/config.js'
import { get as storageGet, update as storageUpdate, KEYS } from '../storage/storage.js'

// Duplicated from starter.dlg.jsx's local copy (not imported from there, to
// avoid an auth.js <-> starter.dlg.jsx circular import): the local bundled
// drive-safe page. Website location still to be decided (see requirements.md).
export const driveSafeUrl = 'https://NotImplementedYet.github.com/drive-safe.html'

const _platformModule = async () => {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    return import('./oauth.tauri.js')
  }
  const { Platform } = await import('react-native')
  if (Platform.OS === 'android') {
    return import('./oauth.android.js')
  }
  if (Platform.OS === 'ios') {
    return import('./oauth.ios.js')
  }
  throw new Error('Not implemented yet')
}

async function _oauthModule() {
  if (isPrototype()) {
    return import('../../prototype/oauth/oauth.mock.js')
  }
  return _platformModule()
}

function _isFreshDriveFileToken(result) {
  return Boolean(result?.refreshToken) && result?.scope === 'drive.file'
}

// Shows the pre-login starter popup; awaits true (continue) / false
// (cancel). On continue, dispatches to real or mock OAuth login, validates
// the result is a fresh drive.file refresh token, and stores the token +
// usermail in secure storage.
export async function login() {
  const { popup } = await import('./starter.js')
  const continueLogin = await popup()
  if (!continueLogin) {
    return { success: false, error: 'popup_closed_by_user' }
  }

  // storage.get() returns a plain value in prototype mode, a Promise in
  // real mode (see storage.js) — Promise.resolve() handles both uniformly.
  const usermail = await Promise.resolve(storageGet('usermail'))

  const oauth = await _oauthModule()
  const result = await oauth.login(usermail ? { usermail } : undefined)

  if (result?.error) {
    return { success: false, error: result.error }
  }
  if (!_isFreshDriveFileToken(result)) {
    return { success: false, error: 'invalid_token' }
  }

  await storageUpdate(KEYS.authToken, result.refreshToken)
  await storageUpdate('usermail', result.usermail)
  return { success: true, usermail: result.usermail }
}

export async function trySilentLogin() {
  const oauth = await _oauthModule()
  return oauth.trySilentLogin()
}

export async function isLoggedIn() {
  const oauth = await _oauthModule()
  return oauth.isLoggedIn()
}

export async function logout() {
  const oauth = await _oauthModule()
  oauth.logout()
}
