#### # Foodlog Requirements

_Version 1.11_

# App Requirements Specification

## Core Workflow & UI

### Initial setup and login
- top right corner of mainpage:  Loggin/Username if logged:  leads to oauth login.   
- clicking on  username leads to Settings page.   
- after login, if no user api key was set goes to settings page.   

#### Settings page:  


- User: and username, or if not logged in - login button  
- Foodlog sheet  id and direct link.   
- Created on login if not stored in local chrome.   
- Before creation searches for an existing foodlog sheet.   
- Stored in local chrome storage.   


- Google flash (lite) api key    
-- textbox for api key. Checks key if entered
-- `?` Instructions hover button: tersely explains with link how to get flash (lite)  gemini api key, and that its free. 
-- checkmark turns green and checked if ok. stays red and with x if not. 
-- `Go to App`  button
-- disabled if api key not there, foodlog sheet missing  or if not logged in. 
--- in those cases warns in Setings instruction section 
-- `How to install` button explains how to make a pwa on your android phone, or just use from web. 

- Instruction section:  Text with instructions for missing info (login/ai api key/ foodlog sheet) or errors that occur (in red text). 

### Mainpage UI

- Top right corner of mainpage:  Loggin/Username if logged:  leads to oauth login. 
- **Timezone:** Current user’s timezone.  (? hover help button:  change this in your system settings)
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

- **Navigation:** 
	- **Food log** opens the user's Foodlog Google Sheet directly.



## AI Logic & Clarification (Gemini Flash-Lite)
- **Carb Estimation:** Parses the input string for time and carbohydrates.
- **Missing Data Handling:** If ambiguous (e.g., type of bread, portion size), AI prompts for clarification (e.g., "large, medium, or small apple?", "which bread?").
- **Clarification State:** Displays options to **"Submit Anyway"** (writes row with 0 carbs) or **"Fix"** (returns user to the prompt).

## Architecture & Privacy
- **Database:** None. Uses the user's own Google Sheet via Google OAuth 2.0.
- **API Key:** "Bring Your Own Key" model where users input their personal Google AI Studio API key (stored in local browser storage).
- **Hosting:** Static web frontend (Cloudflare Pages) for a permanent free tier with zero limits on traffic or monetization. Can be installed as a Progressive Web App (PWA) on mobile.

## Monetization Model

- **Pricing:** Freemium/Donateware (Free to use, optional "Pay What You Want" donations via Lemon Squeezy).
- **Merchant:** Lemon Squeezy handles optional voluntary tips/donations and global sales tax compliance.
- **Ads:** Zero advertisements.


## About Section
- **Open Source:** Your Google Sheets integration is entirely open source.
- **AI Processing:** Powered by Gemini Flash-lite to parse natural language messages and estimate nutritional values.
- **Examples:**
  - Input: *"Had a slice of sourdough 15 minutes ago"* -> AI checks if the bread type is clear; if vague, asks: *"Which kind of sourdough?"* with buttons to **Fix** or **Submit Anyway**.
  - Input: *"An apple"* -> AI asks: *"Large, medium, or small apple?"*

