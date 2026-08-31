// Filename: login.test.ts
// Verification that global login fixture (jest.setup.js) has completed successfully
// This test runs after jest.setup.js's beforeAll and confirms user is authenticated

import * as auth from '../../src/infrastructure/auth/auth.ts'
import { devStage, platform } from '../../src/infrastructure/environment.ts'

describe('Login Fixture Verification', () => {
  test('global setup completed: user is authenticated', async () => {
    const loggedIn = await auth.isLoggedIn()
    expect(loggedIn).toBe(true)
    console.log(`[verification] User authenticated for stage: ${devStage}, platform: ${platform}`)
  })
})
