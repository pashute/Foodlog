// Filename: ai.js
// version 0.2.0

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

export const aiKeyMsg1 =
  'For the food discussion to stay yours you supply your own free Gemini API key which is simple to obtain:';
export const aiKeyInstruct1 = "- Login to Google AI Studio(aistudio.google.com)";
export const aiKeyInstruct2 = "- Click on the Get API Key button. (Its on the sidebar to the left.)";
export const aiKeyInstruct3 = "- Click on Create API Key";
export const aiKeyInstruct4 = "- Copy it.";
export const aiKeyInstruct5 = "- Come back to our app and click Import.";

export const aiKeyMsgEnd6 = "We'll be using the minimal free model (Gemini Flash-Lite).";
