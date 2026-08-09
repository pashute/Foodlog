// Filename prototype.steps.js  Version 0.2.0

import { Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { get } from '../../../../src/infrastructure/config/config.js'

Then('the config module responds to get\\(section, key\\)', function () {
  assert.strictEqual(get('app', 'appname'), 'Foodlog')
})

Then('the storage module responds to keys, initialize, update, get', function () {
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
