// Filename storage.mock.js  Version 0.1.0

// Mock secure storage (prototype stage). In-memory key/value store.

const store = new Map()

export function initialize() {
  store.clear()
}

export function get(key) {
  return store.get(key)
}

export function update(key, value) {
  store.set(key, value)
  return value
}

export function keys() {
  return [...store.keys()]
}
