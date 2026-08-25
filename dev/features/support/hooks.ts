// Filename: hooks.ts
// Version: 0.2.0

import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from 'playwright'

// Default (5000ms) is too short for Playwright steps that drive a full
// login + navigation click-through (loginHelper.ts) against the live dev
// server.
setDefaultTimeout(20000)

const baseUrl = process.env.BASE_URL || 'http://localhost:8081'

let browser

BeforeAll(async function () {
  browser = await chromium.launch()
})

AfterAll(async function () {
  await browser.close()
})

Before(async function () {
  this.baseUrl = baseUrl
  this.context = await browser.newContext()
  this.page = await this.context.newPage()
})

After(async function () {
  await this.context.close()
})
