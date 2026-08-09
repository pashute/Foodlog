# Filename prototype.feature  Version 0.1.0

Feature: Infrastructure modules available via mockup code

  As a developer I want to test the infrastructure modules with a mockup before real integrations exist

  Scenario: Config module is available
    Then the config module responds to get(section, key)

  Scenario: Storage module is available
    Then the storage module responds to keys, initialize, update, get

  Scenario: OAuth module is available
    Then the oAuth module supports Google login with drive.file scope

  Scenario: AI module is available
    Then the AI module accepts natural language text and returns a carbs estimate

  Scenario: Sheets module is available
    Then the sheets module supports existsOrCreate() and logrow()
