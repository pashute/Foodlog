# Development steps

### File: develop.md — File version 0.1.2

The AI MAY NOT CHANGE ANYTHING IN THIS FILE. 

This file gives the steps and order in which we'll be developing the project
according to the requirements.md  

The AI (Claude code) when coding, will follow the single instructions.md file's instructions, and consult this file for learning the order of component development. 

This file includes the steps the human developer needs to take to set up the  OAuth, and the donation components. 


## 1. Development Process

  
### 1.Development Order: 

  1.1 Infrastructure
     We'll write the actual requirements for the infrastructure.  

     But when we come to develop it, at the prototype stage we'll use mock data for all of them. 

  1.2 
    a. mock config service
    b. mock local storage (keys, initialize, update, get)
    c. mock oAuth google login with drive.file scope
    d. mock AI interaction (natural language canned text, carbs estimate)
    e. mock sheets integration (existsOrCreate(), logrow())

   These are all replaced with real code in production. 

  1.2  App development
   UI development  - no interaction
   a. App header
   b. Settings page
   c. Logger page

   See the two screenshot html files (identical to the images) in dev/docs/screenshots for reference. 

  1.3 Production development stage: 
   a. realize config 
   b. realize local storage
   b. realize oAuth 
   c. realize AI interaction, 
   d. realize sheets storage and integration


  1.4 The first release version: 

### 222
1. Gherkin features structure: 

The Gherkin files will be located in the directory  structure as follows: 

'''
features  

  infrastructure  # see requirements file 
    config  # module with get(section, key). .yaml file
    storage # see requirements technology details about gemini api key
	  oauth   # google login, profile choice, drive.file scope
    sheets  # access to drive.file, create if not exist 
    ai.lang # understand meal
    ai.carbs # find and sum carbs and energy, mark ambiguities and questions. 

  prototype
     # single feature that says: all infrastructure modules available via mockup
  
  screens
    layout
      header
      settings
      logger
    interaction
      entry # initial state enabled components
      setup # settings page functionality
      logging # logger page functionality
  
'''

## 3. Future

- **Look and feel** — custom colors, themes and experience - to be completed
  


## 4. Technology

### 4.1 Development Technology
- Editor: VS Code
- CI/CD: GitHub Actions, tbd
- Testing: Cucumber, Playwright, React native testing (on Jest)
- Shell: PowerShell, Windows
- Versions and proj management:  Github repo and issues
- url:  http://www.github.com/pashute/Foodlog
  
- 

### 4.1a Gemini AI Testing Strategy

AI.lang and AI.carbs are tested in two separate tiers:

1. **Real-integration test** — sends meal-text prompts to the actual
   Gemini Flash-Lite API (real API key), exercised manually/CI-gated since
   it needs live credentials and costs real API calls. Its recorded
   responses (carb/energy estimates, ambiguity markers) become the source
   of truth below.

2. **Mock test (default suite)** — runs in the normal Cucumber/Playwright/Jest
   suite against a mock AI service whose canned responses are derived from
   what the real-integration test actually observed (not guessed), so the
   mock stays honest as Gemini's behavior evolves.

The mock tier runs on every commit; the real tier runs separately (not on
every commit) since it depends on live external API calls.

### 4.2 Application Stack
- Backend: Node.js
- Frameworks: JavaScript only, no Python
- Frontend: React native + Tauri  1. Tauri web app  2. android (future)  3. iphone (far future)

### 4.3 Google OAuth 2.0 Setup

To enable user login and Google Sheets integration, the human developer must configure a Google Cloud project and generate an OAuth Client ID:

#### step 1. Project + APIs
1. Go to the Google Cloud Console (https://console.cloud.google.com/).
2. Create a new project named **Foodlog**.
3. APIs & Services > Library — enable:
   - **Google Sheets API**
   - **Google Drive API** (for locating/creating the food-log sheet)

#### step 2. OAuth consent screen
4. APIs & Services > OAuth consent screen:
   - User type: **External**.
   - Fill in app name (`Foodlog`), support email, developer contact.
   - Add scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
   - While unverified, add your Google account under **Test users**.

#### step 3. Credentials — native clients (NOT "Web application")

Create a native client per platform:

   APIs & Services > Credentials > Create Credentials > OAuth client ID:
   
   - for **Tauri desktop:**
     - Application type: **Desktop app** (installed-app flow).
     - Redirect via **loopback** `http://127.0.0.1:<port>` OR a registered **custom scheme**
       (e.g. `foodlog://`) using Tauri's deep-link / oauth plugin.

   
   - for **Android (Expo):**
     - Application type: **Android**.
     - Provide the app's **package name** + **SHA-1 signing-cert fingerprint**.
     - Recommended: use **expo-auth-session**, which handles the redirect via a custom scheme
       (redirect is a URI scheme, not a JavaScript origin).
   
   
#### step 4. Wire it up
   Store each platform's **Client ID** in config (per-platform), not hard-coded in one shared file.
7. Implement the platform-appropriate auth flow:
   - Android → expo-auth-session with the custom redirect scheme.
   - Tauri → loopback (or custom-scheme deep link) to receive the OAuth redirect.

### Path of least resistance
- Mobile: **expo-auth-session** (handles Google OAuth + redirect scheme for you).
- Desktop: **Tauri loopback flow** (open system browser → Google consent → redirect to
  `127.0.0.1:<port>` your app briefly listens on). Avoids fighting raw Google client types.


---

## 5. Github sponsor Integration (donationware)

Steps for the Developer:    
- Go to github.com/sponsors → "Get sponsored" → select your account → country: Israel.  
- Enable 2FA on GitHub first (Settings → Password and authentication) — required.
- Fill profile + 2–3 tiers (e.g., $2 / $5 one-time), 
- then submit Israeli bank details via Stripe; 
  - verify name/DOB carefully — hard to fix later.
  - Wait a few days for Stripe identity approval.
- Add .github/FUNDING.yml to your repo with the line:
  github: pashute 
- and point your app's Donate button to https://github.com/sponsors/pashute.

Fill in tax details as needed:  W9 and Form 1116 (double taxation). FBAR (foreign bank account)
