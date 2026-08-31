  # File: requirements.md 
  # Version 0.2.1

# Foodlog App Requirements Specification

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
    - Enables Settings page and Diary page
  - Settings hamburger 
    - Enabled when logged in
    - Menu:  Settings, Log out

#### OAuth login
 - When user presses the app header's [Login with Google]
   - A calming scope starter popup shows, explaining why we need drive.file scope and an ai api key.
   - On any error that occurs we notify the user and logout
   - Successful login is followed by setup (sheet, config, ai)

#### Settings page:  

- App info card: Theme (Dark by default). App name and Version are shown in the header only, not repeated here.
  - Info icon (ⓘ) at the end of the row. Pressing and holding it shows in the dedicated instruction card: Theme change not yet available.

- Foodlog sheet  id and direct link.   
  - Created in user's Google Sheets on login if not already persisted.   
  - Before creation searches for an existing Foodlog sheet.
  - ID securely persisted per user
  - Error disables diary
  - During prototype stage this functionality and the sheet data itself are mocked. 

- Gemini API Key: status LED + Start AI button + info icon (ⓘ), icon after the button.
  - Pressing and holding the info icon shows in the dedicated instruction card: Press "Start AI" to see how & why
  - Tapping "Start AI" opens the Gemini key setup dialog:
    - Header: Gemini key
    - Explains, in plain "it's about you" language (no "we need"/apologizing), that a free personal Gemini session keeps the user's meal data private, with a link to Google's [Privacy Statement](https://policies.google.com/privacy)
    - Numbered steps, each paired with a screenshot (already in `src/imgs/aiKey`, each circling the relevant button): go to [Google AI Studio](https://aistudio.google.com/app/api-keys); click Create API Key in the top-left corner; use the default project; paste the key
    - A field to paste the key and a SAVE button, enabled only once the pasted key looks valid; an invalid save attempt shows "Invalid key, try again"

(See Gemini key implementation under Technology section devtech.md)

- **Timezone:** Current user's timezone. Click to change. Info icon (ⓘ) after the Change button.
  - Pressing and holding the info icon shows in the dedicated instruction card: This changes the timezone in this app, but not the system settings.

**Intentional implementation note:** The default will be IDT UTC+3 Jerusalem, Israel.

- Only one instruction card exists, at the top of the whole Settings screen. It is idle by default and its text changes to match whichever info icon is currently pressed and held, reverting to the idle instruction on release — there are no separate per-card popups.

-- `Go to Diary`  button
-- disabled if api key not there, if the Foodlog sheet missing, or if not logged in. 
--- in those cases the top instruction card shows one problem at a time, in priority order:
---- not logged in: 'Press "Login with Google" to use the app.'
---- AI key missing/invalid: "Press [Start AI] for AI key instructions"
---- no problem: "Press \"Go to Diary\" to use the app."



### Diary page

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


## AI Logic & AI Suggestions (Gemini Flash-Lite)

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

### Config module, code constants and environment variables 

- A infrastructure/config module with an object devided into sections and keys is used for app configuration. 

Defaults are loaded on app startup. And replaced with values from storage (see storage section) and from constants in code on login.  

Environment variables will be: 
  The development stage: prototype or production.
  The target platform: web, desktop, android, ios
  
  The following are code constants: 
  App configuration: 
  -  The app name: [Foodlog], 
  -  The app version (major.minor.patch)
  Sheet configuration: 
  - The Sheet drive-folder name: [Foodlogs]
  - The Sheet name: [Foodlog]

  The following can be changed: (in a dedicated screen)
  - Theme [Dark] - currently the only option
  - Time zone - Default: loads from system if not chosen. 
       if system not available defaults to Jerusalem, Israel time zone. 

  Note: authToken, aiApiKey, and sheetId now live in the storage module (see infrastructure/storage), not config.
- 
 Note: at prototype stage there is no storage, just a mockup file holding the defaults and saving changes in memory from the configuration editor screen. 

### Storage 

1. Storage definition:  Anything needed to be stored between applications, or stored securely encrypted will use a tiny backend. 

2. Privacy: No personal data entries are stored or collected by the app. 
   
3. The app stores only keys needed to pass the data from the locally run app (a web client in the user's browser, or a phone or desktop app) to the user's owned drive data accessed only by them, and to the AI with its privacy terms. (Auth tokens, sheet id, and ai key)

4. Future planned keys are the "likes" shared store and the like user hash for determining if this user already liked once. 

5. Non secure default data is loaded to config object on startup, 
and then changed to user defined changes when saved after changes in app: settings screen, or currently disabled config screen.


### AI

API key stored in secure storage.  

Modules: 
- AI.lang - reads meal text, disambiguates, marks questions (json result)
- AI.carbs - estimates and sums. 

### Foodlog sheet

- Foodlog sheet id stored per user securely for access and link
- App can check if the file exists, can read and write in it


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



## Future features

- Advanced fix - allow on each analyzed row to edit food and details with a dropdown that always includes an open textbox besides the ai given options.

- Internationalization: from lang.yaml 

- UX beautification with themes and other user choices

- AI speech integration

- Setup: Get Meals Summary - context for better AI guessing. 
- Edit meal summary - manually correcting the AI summary. 

# Future Features

## GitHub Sponsors donor count
- GitHub API returns public sponsor count
- `https://api.github.com/users/pashute/sponsors` (public, no auth needed)
- Display in app: "X people support Foodlog ❤️"
- Cloudflare Worker fetches and caches it (refresh daily)
  so the app doesn't hammer GitHub API

## Anonymous Like button
- One heart per user, toggleable, anonymous count
- Add to Cloudflare Worker:
  POST /like/toggle   Authorization: Bearer <access_token>
  GET  /like/count    → { count: 1234 }
  GET  /like/mine     Authorization: Bearer <access_token> → { liked: true|false }
- Worker stores:
  plain KV:     like:count  → running total
  secure KV:    like:<user_id> → true|false  (anonymous: user_id is hashed)
- user_id is hashed (SHA-256) before storing so you never know WHO liked,
  only WHETHER this user liked and the total count
- Toggle: if liked → unlike (count--), if not → like (count++)
- UI: heart icon, count next to it, fills on tap, remembers across devices