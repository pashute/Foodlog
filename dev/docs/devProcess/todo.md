# Filename todo.md
# File version 0.2.1
 
 - AI must READ and FOLLOW todo.instructions.md
--- Todo batches start below this line.  Do not erase it or above ---

# Cloudflare Architecture (DONE - Code Created)

**Server code** (to deploy to Cloudflare with `wrangler deploy`):
- [v] src/backend/storage/storage.servercode.ts — KV storage for auth tokens, AI keys, sheet IDs, user emails. Routes: /token, /aikey, /sheet, /usermail with per-user key scoping (prefix:userId format).
- [v] src/backend/configuration/config.servercode.ts — KV config storage (theme, timezone). Routes: /theme, /timezonehrs, /timezonename with Bearer token auth validation.
- [v] src/backend/auth/auth.servercode.ts — OAuth token exchange and refresh. Routes: /api/auth/exchange, /api/auth/refresh.

**Client-side serverAccess wrappers** (fetch calls to server):
- [v] src/infrastructure/storage/storage.ts — calls storage server endpoints (get/update/remove)
- [v] src/infrastructure/auth/auth.serverAccess.ts — calls auth server (exchangeAuthCode, refreshAccessToken)
- [v] src/infrastructure/config/config.serverAccess.ts — calls config server (getConfig, setConfig)
- [ ] src/infrastructure/config/configAccess.ts — integrate config.serverAccess.ts calls

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

## AI coding - Server code (Cloudflare Workers)

**Decisions:**
- Separate files per service (auth, storage, config) to limit requests
- Developer deploys via `wrangler deploy`
- Error handling: server logs to Cloudflare, returns JSON {error, status}

### Verify storage.servercode.ts (src/backend/storage/)

- [ ] Verify token, aikey, sheetid, usermail routes all present
- [ ] Verify per-user key scoping (prefix:userId format)
- [ ] Verify FOODLOG_SECURE_KV binding exists

### Verify config.servercode.ts (src/backend/configuration/)

- [ ] Verify theme, timezonehrs, timezonename routes present
- [ ] Add defaults on first access (if key missing)
- [ ] Verify FOODLOG_CONFIG_KV binding exists

### Create auth.servercode.ts (src/backend/auth/) - DONE

- [v] Implement exchangeAuthCode endpoint (/api/auth/exchange)
  - [v] Receive: code, clientId, redirectUri, codeVerifier, platform
  - [v] Call Google token endpoint with client_secret
  - [v] Decode id_token JWT to extract userId
  - [v] Store refresh_token in KV (secure namespace, native platforms only)
  - [v] Create session token (HMAC signed JWT with 7-day expiry)
  - [v] Return: {sessionToken, accessToken, expiresIn}
- [v] Implement refreshAccessToken endpoint (/api/auth/refresh)
  - [v] Validate Bearer sessionToken from Authorization header
  - [v] Extract userId from token payload
  - [v] Retrieve refresh_token from KV using userId
  - [v] Call Google token endpoint
  - [v] Return: {accessToken, expiresIn}
  - [v] Return 401 if refresh fails (lazy pattern)

## AI coding - Client-side integration

### Integrate auth.serverAccess.ts into oauthSession.ts - DONE

- [v] Replace `exchange()` function with `auth.serverAccess.exchangeAuthCode()`
- [v] Replace refresh logic with `auth.serverAccess.refreshAccessToken()`
- [v] Handle 401 errors properly (message to UI)

### Integrate config.serverAccess.ts into configAccess.ts - DONE

- [v] Load config from server via `config.serverAccess.getConfig()` — added loadConfigFromServer()
- [v] Save config changes via `config.serverAccess.setConfig()` — added saveConfig()
- [v] Handle offline (prototype mode) vs online (production)

### Update storage.ts for 401 refresh - DONE

- [v] Add 401 error detection in fetch() wrapper
- [v] Call auth.serverAccess.refreshAccessToken() on 401
- [v] Retry original request with new accessToken
- [v] Add setSessionToken() to store token for Bearer auth

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

- callme.ps1
- [ ] Discuss with developer testing auth refresh
- WAIT FOR OK to continue

## AI coding - E2E test: login to diary
- [ ] Discuss with developer test fixture setup with human in loop
- WAIT FOR OK to continue 


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

- beep.ps1

### Create/update cancel login test

- [ ] Click "Let me in"
- [ ] Cancel at starter popup
- [ ] Check settings instruction shows login message (red card)
- [ ] Verify Diary disabled

- beep.ps1

## Note: Backend is Cloudflare-only
- No Node.js server in production
- Google token calls happen in Cloudflare Workers (src/backend/auth/auth.servercode.ts)
- sheetServer.ts is DEV-ONLY prototype mock for local testing

- callme.ps1