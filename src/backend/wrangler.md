/# Filename: wrangler.md
/# Version: 0.2.1

## Worker

worker name: foodlog-storage.pashute.workers.dev
main entry point:  server.ts

## KV Namespaces: 

### 1. binding name: FOODLOG_SECURE_KV 

id: 159705e0801347aa97108e885091a335
namespace:  foodlog_secure_kv


#### 1.1 Secure values

Values in this kv will be stored and retrieved as encrypted 
cf does not change that. 


### 2. binding name: FOODLOG_CONFIG_KV 

id f8a7f95a85454f9f810a605b05d4744d
namespace:  foodlog_config_kv


#### 2.1 Config values

values in this kv will be encrypted by cf when stored and decrypted when retrieved. The keys are per client and per user. 


#### 2.2 Public Client ID

This should also hold a single public, client wide (not particular to user) non-encrypted key already entered there : 
CLIENT_ID  Value: 351313377480-s6i2rlnva718kncguoqkf4hu2gtefcrn.apps.googleusercontent.com
It should not be changed. Use as read only. 
It is also held in the code. 

## Secrets Store

3. client secret:  FOODLOG_CLIENT_SECRET
storeid: 60587c71aa9f47b593a6d758f5a086eb 
retrieved through env.FOODLOG_CLIENT_SECRET

---

## Server Code Files

### server.ts
**Entry point** for Cloudflare Worker deployment. Exports Env interface defining all bindings and secrets:
- FOODLOG_SECURE_KV: KV namespace for encrypted per-user data
- FOODLOG_CONFIG_KV: KV namespace for per-user configuration
- FOODLOG_CLIENT_ID: Google OAuth client ID (from Cloudflare config)
- FOODLOG_CLIENT_SECRET: Google OAuth client secret (from Cloudflare secrets)
- SESSION_SECRET: Secret for signing session tokens

### auth.servercode.ts
**OAuth token exchange and refresh**. Two endpoints:
- `POST /api/auth/exchange`: Client sends Google auth code → Worker exchanges for tokens via Google API → Stores refresh token (if available) in FOODLOG_SECURE_KV → Returns sessionToken (HMAC-signed JWT, 7-day expiry) + accessToken
- `POST /api/auth/refresh`: Client sends sessionToken in Authorization header → Worker validates signature → Retrieves refresh token from KV → Calls Google to get new accessToken → Returns new accessToken

### storage.servercode.ts
**Per-user secure storage** (requires valid sessionToken in Authorization header). Routes:
- `/token`: refresh_token (OAuth refresh token, encrypted in KV)
- `/aikey`: User's Gemini API key (encrypted in KV)
- `/sheetid`: Google Sheets ID for user's Foodlog sheet (encrypted in KV)

Operations: GET retrieves value, POST updates/deletes (POST with value=null deletes).

### config.servercode.ts
**Per-user configuration storage** (requires valid sessionToken in Authorization header). Routes:
- `/theme`: Dark/light theme preference (light, dark)
- `/timezoneAbbrev`: Timezone abbreviation (e.g., "IDT")
- `/timezoneOffset`: Timezone UTC offset in minutes (e.g., 180 for UTC+3)
- `/timezoneLocation`: Timezone location name (e.g., "Asia/Jerusalem")

Operations: GET retrieves value, POST updates/deletes (POST with value=null deletes).

**Security**: All endpoints validate sessionToken signature before allowing access. Unauthorized requests return 401.