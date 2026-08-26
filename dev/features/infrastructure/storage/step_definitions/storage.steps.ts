// Filename storage.steps.ts  Version 0.2.1

import { Given, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { initialize, get, update, KEYS } from '../../../../../src/infrastructure/storage/storage.ts'

Given('the local secure storage is used for critical data', function () {
  assert.strictEqual(typeof initialize, 'function')
})

Then('the app can access it through a storage module', function () {
  assert.strictEqual(typeof get, 'function')
  assert.strictEqual(typeof update, 'function')
})

Then(/^the module supports `initialize`, `get`, and `update`\.$/, function () {
  assert.strictEqual(typeof initialize, 'function')
  assert.strictEqual(typeof get, 'function')
  assert.strictEqual(typeof update, 'function')
})

Given('data is stored or retrieved from the storage', function () {
  initialize()
  update(KEYS.authToken, 'mock-token')
  update(KEYS.aiApiKey, 'mock-ai-key')
  update(KEYS.sheetId, 'mock-sheet-id')
})

Then('the storage module has the following keys:', function (table) {
  const rows = table.hashes()
  for (const { key } of rows) {
    assert.ok(key in KEYS, `missing key constant: ${key}`)
  }
})
