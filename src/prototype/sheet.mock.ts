// Filename sheet.mock.ts  Version 0.2.1

// Mock Foodlog sheet (prototype stage). In-memory spreadsheet object.
// Mirrors the real branch's contract: sheet id lives in secure storage
// (KEYS.sheetId) — empty until the sheet is first loaded, cleared on logout
// (auth.ts's logout() already removes it) — see sheets.feature's
// @sheets.idLifecycle scenario.

import { mockConstants } from '../infrastructure/config/config.ts'
import { sheetHeaders } from '../infrastructure/sheet/sheet.ts'

const MOCK_BASE = mockConstants.urls.mockMyDrive

let sheet: { header: readonly string[]; rows: unknown[] } | null = null
let sheetId: string | undefined

export function existsOrCreate() {
  if (sheet) {
    return sheet
  }
  sheetId ??= 'mock-sheet-id'
  sheet = {
    header: sheetHeaders,
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

// Best-effort sync to the standalone sheetServer.ts process (started
// separately via `npm run mock:sheet-server`) so the served mock HTML page
// reflects entries saved from the browser. sheetServer.ts runs in its own
// Node process with its own module instance, so it can't see this module's
// in-memory `sheet` directly — this is the only bridge between them. Silent
// no-op if the server isn't running, fetch isn't available (unit tests), or
// this code is running server-side (sheetServer.ts itself imports this same
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
  return `${MOCK_BASE}/${id}`
}

export function link() {
  return idToLink(sheetId ?? 'mock-sheet-id')
}

export function reset() {
  sheet = null
  sheetId = undefined
}
