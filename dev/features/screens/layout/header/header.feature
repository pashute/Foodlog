# Filename: header.feature
# Version: 0.2.1
# Header layout and hamburger menu

Feature: screens/layout/header

  @header.layout
  Scenario: Header layout is correct
    Given the app is open
    Then the header is a stripe at the top of the app screen
    And the app name is to the left with a larger font
    And the version is in the format vX.Y.Z with a smaller font
    And there is a Login with Google button aligned to the right
    And the hamburger icon is aligned in the far right corner
    And the looks are according to the config.theme (dark mode)

  @header.config
  Scenario: Header has configured content
    Given the app header is open
    And the app name from config is shown on the left
    And the version a vX.Y.Z from the config is shown next to the app name
    And a "Login with Google" button is shown on the right side of the header
    And a hamburger icon is shown on the right end of the header

  @header.hamburger
  Scenario: Hamburger selected
    Given the hamburger icon was selected
    Then the menu shows only the items relevant to the current page, hiding the rest:
    | name       | action                  | shown when         | enabled when   |
    | settings   | opens settings page     | on diary page       | always         |
    | Enter meal | opens diary page        | on settings page    | logged in      |
    | Log out    | logs out and clears app | logged in           | always         |
