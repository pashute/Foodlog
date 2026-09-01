// Filename: index.ts
// Version: 0.2.1
// Expo entry point — registers the app root.

import { registerRootComponent } from 'expo'
import App from './src/App.tsx'
import { report, LogSeverity } from './src/infrastructure/log.ts'
import { appConstants } from './src/infrastructure/config/config.ts'

const devStage = process.env.EXPO_PUBLIC_STAGE || 'missing'
const platform = process.env.EXPO_PUBLIC_TARGET || 'missing'
const release = process.env.EXPO_PUBLIC_RELEASE  || 'missing'
const appName = appConstants.appName
const appVersion = appConstants.appVersion

report('always', 'root', 'index', 'module-load', 
    `${appName} v${appVersion} starting: ${devStage} (${platform} - ${release}) `)
    
registerRootComponent(App)
