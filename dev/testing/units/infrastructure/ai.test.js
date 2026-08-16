// Filename ai.test.js  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze, summarize } from '../../../../src/infrastructure/ai/ai.js'

test('ai module - analyze', async () => {
  const rows = await analyze('cucumber yogurt')
  assert.strictEqual(rows.length, 2)
  assert.strictEqual(rows[0].status, 'guess')
  assert.strictEqual(rows[0].name, 'cucumber')

  const setRows = await analyze('(14g, 138cals), 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g,110c)')
  assert.strictEqual(setRows[0].status, 'set')

  await assert.rejects(() => analyze('unknown meal text'), /AI error occured/)
})

test('ai module - summarize', async () => {
  assert.strictEqual(await summarize('08:03'), '14g: 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g, 110c )')
  assert.strictEqual(await summarize('08:57'), '3g:  10? std? almonds (12g, 3g,70c)')
  assert.strictEqual(await summarize('nonexistent'), undefined)
})
