# Dev Process Done

## Batch Aug 19 (reconstructed, no beeps logged at the time) — issue #4 oauth web real login

- [V] oauth.web.js created — real Google Identity Services (GIS) token client: login/trySilentLogin/logout, access-token only (no refresh token, by design — GIS never hands one to browser JS)
- [V] auth.js — web platform dispatch added to `_platformModule`; `_isFreshDriveFileToken` relaxed and exported to accept accessToken OR refreshToken
- [V] authClientIds.js — client_id_web doc comment clarified (one client shared by Android GoogleSignin + web GIS)
- [V] oauth.feature bumped 0.4.0 -> 0.5.0 — 3 new @auth.web.login/@auth.web.silent/@auth.web.logout scenarios documenting the access-token-only deviation
- [V] oauth.steps.js bumped 0.3.1 -> 0.4.0 — step stubs added, deliberately "Not implemented yet" (GIS needs a real browser — same boundary as the other real-path scenarios, not faked)
- [V] auth.test.js bumped 0.2.0 -> 0.3.0 — new unit test: _isFreshDriveFileToken accepts an accessToken (web) or a refreshToken (native)

## Batch Aug 19 morning end (still pending)

- [!] developer: paste real client_id_web into authClientIds.js
- [!] developer: flip config.data.js stage 'prototype' -> 'production'
- [!] developer: npm run web, click through real Google login popup (manual only — scripting Google's real consent screen "headlessly" is a ToS/security problem, agreed out of scope in issue #4)
- [?] commit (links issue #4) + push + close issue #4 — pending developer go-ahead

## Batch Aug 19 03:37 — verification of the above (this session)

- [v] beep.ps1
- [v] node --test dev/testing/units/infrastructure/auth.test.js -> 6/6 pass, incl. the new web-token test
- [v] beep.ps1
- [v] npx cucumber-js --tags "@auth.web.login or @auth.web.silent or @auth.web.logout" -> all 3 correctly stub "Not implemented yet" (expected — needs a real browser)

## Batch end

- [?] discuss with developer: scope + next steps for "production for everything web" (config/sheet/storage/ai) — see chat

Batch aug19 1816:  
discussiop before doing:  do you understand what i'm asking and what is the best way to do it?

## Batch 08-24 00:15

- beep.ps1
- [v] Stage 1: Confirm setup prompts and defaults for platform and dev stage
- beep.ps1
- [v] Stage 1: Confirm config.ts immutable appName constant
- beep.ps1
- [v] Stage 1: Confirm config.ts immutable appVersion constant
- beep.ps1
- [v] Stage 1: Confirm config.yaml app.theme setting
- beep.ps1
- [v] Stage 1: Confirm config.yaml sheets.sheetName setting
- beep.ps1
- [v] Stage 1: Confirm config.yaml sheets.sheetFolder = Foodlogs
- beep.ps1
- [v] Stage 1: Confirm prototype-owned sheet mock base URL outside config.yaml
- beep.ps1
- [v] Stage 1: Confirm camelCase config property names and config.ts declaration layout
- [v] Stage 1: Confirm app constants urls.googlePrivacy
- beep.ps1
- [v] Stage 1: Confirm app constants urls.googleAiStudio for API-key guidance in both stages
- beep.ps1
- [v] Stage 1: Confirm app constants urls.driveSafe for pre-login guidance until the app website is published
- beep.ps1
- [v] Stage 1: Confirm app constants urls.driveFileScope for OAuth; ignored by the prototype mock
- [v] Stage 1: Confirm app constants urls.googleDriveApi for root Foodlogs lookup/create and sheet lookup
- [v] Stage 1: Confirm app constants urls.googleSheetsApi for sheet create, read, and write
- [v] Stage 1: Defer urls.googleGeminiApi as an app-commented URL until used
- [v] Stage 1: Confirm app constants urls.myDrive and mock constants urls.mockMyDrive
- [v] Stage 1: Confirm urls.myDrive is the production link base before sheet ID; urls.mockMyDrive is the complete served mock link
- [v] Stage 1: Replace config.yaml setup with shared in-app configuration
- [v] Stage 1: Confirm defaults load at app startup and stored configuration loads per user after login
- [v] Stage 1: Defer infrastructure warn.ts red Settings-instruction warnings with constant messages
- [v] Stage 1: Confirm typed exported devStage and platform values with lazy cached isPrototype
- [v] Stage 1: Confirm environment module path src/infrastructure/environment.ts
- beep.ps1
- [v] Stage 1: Approve implementation
- [v] Code: Rebuild TypeScript config memory store and read-only access layer
- [v] Code: Separate config constants from startup-loaded values
- [v] Code: Wire defaults-on-load, prototype mock loading, and per-user stored configuration
- [v] Stage 1: Remove config.yaml, setup script, and platform-specific configuration paths
- [v] Code: Add infrastructure warn.ts for Settings instruction warnings
- [v] Code: Add shared Settings Open configuration, Restore defaults, and Reload controls
- [v] Code: Add TypeScript toolchain and convert application source from JavaScript and JSX to TypeScript and TSX
- [v] Code: Migrate legacy config.js consumers and unit runner to the TypeScript configuration API
- [v] Code: Build source-independent sheet object with date, dow, time, carbs, calories, status, and meal fields
- [v] Code: Find or create root Foodlogs folder and Foodlog spreadsheet; initialize its header in one API call
- [v] Code: Implement production link from config.urls.myDrive and storage.sheetId; implement mock stored sheet and served link from mock config and mock storage sheetId
- beep.ps1
- [v] Code: Summarize Stage 1 implementation changes
- beep.ps1
- [v] Feature: App entry loads default configuration
- [v] Feature: Configuration lists editable fields and defaults in a table
- [v] Feature: Configuration lists app and mock constants, purposes, and defaults in a table
- [v] Feature: Settings configuration screen edits fields, restores defaults, and saves
- [v] Feature: Login loads the saved configuration for the signed-in user
- [v] Feature: Sheet creates, reads, writes, and opens the Foodlog data
- [v] Feature: Remove platform, storage, API, mock, and implementation coupling from specifications
- [v] Feature: Approve feature rewrite list
- beep.ps1
- [v] Feature: Rewrite approved feature specifications
- beep.ps1
- [v] Code: Convert test and feature-support JavaScript and JSX to TypeScript and TSX
- [v] Code: Repair TypeScript test and BDD import migration - up to four repair rounds approved
- beep.ps1
  - fixed prototype.feature @mock.sheet  and sheet.feature @sheet.save simplified. (rows count + new row data)

  - fixing all jest mappings and correcting ts conversion.
  - fixed all calls to get(key, section)
  to new dot notation calls in the three metadata locations (storage, environmet, config).

- [ ]
