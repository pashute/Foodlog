# Filename entry.feature  Version 0.1.0

Feature: screens/interaction/entry

  Scenario: App opens with header and disabled settings
    Then the header is shown
    And the settings panel is shown
    And the settings panel is disabled by default
