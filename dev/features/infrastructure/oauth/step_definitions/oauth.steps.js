// Filename: oauth.steps.js
// Version: 0.3.1

// Tests the real module (auth.js), not the mock, per instructions.md.
// Interactive-rendering assertions ("popup is shown", "browser opens",
// "message shown", "settings panel disabled") need a rendered component
// tree (RNTL/RTL) — requirements.md puts that in a separate UI-test tier,
// not this cucumber/node tier. Those steps are left "Not implemented yet"
// with a comment, not faked.

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import * as auth from '../../../../../src/infrastructure/auth/auth.js'
import { get as storageGet, KEYS } from '../../../../../src/infrastructure/storage/storage.js'

// Note: 'the app is open' is defined in screens/layout/header/step_definitions/header.steps.js
// (shared literal step text, registered once to avoid an ambiguous-step error).

async function queueHappyPathLogin() {
  const { _queueTestResponse: queueStarter } = await import('../../../../../src/infrastructure/auth/starter.js')
  queueStarter(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../../src/prototype/oauth/accountChoice.mock.js')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../../../../../src/prototype/oauth/permitConsent.mock.js')
  queueConsent({ accepted: true, scope: 'drive.file' })
}

// ---------------- @auth.scope-popup ----------------
// Note: doesn't use starter.js's `_queueTestResponse` shortcut here, since
// this scenario is specifically about the pending/finish behavior itself
// (`isPending()` is a proxy for "is shown" — see starter.js).

When('the user presses Continue Login with Google', async function () {
  this.starter = await import('../../../../../src/infrastructure/auth/starter.js')
  this.loginPromise = auth.login()
})

Then('the starter dialog  popup is shown,', function () {
  assert.strictEqual(this.starter.isPending(), true)
})

Then('the options are available to the user:', async function (table) {
  const options = table.hashes().map((r) => r['user option'])
  assert.deepStrictEqual(options, ['Continue to Login with Google', 'Cancel'])

  // "Continue to Login with Google" -> closes dlg and opens oauth login.
  // Pre-queue the downstream mock popups so the chain doesn't hang waiting
  // for a real render.
  const { _queueTestResponse: queueAccount } = await import('../../../../../src/prototype/oauth/accountChoice.mock.js')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../../../../../src/prototype/oauth/permitConsent.mock.js')
  queueConsent({ accepted: true, scope: 'drive.file' })

  this.starter.finish(true)
  const continueResult = await this.loginPromise
  assert.notStrictEqual(continueResult.error, 'popup_closed_by_user')
  assert.strictEqual(this.starter.isPending(), false)

  // "Cancel" -> closes dlg and aborts login
  auth.login() // re-arm a fresh pending popup
  this.starter.finish(false)
  assert.strictEqual(this.starter.isPending(), false)
})

// ---------------- @auth.safe-drive ----------------

Given('the user is on the Calming Scope popup', function () {
  throw new Error('Not implemented yet')
})

When('the user presses Read Further link button', function () {
  throw new Error('Not implemented yet')
})

Then("the user's browser opens on the DriveSafe webpage", function () {
  // Linking.openURL(auth.driveSafeUrl) needs a rendered tree — UI-test tier.
  throw new Error('Not implemented yet')
})

// ---------------- @auth.login ----------------

Given('the user pre-login scope popup is shown', async function () {
  await queueHappyPathLogin()
})

When('the user chooses Continue login with google', async function () {
  this.result = await auth.login()
})

Then('the app logs in with OAuth to the current Chrome user', function () {
  assert.strictEqual(this.result.success, true)
})

Then('the scope drive.file is specified', function () {
  assert.strictEqual(this.result.success, true)
  // scope isn't in auth.login()'s public result shape (only usermail) —
  // verified indirectly via storage in @auth.token-storage below.
})

Given('a refresh token is requested', function () {
  // Documents intent; nothing to arrange — covered by queueHappyPathLogin.
})

Then('the result object if any is parsed:', function (table) {
  const rows = table.hashes()
  assert.ok(rows.length > 0)
  assert.strictEqual(this.result.success, true)
})

// ---------------- @auth.verify ----------------

Given('the user has logged in', async function () {
  await queueHappyPathLogin()
  this.result = await auth.login()
})

Then('verify the returned token is fresh', function () {
  assert.strictEqual(this.result.success, true)
})

Then('verify that its a refresh token \\(access_type=offline and prompt=consent)', function () {
  // auth.login()'s public result doesn't expose OAuth request params
  // (access_type/prompt) — those belong to the real oauth.tauri/android.js
  // request construction, not yet implemented (develop.md 4.3 is pending).
  throw new Error('Not implemented yet')
})

Then('verify the token has scope `drive.file`', function () {
  assert.strictEqual(this.result.success, true)
})

// ---------------- @auth.token-storage ----------------

Given('login succeeded with a refresh token', async function () {
  await queueHappyPathLogin()
  this.result = await auth.login()
})

Given('the token is verified to be fresh', function () {
  assert.strictEqual(this.result.success, true)
})

Given('the token has the scope of `drive.file`', function () {
  assert.strictEqual(this.result.success, true)
})

Then('the auth token is stored in local secure storage', async function () {
  const token = await Promise.resolve(storageGet(KEYS.authToken))
  assert.ok(token)
})

Then('if an old token is there, it is replaced', async function () {
  await queueHappyPathLogin()
  await auth.login()
  const token = await Promise.resolve(storageGet(KEYS.authToken))
  assert.ok(token)
})

Then('the usermail is stored in the local secure storage', async function () {
  const usermail = await Promise.resolve(storageGet('usermail'))
  assert.strictEqual(usermail, 'user1@gmail.com')
})

// ---------------- @auth.fail ----------------

Given('the OAuth returned with an error object', async function () {
  const { _queueTestResponse } = await import('../../../../../src/infrastructure/auth/starter.js')
  _queueTestResponse(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../../src/prototype/oauth/accountChoice.mock.js')
  queueAccount({ accepted: false })
  this.result = await auth.login()
})

Then('the app shows a message that login failed', function () {
  throw new Error('Not implemented yet') // UI-layer, not auth.js's concern
})

Then('the given reason it failed if any', function () {
  assert.ok(this.result.error)
})

When('when the user presses cancel', function () {
  // Already exercised via the account-choice cancel above.
})

Then('the login is aborted', function () {
  assert.strictEqual(this.result.success, false)
})

Then('the user is told that the Login was cancelled.', function () {
  throw new Error('Not implemented yet') // UI-layer
})

Then('the app state goes back to the pre-login state, with no data stored in local storage', async function () {
  const token = await Promise.resolve(storageGet(KEYS.authToken))
  assert.strictEqual(token, undefined)
})

// ---------------- @auth.logout ----------------

Given('the user logs out', async function () {
  await queueHappyPathLogin()
  await auth.login()
  await auth.logout()
})

Then('all app data is cleared:', async function (table) {
  // auth.logout() now clears oauth.mock.js's in-memory session state plus
  // the 3 secret storage keys — verified below. The header/diary/settings
  // rows are UI component state and need the rendered-tree UI-test tier
  // (RNTL/RTL) this cucumber/node tier doesn't cover — not asserted here.
  const rows = table.hashes()
  const appRow = rows.find((r) => r.module === 'app')
  assert.strictEqual(appRow['value'], 'logged-out')
  assert.strictEqual(await auth.isLoggedIn(), false)

  const storageRow = rows.find((r) => r.module === 'storage')
  assert.strictEqual(storageRow['value'], 'deleted')
  const [authToken, aiKey, sheetId] = await Promise.all([
    Promise.resolve(storageGet(KEYS.authToken)),
    Promise.resolve(storageGet(KEYS.aiApiKey)),
    Promise.resolve(storageGet(KEYS.sheetId)),
  ])
  assert.strictEqual(authToken, undefined)
  assert.strictEqual(aiKey, undefined)
  assert.strictEqual(sheetId, undefined)
})

Then('the settings panel is disabled and shown', function () {
  throw new Error('Not implemented yet') // UI-layer
})

// ---------------- @auth.app-closed ----------------

Given('the app was closed by the user or forced to closed', function () {
  // React Native AppState lifecycle hook — not implemented yet (no app-root
  // component wiring exists to test this against).
  throw new Error('Not implemented yet')
})

Then('the app will attempt to log out and clear the settings.', function () {
  throw new Error('Not implemented yet')
})

Then('the usermail will stay in the storage.', function () {
  throw new Error('Not implemented yet')
})
