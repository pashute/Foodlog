// Filename config.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appConstants } from '../../../../src/infrastructure/config/config.ts'
import { config } from '../../../../src/infrastructure/config/configAccess.ts'

test('config module', () => {
  assert.strictEqual(appConstants.appName, 'Foodlog')
  assert.strictEqual(appConstants.appVersion, '1.0.0')
  assert.ok(['light', 'dark'].includes(config().app.theme))
  assert.ok(config().sheets.sheetName)
  assert.ok(config().sheets.sheetFolder)
})
