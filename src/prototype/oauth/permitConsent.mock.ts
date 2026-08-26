// Filename: permitConsent.mock.ts  Version 0.2.1

// Logic + imperative-promise API for the mock permissions-consent popup.
// Split from permitConsent.mock.dlg.tsx (the React component) — see
// accountChoice.mock.ts for why (.tsx can't be loaded by plain node --test).

export const permissionText =
  'Create files on your drive and see, modify and delete only those files it created.'
export const warnings = [
  'Make sure you trust Foodlog@gmail.com',
  'You may be sharing sensitive info with this app. You can always see or remove access in your Google Account',
  'Learn how Google helps you share data safely',
]
export const footer = "See Foodlog's Privacy Policy and Terms of Service"

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

// Resolves { accepted: true, scope: 'drive.file' } on Allow,
// { accepted: false } on Deny. Closes in both cases and only those cases.
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

export function deny() {
  _setVisible?.(false)
  _resolve?.({ accepted: false })
  _resolve = null
}

export function allow() {
  _setVisible?.(false)
  _resolve?.({ accepted: true, scope: 'drive.file' })
  _resolve = null
}
