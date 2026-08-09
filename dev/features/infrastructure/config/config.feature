# Filename config.feature  Version 0.2.0

Feature: Config module get(section, key)

  As a developer I want to retrieve config values by section and key

  Scenario Outline: Retrieving a configured value
    When I call get("<section>", "<key>")
    Then the result is "<value>"

    Examples:
      | section | key        | value                     |
      | app     | appname    | Foodlog                   |
      | app     | version    | 0.1.1                     |
      | app     | theme      | dark                      |
      | storage | encryption | secure android keystore   |
      | storage | aiKeyName  | GeminiKey                 |
      | sheets  | name       | Foodlog                   |
      | sheets  | link       | sheets.google.com/Foodlog |
      | sheets  | id         | mock-sheet-id             |
