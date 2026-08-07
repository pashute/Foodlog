#### # Foodlog Requirements

_Version 0.1.1_
### File: requirements.md — Version 0.1.1

# App Requirements Specification

## Core Workflow & UI

### App top bar

- App name: top left corner App name from config (Foodlog)
- Version:  Under app name version from config(beginning with: "Version 0.1.1")

- User & Settings: top right corner 
  - Login link 
    - Changes to username with Avatar when logged in
    - Enables Settings page and Logger page
  - Settings hamburger 
    - enabled when logged in
    - leads to settings page


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

(implementation notes:
1. Launch via Chrome Custom Tabs, not a WebView (WebView won't share the Google session and may get blocked by Google's sign-in policies anyway).
2. URL: https://aistudio.google.com/apikey?authuser=<the email they signed in with>
3. If that account has no active Chrome session on the device (uncommon, but possible — e.g. they cleared cookies or use a different browser as default), they'll just see a normal one-tap Google sign-in — not a failure state
)

- **Timezone:** Current user’s timezone. Click to change. (i) 
- Hovering over info button says: This changes the timezone in this app. Not the system settings. 

-- `Go to App`  button
-- disabled if api key not there, if the Foodlog sheet missing  or if not logged in. 
--- in those cases explain in the Settings warning row below the button:  Please log in. 

### Logger page

Under app header

- **Minutes ago Box:** 
- Defaults to `[NOW]`. (value 0 minutes ago)
- Clicking it reveals a numeric minutes offset option. [-] [0] [+]   
- Label AFTER box:  "minutes ago".
- Timestamp text:  result of minutes ago. 
--  format: `yyyy/mm/dd HH:MM, dow` 
-- in the current user’s timezone. 
-- updates with the time like an online clock



- **Input:** Single multiline text box for food description.

- **Submit button** Green submit button with `>` on it

- **Instructions:**  multiline place for response, instructions, clarifications and errors. 


#### On submission

**Submission Output:**  

- Immediately prepends a row to the user's Google Sheet 
- and displays *only* the newly added line below the input box.
- Format: 
-- Col A:  Header: “Timestamp”.  Format: `yyyy/mm/dd HH:MM, dow`.  
eg  2026/07/26 11:02, Sun
-- Notes:  24 midnight is marked 00  
--- so 12:15 am is 00:15. 
--- and 3:10 pm is marked 15:10


-- Col B: Header: “Carbs”.   Number of carbs. `?`  if not determined. 
-- Col C:  Header: “Meal”.  Meal text. 
-- Col D: Header: “Calories”.  Number of calories. `?`  if not determined.

- **Navigation:** 
	- **Food log** opens the user's Foodlog Google Sheet directly.



## AI Logic & Clarification (Gemini Flash-Lite)

- **Carb & Calorie Estimation:** Parses the input string for time, and estimates carbohydrates and calories per recognized food item, plus a total.
- **Per-item breakdown:** The AI estimate lists each recognized food (with its estimated weight), its carbs and calories, followed by a total row and a short note on any assumptions made (e.g., bread type, oil vs. water-packed, standard-size produce).
- **Missing Data Handling:** If ambiguous (e.g., type of bread, portion size), AI proceeds with a stated assumption (e.g., "large, medium, or small apple?", "which bread?") shown in the estimate.
- **Clarification State:** Displays options to **"Log Anyway"** (writes row with 0 carbs and 0 calories if undetermined) or **"Fix"** (returns user to the prompt).

## Architecture & Privacy
- **Database:** None. Uses the user's own Google Sheet via Google OAuth 2.0.
- **API Key:** "Bring Your Own Key" model where users input their personal Google AI Studio API key (stored in local browser storage).
- **Hosting:** Static web frontend (Cloudflare Pages) for a permanent free tier with zero limits on traffic or monetization. Can be installed as a Progressive Web App (PWA) on mobile.

## Monetization Model

- **Pricing:** Freemium/Donateware (Free to use, optional one-time support via GitHub Sponsors tiers).
- **Merchant:** GitHub Sponsors handles optional one-time tips/donations; the developer files tax/compliance directly (see develop.md).
- **Ads:** Zero advertisements.


## About Section
- **Open Source:** Your Google Sheets integration is entirely open source.
- **AI Processing:** Powered by Gemini Flash-lite to parse natural language messages and estimate nutritional values.
- **Examples:**
  - Input: *"Had a slice of sourdough 15 minutes ago"* -> AI checks if the bread type is clear; if vague, asks: *"Which kind of sourdough?"* with buttons to **Fix** or **Submit Anyway**.
  - Input: *"An apple"* -> AI asks: *"Large, medium, or small apple?"*

