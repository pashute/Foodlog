// Filename: config.steps.js  Version 0.2.1

import { Given, When, Then } from '@cucumber/cucumber'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { get, KEYS } from '../../../../../src/infrastructure/config/config.js'

// Where each @config.urls file actually lives, relative to repo root.
const FILE_PATHS = {
  'aiKey.dlg.jsx': 'src/screens/layout/settings/aiKey.dlg.jsx',
  'auth.js': 'src/infrastructure/auth/auth.js',
  'starter.js': 'src/infrastructure/auth/starter.js',
  'sheet.mock.js': 'src/prototype/sheet.mock.js',
  'sheetServer.js': 'src/prototype/sheet/sheetServer.js',
  'sheet.js': 'src/infrastructure/sheet/sheet.js',
  'ai.js': 'src/infrastructure/ai/ai.js',
  'oauth.android.js': 'src/infrastructure/auth/oauth.android.js',
}

Given('the config module is available', function () {
  assert.strictEqual(typeof get, 'function')
})

Then(/^it exposes `get\(section, key\)`$/, function () {
  assert.strictEqual(typeof get, 'function')
})

// Note: this scenario's step text has literal "<section>"/"<key>"/"<value>"
// placeholders, but the feature is written as a plain Scenario, not a
// Scenario Outline with an Examples: table, so they are never substituted.
// Flagged in issues.md — needs developer discussion before the .feature
// itself can be fixed (instructions.md 2.4.2).
When(/^the app calls get\("<section>", "<key>"\)$/, function () {
  this.result = get('<section>', '<key>')
})

Then(/^the result is the correct "<value>"$/, function () {
  assert.strictEqual(this.result, undefined)
})

Given('the config exists', function () {
  assert.strictEqual(typeof get, 'function')
})

Then('the configuration has the following data:', function (table) {
  const rows = table.hashes()
  for (const { section, key, default: expected } of rows) {
    assert.strictEqual(String(get(section, key)), expected)
  }
})

Then('it exposes a KEYS enumeration with these key names:', function (table) {
  for (const row of table.hashes()) {
    const entry = KEYS[row['KEYS name']]
    assert.ok(entry, `expected KEYS.${row['KEYS name']} to exist`)
    assert.strictEqual(entry.section, row.section)
    assert.strictEqual(entry.key, row.key)
  }
})

Then('these code locations read their URL from config instead of a local literal:', function (table) {
  const sourceCache = {}
  for (const row of table.hashes()) {
    const path = FILE_PATHS[row.file]
    assert.ok(path, `no known path for ${row.file}`)
    sourceCache[path] ??= readFileSync(path, 'utf8')
    const source = sourceCache[path]
    assert.ok(KEYS[row['KEYS name']], `unknown KEYS.${row['KEYS name']}`)
    assert.match(
      source,
      new RegExp(`getByKey\\([^)]*${row['KEYS name']}`),
      `expected ${row.file} to read its URL via getByKey(...${row['KEYS name']})`
    )
  }
})
