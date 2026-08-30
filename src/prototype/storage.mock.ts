// Filename storage.mock.ts  Version 0.2.1

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

export function remove(key) {
  store.delete(key)
}

export function keys() {
  return [...store.keys()]
}
