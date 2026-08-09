// Filename config.test.js  Version 0.2.0

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { get } from '../../../../src/infrastructure/config/config.js'

test('config module', () => {
  assert.strictEqual(typeof get, 'function')

  try {
    get('app', 'appname')
  } catch (err) {
    throw new Error(`Not implemented: config base data (src/prototype/config.js) is unavailable - ${err.message}`)
  }

  const cases = [
    { section: 'app', key: 'appname', expected: 'success' },
    { section: 'app', key: 'nonexistent', expected: 'fail' },
    { section: 'nonexistent', key: 'appname', expected: 'fail' },
    { section: 'nonexistent', key: 'nonexistent', expected: 'fail' },
    { section: null, key: undefined, expected: 'fail' }, // corrupted/invalid input
  ]

  const results = cases.map(({ section, key, expected }) => {
    const actual = get(section, key)
    const result = actual === undefined ? 'fail' : 'success'
    return { section: String(section), key: String(key), result, expected, ok: result === expected ? 'yes' : 'no' }
  })

  const failures = results.filter((r) => r.ok === 'no')
  if (failures.length) {
    console.table(results)
  }
  assert.strictEqual(failures.length, 0, `${failures.length} case(s) did not behave as expected`)
})
