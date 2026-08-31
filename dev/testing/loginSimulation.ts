// Filename: loginSimulation.ts
// Automated login fixture for prototype + web mode
// Queues mock responses and executes full login flow

import * as auth from '../src/infrastructure/auth/auth.ts'
import { get as storageGet, KEYS } from '../src/infrastructure/storage/storage.ts'

export async function login() {
  const { _queueTestResponse: queueStarter } = await import('../src/infrastructure/auth/starter.ts')
  queueStarter(true)
  const { _queueTestResponse: queueAccount } = await import('../src/prototype/oauth/accountChoice.mock.ts')
  queueAccount({ accepted: true, username: 'user1', email: 'user1@gmail.com' })
  const { _queueTestResponse: queueConsent } = await import('../src/prototype/oauth/permitConsent.mock.ts')
  queueConsent({ accepted: true, scope: 'drive.file' })

  const result = await auth.login()
  if (!result.success) {
    throw new Error(`Auto login failed: ${result.error}`)
  }

  const token = await Promise.resolve(storageGet(KEYS.authToken))
  if (!token) {
    throw new Error('Auth token not in storage after login')
  }

  const usermail = await Promise.resolve(storageGet(KEYS.usermail))
  if (!usermail) {
    throw new Error('Usermail not in storage after login')
  }
}
