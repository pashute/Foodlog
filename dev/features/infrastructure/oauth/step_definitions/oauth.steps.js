// Filename oauth.steps.js  Version 0.2.0

import { Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { isLoggedIn } from '../../../../../src/infrastructure/oauth/oauth.js'

Then('isLoggedIn is false', function () {
  assert.strictEqual(isLoggedIn(), false)
})
