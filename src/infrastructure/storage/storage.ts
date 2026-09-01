// Filename: storage.ts  Version 0.2.1

// Storage module for the Cloudflare-backed secure and configuration stores.
// Prototype stage delegates to storageMock so tests and mock screens remain
// local and deterministic.

import { isPrototype } from '../environment'
import * as storageMock from '../../prototype/storage.mock.ts'
import { storageApiUrl } from '../config/config'
import * as authServer from '../auth/auth.serverAccess'

let _sessionToken: string | null = null
let _refreshing: Promise<void> | null = null

// constant key names
export const KEYS = Object.freeze({
  authToken: 'authToken',
  aiApiKey: 'aiApiKey',
  sheetId: 'sheetId',
})

const secureRoutes = {
  authToken: 'token',
  aiApiKey: 'aikey',
  sheetId: 'sheetid',
}

function routeFor(key) {
  if (key.startsWith('configuration:')) return 'config'
  const route = secureRoutes[key]
  if (!route) throw new Error(`Unsupported storage key: ${key}`)
  return route
}

export function setSessionToken(token: string | null) {
  _sessionToken = token
}

async function request(method, route, value, retry = true) {
  if (!storageApiUrl) throw new Error('Cloudflare storage URL is not configured')
  const isConfigRequest = route.startsWith('config/')

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_sessionToken) {
    headers['Authorization'] = `Bearer ${_sessionToken}`
  }

  const response = await fetch(`${storageApiUrl}/${route}`, {
    method,
    headers,
    ...(value === undefined ? {} : { body: JSON.stringify(isConfigRequest ? value : { value }) }),
  })

  // Handle 401: sessionToken expired or invalid
  if (response.status === 401 && retry && _sessionToken) {
    // Wait if another refresh is in progress
    if (_refreshing) {
      await _refreshing
      return request(method, route, value, false) // Retry without recursion guard
    }

    // Try to refresh accessToken (which doesn't help with sessionToken, but might help with Google API calls)
    _refreshing = authServer.refreshAccessToken(_sessionToken, 'web').catch(() => {})
    await _refreshing
    _refreshing = null

    // Retry the original request
    return request(method, route, value, false)
  }

  if (!response.ok) throw new Error(`Storage request failed: ${response.status}`)
  if (response.status === 204) return undefined
  const body = await response.json()
  return body.value
}

async function _realGet(key) {
  return request('GET', routeFor(key))
}

async function _realUpdate(key, value) {
  return request('POST', routeFor(key), value)
}

async function _realRemove(key) {
  return request('POST', routeFor(key), null)
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
