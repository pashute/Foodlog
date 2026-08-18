# Filename config.feature  Version 0.4.1

Feature: Developer Configuration  Available

  As a developer I want to easily configure the app
  and use the configured values

  @config.module
  Scenario: Config module is available
    Given the config module is available
    Then it exposes `get(section, key)`

  @config.get
  Scenario: Retrieving developer configured values
    Given the config module is available
    When the app calls get("<section>", "<key>")
    Then the result is the correct "<value>"

  @config.yaml
  Scenario:  Storing developer configured values
    Given the config exists
    Then the configuration has the following data:
      | section | key            | default              |
      | config  | stage          | prototype             |
      | app     | app-name       | Foodlog                |
      | app     | app-version    | 0.1.2                  |
      | app     | theme          | dark                    |
      | sheets  | sheet-name     | Foodlog                 |
      | sheets  | sheet-path     | FoodlogApp/Foodlog       |

  @config.keys
  Scenario: Every config value has a named KEYS constant
    Given the config module is available
    Then it exposes a KEYS enumeration with these key names:
      | KEYS name              | section | key                |
      | keyConfigStage         | config  | stage              |
      | keyConfigVersion       | config  | config-version     |
      | keyAppName             | app     | app-name           |
      | keyAppVersion          | app     | app-version        |
      | keyAppTheme            | app     | theme              |
      | keySheetsSheetName     | sheets  | sheet-name         |
      | keySheetsSheetPath     | sheets  | sheet-path         |
      | keyUrlSheetMock        | urls    | sheet-mock-base    |
      | keyUrlGooglePrivacy    | urls    | google-privacy     |
      | keyUrlAiStudio         | urls    | google-ai-studio   |
      | keyUrlDriveSafe        | urls    | drive-safe         |
      | keyUrlDriveApi         | urls    | drive-api          |
      | keyUrlSheetsApi        | urls    | sheets-api         |
      | keyUrlGeminiApi        | urls    | gemini-api         |
      | keyUrlGoogleSheetsEdit | urls    | google-sheets-edit |
      | keyUrlDriveFileScope   | urls    | drive-file-scope   |

  @config.urls
  Scenario: Every URL used in the app is sourced from config, not hardcoded
    Given the config module is available
    Then these code locations read their URL from config instead of a local literal:
      | file             | KEYS name              |
      | aiKey.dlg.jsx    | keyUrlGooglePrivacy    |
      | aiKey.dlg.jsx    | keyUrlAiStudio         |
      | auth.js          | keyUrlDriveSafe        |
      | starter.js       | keyUrlDriveSafe        |
      | sheet.mock.js    | keyUrlSheetMock        |
      | sheetServer.js   | keyUrlSheetMock        |
      | sheet.js         | keyUrlDriveApi         |
      | sheet.js         | keyUrlSheetsApi        |
      | sheet.js         | keyUrlGoogleSheetsEdit |
      | ai.js            | keyUrlGeminiApi        |
      | oauth.android.js | keyUrlDriveFileScope   |
