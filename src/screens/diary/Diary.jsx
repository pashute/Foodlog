// Filename: Diary.jsx
// Version: 0.3.0
// Diary screen (screens/diary, was screens/layout/diary — restructured Aug
// 17): log a meal, see the AI carb/energy estimate, tick/untick items to
// accept or flag as a guess, fix guesses, and save the entry to the Foodlog
// sheet. All non-React logic lives in diaryEntry.js — this file is
// presentational only.
// See dev/features/screens/interaction/diary/diaryEntry.feature.
// Row layout + button set reworked per the Aug 18 20:50 developer-review
// batch: two-column rows (checkbox+qty+unit, type below / name+values
// beside), rows never show "?" (the accept checkbox is the only guess
// indicator), Accept All -> Accept, Discard -> Revert (restores the
// original typed text rather than emptying the form), Save's confirmation
// moved inline into the rows area instead of a popup.
// Aug 19: accept checkbox now starts from an original-record comparison
// (diaryEntry.js) instead of the AI's status field; meal textbox locks
// after submit and unlocks on Fix/Accept/Save/Revert; editing the meal
// text clears the "Meal saved" message.

import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native'
import {
  formatTime,
  nforceQtyDigits,
  nforceMaxlen,
  QTY_MAX_LEN,
  UNIT_MAX_LEN,
  TYPE_MAX_LEN,
  totals,
  withAccepted,
  submitMeal,
  buildFixString,
  recalcForQty,
  recomputeGuessFlags,
  saveToSheet,
} from './diaryEntry.js'

export default function Diary() {
  const [minutesAgo, setMinutesAgo] = useState(0)
  const [entryTimestamp, setEntryTimestamp] = useState(null)
  const [meal, setMeal] = useState('')
  const [originalMealText, setOriginalMealText] = useState('')
  const [records, setRecords] = useState([])
  const [error, setError] = useState(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [mealEditable, setMealEditable] = useState(true)

  const displayTime = entryTimestamp ?? new Date(Date.now() - minutesAgo * 60000)
  const time = formatTime(displayTime)

  const { carbs: totalCarbs, energy: totalEnergy } = totals(records)
  const hasGuesses = records.some((r) => !r.accepted)
  const hasItems = records.length > 0

  const bumpMinutesAgo = (delta) => {
    setMinutesAgo((m) => {
      const next = Math.max(0, m + delta)
      if (entryTimestamp) setEntryTimestamp(new Date(Date.now() - next * 60000))
      return next
    })
  }

  const resetForm = () => {
    setMeal('')
    setRecords([])
    setError(null)
    setEntryTimestamp(null)
    setMinutesAgo(0)
    setOriginalMealText('')
    setMealEditable(true)
  }

  const changeMeal = (value) => {
    setMeal(value)
    setSavedMessage('')
  }

  const handleSubmit = async () => {
    if (!meal.trim()) return
    setSavedMessage('')
    try {
      setRecords(await submitMeal(meal))
      setError(null)
      setOriginalMealText((prev) => prev || meal)
      setEntryTimestamp((ts) => ts ?? new Date(Date.now() - minutesAgo * 60000))
      setMealEditable(false)
    } catch (e) {
      setError(e.message)
      setRecords([])
    }
  }

  const toggleAccept = (id) => {
    setRecords((prev) => prev.map((r) => (r.item === id ? withAccepted(r, !r.accepted) : r)))
  }

  const updateQty = (id, value) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.item !== id) return r
        const qty = nforceQtyDigits(value)
        return recomputeGuessFlags({ ...r, qty, ...recalcForQty(r, qty) })
      })
    )
  }

  const updateUnit = (id, value) => {
    setRecords((prev) =>
      prev.map((r) => (r.item === id ? recomputeGuessFlags({ ...r, unit: nforceMaxlen(value, UNIT_MAX_LEN) }) : r))
    )
  }

  const updateType = (id, value) => {
    setRecords((prev) =>
      prev.map((r) => (r.item === id ? recomputeGuessFlags({ ...r, type: nforceMaxlen(value, TYPE_MAX_LEN) }) : r))
    )
  }

  const handleAccept = () => {
    setRecords((prev) => prev.map((r) => withAccepted(r, true)))
    setMealEditable(true)
  }

  const handleFix = () => {
    const fixStr = buildFixString(records, totalCarbs, totalEnergy)
    if (entryTimestamp) setMinutesAgo(Math.round((Date.now() - entryTimestamp) / 60000))
    setRecords([])
    setError(null)
    setMeal(fixStr)
    setMealEditable(true)
  }

  const handleRevert = () => {
    setMeal(originalMealText)
    setRecords([])
    setError(null)
    setOriginalMealText('')
    setMealEditable(true)
  }

  const handleSave = async () => {
    const finalMealText = buildFixString(records, totalCarbs, totalEnergy)
    await saveToSheet({ entryTimestamp, totalCarbs, hasGuesses, mealText: finalMealText, records })
    setSavedMessage('Meal saved')
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
          style={[styles.mealInput, !mealEditable && styles.mealInputDisabled]}
          multiline
          value={meal}
          onChangeText={changeMeal}
          editable={mealEditable}
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
          <Text style={styles.totalLabel}>Totals:</Text>
          <Text style={styles.totalValue}>
            carbs {totalCarbs} g &middot; {totalEnergy} kcal
          </Text>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : savedMessage ? (
          <Text style={styles.savedText}>{savedMessage}</Text>
        ) : (
          <>
            <Text style={styles.acceptHeaderText}>Accept</Text>
            <ScrollView style={styles.foodScroll}>
              {records.map((r) => (
                <View key={r.item} style={styles.itemRow}>
                  <View style={styles.itemLeftCol}>
                    <View style={styles.itemLeftTop}>
                      <Pressable
                        style={styles.checkbox}
                        onPress={() => toggleAccept(r.item)}
                        accessibilityRole="checkbox"
                        aria-checked={r.accepted}
                        aria-label={`accept ${r.name}`}
                      >
                        <Text style={styles.checkboxGlyph}>{r.accepted ? '☑' : '☐'}</Text>
                      </Pressable>
                      <TextInput
                        style={styles.qtyInput}
                        value={r.qty}
                        onChangeText={(v) => updateQty(r.item, v)}
                        keyboardType="numeric"
                        maxLength={QTY_MAX_LEN}
                        aria-label={`${r.name} quantity`}
                      />
                      <TextInput
                        style={styles.unitInput}
                        value={r.unit}
                        onChangeText={(v) => updateUnit(r.item, v)}
                        maxLength={UNIT_MAX_LEN}
                        aria-label={`${r.name} unit`}
                      />
                    </View>
                    <TextInput
                      style={styles.typeInput}
                      value={r.type}
                      onChangeText={(v) => updateType(r.item, v)}
                      maxLength={TYPE_MAX_LEN}
                      placeholder="details"
                      aria-label={`${r.name} type`}
                    />
                  </View>
                  <View style={styles.itemRightCol}>
                    <Text style={styles.itemName}>
                      {r.name} ({r.wgt} g)
                    </Text>
                    <Text style={styles.itemMacro}>
                      carbs {r.crb} g &middot; {r.cal} kcal
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.btnRow}>
          <Pressable style={styles.btn} disabled={!hasItems} onPress={handleFix} accessibilityRole="button">
            <Text style={styles.btnText}>Fix</Text>
          </Pressable>
          <Pressable style={styles.btn} disabled={!hasItems} onPress={handleAccept} accessibilityRole="button">
            <Text style={styles.btnText}>Accept</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} disabled={!hasItems} onPress={handleSave} accessibilityRole="button">
            <Text style={styles.btnText}>Save</Text>
          </Pressable>
          <Pressable style={styles.btn} disabled={!hasItems} onPress={handleRevert} accessibilityRole="button">
            <Text style={styles.btnText}>Revert</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.foodLogLink}>Food log &#8599;</Text>
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
  mealInputDisabled: { opacity: 0.55 },
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
  savedText: { color: '#22c55e', fontSize: 14.5, marginBottom: 14 },
  acceptHeaderText: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'left',
    width: 108,
    marginBottom: 4,
  },
  foodScroll: { maxHeight: 210, marginBottom: 14 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2e303a',
  },
  itemLeftCol: { width: 108 },
  itemLeftTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemRightCol: { flex: 1, marginLeft: 8 },
  checkbox: { paddingRight: 8 },
  checkboxGlyph: { color: '#9ca3af', fontSize: 16 },
  qtyInput: {
    width: 26,
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 6,
    color: '#f3f4f6',
    fontSize: 13,
    textAlign: 'center',
    marginRight: 4,
    paddingVertical: 2,
  },
  unitInput: {
    width: 34,
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 6,
    color: '#f3f4f6',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 2,
  },
  typeInput: {
    width: 96,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 6,
    color: '#f3f4f6',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 2,
  },
  itemName: { color: '#f3f4f6', fontSize: 14.5 },
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
})
