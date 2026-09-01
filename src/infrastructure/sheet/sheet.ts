// Filename: sheetAPI.ts
// version 0.2.2

// Sheet module to access and retrieve data from the Foodlog sheet on Google Drive.
// See dev/docs/issues.md (Aug 17 sheet/meal-schema discussion) for the design
// history behind MealRecordStructure/MealTextFormat/MealTextRegex below.

import { isPrototype } from '../environment.ts'
import { appConstants, configuration } from '../config/config.ts'
import { get as storageGet, update as storageUpdate, KEYS } from '../storage/storage.ts'

export const sheetHeaders = ['date', 'dow', 'time', 'carbs', 'calories', 'status', 'meal'] as const

export type SheetField = (typeof sheetHeaders)[number]

export type SheetRow = Record<SheetField, string | number>

export interface FoodlogSheet {
  readonly header: readonly SheetField[]
  readonly rows: readonly SheetRow[]
}

export function createSheet(rows: readonly SheetRow[] = []): FoodlogSheet {
  return {
    header: sheetHeaders,
    rows: [...rows],
  }
}

export function prependSheetRow(sheet: FoodlogSheet, row: SheetRow): FoodlogSheet {
  return createSheet([row, ...sheet.rows])
}

const HEADER = sheetHeaders

// meal record structure. 
export const MealRecordStructure = Object.freeze([
  'item',   // stable id within one analyzed meal
  'name',   // food name, e.g. "cucumber"
  'fguess', // was the food name itself a guess
  'qty',    // quantity, digits only, default "1", up to 2 digits
  'qguess', // was qty a guess
  'unit',   // short size/measure word, up to 3 letters, e.g. "med", "cup"
  'uguess', // was unit a guess
  'type',   // optional qualifier, up to 9 letters, e.g. "heavy", "semisoft"
  'tguess', // type a guess
  'wgt',    // weight (g) for this item at this qty
  'crb',    // carbs (g) for this item at this qty
  'crbPer100', // carbs (g) per 100g/100ml — nutritional density
  'cal',       // energy (kcal) for this item at this qty
  'calPer100', // energy (kcal) per 100g/100ml
])

export function createMealRecord(partial = {}) {
  return {
    item: partial.item ?? 0,
    name: partial.name ?? '',
    fguess: Boolean(partial.fguess),
    qty: (partial.qty || '1').slice(0, 2),
    qguess: Boolean(partial.qguess),
    unit: (partial.unit ?? '').slice(0, 3),
    uguess: Boolean(partial.uguess),
    type: (partial.type ?? '').slice(0, 9),
    tguess: Boolean(partial.tguess),
    wgt: Number(partial.wgt ?? 0),
    crb: Number(partial.crb ?? 0),
    crbPer100: Number(partial.crbPer100 ?? 0),
    cal: Number(partial.cal ?? 0),
    calPer100: Number(partial.calPer100 ?? 0),
  }
}

// ---------------------------------------------------------------------------
// Sheet.MealTextFormat — builds the telegraphic, re-editable string 
// from a list of MealRecordStructure records + totals 
// (same text used for the Fix button's re-editable meal input, 
// and for the AI prompt asking for a summary line). 
// 
// Format: "qty unit [type] foodName (wgt: Xg, crb: Xg, nrg: Xkc)" 
// — [type] present only when non-empty. 
// Up to 3 "?" per record:
//   - qty/unit are mutually exclusive: unit's mark wins if both are guesses,
//     qty only gets one if unit was NOT a guess (i.e. given).
//   - type gets its own mark, independent of qty/unit.
//   - the food name gets its own mark, independent of the others 
// ---------------------------------------------------------------------------
// Records are joined with ",\n" (not just ", ") 
// so the multiline meal textbox naturally breaks onto a new line after each "kc)," 
// — display only:
//   See analyze()'s whitespace normalization in ai.mock.ts/ai.ts: 
//   The AI still treats the whole thing as one input string 
//   regardless of the line breaks.
export function MealTextFormat(records, totalCarbs, totalEnergy) {
  const items = records
    .map((r) => {
      const uMark = r.uguess ? '?' : ''
      const qMark = !r.uguess && r.qguess ? '?' : ''
      const tMark = r.tguess ? '?' : ''
      const fMark = r.fguess ? '?' : ''
      const typeToken = r.type ? ` ${r.type}${tMark}` : ''
      return `${r.qty}${qMark} ${r.unit}${uMark}${typeToken} ${r.name}${fMark} (wgt: ${r.wgt}g, crb: ${r.crb}g, nrg: ${r.cal}kc)`
    })
    .join(',\n')
  return `(${totalCarbs}g, ${totalEnergy}cals), ${items}`
}

// Sheet.MealTextRegex — validates a MealTextFormat string: 
// well-formed records, 
// and never more than one "?" between a record's qty and unit
// (the only mutually-exclusive pair — type and foodName marks are each
// independent, they can both have "?"). 
// Unit/type/name exclude "?" from their own character classes 
// so a stray "?" is always captured by its own mark group, 
// never silently absorbed into the word next to it.
const ONE_RECORD =
  '(\\d+)(\\??) ([^\\s?]*)(\\??)(?: ([^\\s?()]+)(\\??))? ([^(),?]+?)(\\??) \\(wgt: (\\d+)g, crb: (\\d+)g, nrg: (\\d+)kc\\)'
const RECORD_RE = new RegExp(ONE_RECORD, 'g')
export const MealTextRegex = new RegExp(`^\\(\\d+g, \\d+cals\\), ${ONE_RECORD}(,\\s+${ONE_RECORD})*$`)

export function isValidMealText(text) {
  if (!MealTextRegex.test(text)) return false
  for (const match of text.matchAll(RECORD_RE)) {
    const [, , qMark, , uMark] = match
    if (qMark === '?' && uMark === '?') return false // qty/unit never both
  }
  return true
}

// Sheet.parseMealText — the inverse of MealTextFormat: pulls {qty, unit,
// type, name} plus each field's "?" mark back out of an already-formatted
// (or resubmitted) meal string. Used to recover what the raw typed text
// literally said when a Fix string is resubmitted (the "original record"
// comparison in diaryEntry.ts, which treats a still-marked field as NOT
// given — a "?" is the app's own signal that the value isn't confirmed,
// even though it's present in the text) — returns [] if the text isn't in
// this telegraphic shape at all (plain free-form text like "cucumber yogurt").
export function parseMealText(text) {
  return [...text.matchAll(RECORD_RE)].map((m) => ({
    qty: m[1],
    qMarked: m[2] === '?',
    unit: m[3],
    uMarked: m[4] === '?',
    type: m[5] ?? '',
    tMarked: m[6] === '?',
    name: m[7],
    fMarked: m[8] === '?',
  }))
}

// ---------------------------------------------------------------------------
// Real (non-prototype) Sheets/Drive access. Fixed location in the user's
// Drive: `<sheet-path>` from config (default "FoodlogApp/Foodlog") — checks
// whether the folder and sheet exist, creates whichever is missing, then
// remembers the sheet id in secure storage so later loads don't need to
// search again. `drive.file` OAuth scope is sufficient since the app only
// ever touches files/folders it creates itself.
// ---------------------------------------------------------------------------
const DRIVE_API = appConstants.urls.googleDriveApi
const SHEETS_API = appConstants.urls.googleSheetsApi
const FOLDER_MIME = 'application/vnd.google-apps.folder'
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet'

async function _authedFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Drive/Sheets API request failed: ${res.status} ${url}`)
  return res.json()
}

async function _findByName(name, parentId, token) {
  const q = encodeURIComponent(
    `name='${name}' and '${parentId ?? 'root'}' in parents and trashed=false`
  )
  const json = await _authedFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`, token)
  return json.files?.[0]?.id ?? null
}

async function _createFolder(name, parentId, token) {
  const json = await _authedFetch(`${DRIVE_API}/files?fields=id`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: parentId ? [parentId] : undefined }),
  })
  return json.id
}

async function _createSheet(name, parentId, token) {
  const created = await _authedFetch(`${SHEETS_API}?fields=spreadsheetId`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: name },
      sheets: [{
        data: [{
          rowData: [{ values: HEADER.map((value) => ({ userEnteredValue: { stringValue: value } })) }],
        }],
      }],
    }),
  })
  // A sheet created via the Sheets API lands in "My Drive" root — move it
  // into the FoodlogApp folder so `_findByName` finds it next time.
  if (parentId) {
    await _authedFetch(
      `${DRIVE_API}/files/${created.spreadsheetId}?addParents=${parentId}&fields=id`,
      token,
      { method: 'PATCH' }
    )
  }
  return created.spreadsheetId
}

// NOTE: no check for isLoggedIn(). Will fail if access to sheet denied. 
async function _existsOrCreate() {
  const storedId = await Promise.resolve(storageGet(KEYS.sheetId))
  const link = (id) => `${appConstants.urls.myDrive}/${id}/edit`
  if (storedId) {
    return { id: storedId, name: 'Foodlog', link: link(storedId), header: HEADER, rows: [] }
  }

  const token = await Promise.resolve(storageGet(KEYS.authToken))
  const { sheetFolder: folderName, sheetName } = configuration.sheets

  let folderId = await _findByName(folderName, null, token)
  if (!folderId) folderId = await _createFolder(folderName, null, token)

  let sheetId = await _findByName(sheetName, folderId, token)
  if (!sheetId) sheetId = await _createSheet(sheetName, folderId, token)

  await storageUpdate(KEYS.sheetId, sheetId)
  return { id: sheetId, name: sheetName, link: link(sheetId), header: HEADER, rows: [] }
}

async function _save(mealData) {
  const sheet = await _existsOrCreate()
  const token = await Promise.resolve(storageGet(KEYS.authToken))
  const row = HEADER.map((key) => mealData[key] ?? '')
  await _authedFetch(`${SHEETS_API}/${sheet.id}/values/A2:append?valueInputOption=RAW`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  })
  return sheet
}

// returns a promise
export async function existsOrCreate() {
  if (!isPrototype()) return _existsOrCreate()
  const sheetMock = await import('../../prototype/sheet.mock.ts')
  return Promise.resolve({
    ...sheetMock.existsOrCreate(),
    name: configuration.sheets.sheetName,
    link: sheetMock.link(),
  })
}

export async function save(mealData) {
  if (!isPrototype()) return _save(mealData)
  const sheetMock = await import('../../prototype/sheet.mock.ts')
  return Promise.resolve(sheetMock.log(mealData))
}

export async function link() {
  if (!isPrototype()) return _realExistsOrCreate().then((s) => s.link)
  const sheetMock = await import('../../prototype/sheet.mock.ts')
  return Promise.resolve(sheetMock.link())
}
