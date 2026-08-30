// Filename: config.steps.ts  Version 0.2.1

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { appConstants, configDefaults } from '../../../../../src/infrastructure/config/config.ts'
import { initializeConfiguration, loadUserConfiguration, saveUserConfiguration } from '../../../../../src/infrastructure/config/configIo.ts'
import { config } from '../../../../../src/infrastructure/config/configAccess.ts'
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
    if (row.metadata === 'appConstants.appVersion') {
      assert.strictEqual(row.default, 'major.minor.patch')
      assert.match(appConstants.appVersion, /^\d+\.\d+\.\d+$/)
      continue
    }
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
    'appConstants.urls.googleGeminiApi': appConstants.urls.googleGeminiApi,
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
    'storage.KEYS.usermail': KEYS.usermail,
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
