// Filename: metro.config.js
// Version: 1.0.0
// Required for `expo export --platform web` / `expo start --web` to wire up
// the web require-shim correctly — without this file Metro falls back to a
// bare config and the exported bundle throws "require is not defined".

const { getDefaultConfig } = require('expo/metro-config')

module.exports = getDefaultConfig(__dirname)
