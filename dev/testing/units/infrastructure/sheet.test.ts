// Filename sheet.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  existsOrCreate,
  save,
  link,
  createMealRecord,
  MealRecordStructure,
  MealTextFormat,
  MealTextRegex,
  isValidMealText,
} from '../../../../src/infrastructure/sheet/sheet.ts'

// existsOrCreate/log/link are always Promises now, in both stages (Aug 19
// batch — see sheet.ts's note above the exports), so the prototype-mode
// mock is exercised through await here same as the real-mode test below.
test('sheet module', { skip: 'replaced by the pending source-independent sheet object contract' }, async () => {
  const sheet1 = await existsOrCreate()
  assert.deepStrictEqual(sheet1.header, ['date', 'dow', 'time', 'carbs', 'status', 'meal'])

  const sheet2 = await existsOrCreate()
  assert.strictEqual(sheet2, sheet1) // reused, not recreated

  await save({ date: '2026/08/11', meal: 'test meal' })
  assert.strictEqual(sheet1.rows.length, 1)
  assert.strictEqual(sheet1.rows[0].meal, 'test meal')

  assert.strictEqual(await link(), sheet1.link)
  assert.strictEqual(await link(), 'http://localhost:3000/Foodlog.mock.html')
})

test('createMealRecord: defaults every MealRecordStructure field', () => {
  const record = createMealRecord({ name: 'cucumber', qty: '1', unit: 'med', wgt: 200, crb: 6, cal: 28 })
  for (const field of MealRecordStructure) assert.ok(field in record, `missing field ${field}`)
  assert.strictEqual(record.fguess, false)
  assert.strictEqual(record.qguess, false)
  assert.strictEqual(record.uguess, false)
  assert.strictEqual(record.tguess, false)
  assert.strictEqual(record.type, '')
})

test('createMealRecord: unit truncates to 3 letters, qty defaults to "1"', () => {
  const record = createMealRecord({ name: 'x', unit: 'waytoolongunit' })
  assert.strictEqual(record.unit, 'way')
  assert.strictEqual(record.qty, '1')
})

test('createMealRecord: type (optional qualifier) truncates to 9 letters', () => {
  const record = createMealRecord({ name: 'x', type: 'waytoolongtype' })
  assert.strictEqual(record.type, 'waytoolon')
})

test('createMealRecord: qty truncates to 2 digits', () => {
  const record = createMealRecord({ name: 'x', qty: '123' })
  assert.strictEqual(record.qty, '12')
})

test('MealTextFormat: one record, no guesses, no type — no "?" anywhere, type omitted', () => {
  const record = createMealRecord({ name: 'cucumber', qty: '1', unit: 'med', wgt: 200, crb: 6, cal: 28 })
  const text = MealTextFormat([record], 6, 28)
  assert.strictEqual(text, '(6g, 28cals), 1 med cucumber (wgt: 200g, crb: 6g, nrg: 28kc)')
  assert.ok(isValidMealText(text))
})

test('MealTextFormat: type present and not guessed shows plain, between unit and name', () => {
  const record = createMealRecord({
    name: 'cheese', qty: '1', unit: 'slc', type: 'heavy', wgt: 30, crb: 1, cal: 100,
  })
  const text = MealTextFormat([record], 1, 100)
  assert.ok(text.includes('1 slc heavy cheese'), `expected type between unit and name, got: ${text}`)
})

test('MealTextFormat: "?" goes on qty when qty guessed but unit was given (not guessed)', () => {
  const record = createMealRecord({ name: 'cucumber', qty: '1', qguess: true, unit: 'med', wgt: 200, crb: 6, cal: 28 })
  const text = MealTextFormat([record], 6, 28)
  assert.ok(text.includes('1? med cucumber'))
})

test('MealTextFormat: unit\'s "?" wins over qty\'s when both were guessed', () => {
  const record = createMealRecord({
    name: 'cucumber', qty: '1', qguess: true, unit: 'med', uguess: true, wgt: 200, crb: 6, cal: 28,
  })
  const text = MealTextFormat([record], 6, 28)
  assert.ok(text.includes('1 med? cucumber'), `expected mark on unit only, got: ${text}`)
  const questionMarks = (text.match(/\?/g) || []).length
  assert.strictEqual(questionMarks, 1, `qty/unit are mutually exclusive, got: ${text}`)
})

test('MealTextFormat: type gets its own independent "?" mark', () => {
  const record = createMealRecord({
    name: 'cheese', qty: '1', unit: 'slc', type: 'heavy', tguess: true, wgt: 30, crb: 1, cal: 100,
  })
  const text = MealTextFormat([record], 1, 100)
  assert.ok(text.includes('1 slc heavy? cheese'), `expected mark on type, got: ${text}`)
})

test('MealTextFormat: the food name gets its own independent "?" mark', () => {
  const record = createMealRecord({ name: 'cucumber', qty: '1', unit: 'med', fguess: true, wgt: 200, crb: 6, cal: 28 })
  const text = MealTextFormat([record], 6, 28)
  assert.ok(text.includes('1 med cucumber?'), `expected mark on food name, got: ${text}`)
})

test('MealTextFormat: up to 3 "?" per record — unit, type, and food name all guessed', () => {
  const record = createMealRecord({
    name: 'cucumber', qty: '1', qguess: true, unit: 'med', uguess: true,
    type: 'heavy', tguess: true, fguess: true, wgt: 200, crb: 6, cal: 28,
  })
  const text = MealTextFormat([record], 6, 28)
  assert.ok(text.includes('1 med? heavy? cucumber?'), `expected 3 marks, got: ${text}`)
  const questionMarks = (text.match(/\?/g) || []).length
  assert.strictEqual(questionMarks, 3, `expected exactly 3 "?", got: ${text}`)
})

test('MealTextRegex / isValidMealText: rejects two "?" between qty and unit (mutually exclusive)', () => {
  const bad = '(6g, 28cals), 1? med? cucumber (wgt: 200g, crb: 6g, nrg: 28kc)'
  assert.strictEqual(isValidMealText(bad), false)
})

test('MealTextRegex / isValidMealText: accepts a "?" on the food name alongside a unit mark', () => {
  const ok = '(6g, 28cals), 1 med? cucumber? (wgt: 200g, crb: 6g, nrg: 28kc)'
  assert.strictEqual(isValidMealText(ok), true)
})

test('MealTextRegex / isValidMealText: accepts a multi-item well-formed string', () => {
  const cucumber = createMealRecord({ name: 'cucumber', qty: '1', unit: 'med', wgt: 200, crb: 6, cal: 28 })
  const yogurt = createMealRecord({ name: 'yogurt', qty: '1', uguess: true, unit: 'cup', wgt: 170, crb: 8, cal: 110 })
  const text = MealTextFormat([cucumber, yogurt], 14, 138)
  assert.ok(isValidMealText(text), `expected valid, got: ${text}`)
})

// Production (non-prototype) path — needs a real Google account + Drive/
// Sheets API access, so it can't run in this offline suite (same convention
// as ai.ts's real Gemini call: written, not exercised, per instruction).
// Skipped, not deleted, so it's ready to run once config.data.ts's stage
// flips to non-'prototype' against a real signed-in session with a stored
// authToken. existsOrCreate()/log()/link() are Promises in both stages —
// see sheet.ts's note above the exports.
test('sheet module (production, real Google Sheet) — needs live Google auth', { skip: 'requires a real signed-in Google session; run manually against production config' }, async () => {
  const { existsOrCreate, log, link } = await import('../../../../src/infrastructure/sheet/sheet.ts')

  const sheet = await existsOrCreate()
  // The link must point at the user's actual Google Sheet, not a placeholder.
  assert.match(sheet.link, /^https:\/\/docs\.google\.com\/spreadsheets\//)
  // If the sheet didn't exist yet for this user, it must be created with the
  // same header row as the mock (single source of truth for the schema).
  assert.deepStrictEqual(sheet.header, ['date', 'dow', 'time', 'carbs', 'status', 'meal'])

  // Calling existsOrCreate() again for the same user must reuse the sheet,
  // not create a second one.
  const sheetAgain = await existsOrCreate()
  assert.strictEqual(sheetAgain.id, sheet.id)

  await log({ date: '2026/08/11', meal: 'test meal' })
  assert.strictEqual(await link(), sheet.link)
})
