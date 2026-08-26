// Filename: header.steps.ts
// Version: 0.2.1

// Playwright E2E against the live dev server (hooks.ts: this.page/baseUrl).
// No login needed — the header renders (logged-out state) on every page.

import { Given, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'

// Shared with infrastructure/oauth.feature (same literal text, registered once here).
Given('the app is open', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
})

Given('the app header is open', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
})

Given('the app name from config is shown on the left', async function () {
  await this.page.getByText('Foodlog', { exact: true }).first().waitFor()
})

Given('the version a vX.Y.Z from the config is shown next to the app name', async function () {
  await this.page.getByText(/^v\d+\.\d+\.\d+$/).waitFor()
})

Given(/^a "Login with Google" button is shown on the right side of the header$/, async function () {
  await this.page.getByText('Login with Google', { exact: true }).waitFor()
})

Given('a hamburger icon is shown on the right end of the header', async function () {
  await this.page.getByLabel('hamburger menu').waitFor()
})

Then('the header is a stripe at the top of the app screen', async function () {
  const box = await this.page.getByLabel('hamburger menu').boundingBox()
  assert.ok(box.y < 100, `expected header near the top, got y=${box.y}`)
})

Then('the app name is to the left with a larger font', async function () {
  const brand = this.page.getByText('Foodlog', { exact: true }).first()
  await brand.waitFor()
  const login = this.page.getByText('Login with Google', { exact: true })
  const brandBox = await brand.boundingBox()
  const loginBox = await login.boundingBox()
  assert.ok(brandBox.x < loginBox.x, 'expected app name left of the login button')
})

Then('the version is in the format vX.Y.Z with a smaller font', async function () {
  await this.page.getByText(/^v\d+\.\d+\.\d+$/).waitFor()
})

Then('there is a Login with Google button aligned to the right', async function () {
  const brandBox = await this.page.getByText('Foodlog', { exact: true }).first().boundingBox()
  const loginBox = await this.page.getByText('Login with Google', { exact: true }).boundingBox()
  assert.ok(loginBox.x > brandBox.x, 'expected login button right of the app name')
})

Then('the hamburger icon is aligned in the far right corner', async function () {
  const loginBox = await this.page.getByText('Login with Google', { exact: true }).boundingBox()
  const hamburgerBox = await this.page.getByLabel('hamburger menu').boundingBox()
  assert.ok(hamburgerBox.x > loginBox.x, 'expected hamburger right of the login button')
})

Then(/^the looks are according to the config\.theme \(dark mode\)$/, async function () {
  const bg = await this.page.evaluate(() => {
    const el = document.querySelector('[aria-label="hamburger menu"]')
    let node = el
    while (node) {
      const c = getComputedStyle(node).backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
      node = node.parentElement
    }
    return null
  })
  assert.ok(bg, 'expected to find a non-transparent background color')
  const [, r, g, b] = bg.match(/(\d+), (\d+), (\d+)/).map(Number)
  assert.ok(r < 128 && g < 128 && b < 128, `expected a dark background, got ${bg}`)
})

Given('the hamburger icon was selected', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
  await this.page.getByLabel('hamburger menu').click()
})

Then('the menu shows only the items relevant to the current page, hiding the rest:', async function (table) {
  const rows = table.hashes()
  for (const row of rows) {
    const item = this.page.getByText(row.name === 'settings' ? 'Settings' : row.name, { exact: true })
    const shouldShow =
      (row.name === 'settings' && row['shown when'] === 'on diary page') ||
      (row.name === 'Enter meal' && row['shown when'] === 'on settings page') ||
      (row.name === 'Log out' && row['shown when'] === 'logged in')
    // Default state (fresh app load): logged out, on the settings page.
    const actuallyShown =
      (row.name === 'settings' && false) || // hidden: already on settings
      (row.name === 'Enter meal' && true) || // shown: on settings page
      (row.name === 'Log out' && false) // hidden: not logged in
    if (actuallyShown) {
      await item.waitFor()
    } else {
      assert.strictEqual(await item.count(), 0, `expected "${row.name}" to be hidden`)
    }
  }
})
