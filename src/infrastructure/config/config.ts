// Filename: config.ts
// Version 0.2.1

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

// == app constants ==

export const appConstants = {
  appName: 'Foodlog',
  appVersion: '0.2.2',

  urls: {
    googlePrivacy: 'https://policies.google.com/privacy#intro',
    googleAiStudio: 'https://aistudio.google.com/app/api-keys',
    driveSafe: 'https://NotImplementedYet.github.com/drive-safe.html',
    googleDriveApi: 'https://www.googleapis.com/drive/v3',
    googleSheetsApi: 'https://sheets.googleapis.com/v4/spreadsheets',
    myDrive: 'https://docs.google.com/spreadsheets/d',
    driveFileScope: 'https://www.googleapis.com/auth/drive.file',
    googleGeminiApi: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
} as const

export const storageApiUrl = process.env.CLOUDFLARE_STORAGE_URL ?? ''
export const authRedirectUrl = process.env.EXPO_PUBLIC_AUTH_REDIRECT ?? 'https://pashute.github.io/foodlog/auth/'
export const desktopAuthRedirectUrl = process.env.EXPO_PUBLIC_DESKTOP_AUTH_REDIRECT ?? 'foodlog://auth/'


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
