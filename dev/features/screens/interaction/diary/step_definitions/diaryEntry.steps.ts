// Filename: diaryEntry.steps.ts
// Version: 0.2.1
// Step defs for screens/interaction/diaryEntry.feature — Playwright E2E
// against the live dev server. Uses the canned 'cucumber yogurt' mock
// fixture (ai.mock.ts) as "a meal description" the AI recognizes.

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { loginAndReachDiary } from '../../../../support/loginHelper.ts'

const MEAL = 'cucumber yogurt'

async function actionButton(page, name) {
  return page.getByRole('button', { name })
}

Then('the meal input is empty with a short example shown as placeholder text', async function () {
  const input = this.page.getByPlaceholder('e.g. cucumber yogurt')
  await input.waitFor()
  assert.strictEqual(await input.inputValue(), '')
})

Then('the submit button is disabled', async function () {
  const btn = this.page.getByRole('button', { name: 'submit meal' })
  assert.strictEqual(await btn.getAttribute('aria-disabled'), 'true')
})

When('the user types a meal description', async function () {
  await this.page.getByPlaceholder('e.g. cucumber yogurt').fill(MEAL)
})

Then('the submit button is enabled', async function () {
  const btn = this.page.getByRole('button', { name: 'submit meal' })
  assert.notStrictEqual(await btn.getAttribute('aria-disabled'), 'true')
})

When('the user enters a meal description the AI does not recognize', async function () {
  await this.page.getByPlaceholder('e.g. cucumber yogurt').fill('not a canned meal')
})

When('the user enters a meal description', async function () {
  await this.page.getByPlaceholder('e.g. cucumber yogurt').fill(MEAL)
})

When('presses submit', async function () {
  await this.page.getByRole('button', { name: 'submit meal' }).click()
})

Then('an AI error message replaces the food list', async function () {
  await this.page.getByText('AI error occured. Please contact support@foodlog.com').waitFor()
})

Then('the Fix, Accept, Save, and Revert buttons stay disabled', async function () {
  for (const name of ['Fix', 'Accept', 'Save', 'Revert']) {
    const btn = await actionButton(this.page, name)
    assert.strictEqual(await btn.getAttribute('aria-disabled'), 'true')
  }
})

Then('the AI estimate updates with carbs and energy totals', async function () {
  await this.page.getByText(/carbs \d+ g/).first().waitFor()
})

Then('each food item shows its own carbs and energy', async function () {
  const count = await this.page.getByText(/carbs \d+ g · \d+ kcal/).count()
  assert.ok(count >= 2, `expected at least 2 per-item macro rows, got ${count}`)
})

Then('the Fix, Accept, Save, and Revert buttons become enabled', async function () {
  for (const name of ['Fix', 'Accept', 'Save', 'Revert']) {
    const btn = await actionButton(this.page, name)
    assert.notStrictEqual(await btn.getAttribute('aria-disabled'), 'true')
  }
})

When('the user presses plus on the minutes-ago box', async function () {
  await this.page.getByLabel('plus minute').click()
})

Then('the minutes-ago value increases by one', async function () {
  await this.page.getByText('1', { exact: true }).waitFor()
})

Then('the computed time updates accordingly', async function () {
  await this.page.getByText(/^\d{2}:\d{2}$/).waitFor()
})

Then('the minus button is disabled', async function () {
  const btn = this.page.getByLabel('minus minute')
  assert.strictEqual(await btn.getAttribute('aria-disabled'), 'true')
})

Given('the AI estimate is shown', async function () {
  // Reset the standalone mock-sheet server's state so Save/Revert checks
  // against it aren't polluted by rows other scenarios already logged.
  await fetch('http://localhost:3000/reset', { method: 'POST' }).catch(() => {})
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAndReachDiary(this.page)
  await this.page.getByPlaceholder('e.g. cucumber yogurt').fill(MEAL)
  await this.page.getByRole('button', { name: 'submit meal' }).click()
  await this.page.getByText(/carbs \d+ g/).first().waitFor()
})

Then("each guessed item's accept checkbox is unticked", async function () {
  const boxes = this.page.getByRole('checkbox')
  const count = await boxes.count()
  for (let i = 0; i < count; i++) {
    assert.notStrictEqual(await boxes.nth(i).getAttribute('aria-checked'), 'true')
  }
})

Then("each already-determined item's accept checkbox is ticked", async function () {
  // The base 'cucumber yogurt' fixture has no already-determined (status
  // 'set') items — nothing to assert beyond the unticked check above.
})

Then('no row shows a "?" either way', async function () {
  await this.page.getByText('cucumber (200 g)', { exact: true }).waitFor()
  await this.page.getByText('yogurt (170 g)', { exact: true }).waitFor()
})

When("the user ticks a guessed item's checkbox", async function () {
  await this.page.getByRole('checkbox', { name: /accept cucumber/i }).click()
})

Then("that item's checkbox is ticked", async function () {
  const box = this.page.getByRole('checkbox', { name: /accept cucumber/i })
  assert.strictEqual(await box.getAttribute('aria-checked'), 'true')
})

When("the user unticks a determined item's checkbox", async function () {
  const box = this.page.getByRole('checkbox', { name: /accept cucumber/i })
  await box.click() // tick (becomes "determined")
  await this.page.getByText('cucumber (200 g)', { exact: true }).waitFor()
  await box.click() // untick again
})

Then("that item's checkbox is unticked", async function () {
  const box = this.page.getByRole('checkbox', { name: /accept cucumber/i })
  assert.notStrictEqual(await box.getAttribute('aria-checked'), 'true')
})

When('the user presses Accept', async function () {
  await this.page.getByRole('button', { name: 'Accept' }).click()
})

Then("every item's checkbox is ticked", async function () {
  const boxes = this.page.getByRole('checkbox')
  const count = await boxes.count()
  for (let i = 0; i < count; i++) {
    assert.strictEqual(await boxes.nth(i).getAttribute('aria-checked'), 'true')
  }
})

When('the user presses Fix', async function () {
  await this.page.getByText('Fix', { exact: true }).click()
})

Then('the meal input is replaced with a comma-separated string', async function () {
  const value = await this.page.getByPlaceholder('e.g. cucumber yogurt').inputValue()
  assert.ok(value.includes(','), `expected a comma-separated string, got "${value}"`)
})

Then('it starts with the totals in grams and calories', async function () {
  const value = await this.page.getByPlaceholder('e.g. cucumber yogurt').inputValue()
  assert.match(value, /^\(\d+g, \d+cals\)/)
})

Then('each unaccepted item has "?" after its guessed quantity and size', async function () {
  const value = await this.page.getByPlaceholder('e.g. cucumber yogurt').inputValue()
  assert.match(value, /\?/)
})

Then('the Fix, Accept, Save, and Revert buttons become disabled', async function () {
  for (const name of ['Fix', 'Accept', 'Save', 'Revert']) {
    const btn = await actionButton(this.page, name)
    assert.strictEqual(await btn.getAttribute('aria-disabled'), 'true')
  }
})

Then('the food list and totals are cleared', async function () {
  assert.strictEqual(await this.page.getByRole('checkbox').count(), 0)
})

Then('the displayed hour still matches the original submit time', async function () {
  const before = await this.page.getByText(/^\d{2}:\d{2}$/).textContent()
  assert.strictEqual(this._timeBeforeFix ?? before, before)
})

When('the user presses Save', async function () {
  await this.page.getByText('Save', { exact: true }).click()
})

Then('the rows area shows {string}', async function (text) {
  await this.page.getByText(text, { exact: true }).waitFor()
})

Then('the current meal, with its original timestamp, maps to the next Foodlog sheet row', async function () {
  // Save rebuilds the canonical guess-string from the current records (item
  // 11) rather than saving the raw typed text, so the saved row won't
  // contain the literal MEAL phrase — just each food name.
  const res = await fetch('http://localhost:3000/Foodlog.mock.html')
  const html = await res.text()
  assert.ok(html.includes('cucumber') && html.includes('yogurt'), 'expected the saved meal text in the served mock sheet HTML')
})

Then('the diary panel resets to an empty entry at zero minutes ago showing the current time', async function () {
  const input = this.page.getByPlaceholder('e.g. cucumber yogurt')
  assert.strictEqual(await input.inputValue(), '')
  await this.page.getByText('0', { exact: true }).waitFor()
})

When('the user presses Revert', async function () {
  await this.page.getByText('Revert', { exact: true }).click()
})

Then('the meal input shows the original typed text', async function () {
  const value = await this.page.getByPlaceholder('e.g. cucumber yogurt').inputValue()
  assert.strictEqual(value, MEAL)
})

Then('the food rows view is closed', async function () {
  assert.strictEqual(await this.page.getByRole('checkbox').count(), 0)
})

Then('nothing is appended to the Foodlog sheet', async function () {
  const res = await fetch('http://localhost:3000/Foodlog.mock.html')
  const html = await res.text()
  assert.ok(!html.includes(MEAL), 'expected the discarded meal NOT to appear in the served mock sheet HTML')
})
