// Filename: appConstants.ts
// Version 0.2.4
// Private: import only via infrastructure/config/config.ts, not directly

export const appConstants = {
  appName: 'Foodlog',
  appVersion: '0.2.7',

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
