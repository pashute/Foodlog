// Jest global setup: ensures user is logged in before any tests run
// Prototype + web: automated login simulation
// Otherwise: Human-In-The-Loop manual login prompt

import { devStage, platform, isPrototype } from './src/infrastructure/environment.ts'
import * as auth from './src/infrastructure/auth/auth.ts'
import { login as simulateLogin } from './dev/testing/loginSimulation.ts'

beforeAll(async () => {
  const isAutomated = isPrototype() && platform === 'web'

  if (isAutomated) {
    console.log('[setup] Prototype + web mode: running automated login simulation')
    await simulateLogin()
    const loggedIn = await auth.isLoggedIn()
    if (!loggedIn) {
      throw new Error('Automated login simulation completed but isLoggedIn() returned false')
    }
    console.log('[setup] Automated login successful')
  } else {
    console.log(`[setup] Stage: ${devStage}, Platform: ${platform} — requiring manual login`)
    console.log('[setup] Beeping for manual login prompt...')
    process.stdout.write('\x07')

    const enquirer = await import('enquirer')
    const response = await enquirer.default.prompt({
      type: 'input',
      name: 'ready',
      message: 'Please log in manually in your browser, then type "ready" and press Enter to continue tests',
    })

    if (response.ready?.toLowerCase() !== 'ready') {
      throw new Error('Manual login not completed')
    }

    const loggedIn = await auth.isLoggedIn()
    if (!loggedIn) {
      throw new Error('Manual login prompt completed but isLoggedIn() returned false')
    }
    console.log('[setup] Manual login verified')
  }
}, 30000)
