# FOODLOG — OAuth Section build instructions for Claude Code

## do not write tests and do not test oauth
only implement the instructions given here. don't run it or test it.

'''
javascript

## OAuth Callback — centralized redirect, all platforms

### Your URLs
GitHub Pages frontend:   https://pashute.github.io/foodlog


### OAuth registered callbacks

At `console.cloud.google.com`. register callback:
Web site / web app: 
  auth.web.clientKey.  for browser (expo-auth-session in web build)
  auth.web.redirect:  https://pashute.github.io/foodlog/auth/

Desktop app: 
    auth.desktop.clientKey // for Tauri
    auth.web.redirect:  foodlog://auth/

Android: 
    auth.android.clientKey // for EAS APK
    auth.phone.redirect:    com.foodlog://auth/

iOS:
    auth.ios.clientKey    // for EAS IPA  (future)
    auth.phone.redirect:    com.foodlog://auth/  // only one for both phone platforms. 

### File to create
`/auth/index.html`

Plain JS, no framework:

```html
<!DOCTYPE html>
<html>
<head><title>Signing in...</title></head>
<body>
<script>
  const params = new URLSearchParams(window.location.search);
  const code  = params.get('code');
  const state = params.get('state');
  const platform = JSON.parse(atob(state)).platform;  // set platform in state when building auth URL

  if (platform === 'web') {
    window.opener?.postMessage({ code, state }, 'https://pashute.github.io');
    window.close();
  } else if (platform === 'desktop') {
    window.location.href = `foodlog://oauth?code=${code}&state=${state}`;
  } else if (platform === 'android' || platform === 'ios') {
    window.location.href = `com.foodlog:/oauth?code=${code}&state=${state}`;
  }
</script>
</body>
</html>
```

### expo-auth-session — set platform in state
When building the auth request in auth.web.ts 
/ auth.native.ts,
encode the platform into the state parameter:

```ts
const state = btoa(JSON.stringify({
  platform: process.env.EXPO_PUBLIC_PLATFORM ?? 'web',  // 'web' | 'desktop' | 'android' | 'ios'
  nonce: generateNonce(),
}));
```

### Register deep-link schemes

tauri.conf.json:
```json
{
  "plugins": {
    "deep-link": {
      "mobile": [],
      "desktop": ["foodlog"]
    }
  }
}
```

app.json (android + ios):
```json
{
  "expo": {
    "scheme": "com.foodlog"
  }
}
```

### Storage
  See storage in /dev/docs/plans/requirements.md



## What does NOT change
- expo-auth-session usage in each platform file
- auth.native.ts, auth.web.ts, auth.desktop.ts split
- storage.native.ts (expo-secure-store), storage.desktop.ts (Tauri keychain)
- Three separate OAuth client IDs in Google Cloud Console
- EXPO_PUBLIC_PLATFORM=desktop env var for Tauri build

## iOS
Not implementing now. When ready: identical to android.
Same callback URL, same app.json scheme, different EAS build profile. Zero code changes.

'''


## 0. Ground rules

- **No automated tests of OAuth section.** Do not add jest, vitest, detox, CI, or test files. All testing is manual by the developer.
- **Nothing runs until the developer says so.** Build, then stop. Do not start dev servers, emulators, or scripts without being asked.
- **Placeholders**:  Before having the oauth client key, just code for its usage with a placeholder. 
- Mock stay. `EXPO_PUBLIC_MOCK=1` must keep working on every target.
- When unsure, write the question to `issues.md` and ask; do not guess.

---

## 1. Reconcile first — before writing any code

1. Read the existing plan and code.
2. Compare them with **this document**. Every difference (naming, file layout, flow, library, env keys, storage choice) goes into `issues.md` as a table:

   | # | Topic | This doc says | Existing plan / code says | Options | Recommendation | Decision |
   |---|-------|---------------|---------------------------|---------|----------------|----------|

3. Then walk the table **one row at a time** with the developer (use `AskUserQuestion`). Fill `Decision` only with the developer's explicit choice.
4. Do not start section 3 until every row has a Decision.
5. Anything discovered later also goes into `issues.md` and gets the same treatment.

---

## 2. Target architecture

One interface, three implementations, chosen by Metro suffix + env:

```
src/lib/auth.ts           interface + types only (everything imports this)
src/lib/auth.native.ts    ios + android  (expo-auth-session / google-signin, PKCE, refresh token)
src/lib/auth.web.ts       forks at build time on EXPO_PUBLIC_PLATFORM:
   ├─ auth.browser.ts     GIS token flow, ~1h access token, silent re-request
   └─ auth.desktop.ts     Tauri: invoke Rust command → system browser → loopback redirect → refresh token

src/lib/storage.ts / storage.native.ts / storage.web.ts   same pattern
   native   → expo-secure-store
   browser  → sessionStorage (key re-pasted per session) — confirm in issues.md
   desktop  → Tauri invoke → OS keychain (Rust `keyring` crate)

src/lib/gemini.ts         @google/genai, user's key, structured JSON output
src/lib/sheets.ts         Sheets v4 + Drive v3 (create / read / append / update / delete rows)
src/lib/foodMemory.ts     reduce sheet → distinct foods; filter by meal text; cache
src/lib/nutrition.ts      per-100g × qty → totals (app does the arithmetic, not Gemini)
```

`auth.web.ts` / `storage.web.ts` branch on `process.env.EXPO_PUBLIC_PLATFORM === 'desktop'` (Expo inlines this; dead branch is dropped). **Use the project's existing env key name if it differs — log in issues.md.**

Google OAuth clients (three): Android, iOS, **Web** (browser), **Desktop app** (Tauri). Client IDs come from `.env`; ship `.env.example` with placeholders.

---

## 3. Build order

1. `issues.md` reconciliation (section 1) — **STOP for approval**
2. Interfaces: `auth.ts`, `storage.ts` (+ mock impls)
3. `storage.native.ts`, `storage.web.ts` (browser + desktop branches)
4. `auth.native.ts`, `auth.browser.ts`, `auth.desktop.ts`, `auth.web.ts`
5. Tauri side: `src-tauri/` commands `oauth_start`, `oauth_get_token`, `secret_get`, `secret_set`, `secret_delete`; `tauri.conf.json` → `frontendDist: ../dist-desktop`
6. `gemini.ts` with response schema (items[] + clarifications[]) — see spec in project notes
7. `sheets.ts` (two tabs: `Log`, `Foods`) and `foodMemory.ts`
8. UI: key-paste screen, sign-in, meal entry, clarification chips, log view
9. `scripts/human-check.mjs` and `.claude/settings.json` hooks (section 5)
10. `MANUAL_TESTS.md` (section 6)
11. Build scripts in `package.json`:
    - `export:web`     → `expo export -p web -o dist-web`
    - `export:desktop` → `EXPO_PUBLIC_PLATFORM=desktop expo export -p web -o dist-desktop`
    - `tauri:build`    → `npm run export:desktop && tauri build`
12. **STOP.** Hand over to the developer (section 4). Do not run anything.

---

## 4. Where the human comes in — AFTER the build

Claude Code cannot do these. Write them into `HUMAN_TODO.md` as a checklist.

**Google Cloud Console**
- [ ] Create project, enable **Google Sheets API** and **Google Drive API**
- [ ] OAuth consent screen: add scope `.../auth/drive.file`; add self as test user
- [ ] Create 4 OAuth clients: Android (package + SHA-1), iOS (bundle id), Web (JS origins + redirect URIs for localhost and prod domain), Desktop app
- [ ] Copy client IDs (and the Desktop secret) into `.env` — never into chat
- [ ] Gemini API key from AI Studio — pasted **into the running app**, never into `.env`

**Then run the manual tests** (section 6). Claude Code only reads the results file.

---

## 5. Human-in-the-loop tooling

Two mechanisms, both beep and wait.

### 5a. Inside a Claude Code session
Claude uses `AskUserQuestion` for every decision and every "please do X now" step.
Beep on it via `.claude/settings.json` (PreToolUse fires when AskUserQuestion is called; Notification fires on permission prompts):

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "AskUserQuestion",
        "hooks": [{ "type": "command", "command": "node scripts/beep.mjs" }] }
    ],
    "Notification": [
      { "hooks": [{ "type": "command", "command": "node scripts/beep.mjs" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node scripts/beep.mjs done" }] }
    ]
  }
}
```

`scripts/beep.mjs`: terminal bell (`\u0007`) **plus** an OS sound so it works when the terminal is unfocused:
- macOS `afplay /System/Library/Sounds/Glass.aiff`
- Linux `paplay /usr/share/sounds/freedesktop/stereo/complete.oga` (fallback `speaker-test`)
- Windows `powershell -c "[console]::beep(880,400)"`

Claude waits on `AskUserQuestion` until the developer answers. Offer a **Cancel** option in every question; on Cancel, stop and write the reason to `issues.md`.

### 5b. Standalone manual-test runner (developer runs it, not Claude)
`scripts/human-check.mjs` — reads `MANUAL_TESTS.md`, for each step:
1. beep
2. print the step and its questionnaire
3. wait for `[d]one / [s]kip / [c]ancel` and answers (readline on stdin)
4. append `{step, result, answers, timestamp}` to `manual-tests/results-<date>.md`
5. on cancel: write partial results and exit 1

**Claude Code must never execute this script** (interactive stdin, blocks). Claude may only read `manual-tests/results-*.md` afterwards and turn failures into `issues.md` rows.

---

## 6. Manual test protocol (`MANUAL_TESTS.md`)

Each step: *Target · Action · Expect · Questions*. Minimum set:

| # | Target | Action | Expect |
|---|--------|--------|--------|
| 1 | all | Launch with `EXPO_PUBLIC_MOCK=1` | app runs, mock meal parses |
| 2 | android | Sign in with Google | consent shows `drive.file` only; returns to app |
| 3 | android | Paste Gemini key, restart app | key persists (SecureStore) |
| 4 | web | Sign in | GIS popup; token obtained; `tauri://` not involved |
| 5 | web | Wait > 1h, log a meal | silent token refresh, no re-consent |
| 6 | desktop | Sign in | **system browser** opens, not the webview; app receives token |
| 7 | desktop | Paste key, quit, relaunch | key persists (keychain), not in webview localStorage |
| 8 | all | First meal | `Log` + `Foods` tabs created in Drive; rows correct |
| 9 | all | Second meal with same food, no qty | clarification chip guesses last qty; accept → row written |
| 10 | all | Delete a meal | all rows with that mealId removed |
| 11 | all | Revoke app in Google account, log meal | clean re-auth prompt, no crash |

Questionnaire per step: *Pass? · What did you see? · Beep heard? · Notes.*

---

## 7. Done means

- `issues.md` has no undecided rows
- `HUMAN_TODO.md` written
- All targets export/build without running them
- No test framework, no key, no secret anywhere in the repo
- Claude has stopped and is waiting for the developer