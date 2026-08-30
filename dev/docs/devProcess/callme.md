# Foodlog production actions

## Before trying OAuth

- User: create a Cloudflare Worker for Foodlog storage.
- User: create two Cloudflare Workers KV namespaces: `SECURE_KV` and `CONFIG_KV`.
- KV means Cloudflare Workers Key Value: a hosted key/value store.
- User: bind `SECURE_KV` and `CONFIG_KV` to the Worker.
- User: deploy `/auth/exchange` and `/auth/refresh`.
- User: deploy `/token`, `/key`, `/sheet`, `/user/mail`, and `/config` routes.
- User: keep Google client secrets in Cloudflare Worker secrets.
- User: register `https://pashute.github.io/foodlog/auth/` for web OAuth.
- User: register `foodlog://auth/` for desktop OAuth.
- User: register `com.foodlog://auth/` for Android OAuth.
- User: set the real web client ID.
- User: set the real desktop client ID.
- User: set the real Android client ID.
- User: set the real iOS client ID when iOS is released.
- User: set the deployed Cloudflare URL.
- User: do not put secrets in this repository.

## Verify web OAuth

- User: open the production web app.
- User: select Login with Google.
- User: approve only `drive.file`.
- User: confirm the callback returns to Foodlog.
- User: confirm a failed login shows a Google login warning.
- User: confirm a successful login loads the user configuration.

## Verify desktop OAuth

- User: build the Tauri desktop app.
- User: select Login with Google.
- User: confirm the system browser opens.
- User: approve only `drive.file`.
- User: confirm `foodlog://auth/` returns to the desktop app.
- User: confirm a failed login shows a Google login warning.
- User: confirm silent login works after restarting the app.

## Verify Android OAuth

- User: build the Android app with the configured package and SHA-1.
- User: select Login with Google.
- User: approve only `drive.file`.
- User: confirm Google Sign-In returns to Foodlog.
- User: confirm Cloudflare stores the refresh token securely.
- User: restart the app.
- User: confirm silent login refreshes the session.
