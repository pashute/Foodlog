// Filename prototype.steps.js  Version 0.4.0

import { Given, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { get } from '../../../../src/infrastructure/config/config.js'

Given('I call the config module with get\\(section, key\\)', function () {
  this.result = get('app', 'appname')
})

Then('mockup code responds replacing a real configuration file', function () {
  assert.strictEqual(this.result, 'Foodlog')
})

Given('that I call the storage module with `keys`, `initialize`, `update`, or `get`', function () {
  throw new Error('Not implemented yet')
})

Then('mockup code responds replacing a real secured local storage element', function () {
  throw new Error('Not implemented yet')
})

Then('the oAuth module supports Google login with drive.file scope', function () {
  throw new Error('Not implemented yet')
})

Then('the AI module accepts natural language text and returns a carbs estimate', function () {
  throw new Error('Not implemented yet')
})

Then('the sheets module supports existsOrCreate\\(\\) and logrow\\(\\)', function () {
  throw new Error('Not implemented yet')
})
