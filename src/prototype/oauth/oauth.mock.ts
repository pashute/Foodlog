// Filename: oauth.mock.ts  Version 0.2.1

// Mock OAuth module (prototype stage). Orchestrates the two popup
// components (accountChoice.mock.dlg.tsx, permitConsent.mock.dlg.tsx)
// instead of returning canned objects directly, per requirements.md's
// "OAuth - implementation notes".
//
// The two popups are dynamically imported inside login() (never at top
// level) because they import 'react-native' and use JSX — plain
// `node --test` can't parse that, same reason auth.ts lazy-loads its
// platform files. Only login()/trySilentLogin() need a rendered tree to
// actually resolve (real popups, real button presses); the state getters
// below stay synchronous and node-test-safe.

let state = 'LoggedOut'
let currentUser = null
let token = null

export function isLoggedIn() {
  return state === 'LoggedIn'
}

export function isTokenFresh() {
  return isLoggedIn() && token?.fresh === true
}

export function isTokenScopeDriveFile() {
  return isLoggedIn() && token?.scope === 'drive.file'
}

export function logout() {
  currentUser = null
  token = null
  state = 'LoggedOut'
}

// Test-arrange helper only: sets logged-in state directly, bypassing the
// popups. login() itself can't be driven headlessly anymore now that it
// awaits real Modal button presses (see login() below) — feature/unit tests
// that just need "already logged in" as a precondition should use this
// instead of calling login().
export function _forceLoggedIn(email = 'user1@gmail.com') {
  currentUser = { username: email.split('@')[0], email }
  token = { fresh: true, scope: 'drive.file' }
  state = 'LoggedIn'
}

// Mock session creation + full login sequence. Both popups report their
// result here: account cancel -> popup_closed_by_user; consent deny ->
// access_denied; consent allow -> refresh token + drive.file scope.
export async function login() {
  const { popup: accountChoicePopup } = await import('./accountChoice.mock.ts')
  const account = await accountChoicePopup()
  if (!account.accepted) {
    return { error: 'popup_closed_by_user' }
  }
  currentUser = { username: account.username, email: account.email }
  state = 'InProgress'

  const { popup: permitConsentPopup } = await import('./permitConsent.mock.ts')
  const consent = await permitConsentPopup()
  if (!consent.accepted) {
    currentUser = null
    state = 'LoggedOut'
    return { error: 'access_denied' }
  }

  token = { fresh: true, scope: consent.scope }
  state = 'LoggedIn'
  return {
    refreshToken: 'mock-refresh-token',
    scope: token.scope,
    usermail: currentUser.email,
  }
}

// The mock has no cached-session concept, so silent login just reflects
// current in-memory state (no popups involved, no dynamic import needed).
export async function trySilentLogin() {
  return isLoggedIn() ? { authState: state, ...currentUser } : null
}
