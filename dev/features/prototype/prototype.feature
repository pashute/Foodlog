# Filename prototype.feature  Version 0.2.1

Feature: Infrastructure modules available via mockup code
    Mockup code for the basis of Config, Storage, Authentication, AI, and Sheets
  
  As a developer I want to test the infrastructure modules with a mockup before real integration



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
    | {given} | 2    | guess  | yogurt   | qty:1, sz:cup | wgt:170g, crb:8, cal:110c |

  @mock.ai-summarize
  Scenario: AI resulting text
    Given the user has submitted a meal entry
    And the canned example is displayed
    | time    | item | status | name     | details        | data json                 |
    | {given} | 1    | guess  | cucumber | qty:1, sz:med  | wgt:200, crb:6, cal:28    |
    | {given} | 2    | set    | yogurt   | qty:1, sz:cup  | wgt:170g, crb:8, cal:110c |
    And a mockup canned string is given as a summary for the meal
    | hh:mm | suggested entry                                                        |
    | 08:03 | 14g: 1? med? cucumber (200g, 6g,28c), 1? cup? yogurt (170g, 8g, 110c ) |

  @mock.sheet
  Scenario: Prototype sheet interactions
    Given the app stage is prototype
    When the user interacts with the Foodlog sheet
    Then the app interacts with the mockup sheet as usual:
      | trigger                           | result                         | meaning                                      |
      | user logs in with permissions     | Sheet.LoginLoad works as usual | mock sheet has header and empty rows         |
      | user presses diary.foods.Save     | Sheet.Save works as usual      | mock sheet row count increments with row data|
      | user presses settings.sheet.show  | Sheet.Show works as usual      | updated mock sheet opens                     |
      | user interacts with diary         | Sheet flow works as usual      | diary reads and writes the mock sheet        |
    
# ------------------------------
# Diary entry prototype scenario

  @diaryEntry
  Scenario: Diary entry round trip with mock AI data
    Given the diary panel is shown in prototype mode
    When the user types "cucumber yogurt" and presses submit
    Then the analyzed list shows
      | item     | guess | qty | unit | wgt   | crb | cal |
      | cucumber | yes   | 1   | med  | 200 g | 6 g | 28 kcal |
      | yogurt   | yes   | 1   | cup  | 170 g | 8 g | 110 kcal |
    And the totals show "14 g" carbs and "138 kcal" energy
    And the Fix, Accept, Save, and Revert buttons are enabled
    When the user unticks the yogurt checkbox and ticks the cucumber checkbox
    Then the food list shows "cucumber (200 g)" and "yogurt (170 g)"
    When the user presses Fix
    Then the meal input shows "(14g, 138cals), 1 med cucumber (wgt: 200g, crb: 6g, nrg: 28kc), 1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)"
    When the user presses submit
    Then cucumber's checkbox is ticked and yogurt's checkbox is unticked
    When the user presses Save
    Then the rows area shows "Meal saved"
    And the diary panel resets to an empty entry at zero minutes ago

  @diaryEntry.error
  Scenario: Diary entry shows an AI error for unrecognized text
    Given the diary panel is shown in prototype mode
    When the user types "{unrecognized meal text}" and presses submit
    Then the error text "AI error occured. Please contact support@foodlog.com" replaces the food list
    And the Fix, Accept, Save, and Revert buttons stay disabled
