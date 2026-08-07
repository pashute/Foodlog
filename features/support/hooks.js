import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber'
import { chromium } from 'playwright'
import { createServer } from 'vite'

let viteServer
let browser
let baseUrl

BeforeAll(async function () {
  viteServer = await createServer({ server: { port: 0 }, logLevel: 'error' })
  await viteServer.listen()
  const address = viteServer.httpServer.address()
  baseUrl = `http://localhost:${address.port}`
  browser = await chromium.launch()
})

AfterAll(async function () {
  await browser.close()
  await viteServer.close()
})

Before(async function () {
  this.baseUrl = baseUrl
  this.context = await browser.newContext()
  this.page = await this.context.newPage()
})

After(async function () {
  await this.context.close()
})
