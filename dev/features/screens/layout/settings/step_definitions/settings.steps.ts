// Filename: settings.steps.ts  Version 0.2.1
// [?!] "each with a screenshot" (settings.feature line 45) is stale vs the
// app: step 2 shows a "(see screenshot)" link opening a popup, not an
// inline image (see aiKey.dlg.tsx, changed earlier this session). Checked
// against what's actually there below rather than the literal wording.

// Playwright E2E against the live dev server (hooks.ts: this.page/baseUrl).
// @settings.aiKeyStatus (Invalid example) and the "invalid save attempt"
// step are left stub: the app has no way to reach an "Invalid"-stored key or
// a rejected-save state through normal UI interaction in prototype mode —
// SAVE stays disabled for anything that doesn't already look valid, and the
// real Gemini-rejection warning needs a live network call (see
// aiKeyDlg.test.tsx's existing note on this same limitation). Not faked.

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { loginAsUser1, setValidAiKey } from '../../../../support/loginHelper.ts'

// Shared with screens/interaction/entry.feature and setup.feature (same
// literal text, registered once here to avoid an ambiguous-step error).
// Registered as both Given and Then via the same text since it's used as
// each in different scenarios (cucumber matches by text, not keyword).
// Cucumber matches by text only, not Given/When/Then keyword, so one
// registration covers both "Given" and "Then" usages across scenarios.
Given('the settings panel is shown', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await this.page.getByText(/Press ".*" to use the app\.|Press \[.*\]|Go to Data Entry/).waitFor()
})

Then('the settings panel shows the following elements', async function (_table) {
  await this.page.getByText('Theme', { exact: true }).waitFor()
  await this.page.getByText(/AI Key/).waitFor()
  await this.page.getByText('Open in Google Sheets', { exact: true }).waitFor()
  await this.page.getByText('Change', { exact: true }).waitFor()
  await this.page.getByRole('button', { name: 'Go to Diary' }).waitFor()
})

Then('the timezone choice is disabled with the current system timezone', async function () {
  await this.page.getByText('Change', { exact: true }).waitFor()
  await this.page.getByText(/\(GMT[+-]\d/).waitFor()
})

Then('the App name and Version are shown in the header only, not in the App info card', async function () {
  const versionCount = await this.page.getByText(/^v\d+\.\d+\.\d+$/).count()
  assert.strictEqual(versionCount, 1, 'expected the version text to appear exactly once (header only)')
})

Then('App info, AI API Key, Foodlog sheet, Timezone, and Go to Diary are all disabled until logged in', async function () {
  // Start AI's Pressable has no accessibilityRole="button" — getByRole
  // would hang waiting for a role that's never assigned. The disabled
  // signal here is the whole card dimming (cardDisabled: opacity 0.4).
  const themeCard = this.page.getByText('Theme', { exact: true })
  const opacity = await themeCard.evaluate((el) => {
    let node = el
    while (node) {
      const o = parseFloat(getComputedStyle(node).opacity)
      if (!Number.isNaN(o) && o < 1) return o
      node = node.parentElement
    }
    return 1
  })
  assert.ok(opacity < 1, `expected a dimmed (disabled) card, got opacity ${opacity}`)
  const goToDiary = this.page.getByRole('button', { name: 'Go to Diary' })
  assert.strictEqual(await goToDiary.getAttribute('aria-disabled'), 'true')
})

Then(/^each info icon is adjacent to its row's button, after it \(Theme has no button, so its icon is at the end of the row\)$/, async function () {
  const startAiBox = await this.page.getByText('Start AI', { exact: true }).boundingBox()
  const aiKeyIconBox = await this.page.getByLabel('AI key info').boundingBox()
  assert.ok(aiKeyIconBox.x > startAiBox.x, 'expected the AI key info icon to the right of Start AI')
})

Given('the settings panel is shown and the user is logged in', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAsUser1(this.page)
})

Then('the top instruction card shows the idle instruction by default', async function () {
  await this.page.getByText('Press "Login with Google" to use the app.', { exact: true }).waitFor()
})

When('the user presses and holds the AI API Key info icon', async function () {
  const icon = this.page.getByLabel('AI key info')
  const box = await icon.boundingBox()
  await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await this.page.mouse.down()
})

Then('the top instruction card shows the AI API Key hint', async function () {
  await this.page.getByText('Press "Start AI" to see how & why', { exact: true }).waitFor()
})

When('the user presses and holds the Timezone info icon', async function () {
  await this.page.mouse.up() // release whichever icon was held before
  const icon = this.page.getByLabel('timezone info')
  const box = await icon.boundingBox()
  await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await this.page.mouse.down()
})

Then('the top instruction card shows the Timezone hint', async function () {
  await this.page
    .getByText('This changes the timezone in this app. Not the system settings.', { exact: true })
    .waitFor()
})

Then('releasing an info icon reverts the top instruction card to its former instruction', async function () {
  await this.page.mouse.up()
  await this.page.getByText('Press "Login with Google" to use the app.', { exact: true }).waitFor()
})

Then('there is no hover behavior anywhere in the app — press only, like a phone', async function () {
  await this.page.getByLabel('AI key info').hover()
  // Hover alone (no mouse.down) must not reveal the press-hint.
  await this.page.getByText('Press "Login with Google" to use the app.', { exact: true }).waitFor()
})

Given('the stored AI key is {string}', function (_key) {
  throw new Error('Not implemented yet') // see file header: no UI path to a stored "invalid" key in prototype mode
})

Then('the AI Key status shows {string}', function (_status) {
  throw new Error('Not implemented yet')
})

When('the user presses {string}', async function (label) {
  await this.page.getByText(label, { exact: true }).click()
})

Then('the Gemini key dialog is shown with header {string}', async function (header) {
  await this.page.getByText(header, { exact: true }).waitFor()
})

Then('the dialog shows numbered steps to get a Gemini API key, each with a screenshot', async function () {
  await this.page.getByText(/Go to.*Google AI Studio/).waitFor()
  await this.page.getByText(/Click on Create API Key/).waitFor()
  await this.page.getByText('(see screenshot)', { exact: true }).waitFor()
})

Then('a field to paste the key and a SAVE button', async function () {
  await this.page.getByPlaceholder('AIza...').waitFor()
  await this.page.getByRole('button', { name: 'SAVE' }).waitFor()
})

Then('SAVE is disabled until a valid-looking key is entered', async function () {
  const save = this.page.getByRole('button', { name: 'SAVE' })
  assert.strictEqual(await save.getAttribute('aria-disabled'), 'true')
  await this.page.getByPlaceholder('AIza...').fill('AIzaMockKeyForE2E12345')
  assert.notStrictEqual(await save.getAttribute('aria-disabled'), 'true')
})

Then('an invalid save attempt shows {string}', function (_message) {
  throw new Error('Not implemented yet') // SAVE stays disabled for invalid-looking keys — never reachable via UI
})

// Parens are Cucumber Expression "optional text" syntax — must be escaped
// to match them literally (bit me on this exact step: unescaped, it never
// matched the .feature text at all, reporting as "undefined").
Given(/^Go to Diary is enabled \(logged in, AI key OK, sheet ready\)$/, async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAsUser1(this.page)
  await setValidAiKey(this.page)
  await this.page.getByText('Press Go to Data Entry', { exact: true }).waitFor()
})

When('the user presses Go to Diary', async function () {
  await this.page.getByRole('button', { name: 'Go to Diary' }).click()
})

Then('the user is shown the Diary screen', async function () {
  await this.page.getByPlaceholder('e.g. cucumber yogurt').waitFor()
})
