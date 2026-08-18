### Filename issues.md
File version 0.1.9
Last updated: 2026-08-17

## Sheet creation & header — audit (requirements.md / develop.md / features)

- requirements.md's sheet-record format is stale vs. the actual app (4 cols vs 6, no `status` col, phantom `Calories` col)
  requirements.md lines 157–177 documents a 4-column header (Timestamp | Carbs | Calories | Meal), Timestamp combining date+time+dow into one formatted string. The actual app (sheet.mock.js `HEADER`, sheets.feature's `@sheets.create` scenario, Diary.jsx's `handleSave`) uses 6 columns: `date | dow | time | carbs | status | meal` — separate date/dow/time, no standalone Calories column at all, plus a `status` column requirements.md never mentions. Needs requirements.md rewritten to match the app (app is source of truth per this batch's own rule), once the schema-object decision below is implemented.

- Canonical header-shape source is `infrastructure/sheets/sheets.feature`, not `ai.feature`
  `@sheets.create` scenario has the literal table `| date | dow | time | carbs | status | meal |` and is the scenario Diary.jsx/sheet.mock.js actually match. `ai.feature` never defines the sheet row shape — it only defines the AI's per-item analysis shape (`item/status/name/details/data`), a different, upstream concern.

- requirements.md's sheet-location strategy ("search for existing sheet by name") is stale vs. the new decision
  requirements.md line 46–48: "Created in user's Google Sheets on login if not stored in local chrome. Before creation searches for an existing Foodlog sheet." New decision (2026-08-17 discussion): fixed Drive path `FoodlogApp/Foodlog` — check if the folder exists, check if the sheet exists inside it, create whichever is missing. No search-by-name. requirements.md needs updating to reflect this once implemented.

- develop.md's Google Cloud OAuth scope list includes `spreadsheets`, but the app only ever requests `drive.file`
  develop.md lines 157–159 tells the human developer to add both `.../auth/spreadsheets` and `.../auth/drive.file` scopes in the Cloud Console. `auth.js`'s actual runtime login flow only validates/requests `drive.file` (`_isFreshDriveFileToken`). Per Google's docs, `drive.file` is sufficient for files the app itself creates (Sheets API calls against an app-created file are covered) — so the `spreadsheets` scope entry in develop.md's setup instructions looks like dead/unneeded config. Flagging, not changing develop.md (AI may not edit that file per its own header).

- develop.md's "mock sheets link" description is stale
  develop.md line 101: "served via a tiny local static server (`npx serve src/prototype`)". Actual implementation (this session) is a custom `src/prototype/sheet/sheetServer.js` (Node `http` server with dynamic row injection, CORS, `/log` and `/reset` endpoints) — `npx serve` was never actually used. Flagging only, same as above.

## Meal object / record fields — audit

- AI per-item shape (`ai.feature`, `ai.js`, `ai.mock.js`): `{ item, status, name, details: "qty:X, sz:Y", data: "wgt:Xg, crb:X, cal:X" }`. `status` is `guess`|`set`. `details`/`data` are semi-structured strings, not nested objects — parsed by regex in Diary.jsx (`parseDetails`/`parseMacros`). This is the shape the qty/type UI feature (this batch) reads from and writes back into (`it.qty`/`it.type` now live as first-class fields on the item, seeded from `details` at analyze-time).
- requirements.md lines 172–181 describes meal items in prose (Qty, Unit, Food name, Details, Carbs/Energy parenthesis, `?`/`???` markers) — roughly matches the app's `details`/`data` string convention, but was never turned into a single canonical schema object. This is exactly the gap the new `Sheet.MealRecordStructure` (see discussion) is meant to close.
- No existing scenario or doc currently defines a single canonical "meal record" schema shared by the AI output shape, the Diary UI item shape, and the Foodlog sheet row shape — each of the three currently has its own slightly different shape (AI: item/status/name/details/data; Diary state: adds qty/type/accepted; Sheet row: date/dow/time/carbs/status/meal, where `meal` is the flattened comma-joined text, not structured per-item data).

## Production: never-tested code — problems to address before first real run

The production (non-prototype) auth/config/sheets code paths have never been executed against a real Google account. Before running them for the first time (real login → real logout → `config.stage != 'prototype'` → connect to sheet → close app without logging out → restart → verify silent login still gives sheet access):

- `sheet.js`'s real branch is now implemented (Aug 17: `_realExistsOrCreate`/`_realLog` do real Drive+Sheets REST calls, fixed `FoodlogApp/Foodlog` path, `drive.file` scope) — but genuinely untested against a live account, first real run IS this manual test.
- `sheet.js`'s `existsOrCreate()`/`link()`/`log()` are sync in prototype mode, async (Promise) in real mode (same duality as `storage.js`) — `Settings.jsx`'s current usage (`const sheet = existsOrCreate()`) only handles the sync/prototype case. Needs an async-aware rewrite (useEffect/useState or Promise.resolve() pattern like `auth.js`) before the real branch will actually work in the UI — not done this batch, flagging for the next one.
- **BLOCKER, corrected 2026-08-17**: `oauth.tauri.js`'s real branch is ALSO `throw new Error('Not implemented yet')` — earlier note in this file wrongly said it "has real code." All three platform branches (`oauth.tauri.js`, `oauth.android.js`, `oauth.ios.js`) are unimplemented. There is currently no real OAuth login on any platform — `auth.js`'s `login()` will throw immediately once `config.stage` isn't `'prototype'`. **The planned manual production test (real login → ... → silent login after restart) cannot proceed past step 1 today.** Real login (loopback flow: open system browser → Google consent → redirect to `127.0.0.1:<port>`, per develop.md 4.3) needs to be built first — a distinct, substantial feature (local redirect-catching HTTP server, PKCE/code exchange, token storage), not done in this batch.
- `storage.js`'s real branch (Tauri `keyring_get`/`keyring_set`/`keyring_delete` invoke calls) requires matching Rust commands registered in `src-tauri/src/main.rs` — not confirmed to exist/work.
- `config.data.js` (the static non-prototype config mirror) needs `config.stage` flipped away from `'prototype'` for any of this to engage at all — currently every real branch in every module is dead code until that flip happens.
- No unit or feature test currently exercises any of these real branches end-to-end (only the skipped/pending `sheet.test.js` production test documents the *intended* contract) — this manual test would be the first real exercise of this code path.

### What to actually test manually right now, given the login blocker above
Since real login isn't built yet, the full "real login → sheet → restart → silent login" test can't run end to end. What CAN be manually verified today:
1. Flip `config.data.js`'s `config.stage` to something other than `'prototype'` locally (don't commit this).
2. Confirm the app now fails fast and visibly at login (not silently) — `auth.login()` should reject with the `Not implemented yet` error, and the UI should surface *something* (currently unclear what Settings.jsx shows for a rejected `auth.login()` — worth checking).
3. Revert the `config.stage` flip back to `'prototype'` before committing.
Building real OAuth login is the real next blocker — recommend scoping that as its own discussion/batch rather than folding it into this one.
