# Filename: settings.feature  Version 0.2.0

Feature: screens/layout/settings

  Scenario: Settings panel is shown
    Then the settings panel shows the following elements
    | Card             | Element                                |
    | 1. App info      | Theme                                  |
    | 2. AI API Key    | Status LED, Import button              |
    | 3. Foodlog sheet | Link                                   |
    | 4. Timezone      | [Timezone]                             |
    | 5. Action row    | [Go to App] button                     |
    | 6. Bottom row    | Single dedicated instruction row       |
    And the timezone choice is disabled with the current system timezone
    And the App name and Version are shown in the header only, not in the App info card

  Scenario: Bottom instruction row changes per hovered card
    Given the settings panel is shown
    Then the bottom instruction row is empty by default
    When the user hovers the AI API Key card
    Then the bottom instruction row shows the AI API Key explanation
    When the user hovers the Timezone card
    Then the bottom instruction row shows the Timezone explanation
