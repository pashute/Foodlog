// Filename: config.dlg.tsx
// Version: 0.2.1

import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { config } from '../../../infrastructure/config/configAccess'
import { restoreDefaults } from '../../../infrastructure/config/configIo'

export default function ConfigDlg({ visible, onSave, onClose }) {
  const [theme, setTheme] = useState('dark')
  const [sheetName, setSheetName] = useState('Foodlog')
  const [sheetFolder, setSheetFolder] = useState('Foodlogs')

  useEffect(() => {
    if (!visible) return
    const current = config()
    setTheme(current.app.theme)
    setSheetName(current.sheets.sheetName)
    setSheetFolder(current.sheets.sheetFolder)
  }, [visible])

  const valid = (theme === 'light' || theme === 'dark') && sheetName.trim() && sheetFolder.trim()

  const handleRestoreDefaults = () => {
    const defaults = restoreDefaults()
    setTheme(defaults.app.theme)
    setSheetName(defaults.sheets.sheetName)
    setSheetFolder(defaults.sheets.sheetFolder)
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Configuration</Text>
          <Pressable onPress={handleRestoreDefaults} style={styles.restoreButton}><Text style={styles.buttonText}>Restore defaults</Text></Pressable>
          <Text style={styles.sectionTitle}>UI</Text>
          <Text style={styles.label}>Theme</Text>
          <TextInput value={theme} onChangeText={setTheme} style={styles.input} autoCapitalize="none" />
          <Text style={styles.sectionTitle}>Sheet</Text>
          <Text style={styles.label}>Sheet folder</Text>
          <TextInput value={sheetFolder} onChangeText={setSheetFolder} style={styles.input} />
          <Text style={styles.label}>Sheet name</Text>
          <TextInput value={sheetName} onChangeText={setSheetName} style={styles.input} />
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.button}><Text style={styles.buttonText}>Cancel</Text></Pressable>
            <Pressable disabled={!valid} onPress={() => onSave({ app: { theme }, sheets: { sheetName, sheetFolder } })} style={[styles.button, !valid && styles.disabled]}><Text style={styles.buttonText}>Save</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  dialog: { backgroundColor: '#1c1d24', borderRadius: 8, padding: 16 },
  title: { color: '#f3f4f6', fontSize: 18, marginBottom: 12 },
  sectionTitle: { color: '#f3f4f6', fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 4 },
  label: { color: '#9ca3af', fontSize: 13, marginTop: 8 },
  input: { backgroundColor: '#26272f', color: '#f3f4f6', borderWidth: 1, borderColor: '#2e303a', borderRadius: 6, padding: 9, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  restoreButton: { alignSelf: 'flex-start', backgroundColor: '#26272f', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 9 },
  button: { backgroundColor: '#26272f', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 9 },
  buttonText: { color: '#f3f4f6' },
  disabled: { opacity: 0.5 },
})
