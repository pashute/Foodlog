// Filename: config.data.js  Version 0.1.3

// Static mirror of ../../../config.yaml. Read this way (plain JS import,
// not runtime YAML/fs parsing) because config.js loads on every platform —
// Tauri webview, Android RN/Metro bundle, and plain Node for tests — and
// 'node:fs' is not available in the browser/RN targets, nor is a YAML
// loader configured in any bundler here. Keep in sync with config.yaml by
// hand until a build step generates this file automatically.

export default {
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