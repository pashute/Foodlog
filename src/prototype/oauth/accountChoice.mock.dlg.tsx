// Filename: accountChoice.mock.dlg.tsx  Version 0.3.0

// React component only — logic lives in accountChoice.mock.ts (see that
// file for why they're split). Mount this once; oauth.mock.ts drives it
// via accountChoice.mock.ts's popup()/cancel()/chooseSelected().

import { useEffect, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { accounts, _registerVisibilityHandler, cancel, chooseSelected } from './accountChoice.mock.ts'

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '85%', maxWidth: 380, borderRadius: 12, padding: 20, backgroundColor: '#222' },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12, textAlign: 'center' },
  account: { paddingVertical: 10, alignItems: 'center' },
  accountText: { color: '#e0e0e0', textAlign: 'center' },
  disabledText: { color: '#666', textAlign: 'center' },
  button: { backgroundColor: '#4a9eff', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  cancelButton: { paddingVertical: 10, alignItems: 'center' },
  cancelButtonText: { color: '#b0b0b0', textAlign: 'center' },
})

export default function AccountChoiceDlg() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    _registerVisibilityHandler(setVisible)
    return () => _registerVisibilityHandler(null)
  }, [])

  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={cancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choose an account</Text>
          {accounts.map((a) => (
            <View key={a.id} style={styles.account}>
              <Text style={a.disabled ? styles.disabledText : styles.accountText}>
                {a.name} ({a.email}){a.selected ? ' ✓' : ''}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.button} onPress={chooseSelected}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={cancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
