# Filename: oauth.feature
# Version: 0.4.0
# OAuth Google account integration scenarios

Feature: OAuth Google Account Integration

  As a registered user
  I want to log into my account
  so that I can store and access my drive data
  and analyze it with my own AI sessions 
  and log out so my data is not compromised

  @auth.scope-popup
  Scenario:  Show pre-login starter dialog Popup
    Given the app is open 
    When the user presses Continue Login with Google
    Then the starter dialog  popup is shown, 
    And the options are available to the user:
    | user option                   | action                           |
    | Continue to Login with Google | closes dlg and opens oauth login |
    | Cancel                        | closes dlg and aborts login      |
     # See starter.dlg.jsx (was authMessage.js)

  @auth.safe-drive
  Scenario:  Show safe drive information
     Given the user is on the Calming Scope popup 
     When the user presses Read Further link button
     Then the user's browser opens on the DriveSafe webpage
     # Note: website location to be decided. 

  
  @auth.login
  Scenario: OAuth Log In
    Given the user pre-login scope popup is shown 
    When the user chooses Continue login with google
    Then the app logs in with OAuth to the current Chrome user 
    And the scope drive.file is specified 
    And a refresh token is requested
    And the result object if any is parsed:
    | Type | Analyzed parts |
    | Type    | Analyzed parts |
    | success | access_token, expires_in, scope, token_type |
    | error   | error, error_description |


  @auth.verify
  Scenario: Verify token after login
    Given the user has logged in
    Then verify the returned token is fresh
    And verify that its a refresh token (access_type=offline and prompt=consent)
    And verify the token has scope `drive.file`


  @auth.token-storage
  Scenario: Store verified auth token securely
    Given login succeeded with a refresh token
    And the token is verified to be fresh
    And the token has the scope of `drive.file`
    Then the auth token is stored in local secure storage
    And if an old token is there, it is replaced
    And the usermail is stored in the local secure storage 


  @auth.fail
  Scenario: OAuth login failed
    Given the OAuth returned with an error object
    Then the app shows a message that login failed 
    And the given reason it failed if any
    But when the user presses cancel 
    Then the login is aborted
    And the user is told that the Login was cancelled.
    And the app state goes back to the pre-login state, with no data stored in local storage


  @auth.logout
  Scenario: Data discarded on logout
    Given the user logs out
    Then all app data is cleared:
    | module   | data-type                        | value                    |
    | app      | auth-status                      | logged-out               | 
    | storage  | 3 secret keys (auth, ai, sheets) | deleted                  |
    | header   | login info (avatar and username) | Login with Google button |
    | diary    | fields                           | all clear                |
    | settings | fields                           | all clear                |
    And the settings panel is disabled and shown

  @auth.app-closed
  Scenario: App was closed
    Given the app was closed by the user or forced to closed
    Then the app will attempt to log out and clear the settings. 
    But the usermail will stay in the storage. 