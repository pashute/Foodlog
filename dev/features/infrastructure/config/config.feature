# Filename config.feature  Version 0.6.0

Feature: Application Metadata

  @metadata.configuration
  Scenario: Editable configuration has default values
    Given the app starts
    Then the editable configuration has these metadata values:
      | metadata                       | default  |
      | configuration.app.theme         | dark     |
      | configuration.sheets.sheetName  | Foodlog  |
      | configuration.sheets.sheetFolder| Foodlogs |

  @metadata.constants
  Scenario: App and mock constants have default values
    Then application metadata has these constant values:
      | metadata                                  | default                                      |
      | appConstants.appName                      | Foodlog                                      |
      | appConstants.appVersion                   | 1.0.0                                        |
      | appConstants.urls.googlePrivacy           | https://policies.google.com/privacy#intro    |
      | appConstants.urls.googleAiStudio          | https://aistudio.google.com/app/api-keys     |
      | appConstants.urls.driveSafe               | https://NotImplementedYet.github.com/drive-safe.html |
      | appConstants.urls.googleDriveApi          | https://www.googleapis.com/drive/v3          |
      | appConstants.urls.googleSheetsApi         | https://sheets.googleapis.com/v4/spreadsheets|
      | appConstants.urls.myDrive                 | https://docs.google.com/spreadsheets/d       |
      | appConstants.urls.driveFileScope          | https://www.googleapis.com/auth/drive.file   |
      | mockConstants.urls.mockMyDrive            | http://localhost:3000                        |

  @metadata.environment
  Scenario: Environment metadata has the selected stage and platform
    Then environment metadata has these values:
      | metadata                  | default   |
      | environment.devStage      | prototype |
      | environment.platform      | web       |
      | environment.isPrototype() | true      |

  @metadata.storage
  Scenario: Storage metadata has key names
    Then storage metadata has these keys:
      | metadata              | value      |
      | storage.KEYS.authToken| authToken  |
      | storage.KEYS.aiApiKey | aiApiKey   |
      | storage.KEYS.sheetId  | sheetId    |

  @config.saved
  Scenario: Saved configuration is restored for a signed-in user
    Given a signed-in user previously saved configuration changes
    When that user signs in again
    Then the saved configuration is used

  @config.invalid
  Scenario: Invalid saved configuration falls back to defaults
    Given a signed-in user has invalid saved configuration
    When the configuration is loaded
    Then default configuration is used
    And the Settings instructions show a configuration warning
