# Filename logger.feature  Version 0.1.0

Feature: screens/layout/logger

  Scenario: Logger panel is shown
    Then the logger panel shows a minutes-ago box with minus, value, and plus controls
    And the logger panel shows the computed time
    And the logger panel shows the current carbs estimate
    And the logger panel shows the current energy estimate
    And the logger panel shows a multiline food description input
    And the logger panel shows a green submit button
    And the logger panel shows a multiline instructions area
    And the logger panel shows a "Food log" navigation link
