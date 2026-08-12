// Filename: auth.test.js  Version 0.2.0

import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as auth from '../../../../src/infrastructure/auth/auth.js'
import { get as storageGet, KEYS } from '../../../../src/infrastructure/storage/storage.js'

async function queueHappyPathLogin() {
  const { _queueTestResponse: queueStarter } = await import('../../../../src/infrastructure/auth/starter.js')
  queueStarter(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.js')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../../../../src/prototype/oauth/permitConsent.mock.js')
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
})

test('auth module - cancel at starter popup aborts login', async () => {
  const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.js')
  _queueTestResponse(false)

  const result = await auth.login()
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'popup_closed_by_user')
  assert.strictEqual(await auth.isLoggedIn(), false)
})

test('auth module - cancel at account choice aborts login', async () => {
  const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.js')
  _queueTestResponse(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.js')
  queueAccount({ accepted: false })

  const result = await auth.login()
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'popup_closed_by_user')
})

test('auth module - deny at permission consent aborts login', async () => {
  const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.js')
  _queueTestResponse(true)
  const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.js')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../../../../src/prototype/oauth/permitConsent.mock.js')
  queueConsent({ accepted: false })

  const result = await auth.login()
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'access_denied')
})

test('auth module - exposes driveSafeUrl', () => {
  assert.strictEqual(typeof auth.driveSafeUrl, 'string')
  assert.ok(auth.driveSafeUrl.length > 0)
})
