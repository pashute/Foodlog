// Filename: babel.config.js
// Version: 1.0.0

module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
  }
}
