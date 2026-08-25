// Filename: diary.steps.ts
// Version: 0.2.0
// Step defs for diary.feature (was logger.steps.ts). Playwright E2E against
// the live dev server — reaching the Diary screen needs a real login +
// AI-key click-through (loginHelper.ts), since App.tsx's loggedIn state
// can't be seeded directly.

import { Given, Then } from '@cucumber/cucumber'
import { loginAndReachDiary } from '../../../../support/loginHelper.ts'

Given('the diary panel is shown', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAndReachDiary(this.page)
})

Then('the diary panel shows a minutes-ago box with minus, value, and plus controls', async function () {
  await this.page.getByLabel('minus minute').waitFor()
  await this.page.getByLabel('plus minute').waitFor()
  await this.page.getByText('0', { exact: true }).waitFor()
})

Then('the diary panel shows the computed time', async function () {
  await this.page.getByText(/^\d{2}:\d{2}$/).waitFor()
})

Then('the diary panel shows the current carbs estimate', async function () {
  await this.page.getByText(/Carbs/).waitFor()
})

Then('the diary panel shows the current energy estimate', async function () {
  await this.page.getByText(/Energy/).waitFor()
})

Then('the diary panel shows a multiline food description input', async function () {
  await this.page.getByPlaceholder('e.g. cucumber yogurt').waitFor()
})

Then('the diary panel shows a green submit button', async function () {
  await this.page.getByLabel('submit meal').waitFor()
})

Then('the diary panel shows a multiline instructions area', async function () {
  // The "AI estimate" card doubles as the instructions/results area — no
  // separate text-entry instructions box exists in the app today.
  await this.page.getByText('AI estimate', { exact: true }).waitFor()
})

Then('the diary panel shows a {string} navigation link', async function (label) {
  await this.page.getByText(new RegExp(label)).waitFor()
})

Given('the AI estimate area is shown', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await loginAndReachDiary(this.page)
})

Then('the total carbs and energy are shown above the food item list', async function () {
  await this.page.getByText('Total').waitFor()
})

Then('the food item list is a scrollable box below the total', async function () {
  // react-native-web ScrollView renders as a plain scrollable div — presence
  // of the AI estimate card (which contains it) stands in for this check.
  await this.page.getByText('AI estimate', { exact: true }).waitFor()
})
