// Filename: phonePanel.steps.ts  Version 0.2.0

// Playwright E2E against the live dev server (hooks.ts: this.page/baseUrl).
// @phonePanel.native ("running on Android/iOS") can't be driven from a
// browser at all — no native device/simulator in this test tier — left as
// a documented stub, not faked.

import { Given, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'

Given('the app is running on the web platform', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' })
})

// Walks up from a known-rendered element (the app name) to find the
// PhonePanel's outer frame — the ancestor with a visible border-radius.
async function findPhoneFrame(page) {
  return page.evaluate(() => {
    let node = [...document.querySelectorAll('div')].find((el) => el.textContent === 'Foodlog')
    while (node) {
      const style = getComputedStyle(node)
      if (parseFloat(style.borderRadius) > 0 && parseFloat(style.borderWidth) > 0) {
        return {
          borderRadius: style.borderRadius,
          borderWidth: style.borderWidth,
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
        }
      }
      node = node.parentElement
    }
    return null
  })
}

Then('the app content is wrapped in a fixed-size phone-shaped panel', async function () {
  this.phoneFrame = await findPhoneFrame(this.page)
  assert.ok(this.phoneFrame, 'expected to find a phone-shaped panel ancestor')
  assert.ok(this.phoneFrame.width < 500, `expected a fixed narrow width, got ${this.phoneFrame.width}`)
})

Then('the panel has rounded corners and a border like a device frame', async function () {
  const frame = this.phoneFrame ?? (await findPhoneFrame(this.page))
  assert.ok(parseFloat(frame.borderRadius) > 0)
  assert.ok(parseFloat(frame.borderWidth) > 0)
})

Then('the page background behind the panel is dark', async function () {
  const bg = await this.page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  // body itself may be transparent (theme host paints it) — check the
  // outermost app View instead, which sets an explicit dark backgroundColor.
  const appBg = await this.page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((n) => n.textContent === 'Foodlog')
    let node = el
    while (node) {
      const c = getComputedStyle(node).backgroundColor
      if (c && c !== 'rgba(0, 0, 0, 0)') return c
      node = node.parentElement
    }
    return bg
  })
  const [, r, g, b] = appBg.match(/(\d+), (\d+), (\d+)/).map(Number)
  assert.ok(r < 128 && g < 128 && b < 128, `expected a dark background, got ${appBg}`)
})

Given('the app is running on Android or iOS', function () {
  throw new Error('Not implemented yet') // no native device/simulator in this test tier
})

Then('the app content fills the screen with no phone panel wrapper', function () {
  throw new Error('Not implemented yet')
})
