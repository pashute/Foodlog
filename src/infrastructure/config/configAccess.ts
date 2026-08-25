// Filename: configAccess.ts
// Version 0.2.0

import {
  configDefaults,
  readConfiguration,
  replaceConfiguration,
  type Configuration,
  type ReadonlyConfiguration,
} from './config'
import { isPrototype } from '../environment'
import { prototypeConfiguration } from '../../prototype/config/config.mock'

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


