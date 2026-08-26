export const getText = (formatter: string, ...data: string[]): string => {
  return formatter.replace(/\{[^}]*\}/g, () => data.shift() ?? '')
}

export const formatter = {
  settings: {
    instruction: {
      setupOK: 'Press "Go to Diary" to use the app.',
      needLogin: 'Press "Login with Google" to use the app.',
      needAiKey: 'Press [Start AI] for AI key instructions',
    },
    info: {
      aiKey: 'Press "Start AI" to see how & why',
      theme: 'Theme change not yet available',
      timezone: 'This changes the timezone in this app. Not the system settings.',
    },
    error: {
      aiKeyStatus: 'Could not check AI key status - try again',
      aiKeySave: 'Could not save AI key - try again',
      sheet: 'Could not reach your Foodlog sheet - try again',
      configurationLoad: 'Could not reload configuration',
      configurationSave: 'Could not save configuration',
    },
  },
}