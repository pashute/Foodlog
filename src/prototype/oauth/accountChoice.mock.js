// Filename: accountChoice.mock.js  Version 0.1.0

// Logic + imperative-promise API for the mock Google account-choice popup.
// Split from accountChoice.mock.dlg.jsx (the React component) because that
// file imports 'react-native' and uses JSX — plain `node --test`/cucumber
// can't load a .jsx file at all (not even a parse issue, Node's loader
// rejects the extension outright), so oauth.mock.js and feature step defs
// import this plain module instead when they only need popup()/test hooks.

export const accounts = [
  { id: 'user1', email: 'user1@gmail.com', name: 'user1', selected: true, disabled: false },
  { id: 'user2', email: 'user2@gmail.com', name: 'user2', selected: false, disabled: true },
]

let _setVisible = null
let _resolve = null
let _testResponse

// Called by the .dlg.jsx component to register how it toggles its own
// `visible` state.
export function _registerVisibilityHandler(setVisible) {
  _setVisible = setVisible
}

// Test-only: queues the next popup() call to resolve immediately with the
// given result instead of waiting for a rendered Modal's button press.
export function _queueTestResponse(response) {
  _testResponse = response
}

// Resolves { accepted: true, username, email } on Continue,
// { accepted: false } on Cancel. Closes in both cases and only those cases.
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

export function cancel() {
  _setVisible?.(false)
  _resolve?.({ accepted: false })
  _resolve = null
}

export function chooseSelected() {
  const chosen = accounts.find((a) => a.selected)
  _setVisible?.(false)
  _resolve?.({ accepted: true, username: chosen.name, email: chosen.email })
  _resolve = null
}
