// Filename: config.js  Version 0.4.0

// Config module (infrastructure/config). At prototype stage, delegates to the
// mock in src/prototype/config.mock.js. Otherwise reads config.data.js, a
// static mirror of config.yaml (see that file for why).

import { get as mockGet } from '../../prototype/config.mock.js'
import configData from './config.data.js'

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
