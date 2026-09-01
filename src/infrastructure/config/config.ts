// Filename: config.ts
// Version 0.2.2

import { appConstants } from './appConstants.ts'

export { appConstants }

export type Theme = 'light' | 'dark'

export interface Configuration {
  app: {
    theme: Theme
  }
  sheets: {
    sheetName: string
    sheetFolder: string
  }
}

type DeepReadonly<T> = {
  readonly [Key in keyof T]: T[Key] extends object ? DeepReadonly<T[Key]> : T[Key]
}

export const storageApiUrl = process.env.EXPO_PUBLIC_CLOUDFLARE_STORAGE_URL ?? ''
export const authRedirectUrl = process.env.EXPO_PUBLIC_LOCAL_AUTH_REDIRECT ?? 'https://pashute.github.io/foodlog/auth/'
export const desktopAuthRedirectUrl = process.env.EXPO_PUBLIC_DESKTOP_AUTH_REDIRECT ?? 'foodlog://auth/'

if (typeof window !== 'undefined') {
  console.log('[config] storageApiUrl:', storageApiUrl)
  console.log('[config] EXPO_PUBLIC_CLOUDFLARE_STORAGE_URL:', process.env.EXPO_PUBLIC_CLOUDFLARE_STORAGE_URL)
}


// == mock constants ==

export const mockConstants = {
  urls: {
    mockMyDrive: 'http://localhost:3000',
  },
} as const


// == configuration ==

export const configuration: Configuration = {
  app: {
    theme: 'dark',
  },
  sheets: {
    sheetName: 'Foodlog',
    sheetFolder: 'Foodlogs',
  },
}


// == config defaults ==

export const configDefaults: Readonly<Configuration> = {
  app: {
    theme: 'dark',
  },
  sheets: {
    sheetName: 'Foodlog',
    sheetFolder: 'Foodlogs',
  },
}

export type ReadonlyConfiguration = DeepReadonly<Configuration>

export function replaceConfiguration(next: Configuration): void {
  configuration.app.theme = next.app.theme
  configuration.sheets.sheetName = next.sheets.sheetName
  configuration.sheets.sheetFolder = next.sheets.sheetFolder
}

export function readConfiguration(): ReadonlyConfiguration {
  return configuration
}
