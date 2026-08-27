# Filename storage.feature  Version 0.2.1

Feature: infrastructure/storage

  As a developer I want a storage module for critical data

  @storage.module
  Scenario: Storage module is available
    Given the storage module is available
    Then the app can access it through a storage module
    And the module supports `initialize`, `get`, and `update`.

  @storage.keys
  Scenario: Use constant storage key names
    Given data is stored or retrieved from the storage 
    Then the storage module has the following keys:
    | key       | function                        | data from                   |
    | authToken | Authentication refresh token    | login process               |
    | aiApiKey  | AI (Gemini-Lite) key            | user supplied during setup  |
    | sheetId   | Foodlog Google sheet ID         | access of sheet after login |
    | usermail  | Current user's mail             | login process               |
