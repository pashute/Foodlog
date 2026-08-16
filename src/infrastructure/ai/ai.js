// Filename: ai.js
// version 0.4.0

import { isPrototype } from '../config/config.js'
import { get as storageGet, KEYS } from '../storage/storage.js'
import * as aiMock from '../../prototype/ai.mock.js'

const GEMINI_MODEL = 'gemini-flash-lite-latest'

// Real (non-prototype) Gemini call. Async because it's a network request —
// analyze()/summarize() are async in both branches so callers never have to
// know which one they got (see ai.mock.js).
async function _callGemini(prompt, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  )
  if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`)
  const json = await res.json()
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// Prompt shape matches ai.feature @ai.analysis's per-item json.
async function _realAnalyze(meal) {
  const apiKey = await Promise.resolve(storageGet(KEYS.aiApiKey))
  const prompt =
    'Break this meal description into individual food items with estimated quantity, ' +
    'size, weight (g), carbs (g), and calories. Reply with ONLY a JSON array of items ' +
    'shaped like {"item": 1, "status": "guess", "name": "cucumber", ' +
    '"details": "qty:1, sz:med", "data": "wgt:200, crb:6, cal:28"} — ' +
    '"status" is "guess" when estimating, "set" when the user text was already explicit. ' +
    `Meal: "${meal}"`
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
