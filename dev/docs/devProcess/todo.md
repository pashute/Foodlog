# Filename todo.md
# File version 0.2.1
 
 - AI must READ and FOLLOW todo.instructions.md
--- Todo batches start below this line.  Do not erase it or above ---

# Batch cloud storage aug 31

## Developer todo list (oauth and storage overhaul)

- [v] Cloudflare worker created: https://foodlog-storage.pashute.workers.dev/
- [ ] Set GOOGLE_CLIENT_SECRET in Cloudflare secrets (wrangler secret put)
- [ ] Set GOOGLE_CLIENT_ID in Cloudflare secrets
- [ ] Verify both KV namespaces exist: foodlog_storage_kv, foodlog_config_kv
- [ ] Export wrangler project location (if different from src/backend/)
- [ ] Set CLOUDFLARE_STORAGE_URL env var in platform.env 
- [ ] Set CLOUDFLARE_CONFIGURATION_URL env var
- [ ] 
## AI coding - Infrastructure & Logging

### Logging module (DONE)
- [v] Create src/infrastructure/log.ts with report() function
- [v] Add LOG_LEVEL env var to .env.local (debug/warn/erroronly)
- [v] Update src/prototype/sheet/sheetServer.ts to use log.report() (DEV-ONLY mock server)

## AI coding - Storage overhaul

**Discussion:** 
- Are we extending src/backend/storage/worker.ts and src/backend/configuration/worker.ts, or creating new separate auth worker?
- Who deploys to Cloudflare? AI writes code, developer deploys?

### Update storage worker (src/backend/storage/worker.ts)

- [ ] create placeholder CLOUDFLARE_STORAGE_URL env var in platform.env 
- [ ] create placeholder CLOUDFLARE_CONFIGURATION_URL env var
- [ ] Add auth/token KV key and route (refresh token storage)
- [ ] Verify token, aikey, sheetid, usermail routes all present
- [ ] Ensure per-user key scoping (prefix:userId format)
- [ ] Test KV read/write functions

### Update configuration worker (src/backend/configuration/worker.ts)

- [ ] Verify theme, timezone routes present
- [ ] Add defaults on first access (if key missing)
- [ ] Ensure configuration persists after login

### Create auth worker (src/backend/auth/worker.ts for wrangler)

- [ ] Implement exchangeAuthCode endpoint (/api/auth/exchange)
  - [ ] Receive: code, clientId, redirectUri, codeVerifier, platform
  - [ ] Call Google token endpoint with client_secret
  - [ ] Decode id_token JWT to extract userId
  - [ ] Store refresh_token in KV (native platforms only)
  - [ ] Create session token (HMAC signed JWT)
  - [ ] Return: sessionToken, accessToken, expiresIn
- [ ] Implement refreshAccessToken endpoint (/api/auth/refresh)
  - [ ] Validate Bearer sessionToken
  - [ ] Retrieve refresh_token from KV
  - [ ] Call Google token endpoint
  - [ ] Return: accessToken, expiresIn
  - [ ] Return 401 if refresh fails (lazy pattern)

## AI coding - Client-side auth flow

### Update oauthSession.ts

- [ ] Verify authorize() passes codeVerifier to exchange endpoint
- [ ] Verify refresh() sends sessionToken as Bearer token
- [ ] Check error handling (401 trigger refresh)

### Update oauth.web.ts

- [ ] Store sessionToken in sessionStorage
- [ ] Store accessToken expiresIn (timestamp)
- [ ] Implement lazy 401 refresh on API errors

### Update storage.ts

- [ ] Add 401 error detection in fetch() wrapper
- [ ] Call /api/auth/refresh on 401
- [ ] Retry original request with new accessToken
- [ ] Update sessionToken after refresh

## AI coding - Post-login entry sequence

### Update app entry (App.tsx or main entry point)

- [ ] On login success: call onLoginSuccess()
- [ ] Load config defaults
- [ ] Load user config from KV (via storage)
- [ ] Load sheet.sheetId from KV
- [ ] Verify sheet exists (Sheets API call)
- [ ] Load AI key from KV
- [ ] If all OK: enable Diary
- [ ] If missing: show instruction, disable Diary

### Update sheet.ts

- [ ] Add verify step (fetch sheet metadata)
- [ ] Handle missing sheet: search by name, or create new
- [ ] Store sheetId after verification

### Update config access

- [ ] Load theme from KV on app entry
- [ ] Load timezone from KV
- [ ] Load defaults if missing

## AI coding - Settings panel error handling

### Update warn function (src/infrastructure/warn.ts)

- [ ] Draw red border around instruction card on error
- [ ] Change instruction text color to red
- [ ] Return to white/normal when error cleared
- [ ] Ensure each error has path to clear (check button)

### Update settings screen dialogs

- [ ] Make all config fields editable (theme, timezone, sheet name)
- [ ] Add SAVE button for config changes
- [ ] POST changes to KV via storage module
- [ ] Refresh UI on successful save
- [ ] Show error if save fails

## AI coding - Token expiration handling

### Client-side lazy refresh (Option C)

- [ ] On API 401: call /api/auth/refresh
- [ ] Update sessionToken and accessToken
- [ ] Retry original request
- [ ] Show error only if refresh also fails

### Test refresh flow

- [ ] Mock Google returning 401 on expired token
- [ ] Verify client calls refresh endpoint
- [ ] Verify original request retried

## AI coding - E2E test: login to diary

### Create/update login e2e test

- [ ] Start in prototype mode
- [ ] Click "Let me in" (Login button)
- [ ] Accept starter popup
- [ ] Mock returns auth code
- [ ] Verify /api/auth/exchange called
- [ ] Check sessionToken stored
- [ ] Check config loaded
- [ ] Check sheet loaded
- [ ] Check AI key status
- [ ] Verify Diary enabled
- [ ] Test flow: config→sheet→ai key→diary (same as production)

### Create/update cancel login test

- [ ] Click "Let me in"
- [ ] Cancel at starter popup
- [ ] Check settings instruction shows login message (red card)
- [ ] Verify Diary disabled

## Discussion topics

- Should auth worker be separate file or merged with storage/config workers?
- Deployment strategy: who runs `wrangler deploy` to Cloudflare?
- How to mock Google OAuth in BDD tests without real network calls?
- Error messages: where do they go when auth fails (storage, client, UI)?

## Note: Backend is Cloudflare-only
- No Node.js server in production
- Google token calls happen in Cloudflare Workers (src/backend/auth/worker.ts)
- sheetServer.ts is DEV-ONLY prototype mock for local testing
