// Filename: starter.js  Version 0.2.2

// Logic + imperative-promise API for the pre-login "calming scope" starter
// popup (requirements.md "OAuth login"). Split from starter.dlg.jsx (the
// React component) because that file imports 'react-native' and uses JSX —
// plain `node --test`/cucumber can't load a .jsx file at all (unknown file
// extension, not even a parse issue), so auth.js and feature step defs
// import this plain module when they only need popup()/test hooks.

import { getByKey, KEYS } from '../config/config.js'

export const title = 'Connect Google Drive'
export const messageText1 = 'Foodlog stores your data in your own file.\nOnly you can access it. Only you see it.'
export const messageText2 = 'Foodlog cannot touch and does not see any other files.'
export const messageText3 =
  'For that you will be logging in with the drive.file permissions, allowing Foodlog to open only the Foodlog sheet it created.'
export const readFurtherLabel = 'See more on our website'

// Now sourced from config (urls.drive-safe) — was previously a literal
// duplicated here and in auth.js separately (config.js has no dependency
// on either of them, so importing it here doesn't risk the auth.js <->
// starter.js circular import that duplicating the literal was working
// around).
export const driveSafeUrl = getByKey(KEYS.keyUrlDriveSafe)

let _setVisible = null
let _resolve = null
let _testResponse

export function _registerVisibilityHandler(setVisible) {
  _setVisible = setVisible
}

// Test-only: queues the next popup() call to resolve immediately with the
// given result instead of waiting for a rendered Modal's button press.
export function _queueTestResponse(response) {
  _testResponse = response
}

// Called by auth.login(): await popup() -> true (continue) / false
// (cancel). Closes in both cases and only those cases.
export function popup() {
  if (_testResponse !== undefined) {
    const response = _testResponse
    _testResponse = undefined
    return Promise.resolve(response)
  }
  return new Promise((resolve) => {
    _resolve = resolve
    _setVisible?.(true)
  })
}

export function finish(result) {
  _setVisible?.(false)
  _resolve?.(result)
  _resolve = null
}

// True while popup() is awaiting a decision. A proxy for "the dialog is
// shown" at the logic layer — actual Modal visibility needs a rendered
// tree (RNTL/RTL tier), which this module doesn't have.
export function isPending() {
  return _resolve !== null
}
