// Filename: diaryEntry.ts
// Version: 0.2.1
// Diary entry logic (plain JS, no JSX) — everything Diary.tsx needs that
// isn't a React hook or a render. See dev/docs/issues.md (Aug 17/18 sheet/
// meal-schema discussion) for why this was split out of the component, and
// for the qty/unit/type 3-field model confirmed Aug 18.
//
// workflow (headlines only):
//   init:      meal textbox placeholder: e.g. cucumber yogurt
//   submit:    result:
//                carbs and energy totals
//                food record list: qty unit [type] foodname
//                  (wgt: Xg, crb: Xg, nrg: Xkc), comma between foods
//                spills onto more than one line in the multiline text;
//                  breaks after "kc),"
//                type omitted if not needed (no guess, nothing given)
//   guess detection (Aug 19 rework): each record also carries an
//     "original" — what the raw typed text literally said for that food
//     (qty '0'/unit ''/type '' when not given, name as typed) — every
//     field (qty/unit/type/name) is a "guess" whenever it's missing from
//     or differs from the original. The accept checkbox starts checked
//     only when NO field is a guess; edits live-recompute which fields are
//     guessed against the stored original.
//   checkbox:  accepted = no marks at all when Fix/Save build the string,
//              regardless of what's guessed; unaccepted = marks only on
//              the fields that are actually guessed
//   qty/unit:  editable per record, digits-only / letter-max; qty edits
//              proportionally rescale wgt/crb/cal
//   Fix:       records -> MealTextFormat string, back into the meal textbox
//   Save:      records -> Foodlog sheet row, rows area shows "Meal saved"
//   Revert:    restores the original typed text, nothing saved

import { analyze, learnFromRecord } from '../../infrastructure/ai/ai.ts'
import { log as sheetLog } from '../../infrastructure/sheet/sheet.ts'
import { createMealRecord, MealTextFormat, parseMealText } from '../../infrastructure/sheet/sheet.ts'

export const QTY_MAX_LEN = 2
export const UNIT_MAX_LEN = 3
export const TYPE_MAX_LEN = 9

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

function parseMacros(dataStr) {
  const crb = Number(dataStr.match(/crb:(\d+)/)?.[1] ?? 0)
  const cal = Number(dataStr.match(/cal:(\d+)/)?.[1] ?? 0)
  const wgt = Number(dataStr.match(/wgt:(\d+)/)?.[1] ?? 0)
  return { crb, cal, wgt }
}

// "sz" (size) maps to the record's `unit` field; the optional "tp"
// (type/qualifier, e.g. "heavy", "spelt") is new for the 3-field model —
// absent from most fixtures, since it's an occasional qualifier, not
// always present.
function parseDetails(detailsStr) {
  const qty = (detailsStr.match(/qty:([^,]+)/)?.[1]?.trim() || '1').slice(0, QTY_MAX_LEN)
  const unit = (detailsStr.match(/sz:([^,]+)/)?.[1]?.trim() ?? '').slice(0, UNIT_MAX_LEN)
  const type = (detailsStr.match(/tp:([^,]+)/)?.[1]?.trim() ?? '').slice(0, TYPE_MAX_LEN)
  return { qty, unit, type }
}

// Adapts one AI-response item (ai.ts/ai.mock.ts's wire shape: item/status/
// name/details/data) into a MealRecordStructure record. Guess flags aren't
// set here — submitMeal() derives them from the original-record comparison.
export function toMealRecord(aiItem) {
  const { qty, unit, type } = parseDetails(aiItem.details)
  const { crb, cal, wgt } = parseMacros(aiItem.data)
  return createMealRecord({
    item: aiItem.item,
    name: aiItem.name,
    qty,
    unit,
    type,
    wgt,
    crb,
    crbPer100: wgt ? Math.round((crb * 100) / wgt) : 0,
    cal,
    calPer100: wgt ? Math.round((cal * 100) / wgt) : 0,
  })
}

// Heuristic original-record for free-form text ("cucumber yogurt"): the
// food name is whatever word in the raw text matched the AI's item name;
// a number immediately before it is the qty; a non-numeric word before
// that is the unit. Anything not found stays at the "not given" sentinel
// (qty '0', unit/type ''). Multi-word food names aren't split out — good
// enough for the single-word fixtures this app deals with today.
function heuristicOriginal(rawText, aiItem) {
  const words = rawText.toLowerCase().split(/[\s,]+/).filter(Boolean)
  const nameLower = aiItem.name.toLowerCase()
  const idx = words.findIndex((w) => w === nameLower)
  if (idx === -1) return { qty: '0', unit: '', type: '', name: aiItem.name }
  const prev1 = words[idx - 1] ?? ''
  const qty = /^\d+$/.test(prev1) ? prev1 : '0'
  const prev2 = words[idx - 2] ?? ''
  const unit = qty !== '0' && prev2 && !/^\d+$/.test(prev2) ? prev2.slice(0, UNIT_MAX_LEN) : ''
  return { qty, unit, type: '', name: words[idx] }
}

// Structured original-record for a resubmitted Fix string ("(14g, ...), 1
// med? cucumber (wgt: ...)"): parseMealText pulls qty/unit/type/name back
// out along with each field's "?" mark — a still-marked field means the
// text itself doesn't claim that value is confirmed, so it maps to the
// "not given" sentinel just like an omitted field would.
function toOriginal(structuredRecord) {
  const { qty, qMarked, unit, uMarked, type, tMarked, name, fMarked } = structuredRecord
  return {
    qty: qMarked ? '0' : qty,
    unit: uMarked ? '' : unit,
    type: tMarked ? '' : type,
    name: fMarked ? '' : name,
  }
}

function buildOriginalRecords(rawText, aiItems) {
  const structured = parseMealText(rawText)
  if (structured.length === aiItems.length) return structured.map(toOriginal)
  return aiItems.map((item) => heuristicOriginal(rawText, item))
}

// "not given" sentinel: qty '0' (vs. the real default '1'), empty string
// for unit/type. A field is a guess if it's missing from the original
// (AI produced something the raw text didn't say) or differs from what
// was literally given.
function fieldGuessed(currentVal, originalVal) {
  const given = originalVal !== '' && originalVal !== '0'
  if (!given) return currentVal !== '' && currentVal !== '0'
  return String(currentVal).toLowerCase() !== String(originalVal).toLowerCase()
}

function diffFlags(current, original) {
  return {
    qguess: fieldGuessed(current.qty, original.qty),
    uguess: fieldGuessed(current.unit, original.unit),
    tguess: fieldGuessed(current.type, original.type),
    fguess: fieldGuessed(current.name, original.name),
  }
}

// Re-derives qguess/uguess/tguess/fguess against the record's stored
// original — call after any qty/unit/type edit so the row's guess status
// always reflects its current values, not just what the AI first returned.
export function recomputeGuessFlags(record) {
  if (!record._original) return record
  return { ...record, ...diffFlags(record, record._original) }
}

export function nforceQtyDigits(value) {
  return (value.replace(/\D/g, '') || '1').slice(0, QTY_MAX_LEN)
}

export function nforceMaxlen(value, maxLen) {
  return value.slice(0, maxLen)
}

// Proportional recalc (item 9.3, Aug 18 20:50 batch): editing qty rescales
// wgt/crb/cal using the record's own crbPer100/calPer100 density — unit and
// type edits don't carry a numeric conversion, so they don't change the
// numbers. Deterministic stand-in until a real AI re-analysis call exists.
export function recalcForQty(record, newQtyStr) {
  const newQty = Number(newQtyStr) || 1
  const oldQty = Number(record.qty) || 1
  const wgt = Math.round((record.wgt / oldQty) * newQty)
  return {
    wgt,
    crb: Math.round((record.crbPer100 * wgt) / 100),
    cal: Math.round((record.calPer100 * wgt) / 100),
  }
}

export function totals(records) {
  return {
    carbs: records.reduce((sum, r) => sum + r.crb, 0),
    energy: records.reduce((sum, r) => sum + r.cal, 0),
  }
}

// Single checkbox per record — a manual override on top of the per-field
// guess flags. Ticking/the Accept button only ever flips `accepted`; the
// underlying qguess/uguess/tguess/fguess stay whatever recomputeGuessFlags
// last derived (effectiveGuessFlags, below, is what actually suppresses
// marks when accepted is true).
export function withAccepted(record, accepted) {
  return { ...record, accepted }
}

export async function submitMeal(mealText) {
  const result = await analyze(mealText)
  const originals = buildOriginalRecords(mealText, result)
  return result.map((aiItem, i) => {
    const record = toMealRecord(aiItem)
    const original = originals[i]
    const flags = diffFlags(record, original)
    const accepted = !(flags.qguess || flags.uguess || flags.tguess || flags.fguess)
    return { ...record, ...flags, accepted, _original: original }
  })
}

// accepted (checked) suppresses all marks regardless of what's actually
// guessed — "take all from row, no guess marked" (item 9). Unaccepted
// records keep their live-recomputed per-field marks.
function effectiveGuessFlags(record) {
  if (record.accepted) return { qguess: false, uguess: false, tguess: false, fguess: false }
  return { qguess: record.qguess, uguess: record.uguess, tguess: record.tguess, fguess: record.fguess }
}

export function buildFixString(records, totalCarbs, totalEnergy) {
  const effective = records.map((r) => ({ ...r, ...effectiveGuessFlags(r) }))
  return MealTextFormat(effective, totalCarbs, totalEnergy)
}

// "diary save scenario — ai should add record to pattern recog context":
// every accepted record's qty/unit feeds back into the AI's pattern
// context (learnFromRecord), same session-only style as the sheet's own
// in-memory persistence.
export async function saveToSheet({ entryTimestamp, totalCarbs, hasGuesses, mealText, records = [] }) {
  const sheet = await Promise.resolve(
    sheetLog({
      date: entryTimestamp.toLocaleDateString(),
      dow: entryTimestamp.toLocaleDateString([], { weekday: 'short' }),
      time: formatTime(entryTimestamp),
      carbs: totalCarbs,
      status: hasGuesses ? 'guess' : 'set',
      meal: mealText,
    })
  )
  await Promise.all(records.filter((r) => r.accepted).map((r) => learnFromRecord(r)))
  return sheet
}

// diaryError — maps a caught real-path error (ai.ts/sheet.ts) to a short,
// user-facing headline for Diary.tsx's estimate-card error area. Looks up
// `.type` first (set by ai.ts's _callGemini for network/ai failures), then
// falls back to matching known message shapes (sheet.ts's Drive/Sheets
// fetch failures aren't typed). "Not implemented yet" is a dev-time stub
// marker, not a real runtime failure — callers pass it through as-is
// instead of routing it here (see Diary.tsx's handleSubmit/handleSave).
const ERROR_HEADLINES = {
  network: 'No connection - check network and try again',
  ai: 'AI could not analyze that - try again',
  sheet: 'Could not save to your sheet - try again',
}

export function diaryError(e) {
  if (e?.type && ERROR_HEADLINES[e.type]) return ERROR_HEADLINES[e.type]
  const msg = e?.message ?? ''
  if (/drive\/sheets api/i.test(msg)) return ERROR_HEADLINES.sheet
  if (/fetch|network/i.test(msg)) return ERROR_HEADLINES.network
  return 'Something went wrong - try again'
}
