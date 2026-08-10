// Filename index.js  Version 0.1.0

import { registerRootComponent } from 'expo'
import { Text, View } from 'react-native'
import App from './App.jsx'
import { isSupportedRuntime } from './src/infrastructure/guard/guard.js'

function DesktopOnlyGuard() {
  return (
    <View>
      <Text>desktop app only</Text>
    </View>
  )
}

registerRootComponent(isSupportedRuntime() ? App : DesktopOnlyGuard)
