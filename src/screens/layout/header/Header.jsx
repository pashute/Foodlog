// Filename Header.jsx  Version 0.1.0

import { Text, View } from 'react-native'
import { get } from '../../../infrastructure/config/config.js'

export default function Header() {
  const appname = get('app', 'appname')
  const version = get('app', 'version')

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{appname}</Text>
      <Text style={{ fontSize: 12 }}>v{version}</Text>
      <Text>Login with Google</Text>
      <Text accessibilityRole="button" aria-label="hamburger menu">
        ☰
      </Text>
    </View>
  )
}
