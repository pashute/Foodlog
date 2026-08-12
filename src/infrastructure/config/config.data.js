// Filename: config.data.js  Version 0.1.0

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
    'app-version': '0.1.1',
    theme: 'dark',
  },
  sheets: {
    'sheet-name': 'Foodlog',
  },
}