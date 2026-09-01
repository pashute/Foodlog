// Mirror of src/infrastructure/texts.ts for UI testing
// Test that all text constants exist and match

import { txt, commonTexts } from '../../src/infrastructure/texts.ts'

// Verify all text sections exist and are non-empty
export const textSections = {
  set: txt.set,      // Settings
  dry: txt.dry,      // Diary
  hdr: txt.hdr,      // Header
  dny: txt.dny,      // Donate
  ctc: txt.ctc,      // Contact
  aik: txt.aik,      // AI Key dialog
  cfg: txt.cfg,      // Config dialog
  str: txt.str,      // Starter/Auth
}

export const common = commonTexts

// Helper to verify text exists
export function hasText(section, subsection, key) {
  return (
    txt[section] &&
    txt[section][subsection] &&
    txt[section][subsection][key] !== undefined
  )
}

// Helper to get text with fallback
export function getText(section, subsection, key, fallback = '(missing)') {
  if (hasText(section, subsection, key)) {
    return txt[section][subsection][key]
  }
  console.warn(`Missing text: txt.${section}.${subsection}.${key}`)
  return fallback
}

// Validation: all sections must have msg, btn, or lbl subsections
export const expectedStructure = {
  set: { msg: true, btn: true, lbl: true },
  dry: { msg: true, btn: true, lbl: true },
  hdr: { msg: true, btn: true },
  dny: { msg: true, btn: true },
  ctc: { msg: true, btn: true },
  aik: { msg: true, btn: true },
  cfg: { msg: true, btn: true },
  str: { msg: true, btn: true },
}
