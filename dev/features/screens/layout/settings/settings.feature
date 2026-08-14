# Filename: settings.feature  Version 0.7.0

Feature: screens/layout/settings

  Scenario: Settings panel is shown
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

  Scenario: Top instruction card changes per pressed info icon
    Given the settings panel is shown
    Then the top instruction card shows the idle instruction by default
    When the user presses and holds the AI API Key info icon
    Then the top instruction card shows the AI API Key hint
    When the user presses and holds the Timezone info icon
    Then the top instruction card shows the Timezone hint
    And releasing an info icon reverts the top instruction card to its former instruction
    And there is no hover behavior anywhere in the app — press only, like a phone

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
    Given the settings panel is shown and the user is logged in
    When the user presses "Start AI"
    Then the Gemini key dialog is shown with header "Gemini key"
    And the dialog shows numbered steps to get a Gemini API key, each with a screenshot
    And a field to paste the key and a SAVE button
    And SAVE is disabled until a valid-looking key is entered
    And an invalid save attempt shows "Invalid key, try again"
