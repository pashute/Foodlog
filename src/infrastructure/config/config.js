// Filename config.js  Version 0.1.0

// Config module (infrastructure/config). At prototype stage, delegates to the
// mock in src/prototype/config.js instead of reading config.yaml.

import { get as mockGet } from '../../prototype/config.js'

export function get(section, key) {
  return mockGet(section, key)
}
