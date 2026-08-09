import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber'
import { chromium } from 'playwright'

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
