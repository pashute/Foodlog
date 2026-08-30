// Filename storage.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialize, get, update, remove, KEYS } from '../../../../src/infrastructure/storage/storage.ts'

test('storage module', async () => {
  assert.deepStrictEqual(Object.keys(KEYS).sort(), ['aiApiKey', 'authToken', 'sheetId', 'usermail'])

  initialize()
  assert.strictEqual(await get(KEYS.authToken), undefined)

  await update(KEYS.authToken, 'token-123')
  assert.strictEqual(await get(KEYS.authToken), 'token-123')

  await update(KEYS.aiApiKey, 'gemini-key')
  await update(KEYS.sheetId, 'sheet-abc')
  await update(KEYS.usermail, 'user@example.com')
  assert.strictEqual(await get(KEYS.aiApiKey), 'gemini-key')
  assert.strictEqual(await get(KEYS.sheetId), 'sheet-abc')
  assert.strictEqual(await get(KEYS.usermail), 'user@example.com')

  await remove(KEYS.authToken)
  await remove(KEYS.aiApiKey)
  await remove(KEYS.sheetId)
  assert.strictEqual(await get(KEYS.authToken), undefined)
  assert.strictEqual(await get(KEYS.aiApiKey), undefined)
  assert.strictEqual(await get(KEYS.sheetId), undefined)
  assert.strictEqual(await get(KEYS.usermail), 'user@example.com')
})

test('storage returns an empty value for an unset key', async () => {
  initialize()
  assert.strictEqual(await get(KEYS.aiApiKey), undefined)
})
