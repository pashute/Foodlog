// Filename: settings.steps.js  Version 0.8.0

import { Given, When, Then } from '@cucumber/cucumber'

Then('the settings panel shows the following elements', function (table) {
  throw new Error('Not implemented yet')
})

Then('the timezone choice is disabled with the current system timezone', function () {
  throw new Error('Not implemented yet')
})

Then('the App name and Version are shown in the header only, not in the App info card', function () {
  throw new Error('Not implemented yet')
})

Then('App info, AI API Key, Foodlog sheet, Timezone, and Go to Diary are all disabled until logged in', function () {
  throw new Error('Not implemented yet')
})

Then("each info icon is adjacent to its row's button, after it (Theme has no button, so its icon is at the end of the row)", function () {
  throw new Error('Not implemented yet')
})

Given('the settings panel is shown', function () {
  throw new Error('Not implemented yet')
})

Given('the settings panel is shown and the user is logged in', function () {
  throw new Error('Not implemented yet')
})

Then('the top instruction card shows the idle instruction by default', function () {
  throw new Error('Not implemented yet')
})

When('the user presses and holds the AI API Key info icon', function () {
  throw new Error('Not implemented yet')
})

Then('the top instruction card shows the AI API Key hint', function () {
  throw new Error('Not implemented yet')
})

When('the user presses and holds the Timezone info icon', function () {
  throw new Error('Not implemented yet')
})

Then('the top instruction card shows the Timezone hint', function () {
  throw new Error('Not implemented yet')
})

Then('releasing an info icon reverts the top instruction card to its former instruction', function () {
  throw new Error('Not implemented yet')
})

Then('there is no hover behavior anywhere in the app — press only, like a phone', function () {
  throw new Error('Not implemented yet')
})

Given('the stored AI key is {string}', function (key) {
  throw new Error('Not implemented yet')
})

Then('the AI Key status shows {string}', function (status) {
  throw new Error('Not implemented yet')
})

When('the user presses {string}', function (label) {
  throw new Error('Not implemented yet')
})

Then('the Gemini key dialog is shown with header {string}', function (header) {
  throw new Error('Not implemented yet')
})

Then('the dialog shows numbered steps to get a Gemini API key, each with a screenshot', function () {
  throw new Error('Not implemented yet')
})

Then('a field to paste the key and a SAVE button', function () {
  throw new Error('Not implemented yet')
})

Then('SAVE is disabled until a valid-looking key is entered', function () {
  throw new Error('Not implemented yet')
})

Then('an invalid save attempt shows {string}', function (message) {
  throw new Error('Not implemented yet')
})

Given('Go to Diary is enabled (logged in, AI key OK, sheet ready)', function () {
  throw new Error('Not implemented yet')
})

When('the user presses Go to Diary', function () {
  throw new Error('Not implemented yet')
})

Then('the user is shown the Diary screen', function () {
  throw new Error('Not implemented yet')
})
