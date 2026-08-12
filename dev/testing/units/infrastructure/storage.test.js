// Filename storage.test.js  Version 0.1.0

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialize, get, update, KEYS } from '../../../../src/infrastructure/storage/storage.js'

test('storage module', () => {
  assert.deepStrictEqual(Object.keys(KEYS).sort(), ['aiApiKey', 'authToken', 'sheetId'])

  initialize()
  assert.strictEqual(get(KEYS.authToken), undefined)

  update(KEYS.authToken, 'token-123')
  assert.strictEqual(get(KEYS.authToken), 'token-123')

  update(KEYS.aiApiKey, 'gemini-key')
  update(KEYS.sheetId, 'sheet-abc')
  assert.strictEqual(get(KEYS.aiApiKey), 'gemini-key')
  assert.strictEqual(get(KEYS.sheetId), 'sheet-abc')
})
