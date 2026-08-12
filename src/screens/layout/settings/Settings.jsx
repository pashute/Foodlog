// Filename: Settings.jsx
// Version: 0.1.0
// Settings screen (screens/layout/settings + screens/interaction/setup)

import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { get as configGet } from '../../../infrastructure/config/config.js'
import { get as storageGet, KEYS } from '../../../infrastructure/storage/storage.js'
import { existsOrCreate } from '../../../infrastructure/sheet/sheet.js'

const HOVER_TEXT = {
  aiKey:
    "For your privacy and security, you'll use your own Gemini access to read your meals and calculate energy and carbs. It is stored locally and not shared with anyone.",
  timezone: 'This changes the timezone in this app. Not the system settings.',
}

export default function Settings() {
  const [hoverText, setHoverText] = useState('')

  const theme = configGet('app', 'theme')
  const hasAiKey = Boolean(storageGet(KEYS.aiApiKey))
  const sheet = existsOrCreate()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const goToAppDisabled = !hasAiKey || !sheet?.id

  const idleText = !hasAiKey
    ? 'Gemini API key needed. See instructions.'
    : goToAppDisabled
      ? 'Please log in.'
      : 'All set — tap Go to App to start logging.'

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Theme</Text>
          <Text style={styles.value}>{theme === 'dark' ? 'Dark' : 'Light'}</Text>
        </View>
      </View>

      <Pressable
        style={styles.card}
        onHoverIn={() => setHoverText(HOVER_TEXT.aiKey)}
        onHoverOut={() => setHoverText('')}
      >
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.led, hasAiKey ? styles.ledGreen : styles.ledRed]} />
            <Text style={styles.statusLabel}>{hasAiKey ? 'Key configured' : 'No key'}</Text>
          </View>
          <Pressable style={styles.btn}>
            <Text style={styles.btnText}>Import</Text>
          </Pressable>
        </View>
      </Pressable>

      <Pressable
        style={styles.card}
        onHoverIn={() => setHoverText(HOVER_TEXT.timezone)}
        onHoverOut={() => setHoverText('')}
      >
        <View style={styles.row}>
          <Text style={styles.value}>{timezone}</Text>
          <View style={[styles.btn, styles.btnDisabled]}>
            <Text style={styles.btnText}>Change</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.value}>{sheet?.name ?? 'Foodlog'}</Text>
          <Text style={styles.link}>Open in Google Sheets</Text>
        </View>
      </View>

      <Pressable
        style={[styles.goBtn, goToAppDisabled && styles.goBtnDisabled]}
        disabled={goToAppDisabled}
        accessibilityRole="button"
      >
        <Text style={styles.goBtnText}>Go to App</Text>
      </Pressable>

      <Text style={styles.instruction}>{hoverText || idleText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#1c1d24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  label: { color: '#9ca3af', fontSize: 15 },
  value: { color: '#f3f4f6', fontSize: 15 },
  statusLabel: { color: '#f3f4f6', fontSize: 14.5 },
  led: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  ledGreen: { backgroundColor: '#4ade80' },
  ledRed: { backgroundColor: '#f87171' },
  btn: {
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#26272f',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#f3f4f6', fontSize: 13 },
  link: { color: '#7aa2ff', fontSize: 14 },
  goBtn: {
    backgroundColor: '#c084fc',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  goBtnDisabled: { opacity: 0.5 },
  goBtnText: { color: '#1a0f27', fontSize: 16, fontWeight: '700' },
  instruction: { color: '#9ca3af', fontSize: 12.5, textAlign: 'center', minHeight: 18 },
})
