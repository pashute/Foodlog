// Filename: storage.ts  Version 0.2.1

// Storage module for the Cloudflare-backed secure and configuration stores.
// Prototype stage delegates to storageMock so tests and mock screens remain
// local and deterministic.

import { isPrototype } from '../environment'
import * as storageMock from '../../prototype/storage.mock.ts'
import { storageApiUrl } from '../config/config'

// constant key names
export const KEYS = Object.freeze({
  authToken: 'authToken',
  aiApiKey: 'aiApiKey',
  sheetId: 'sheetId',
  usermail: 'usermail',
})

const secureRoutes = {
  authToken: 'token',
  aiApiKey: 'key',
  sheetId: 'sheet',
  usermail: 'user/mail',
}

function routeFor(key) {
  if (key.startsWith('configuration:')) return 'config'
  const route = secureRoutes[key]
  if (!route) throw new Error(`Unsupported storage key: ${key}`)
  return route
}

async function request(method, route, value) {
  if (!storageApiUrl) throw new Error('Cloudflare storage URL is not configured')
  const isConfigRequest = route.startsWith('config/')
  const response = await fetch(`${storageApiUrl}/${route}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(value === undefined ? {} : { body: JSON.stringify(isConfigRequest ? value : { value }) }),
  })
  if (!response.ok) throw new Error(`Storage request failed: ${response.status}`)
  if (response.status === 204) return undefined
  const body = await response.json()
  return body.value
}

async function _realGet(key) {
  return request('GET', `${routeFor(key)}/get`)
}

async function _realUpdate(key, value) {
  return request('POST', `${routeFor(key)}/store`, value)
}

async function _realRemove(key) {
  return request('POST', `${routeFor(key)}/store`, null)
}

export function initialize() {
  if (isPrototype()) return storageMock.initialize()
}

// get/update/remove always return a Promise, in both stages (Aug 19 batch —
// prototype branch wrapped here, real branch was already async by nature of
// Tauri invoke / expo-secure-store) so callers never have to special-case
// which stage they're in.
export function get(key) {
  if (isPrototype()) {
    return Promise.resolve(storageMock.get(key))
  }
  return _realGet(key)
}

export function update(key, value) {
  if (isPrototype()) {
    return Promise.resolve(storageMock.update(key, value))
  }
  return _realUpdate(key, value)
}

export function remove(key) {
  if (isPrototype()) {
    return Promise.resolve(storageMock.remove(key))
  }
  return _realRemove(key)
}
