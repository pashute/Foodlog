// Filename: starter.dlg.tsx  Version 0.2.1

// React component only — logic lives in starter.ts (see that file for why
// they're split). Mount this once; auth.ts drives it via starter.ts's
// popup()/finish().

import { useEffect, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { config } from '../config/configAccess.ts'
import {
  title,
  messageText1,
  messageText2,
  messageText3,
  readFurtherLabel,
  driveSafeUrl,
  _registerVisibilityHandler,
  finish,
} from './starter.ts'

function _theme() {
  return config().app.theme === 'light' ? 'light' : 'dark'
}

function _styles() {
  const dark = _theme() === 'dark'
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    popupContainer: {
      width: '85%',
      maxWidth: 420,
      borderRadius: 12,
      padding: 24,
      backgroundColor: dark ? '#222' : '#fff',
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 16,
      color: dark ? '#fff' : '#111',
      textAlign: 'center',
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 12,
      color: dark ? '#d0d0d0' : '#333',
      textAlign: 'center',
    },
    link: {
      fontSize: 14,
      color: '#4a9eff',
      marginBottom: 20,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#4a9eff',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
    },
    cancelButton: {
      paddingVertical: 10,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: dark ? '#b0b0b0' : '#666',
      textAlign: 'center',
    },
  })
}

export default function StarterDlg() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    _registerVisibilityHandler(setVisible)
    return () => _registerVisibilityHandler(null)
  }, [])

  const styles = _styles()

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => finish(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{messageText1}</Text>
          <Text style={styles.text}>{messageText2}</Text>
          <Text style={styles.text}>{messageText3}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(driveSafeUrl)}>
            <Text style={styles.link}>{readFurtherLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => finish(true)}>
            <Text style={styles.buttonText}>Continue Login with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => finish(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
