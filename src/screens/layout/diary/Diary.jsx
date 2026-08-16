// Filename: Diary.jsx
// Version: 0.3.0
// Diary screen (screens/layout/diary, was "logger"): log a meal, see the AI
// carb/energy estimate, tick/untick items to accept or flag as a guess,
// fix guesses, and save the entry to the Foodlog sheet.
// See dev/features/screens/interaction/diary/diaryEntry.feature.

import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Modal } from 'react-native'
import { analyze } from '../../../infrastructure/ai/ai.js'
import { log as sheetLog } from '../../../infrastructure/sheet/sheet.js'

function parseMacros(dataStr) {
  const crb = Number(dataStr.match(/crb:(\d+)/)?.[1] ?? 0)
  const cal = Number(dataStr.match(/cal:(\d+)/)?.[1] ?? 0)
  const wgt = Number(dataStr.match(/wgt:(\d+)/)?.[1] ?? 0)
  return { crb, cal, wgt }
}

function parseDetails(detailsStr) {
  const qty = detailsStr.match(/qty:([^,]+)/)?.[1]?.trim() ?? ''
  const sz = detailsStr.match(/sz:([^,]+)/)?.[1]?.trim() ?? ''
  return { qty, sz }
}

// Reconstructs the AI's telegraphic, re-editable string from the current
// items: totals first, then one entry per item with "?" after each unaccepted
// (still-guess) field (qty, size) so the user can see and correct exactly
// what's unsure.
function buildFixString(macros, totalCarbs, totalEnergy) {
  const items = macros
    .map((it) => {
      const { qty, sz } = parseDetails(it.details)
      const mark = it.guess ? '?' : ''
      return `${qty}${mark} ${sz}${mark} ${it.name} (${it.wgt}g, ${it.crb}g,${it.cal}c)`
    })
    .join(', ')
  return `(${totalCarbs}g, ${totalEnergy}cals), ${items}`
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function Diary() {
  const [minutesAgo, setMinutesAgo] = useState(0)
  const [entryTimestamp, setEntryTimestamp] = useState(null)
  const [meal, setMeal] = useState('')
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [savedVisible, setSavedVisible] = useState(false)

  const displayTime = entryTimestamp ?? new Date(Date.now() - minutesAgo * 60000)
  const time = formatTime(displayTime)

  const macros = items.map((it) => ({ ...it, ...parseMacros(it.data), guess: !it.accepted }))
  const totalCarbs = macros.reduce((sum, it) => sum + it.crb, 0)
  const totalEnergy = macros.reduce((sum, it) => sum + it.cal, 0)
  const hasGuesses = macros.some((it) => it.guess)
  const hasItems = items.length > 0

  const bumpMinutesAgo = (delta) => {
    setMinutesAgo((m) => {
      const next = Math.max(0, m + delta)
      if (entryTimestamp) setEntryTimestamp(new Date(Date.now() - next * 60000))
      return next
    })
  }

  const resetForm = () => {
    setMeal('')
    setItems([])
    setError(null)
    setEntryTimestamp(null)
    setMinutesAgo(0)
  }

  const handleSubmit = async () => {
    if (!meal.trim()) return
    try {
      const result = await analyze(meal)
      setItems(result.map((it) => ({ ...it, accepted: it.status === 'set' })))
      setError(null)
      setEntryTimestamp((ts) => ts ?? new Date(Date.now() - minutesAgo * 60000))
    } catch (e) {
      setError(e.message)
      setItems([])
    }
  }

  const toggleAccept = (id) => {
    setItems((prev) => prev.map((it) => (it.item === id ? { ...it, accepted: !it.accepted } : it)))
  }

  const handleAcceptAll = () => {
    setItems((prev) => prev.map((it) => ({ ...it, accepted: true })))
  }

  const handleFix = () => {
    const fixStr = buildFixString(macros, totalCarbs, totalEnergy)
    if (entryTimestamp) setMinutesAgo(Math.round((Date.now() - entryTimestamp) / 60000))
    setItems([])
    setError(null)
    setMeal(fixStr)
  }

  const handleSave = () => {
    sheetLog({
      date: entryTimestamp.toLocaleDateString(),
      dow: entryTimestamp.toLocaleDateString([], { weekday: 'short' }),
      time: formatTime(entryTimestamp),
      carbs: totalCarbs,
      status: hasGuesses ? 'guess' : 'set',
      meal,
    })
    setSavedVisible(true)
    resetForm()
  }

  const handleDiscard = () => {
    resetForm()
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Pressable
          style={styles.stepperBtn}
          disabled={minutesAgo === 0}
          onPress={() => bumpMinutesAgo(-1)}
          accessibilityRole="button"
          aria-label="minus minute"
        >
          <Text style={styles.stepperText}>-</Text>
        </Pressable>
        <View style={styles.stepperVal}>
          <Text style={styles.stepperValText}>{minutesAgo}</Text>
        </View>
        <Pressable
          style={styles.stepperBtn}
          onPress={() => bumpMinutesAgo(1)}
          accessibilityRole="button"
          aria-label="plus minute"
        >
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
        <Text style={styles.timeHint}>minutes ago{minutesAgo === 0 ? ' (now)' : ''}</Text>
        <Text style={styles.timeVal}>{time}</Text>
      </View>

      <View style={styles.estimateRow}>
        <Text style={styles.estimateText}>
          Carbs <Text style={styles.num}>{totalCarbs} g</Text>
        </Text>
        <Text style={styles.estimateText}>
          Energy <Text style={styles.num}>{totalEnergy} kcal</Text>
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.mealInput}
          multiline
          value={meal}
          onChangeText={setMeal}
          placeholder="e.g. cucumber yogurt"
        />
        <Pressable
          style={[styles.submitBtn, !meal.trim() && styles.submitBtnDisabled]}
          disabled={!meal.trim()}
          onPress={handleSubmit}
          accessibilityRole="button"
          aria-label="submit meal"
        >
          <Text style={styles.submitText}>▶</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.aiTitle}>AI estimate</Text>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            carbs {totalCarbs} g &middot; {totalEnergy} kcal
          </Text>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView style={styles.foodScroll}>
            {macros.map((it) => (
              <View key={it.item} style={styles.itemRow}>
                <Pressable
                  style={styles.checkbox}
                  onPress={() => toggleAccept(it.item)}
                  accessibilityRole="checkbox"
                  aria-checked={it.accepted}
                  aria-label={`accept ${it.name}`}
                >
                  <Text style={styles.checkboxGlyph}>{it.accepted ? '☑' : '☐'}</Text>
                </Pressable>
                <Text style={styles.itemName}>
                  {it.name}
                  {it.guess ? '?' : ''} ({it.wgt} g)
                </Text>
                <Text style={styles.itemMacro}>
                  carbs {it.crb} g &middot; {it.cal} kcal
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.btnRow}>
          <Pressable style={styles.btn} disabled={!hasItems} onPress={handleFix} accessibilityRole="button">
            <Text style={styles.btnText}>Fix</Text>
          </Pressable>
          <Pressable style={styles.btn} disabled={!hasItems} onPress={handleAcceptAll} accessibilityRole="button">
            <Text style={styles.btnText}>Accept All</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} disabled={!hasItems} onPress={handleSave} accessibilityRole="button">
            <Text style={styles.btnText}>Save</Text>
          </Pressable>
          <Pressable style={styles.btn} disabled={!hasItems} onPress={handleDiscard} accessibilityRole="button">
            <Text style={styles.btnText}>Discard</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.foodLogLink}>Food log &#8599;</Text>

      <Modal visible={savedVisible} transparent animationType="fade">
        <View style={styles.popupBackdrop}>
          <View style={styles.popupCard}>
            <Text style={styles.popupText}>Record recorded ok.</Text>
            <Pressable style={styles.popupBtn} onPress={() => setSavedVisible(false)}>
              <Text style={styles.btnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#26272f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { color: '#f3f4f6', fontSize: 18 },
  stepperVal: {
    width: 56,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#26272f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValText: { color: '#f3f4f6', fontSize: 16, fontWeight: '600' },
  timeHint: { color: '#9ca3af', fontSize: 13 },
  timeVal: { color: '#f3f4f6', fontSize: 15, fontWeight: '600', marginLeft: 'auto' },
  estimateRow: { flexDirection: 'row', gap: 18, marginBottom: 16 },
  estimateText: { color: '#9ca3af', fontSize: 14 },
  num: { color: '#f3f4f6', fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 18 },
  mealInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 14,
    padding: 14,
    color: '#f3f4f6',
    fontSize: 15,
    minHeight: 50,
  },
  submitBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#fff', fontSize: 18 },
  card: { borderWidth: 1, borderColor: '#2e303a', backgroundColor: '#1c1d24', borderRadius: 16, padding: 16 },
  aiTitle: { color: '#f3f4f6', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2e303a',
  },
  totalLabel: { color: '#f3f4f6', fontWeight: '700' },
  totalValue: { color: '#f3f4f6', fontWeight: '700', fontSize: 16 },
  errorText: { color: '#f87171', fontSize: 14.5, marginBottom: 14 },
  foodScroll: { maxHeight: 190, marginBottom: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2e303a',
  },
  checkbox: { paddingRight: 8 },
  checkboxGlyph: { color: '#9ca3af', fontSize: 16 },
  itemName: { color: '#f3f4f6', fontSize: 14.5, flex: 1 },
  itemMacro: { color: '#9ca3af', fontSize: 14.5 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e303a',
    backgroundColor: '#26272f',
  },
  btnPrimary: { fontWeight: '600' },
  btnText: { color: '#f3f4f6', fontSize: 14 },
  foodLogLink: { color: '#7aa2ff', fontSize: 14, textAlign: 'center', marginTop: 16 },
  popupBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  popupCard: {
    backgroundColor: '#1c1d24',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#2e303a',
  },
  popupText: { color: '#f3f4f6', fontSize: 15 },
  popupBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#26272f',
  },
})
