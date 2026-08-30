// Filename: auth.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as auth from '../../../../src/infrastructure/auth/auth.ts'
import { get as storageGet, KEYS } from '../../../../src/infrastructure/storage/storage.ts'

async function queueHappyPathLogin() {
  const { _queueTestResponse: queueStarter } = await import('../../../../src/infrastructure/auth/starter.ts')
  queueStarter(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../../../../src/prototype/oauth/permitConsent.mock.ts')
  queueConsent({ accepted: true, scope: 'drive.file' })
}

test('auth module - full login flow, and logs out', async () => {
  assert.strictEqual(await auth.isLoggedIn(), false)

  await queueHappyPathLogin()
  const result = await auth.login()
  assert.strictEqual(result.success, true)
  assert.strictEqual(result.usermail, 'user1@gmail.com')
  assert.strictEqual(await auth.isLoggedIn(), true)

  assert.strictEqual(await Promise.resolve(storageGet(KEYS.authToken)), 'mock-refresh-token')
  assert.strictEqual(await Promise.resolve(storageGet('usermail')), 'user1@gmail.com')

  await auth.logout()
  assert.strictEqual(await auth.isLoggedIn(), false)
  assert.strictEqual(await Promise.resolve(storageGet(KEYS.usermail)), 'user1@gmail.com')
})

test('auth module - cancel at starter popup aborts login', async () => {
  const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.ts')
  _queueTestResponse(false)

  const result = await auth.login()
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'popup_closed_by_user')
  assert.strictEqual(await auth.isLoggedIn(), false)
})

test('auth module - cancel at account choice aborts login', async () => {
  const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.ts')
  _queueTestResponse(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
  queueAccount({ accepted: false })

  const result = await auth.login()
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'popup_closed_by_user')
})

test('auth module - deny at permission consent aborts login', async () => {
  const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.ts')
  _queueTestResponse(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../../../../src/prototype/oauth/permitConsent.mock.ts')
  queueConsent({ accepted: false })

  const result = await auth.login()
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'access_denied')
})

test('auth module - exposes driveSafeUrl', () => {
  assert.strictEqual(typeof auth.driveSafeUrl, 'string')
  assert.ok(auth.driveSafeUrl.length > 0)
})

// Web's real OAuth (oauth.web.ts) only ever returns an accessToken, never
// a refreshToken (Google's Identity Services library doesn't hand refresh
// tokens to browser JS) — _isFreshDriveFileToken must accept either shape.
// The GIS calls themselves need a real browser (window.google, a rendered
// consent popup) so oauth.web.ts's login()/trySilentLogin() aren't
// exercised here — same boundary as the other real (non-prototype) OAuth
// modules, which this tier only reaches through the prototype mock.
test('auth module - _isFreshDriveFileToken accepts an accessToken (web) or a refreshToken (native)', () => {
  assert.strictEqual(auth._isFreshDriveFileToken({ accessToken: 'abc', scope: 'drive.file' }), true)
  assert.strictEqual(auth._isFreshDriveFileToken({ refreshToken: 'abc', scope: 'drive.file' }), true)
  assert.strictEqual(auth._isFreshDriveFileToken({ scope: 'drive.file' }), false)
  assert.strictEqual(auth._isFreshDriveFileToken({ accessToken: 'abc', scope: 'drive.readonly' }), false)
  assert.strictEqual(auth._isFreshDriveFileToken(null), false)
})
