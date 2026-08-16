# Filename: diaryEntry.feature
# Version: 0.1.0
# screens/interaction/diaryEntry — user interactions on the diary panel
# (renamed from diary.feature; entry text box starts empty, per-item accept
# checkboxes replace the old blanket Save/Save-Anyway toggle)

Feature: screens/interaction/diaryEntry

  Scenario: Entry box starts empty with a placeholder
    Given the diary panel is shown
    Then the meal input is empty with a short example shown as placeholder text
    And the submit button is disabled

  Scenario: Submit enables once text is entered
    Given the diary panel is shown
    When the user types a meal description
    Then the submit button is enabled

  Scenario: Submitting unrecognized text shows an AI error
    Given the diary panel is shown
    When the user enters a meal description the AI does not recognize
    And presses submit
    Then an AI error message replaces the food list
    And the Fix, Accept All, Save, and Discard buttons stay disabled

  Scenario: Submit a recognized meal and see AI estimate
    Given the diary panel is shown
    When the user enters a meal description
    And presses submit
    Then the AI estimate updates with carbs and energy totals
    And each food item shows its own carbs and energy
    And the Fix, Accept All, Save, and Discard buttons become enabled

  Scenario: Adjust minutes ago
    Given the diary panel is shown
    When the user presses plus on the minutes-ago box
    Then the minutes-ago value increases by one
    And the computed time updates accordingly

  Scenario: Minus is disabled at zero
    Given the diary panel is shown
    Then the minus button is disabled

  @diaryEntry.accept
  Scenario: A guessed item's checkbox starts unticked
    Given the AI estimate is shown
    Then each guessed item's accept checkbox is unticked
    And each already-determined item's accept checkbox is ticked

  @diaryEntry.accept
  Scenario: Ticking a guessed item's checkbox accepts it
    Given the AI estimate is shown
    When the user ticks a guessed item's checkbox
    Then that item's "?" is removed

  @diaryEntry.accept
  Scenario: Unticking a determined item's checkbox marks it a guess
    Given the AI estimate is shown
    When the user unticks a determined item's checkbox
    Then that item shows "?" as a guess

  @diaryEntry.accept
  Scenario: Accept All ticks every checkbox
    Given the AI estimate is shown
    When the user presses Accept All
    Then every item's checkbox is ticked
    And no item shows "?"

  @diaryEntry.fix
  Scenario: Fix rebuilds the input as an editable telegraphic string
    Given the AI estimate is shown
    When the user presses Fix
    Then the meal input is replaced with a comma-separated string
    And it starts with the totals in grams and calories
    And each unaccepted item has "?" after its guessed quantity and size
    And the Fix, Accept All, Save, and Discard buttons become disabled
    And the food list and totals are cleared
    And the displayed hour still matches the original submit time

  @diaryEntry.save
  Scenario: Save appends the entry and resets the form
    Given the AI estimate is shown
    When the user presses Save
    Then a popup confirms the record was recorded
    And the current meal, with its original timestamp, maps to the next Foodlog sheet row
    And the diary panel resets to an empty entry at zero minutes ago showing the current time

  @diaryEntry.discard
  Scenario: Discard resets the form without saving
    Given the AI estimate is shown
    When the user presses Discard
    Then the diary panel resets to an empty entry at zero minutes ago showing the current time
    And nothing is appended to the Foodlog sheet
