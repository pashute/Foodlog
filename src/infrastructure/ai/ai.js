// Filename: ai.js
// version 0.3.0

import { _ensurePrototype } from '../config/config.js'
import * as aiMock from '../../prototype/ai.mock.js'

// AI.carbs — estimates and sums carbs/energy per recognized food item.
export function analyze(meal) {
  _ensurePrototype()
  return aiMock.analyze(meal)
}

// AI.lang — a short summary line for a list of analyzed items by time.
export function summarize(time) {
  _ensurePrototype()
  return aiMock.summarize(time)
}

// Format check only — does not call Gemini. 'missing' = no key stored,
// 'invalid' = key stored but doesn't match Google API key shape, 'ok' = shape looks right.
export function keyStatus(key) {
  if (!key) return 'missing'
  return /^AIza[\w-]{10,}$/.test(key) ? 'ok' : 'invalid'
}
