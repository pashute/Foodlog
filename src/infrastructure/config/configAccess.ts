// Filename: configAccess.ts
// Version 0.2.1

import {
  configDefaults,
  readConfiguration,
  replaceConfiguration,
  type Configuration,
  type ReadonlyConfiguration,
} from './config'
import { isPrototype } from '../environment'
import { prototypeConfiguration } from '../../prototype/config/config.mock'
import * as configServer from './config.serverAccess'

export type ConfigWarning = 'invalidConfiguration'

function copyConfiguration(source: ReadonlyConfiguration): Configuration {
  return {
    app: { theme: source.app.theme },
    sheets: {
      sheetName: source.sheets.sheetName,
      sheetFolder: source.sheets.sheetFolder,
    },
  }
}

function isConfiguration(value: unknown): value is Configuration {
  const candidate = value as Configuration
  return (
    (candidate?.app?.theme === 'light' || candidate?.app?.theme === 'dark') &&
    Boolean(candidate.sheets?.sheetName?.trim()) &&
    Boolean(candidate.sheets?.sheetFolder?.trim())
  )
}

export function loadConfiguration(saved?: unknown): ConfigWarning[] {
  if (isPrototype()) {
    replaceConfiguration(copyConfiguration(prototypeConfiguration))
    return []
  }

  if (!saved) {
    replaceConfiguration(copyConfiguration(configDefaults))
    return []
  }

  if (!isConfiguration(saved)) {
    replaceConfiguration(copyConfiguration(configDefaults))
    return ['invalidConfiguration']
  }

  replaceConfiguration(copyConfiguration(saved))
  return []
}

export function config(): ReadonlyConfiguration {
  return readConfiguration()
}

export async function loadConfigFromServer(): Promise<ConfigWarning[]> {
  if (isPrototype()) {
    // Prototype mode: use mock, don't call server
    replaceConfiguration(copyConfiguration(prototypeConfiguration))
    return []
  }

  try {
    // Load theme from server
    const theme = (await configServer.getConfig('theme')) || configDefaults.app.theme
    const timezonehrs = (await configServer.getConfig('timezonehrs')) || undefined
    const timezonename = (await configServer.getConfig('timezonename')) || undefined

    // Build config from server values, falling back to defaults
    const config: Configuration = {
      app: { theme: theme as 'light' | 'dark' || 'dark' },
      sheets: {
        sheetName: configDefaults.sheets.sheetName,
        sheetFolder: configDefaults.sheets.sheetFolder,
      },
    }

    replaceConfiguration(config)
    return []
  } catch (error) {
    // Server fetch failed, use defaults
    replaceConfiguration(copyConfiguration(configDefaults))
    return ['invalidConfiguration']
  }
}

export async function saveConfig(key: 'theme' | 'timezonehrs' | 'timezonename', value: string): Promise<boolean> {
  if (isPrototype()) {
    return false // Can't save in prototype mode
  }

  try {
    await configServer.setConfig(key, value)
    return true
  } catch (error) {
    return false
  }
}

