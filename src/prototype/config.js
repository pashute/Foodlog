// Filename config.js  Version 0.2.0

// Mock config module (prototype stage). Stands in for config.yaml.

const data = {
  app: {
    appname: 'Foodlog',
    version: '0.1.1',
    theme: 'dark',
  },
  storage: {
    encryption: 'secure android keystore',
    aiKeyName: 'GeminiKey',
  },
  sheets: {
    name: 'Foodlog',
    link: 'sheets.google.com/Foodlog',
    id: 'mock-sheet-id',
  },
}

export function exists() {
  return true
}

export function get(section, key) {
  return data[section]?.[key]
}
