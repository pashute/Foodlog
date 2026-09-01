// Filename: contactPopup.tsx
// Version: 0.2.5
// Contact dialog (screens/layout/settings): "Contact me" popup for user feedback

import { useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet, Linking } from 'react-native'
import { txt, commonTexts } from '../../../infrastructure/texts.ts'

export default function ContactPopup({ visible, onClose = () => {} }) {
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSend = () => {
    if (!message.trim()) {
      alert(txt.contact.msg.alertNoText)
      return
    }

    const subject = 'Foodlog Feedback'
    const body = encodeURIComponent(message)
    const mailtoUrl = `mailto:${commonTexts.email}?subject=${encodeURIComponent(subject)}&body=${body}`

    Linking.openURL(mailtoUrl).catch(() => {
      alert(`Could not open email client. Please email me at: ${commonTexts.email}`)
    })

    setShowSuccess(true)
    setMessage('')
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 1500)
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>{txt.contact.lbl.title}</Text>
          <Text style={styles.subtitle}>{txt.contact.msg.subtitle}</Text>

          {showSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{txt.contact.msg.successMsg}</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder={txt.contact.msg.placeholder}
                placeholderTextColor="#6b7280"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <Pressable
                style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
                disabled={!message.trim()}
                onPress={handleSend}
              >
                <Text style={styles.sendBtnText}>{txt.contact.btn.send}</Text>
              </Pressable>
            </>
          )}

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{txt.contact.btn.close}</Text>
          </Pressable>
        </ScrollView>
      </View>
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
  title: { fontSize: 20, fontWeight: '700', color: '#f3f4f6', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 10,
    padding: 12,
    color: '#f3f4f6',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#26272f',
  },
  successContainer: { paddingVertical: 40, alignItems: 'center' },
  successText: { fontSize: 16, color: '#4ade80', fontWeight: '600' },
  sendBtn: {
    backgroundColor: '#c084fc',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#1a0f27', fontSize: 15, fontWeight: '700' },
  closeBtn: { paddingVertical: 10, alignItems: 'center' },
  closeBtnText: { color: '#9ca3af', fontSize: 14 },
})
