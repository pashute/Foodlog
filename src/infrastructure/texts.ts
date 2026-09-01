// Text constants for all UI — extracted from src/screens and src/infrastructure/auth
// Organization: clear section names with msg/lbl/btn/link subsections
// Usage: txt.settings.msg.goToDiary or txt.donate.btn.donate

export const formatter = {
  menu: {
    likeThis: 'I like this!',
    talkToUs: 'Talk to us',
  },
  instruction: {
    settings: 'To get going press [Go to Diary].\nBon appétite!',
    diary: 'Log a meal, AI estimates carbs & energy. Fix guesses, save.',
  },
  settings: {
    instruction: {
      setupOK: 'Go ahead, start logging meals!',
      needLogin: 'Go ahead, log in.\nIts free forever. No ads. No ties.',
      needAiKey: 'Enable AI to estimate carbs & energy.',
    },
    info: {
      aiKey: 'Press "Start AI" to see how & why',
      theme: 'Theme change not yet available',
      timezone: 'This does not change the system settings. Only the timezone in this app',
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

// Common text constants used across multiple files
export const commonTexts = {
  email: 'pashute@gmail.com',
  appName: 'Foodlog',
  themeLight: 'Light',
  themeDark: 'Dark',
}

export const txt = {
  settings: {
    msg: {
      theme: 'Theme',
      openConfig: 'Open configuration',
      reload: 'Reload',
      startAi: 'Start AI',
      change: 'Change',
      goToDiary: 'Go to Diary',
      sheetName: 'Foodlog',
      openSheets: 'Open in Google Sheets',
    },
    lbl: {
      infoTag: 'info:',
    },
    btn: {
      openConfig: 'Open configuration',
      reload: 'Reload',
      startAi: 'Start AI',
      change: 'Change',
      goToDiary: 'Go to Diary',
      openSheets: 'Open in Google Sheets',
    },
  },
  diary: {
    msg: {
      minutesAgo: 'minutes ago',
      minutesNow: ' (now)',
      carbs: 'Carbs',
      energy: 'Energy',
      gramsUnit: ' g',
      kcalUnit: ' kcal',
      aiTitle: 'AI estimate',
      totals: 'Totals:',
      totalsFormat: 'carbs {carbs} g · {energy} kcal',
      acceptHeader: 'Accept',
      fix: 'Fix',
      accept: 'Accept',
      save: 'Save',
      revert: 'Revert',
      mealSaved: 'Meal saved',
      foodLogLink: 'Food log &#8599;',
    },
    btn: {
      fix: 'Fix',
      accept: 'Accept',
      save: 'Save',
      revert: 'Revert',
      submit: '▶',
    },
    lbl: {
      infoTag: 'info:',
    },
  },
  header: {
    msg: {
      settings: 'Settings',
      enterMeal: 'Enter meal',
      logout: 'Log out',
    },
    btn: {
      loginGoogle: 'Login with Google',
      hamburger: '☰',
    },
  },
  donate: {
    lbl: {
      title: 'Enjoyed?',
      tier1: 'Donate',
      tier2: 'Say "Hi!"',
      tier3: 'I seriously wish to assist',
    },
    msg: {
      subtitle: 'Wanna help us make it even better?',
      tier1Note: 'a cup of ice cold natural orange juice!',
      customDefault: '10018',
      footerText: 'Have remarks, questions, feature requests?',
    },
    link: {
      contactHref() {
        const subject = encodeURIComponent('From Foodlog')
        const body = encodeURIComponent('Hi, I\'m using the Foodlog app and wish to remark.')
        return `mailto:${commonTexts.email}?subject=${subject}&body=${body}`
      },
    },
    btn: {
      donate1: '$1',
      donate18: '$18 חי',
      close: 'Close',
    },
  },
  contact: {
    lbl: {
      title: 'Contact me',
    },
    msg: {
      subtitle: `Send me a message to ${commonTexts.email}`,
      placeholder: 'Your message...',
      alertNoText: `Please write a message or send me an email at ${commonTexts.email}`,
      successMsg: '✓ Message sent!',
      footerText: 'Any issues? Feel free to reach out.',
    },
    btn: {
      send: 'SEND',
      close: 'Close',
    },
  },
  aiKey: {
    lbl: {
      title: 'Gemini key',
    },
    msg: {
      intro: 'For the AI to estimate the carbs and calories\nwithout exposing the info to anyone,\nyou need to start your own Gemini AI session.',
      freeEasy: 'It\'s free and easy. Here\'s Google\'s',
      privacyLink: 'Privacy Statement',
      howTo: '. And here\'s how to do it:',
      step1: '1. Go to',
      step1Link: 'Google AI Studio',
      step2: '2. Click on Create API Key in the top-left corner',
      step2Link: '(see screenshot)',
      step3: '3. Just use the default project',
      step4: '4. Paste your API key here',
      placeholder: 'AIza...',
      invalidKey: 'Invalid key, try again',
    },
    btn: {
      save: 'Save',
      close: 'Close',
    },
  },
  config: {
    lbl: {
      title: 'Configuration',
      sectionUI: 'UI',
      sectionSheet: 'Sheet',
      labelTheme: 'Theme',
      labelFolder: 'Sheet folder',
      labelName: 'Sheet name',
    },
    msg: {
      restoreDefaults: 'Restore defaults',
    },
    btn: {
      restore: 'Restore defaults',
      cancel: 'Cancel',
      save: 'Save',
    },
  },
  starter: {
    lbl: {
      title: 'Connect Google Drive',
    },
    msg: {
      yourOwn: 'Foodlog stores your data in your own file.\nOnly you can access it. Only you see it.',
      noTouch: 'Foodlog cannot touch and does not see any other files.',
      permission: 'For that you will be logging in with the drive.file permissions, allowing Foodlog to open only the Foodlog sheet it created.',
      readMore: 'See more on our website',
    },
    link: {
      privacy: '/privacy.html',
      terms: '/terms.html',
    },
    btn: {
      continueLogin: 'Continue Login with Google',
      cancel: 'Cancel',
    },
  },
}

// Text maker functions for compound messages
export function detailMsg(err, customEmail = commonTexts.email) {
  return `Error: ${err}\nContact: ${customEmail}`
}

export function formatMsg(template, ...values) {
  return template.replace(/\{[^}]*\}/g, () => values.shift() ?? '')
}

export function getText(formatter, ...data) {
  return formatter.replace(/\{[^}]*\}/g, () => data.shift() ?? '')
}
