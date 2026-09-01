# App Setup Plan (v0.2.4)

New definitions:

OAuth and Cloudflare overhaul

Instead of client side oauth
we move it to cloudflare, for security

hoping the users don't cause the cloudflare account to exceed its limits.

------------------

## Todo planning

## General notes before starting

1. Keep code with the clean decoupled design
i.e. mock called very late in flow, tests check the module calls not the implementation, so they all go the same path, and only end up forking according to target platform development stage or type of server.

For config and storage we built a design where the data is separate from how it is accessed and then through accessors it gets loaded when it needs to be loaded (or its parts get loaded when they need to be loaded).
No mention of how and where it is actually taken from or stored at, for as late as possible.

1. Specific note about targets:
We have four types of web code: all four are actually web apps covered up

- Target platform: web (expo) / desktop (tauri) / android (eas) / ios (eas)
  - EAS = Expo App Service, Tauri = windows desktop wrapper for Expo Web
- Development Stage: prototype (mock screens) or production (actual apis)
- Release type: developing (localhost) / deployed (github pages)

The release type (local developing or deployed) is important for auth callback
and enabling any user with a google account.

- [v] fixed in the definitions of the .env file, (with remarks)

## AI Todo list

- AI will read the todo.md instructions
- Then it will go over this file (appSetup.md) and create todos in the Todo.md
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
  - [v]  created: <https://foodlog-storage.pashute.workers.dev/>

Then comes the `## AI coding` section which the AI is to do (once approved)
Break it into sections of coding (storage overhaul, post-login entry procedure, storage load, config load, settings warn update (red), etc.

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

## Cloudflare Oauth

### 1. Initial Client Login Flow

1a. On the entry screen the user presses **Let me in**.

- [x] put login button text in infrastructure/texts.ts and take from there. (starter.dlg.tsx has hardcoded text, need to extract to texts.ts)

- [x] make login instruction in parts from texts with button name. and take from that instruction for the start instruction. (starter.ts has hardcoded text, need to extract)

1b. On the starter popup the user presses **Login with Google**.

- [x] src/infrastructure/auth/starter.dlg.tsx — UI component, logic in starter.ts (separated for testability)

1. **OAuth Trigger:** The client generates a PKCE `code_verifier` and `code_challenge`, and launches the OAuth session.
   - *Crucial Rule for Refresh Tokens:* The request **must** include `access_type=offline` and `prompt=consent` to ensure Google returns a refresh token on the first exchange.

- [x] src/infrastructure/auth/oauth.web.ts (web) / oauth.tauri.ts / oauth.android.ts / oauth.ios.ts — platform-specific implementations
- [x] Unified dispatcher in src/infrastructure/auth/auth.ts (calls platform-specific login() based on runtime detection). Mock kept separate in src/prototype/oauth/oauth.mock.ts. Correct structure preserved.

1. **Authentication:** The user chooses an account or logs in directly with their credentials.

- [v] this is part of auth. we don't control it except in the prototype mock.

1. **Consent:** Google displays the permission screen, and the user accepts.

- [v] same as above. not in our hands.

1. **Auth Code Capture:** Google redirects back to the client application, returning a temporary, single-use `authorization code`.

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
The Worker receives the code and verifier, and makes an HTTPS POST to Google's `token` endpoint, including:

- `code` (the temporary authorization code)
- `code_verifier` (PKCE verifier)
- `client_id` (stored locally on Worker, or read from environment)
- `client_secret` (retrieved from Cloudflare Secrets)
- `redirect_uri` (must match the registered redirect)
- `grant_type=authorization_code`

Google validates all of this and returns:

- `access_token` (short-lived, expires in ~1 hour)
- `refresh_token` (long-lived, no expiry, only if first exchange and `offline_prompt` used)
- `expires_in` (seconds until access_token expires, typically 3600)
- `token_type` (usually "Bearer")

2.4 **Token Storage:**
The Worker stores both tokens securely in Cloudflare KV:

- `foodlog_storage_kv[auth/token/<user_id>]` = `{ accessToken, refreshToken, expiresAt }`
- `expiresAt` = `Date.now() + (expires_in * 1000)`

2.5 **Client Receives Session:**
The Worker responds to the client with a minimal, secure session identifier (e.g., a signed cookie or opaque session token that the client echoes back on future API calls). The client stores this in secure local storage (device keyring on Android/desktop, browser secure storage).

- [ ] Need decision: session token or bearer token model?

### 3. Client Usage (Protected Requests)

Whenever the client needs to access protected resources (e.g., read/write the Foodlog sheet, fetch config), it:

   1. Reads the session identifier from local storage.
   2. Includes it in the `Authorization` header or as a signed cookie.
   3. Sends the request to a Cloudflare Worker endpoint (e.g., `GET /api/sheet`).

The Worker:

   1. Validates the session token.
   2. Looks up the associated user and tokens from KV.
   3. If the `access_token` is expired, automatically refreshes it (see Refresh Flow below).
   4. Uses the current `access_token` to call the protected resource (e.g., Google Sheets API).
   5. Returns the result to the client.

### 4. Refresh Flow

**When to refresh:**

- Before each API call, the Worker checks if `expiresAt <= Date.now() + 60_000` (within 60 seconds of expiry).
- If true, it proactively refreshes.

**How to refresh:**

- POST to Google's `token` endpoint with:
  - `refresh_token`
  - `client_id`
  - `client_secret` (from CF Secrets)
  - `grant_type=refresh_token`
- Google returns a new `access_token` (and optionally a new `refresh_token`).
- The Worker updates the stored tokens and `expiresAt`.

**Failure handling:**

- If refresh fails (e.g., user revoked the app, token is permanently invalid), the Worker returns a 401 Unauthorized.
- The client catches this and prompts the user to log in again.

### 5. Logout

On logout:

   1. The client clears its local session identifier.
   2. The client sends `POST /api/logout` to the Worker (optional, for cleanup).
   3. The Worker deletes the tokens from KV.

--

## Future: Structured Production Rollout

**Once auth is complete and tested:**

1. Retire prototype oauth mocks.
2. Set env vars for production Cloudflare URLs.
3. Archive this document (all impl details are in code/git history).
