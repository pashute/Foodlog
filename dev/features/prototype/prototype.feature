# Filename prototype.feature  Version 0.1.0

Feature: Infrastructure modules available via mockup code
    Mockup code for the basis of Config, Storage, Authentication, AI, and Sheets
  
  As a developer I want to test the infrastructure modules with a mockup before real integration

  @config
  Scenario: Config module is available
    Given the config module is available 
    When the app calls the config module with get(section, key)
    Then mockup code responds replacing a real configuration file 

  @storage
  Scenario: Storage module is available
    Given the storage module is available 
    When the app calls the storage module with `keys`, `initialize`, `update`, or `get`
    Then mockup code responds replacing a real secured local storage element

  # Authentication - Login sequence

  # User pressed login
  @oauth @account-selection
  Scenario: OAuth Account Selection popup (mock)
    Given the user is not logged in (app's hidden auth-state is logged-out)
    When the user presses "Login with Google" in the header
    Then a mock Google Account-Selection popup is shown (user1, user2)
    And only `user1` is enabled
    And `user1` is selected

  # User chooses user1 
  @oauth @account-selected
  Scenario: Selecting the user in Account Selection popup
    Given the mock Google account-selection popup is shown
    When the user presses `Continue`
    Then the popup closes
    And the app's hidden `auth-state` is `in-progress`
    And settings data is set:
    | setting    | value           |
    | username   | user1           |
    | email      | user1@gmail.com |
  
  # Permission's popup 
  @oauth @scope-popup
  Scenario: OAuth permissions popup
    Given the setting's hidden auth-state is in-progress
    When the Account Selection popup is closed
    Then the app shows an OAuth Permissions Popup with `scope: drive.file`

  # User chooses permission  
  @oauth @scope-popup
  Scenario: OAuth permissions popup
    Given the OAuth Permission popup is open
    When the user choses OAuth permission scope `drive.file`
    The the OAuth Permissions popup closes
    And the settings scope: drive.file`
  

  # AI Scenarios

  @ai-carbs
  Scenario: AI food breakdown
    Given the AI module calls for AI analysis 
    When the module receives a prompt
    | time  | meal                                                               |
    | 08:03 | cucumber yogurt                                                   |
    | 08:04 | 1? med? cucumber (200g, 6g,28c), 1? sml? yogurt (170g, 8g, 110c ) |
    | 08:55 | almonds                                                       |
    Then a mockup canned response is returned: 
    | time | item | status | name | details  | data json |
    | 08:03 | 1 | guess | cucumber | qty:1, sz:med | wgt:200, crb:6, cal:28    |
    | 08:03 | 2 | guess | yogurt   | qty:1, sz:std | wgt:170g, crb:8, cal:110c |
    | 08:04 | 1 | set   | cucumber | qty:1, sz:med | wgt:200, crb:6, cal:28    |
    | 08:04 | 2 | set   | yogurt   | qty:1, sz:std | wgt:170g, crb:8, cal:110c |
    | 08:57 | 1 | guess | almonds  | qty:10, sz:std | wgt:12, crb:3, cal 70    |

  #ai-lang 
  Scenario: AI resulting text 
    Given the AI module requests a summary line from a list by time:
    | 08:03 | 1 | guess | cucumber | qty:1, sz:med | wgt:200, crb:6, cal:28    |
    | 08:03 | 2 | guess | yogurt   | qty:1, sz:std | wgt:170g, crb:8, cal:110c |
    | 08:04 | 1 | set   | cucumber | qty:2, sz:med | wgt:400, crb:12, cal:56    |
    | 08:04 | 2 | set   | yogurt   | qty:1, sz:std | wgt:170g, crb:8, cal:110c |
    | 08:57 | 1 | guess | almonds  | qty:10, sz:std | wgt:12, crb:3, cal 70    |
    Then a mockup canned string is given per list
    | 08:03 | 14g: 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g, 110c ) |
    | 08:04 | 20g: 2 med cucumber (400g, 12g,56c), 1 std yogurt (170g, 8g, 110c )    |
    | 08:57 | 3g:  10? std? almonds (12g, 3g,70c)                                  |
    
    
# Sheets - accessing the Foodlog sheet
  # existsOrCreate - called during settings initialization 
  # log - called by the module stores in mock sheet
  # show - called when the user presses the sheet link
    
  @sheets.install
  Scenario: Start local static server for mock sheet
    Given the mock sheets HTML file exists in src/prototype
    When the developer runs `npx serve src/prototype`
    Then the mock spreadsheet is served locally for the sheet link to open

  @sheets.create
  Scenario: Create Foodlog sheet
    Given the Sheets module is available
    And existOrCreate was not called yet
    When the settings module calls sheets.existsOrCreate
    Then mock sheet settings info is given:
    | key | value                      |
    | id  | abcd12345                  |
    | name | Foodlog                   |
    | link | http://localhost:3000/mockFoodlog.html |
    And a mock spreadsheet is created with the header:
    |date|dow|time|carbs|status|meal|
    And a local simple HTML file reflects the spreadsheet
    And the mock spreadsheet replaces the real spreadsheet
    

  @sheets.exists
  Scenario: Create Foodlog sheet
    Given the Sheets module is available
    And existOrCreate was already called
    When the settings module calls sheets.existsOrCreate
    then the mock spreadsheet object is used instead of the real one
  
  @sheets.log
  Scenario: Log to sheet
    Given the Sheets module is available
    When the storage module calls sheets.log with meal data
    Then the mock spreadsheet is updated with a new row containing the meal entry
    And the local HTML file is updated 

  @sheets.show
  Scenario: Show Foodlog sheet
    Given the Sheets module is available
    When the user presses the sheet link in settings
    Then the mock spreadsheet is displayed in a new window

