// Filename sheet.test.js  Version 0.1.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsOrCreate, log, link } from '../../../../src/infrastructure/sheet/sheet.js'

test('sheet module', () => {
  const sheet1 = existsOrCreate()
  assert.deepStrictEqual(sheet1.header, ['date', 'dow', 'time', 'carbs', 'status', 'meal'])
  assert.strictEqual(sheet1.id, 'abcd12345')

  const sheet2 = existsOrCreate()
  assert.strictEqual(sheet2, sheet1) // reused, not recreated

  log({ date: '2026/08/11', meal: 'test meal' })
  assert.strictEqual(sheet1.rows.length, 1)
  assert.strictEqual(sheet1.rows[0].meal, 'test meal')

  assert.strictEqual(link(), sheet1.link)
  assert.strictEqual(link(), 'http://localhost:3000/Foodlog.mock.html')
})
