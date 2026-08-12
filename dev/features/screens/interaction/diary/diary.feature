# Filename: diary.feature
# Version: 0.1.0
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
