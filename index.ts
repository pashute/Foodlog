// Filename: index.ts
// Version: 0.2.1
// Expo entry point — registers the app root.

import { registerRootComponent } from 'expo'
import App from './src/App.tsx'
import { completeAuthCallback } from './src/entry/auth/index.ts'

completeAuthCallback()
registerRootComponent(App)
