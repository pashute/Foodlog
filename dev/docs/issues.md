### Filename issues.md
File version 0.4.0
Last updated: 2026-08-13 01:44

## Startup walkthrough (in progress)

This starts the Expo CLI dev server, which:
1. Reads `app.json` for project config 
(name, slug, `web.bundler: "metro"`, 
             `web.output: "single"`).
2. Boots Metro (the bundler) using `metro.config.cjs`, 
  which calls `getDefaultConfig` from `expo/metro-config`.
3. Metro's entry point is resolved from `package.json:6` 
            → `"main": "index.js"`.

Nothing else runs yet — no app code has executed, just server + bundler startup.

