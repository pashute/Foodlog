# Filename settings.feature  Version 0.1.0

Feature: screens/layout/settings

  Scenario: Settings panel is shown
    Then the settings panel shows an app info card with app name, version, and theme
    And the settings panel shows the Foodlog sheet id and a link to it
    And the settings panel shows a Gemini API Key field with an info icon
    And the settings panel shows a Timezone field with an info icon
    And the settings panel shows a "Go to App" button
    And the settings panel shows a warning row below the button
