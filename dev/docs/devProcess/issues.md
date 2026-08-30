/# Filename issues.md
/# File header version 0.2.1
/# Read issuesInstructions.md before reporting here. 

## Report: Production Cloudflare setup 2026-08-27

### Instructions: Create the Cloudflare service


### Instructions: Create encrypted storage
- Open the Worker **Settings**.
- Open **Bindings**.
- Add KV namespace binding `SECURE_KV`.
- Create or select the encrypted secure namespace.
- Bind token storage to `token:*`.
- Bind Gemini key storage to `key:*`.
- Bind sheet storage to `sheet:*`.
- Bind user-mail storage to `user/mail:*`.
- Do not return secure values to unauthenticated callers.

### Instructions: Create configuration storage
- Add KV namespace binding `CONFIG_KV`.
- Create or select the plain configuration namespace.
- Store only `{ "theme": "dark" | "light" }`.
- Keep configuration separate from `SECURE_KV`.
- Bind configuration storage to `config:*`.

### Instructions: Add Worker routes
- Implement `POST /auth/exchange` with the Google client secret kept in Worker secrets.
- Implement `POST /auth/refresh` with the Google refresh token kept server-side.
- Implement `POST /token/store`.
- Implement `GET /token/get`.
- Implement `POST /key/store`.
- Implement `GET /key/get`.
- Implement `POST /sheet/store`.
- Implement `GET /sheet/get`.
- Implement `POST /user/mail/store`.
- Implement `GET /user/mail/get`.
- Implement `POST /config/store`.
- Implement `GET /config/get`.
- Use `null` on `/store` to clear a secure value.
- Return `{ "value": value }` for secure reads.
- Return the configuration object for config reads.

### Instructions: Restrict the Worker
- Allow only the Foodlog production origin.
- Validate the authenticated user before secure reads and writes.
- Add rate limits.
- Never log tokens or API keys.
- Never place secrets in Worker source.
- Deploy after every binding or route change.

### Instructions: Register web OAuth values
- Create a Google **Web application** OAuth client.
- Set the authorized redirect URI to `https://pashute.github.io/foodlog/auth/`.
- Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to the client ID placeholder value.
- Set `EXPO_PUBLIC_AUTH_REDIRECT` only when using a different registered callback.
- Set `CLOUDFLARE_STORAGE_URL` to the deployed Worker URL.

### Problem: Web OAuth identity exchange remains incomplete
- `oauth.web.ts`: GIS token flow returns an access token but no user mail.
- `auth/index.html`: centralized authorization-code callback is present.
- Cloudflare: no authorization-code exchange endpoint exists yet.
- Decision required: add a server-side Google code exchange and identity endpoint before replacing the GIS token flow.

### Fixed: Unified production storage boundary
- `storage.ts`: platform-specific SecureStore and Tauri keyring code removed.
- `storage.ts`: production values use the shared Cloudflare storage interface.
- `auth.ts`: mock selection is centralized; production adapters no longer import mock storage/auth code.
- `oauth.web.ts`: reads `EXPO_PUBLIC_PLATFORM` first and `PLATFORM` as compatibility fallback.

## Report: OAuth instructions reconciliation 2026-08-27

### Problem: Guide and repository differ
| Topic | Guide | Existing code | Action |
|---|---|---|---|
| Interface path | `src/lib/auth*.ts` | `src/infrastructure/auth/*.ts` | Keep existing infrastructure boundary. |
| Web OAuth | Authorization code callback | GIS access-token client | Keep GIS until Cloudflare code exchange exists. |
| Environment key | `EXPO_PUBLIC_PLATFORM` | `PLATFORM` | Read both; use `EXPO_PUBLIC_PLATFORM` first. |
| Callback page | `/auth/index.html` | Missing | Added `auth/index.html`. |
| Web identity | Server exchange returns mail | GIS response has no mail | Cloudflare identity endpoint required. |
| Storage | Platform adapters | Cloudflare storage interface | Keep shared storage interface and Cloudflare routes. |




