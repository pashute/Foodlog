// Filename: babel.config.js
// Version: 1.1.0

module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV)
  // Jest's CJS module system can't resolve native dynamic import() the way
  // Metro does — this plugin rewrites import() to a Promise-wrapped
  // require() under test only, so auth.js's dynamic platform imports work.
  const isTest = api.env('test')
  return {
    presets: ['babel-preset-expo'],
    plugins: isTest ? ['dynamic-import-node'] : [],
  }
}
