# Filename: diaryEntry.feature
# Version: 0.2.1
# screens/interaction/diaryEntry — user interactions on the diary panel
# (renamed from diary.feature; entry text box starts empty, per-item accept
# checkboxes replace the old blanket Save/Save-Anyway toggle)
# Row layout + button set reworked Aug 18 20:50 — rows never show "?",
# Accept All -> Accept, Discard -> Revert (restores original typed text
# rather than emptying the form), Save's confirmation moved into the rows
# area instead of a popup.

Feature: screens/interaction/diaryEntry

  @diaryEntry.placeholder
  Scenario: Entry box starts empty with a placeholder
    Given the diary panel is shown
    Then the meal input is empty with a short example shown as placeholder text
    And the submit button is disabled

  @diaryEntry.submitEnable
  Scenario: Submit enables once text is entered
    Given the diary panel is shown
    When the user types a meal description
    Then the submit button is enabled

  @diaryEntry.error
  Scenario: Submitting unrecognized text shows an AI error
    Given the diary panel is shown
    When the user enters a meal description the AI does not recognize
    And presses submit
    Then an AI error message replaces the food list
    And the Fix, Accept, Save, and Revert buttons stay disabled

  @diaryEntry.submit
  Scenario: Submit a recognized meal and see AI estimate
    Given the diary panel is shown
    When the user enters a meal description
    And presses submit
    Then the AI estimate updates with carbs and energy totals
    And each food item shows its own carbs and energy
    And the Fix, Accept, Save, and Revert buttons become enabled

  @diaryEntry.minutes
  Scenario: Adjust minutes ago
    Given the diary panel is shown
    When the user presses plus on the minutes-ago box
    Then the minutes-ago value increases by one
    And the computed time updates accordingly

  @diaryEntry.minutes
  Scenario: Minus is disabled at zero
    Given the diary panel is shown
    Then the minus button is disabled

  @diaryEntry.accept
  Scenario: A guessed item's checkbox starts unticked
    Given the AI estimate is shown
    Then each guessed item's accept checkbox is unticked
    And each already-determined item's accept checkbox is ticked
    And no row shows a "?" either way

  @diaryEntry.accept
  Scenario: Ticking a guessed item's checkbox checks it
    Given the AI estimate is shown
    When the user ticks a guessed item's checkbox
    Then that item's checkbox is ticked

  @diaryEntry.accept
  Scenario: Unticking a determined item's checkbox unchecks it
    Given the AI estimate is shown
    When the user unticks a determined item's checkbox
    Then that item's checkbox is unticked

  @diaryEntry.accept
  Scenario: Accept ticks every checkbox
    Given the AI estimate is shown
    When the user presses Accept
    Then every item's checkbox is ticked

  @diaryEntry.fix
  Scenario: Fix rebuilds the input as an editable telegraphic string
    Given the AI estimate is shown
    When the user presses Fix
    Then the meal input is replaced with a comma-separated string
    And it starts with the totals in grams and calories
    And each unaccepted item has "?" after its guessed quantity and size
    And the Fix, Accept, Save, and Revert buttons become disabled
    And the food list and totals are cleared
    And the displayed hour still matches the original submit time

  @diaryEntry.save
  Scenario: Save appends the entry and resets the form
    Given the AI estimate is shown
    When the user presses Save
    Then the rows area shows "Meal saved"
    And the current meal, with its original timestamp, maps to the next Foodlog sheet row
    And the diary panel resets to an empty entry at zero minutes ago showing the current time

  @diaryEntry.revert
  Scenario: Revert restores the original typed text without saving
    Given the AI estimate is shown
    When the user presses Revert
    Then the meal input shows the original typed text
    And the food rows view is closed
    And nothing is appended to the Foodlog sheet
