// Filename: Settings.jsx
// Version: 0.7.1
// Settings screen (screens/layout/settings + screens/interaction/setup)

import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native'
import { get as configGet } from '../../../infrastructure/config/config.js'
import { get as storageGet, update as storageUpdate, KEYS } from '../../../infrastructure/storage/storage.js'
import { existsOrCreate, link as sheetLink } from '../../../infrastructure/sheet/sheet.js'
import { keyStatus } from '../../../infrastructure/ai/ai.js'
import AiKeyDlg from './aiKey.dlg.jsx'

const AI_KEY_LABEL = { missing: 'AI Key Missing', invalid: 'AI Key Invalid', ok: 'AI Key OK' }
const AI_KEY_LED = { missing: 'ledRed', invalid: 'ledAmber', ok: 'ledGreen' }

// Shown while an info icon is pressed and held. No hover anywhere in this
// app — it's a phone app, so hints reveal on press-and-hold, not pointer
// position, and revert to the idle instruction on release.
const PRESS_TEXT = {
  theme: 'Theme change not yet available',
  aiKey: 'Press "Start AI" to see how & why',
  timezone: 'This changes the timezone in this app. Not the system settings.',
}

// e.g. 120 -> "GMT+2", -330 -> "GMT-5:30"
function formatGmtOffset(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hours = Math.floor(abs / 60)
  const minutes = abs % 60
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

// Priority order when idle (no card pressed): an application error outranks
// everything, then login, then the AI key, then "no problem" — see
// dev/features/screens/interaction/setup/setup.feature.
function idleInstruction({ appError, loggedIn, aiKeyStatus }) {
  if (appError) return appError
  if (!loggedIn) return 'Press "Login with Google" to use the app.'
  if (aiKeyStatus !== 'ok') return 'Press [Start AI] for AI key instructions'
  return 'Press Go to Data Entry'
}

export default function Settings({ loggedIn = false, appError = null, onGoToDiary = () => {} }) {
  const [pressText, setPressText] = useState('')
  const [showAiKeyDlg, setShowAiKeyDlg] = useState(false)

  const theme = configGet('app', 'theme')
  const aiKeyStatus = keyStatus(storageGet(KEYS.aiApiKey))
  const sheet = existsOrCreate()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const gmtOffset = formatGmtOffset(-new Date().getTimezoneOffset())
  const disabledUntilLogin = !loggedIn
  const goToAppDisabled = disabledUntilLogin || aiKeyStatus !== 'ok' || !sheet?.id

  const idleText = idleInstruction({ appError, loggedIn, aiKeyStatus })
  const showingError = !pressText && Boolean(appError)

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.instruction, showingError && styles.instructionError]}>
          {pressText || idleText}
        </Text>
      </View>

      <View style={[styles.card, disabledUntilLogin && styles.cardDisabled]}>
        <View style={styles.row}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.rowRight}>
            <Text style={styles.value}>{theme === 'dark' ? 'Dark' : 'Light'}</Text>
            <Pressable
              style={styles.infoIcon}
              onPressIn={() => setPressText(PRESS_TEXT.theme)}
              onPressOut={() => setPressText('')}
              aria-label="theme info"
            >
              <Text style={styles.infoIconText}>ⓘ</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.card, disabledUntilLogin && styles.cardDisabled]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.led, styles[AI_KEY_LED[aiKeyStatus]]]} />
            <Text style={styles.statusLabel}>{AI_KEY_LABEL[aiKeyStatus]}</Text>
          </View>
          <View style={styles.rowRight}>
            <Pressable
              style={styles.btn}
              disabled={disabledUntilLogin}
              onPress={() => setShowAiKeyDlg(true)}
            >
              <Text style={styles.btnText}>Start AI</Text>
            </Pressable>
            <Pressable
              style={styles.infoIcon}
              onPressIn={() => setPressText(PRESS_TEXT.aiKey)}
              onPressOut={() => setPressText('')}
              aria-label="AI key info"
            >
              <Text style={styles.infoIconText}>ⓘ</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.card, disabledUntilLogin && styles.cardDisabled]}>
        <View style={styles.row}>
          <View style={styles.timezoneValue}>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {timezone}
            </Text>
            <Text style={styles.gmtBadge}> ({gmtOffset})</Text>
          </View>
          <View style={styles.rowRight}>
            <View style={[styles.btn, styles.btnDisabled]}>
              <Text style={styles.btnText}>Change</Text>
            </View>
            <Pressable
              style={styles.infoIcon}
              onPressIn={() => setPressText(PRESS_TEXT.timezone)}
              onPressOut={() => setPressText('')}
              aria-label="timezone info"
            >
              <Text style={styles.infoIconText}>ⓘ</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.card, disabledUntilLogin && styles.cardDisabled]}>
        <View style={styles.row}>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {sheet?.name ?? 'Foodlog'}
          </Text>
          <Pressable onPress={() => Linking.openURL(sheetLink())}>
            <Text style={styles.link}>Open in Google Sheets</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.goBtn, goToAppDisabled && styles.goBtnDisabled]}
        disabled={goToAppDisabled}
        onPress={onGoToDiary}
        accessibilityRole="button"
      >
        <Text style={styles.goBtnText}>Go to Diary</Text>
      </Pressable>

      <AiKeyDlg
        visible={showAiKeyDlg}
        onClose={() => setShowAiKeyDlg(false)}
        onSave={(key) => {
          storageUpdate(KEYS.aiApiKey, key)
          setShowAiKeyDlg(false)
        }}
      />
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
  cardDisabled: { opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoIcon: { paddingHorizontal: 2 },
  infoIconText: { color: '#9ca3af', fontSize: 16 },
  label: { color: '#9ca3af', fontSize: 15 },
  value: { color: '#f3f4f6', fontSize: 15, flexShrink: 1, minWidth: 0 },
  timezoneValue: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 },
  gmtBadge: { color: '#9ca3af', fontSize: 15 },
  statusLabel: { color: '#f3f4f6', fontSize: 14.5 },
  led: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  ledGreen: { backgroundColor: '#4ade80' },
  ledRed: { backgroundColor: '#f87171' },
  ledAmber: { backgroundColor: '#fbbf24' },
  btn: {
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#26272f',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
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
  instruction: { color: '#f3f4f6', fontSize: 14, fontWeight: '400', textAlign: 'center', minHeight: 20 },
  instructionError: { color: '#f87171', fontWeight: '700' },
})
