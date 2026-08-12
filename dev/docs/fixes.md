The Coding AI SHOULD NOT TOUCH THIS FILE

What needs to be fixed now

This temporary file, will be removed from git once development is done.

You do not change anything until discussed and approved. Only consult. Remember the instructions.md. 

phase 5
Section 1 App initial run: 
1. I changed things in all four header and entry, settings and setup features. 
a. fix header feature steps according to header feature
b. fix entry feature steps according to entry 
c. if needed: fix setup and settings features (and then steps accordingly)
    (only according to discussion unless you bump into a spelling mistake)
Dont forget to warn!! 

Section 2. logger with log functionality feature (not built).

Section 3. Make html of new layout and if possible screenshots 
if you cant do it, show each on the side panel and have me (pashute) do it for you, and replace the current ones. 

Don't forget to warn when done!!!


Phase 4:  unclutter auth.js and auth folder cleanup 
into:  auth.js, authLogin.js  anything else 

Phase 5: cleanup
 1. fix "sheets" to be "sheet" in files, modules, mention
 
 2. fix  ai.carbs and ai.lang to ai.analyze and  ai.summarize
  
  ai.analyze - figures out carbs and sum numbers returns a json
    need to define json
  
  ai.summarize - writes the string (could be a logical function with no ai. Easier with AI. 
  Square brackets mean if avail. format:
  {time}: ({carbs}, {cals}), per food: [qty] [sz] {food} {dtl} ({wgt}:{crb/crbs},{cal/cals})

 3. fix all versions according to new instructions.md section about versions. 

--------------
Left:
- 6b — production Gemini API client + Google Sheets API client. Not started; needs its own discuss-first cycle (see note at 6b below).
- auth batch (next, not yet started) — `oauth.steps.js` (all stubs + step-text mismatches with `oauth.feature`), `scopePopup.js` (stray `|` syntax error, missing react-native imports, undefined `styles`, unused consts), `oauth`→`auth` folder rename.
- Storage/config real branches are code-complete but not runnable yet: no Rust `keyring_get`/`keyring_set` command in `src-tauri`, `expo-secure-store` not installed.
- `ai.feature` and `settings.feature` are malformed and break whole-project `npm run test:bdd`; out of scope today, not fixed.
- `config.feature`'s `@config.get` scenario needs an `Examples:` table (developer discussion required before editing per instructions.md 2.4.2).



---------------
[v] 1. Complete feature prototype
[] 2. Feature: screens/layout/settings
 1. Feature: screens/interaction/entry (app start) — depends on 2–4

