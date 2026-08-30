// Filename setup.steps.ts  Version 0.2.1

// Playwright E2E against the live dev server (hooks.ts: this.page/baseUrl).
// @setup.instructions: only the logged-out rows are driven for real here —
// the logged-in rows need a full mock-OAuth popup click-through (same gap
// noted in entry.feature scenario 3), left "Not implemented yet".
// @setup.appError: the app never actually sets Settings' `appError` prop
// today (App.tsx always passes none) — there's no way to trigger this state
// from the running UI, so it's left "Not implemented yet" rather than faked.

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { formatter, getText } from '../../../../../../src/infrastructure/texts.ts'

const INFO_ICON_LABEL = { theme: 'theme info', 'ai key': 'AI key info', timezone: 'timezone info' }

Given('the settings panel state is login {string} and AI key {string}', async function (login, aiKey) {
  if (login === 'loggedIn') {
    throw new Error('Not implemented yet') // needs full mock-OAuth popup click-through
  }
  this.aiKey = aiKey
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
})

Then('the top instruction card shows {string}', async function (instruction) {
  await this.page.getByText(instruction, { exact: true }).waitFor()
})

// The example values below embed literal double-quotes (e.g. Press "Login
// with Google"...), which breaks {string}'s quote-delimited matching against
// the already-quoted step text — cucumber sees these as distinct literal
// step patterns instead. Same assertion, just matched differently.
Then('the top instruction card shows "Press {string} to use the app."', async function (label) {
  const instruction = {
    'Login with Google': formatter.settings.instruction.needLogin,
    'Go to Diary': formatter.settings.instruction.setupOK,
  }[label]
  assert.ok(instruction, `no formatter for ${label}`)
  await this.page.getByText(getText(instruction), { exact: true }).waitFor()
})

Then('the top instruction card shows "Press {string} to see how & why"', async function (label) {
  assert.strictEqual(label, 'Start AI', `no formatter for ${label}`)
  await this.page.getByText(getText(formatter.settings.info.aiKey), { exact: true }).waitFor()
})

Given('an application error occurs, other than an AI key problem', function () {
  throw new Error('Not implemented yet') // Settings' appError prop is never set by the running app today
})

Then('the top instruction card text is shown in red and bold', function () {
  throw new Error('Not implemented yet')
})

// Note: 'the settings panel is shown' is owned by
// screens/layout/settings/step_definitions/settings.steps.ts (same literal
// text, registered once to avoid an ambiguous-step error).

When('the user presses and holds the {string} info icon', async function (row) {
  const icon = this.page.getByLabel(INFO_ICON_LABEL[row])
  const box = await icon.boundingBox()
  await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await this.page.mouse.down()
})

When('the user releases the info icon', async function () {
  await this.page.mouse.up()
})

Then('the top instruction card reverts to its previous instruction', async function () {
  await this.page.getByText(getText(formatter.settings.instruction.needLogin), { exact: true }).waitFor()
})
