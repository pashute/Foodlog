// Filename: prototype.steps.js  Version 0.3.0

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { get } from '../../../../src/prototype/config.mock.js'
import { isPrototype } from '../../../../src/infrastructure/config/config.js'
import { initialize, get as storageGet, update, KEYS } from '../../../../src/infrastructure/storage/storage.js'
import * as sheetMock from '../../../../src/prototype/sheet.mock.js'
import * as authMock from '../../../../src/prototype/oauth/oauth.mock.js'
import { analyze, summarize } from '../../../../src/prototype/ai.mock.js'

// Note: 'the config module is available' is owned by
// infrastructure/config/step_definitions/config.steps.js (same literal text).
// Note: 'the Sheets module is available' is owned by
// infrastructure/sheets/step_definitions/sheets.steps.js (same literal text).

// ---------------- Config ----------------

Given('the development is in prototype mode', function () {
  assert.strictEqual(isPrototype(), true)
  authMock.logout() // fresh state per scenario — oauth.mock.js's state is module-level
})

When(/^the app calls the config module with get\(section, key\)$/, function () {
  this.result = get('app', 'app-name')
})

Then('mockup code responds replacing a real configuration file', function () {
  assert.strictEqual(this.result, 'Foodlog')
})

Then('the following fields are available', function (table) {
  const rows = table.hashes()
  for (const { section, key, value } of rows) {
    assert.strictEqual(String(get(section, key)), value)
  }
})

Then(/^config only provides the sheets name \(not id or link\)$/, function () {
  assert.strictEqual(get('sheets', 'sheet-name'), 'Foodlog')
  assert.strictEqual(get('sheets', 'id'), undefined)
  assert.strictEqual(get('sheets', 'link'), undefined)
})

Then('the sheet id and link are retrieved from storage on re-login, for the settings panel link', function () {
  initialize()
  update(KEYS.sheetId, 'mock-sheet-id')
  assert.strictEqual(storageGet(KEYS.sheetId), 'mock-sheet-id')
})

// ---------------- Storage ----------------

Given('the storage module is available', function () {
  assert.strictEqual(typeof initialize, 'function')
})

When(/^the app calls the storage module with `initialize`, `get`, or `update`$/, function () {
  initialize()
  update(KEYS.authToken, 'mock-token')
  this.storageResult = storageGet(KEYS.authToken)
})

Then('mockup code responds replacing a real secured local storage element:', function () {
  assert.strictEqual(this.storageResult, 'mock-token')
})

Then('the values will be empty on app entry and after logout', function () {
  initialize()
  assert.strictEqual(storageGet(KEYS.authToken), undefined)
})

Then('the values will be:', function (table) {
  const rows = table.hashes()
  for (const { key, value } of rows) {
    update(key, value)
    assert.strictEqual(storageGet(key), value)
  }
})

Then('the keys are:', function (table) {
  const rows = table.hashes()
  for (const { key } of rows) {
    assert.ok(key in KEYS, `missing key constant: ${key}`)
  }
})

// ---------------- Auth (mock) ----------------
// Note: the step defs previously here didn't match any current line in
// prototype.feature (stale from an earlier version) — replaced with steps
// for the oauth.mock.js / accountChoice / permitConsent scenarios above.

Given('the mock account-choice popup will resolve with account {string}', async function (username) {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/accountChoice.mock.js')
  _queueTestResponse({ accepted: true, username, email: `${username}@gmail.com` })
})

Given('the mock account-choice popup will resolve as cancelled', async function () {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/accountChoice.mock.js')
  _queueTestResponse({ accepted: false })
})

Given('the mock permission-consent popup will resolve with consent granted', async function () {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/permitConsent.mock.js')
  _queueTestResponse({ accepted: true, scope: 'drive.file' })
})

Given('the mock permission-consent popup will resolve as denied', async function () {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/permitConsent.mock.js')
  _queueTestResponse({ accepted: false })
})

When('oauth.mock login is run', async function () {
  this.loginResult = await authMock.login()
})

Then('the login result has a refresh token and scope {string}', function (scope) {
  assert.ok(this.loginResult.refreshToken)
  assert.strictEqual(this.loginResult.scope, scope)
})

Then('the login result is an error {string}', function (errorCode) {
  assert.strictEqual(this.loginResult.error, errorCode)
})

Then('oauth.mock reports logged in', function () {
  assert.strictEqual(authMock.isLoggedIn(), true)
})

Then('oauth.mock reports logged out', function () {
  assert.strictEqual(authMock.isLoggedIn(), false)
})

// ---------------- AI ----------------

Given('the AI module calls for AI analysis', function () {
  assert.strictEqual(typeof analyze, 'function')
})

When('the module receives a prompt', function (table) {
  this.prompts = table.hashes()
})

Then('a mockup canned response is returned:', function (table) {
  const expected = table.hashes()
  const actual = this.prompts.flatMap((p) => analyze(p.meal))
  assert.strictEqual(actual.length, expected.length)
  actual.forEach((row, i) => {
    assert.strictEqual(String(row.item), expected[i].item)
    assert.strictEqual(row.status, expected[i].status)
    assert.strictEqual(row.name, expected[i].name)
    assert.strictEqual(row.details, expected[i].details)
    assert.strictEqual(row.data, expected[i]['data json'])
  })
})

Given('the AI module requests a summary line from a list by time:', function (table) {
  this.analyzedRows = table.raw()
})

Then('a mockup canned string is given per list', function (table) {
  const expected = table.raw()
  for (const [time, summaryText] of expected) {
    assert.strictEqual(summarize(time), summaryText)
  }
})

// ---------------- Sheets (mock) ----------------

Given('the app is in prototype stage', function () {
  assert.strictEqual(isPrototype(), true)
})

Given('the user is logged in', function () {
  authMock._forceLoggedIn()
  assert.strictEqual(authMock.isLoggedIn(), true)
})

Given(/^the mock sheets HTML template exists in src\/prototype\/sheet\/$/, function () {
  assert.ok(existsSync(join(process.cwd(), 'src/prototype/sheet/Foodlog.mock.html')))
})

When('the mock sheet object is created or loaded', function () {
  this.sheet = sheetMock.existsOrCreate()
})

Then('a node.js server serves the HTML mockup of the Foodlog sheet', function () {
  throw new Error('Not implemented yet')
})

Given('existOrCreate was not called yet', function () {
  sheetMock.reset()
})

When('the settings module calls sheets.existsOrCreate', function () {
  this.sheet = sheetMock.existsOrCreate()
})

Then('mock sheet settings info is given:', function (table) {
  const rows = table.hashes()
  for (const { key, value } of rows) {
    assert.strictEqual(String(this.sheet[key]), value)
  }
})

Then('a mock google spreadsheet object is created with the header:', function (table) {
  const expected = table.raw()[0]
  assert.deepStrictEqual(this.sheet.header, expected)
})

Then('the mock spreadsheet object replaces the real spreadsheet', function () {
  assert.ok(this.sheet)
})

Given('the development stage is prototype', function () {
  assert.strictEqual(typeof sheetMock.existsOrCreate, 'function')
})

Given('existOrCreate was already called', function () {
  this.firstSheet = sheetMock.existsOrCreate()
})

Then('the mock spreadsheet object is used instead of the real one', function () {
  assert.strictEqual(this.sheet, this.firstSheet)
})

When('the storage module calls sheets.log with meal data', function () {
  this.sheet = sheetMock.existsOrCreate()
  sheetMock.log({ date: '2026/08/11', meal: 'test meal' })
})

Then('the mock spreadsheet is updated with a new row containing the meal entry', function () {
  assert.strictEqual(this.sheet.rows[0].meal, 'test meal')
})

Then('the local HTML file is updated', function () {
  throw new Error('Not implemented yet')
})

When(/^the app wants to set the settings page link to the sheet \(Sheets\.idToLink\(\)\)$/, function () {
  const sheet = sheetMock.existsOrCreate()
  this.link = sheetMock.idToLink(sheet.id)
})

Then('the app will get the link to mock sheet page served by the mock sheet nodejs server.', function () {
  assert.ok(this.link.startsWith('http://localhost:3000/'))
})

Given('the mock sheet object is available', function () {
  this.sheet = sheetMock.existsOrCreate()
})

When('the user presses the sheet link in settings', function () {
  throw new Error('Not implemented yet')
})

Then('the local nodejs mock-sheet server adds the current data to the table in the template', function () {
  throw new Error('Not implemented yet')
})

Then('serves the updated mock html file to be opened in the browser', function () {
  throw new Error('Not implemented yet')
})
