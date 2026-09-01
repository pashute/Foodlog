// Filename: configIo.ts
// Version 0.2.2

import { loadConfiguration, type ConfigWarning } from './configAccess'
import { configDefaults, type Configuration } from './config'
import { setWarning } from '../warn'
import { update as storageUpdate } from '../storage/storage.ts'

export function initializeConfiguration(): ConfigWarning[] {
  const warnings = loadConfiguration()
  setWarning(warnings[0])
  return warnings
}

// Per-user config is stored on the backend via config API endpoints.
// Frontend only handles local app state initialization.
export async function saveUserConfiguration(configuration: Configuration): Promise<ConfigWarning[]> {
  // Configuration save is handled by config.servercode.ts endpoints
  // This is a no-op that returns the current config state
  const warnings = loadConfiguration(configuration)
  setWarning(warnings[0])
  return warnings
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
