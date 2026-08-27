// Filename: configIo.ts
// Version 0.2.1

import { loadConfiguration, type ConfigWarning } from './configAccess'
import { configDefaults, type Configuration } from './config'
import { setWarning } from '../warn'
import { get as storageGet, update as storageUpdate } from '../storage/storage.ts'

function storageKey(usermail: string): string {
  return `configuration:${usermail}`
}

export function initializeConfiguration(): ConfigWarning[] {
  const warnings = loadConfiguration()
  setWarning(warnings[0])
  return warnings
}

export async function loadUserConfiguration(usermail: string): Promise<ConfigWarning[]> {
  const saved = await storageGet(storageKey(usermail))
  let parsed: unknown
  try {
    parsed = saved ? JSON.parse(saved) : undefined
  } catch {
    parsed = saved
  }
  if (parsed && typeof parsed === 'object' && 'theme' in parsed) {
    parsed = {
      ...configDefaults,
      app: { theme: parsed.theme },
    }
  }
  const warnings = loadConfiguration(parsed)
  setWarning(warnings[0])
  return warnings
}

export async function saveUserConfiguration(usermail: string, configuration: Configuration): Promise<ConfigWarning[]> {
  await storageUpdate(storageKey(usermail), { theme: configuration.app.theme })
  return loadUserConfiguration(usermail)
}

export function restoreDefaults(): Configuration {
  return {
    app: { theme: configDefaults.app.theme },
    sheets: {
      sheetName: configDefaults.sheets.sheetName,
      sheetFolder: configDefaults.sheets.sheetFolder,
    },
  }
}
