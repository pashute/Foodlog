// Filename: config.mock.ts
// Version 0.2.0

import type { Configuration } from '../../infrastructure/config/config'

export const prototypeConfiguration: Configuration = {
  app: {
    theme: 'dark',
  },
  sheets: {
    sheetName: 'Foodlog',
    sheetFolder: 'Foodlogs',
  },
}
