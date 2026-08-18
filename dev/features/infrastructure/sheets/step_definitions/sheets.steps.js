// Filename sheets.steps.js  Version 0.2.2

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { existsOrCreate, log, link } from '../../../../../src/infrastructure/sheet/sheet.js'
import { reset } from '../../../../../src/prototype/sheet.mock.js'
import { get as storageGet, KEYS } from '../../../../../src/infrastructure/storage/storage.js'

Given('the Sheets module is available', function () {
  assert.strictEqual(typeof existsOrCreate, 'function')
})

Then(/^it exposes `existsOrCreate`, `log`, and `link`$/, function () {
  assert.strictEqual(typeof existsOrCreate, 'function')
  assert.strictEqual(typeof log, 'function')
  assert.strictEqual(typeof link, 'function')
})

Given('no Foodlog sheet id is stored', function () {
  reset()
})

When('existsOrCreate is called', function () {
  this.sheet = existsOrCreate()
})

Then('a new Foodlog sheet is created with header row:', function (table) {
  const expected = table.raw()[0]
  assert.deepStrictEqual(this.sheet.header, expected)
})

Then('the sheet id is stored', function () {
  assert.ok(this.sheet.id)
})

Given('a Foodlog sheet id is already stored', function () {
  reset()
  this.firstSheet = existsOrCreate()
})

Then('the existing sheet is used without creating a new one', function () {
  assert.strictEqual(this.sheet, this.firstSheet)
})

When('log is called with meal data', function () {
  this.sheet = existsOrCreate()
  log({ date: '2026/08/11', meal: 'test meal' })
})

Then('a new row is prepended to the Foodlog sheet', function () {
  assert.strictEqual(this.sheet.rows[0].meal, 'test meal')
})

Given('a Foodlog sheet id is stored', function () {
  reset()
  this.sheet = existsOrCreate()
})

When('link is called', function () {
  this.link = link()
})

Then('the direct URL to the Foodlog sheet is returned for the settings panel', function () {
  assert.strictEqual(this.link, this.sheet.link)
})

Then('the sheet id is empty', function () {
  assert.strictEqual(storageGet(KEYS.sheetId), undefined)
})

Then('the sheet id is empty again', function () {
  assert.strictEqual(storageGet(KEYS.sheetId), undefined)
})

// Note: 'the user logs out' is owned by
// infrastructure/oauth/step_definitions/oauth.steps.js (same literal text,
// registered once to avoid an ambiguous-step error — it does a full mock
// login then auth.logout(), which already clears KEYS.sheetId).
