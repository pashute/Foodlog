# Filename: entry.feature
# Version: 0.2.1
# App entry / login state scenarios

Feature: App entry

  As a user I open the app
  And these are the first things I see

  @entry.not-logged-in
  Scenario: Opened but not logged in
    Given the user opened the app
    But the user was not logged in previously
    Then the header is shown
    And the settings panel is shown
    And the settings panel is disabled by default until login

  @entry.crash-recovery
  Scenario: Continued log in after crash
    Given the user closed the app
    But did not log out - for any reason including an app crash
    Then the app will check OAuth if still logged in
    And if not will log out and notify of error

  @entry.logging-in
  Scenario: Logging in
    Given the user has now logged in 
    Then the hamburger is enabled with the menu items
    | name       | action                  | state                                |
    | settings   | opens settings page     | on diary page                        |
    | Enter meal | opens diary page        | on settings page. Enabled if all set |
    | Log out    | logs out and clears app | Logged or logging  in                |
   
    