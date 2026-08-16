# Filename: diary.feature
# Version: 0.2.0
# screens/interaction/diary — user interactions on the diary panel

Feature: screens/interaction/diary

  Scenario: Submit a meal and see AI estimate
    Given the diary panel is shown
    When the user enters a meal description
    And presses submit
    Then the AI estimate updates with carbs and energy totals
    And each food item shows its own carbs and energy

  Scenario: Adjust minutes ago
    Given the diary panel is shown
    When the user presses plus on the minutes-ago box
    Then the minutes-ago value increases by one
    And the computed time updates accordingly

  Scenario: Minus is disabled at zero
    Given the diary panel is shown
    Then the minus button is disabled

  @diary.fixSave
  Scenario: Save Anyway is shown while any item is a guess
    Given the AI estimate has at least one guessed item
    Then the second action button reads "Save Anyway"

  @diary.fixSave
  Scenario: Save is shown once every item is confirmed
    Given the AI estimate has no guessed items
    Then the second action button reads "Save"

  @diary.fixSave
  Scenario: Fix rebuilds the input as an editable telegraphic string
    Given the AI estimate is shown
    When the user presses Fix
    Then the meal input is replaced with a comma-separated string
    And it starts with the totals in grams and calories
    And each guessed item has "?" after its guessed quantity and size

  @diary.fixSave
  Scenario: Save logs the entry to the Foodlog sheet
    Given the AI estimate is shown
    When the user presses Save or Save Anyway
    Then the current meal maps to the next Foodlog sheet row
    And the diary panel resets to an empty entry
