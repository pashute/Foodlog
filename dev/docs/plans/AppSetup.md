# File: AppSetup.md
# Version 0.2.1

# OAuth

# AI Todo list
AI will read the todo.md instructions 
Then it will go over this file (appsetup.md) and create todos in the Todo.md 
for the developer to review. 
The AI should not fix or change anything in the code till then. 
The AI should not touch the appSetup.md file

The todo batch should be called # batch cloud storage aug 30

The top of the todo batch will have a section for the user's item headlines. 
They'll be Marked completed if known to be done. with file location. 
Left unmarked otherwise. 

Then comes the coding section which the AI is to do. 
It will be broken into sections of coding and code fixes.  
Marked also are points for discussion (only terse headline of the discussion needed)

# How it is done currently (from claud's review)
Sequence: oauthSession.ts requests scopes [driveFileScope, 'openid', 'email'] 
with access_type: 'offline', 
prompt: 'consent' → 
  PKCE auth-code flow → exchanges code via the Cloudflare worker's 
    /auth/exchange (server holds the client secret) 
    → returns {accessToken?, refreshToken?, scope, usermail, sessionToken}. 
    - auth.ts login() validates the scope is drive.file (_isFreshDriveFileToken), 
    - stores the session token,
    - and persists refreshToken ?? accessToken 
    under KEYS.authToken via storageUpdate.
TODO:  Here is where things will change. 
      storageUpdate should use the new workerStorage.ts
      I'm not sure what needs to be stored. One single token that has everything in it?
      two tokens, three?  
      AI should determine what is needed and create the keys or use them as defined below.  



fully written — sheet.ts, not a stub. _authedFetch calls sheets.googleapis.com / Drive /files using Authorization: Bearer with the stored authToken.

Did we already write the code that reads the folder + sheet, at least for mock?

Yes, for both real and mock:

Real: _existsOrCreate (sheet.ts:222) → try stored sheetId (_readById) → on failure, _findOrCreateSheet → _findByName'd folder → find/create sheet by name → throws 'Cannot access Foodlog Sheet' on total failure. Matches AppSetup.md lines 76–80.
Mock: oauth.mock.ts simulates login (account-choice + consent popups, returns a fake refreshToken); sheet.mock.ts simulates existsOrCreate/log/link in-memory, synced to sheetServer.ts for browser preview.
Caveat: the real end-to-end test for this path is currently skipped in sheet.test.ts:140 (requires a real signed-in Google session) — so the production sequence is written but not exercised by tests.

"It said I am now authenticated" — consistent with the above: a successful OAuth exchange got you an authToken with drive.file scope, which is what sheet.ts will now use for the folder/sheet lookup.

Note: AppSetup.md's storage-key spec (lines 33–47, separate sheet/driveapi:* / sheet/sheetsapi:* keys, u{hash}/{keyname} format) is out of date — actual code uses a single authToken key and a different worker key format (token:<userId>, in src/backend/storage/worker.ts, not workerStorage.ts).

# How it should be done

`https://console.cloud.google.com/`:

- api keys: 
   - OAuth Login token

   - Sheets and drive keys
   - Sheet ID
   - AI Key
   - // OAuth client id -- Public! Saved in .env file.

`https://aistudio.google.com/`

- api key:  
  - AI

# Cloudflare registration

`console.cloud.google.com`.
    developer online to create app worker:
    - [v]  created: https://foodlog-storage.pashute.workers.dev/
    store worker dev url in .env
    - [v] stored
    store worker published url in .env 
      todo in future...
  
    The following key bindings are per user: 
    AI should write code in /infrastructure/storage/  in both workerStorage.ts, and in workerConfig.ts  
    - create and accesses the keys on the fly per user with user's email hash prepended format:
      u{userhash}/{keyname}:   

    for secure storage developer online should create:  
    Encrypted secure worker KV with namespace binding: `FOODLOG_SECURE_KV`.
      - [v] created. 
    
    AI to write code in workerStorage.ts:
    - Keys created and accessed by workerStorage per user  in the agreed format as listed above:
      - Token:  `auth/token:*`.
      - Hash:  `auth/email:*`. 
-     - Sheetid: `sheet/sheetid:*`.
      - Gemini API: `ai/geminiapi:*`.
      do not return secure values to unauthenticated callers.

    AI to write code in workerStorage.ts:
    - Keys created and accessed by workerStorage per user:  in the agreed format as above
      for config storage (happens to be secure as well) developer online should create:
      namespace:  `FOODLOG_CONFIG_KV`,
      - [v] done
      
      - Theme:  `ui/theme:*`,
      - TimezoneName: `timezone/name:*`,
      - TimezoneUtcShift: `timezone/utcshift:*`,
      - TimezoneLocation: `timezone/location:*`,

      defaults:  (set in the database, but also in the app storage object until fetched from cloud after login)

      Theme:  `dark`
      Timezone:  `IDT` UTC`+3`,`Jerusalem, Israel`
      (that's name, utc shift, and location)

    The storage keys are created during login entry (after login) and updated during their respective access and saving:  

    Storage:
      - Token and Hash (user email hash) - from successful login token and email. 
            
      - Sheetid (per user)
        - from stored per user, 
        - kept after attempt to reach it directly succeeded, 
        - or retrieved after successful attempt to reach it by folder and name
        - or retrieved after created now sheet in user's folder on drive
        - or emptied if was full and these all fail. 
        - and error message shown.  Link to sheet changed to red and disabled. 
        re-enabled with color after login and sheet loading success.
  
      - Gemini API: `ai/geminiapi:*`.
        - retrieved on login if available
        - stored on ai setup save. 



## 6. login entry sequence
Login entry sequence. 
This worker.ts was supposed to be:
 workerConfig.ts  for the config vars (theme timezoneUtcShift and timezoneName and timezoneLocation  )  -  
  and workerStorage for storage vars 
  ((auth) token, usermail,  
  aikey, drivekey, sheetskey, sheetid)

config should have a default object 
infrastructure/ app entry should 
- call the config to load itself with its defaults 
- screens/Setup and step us through settings: 
 - infrastructure/login. 
- on successful login:  
   - infrastructure / Login entry: 
         - stores in secure storage current token 
         - reads from storage usermail. If same as current
                 goes to sheets.ts that
                      soes to storage to read sheetid 
                       then attempts loading itself
                            (by id, or then  folder followed by sheetname)
                              failure followed by attempt to write new 
                                     using storage sheets and drive api keys
    if there was no id in config for this user, 


## 7. Confirm that the entry sequence is exactly the same in prototype calls to modules, and the branching is only somewhere late in code

## 8. The prototype setup should run a login e2e test 
which checks the after login mock sequence succeeds. 

and that canceling the login stops with the correct warning in the settings instruction. 

## 9. When ready to test production

1. Run `npm run web`.
2. Open the app in the browser at the printed local URL.
3. Click **Login with Google**.
4. Approve only the `drive.file` scope.
5. Confirm the browser returns to `http://localhost:8081/auth` and then back into the app.
