// Filename: storage.js  Version 0.3.0

// Storage module to access and retrieve data from the local secure storage.
// Prototype stage delegates to storageMock (synchronous, guarded). Real
// storage is platform-branched and inherently async (Tauri `invoke` /
// expo-secure-store are Promise-based), so the real branch below returns a
// Promise while the prototype branch keeps returning a plain value — callers
// must not assume a fixed return shape until this module leaves prototype
// stage. Platform modules are dynamically imported (never at top level, same
// pattern as auth.js) so `node --test` and bundler targets that lack one of
// the two platforms never have to resolve the other's import.

import { _ensurePrototype, isPrototype } from '../config/config.js'
import * as storageMock from '../../prototype/storage.mock.js'

// constant key names
export const KEYS = Object.freeze({
  authToken: 'authToken',
  aiApiKey: 'aiApiKey',
  sheetId: 'sheetId',
})

// Real (non-prototype) secure storage, platform-branched. Not implemented
// yet: Tauri side has no `keyring_get`/`keyring_set`/`keyring_delete` Rust
// commands registered (see src-tauri/src/main.rs), and Android's
// `expo-secure-store` package is not yet in package.json — both calls below
// are real code, but will only work once those are added.
async function _realGet(key) {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke('keyring_get', { key })
  }
  const SecureStore = await import('expo-secure-store')
  return SecureStore.getItemAsync(key)
}

async function _realUpdate(key, value) {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke('keyring_set', { key, value })
  }
  const SecureStore = await import('expo-secure-store')
  await SecureStore.setItemAsync(key, value)
  return value
}

export function initialize() {
  _ensurePrototype()
  return storageMock.initialize()
}

export function get(key) {
  if (isPrototype()) {
    _ensurePrototype()
    return storageMock.get(key)
  }
  return _realGet(key)
}

export function update(key, value) {
  if (isPrototype()) {
    _ensurePrototype()
    return storageMock.update(key, value)
  }
  return _realUpdate(key, value)
}
