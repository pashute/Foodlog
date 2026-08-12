// Filename config.js  Version 0.3.0

// Mock config module (prototype stage). Stands in for config.yaml.

const data = {
  config: {
    stage: 'prototype',
    'config-version': '0.1.1',
  },
  app: {
    'app-name': 'Foodlog',
    'app-version': '0.1.1',
    theme: 'dark',
  },
  sheets: {
    'sheet-name': 'Foodlog',
  },
}

export function exists() {
  return true
}

export function get(section, key) {
  return data[section]?.[key]
}
