  # Filename todo.md
  # File version 0.1.9

## IMPLEMENTED — see aiKey.dlg.jsx, Settings.jsx, ai.js, settings.feature, setup.feature, requirements.md

## aiKey.dlg

- scenario in settings (without detailed text)
- dialog
  - header: Gemini key
  - body text (/n = new line, not ascii \n):

    For the AI To estimate the carbs and calories /n
    without exposing the info to anyone, /n
    you need to start your own Gemini AI session. /n
    /n
    Its free and easy.  Here's Google's [Privacy Statement] /n
    And here's how to do it:       [Screenshot of button GET API KEY ]

  - steps:
    1. go to [Google Ai Studio](https://aistudio.google.com/app/api-keys)  [img:aiKeyGet.png]
    2. Click on Create API Key in the topleft corner
    3. Just use the default project
    4. [ Click here to paste your api key ] [SAVE] (hidden warning: invalid key, try again)

  - Save is enabled if a valid key is there
  - There are two screenshots on the right with a circle around the api key
  - Images already in src/imgs/aiKey
  - Fill in link to Gemini privacy statement

## info icons

- feature in settings: small info icons
  - at end of each of: theme, ai key, and timezone rows
  - adjacent to the button and after it
- change AI key "Import" to "Start AI" — in docs, requirements, code, and tests
- feature in setup: click on info icons sets instruction text; letting go returns former instruction
  | row    | instruction text                          |
  |--------|--------------------------------------------|
  | theme  | theme change not yet available              |
  | ai key | Press "Start AI" to see how & why           |
