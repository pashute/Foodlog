# Developer Instructions

### File: develop.md — Version 0.1.0

The AI MAY NOT CHANGE ANYTHING IN THIS FILE. 

This file instructs the AI and the human developer on the development process.

It instructs the human developer on OAuth Setup & Lemon Squeezy Integration and deployment


## 1. Development Process

### 1.1 AI and developer interaction and methodology

1.1.1 Method: BDD, TDD, E2E testing
1.1.2 One feature at a time, not all cucumbers upfront

1.1.3 Per feature: 

  1 Feature plan: AI discusses feature with developer, asks for human approval, after writes gherkin scenario, human approval required, 
  2 Code and test: AI then write's code, AI proposes test and waits for humans response,  discusses the test, and after human approval AI writes and runs test, 
  3 Followup: 
  3.1 AI then discusses result with human before proceeding to next feature. 
  3.2 On failure: AI proposes cause, AI DOES NOT auto-fix. Waits for human instructions. 
  
### 1.2 Development Order: 

  1.2.1 Prototype mock development stage: 
    a. mock config (app info, user info,  ai info, sheet info)
    b. mock local storage (keys, initialize, update, get)
    c. mock oAuth google login with drive.file scope
    d. mock AI interaction (natural language canned text, carbs estimate)
    e. mock sheets integration (existsOrCreate(), logrow())

   These are all replaced with real code in production. 

  1.2.2  App development
   UI development  - no interaction
   a. App header
   b. Settings page
   c. Logger page

   See the two screenshot html files (identical to the images) in /docs/screenshots for reference. 

  1.2.3 Production development stage: 
   a. realize config 
   b. realize local storage
   b. realize oAuth and drive permissions
   c. AI interaction, sheets storage and integration, tested on localhost.


  1.2.4 The first release version: 
    a. deploy, 
    b. test deployment, 
    c. write release notes.


### 1.3 Feature Gherkin writing instructions

The Gherkin files written with the assistance of Claude code should be short, clear and direct, written with specific specifications and not generic ones, and strictly following the Requirements document. 

Each Gherkin file should be discussed and approved by the developer before writing or changing it. Discuss with the user after each file touched. 

The Gherkin files will be located in the directory  structure as follows: 

features
   prototype
	config
	oauth
            sheets
            ai.lang
            ai.carbs
   production
	config
	oauth
            sheets
            ai.lang
            ai.carbs
   layout
         basic panel
         	settings
         	logger
## 2. Future

- **Look and feel** — exact colors, spacing, and button positioning/styling.
  These are cosmetic checks, not behavior specs, so they're not covered by Cucumber yet. They'll get their own feature file when we get to visual polish.


## 3. Technology

### 3.1 Development Technology
- Editor: VS Code
- CI/CD: GitHub Actions, tbd
- Testing: Cucumber, Playwright, tbd
- Shell: PowerShell, Windows
- Versions and proj management:  Github repo and issues
- url:  http://www.github.com/pashute/Foodlog

### 3.2 Application Stack
- Backend: Node.js
- Frameworks: JavaScript only, no Python
- Frontend: React

### 3.4 Google OAuth 2.0 Setup

To enable user login and Google Sheets integration, the human develolper must configure a Google Cloud project and generate an OAuth Client ID:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **Foodlog**.
3. Navigate to **APIs & Services** > **Library** and enable:
   * **Google Sheets API**
   * **Google Drive API** (for locating or creating the food log sheet)
4. Go to **APIs & Services** > **OAuth consent screen**:
   * Select **External**.
   * Fill in app name (`Foodlog`), support email, and developer contact.
   * Add required scopes: `https://www.googleapis.com/auth/spreadsheets`, `https://www.googleapis.com/auth/drive.file`.
5. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**:
   * Application type: **Web application**.
   * Name: `Foodlog Web Client`.
   * **Authorized JavaScript origins:** Add your development URL (`http://localhost:5173`) and production domain (e.g., your Cloudflare Pages URL).
   * **Authorized redirect URIs:** Add your authentication redirect endpoints if applicable.
6. Copy the generated **Client ID** and replace `YOUR_GOOGLE_OAUTH_CLIENT_ID` in `src/App.jsx`.

---

## 4. Github sponsor Integration (Donateware)

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



  