// Filename: auth.test.ts
// Version 0.2.1
// Auth module unit tests (converted to Jest)
// Runs after global login fixture (jest.setup.js)

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

describe('auth module', () => {
  test('full login flow, and logs out', async () => {
    expect(await auth.isLoggedIn()).toBe(false)

    await queueHappyPathLogin()
    const result = await auth.login()
    expect(result.success).toBe(true)
    expect(result.usermail).toBe('user1@gmail.com')
    expect(await auth.isLoggedIn()).toBe(true)

    expect(await Promise.resolve(storageGet(KEYS.authToken))).toBe('mock-refresh-token')
    expect(await Promise.resolve(storageGet('usermail'))).toBe('user1@gmail.com')

    await auth.logout()
    expect(await auth.isLoggedIn()).toBe(false)
  })

  test('cancel at starter popup aborts login', async () => {
    const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.ts')
    _queueTestResponse(false)

    const result = await auth.login()
    expect(result.success).toBe(false)
    expect(result.error).toBe('popup_closed_by_user')
    expect(await auth.isLoggedIn()).toBe(false)
  })

  test('cancel at account choice aborts login', async () => {
    const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.ts')
    _queueTestResponse(true)
    const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
    queueAccount({ accepted: false })

    const result = await auth.login()
    expect(result.success).toBe(false)
    expect(result.error).toBe('popup_closed_by_user')
  })

  test('deny at permission consent aborts login', async () => {
    const { _queueTestResponse } = await import('../../../../src/infrastructure/auth/starter.ts')
    _queueTestResponse(true)
    const { _queueTestResponse: queueAccount } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
    queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
    const { _queueTestResponse: queueConsent } = await import('../../../../src/prototype/oauth/permitConsent.mock.ts')
    queueConsent({ accepted: false })

    const result = await auth.login()
    expect(result.success).toBe(false)
    expect(result.error).toBe('access_denied')
  })

  test('exposes driveSafeUrl', () => {
    expect(typeof auth.driveSafeUrl).toBe('string')
    expect(auth.driveSafeUrl.length).toBeGreaterThan(0)
  })

  test('_isFreshDriveFileToken accepts an accessToken (web) or a refreshToken (native)', () => {
    expect(auth._isFreshDriveFileToken({ accessToken: 'abc', scope: 'drive.file' })).toBe(true)
    expect(auth._isFreshDriveFileToken({ refreshToken: 'abc', scope: 'drive.file' })).toBe(true)
    expect(auth._isFreshDriveFileToken({ scope: 'drive.file' })).toBe(false)
    expect(auth._isFreshDriveFileToken({ accessToken: 'abc', scope: 'drive.readonly' })).toBe(false)
    expect(auth._isFreshDriveFileToken(null)).toBe(false)
  })
})
