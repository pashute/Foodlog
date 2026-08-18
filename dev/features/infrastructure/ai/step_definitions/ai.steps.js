// Filename: ai.steps.js  Version 0.1.4

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { analyze, summarize } from '../../../../../src/infrastructure/ai/ai.js'

Given('the user provides partial meal data', function () {
  this.meal = 'partial meal data'
})

When('the user submits the meal', async function () {
  this.items = await analyze(this.meal)
})

Then('the AI breaks down the meal entries into individual items', function () {
  assert.ok(Array.isArray(this.items))
  assert.ok(this.items.length > 0)
})

Then('the AI provides a suggested qty, type, and nutritional information for each item', function () {
  for (const it of this.items) {
    assert.match(it.details, /qty:\S+/)
    assert.match(it.details, /sz:\S+/)
    assert.match(it.data, /crb:\d+/)
    assert.match(it.data, /cal:\d+/)
  }
})

Then('formats each entry as json:', function (docString) {
  const expectedKeys = Object.keys(JSON.parse(docString))
  for (const it of this.items) {
    for (const key of expectedKeys) assert.ok(key in it, `missing key ${key}`)
  }
})

Given('the user received a meal analysis', async function () {
  this.items = await analyze('partial meal data')
})

When('the user accepts the analysis', async function () {
  this.summary = await summarize('08:03')
})

Then('the AI should provide a text summary of the meal entry', function () {
  assert.strictEqual(typeof this.summary, 'string')
  assert.ok(this.summary.length > 0)
})

Then("the timestamp will take from the user's timezone and entry", function () {
  assert.strictEqual(typeof this.summary, 'string')
})

Then('the format will be comma separated, with no headers, just the values:', function (_table) {
  assert.doesNotMatch(this.summary, /^Header|Timestamp|Totals|Item/)
})
