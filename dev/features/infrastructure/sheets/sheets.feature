# Filename sheets.feature  Version 0.1.1

Feature: infrastructure/sheets

  As a developer I want to access and maintain the user's Foodlog Google Sheet

  @sheets.module
  Scenario: Sheets module is available
    Given the Sheets module is available
    Then it exposes `existsOrCreate`, `log`, and `link`

  @sheets.create
  Scenario: Create Foodlog sheet if none exists
    Given no Foodlog sheet id is stored
    When existsOrCreate is called
    Then a new Foodlog sheet is created with header row:
    | date | dow | time | carbs | status | meal |
    And the sheet id is stored

  @sheets.exists
  Scenario: Reuse existing Foodlog sheet
    Given a Foodlog sheet id is already stored
    When existsOrCreate is called
    Then the existing sheet is used without creating a new one

  @sheets.log
  Scenario: Log a meal row
    Given the Sheets module is available
    When log is called with meal data
    Then a new row is prepended to the Foodlog sheet

  @sheets.link
  Scenario: Get the sheet link
    Given a Foodlog sheet id is stored
    When link is called
    Then the direct URL to the Foodlog sheet is returned for the settings panel

  @sheets.idLifecycle
  Scenario: Sheet id is empty until first loaded, cleared on logout
    Given no Foodlog sheet id is stored
    Then the sheet id is empty
    When existsOrCreate is called
    Then the sheet id is stored
    When the user logs out
    Then the sheet id is empty again
