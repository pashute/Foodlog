// Filename sheets.steps.ts  Version 0.2.1

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { createSheet, sheetHeaders } from '../../../../../src/infrastructure/sheet/sheet.ts'
import * as sheetMock from '../../../../../src/prototype/sheet.mock.ts'

Then('the Foodlog sheet has this header order:', function (table) {
  assert.deepStrictEqual([...sheetHeaders], table.raw()[0])
})

Then('each Foodlog sheet row uses those fields', function () {
  const sheet = createSheet([{ date: '2026/08/24', dow: 'Sun', time: '10:00', carbs: 1, calories: 1, status: 'set', meal: 'test' }])
  assert.deepStrictEqual(Object.keys(sheet.rows[0]), [...sheetHeaders])
})

// Note: 'the user logs out' is owned by
// infrastructure/oauth/step_definitions/oauth.steps.ts (same literal text,
// registered once to avoid an ambiguous-step error — it does a full mock
// login then auth.logout(), which already clears KEYS.sheetId).
