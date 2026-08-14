# Filename setup.feature  Version 0.4.0

Feature: screens/interaction/setup

  @setup.instructions
  Scenario Outline: Settings instructions show one problem at a time
    Given the settings panel state is login "<login>" and AI key "<aiKey>"
    Then the top instruction card shows "<instruction>"

    Examples:
      | login     | aiKey   | instruction                                  |
      | loggedOut | missing | Press "Login with Google" to use the app.    |
      | loggedOut | ok      | Press "Login with Google" to use the app.    |
      | loggedIn  | missing | Press [Start AI] for AI key instructions     |
      | loggedIn  | invalid | Press [Start AI] for AI key instructions     |
      | loggedIn  | ok      | Press Go to Data Entry                       |

  @setup.appError
  Scenario: Application error instructions
    Given an application error occurs, other than an AI key problem
    Then the top instruction card text is shown in red and bold

  @setup.infoIcons
  Scenario Outline: Info icon press-and-hold shows a hint, release reverts it
    Given the settings panel is shown
    When the user presses and holds the "<row>" info icon
    Then the top instruction card shows "<hint>"
    When the user releases the info icon
    Then the top instruction card reverts to its previous instruction

    Examples:
      | row      | hint                                                              |
      | theme    | Theme change not yet available                                   |
      | ai key   | Press "Start AI" to see how & why                                |
      | timezone | This changes the timezone in this app. Not the system settings. |
