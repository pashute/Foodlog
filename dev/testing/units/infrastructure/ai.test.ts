// Filename ai.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { analyze, summarize, getPatternContext, learnFromRecord } from '../../../../src/infrastructure/ai/ai.ts'

// Structural (regex) assertions rather than full exact-text comparisons —
// the exact wording is only knowable for the prototype mock's canned
// fixtures; what the AI contract actually guarantees is the *shape*
// (details/data field patterns), so that's what's tested here.
const DETAILS_RE = /^qty:\d+, sz:.{1,7}$/
const DATA_RE = /^wgt:\d+g?, crb:\d+, cal:?\d+c?$/

test('ai module - analyze', async () => {
  const rows = await analyze('cucumber yogurt')
  assert.strictEqual(rows.length, 2)
  for (const row of rows) {
    assert.match(row.status, /^(guess|set)$/)
    assert.match(row.details, DETAILS_RE)
    assert.match(row.data, DATA_RE)
  }

  const setRows = await analyze(
    '(14g, 138cals), 1 med? cucumber (wgt: 200g, crb: 6g, nrg: 28kc),\n1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)'
  )
  assert.match(setRows[0].status, /^set$/)

  await assert.rejects(() => analyze('unknown meal text'), /AI error occured/)
})

test('ai module - summarize', async () => {
  assert.match(await summarize('08:03'), /^\d+g: .*yogurt/)
  assert.match(await summarize('08:57'), /^\d+g:.*almonds/)
  assert.strictEqual(await summarize('nonexistent'), undefined)
})

test('ai module - pattern context: seeded once, readable, updatable', async () => {
  const before = await getPatternContext()
  assert.deepStrictEqual(before.cucumber, { qty: '1', unit: 'med' })

  await learnFromRecord({ name: 'kiwi', qty: '2', unit: 'sml' })
  const after = await getPatternContext()
  assert.deepStrictEqual(after.kiwi, { qty: '2', unit: 'sml' })
  // existing entries untouched by a new one
  assert.deepStrictEqual(after.cucumber, { qty: '1', unit: 'med' })
})
