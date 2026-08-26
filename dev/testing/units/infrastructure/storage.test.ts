// Filename storage.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialize, get, update, KEYS } from '../../../../src/infrastructure/storage/storage.ts'

// get/update/remove are always Promises now, in both stages (Aug 19 batch
// — see storage.ts's note above the exports).
test('storage module', async () => {
  assert.deepStrictEqual(Object.keys(KEYS).sort(), ['aiApiKey', 'authToken', 'sheetId'])

  initialize()
  assert.strictEqual(await get(KEYS.authToken), undefined)

  await update(KEYS.authToken, 'token-123')
  assert.strictEqual(await get(KEYS.authToken), 'token-123')

  await update(KEYS.aiApiKey, 'gemini-key')
  await update(KEYS.sheetId, 'sheet-abc')
  assert.strictEqual(await get(KEYS.aiApiKey), 'gemini-key')
  assert.strictEqual(await get(KEYS.sheetId), 'sheet-abc')
})
