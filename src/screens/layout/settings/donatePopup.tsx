// Filename: donatePopup.tsx
// Version: 0.2.4
// Donation dialog (screens/layout/settings): "Enjoyed?" support popup with donation tiers

import { useState } from 'react'
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, TextInput, Linking } from 'react-native'
import { txt } from '../../../infrastructure/texts.ts'

export default function DonatePopup({ visible, onClose = () => {}, onContactPress = () => {}, onOpenContact = () => {} }) {
  const [selectedTier, setSelectedTier] = useState(null)
  const [customAmount, setCustomAmount] = useState('10018')

  const handleDonate = (amount, label) => {
    setSelectedTier(label)
    setTimeout(() => {
      alert(`Thank you for your ${label}!\n\nRedirecting to payment...`)
      onClose()
      setSelectedTier(null)
    }, 300)
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{txt.donate.lbl.title}</Text>
            <Text style={styles.githubIcon}>🐙</Text>
          </View>
          <Text style={styles.subtitle}>{txt.donate.msg.subtitle}</Text>

          <View style={styles.tiersContainer}>
            <Pressable
              style={[styles.tierCard, selectedTier === '$1' && styles.tierCardSelected]}
              onPress={() => handleDonate(1, 'Donate $1')}
            >
              <Text style={styles.tierAmount}>{txt.donate.btn.donate1}</Text>
              <Text style={styles.tierLabel}>{txt.donate.lbl.tier1}</Text>
              <Text style={styles.tierNote}>{txt.donate.msg.tier1Note}</Text>
            </Pressable>

            <Pressable
              style={[styles.tierCard, selectedTier === '$18' && styles.tierCardSelected]}
              onPress={() => handleDonate(18, 'Say Hi $18')}
            >
              <Text style={styles.tierAmount}>{txt.donate.btn.donate18}</Text>
              <Text style={styles.tierLabel}>{txt.donate.lbl.tier2}</Text>
            </Pressable>

            <View style={[styles.tierCard, selectedTier === 'custom' && styles.tierCardSelected]}>
              <Text style={styles.tierLabel}>{txt.donate.lbl.tier3}</Text>
              <View style={styles.customInputRow}>
                <Text style={styles.customLabel}>$</Text>
                <TextInput
                  style={styles.customInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                  defaultValue={txt.donate.msg.customDefault}
                />
                <Text style={styles.customEmoji}>😊</Text>
              </View>
              <Pressable onPress={() => handleDonate(parseInt(customAmount) || 0, `Custom $${customAmount}`)}>
                <Text style={styles.donateCustomBtn}>Donate</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{txt.donate.msg.footerText}</Text>
            <Pressable onPress={() => {
              onClose()
              onOpenContact()
            }}>
              <Text style={styles.contactLink} onPress={() => Linking.openURL(txt.donate.link.contactHref())}>
                {txt.donate.link.contactHref ? 'Contact me' : 'Contact'}
              </Text>
            </Pressable>
          </View>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{txt.donate.btn.close}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700', color: '#f3f4f6', textAlign: 'center', flex: 1 },
  githubIcon: { fontSize: 20, marginLeft: 8 },
  subtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 24, textAlign: 'center' },
  tiersContainer: { gap: 12, marginBottom: 20 },
  tierCard: {
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#26272f',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tierCardSelected: {
    borderColor: '#c084fc',
    backgroundColor: '#2e1b48',
  },
  tierAmount: { fontSize: 18, fontWeight: '700', color: '#c084fc', marginBottom: 4 },
  tierLabel: { fontSize: 14, color: '#d0d0d0', fontWeight: '600' },
  tierNote: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  customInputRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 6 },
  customLabel: { fontSize: 16, color: '#f3f4f6', fontWeight: '600' },
  customInput: { borderWidth: 1, borderColor: '#2e303a', borderRadius: 6, backgroundColor: '#1c1d24', color: '#f3f4f6', fontSize: 16, paddingHorizontal: 8, paddingVertical: 4, width: 80 },
  customEmoji: { fontSize: 18 },
  donateCustomBtn: { color: '#c084fc', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  footer: { borderTopWidth: 1, borderTopColor: '#2e303a', paddingTop: 12, marginBottom: 12, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9ca3af', marginBottom: 6, textAlign: 'center' },
  contactLink: { color: '#7aa2ff', fontSize: 14, fontWeight: '600' },
  closeBtn: { paddingVertical: 10, alignItems: 'center' },
  closeBtnText: { color: '#9ca3af', fontSize: 14 },
})
