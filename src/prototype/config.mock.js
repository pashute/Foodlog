// Filename config.js  Version 0.3.3

// Mock config module (prototype stage). Stands in for config.yaml.

const data = {
  config: {
    stage: 'prototype',
    'config-version': '0.1.1',
  },
  app: {
    'app-name': 'Foodlog',
    'app-version': '0.1.2',
    theme: 'dark',
  },
  sheets: {
    'sheet-name': 'Foodlog',
    'sheet-path': 'FoodlogApp/Foodlog',
  },
  urls: {
    'sheet-mock-base': 'http://localhost:3000',
    'google-privacy': 'https://policies.google.com/privacy#intro',
    'google-ai-studio': 'https://aistudio.google.com/app/api-keys',
    'drive-safe': 'https://NotImplementedYet.github.com/drive-safe.html',
    'drive-api': 'https://www.googleapis.com/drive/v3',
    'sheets-api': 'https://sheets.googleapis.com/v4/spreadsheets',
    'gemini-api': 'https://generativelanguage.googleapis.com/v1beta/models',
    'google-sheets-edit': 'https://docs.google.com/spreadsheets/d',
    'drive-file-scope': 'https://www.googleapis.com/auth/drive.file',
  },
}

export function exists() {
  return true
}

export function get(section, key) {
  return data[section]?.[key]
}
