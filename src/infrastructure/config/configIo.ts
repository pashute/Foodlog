// Filename: configIo.ts
// Version 0.2.1

import { loadConfiguration, type ConfigWarning } from './configAccess'
import { configDefaults, type Configuration } from './config'
import { setWarning } from '../warn'
import { getConfiguration, updateConfiguration, CONFIG_KEYS } from '../storage/storage.ts'

export function initializeConfiguration(): ConfigWarning[] {
  const warnings = loadConfiguration()
  setWarning(warnings[0])
  return warnings
}

export async function loadUserConfiguration(_usermail: string): Promise<ConfigWarning[]> {
  const saved = await getConfiguration(CONFIG_KEYS.theme)
  if (!saved) await updateConfiguration(CONFIG_KEYS.theme, configDefaults.app.theme)
  let parsed: unknown
  try {
    parsed = saved ? { theme: saved } : { theme: configDefaults.app.theme }
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
  await updateConfiguration(CONFIG_KEYS.theme, configuration.app.theme)
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
