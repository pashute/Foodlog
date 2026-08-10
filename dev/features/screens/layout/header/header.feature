# Filename header.feature  Version 0.2.0

Feature: screens/layout/header

  Scenario: Header has configured content
    Given the app header is open
    And the app name from config is shown on the left
    And the version a vX.Y.Z from the config is shown next to the app name
    And a "Login with Google" button is shown on the right side of the header
    And a hamburger icon is shown on the right end of the header

  Scenario: Header looks are correct
    Given the app is open
    Then the header is a stripe at the top of the app screen
    And the app name is to the left with a larger font
    And the version is in the format vX.Y.Z with a smaller font
    And there is a Login with Google button aligned to the right
    And the hamburger icon is aligned in the far right corner
    And the looks are according to the config.theme (dark mode)
