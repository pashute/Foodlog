// Filename ai.mock.js  Version 0.2.0

// Mock AI module (prototype stage). Canned responses derived from the
// fixture data in dev/features/prototype/prototype.feature (@ai-carbs, #ai-lang).
// analyze()/summarize() are async to match the real (Gemini-calling) branch
// in ai.js — callers never need to know which branch they're on.
//
// The "fixed" key below is the exact output of Diary.jsx's buildFixString()
// for the 'cucumber yogurt' entry — pressing Fix then resubmitting must
// round-trip to the same items with status 'set', so keep these in sync.

const cannedAnalysis = {
  'cucumber yogurt': [
    { item: 1, status: 'guess', name: 'cucumber', details: 'qty:1, sz:med', data: 'wgt:200, crb:6, cal:28' },
    { item: 2, status: 'guess', name: 'yogurt', details: 'qty:1, sz:std', data: 'wgt:170g, crb:8, cal:110c' },
  ],
  '(14g, 138cals), 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g,110c)': [
    { item: 1, status: 'set', name: 'cucumber', details: 'qty:1, sz:med', data: 'wgt:200, crb:6, cal:28' },
    { item: 2, status: 'set', name: 'yogurt', details: 'qty:1, sz:std', data: 'wgt:170g, crb:8, cal:110c' },
  ],
  almonds: [
    { item: 1, status: 'guess', name: 'almonds', details: 'qty:10, sz:std', data: 'wgt:12, crb:3, cal 70' },
  ],
}

const cannedSummary = {
  '08:03': '14g: 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g, 110c )',
  '08:04': '20g: 2 med cucumber (400g, 12g,56c), 1 std yogurt (170g, 8g, 110c )',
  '08:57': '3g:  10? std? almonds (12g, 3g,70c)',
}

export async function analyze(meal) {
  return cannedAnalysis[meal] ?? []
}

export async function summarize(time) {
  return cannedSummary[time]
}
