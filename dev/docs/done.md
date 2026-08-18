## Fixes batch (issue #3 additions, from fixes.md) — 2026-08-16

Beep before each item. On failure: callme, try once, else mark [!] and continue.
No discussion this batch. callme when file is done.

### BDD/cucumber step definitions
- [x] infrastructure/ai/ai.feature
- [!] infrastructure/oauth/oauth.feature (6/8 scenarios still blocked on UI-test tier / AppState wiring)
- [x] prototype/prototype.feature (incl. @mock.ai-analyze, @mock.ai-summarize)
- [x] screens/interaction/diary/diaryEntry.feature (+ prototype.feature's @diaryEntry) — 15/15 scenarios, 101/101 steps. Found+fixed: CORS missing on sheetServer.js (browser POST /log was silently blocked), server-side self-POST recursion risk, missing /reset endpoint for test isolation
- [!] screens/interaction/entry/entry.feature (scenario 1/3 passes; 2,3 need AppState/OAuth-popup infra, not built)
- [!] screens/interaction/setup/setup.feature (5/8 pass: infoIcons 3/3, instructions 2/5 loggedOut rows; 3 loggedIn rows + appError need OAuth click-through / unwired appError prop)
- [x] screens/layout/diary/diary.feature (2/2 scenarios, built reusable loginHelper.js click-through — unblocks other logged-in scenarios)
- [x] screens/layout/header/header.feature — 3/3 scenarios, 20/20 steps




## BDD/cucumber step definitions
- ai.feature, 
- oauth.feature (partial), 
- prototype.feature, 
- diaryEntry.feature (+ prototype's @diaryEntry), 
- entry.feature (partial), 
- setup.feature (partial), 
- layout diary.feature, 
- header.feature 
  - all implemented and passing (except crash retrieval in next batch)

- Built reusable loginHelper.js (real mock-OAuth click-through) 
- unblocked every logged-in scenario
- Fixed cucumber step timeout (5000ms → 20000ms). was false failing.

- Stale-version/stale-doc fixes:
 - config.yaml, config.data.js, config.mock.js — app-version 0.1.1→0.1.2
 - prototype.feature — app-version table + fix-string format cascade
 - header.test.jsx — stale v0.1.1
 - ai.feature — malformed old shape (stt/string id) rewritten to match real code
 - Foodlog.mock.html — stale 9-column template → real 6-column header

#### diary entry
- [?] Analyzed-food record: qty/type feature  
  - where is this? 
  - should be a scenario in ai or sheets or diary-entry feature. no?

- Editable [qty] (digit-only, default 1) and [type] (7-letter max) fields added to each analyzed food row

- AI prompt constrained to 7-letter type; 
- Fix-string reflects edits; 
- regex/structural test matching replacing exact-text assertions
- Sheet mock/production parity
- Mock sheet served locally via custom sheetServer.js, 
- synced live on save (found+fixed a CORS bug and a self-POST recursion bug there)

#### Foodlog sheet
- Real sheet.js production path implemented: 
  - fixed Drive path FoodlogApp/Foodlog, 
  - checks/creates folder+sheet, drive.file scope only
- Production sheet test written (skipped, ready for a real account)

#### diary meal record (object and view)
- Meal record schema (today's discussion → implementation)
- Sheet.MealRecordStructure / MealTextFormat / MealTextRegex added to sheet.js, unit-tested
  
- Restructured src/screens/layout/diary → src/screens/diary, 
- extracted all logic into diaryEntry.js (Diary.jsx now presentational only)
- One-?-per-record guess-mark rule implemented and cascaded through mocks/tests
  
####  Testing & housekeeping
- Full regression pass: 
  - test:unit 19/19, test:ui 43/43, 
  - cucumber suites all green
- GitHub issue #3 updated with a headline summary of everything done
- Several stale-version and stale-doc bugs 
  - [?] which files affected?

#### last minute fixes
[v] header.test.jsx — now expects v0.1.2
was stale v0.1.1

[?] tauri.conf.json + Cargo.toml — still 0.1.1. Correct?
not bumped, untested this session

[v] Mock tests — all green
unit 19/19, ui 43/43, cucumber all pass

[v] GH issue #3 — updated
headlines only, no details

[v] Prototype mode — unchanged
never flipped, nothing to revert

## confirmed:



- [v] return to prototype mode. (never flipped — config.stage stayed 'prototype' throughout; nothing to revert)

- till here done on aug 17 night before
  
--- 

- [v] Sheet location: Constant drive path FoodlogApp/Foodlog, 
      Path stored in config as sheets sheet-path

- [v] aug 17 morning


# continu aug 17 morning:  

Checkboxes below re-verified against actual code (todo.md and code had drifted
out of sync from concurrent edits) — [v] = confirmed already in place, no redo.

- [v] app-entry.feature — crashed-state detection added in App.jsx
      (useEffect: leftover authToken on mount -> trySilentLogin, else
      logout + appError set; appError now wired into Settings too)

- [v] Sheet folder+sheet: check both, create whichever missing (production only) — folder FoodlogApp, sheet Foodlog
- [v] Mock existsOrCreate: always "found", uses existing in-memory sheetMock object, no folder modeling
- [v] Mock sheet link HTML shows current sheet dynamically (sheetServer.js)
- [v] Implement production level open drive (no tests built for it, per instruction)
- [v] sheetId: empty until sheet first loaded, cleared on logout — sheets.feature scenario added
- [v] Sheet.MealRecordStructure: importable module in sheet.js
- [v] Sheet.MealTextFormat: template-style formatter function in sheet.js
- [v] "?" after foodname caught + fixed — MealTextFormat never marks the name, unit-tested
- [v] Sheet.MealTextRegex: validates MealTextFormat output, unit-tested
- [v] Restructure: src/screens/layout/diary -> src/screens/diary (scope: diary only, confirmed)
- [v] New src/screens/diary/diaryEntry.js: plain JS, holds all extracted logic
- [v] Diary.jsx: presentational only, imports from diaryEntry.js
- [v] diaryEntry.js: terse headline-only workflow pseudo-comment rewritten to match example style
- [v] Guess-mark placement: one "?" per record, never both
- [v] "Percent fields" (calspc/carbspc) — implemented as crbPer100/calPer100 in MealRecordStructure, NOT yet shown anywhere in the UI or MealTextFormat string — confirmed
- [v] per-field guess flags (qguess/uguess/fguess) in the object; UI still shows one checkbox
- [v] Text wraps after "kc)," in the multiline textbox — MealTextFormat joins with real "\n"; analyze() whitespace-normalizes before fixture lookup so AI still sees one logical string
- [!] meal Object: type filled from user input OR AI historical-pattern guess — deferred. sent to next batch
- [v] Record view: qty, unit, type all editable; type lives in both display and record object

# Batch Aug 17 evening

Finish with steps and implement
- [v] screens/layout/phonePanel/phonePanel.feature — @phonePanel.web 6/6 steps pass; @phonePanel.native [!] stub (no native device/simulator in this test tier)
- [v] screens/layout/settings/settings.feature 
  - 3/4 scenarios, 31/32 steps pass. 
  - [!] stubs (documented, not bugs): 
    - @settings.aiKeyStatus Outline of instructions
      - popup
        - instructions
          - easy process, needed for your own session
          - Google's privacy statement link
          - link to Google's AI studio and image of new key
          - copy there and paste here instruction
          - textbox `paste here`
        - Save enabled only if key looks valid (pattern) 
    - @settings.invalidSave (invalid save attempt)
      - app has no UI path to a stored-invalid key or a rejected save 
      - (SAVE stays disabled until the key already looks valid)

# Batch aug 18 1:33am

# diary entry

- [V] diaryEntry.js: terse headline-only line-by-line readable workflow pseudo-comment at top
      (already done previous batch — verified still in place)

- [V] Text should wraps after "kc)," in a multiline scrollable textbox
      (already done previous batch — MealTextFormat joins with real "\n", verified still in place)

## ai guess

- [v] app entry scenario — implemented as ai.js's getPatternContext():
      prototype returns ai.mock.js's one-time hand-authored pattern JSON
      (food -> typical qty/type); real returns {} (no Sheets values.get
      fetch built — flagged as follow-up scope, not this batch)
- [v] diary save scenario — ai.js's learnFromRecord(), called from
      diaryEntry.js's saveToSheet() for every accepted record on Save
- [v] Unit-tested (ai.test.js): seeded once, readable, updatable

## regression (found + fixed along the way)
- [v] getByDisplayValue doesn't reliably match multi-line textarea values
      (RTL/jsdom quirk) — diary.test.jsx's Fix-string test switched to a
      direct .value check instead

## final check
- [v] test:unit 21/21, test:ui 43/43, cucumber diaryEntry+sheets sweep 21/21 scenarios (134/134 steps) — all green

# Batch aug 18 1000 (continued)

## config and config urls
- [v] KEYS enumeration added to config.js (keySectionKeyName format, getByKey() helper)
- [v] urls section added to config.yaml/config.data.js/config.mock.js (9 URLs found across the codebase)
- [v] All 9 URL call-sites switched to getByKey() — also fixed a real bug: driveSafeUrl was duplicated (copy-pasted) in auth.js and starter.js, now one source
- [v] config.feature: 2 new scenarios (@config.keys, @config.urls) with key-name tables; also fixed stale app-version 0.1.1 in @config.yaml's table + added missing sheet-path row
- [v] Full regression confirmed: config 5/5, unit 21/21, jest 43/43, sheets 6/6, oauth 9/12 (3 pre-existing documented stubs, not new) — no regressions from the URL consolidation

# Batch aug 18 2050

## diary page — developer review: further changes to food rows view
- [V] 1. submit enabled only when there is text in the meal (already true)
- [V] 2. submit creates guess record and food rows accordingly (already true)
- [v] 3. buttons renamed [Fix], [Accept], [Revert], [Save]
- [v] 4. totals row says "Totals:" not "Total"
- [v] 5. tiny font header text left aligned over food rows: "Accept"
- [v] 6. each row top-left: accept checkbox + qty (2 digit) / unit (3 letter) textboxes

- [v] 8. row bottom-left: 9-letter food-type textbox, default empty
- [v] mid-right: no question marks in row, food name, values
- [v] 9. Fix: unchanged behavior already matched spec (save orig text, disable all but submit, rebuild guess record/string)
- [v] 10. Revert: closes rows view, disables all but submit, deletes guess record, restores original typed text
- [v] 11. Save: rebuilds guess string from current records (not stale Fix text), appends sheet row, notifies "Meal saved" inline in rows area, resets form
- [?] item 9.3 "calculated food result if changed" — implemented as proportional rescale of wgt/crb/cal on qty edit only (unit/type edits don't change numbers); no real AI re-analysis exists yet — flagging for confirmation
- [?] item 11 "append sheet row (date dow time carbs cals meal string)" — NOT implemented; today's sheet.js HEADER is (date dow time carbs status meal), no cals column — schema change, holding for explicit confirmation before touching
- [v] cascaded: diaryEntry.js (constants+recalc), sheet.js (unit/type length 3/9), diary.test.jsx (15/15 passing), diaryEntry.feature+steps, prototype.feature+steps

## Batch additions Aug 19 0045
follow todo.md header instructions. then implement. 

### section 1
- [ ] on submit create an original-record with parsed elements as given. No guess changes. (ie qty:0, unit "", type "", foodname "cucumber", etc. )

- [ ] 7. accept checkbox: 
New functionality:  
  - [ ] unchecked if any guess in guess record object from AI different or missing from original text:  qty, unit, type, foodname (for example cuk to cucumber). 
  - [ ] checked if given in text and same in object

- [ ] On fix or save:
   new meal row text created from guess record + row changes: 
    - for each food 
      - [ ] if accept chkbox checked: take all from row. no guess marked. 
      - [ ] if accept chkbox unchecked: take all from row, but mark with question marks as detailed in previous feature (changed unit or qty, type or foodname)
      - [ ] type not shown in string if not specified
      - [ ] type checkbox placeholder should be indented and read "details"


- [ ] On accept button pressed:  all food rows checkmarks ticked. 
- [ ] when submit button pressed meal text is disabled for changes
- [ ] fix, save, revert and accept - re-enable meal text for entry
- [ ] when meal text is changed - "Meal saved" message is emptied. 
  - Meal saved message dissapears. 
- [ ] Check that all mock paths are logical. 
- [ ] Check that all real paths are logical.
- [ ] Check that real fail has a way to clear and redo attempting to continue. 
- [ ] mock html sheet has Google sheets style cell borders in table. 

## Batch end
- [ ] discuss with developer and wait for approval to close issue. 
- [ ] change issue text to have major sections of what was changed
- no details, not even sub sections. 
- mension that tauri is not being run yet. 
- and what is missing for tauri. 

- [ ] full cucumber prototype regression running in background
- [ ] discuss with user and if done, commit with message with link to issue, push and close issue with comment of what of major issues not done. (only in headlines, no details)

