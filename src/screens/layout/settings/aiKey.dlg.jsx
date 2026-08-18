// Filename: aiKey.dlg.jsx
// Version: 0.1.3
// Gemini AI Setup dialog (screens/layout/settings): opens on "Start AI",
// walks the user through getting a free Gemini API key and pasting it.

import { useState } from 'react'
import { Modal, View, Text, TextInput, Image, Pressable, ScrollView, StyleSheet, Linking } from 'react-native'
import { keyStatus } from '../../../infrastructure/ai/ai.js'
import { getByKey, KEYS } from '../../../infrastructure/config/config.js'
import aiKeyGetImg from '../../../imgs/aiKey/aiKeyGet.png'
import aiKeyCreateImg from '../../../imgs/aiKey/aiKeyCreate.png'

export const privacyStatementUrl = getByKey(KEYS.keyUrlGooglePrivacy)
export const aiStudioUrl = getByKey(KEYS.keyUrlAiStudio)

export default function AiKeyDlg({ visible, onSave = () => {}, onClose = () => {} }) {
  const [value, setValue] = useState('')
  const [showInvalid, setShowInvalid] = useState(false)
  const [showScreenshot, setShowScreenshot] = useState(false)

  const valid = keyStatus(value) === 'ok'

  const handleChangeText = (text) => {
    setValue(text)
    setShowInvalid(false)
  }

  const handleSave = () => {
    if (!valid) {
      setShowInvalid(true)
      return
    }
    onSave(value)
    setValue('')
    setShowInvalid(false)
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Gemini key</Text>

          <Text style={styles.text}>
            For the AI to estimate the carbs and calories{'\n'}
            without exposing the info to anyone,{'\n'}
            you need to start your own Gemini AI session.
          </Text>

          <Text style={styles.text}>
            It's free and easy. Here's Google's{' '}
            <Text style={styles.link} onPress={() => Linking.openURL(privacyStatementUrl)}>
              Privacy Statement
            </Text>
            . And here's how to do it:
          </Text>

          <View style={styles.step1Row}>
            <Text style={styles.stepText}>
              1. Go to{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(aiStudioUrl)}>
                Google AI Studio
              </Text>
            </Text>
            <Image source={aiKeyGetImg} style={styles.step1Img} resizeMode="contain" />
          </View>

          <Text style={styles.stepText}>
            2. Click on Create API Key in the top-left corner{' '}
            <Text style={styles.link} onPress={() => setShowScreenshot(true)}>
              (see screenshot)
            </Text>
          </Text>

          <Text style={styles.stepText}>3. Just use the default project</Text>

          <Text style={styles.stepText}>4. Paste your API key here</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={handleChangeText}
            placeholder="AIza..."
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {showInvalid && <Text style={styles.warning}>Invalid key, try again</Text>}

          <Pressable
            style={[styles.saveBtn, !valid && styles.saveBtnDisabled]}
            disabled={!valid}
            onPress={handleSave}
            accessibilityRole="button"
          >
            <Text style={styles.saveBtnText}>SAVE</Text>
          </Pressable>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </ScrollView>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showScreenshot}
        onRequestClose={() => setShowScreenshot(false)}
      >
        <Pressable style={styles.screenshotOverlay} onPress={() => setShowScreenshot(false)}>
          <Image source={aiKeyCreateImg} style={styles.screenshotImg} resizeMode="contain" />
        </Pressable>
      </Modal>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 12,
    backgroundColor: '#1c1d24',
  },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#f3f4f6', marginBottom: 16, textAlign: 'center' },
  text: { fontSize: 14.5, lineHeight: 21, color: '#d0d0d0', marginBottom: 14 },
  link: { color: '#7aa2ff' },
  step1Row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, marginBottom: 4 },
  step1Img: { width: 150, height: 32, borderRadius: 6, backgroundColor: '#111' },
  stepText: { fontSize: 14.5, lineHeight: 20, color: '#d0d0d0', marginBottom: 4 },
  screenshotOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenshotImg: { width: '100%', height: '100%' },
  input: {
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 10,
    padding: 12,
    color: '#f3f4f6',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  warning: { color: '#f87171', fontSize: 13, marginBottom: 10 },
  saveBtn: {
    backgroundColor: '#c084fc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#1a0f27', fontSize: 15, fontWeight: '700' },
  closeBtn: { paddingVertical: 10, alignItems: 'center' },
  closeBtnText: { color: '#9ca3af', fontSize: 14 },
})
