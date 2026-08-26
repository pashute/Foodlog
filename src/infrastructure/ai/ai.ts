// Filename: ai.ts
// version 0.2.1

import { isPrototype } from '../environment.ts'
import { appConstants } from '../config/config.ts'
import { get as storageGet, KEYS } from '../storage/storage.ts'
import * as aiMock from '../../prototype/ai.mock.ts'

const GEMINI_MODEL = 'gemini-flash-lite-latest'

// Real (non-prototype) Gemini call. Async because it's a network request —
// analyze()/summarize() are async in both branches so callers never have to
// know which one they got (see ai.mock.ts). Errors are tagged with `.type`
// (see diaryEntry.ts's diaryError() table) so the UI can show a short
// headline instead of a raw fetch/HTTP message.
async function _callGemini(prompt, apiKey) {
  let res
  try {
    res = await fetch(
      `${appConstants.urls.googleGeminiApi}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )
  } catch {
    throw Object.assign(new Error('Gemini request failed: network error'), { type: 'network' })
  }
  if (!res.ok) {
    throw Object.assign(new Error(`Gemini request failed: ${res.status}`), { type: 'ai' })
  }
  try {
    const json = await res.tson()
    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  } catch {
    throw Object.assign(new Error('Gemini request failed: bad response'), { type: 'ai' })
  }
}

// Prompt shape matches ai.feature @ai.analysis's per-item json.
async function _realAnalyze(meal) {
  const apiKey = await Promise.resolve(storageGet(KEYS.aiApiKey))
  const context = await getPatternContext()
  const contextHint = Object.keys(context).length
    ? ` Past patterns for this user (food -> usual qty/unit): ${JSON.stringify(context)}. Prefer these when the meal text doesn't say otherwise.`
    : ''
  const prompt =
    'Break this meal description into individual food items with estimated quantity, ' +
    'unit (size/measure), weight (g), carbs (g), and calories. Reply with ONLY a JSON array ' +
    'of items shaped like {"item": 1, "status": "guess", "name": "cucumber", ' +
    '"details": "qty:1, sz:med", "data": "wgt:200, crb:6, cal:28"} — ' +
    '"status" is "guess" when estimating, "set" when the user text was already explicit. ' +
    'The "sz" value is a short unit/size word up to 3 letters (e.g. "med", "cup"). ' +
    'If the meal text also gives an optional qualifier (e.g. "heavy" cheese, "spelt" pita), ' +
    'add "tp:<word>" (up to 9 letters) to "details", e.g. "qty:1, sz:cup, tp:heavy".' +
    contextHint +
    ` Meal: "${meal}"`
  const text = await _callGemini(prompt, apiKey)
  try {
    return JSON.parse(text)
  } catch {
    return []
  }
}

// Format matches ai.feature @ai.summarize.
async function _realSummarize(time) {
  const apiKey = await Promise.resolve(storageGet(KEYS.aiApiKey))
  const prompt =
    `Write one comma-separated line (no headers) summarizing the Foodlog entry at ${time}: ` +
    'timestamp, then [totalCarbs, totalCalories], then per item "{qty} {sz} {item} ' +
    '({wgt}g: {carb}g,{cal}cal)".'
  return _callGemini(prompt, apiKey)
}

// AI.carbs — estimates and sums carbs/energy per recognized food item.
export async function analyze(meal) {
  if (isPrototype()) return aiMock.analyze(meal)
  return _realAnalyze(meal)
}

// AI.lang — a short summary line for a list of analyzed items by time.
export async function summarize(time) {
  if (isPrototype()) return aiMock.summarize(time)
  return _realSummarize(time)
}

// Format check only — does not call Gemini. 'missing' = no key stored,
// 'invalid' = key stored but doesn't match Google API key shape, 'ok' = shape looks right.
export function keyStatus(key) {
  if (!key) return 'missing'
  return /^AIza[\w-]{10,}$/.test(key) ? 'ok' : 'invalid'
}

// "AI reads the Foodlog sheet as context to learn food patterns" (app-entry
// scenario, Aug 18 discussion). Prototype: returns the mock's one-time
// hand-authored pattern JSON (see ai.mock.ts). Real: no sheet-history
// fetch is built yet (would need Sheets API `values.get`, separate scope,
// not done here) — returns {} so _realAnalyze's prompt just omits the hint.
export async function getPatternContext() {
  if (isPrototype()) return aiMock.getPatternContext()
  return {}
}

// "diary save scenario — ai should add record to pattern recog context."
// Prototype: updates the mock's in-memory pattern JSON for this session.
// Real: no-op — same scope note as getPatternContext() above. Pattern
// context tracks qty/unit (the AI's routine estimate), not the occasional
// `type` qualifier.
export async function learnFromRecord(record) {
  if (isPrototype()) return aiMock.recordPattern(record.name, record.qty, record.unit)
}
