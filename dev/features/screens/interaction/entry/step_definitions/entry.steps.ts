// Filename: entry.steps.ts
// Version: 0.3.1

// Playwright E2E against the live dev server (hooks.ts: this.page/baseUrl),
// same tier as the other screens/* features. Scenarios 2 ("Continued log in
// after crash") and 3 ("Logging in") need app-lifecycle / full mock-OAuth-
// popup-click simulation that doesn't exist in this batch yet — left as
// documented "Not implemented yet" stubs, not faked.

import { Given, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'

Given('the user opened the app', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
})

Given('the user was not logged in previously', function () {
  // Fresh page load in prototype mode starts logged-out — nothing to arrange.
})

Then('the header is shown', async function () {
  await this.page.getByText('Login with Google', { exact: true }).waitFor()
  await this.page.getByText('☰').waitFor()
})

// Note: 'the settings panel is shown' is owned by
// screens/layout/settings/step_definitions/settings.steps.ts (same literal
// text, registered once to avoid an ambiguous-step error).

Then('the settings panel is disabled by default until login', async function () {
  const goToDiary = this.page.getByRole('button', { name: 'Go to Diary' })
  assert.strictEqual(await goToDiary.getAttribute('aria-disabled'), 'true')
})

Given('the user closed the app', function () {
  throw new Error('Not implemented yet') // needs app-lifecycle (AppState) simulation
})

Given('did not log out - for any reason including an app crash', function () {
  throw new Error('Not implemented yet')
})

Then('the app will check OAuth if still logged in', function () {
  throw new Error('Not implemented yet')
})

Then('if not will log out and notify of error', function () {
  throw new Error('Not implemented yet')
})

Given('the user has now logged in', function () {
  throw new Error('Not implemented yet') // needs full mock-OAuth popup click-through
})

Then('the hamburger is enabled with the menu items', function (table) {
  throw new Error('Not implemented yet')
})
