# Developer Instructions

### File: develop.md — Version 1.2.0

Development process, OAuth Setup & Lemon Squeezy Integration and deployment


## Development Process
- Method: BDD, TDD, E2E testing
- One feature at a time, not all cucumbers upfront
- Per feature: 
  - AI discusses, writes cucumber scenario, human approval required, 
  - AI then write's code, AI proposes test and waits for humans response,  discusses the test, and after human approval AI writes and runs test, 
  - then discusses result with human before proceeding to next feature. 
    - On failure: AI proposes cause, no auto-fix, human approves before proceeding
  
### Development Order: 

  1. Mock version: mock oAuth, mock AI interaction, mock sheets integration.
  2. Test version: oAuth, AI interaction, sheets storage and integration, tested on localhost.
  3. Release version: 3a. deploy, 3b. test deployment, 3c. release notes.

## Technology

### Development Technology
- Editor: VS Code
- CI/CD: GitHub Actions, tbd
- Testing: Cucumber, Playwright, tbd
- Shell: PowerShell, Windows
- Versions and proj management:  Github repo and issues
- url:  http://www.github.com/pashute/Foodlog

### Application Stack
- Backend: Node.js
- Frameworks: JavaScript only, no Python
- Frontend: React

## 1. Google OAuth 2.0 Setup

To enable user login and Google Sheets integration, configure a Google Cloud project and generate an OAuth Client ID.

### Steps for the Developer:
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

## 2. Lemon Squeezy Integration (Donateware)

To accept optional "Pay What You Want" donations as specified in the project requirements, configure a product and checkout link via Lemon Squeezy.

### Steps for the Developer:
1. Create or log into your account on [Lemon Squeezy](https://www.lemonsqueezy.com/).
2. Set up a **Store** configured for global tax compliance and payouts.
3. Create a new **Product**:
   * Name: `Foodlog Support` or `Voluntary Donation`.
   * Price Type: **Pay what you want** (with an optional minimum amount if desired).
4. Publish the product and generate a **Checkout URL**.
5. In `src/App.jsx` (within the settings view), update the anchor tag href with your official Lemon Squeezy checkout link:
   ```jsx
   <a href="[https://your-store.lemonsqueezy.com/checkout/buy/your-product-id](https://your-store.lemonsqueezy.com/checkout/buy/your-product-id)" target="_blank" rel="noopener noreferrer" className="block text-center bg-zinc-800 text-white py-2 rounded">
     Donate via Lemon Squeezy
   </a>
