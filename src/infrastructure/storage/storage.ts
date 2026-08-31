// Filename: storage.ts  
// Version 0.2.2

// Storage module for the Cloudflare-backed secure and configuration stores.
// Prototype stage delegates to storageMock, called from mock screens.

import { isPrototype } from '../environment'
import * as storageMock from '../../prototype/storage.mock.ts'
import { configurationApiUrl, storageApiUrl } from '../config/config'

let sessionToken = 
  typeof sessionStorage === 'undefined' ? undefined 
                                        : sessionStorage.getItem('foodlog-session') 
                                        ?? undefined

export function setSessionToken(token: string | undefined): void {
  sessionToken = token
  if (typeof sessionStorage === 'undefined') return
  if (token) sessionStorage.setItem('foodlog-session', token)
  else sessionStorage.removeItem('foodlog-session')
}

export function getSessionToken(): string | undefined {
  return sessionToken
}

// constant key names
export const KEYS = Object.freeze({
  authToken: 'authToken',
  aiApiKey: 'aiApiKey',
  sheetId: 'sheetId',
  usermail: 'usermail',
})

export const CONFIG_KEYS = Object.freeze({
  theme: 'theme', // Future Settings feature.
  timezoneHours: 'timezonehrs',
  timezoneName: 'timezonename', // Future Settings feature.
})

const secureRoutes = {
  authToken: 'token',
  aiApiKey: 'aikey',
  sheetId: 'sheetid',
  usermail: 'usermail',
}

function routeFor(key) {
  const route = secureRoutes[key]
  if (!route) throw new Error(`Unsupported storage key: ${key}`)
  return route
}

function configRouteFor(key) {
  if (!(key in CONFIG_KEYS) && !Object.values(CONFIG_KEYS).includes(key)) throw new Error(`Unsupported configuration key: ${key}`)
  return key
}

async function request(method, baseUrl, route, value) {
  if (!baseUrl) throw new Error('Cloudflare worker URL is not configured')
  const response = await fetch(`${baseUrl}/${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
    ...(value === undefined ? {} : { body: JSON.stringify({ value }) }),
  })
  if (!response.ok) throw new Error(`Storage request failed: ${response.status}`)
  if (response.status === 204) return undefined
  const body = await response.json()
  return body.value
}

async function _get(key) {
  return request('GET', storageApiUrl, `${routeFor(key)}/get`)
}

async function _update(key, value) {
  return request('POST', storageApiUrl, `${routeFor(key)}/store`, value)
}

async function _remove(key) {
  return request('POST', storageApiUrl, `${routeFor(key)}/store`, null)
}

export function getConfiguration(key) {
  if (isPrototype()) return Promise.resolve(storageMock.get(`configuration:${key}`))
  return request('GET', configurationApiUrl, `${configRouteFor(key)}/get`)
}

export function updateConfiguration(key, value) {
  if (isPrototype()) return Promise.resolve(storageMock.update(`configuration:${key}`, value))
  return request('POST', configurationApiUrl, `${configRouteFor(key)}/store`, value)
}

export function initialize() {
  if (isPrototype()) return storageMock.initialize()
}


export function get(key) {
  if (isPrototype()) {
    return Promise.resolve(storageMock.get(key))
  }
  return _get(key)
}

export function update(key, value) {
  if (isPrototype()) {
    return Promise.resolve(storageMock.update(key, value))
  }
  return _update(key, value)
}

export function remove(key) {
  if (isPrototype()) {
    return Promise.resolve(storageMock.remove(key))
  }
  return _remove(key)
}
