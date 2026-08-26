# Filename: settings.feature  Version 0.2.1

Feature: screens/layout/settings

  @settings.panel
  Scenario: Settings panel is shown
    Given the settings panel is shown
    Then the settings panel shows the following elements
    | Card              | Element                                            |
    | 1. Instruction    | Single dedicated instruction card                  |
    | 2. App info       | Theme, info icon                                   |
    | 3. AI API Key     | Status LED, Start AI button, info icon             |
    | 4. Foodlog sheet  | Link                                               |
    | 5. Timezone       | [Timezone] ([GMT offset]), Change button, info icon|
    | 6. Action row     | [Go to Diary] button                               |
    And the timezone choice is disabled with the current system timezone
    And the App name and Version are shown in the header only, not in the App info card
    And App info, AI API Key, Foodlog sheet, Timezone, and Go to Diary are all disabled until logged in
    And each info icon is adjacent to its row's button, after it (Theme has no button, so its icon is at the end of the row)

  @settings.infoPressed
  Scenario: Info icons update the instruction card correctly
    Given the settings panel is shown
    When the user interacts with one of the info icons on the Settings panel
    Then the top instruction card responds correctly:
      | interaction | response                                            |
      | hold        | key based instruction                               |
      | release     | back to original instruction                        |
      | hover       | no hover response (phone-like app behavior)         |
    And the correct instruction is shown:
      | section    | instruction            |
      | Theme      | Theme hint             |
      | AI API Key | AI API Key hint        |
      | Timezone   | Timezone hint          |

  @settings.aiKeyStatus
  Scenario Outline: AI Key status label reflects the stored key
    Given the stored AI key is "<key>"
    Then the AI Key status shows "<status>"

    Examples:
      | key                           | status  |
      |                               | Missing |
      | not-a-real-key                | Invalid |
      | AIzaSyDemoKeyForPrototype123  | OK      |

  @settings.aiKeyDialog
  Scenario: Start AI opens the Gemini key setup dialog
    Given the settings panel is logged in
    When the user presses "Start AI"
    Then the Gemini key dialog is shown with header "Gemini key"
    And the dialog shows numbered steps to get a Gemini API key, each with a screenshot
    And a field to paste the key and a SAVE button
    And SAVE is disabled until a valid-looking key is entered
    And an invalid save attempt shows "Invalid key, try again"

  @settings.errorDisplay
  Scenario: Error messages are shown in red at the top of instruction card
    Given the settings panel is shown
    When an error occurs (i.e., invalid AI key, missing sheet, etc.)
    Then the error message is shown on the top instruction card in the Settings panel.
    And the message is written in red text
    And the message is a short 1 line message that fits in the card

  @settings.goToDiary
  Scenario: Go to Diary navigates to the Diary screen
    Given the settings panel is ready for data entry
    When the user presses Go to Diary
    Then the user is shown the Diary screen
