// Filename ai.test.js  Version 0.1.0

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze, summarize } from '../../../../src/infrastructure/ai/ai.js'

test('ai module - analyze', () => {
  const rows = analyze('cucumber yogurt')
  assert.strictEqual(rows.length, 2)
  assert.strictEqual(rows[0].status, 'guess')
  assert.strictEqual(rows[0].name, 'cucumber')

  const setRows = analyze('1? med? cucumber (200g, 6g,28c), 1? sml? yogurt (170g, 8g, 110c )')
  assert.strictEqual(setRows[0].status, 'set')

  assert.deepStrictEqual(analyze('unknown meal text'), [])
})

test('ai module - summarize', () => {
  assert.strictEqual(summarize('08:03'), '14g: 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g, 110c )')
  assert.strictEqual(summarize('08:57'), '3g:  10? std? almonds (12g, 3g,70c)')
  assert.strictEqual(summarize('nonexistent'), undefined)
})
