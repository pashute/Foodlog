# Filename sheets.feature  Version 0.2.0

Feature: Foodlog Sheet

  @sheets.data
  Scenario: Foodlog sheet has a defined header and field-based rows
    Then the Foodlog sheet has this header order:
      | date | dow | time | carbs | calories | status | meal |
    And each Foodlog sheet row uses those fields

  @sheets.production.create
  Scenario: Create Foodlog data when it does not exist
    Given the signed-in user has no saved Foodlog sheet
    When Foodlog data is first needed
    Then the app uses a Foodlogs folder directly under the user's Drive root
    And the app creates the Foodlogs folder when it is absent
    And the app creates a Foodlog spreadsheet in that folder when it is absent
    And the new spreadsheet has the Foodlog header and no data rows
    And the app saves the spreadsheet identifier for the user

  @sheets.production.existing
  Scenario: Reuse saved Foodlog data
    Given the signed-in user has a saved Foodlog spreadsheet identifier
    When Foodlog data is needed
    Then the app uses that Foodlog spreadsheet

  @sheets.rows
  Scenario: Save a Foodlog sheet row
    Given the Foodlog sheet has a known number of rows
    When the user presses diary.foods.Save
    Then the Foodlog sheet has one additional row
    And the Foodlog sheet latest row has the saved values

  @sheets.link
  Scenario: Open Foodlog sheet
    Given the Foodlog sheet is available
    When the user opens the Foodlog sheet from Settings
    Then the user's Foodlog spreadsheet opens

  @sheets.logout
  Scenario: Logout clears the saved Foodlog reference
    Given the signed-in user has a saved Foodlog spreadsheet identifier
    When the user logs out
    Then the saved Foodlog spreadsheet identifier is cleared
