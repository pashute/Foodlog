// Filename: config.js  Version 0.4.1

// Config module (infrastructure/config). At prototype stage, delegates to the
// mock in src/prototype/config.mock.js. Otherwise reads config.data.js, a
// static mirror of config.yaml (see that file for why).

import { get as mockGet } from '../../prototype/config.mock.js'
import configData from './config.data.js'

// keySectionKeyName enumeration — named (section, key) pairs for every
// config value in use, so callers use a constant instead of a magic
// string pair. See dev/features/infrastructure/config/config.feature for
// the full table (key names only — actual values live in config.yaml/
// config.data.js/config.mock.js, not duplicated in the feature file).
export const KEYS = Object.freeze({
  keyConfigStage: { section: 'config', key: 'stage' },
  keyConfigVersion: { section: 'config', key: 'config-version' },
  keyAppName: { section: 'app', key: 'app-name' },
  keyAppVersion: { section: 'app', key: 'app-version' },
  keyAppTheme: { section: 'app', key: 'theme' },
  keySheetsSheetName: { section: 'sheets', key: 'sheet-name' },
  keySheetsSheetPath: { section: 'sheets', key: 'sheet-path' },
  keyUrlSheetMock: { section: 'urls', key: 'sheet-mock-base' },
  keyUrlGooglePrivacy: { section: 'urls', key: 'google-privacy' },
  keyUrlAiStudio: { section: 'urls', key: 'google-ai-studio' },
  keyUrlDriveSafe: { section: 'urls', key: 'drive-safe' },
  keyUrlDriveApi: { section: 'urls', key: 'drive-api' },
  keyUrlSheetsApi: { section: 'urls', key: 'sheets-api' },
  keyUrlGeminiApi: { section: 'urls', key: 'gemini-api' },
  keyUrlGoogleSheetsEdit: { section: 'urls', key: 'google-sheets-edit' },
  keyUrlDriveFileScope: { section: 'urls', key: 'drive-file-scope' },
})

// Lazy initialization with memoization.
let _isPrototype = null;

/// Only prototype code passes
/// For discovering uncovered production code
export const _ensurePrototype = () => {
   _isPrototype ??= isPrototype(); // if null read from config
   if (!_isPrototype) throw new Error("Not implemented yet");
};
export function isPrototype() {
  return configData.config?.stage === 'prototype';
}

export function get(section, key) {
  if (isPrototype()) {
    return mockGet(section, key);
  } else {
    return configData[section]?.[key];
  }
}

// get(section, key) by a KEYS constant instead of magic strings.
export function getByKey(K) {
  return get(K.section, K.key)
}
