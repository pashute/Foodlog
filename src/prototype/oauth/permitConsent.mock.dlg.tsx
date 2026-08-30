// Filename: permitConsent.mock.dlg.tsx  Version 0.2.1

// React component only — logic lives in permitConsent.mock.ts (see that
// file for why they're split).

import { useEffect, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import {
  permissionText,
  warnings,
  footer,
  _registerVisibilityHandler,
  deny,
  allow,
} from './permitConsent.mock.ts'

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '85%', maxWidth: 420, borderRadius: 12, padding: 20, backgroundColor: '#222' },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, textAlign: 'center' },
  permission: { color: '#e0e0e0', marginBottom: 12, textAlign: 'center' },
  warning: { color: '#b0b0b0', fontSize: 12, marginBottom: 6, textAlign: 'center' },
  footer: { color: '#888', fontSize: 11, marginTop: 8, marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#4a9eff', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  denyButton: { paddingVertical: 10, alignItems: 'center' },
  denyButtonText: { color: '#b0b0b0', textAlign: 'center' },
})

export default function PermitConsentDlg() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    _registerVisibilityHandler(setVisible)
    return () => _registerVisibilityHandler(null)
  }, [])

  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={deny}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Foodlog wants to access your Google Account</Text>
          <Text style={styles.permission}>{permissionText}</Text>
          {warnings.map((w) => (
            <Text key={w} style={styles.warning}>
              {w}
            </Text>
          ))}
          <Text style={styles.footer}>{footer}</Text>
          <TouchableOpacity style={styles.button} onPress={allow}>
            <Text style={styles.buttonText}>Allow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.denyButton} onPress={deny}>
            <Text style={styles.denyButtonText}>Deny</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
