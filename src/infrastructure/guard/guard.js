// Filename guard.js  Version 0.1.0

// Runtime guard (requirements.md "Guard: never run as a plain web app").
// Refuses to mount key UI outside Tauri or native/Android runtimes.

export function isSupportedRuntime() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return true
  }
  return typeof window !== 'undefined' && Boolean(window.__TAURI__)
}
