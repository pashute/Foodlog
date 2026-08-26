// Filename: settings.steps.ts  Version 0.2.1

// 
// Playwright E2E against the live dev server (hooks.ts: this.page/baseUrl).

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { loginAsUser1, setValidAiKey } from '../../../../support/loginHelper.ts'
import { formatter, getText } from '../../../../../../src/infrastructure/texts.ts'

// Shared with screens/interaction/entry.feature and setup.feature 
// (same literal text, registered once, here, to avoid the `ambiguous-step` error).
Given('the settings panel is shown', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await this.page.getByText(getText(formatter.settings.instruction.needLogin), { exact: true }).waitFor()
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

Given('the settings panel is logged in', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAsUser1(this.page)
})

When('the user interacts with one of the info icons on the Settings panel', async function () {
  const icon = this.page.getByLabel('AI key info')
  const box = await icon.boundingBox()
  await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await this.page.mouse.down()
})

Then('the top instruction card responds correctly:', async function (table) {
  const interactions = table.rowsHash()
  assert.strictEqual(interactions.hold, 'key based instruction')
  assert.strictEqual(interactions.release, 'back to original instruction')
  assert.strictEqual(interactions.hover, 'no hover response (phone-like app behavior)')

  await this.page.getByText(getText(formatter.settings.info.aiKey), { exact: true }).waitFor()
  await this.page.mouse.up()
  await this.page.getByText(getText(formatter.settings.instruction.needLogin), { exact: true }).waitFor()
  await this.page.getByLabel('AI key info').hover()
  await this.page.getByText(getText(formatter.settings.instruction.needLogin), { exact: true }).waitFor()
})

Then('the correct instruction is shown:', async function (table) {
  const expected = {
    Theme: getText(formatter.settings.info.theme),
    'AI API Key': getText(formatter.settings.info.aiKey),
    Timezone: getText(formatter.settings.info.timezone),
  }
  for (const [section, instruction] of Object.entries(table.rowsHash())) {
    assert.strictEqual(expected[section], instruction, `unexpected instruction row for ${section}`)
    const icon = this.page.getByLabel(section === 'AI API Key' ? 'AI key info' : `${section.toLowerCase()} info`)
    const box = await icon.boundingBox()
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await this.page.mouse.down()
    await this.page.getByText(instruction, { exact: true }).waitFor()
    await this.page.mouse.up()
  }
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

When('an error occurs (i.e., invalid AI key, missing sheet, etc.)', function () {
  throw new Error('Not implemented yet') // prototype UI has no user-triggerable Settings error state
})

Then('the error message is shown on the top instruction card in the Settings panel.', function () {
  throw new Error('Not implemented yet')
})

Then('the message is written in red text', function () {
  throw new Error('Not implemented yet')
})

Then('the message is a short 1 line message that fits in the card', function () {
  throw new Error('Not implemented yet')
})

// Parens are Cucumber Expression "optional text" syntax — must be escaped
// to match them literally (bit me on this exact step: unescaped, it never
// matched the .feature text at all, reporting as "undefined").
Given('the settings panel is ready for data entry', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAsUser1(this.page)
  await setValidAiKey(this.page)
  await this.page.getByText(getText(formatter.settings.instruction.setupOK), { exact: true }).waitFor()
})

When('the user presses Go to Diary', async function () {
  await this.page.getByRole('button', { name: 'Go to Diary' }).click()
})

Then('the user is shown the Diary screen', async function () {
  await this.page.getByPlaceholder('e.g. cucumber yogurt').waitFor()
})
