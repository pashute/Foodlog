#### # Foodlog Requirements

_Version 0.1.1_
### File: requirements.md — Version 0.1.1

# App Requirements Specification

## Core Workflow & UI 

This section should be defined in the screens/layout and screens/interactions  folder of features. 

### App header

(See screenshots html)

- Look and feel of all components - according to config theme (default "dark")

- App name: top left corner {App name}(from config)
- Version: under the app name, in smaller font, {version} (from config)

- User & Settings: top right corner 
  - Login link 
    - Changes to username with Avatar when logged in
    - Enables Settings page and Logger page
  - Settings hamburger 
    - Enabled when logged in
    - Menu:  Settings, Log out


#### Settings page:  

- App info card: App name, Version, and Theme (Dark by default).

- Foodlog sheet  id and direct link.   
  - Created in user's Google Sheets on login if not stored in local chrome.   
  - Before creation searches for an existing Foodlog sheet.   
  - ID and link stored in local chrome storage.   
  - Error disables logging
  - During prototype stage this functionality and the sheet data itself is mocked. 

- Gemini API Key: []  (i)
  - Clicking or hovering on the i information shows a popup with the following: 
  
  For your privacy and security, you'll use your own Gemini access to read your meals and calculate energy and carbs. To do that use your Gemini key. It is stored locally and not shared with anyone. 

  - Tap "Get my Gemini key" — this opens Google AI Studio, already signed in as your account.
  - Tap "Create API key."
  - Copy the key and paste it here. 

The app should autodetect an api key in the clipboard
and as to paste it by pressing a button or be actually pasting it and pressing enter. The Change button changes to Save. 

(See Gemini key implementation under Technology section in this document)

- **Timezone:** Current user’s timezone. Click to change. (i) 
- Hovering over info button says: This changes the timezone in this app. Not the system settings. 

-- `Go to App`  button
-- disabled if api key not there, if the Foodlog sheet missing  or if not logged in. 
--- in those cases explain in the Settings warning row below the button:  Please log in. 

##### Gemini key access implementation notes 

User taps Get my Gemini API key.

Expo sends to AI Studio in a **Chrome Custom Tab** (not a Webview)  for sharing chrome logged in session. 

Note: The chrome login is accessed, not the app login. 

User must copy, and a paste field is shown  pre-filled if matches api key regex. 

Validate before saving 

Store with secure android keystore.


### Logger page

Under app header

- **Minutes ago Box:** 
- [-] [0] [+] minutesAgoInput. 
  - advances one minute up or down. 
  - minus is disabled if digit is 0. 
  - accepts positive numbers

  - if wasn't touched for 5 minutes and meal is listed (not submitted) 
  will add 5 minutes. 
     
- Label AFTER box:  "minutes ago". 
- added `(now)` for 0 minutes ago. 

- Time:  result of minutes ago HH:MM press. 
--  format: 
-- in the current user’s time and timezone. 
-- Does NOT advance with time. Is NOT a clock. 

- Carbs - current estimate of total for meal in grams. Given by AI a short time after user entered the meal, and before anybody presses anything.
- Energy - current estimate of total for meal in kilo-calories. Given by AI a short time after user entered the meal, and before anybody else presses anything.

- **Input:** Single multiline text box for food description.

- **Submit button** Green submit button with `>` on it

- **Instructions:**  multiline place for response, instructions, clarifications and errors. 


#### On submission

**The meal line is sent to the agentic AI to determine what is missing for a complete estimate, and for summing up the carbs and calories. 



- **Navigation:** 
	- **Food log** opens the user's Foodlog Google Sheet directly.


## AI Logic & Clarification (Gemini Flash-Lite)

- **Carb & Calorie Estimate:** Parses the input string, and estimates carbohydrates and calories per recognized food item, plus a total.

- **Per-item breakdown:** The AI estimate lists each recognized food (with its estimated weight), its carbs and calories, followed by a total row and a short note on any assumptions made (e.g., bread type, oil vs. water-packed, standard-size produce).

- **Missing Data Handling:** If ambiguous (e.g., type of bread, portion size), AI proceeds with a stated assumption (e.g., "large, medium, or small apple?", "which bread?") shown in the estimate.

- **Clarification State:** 
  - A determined meal is in `given` state. 
  - An undetermined meal with ambiguities is in `guess` state. 

**Analyzed Output:**  

- **Analyzed display:**
  - *top line* Total Carbs: {x} gr, Energy {y} kCal, Weight {z} gr
  - carbs, energy, qty, unit, food, carbs per 100g, cKal per 100g   
  - with ? after number or name if guess.
  - `???` if something not clear  

  : Options for user are: 
    - Fix: 
      - Takes back to text row marking missing details or other problems with a red underline. 
      - Each food type is given `portion`, `quantity`, `size` and `unit` before, and a pair of numbers marking carbs (gr) and energy (kcal) after, with two question marks if something is unknown. 
      - With a small delay the 
  
- **Foodlog sheet record**
  Once Log or Log anyway  were chosen a single row is prepended to the top of the Foodlog sheet data (under the header row):

- Format: 
  - Col A:  Header: “Timestamp”.  Format: `yyyy/mm/dd HH:MM, dow`.  
  eg  2026/07/26 11:02, Sun
  - Notes:  24 midnight is marked 00  
    - so 12:15 am is 00:15. 
    - and 3:10 pm is marked 15:10


  - Col B: Header: “Carbs”.   Number of carbs. `??`  if not determined. 
  - Col C: Header: “Calories”.  Number of calories. `??`  if not determined.
  - Col D:  Header: “Meal”.  Meal text:  comma separated single row with meal items: 

- Each meal item has: 
  - Qty # digit or (Estimate) large/medium/small
  - Unit
  - Food name
  - Details
  - Parenthesis with pair: Carbs (g), Energy (kcal)

- question-mark - for unknown digit  
- question mark after number if was guessed
- triple question mark if detail or food name not clear
  
  
## Infrastructure

### Config module and .yaml

- A infrastructure/config module with a get(section, key) takes from config.yaml in the source, with the following sections: 
  - app:  appname (Foodlog), version (0.1.1), theme: (dark)
  - storage:  encryption (secure android keystore), aiKeyName (GeminiKey)
  - sheets: name (Foodlog), link: (sheets.google.com/Foodlog), id (the foodlog file id), 
- 
 Note: at prototype stage there is no file, just a mockup file (in dev/features/infrastructure) that returns a simulation of results for the get(section, key) calls. 

### Storage 

  Storage (behind one shared interface, platform-branched):
  - Tauri desktop → Rust `keyring` command via `invoke` (DPAPI/Credential Manager).
  - Android → expo-secure-store (Keystore).
  - iphone → to be defined
  - 
- Key-fetch browser step is platform-branched (few lines, not a second screen set):
  - Desktop → open system browser via Tauri opener.
  - Android → Chrome Custom Tab (expo-web-browser).
  
### OAuth

in src/infrastructure/auth.   Prototype mock in dev/features/infrastructure

The OAuth will deal with the four stages of logging in
- Checking for already logged in chrome. If not: 
- Checking for multiple accounts and chosing the username's one
- Login with drive.file scope
- Log out if requested.

The two client ids (for Tauri desktop app and for the android one)
will be stored in src/infrastructure/auth/ 

Note: During prototype stage a mockup of the screens and their functionaly will be provided.

### AI

API key stored in secure storage:  

- One shared interface, platform-branched:
  - Tauri desktop → Rust `keyring` command via `invoke` (DPAPI/Credential Manager).
  - Android → expo-secure-store (Keystore).

- Read Settings specifications in this document, and the technology section on key retrieval.

- AI.lang - reads meal text, disambiguates, marks questions (json result)
- AI.carbs - estimates and sums. 

### Foodlog sheet

- Reads/writes to Foodlog sheet by settings details.
- Can check if the file exists and 
Can write to row

## Architecture & Privacy

- **Database:** None. Uses the user's own Google Sheet via Google OAuth 2.0.
- **API Key:** "Bring Your Own Key" model where users input their personal Google AI Studio API key stored securely. See below.
- 
- ** Available for security of API key as android or web app. See below about development technology. 

## Monetization Model

- **Pricing:** Freemium/Donationware (Free to use, optional one-time support via GitHub Sponsors tiers).
- **Merchant:** GitHub Sponsors handles optional one-time tips/donations; the developer files tax/compliance directly (see develop.md).
- 
- **Ads:** Zero advertisements.


## About section
- **Open Source:** Your Google Sheets integration is entirely open source.

- **AI Processing:** Powered by Gemini Flash-lite to parse natural language messages and estimate nutritional values.
- **Examples:**
  - Input: *"Had a slice of sourdough 15 minutes ago"* -> AI checks if the bread type is clear; if vague, asks: *"Which kind of sourdough?"* with buttons to **Fix** or **Submit Anyway**.
  - Input: *"An apple"* -> AI asks: *"Large, medium, or small apple?"*

## Development Technology

### Architecture: one RN/Expo codebase → Tauri desktop + (future) Android  + (far future) Apple IOS (IPhone/IPad)

- Screens written once in React Native (Expo). Two render paths:
  - Android: RN components render natively.
  - Desktop: `expo export --platform web` (react-native-web → DOM) → Tauri wraps that     web bundle into a native `.exe`.
  
- Shared: screens, business logic, Gemini API calls, validation (plain TS/RN).

- Storage (behind one shared interface, platform-branched):
  - Tauri desktop → Rust `keyring` command via `invoke` (DPAPI/Credential Manager).
  - Android → expo-secure-store (Keystore).
 
  Settings key-fetch (assisting user to get their Gemini API key) is platform-branched (a few lines of code):
  - Desktop → open system browser via Tauri opener.
  - Android → Chrome Custom Tab (expo-web-browser).
  
  
### Build pipeline
- Desktop build = expo web export → Tauri build → .exe. (Expo web is a build STEP, not a shipped browser target.)

### Guard: never run as a plain web app
- Expo web output is only ever consumed by Tauri — never hosted or served to a browser.
- Runtime guard: on startup require `window.__TAURI__` (or successful `@tauri-apps/api`
  import, or android). If absent on the desktop/web bundle, refuse to mount key UI and show a
  "desktop app only" message — secure storage is unavailable outside the Tauri shell.
- No web hosting / no public web deploy step in CI. No `expo start --web` for real use.



## Future

- Advanced fix - allow on each analyzed row to edit food and details with a dropdown that always includes an open textbox besides the ai given options.

- Internationalization: from lang.yaml 

- UX beautification with themes and other user choices

- AI speech integration

- Setup: Get Meals Summary - context for better AI guessing. 
- Edit meal summary - manually correcting the AI summary. 
