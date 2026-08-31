/# Filename: appSetup.md
/# Version: 0.2.4

New definitions:  

OAuth and Cloudflare overhaul

Instead of client side oauth  
we move it to cloudflare,  for security

hoping the users don't cause the cloudflare account to exceed its limits. 

------------------

## Todo planning

## General notes before starting
1. Keep code with the clean decoupled design  
i.e. mock called very late in flow, tests check the module calls not the implementation, so they all go the same path, and only end up forking according to target platform development stage or type of server. 

For config and storage we built a design where the data is separate from how it is accessed and then through accessors it gets loaded when neeeds to be loaded (or its parts get loaded when they need to be loaded).  No mention of how and where it is actually taken from or stored at, for as late as possible. 

1. Specific note about targets:  We have four types of web code: all four are platform web: 
- developer stage: prototype or production 
- server type: develop (localhost) published (github pages)

- [ ] We have to fix this in the definitions of the env, (with remarks similar to the ones there now)
and use them accordingly. 


## AI Todo list
- AI will read the todo.md instructions 
- Then it will go over this file (appsetup.md) and create todos in the Todo.md 
for the developer to review. 
- The AI should not fix or change anything in the code till the todo list plan was approved. No coding. No running. 
- The AI should not touch this appSetup.md file

- The todo batch should be called: # batch cloud storage aug 31

The top of the todo batch will have a section for the user's item headlines. 
called ## developer todo list (oauth and storage overhaul)
Mark them completed if known to be done. list file location if known. 
Leave unmarked otherwise. 

- [ ] developer online: using `console.cloud.google.com`.
     create app worker. 
    - [v]  created: https://foodlog-storage.pashute.workers.dev/


Then comes the `## AI coding` section which the AI is to do (once approved)
Break it into sections of coding (storage overhaul, post-login entry procedure, storage load, config load, settings warn update (red),  etc. 

- I think we should start with the two  src/backend/storage ts files  workerConfig and workerStorage.

- Add also points for discussion where you want it 
  - only terse headline of each discussion topic needed

## Cloudflare setup

- [ ] The developer has set up cloudflare
- [ ] 

- [ ]  worker url: 
  - [ ]  CLOUDFLARE_STORAGE_URL 
  - [ ]  and CLOUDFLARE_CONFIGURATION_URL 
  are in src/infrastructure/config/config.ts (env vars)

We have two worker kv storages
- [ ] foodlog_storage_kv
  - [ ] per client and user:

    - [ ] auth/token  // refresh token
    - [ ] user/email
    - [ ] sheet/id
    - [ ] ai/key

- [ ] foodlog_config_kv
- [ ] defaults loaded on app entry
- [ ] values from CF loaded after login
- [ ] SAVE on changes to config edit screen
- [ ] Change config screen with timezone
- [ ] Change settings Warn function to draw red line around instruction card border. and Red font. 
- [ ] Change to return to white when error text removed. 
- [ ] Check that each error has a path to clear it. 
  - [ ] currently all config fields are for the future, and cannot be edited.
    - [ ] ui/theme // (default: dark)
    - [ ] timezone/name // (default: idt)
    - [ ] timezone/shift // number. note `UTC+` for positive numbers or `UTC` for negative ones.
    - [ ] timezone/location // default Jerusalem/Israel

We need to set the client secret in CF secret storage  and client id in client wide (for all users) clientid  in foodlog_storage_kv 

- [ ]  client secret setup code:  (terminal)

- [ ]  clientid setup code: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (web), EXPO_PUBLIC_GOOGLE_TAURI_CLIENT_ID (tauri), etc. - from env vars
- [ ]  clientid in app - in src/infrastructure/auth/authClientIds.ts (sourced from env vars)

## Cloudflare Oauth: 

### 1. Initial Client Login Flow

1a. On the entry screen the user presses **Let me in**.

- [x] put login button text in infrastructure/texts.ts and take from there. (starter.dlg.tsx has hardcoded text, need to extract to texts.ts) 

- [x] make login instruction in parts from texts with button name. and take from that instruction for the start instruction. (starter.ts has hardcoded text, need to extract) 
  
1b. On the starter popup the user presses **Login with Google**.

- [x] src/infrastructure/auth/starter.dlg.tsx — UI component, logic in starter.ts (separated for testability)

1. **OAuth Trigger:** The client generates a PKCE `code_verifier` and `code_challenge`, and launches the OAuth session. 
   * *Crucial Rule for Refresh Tokens:* The request **must** include `access_type=offline` and `prompt=consent` to ensure Google returns a refresh token on the first exchange.

- [x] src/infrastructure/auth/oauth.web.ts (web) / oauth.tauri.ts / oauth.android.ts / oauth.ios.ts — platform-specific implementations
- [x] Unified dispatcher in src/infrastructure/auth/auth.ts (calls platform-specific login() based on runtime detection). Mock kept separate in src/prototype/oauth/oauth.mock.ts. Correct structure preserved.

2. **Authentication:** The user chooses an account or logs in directly with their credentials.

- [v] this is part of auth. we don't control it except in the prototype mock. 

3. **Consent:** Google displays the permission screen, and the user accepts.

- [v] same as above. not in our hands. 

4. **Auth Code Capture:** Google redirects back to the client application, returning a temporary, single-use `authorization code`.

### 2. Backend (Cloudflare) Tokenization

2.1 **Secret Provisioning:** 
The Google OAuth `client_secret` is pre-stored securely in Cloudflare's encrypted environment secret storage (shared across all users, but isolated per client project):

   ```bash
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   ```

2.2 **Code Handoff:** 
The client app immediately sends the temporary authorization code and the PKCE `code_verifier` to the Cloudflare Worker endpoint (`POST /api/auth/exchange`).

- [ ] src/infrastructure/auth/oauthSession.ts already calls /auth/exchange (line 41, via exchange() function) 
- [ ] developer's response:  WHAT?!!!!
- [ ] Worker stub written: src/backend/auth/worker.ts (copy to wrangler project)

2.3 **Server-to-Server Exchange:** 
The Cloudflare Worker combines the incoming code with the hidden `GOOGLE_CLIENT_SECRET` and the public `client_id`, executing a backend fetch request to Google's token endpoint (`https://oauth2.googleapis.com/token`).

2.4 **Encrypted KV Persistence:** 
Google returns both an `access_token` and a long-lived `refresh_token`. 
The Cloudflare Worker encrypts the `refresh_token` using the Web Crypto API and stores it in Cloudflare KV, scoped strictly per user.

- [ ] src/backend/auth/worker.ts has TODOs: implement refresh token encryption/storage in KV (for native platforms only, web has no refresh token) 

2.5 **Handshake Completion:** 
The Worker responds to the client app with only a short-lived `access_token` and its expiration timestamp. The client caches the access token in memory only (via React state), preventing persistent local token storage vulnerabilities.

- [x] src/infrastructure/storage/storage.ts — stores sessionToken in sessionStorage (short-lived, memory only)
- [x] src/backend/auth/worker.ts returns { sessionToken, accessToken, expiresIn } on successful exchange 



### 3. **Subsequent API Calls & Expiration Management**

3.1 **Direct REST Execution:** 
Client apps (Web and Tauri) make direct REST calls to Google Sheets or Drive APIs using the Bearer token header: `Authorization: Bearer <access_token>`.

- [x] src/infrastructure/sheet/sheet.ts — makes Sheets API calls
- [x] src/infrastructure/storage/storage.ts — adds sessionToken to request headers (Authorization: Bearer)
- [ ] Needs: Verify Bearer token is passed in all API requests 


3.2 **Local Expiration Tracking:** 
The client checks the access token's expiration timestamp locally in memory before making outgoing requests.

- [ ] Needs: Store expiration timestamp with sessionToken, check before API calls in src/infrastructure/sheet/sheet.ts 

3.3 **Seamless Token Refresh:** 
When the access token expires (~1 hour later), the client calls the Cloudflare Worker refresh endpoint (`POST /api/auth/refresh`). 
The Worker retrieves the user's encrypted `refresh_token` from Cloudflare KV, requests a brand-new access token from Google behind the scenes, 
and returns it to the client 
without forcing the user to see a login popup again.

- [x] src/backend/auth/worker.ts has /api/auth/refresh endpoint (stub with TODO comments)
- [ ] Option C: Lazy refresh on 401 errors (client detects 401, calls refresh, retries). Implementation: error handler in storage.ts fetch()

## Entry after login
  
  - [ ] onLoginSuccess app entry : in App.tsx or main app entry
  - [x] config.load 
    - [x] on app entry config defaults were loaded (handled by config.ts, no changes needed)

    - [ ] sheet.load using sheet.sheetId 
          - from storage (KV via sessionToken)
          - verify via Sheets API
          - not verified or missing attempt folder and then file by name
          - failed? warn and disable settings

    - [ ] settings.aiKey load 
        - from storage (KV)
        - missing? - leave instruction 
        - all ok?  enable Diary (Data Entry)
        - [x] button/instruction text in src/infrastructure/texts.ts (formatter.settings.instruction.needAiKey, formatter.info.aiKey)

- [x] Client auth flow: src/infrastructure/auth/auth.ts (dispatcher) → platform-specific oauth.web/tauri/android/ios → starter.ts/starter.dlg.tsx (confirmation popup)

## Cloudflare Worker Code - Planned Implementation

**Location:** Copy to wrangler project's src/index.ts or auth handler

**File: src/backend/auth/worker.ts (pseudocode)**

```typescript
// OAuth token exchange and refresh endpoints
export interface Env {
  FOODLOG_SECURE_KV: KVNamespace
  SESSION_SECRET: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_CLIENT_ID: string
}

// Helper functions (reuse from storage/worker.ts):
// - base64Url(), decodeBase64Url(), sign(), userId()
// - createSessionToken(userId, secret, expiresInHours)

async function exchangeAuthCode(request: Request, env: Env) {
  // POST /api/auth/exchange
  // Body: { code, clientId, redirectUri, codeVerifier, platform }
  // 1. POST to https://oauth2.googleapis.com/token with Google credentials
  // 2. Extract userId from id_token JWT
  // 3. Store refresh_token in KV (only for native platforms)
  // 4. Return { sessionToken, accessToken, expiresIn }
}

async function refreshAccessToken(request: Request, env: Env) {
  // POST /api/auth/refresh with Bearer <sessionToken>
  // 1. Validate sessionToken (extract userId)
  // 2. Retrieve refresh_token from KV
  // 3. POST to Google with refresh_token
  // 4. Return { accessToken, expiresIn }
  // On fail: return 401 (lazy refresh pattern)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname
    if (path === '/api/auth/exchange' && request.method === 'POST') {
      return exchangeAuthCode(request, env)
    }
    if (path === '/api/auth/refresh' && request.method === 'POST') {
      return refreshAccessToken(request, env)
    }
    return json({ error: 'not_found' }, 404)
  }
}
```

**Key Implementation Details:**
- Session tokens: HMAC-signed JWT-like format (reuse sign/userId pattern from storage/configuration workers)
- Refresh token encryption: Use Web Crypto API (optional, for native platforms)
- Client refresh flow: Option C - lazy 401 handling in storage.ts fetch() wrapper
- Google endpoints:
  - Exchange: POST https://oauth2.googleapis.com/token (code → accessToken + refreshToken)
  - Refresh: POST https://oauth2.googleapis.com/token (refreshToken → accessToken) 


-------


## The prototype setup should run a login e2e test 
Look at this e2e test that it actually does stuff, and doesn't just skip. 

The test should check the after login entry (setup) sequence of config, sheet load,  and api key succeeds and we can advance further to the diary. This should be the same order as what happens in the production, calling the same modules and elements. so if the login sequence changed for production we should see it in the mock as well.


and that canceling the login stops with the correct warning in the settings instruction. (we changed the settings instruction warn to be a red card border with red font)

## When ready to test production/web/develop

Instruct the human developer: 

1. Run `npm run web`.
2. Open the app in the browser at the printed local URL.
3. Click **Login with Google**.
4. Approve the `drive.file` scope.
5. Confirm the browser returns to `http://localhost:8081/auth` and then back into the app.
6. Check the app. 

## Code cleanup: 
1. features and tests removal and fixing. 
2. set fixture setup with human in the loop. (login)

## Documentation cleanup

## Entry testing with ai
