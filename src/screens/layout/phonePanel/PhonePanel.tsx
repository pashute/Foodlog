// Filename: PhonePanel.tsx
// Version: 0.2.1
// Web-only visual wrapper (screens/layout/phonePanel): frames the app inside
// a phone-shaped panel on web so it previews closer to the native layout.
// Native builds (Platform.OS !== 'web') render children unwrapped.
// Frame styling mirrors dev/docs/screenshots/foodlog-settings-mock.html (.phone/.notch).

import { Platform, View, StyleSheet } from 'react-native'

export default function PhonePanel({ children }) {
  if (Platform.OS !== 'web') return children

  return (
    <View style={styles.backdrop}>
      <View style={styles.phone}>
        <View style={styles.notch} />
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
    overflowY: 'auto',
    backgroundColor: '#0b0b0d',
  },
  phone: {
    width: 375,
    height: 812,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
  },
  notch: {
    width: 100,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3a3b44',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
})
