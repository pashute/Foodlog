# Filename: diary.feature
# Version: 0.1.0
# Diary panel layout (was "logger" — the Foodlog sheet name is unaffected)

Feature: screens/layout/diary

  Scenario: Diary panel is shown
    Then the diary panel shows a minutes-ago box with minus, value, and plus controls
    And the diary panel shows the computed time
    And the diary panel shows the current carbs estimate
    And the diary panel shows the current energy estimate
    And the diary panel shows a multiline food description input
    And the diary panel shows a green submit button
    And the diary panel shows a multiline instructions area
    And the diary panel shows a "Food log" navigation link

  Scenario: AI estimate area layout
    Given the AI estimate area is shown
    Then the total carbs and energy are shown above the food item list
    And the food item list is a scrollable box below the total
