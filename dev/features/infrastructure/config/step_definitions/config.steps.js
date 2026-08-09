// Filename config.steps.js  Version 0.2.0

import { When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { get } from '../../../../../src/infrastructure/config/config.js'

When('I call get\\({string}, {string}\\)', function (section, key) {
  this.result = get(section, key)
})

Then('the result is {string}', function (expected) {
  assert.strictEqual(this.result, expected)
})
