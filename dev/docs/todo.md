  # Filename todo.md
  # File version 0.1.11
  ## Notes: 
  - When adding to Todo.md write Only headlines, with checkboxes, 
  - explicitly write a beep.ps1 before each step so you don't forget
  - mark step with [>] before each step
  - mark [v] - OK,  [V] - already done, [?] need user, [!] skipped
  - give # Batch header if none, with month day and hh:mm
  - callme.ps1 at end of batch 
  - when done ask for next batch
  
--- 

# Batch aug 19 0045

## diary page — original-record comparison rework
- [v] beep.ps1
- [v] 1. on submit: build original-record from raw text (sheet.js parseMealText for resubmitted Fix strings incl. "?" marks -> not-given; heuristic word-scan for free-form text)
- [v] beep.ps1
- [v] 7. accept checkbox: unchecked if any guess-record field differs/missing vs original; checked if given+same (diaryEntry.js diffFlags/accepted)
- [v] beep.ps1
- [v] Fix/Save: rebuild string from guess record + row edits; checked=no marks (effectiveGuessFlags); unchecked=marks only on fields that actually changed; type omitted if empty (unchanged); type textbox placeholder indented, reads "details"
- [v] beep.ps1
- [v] Accept button ticks every row's checkbox (unchanged)
- [v] beep.ps1
- [v] submit disables meal textbox for editing; Fix/Save/Revert/Accept re-enable it
- [v] beep.ps1
- [v] editing meal text clears/hides "Meal saved" message
- [v] beep.ps1
- [v] audit: mock paths logical, real paths logical, real-path failure has a clear/retry path — done, findings below, NOT fixed (out of scope for this batch, flagging for a follow-up batch)
  - mock paths: all clean, no issues found
  - real paths, gaps found: oauth.tauri.js/oauth.ios.js export login/trySilentLogin but not isLoggedIn/logout (auth.js calls them -> TypeError on real Tauri/iOS); oauth.android.js's real login doesn't return refreshToken/scope so real Android login always fails; storage.js's real keyring/secure-store calls aren't registered/installed yet (self-documented)
  - failure recovery gaps: App.jsx's silent-login crash recovery is the only real try/catch; auth.js login() and Diary.jsx handleSave have no try/catch around real-path calls -> silent failure/unhandled rejection, no way for the user to see what happened besides blind retry; Settings.jsx's sync existsOrCreate/sheetLink calls never catch a real-mode rejected Promise -> goToApp stays disabled with no explanation
- [v] beep.ps1
- [v] mock html sheet: Google-Sheets-style cell borders in table
- [v] cascaded fixture/test updates: ai.mock.js (2 round-trip keys, no more foodname marks for exact-match names), ai.test.js, diary.test.jsx (19/19 passing, +5 new tests), prototype.feature — found+fixed a real bug: parseMealText was stripping "?" marks without exposing them, so resubmitted marked text was misread as literally-given
- [?] behavior change flagged: resubmitting an unedited Fix string no longer auto-accepts previously-guessed fields (old behavior did, since it read AI status; new spec reads the original-text comparison instead) — seems correct per spec but calling it out since it changes prior round-trip behavior
- [v] node:test unit suite 25/25, full jest 45/46 (1 pre-existing flaky e2e timeout, confirmed passes in isolation)

## Batch end
- [v] full cucumber prototype regression: 20/20 passing (fixed one stale scenario assertion along the way — resubmit-after-Fix no longer auto-accepts marked fields)
- [?] discuss with developer, wait for approval to close issue — draft issue text prepared, presenting now
- [ ] rewrite issue text (pending approval)
- [ ] commit (message links issue), push, close issue (pending approval)
