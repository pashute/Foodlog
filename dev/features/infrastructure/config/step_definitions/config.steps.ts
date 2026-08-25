// Filename: config.steps.ts  Version 0.2.0

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { appConstants, configDefaults, mockConstants } from '../../../../../src/infrastructure/config/config.ts'
import { initializeConfiguration, loadUserConfiguration, saveUserConfiguration } from '../../../../../src/infrastructure/config/configIo.ts'
import { config } from '../../../../../src/infrastructure/config/configAccess.ts'
import { devStage, isPrototype, platform } from '../../../../../src/infrastructure/environment.ts'
import { KEYS } from '../../../../../src/infrastructure/storage/storage.ts'

Given('the app starts', function () {
  initializeConfiguration()
})

Then('the editable configuration has these metadata values:', function (table) {
  const values = {
    'configuration.app.theme': configDefaults.app.theme,
    'configuration.sheets.sheetName': configDefaults.sheets.sheetName,
    'configuration.sheets.sheetFolder': configDefaults.sheets.sheetFolder,
  }
  for (const row of table.hashes()) {
    assert.strictEqual(values[row.metadata], row.default)
  }
})

Then('application metadata has these constant values:', function (table) {
  const values = {
    'appConstants.appName': appConstants.appName,
    'appConstants.appVersion': appConstants.appVersion,
    'appConstants.urls.googlePrivacy': appConstants.urls.googlePrivacy,
    'appConstants.urls.googleAiStudio': appConstants.urls.googleAiStudio,
    'appConstants.urls.driveSafe': appConstants.urls.driveSafe,
    'appConstants.urls.googleDriveApi': appConstants.urls.googleDriveApi,
    'appConstants.urls.googleSheetsApi': appConstants.urls.googleSheetsApi,
    'appConstants.urls.myDrive': appConstants.urls.myDrive,
    'appConstants.urls.driveFileScope': appConstants.urls.driveFileScope,
    'mockConstants.urls.mockMyDrive': mockConstants.urls.mockMyDrive,
  }
  for (const row of table.hashes()) {
    assert.strictEqual(values[row.metadata], row.default)
  }
})

Then('environment metadata has these values:', function (table) {
  const values = {
    'environment.devStage': devStage,
    'environment.platform': platform,
    'environment.isPrototype()': String(isPrototype()),
  }
  for (const row of table.hashes()) {
    assert.strictEqual(values[row.metadata], row.default)
  }
})

Then('storage metadata has these keys:', function (table) {
  const values = {
    'storage.KEYS.authToken': KEYS.authToken,
    'storage.KEYS.aiApiKey': KEYS.aiApiKey,
    'storage.KEYS.sheetId': KEYS.sheetId,
  }
  for (const row of table.hashes()) {
    assert.strictEqual(values[row.metadata], row.value)
  }
})

Given('a signed-in user previously saved configuration changes', async function () {
  this.usermail = 'saved@example.com'
  await saveUserConfiguration(this.usermail, { app: { theme: 'light' }, sheets: { sheetName: 'Saved', sheetFolder: 'SavedFolder' } })
})

When('that user signs in again', async function () {
  await loadUserConfiguration(this.usermail)
})

Then('the saved configuration is used', function () {
  assert.strictEqual(config().app.theme, 'light')
})
