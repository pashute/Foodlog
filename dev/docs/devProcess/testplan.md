/# Filename: devtech.md
/# Version: 0.2.1

## UI behavior / interaction tests

- Test behavior, not appearance (no pixel/visual checks).
- Assert: correct text/labels/names; correct enabled/disabled and shown/hidden state per
  app state (e.g. Sync disabled until logged in; key-paste field appears only after browser
  return; results hidden until a response arrives); correct reactions to interaction
  (press triggers the right action; errors show a message and don't crash).
- Tools: React Native Testing Library (Android UI), React Testing Library or Playwright
  (Tauri web UI).
- Mock the auth/storage boundary; assert UI reacts correctly to logged-in / logged-out and
  success / error states. Real Google login + real secure storage are verified manually
  (or in the live tier), not here.
- Runs deterministically in CI on every push (no device, no live API).

## Architecture & Privacy

- **Database:** None. Uses the user's own Google Sheet via Google OAuth 2.0.
- **API Key:** "Bring Your Own Key" model where users input their personal Google AI Studio API key stored securely. See below.
- 
- ** Available for security of API key as android or web app. See documentation on development technology. 
