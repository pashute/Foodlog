// Filename ai.mock.js  Version 0.2.8

// Mock AI module (prototype stage). Canned responses derived from the
// fixture data in dev/features/prototype/prototype.feature (@ai-carbs, #ai-lang).
// analyze()/summarize() are async to match the real (Gemini-calling) branch
// in ai.js — callers never need to know which branch they're on.
//
// The "fixed" key below is the exact output of Diary.jsx's buildFixString()
// for the 'cucumber yogurt' entry — pressing Fix then resubmitting must
// round-trip to the same items with status 'set', so keep these in sync.
//
// analyze() throws for any text not in cannedAnalysis — Diary.jsx shows
// this as the AI error message in place of the food list (diaryEntry.feature).

const cannedAnalysis = {
  // Generic structural fixture for infrastructure/ai/ai.feature — that feature
  // tests the AI response *shape* only, so its key/item name stay abstract
  // (no real food name), unlike the diaryEntry fixtures below.
  'partial meal data': [
    { item: 1, status: 'guess', name: 'food item', details: 'qty:1, sz:med', data: 'wgt:100, crb:5, cal:40' },
  ],
  'cucumber yogurt': [
    { item: 1, status: 'guess', name: 'cucumber', details: 'qty:1, sz:med', data: 'wgt:200, crb:6, cal:28' },
    { item: 2, status: 'guess', name: 'yogurt', details: 'qty:1, sz:cup', data: 'wgt:170g, crb:8, cal:110c' },
  ],
  // Mark placement (Aug 19 original-record rework, diaryEntry.js): a field
  // is only "?"-marked if it's missing from or differs from what the raw
  // text literally said — "cucumber yogurt" never states qty/unit, so both
  // get guessed (unit's "?" wins), but the food name matches the typed word
  // exactly, so it's unmarked (unlike the abbreviation/typo case, e.g. "cuk"
  // -> "cucumber", which would still mark the name).
  '(14g, 138cals), 1 med? cucumber (wgt: 200g, crb: 6g, nrg: 28kc), 1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)': [
    { item: 1, status: 'set', name: 'cucumber', details: 'qty:1, sz:med', data: 'wgt:200, crb:6, cal:28' },
    { item: 2, status: 'set', name: 'yogurt', details: 'qty:1, sz:cup', data: 'wgt:170g, crb:8, cal:110c' },
  ],
  // Same round trip, but cucumber was accepted before Fix was pressed (no
  // marks at all), only yogurt was still a guess — see prototype.feature's
  // @diaryEntry scenario. Resubmitting confirms everything, same as the
  // fully-guessed fixed key above.
  '(14g, 138cals), 1 med cucumber (wgt: 200g, crb: 6g, nrg: 28kc), 1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)': [
    { item: 1, status: 'set', name: 'cucumber', details: 'qty:1, sz:med', data: 'wgt:200, crb:6, cal:28' },
    { item: 2, status: 'set', name: 'yogurt', details: 'qty:1, sz:cup', data: 'wgt:170g, crb:8, cal:110c' },
  ],
  almonds: [
    { item: 1, status: 'guess', name: 'almonds', details: 'qty:10, sz:std', data: 'wgt:12, crb:3, cal 70' },
  ],
}

const cannedSummary = {
  '08:03': '14g: 1? med? cucumber (200g, 6g,28c), 1? cup? yogurt (170g, 8g, 110c )',
  '08:04': '20g: 2 med cucumber (400g, 12g,56c), 1 cup yogurt (170g, 8g, 110c )',
  '08:57': '3g:  10? std? almonds (12g, 3g,70c)',
}

export const AI_ERROR_MESSAGE = 'AI error occured. Please contact support@foodlog.com'

// Pattern context (prototype stage): a one-time, hand-authored stand-in for
// "the AI reads the Foodlog sheet as context to learn food patterns" — the
// mock has no real learning, so instead of dynamic history-aggregation
// logic here, this is a static example of what that context would look
// like (food name -> the qty/type the user typically means), seeded once
// from the existing canned fixtures below for consistency. Saving a diary
// entry updates it in-memory for the rest of the session (see
// recordPattern(), called from diaryEntry.js's save flow via ai.js's
// learnFromRecord()) — same session-only persistence style as sheet.mock.js.
let patternContext = {
  cucumber: { qty: '1', unit: 'med' },
  yogurt: { qty: '1', unit: 'cup' },
  almonds: { qty: '10', unit: 'std' },
}

export function getPatternContext() {
  return { ...patternContext }
}

export function recordPattern(name, qty, unit) {
  if (!name) return
  patternContext = { ...patternContext, [name]: { qty, unit } }
}

// Whitespace-normalized lookup: MealTextFormat (sheet.js) inserts real
// newlines between records so the Fix textbox visually wraps after each
// "kc),". Collapsing all whitespace before the canned-fixture lookup means
// that display-only line-break doesn't need its own separate fixture key —
// the AI still sees/matches on "one input string" regardless of wrapping.
export async function analyze(meal) {
  const normalized = meal.replace(/\s+/g, ' ').trim()
  const result = cannedAnalysis[normalized]
  if (!result) throw new Error(AI_ERROR_MESSAGE)
  return result
}

export async function summarize(time) {
  return cannedSummary[time]
}
