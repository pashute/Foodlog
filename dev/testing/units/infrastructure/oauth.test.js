// Filename oauth.test.js  Version 0.1.0

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isLoggedIn } from '../../../../src/infrastructure/oauth/oauth.js'

test('oauth module', () => {
  assert.strictEqual(typeof isLoggedIn, 'function')
  assert.strictEqual(isLoggedIn(), false)
})
