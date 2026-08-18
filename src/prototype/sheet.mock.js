// Filename sheet.mock.js  Version 0.1.4

// Mock Foodlog sheet (prototype stage). In-memory spreadsheet object.
// Mirrors the real branch's contract: sheet id lives in secure storage
// (KEYS.sheetId) — empty until the sheet is first loaded, cleared on logout
// (auth.js's logout() already removes it) — see sheets.feature's
// @sheets.idLifecycle scenario.

import { get as storageGet, update as storageUpdate, remove as storageRemove, KEYS } from '../infrastructure/storage/storage.js'
import { getByKey, KEYS as CONFIG_KEYS } from '../infrastructure/config/config.js'

const HEADER = ['date', 'dow', 'time', 'carbs', 'status', 'meal']
const MOCK_BASE = getByKey(CONFIG_KEYS.keyUrlSheetMock)

let sheet = null

export function existsOrCreate() {
  if (sheet) {
    return sheet
  }
  const storedId = storageGet(KEYS.sheetId)
  const id = storedId || 'abcd12345'
  if (!storedId) storageUpdate(KEYS.sheetId, id)
  sheet = {
    id,
    name: 'Foodlog',
    link: `${MOCK_BASE}/Foodlog.mock.html`,
    header: HEADER,
    rows: [],
  }
  return sheet
}

export function log(mealData) {
  if (!sheet) {
    existsOrCreate()
  }
  sheet.rows.unshift(mealData)
  _syncToServer(mealData)
  return sheet
}

// Best-effort sync to the standalone sheetServer.js process (started
// separately via `npm run mock:sheet-server`) so the served mock HTML page
// reflects entries saved from the browser. sheetServer.js runs in its own
// Node process with its own module instance, so it can't see this module's
// in-memory `sheet` directly — this is the only bridge between them. Silent
// no-op if the server isn't running, fetch isn't available (unit tests), or
// this code is running server-side (sheetServer.js itself imports this same
// module to handle POST /log — without the browser check, its own log()
// call would fetch itself, unshifting the same row forever).
function _syncToServer(mealData) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return
  fetch(`${MOCK_BASE}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mealData),
  }).catch(() => {})
}

export function idToLink(id) {
  return `${MOCK_BASE}/Foodlog.mock.html?id=${id}`
}

export function reset() {
  sheet = null
  storageRemove(KEYS.sheetId)
}
