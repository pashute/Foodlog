// Filename config.test.ts  Version 0.2.1

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appConstants, configDefaults } from '../../../../src/infrastructure/config/config.ts'
import { config, loadConfiguration } from '../../../../src/infrastructure/config/configAccess.ts'
import { loadUserConfiguration, saveUserConfiguration } from '../../../../src/infrastructure/config/configIo.ts'

test('config module', () => {
  assert.strictEqual(appConstants.appName, 'Foodlog')
  assert.match(appConstants.appVersion, /^\d+\.\d+\.\d+$/)
  assert.ok(['light', 'dark'].includes(config().app.theme))
  assert.ok(config().sheets.sheetName)
  assert.ok(config().sheets.sheetFolder)
})

test('config initializes with the default values', () => {
  loadConfiguration()
  assert.deepStrictEqual(config(), configDefaults)
})

test('config persists the editable theme for a user', async () => {
  const usermail = 'config-test@example.com'
  await saveUserConfiguration(usermail, {
    app: { theme: 'light' },
    sheets: { sheetName: 'Foodlog', sheetFolder: 'Foodlogs' },
  })

  loadConfiguration({ app: { theme: 'dark' }, sheets: { sheetName: 'Foodlog', sheetFolder: 'Foodlogs' } })
  await loadUserConfiguration(usermail)
  assert.strictEqual(config().app.theme, 'light')
})
