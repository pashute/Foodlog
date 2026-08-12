# Filename config.feature  Version 0.4.0

Feature: Developer Configuration  Available

  As a developer I want to easily configure the app
  and use the configured values

  @config.module
  Scenario: Config module is available
    Given the config module is available
    Then it exposes `get(section, key)`

  @config.get
  Scenario: Retrieving developer configured values
    Given the config module is available
    When the app calls get("<section>", "<key>")
    Then the result is the correct "<value>"

  @config.yaml
  Scenario:  Storing developer configured values
    Given the config exists
    Then the configuration has the following data:
      | section | key            | default   |
      | config  | stage          | prototype |
      | app     | app-name       | Foodlog   |
      | app     | app-version    | 0.1.1     |
      | app     | theme          | dark      |
      | sheets  | sheet-name     | Foodlog   |
