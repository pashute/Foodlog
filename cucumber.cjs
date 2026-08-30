  // Filename cucumber.cjs  Version 0.2.1

module.exports = {
  default: {
    paths: ['dev/features/**/*.feature'],
    import: ['dev/features/support/**/*.ts', 'dev/features/**/step_definitions/**/*.ts'],
  },
}
