# Filename prototype.feature  Version 0.1.0

Feature: Infrastructure modules available via mockup code
    Mockup code for the basis of Config, Storage, Authentication, AI, and Sheets
  
  As a developer I want to test the infrastructure modules with a mockup before real integration


  # ---------------------
  # Mock Config scenarios

  @mock.config
  Scenario: Config module is available
    Given the config module is available
    When the app calls the config module with get(section, key)
    Then mockup code responds replacing a real configuration file
    And the following fields are available 
      | section | key            | value     |
      | config  | stage          | prototype |
      | app     | app-name       | Foodlog   |
      | app     | app-version    | 0.1.1     |
      | app     | theme          | dark      |
      | sheets  | sheet-name     | Foodlog   |
  


  # ---------------------------
  # Storage prototype scenarios
 
  @storage
  Scenario: Storage mockup
    Given the storage module is available
    When the app calls the storage module with `initialize`, `get`, or `update`
    Then mockup code responds replacing a real secured local storage element:
    And the values will be empty on app entry and after logout 
    And the values will be: 
    | key       | value             | data available state       |
    | authToken | eyJhbGc12345      | logged in                  |
    | usermail  | user1@gmail.com   | logged in                  |
    | aiApiKey  | AIzaSy12345       | user pressed change ai key |
    | sheetId   | 1BxCdEfGhIjK12345 | token scope verified       |

  # ----------------------------------
  # Authentication prototype scenarios
  # # Note: This section emulates the login sequence

  # Note: oauth.mock.js orchestrates two real popup components
  # (accountChoice.mock.dlg.jsx, permitConsent.mock.dlg.jsx) rather than
  # returning canned objects directly. The scenarios below queue each
  # popup's result via `_queueTestResponse` (a test-only hook — see those
  # files) since a plain step definition can't render or click a Modal.
  # Interactive popup rendering itself is covered separately in the
  # RNTL/RTL UI-test tier per requirements.md "UI behavior / interaction
  # tests", not here.

  @mock.oauth.login
  Scenario: Mock OAuth login succeeds
    Given the development is in prototype mode
    And the mock account-choice popup will resolve with account "user1"
    And the mock permission-consent popup will resolve with consent granted
    When oauth.mock login is run
    Then the login result has a refresh token and scope "drive.file"
    And oauth.mock reports logged in

  @mock.oauth.account-cancel
  Scenario: Mock OAuth cancelled at account choice
    Given the development is in prototype mode
    And the mock account-choice popup will resolve as cancelled
    When oauth.mock login is run
    Then the login result is an error "popup_closed_by_user"
    And oauth.mock reports logged out

  @mock.oauth.consent-deny
  Scenario: Mock OAuth denied at permission consent
    Given the development is in prototype mode
    And the mock account-choice popup will resolve with account "user1"
    And the mock permission-consent popup will resolve as denied
    When oauth.mock login is run
    Then the login result is an error "access_denied"
    And oauth.mock reports logged out


  # ----------------------
  # AI Prototype Scenarios

  @mock.ai-analyze
  Scenario: AI food breakdown
    Given the User entered time and meal info 
    When the User submits the meal
    And the module receives the ai analysis instruction prompt
    Then the following meal data is appended 
    | hh:mm | meal            |
    | {now} | cucumber yogurt |
    And a mockup canned response is returned per sequence: 
    | hh:mm   | item | status | name     | details       | data                      |
    | {given} | 1    | guess  | cucumber | qty:1, sz:med | wgt:200, crb:6, cal:28    |
    | {given} | 2    | guess  | yogurt   | qty:1, sz:std | wgt:170g, crb:8, cal:110c |

  #ai-summarize 
  Scenario: AI resulting text 
    Given the user has submitted a meal entry
    And the canned example is displayed
    | time    | item | status | name     | details        | data json                 |
    | {given} | 1    | guess  | cucumber | qty:1, sz:med  | wgt:200, crb:6, cal:28    |
    | {given} | 2    | set    | yogurt   | qty:1, sz:std  | wgt:170g, crb:8, cal:110c |
    And a mockup canned string is given as a summary for the meal 
    | hh:mm | suggested entry                                                        |
    | 08:03 | 14g: 1? med? cucumber (200g, 6g,28c), 1 std yogurt (170g, 8g, 110c ) |
    
# --------------------------    
# Sheet Prototype Scenarios

  # Sheet module - for accessing the Foodlog sheet
  # - existsOrCreate - called during settings initialization 
  # - log - called by the module, stores food data in mock sheet
  # - show - feature for simulating the link to the sheet
  # - link - gives link to mock sheet webpage  
    
  @sheets.mock.install
  Scenario: Local node server for mock sheet
    Given the app is in prototype stage 
    And the user is logged in
    And the mock sheets HTML template exists in src/prototype/sheet/
    When the mock sheet object is created or loaded
    Then a node.js server serves the HTML mockup of the Foodlog sheet
    
  
  @sheets.mock.create
  Scenario: Create mock Foodlog sheet
    Given the Sheets module is available
    And existOrCreate was not called yet
    When the settings module calls sheets.existsOrCreate
    Then mock sheet settings info is given:
    | key | value                                    |
    | id  | abcd12345                                |
    | name | Foodlog                                 |
    | link | http://localhost:3000/Foodlog.mock.html |
    And a mock google spreadsheet object is created with the header:
    |date|dow|time|carbs|status|meal|
    And the mock spreadsheet object replaces the real spreadsheet

  
  @sheets.mock.exists
  Scenario: Use mock Foodlog sheet
    Given the development stage is prototype
    And the Sheets module is available
    And existOrCreate was already called
    When the settings module calls sheets.existsOrCreate
    Then the mock spreadsheet object is used instead of the real one
  
  @sheets.mock.log
  Scenario: Log to sheet
    Given the Sheets module is available
    When the storage module calls sheets.log with meal data
    Then the mock spreadsheet is updated with a new row containing the meal entry
    And the local HTML file is updated 

  @sheets.mock.link
  Scenario: Give mock sheets link
    Given the development stage is prototype
    When the app wants to set the settings page link to the sheet (Sheets.idToLink())
    Then the app will get the link to mock sheet page served by the mock sheet nodejs server. 

  @sheets.mock.show
  Scenario: Show Foodlog mock webpage
    Given the development stage is prototype
    And the mock sheet object is available
    When the user presses the sheet link in settings
    Then the local nodejs mock-sheet server adds the current data to the table in the template
    And serves the updated mock html file to be opened in the browser
    