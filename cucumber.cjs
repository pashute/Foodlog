// Filename cucumber.cjs  Version 0.1.0

module.exports = {
  default: {
    paths: ['dev/features/**/*.feature'],
    import: ['dev/features/support/**/*.ts', 'dev/features/**/step_definitions/**/*.ts'],
  },
}
