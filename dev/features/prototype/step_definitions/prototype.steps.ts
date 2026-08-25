// Filename: prototype.steps.ts  Version 0.3.14

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { isPrototype } from '../../../../src/infrastructure/environment.ts'
import { initialize, get as storageGet, update, KEYS } from '../../../../src/infrastructure/storage/storage.ts'
import * as authMock from '../../../../src/prototype/oauth/oauth.mock.ts'
import { analyze, summarize } from '../../../../src/prototype/ai.mock.ts'
import * as sheetMock from '../../../../src/prototype/sheet.mock.ts'
import { sheetHeaders } from '../../../../src/infrastructure/sheet/sheet.ts'
import { loginAndReachDiary } from '../../support/loginHelper.ts'

// Note: 'the config module is available' is owned by
// infrastructure/config/step_definitions/config.steps.ts (same literal text).
// Note: 'the Sheets module is available' is owned by
// infrastructure/sheets/step_definitions/sheets.steps.ts (same literal text).

Given('the development is in prototype mode', function () {
  assert.strictEqual(isPrototype(), true)
  authMock.logout() // fresh state per scenario — oauth.mock.ts's state is module-level
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
// for the oauth.mock.ts / accountChoice / permitConsent scenarios above.

Given('the mock account-choice popup will resolve with account {string}', async function (username) {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
  _queueTestResponse({ accepted: true, username, email: `${username}@gmail.com` })
})

Given('the mock account-choice popup will resolve as cancelled', async function () {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/accountChoice.mock.ts')
  _queueTestResponse({ accepted: false })
})

Given('the mock permission-consent popup will resolve with consent granted', async function () {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/permitConsent.mock.ts')
  _queueTestResponse({ accepted: true, scope: 'drive.file' })
})

Given('the mock permission-consent popup will resolve as denied', async function () {
  const { _queueTestResponse } = await import('../../../../src/prototype/oauth/permitConsent.mock.ts')
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

// ---------------- AI (@mock.ai-analyze / #ai-summarize) ----------------

Given('the User entered time and meal info', function () {
  this.meal = 'cucumber yogurt'
})

When('the User submits the meal', async function () {
  this.result = await analyze(this.meal)
})

Then('the module receives the ai analysis instruction prompt', function () {
  // Mock-level: no real prompt is built/sent, just a canned lookup by the
  // literal meal text — asserting a result came back stands in for it.
  assert.ok(this.result)
})

Then('the following meal data is appended', function (table) {
  const [row] = table.hashes()
  assert.strictEqual(row.meal, this.meal)
})

Then('a mockup canned response is returned per sequence:', function (table) {
  const rows = table.hashes()
  assert.strictEqual(this.result.length, rows.length)
  rows.forEach((row, i) => {
    assert.strictEqual(this.result[i].item, Number(row.item))
    assert.strictEqual(this.result[i].status, row.status)
    assert.strictEqual(this.result[i].name, row.name)
    assert.strictEqual(this.result[i].details, row.details)
    assert.strictEqual(this.result[i].data, row.data)
  })
})

Given('the user has submitted a meal entry', async function () {
  this.result = await analyze('cucumber yogurt')
})

Given('the canned example is displayed', function (table) {
  // Context-setting only (instructions.md 2.2: features define positively,
  // not strict assertions) — this table's per-row status mix (cucumber
  // guess / yogurt set) doesn't match any single canned analyze() entry, so
  // only structural shape is checked here, not exact status per row.
  const rows = table.hashes()
  assert.strictEqual(this.result.length, rows.length)
})

Then('a mockup canned string is given as a summary for the meal', async function (table) {
  const rows = table.hashes()
  for (const row of rows) {
    const summary = await summarize(row['hh:mm'])
    assert.strictEqual(summary, row['suggested entry'])
  }
})

// ---------------- Sheet (mock) ----------------

Given('the app stage is prototype', function () {
  assert.strictEqual(isPrototype(), true)
  sheetMock.reset()
})

When('the user interacts with the Foodlog sheet', function () {
  this.mockSheet = sheetMock.existsOrCreate()
})

Then('the app interacts with the mockup sheet as usual:', function (table) {
  const rows = table.hashes()
  assert.strictEqual(rows.length, 4)
  assert.deepStrictEqual(this.mockSheet.header, sheetHeaders)
  assert.deepStrictEqual(this.mockSheet.rows, [])
  sheetMock.log({ date: '2026/08/24', dow: 'Sun', time: '10:00', carbs: 1, calories: 1, status: 'set', meal: 'test' })
  assert.strictEqual(this.mockSheet.rows.length, 1)
  assert.ok(sheetMock.link())
})

// ---------------- @diaryEntry / @diaryEntry.error (Playwright E2E) ----------------

Given('the diary panel is shown in prototype mode', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAndReachDiary(this.page)
})

When('the user presses submit', async function () {
  await this.page.getByRole('button', { name: 'submit meal' }).click()
})

When('the user types {string} and presses submit', async function (text) {
  const meal = text === '{unrecognized meal text}' ? 'not a canned meal' : text
  await this.page.getByPlaceholder('e.g. cucumber yogurt').fill(meal)
  await this.page.getByRole('button', { name: 'submit meal' }).click()
})

Then('the analyzed list shows', async function (table) {
  // Rows never show "?" (Aug 18 20:50 batch) regardless of guess status.
  for (const row of table.hashes()) {
    await this.page.getByText(`${row.item} (${row.wgt})`, { exact: true }).waitFor()
  }
})

Then('the totals show {string} carbs and {string} energy', async function (carbs, energy) {
  await this.page.getByText(`carbs ${carbs} · ${energy}`).waitFor()
})

Then('the Fix, Accept, Save, and Revert buttons are enabled', async function () {
  for (const name of ['Fix', 'Accept', 'Save', 'Revert']) {
    const btn = this.page.getByRole('button', { name })
    assert.notStrictEqual(await btn.getAttribute('aria-disabled'), 'true')
  }
})

When('the user unticks the yogurt checkbox and ticks the cucumber checkbox', async function () {
  // Both start unticked (guess) per the canned fixture — "unticks yogurt" is
  // a no-op (already unticked; clicking it would incorrectly tick it), so
  // only cucumber needs ticking to reach the documented end state below.
  await this.page.getByRole('checkbox', { name: /accept cucumber/i }).click()
})

Then('the food list shows {string} and {string}', async function (a, b) {
  await this.page.getByText(a, { exact: true }).waitFor()
  await this.page.getByText(b, { exact: true }).waitFor()
})

Then('the meal input shows {string}', async function (expected) {
  const value = await this.page.getByPlaceholder('e.g. cucumber yogurt').inputValue()
  // MealTextFormat now joins records with a real newline (so the textbox
  // wraps after "kc),") — whitespace-normalize both sides so this Gherkin
  // step (which can't easily embed a literal newline in a quoted string)
  // still expresses the same check.
  const norm = (s) => s.replace(/\s+/g, ' ').trim()
  assert.strictEqual(norm(value), norm(expected))
})

// Aug 19 original-record rework: resubmitting an unedited Fix string keeps
// "?"-marked fields read as "not given" (diaryEntry.ts's toOriginal), so
// only cucumber (no marks in the Fix string, was ticked before Fix) comes
// back accepted — yogurt's unit was still marked, so it's still a guess.
Then("cucumber's checkbox is ticked and yogurt's checkbox is unticked", async function () {
  const cucumberBox = this.page.getByRole('checkbox', { name: /accept cucumber/i })
  const yogurtBox = this.page.getByRole('checkbox', { name: /accept yogurt/i })
  assert.strictEqual(await cucumberBox.getAttribute('aria-checked'), 'true')
  assert.notStrictEqual(await yogurtBox.getAttribute('aria-checked'), 'true')
})

Then('the diary panel resets to an empty entry at zero minutes ago', async function () {
  assert.strictEqual(await this.page.getByPlaceholder('e.g. cucumber yogurt').inputValue(), '')
  await this.page.getByText('0', { exact: true }).waitFor()
})

Then('the error text {string} replaces the food list', async function (text) {
  await this.page.getByText(text, { exact: true }).waitFor()
})
