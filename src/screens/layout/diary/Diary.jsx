// Filename: Diary.jsx
// Version: 0.2.0
// Diary screen (screens/layout/diary, was "logger"): log a meal, see the AI
// carb/energy estimate, fix guesses, and save the entry to the Foodlog sheet.

import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native'
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
// items: totals first, then one entry per item with "?" after each guessed
// field (qty, size) so the user can see and correct exactly what's unsure.
function buildFixString(macros, totalCarbs, totalEnergy) {
  const items = macros
    .map((it) => {
      const { qty, sz } = parseDetails(it.details)
      const mark = it.status === 'guess' ? '?' : ''
      return `${qty}${mark} ${sz}${mark} ${it.name} (${it.wgt}g, ${it.crb}g,${it.cal}c)`
    })
    .join(', ')
  return `(${totalCarbs}g, ${totalEnergy}cals), ${items}`
}

export default function Diary() {
  const [minutesAgo, setMinutesAgo] = useState(0)
  const [meal, setMeal] = useState('cucumber yogurt')
  const [items, setItems] = useState([])

  useEffect(() => {
    analyze('cucumber yogurt').then(setItems)
  }, [])

  const now = new Date()
  now.setMinutes(now.getMinutes() - minutesAgo)
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

  const macros = items.map((it) => ({ ...it, ...parseMacros(it.data) }))
  const totalCarbs = macros.reduce((sum, it) => sum + it.crb, 0)
  const totalEnergy = macros.reduce((sum, it) => sum + it.cal, 0)
  const hasGuesses = macros.some((it) => it.status === 'guess')

  const handleSubmit = () => {
    analyze(meal).then(setItems)
  }

  const handleFix = () => {
    setMeal(buildFixString(macros, totalCarbs, totalEnergy))
  }

  const handleSave = () => {
    sheetLog({
      date: now.toLocaleDateString(),
      dow: now.toLocaleDateString([], { weekday: 'short' }),
      time,
      carbs: totalCarbs,
      status: hasGuesses ? 'guess' : 'set',
      meal,
    })
    setMeal('')
    setItems([])
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Pressable
          style={styles.stepperBtn}
          disabled={minutesAgo === 0}
          onPress={() => setMinutesAgo((m) => Math.max(0, m - 1))}
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
          onPress={() => setMinutesAgo((m) => m + 1)}
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
          placeholder="Enter your meal"
        />
        <Pressable
          style={styles.submitBtn}
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

        <ScrollView style={styles.foodScroll}>
          {macros.map((it) => (
            <View key={it.item} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {it.name}
                {it.status === 'guess' ? '?' : ''} ({it.wgt} g)
              </Text>
              <Text style={styles.itemMacro}>
                carbs {it.crb} g &middot; {it.cal} kcal
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.btnPair}>
          <Pressable style={styles.btn} onPress={handleFix}>
            <Text style={styles.btnText}>Fix</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
            <Text style={styles.btnText}>{hasGuesses ? 'Save Anyway' : 'Save'}</Text>
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
  submitBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  foodScroll: { maxHeight: 190, marginBottom: 14 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#2e303a',
  },
  itemName: { color: '#f3f4f6', fontSize: 14.5 },
  itemMacro: { color: '#9ca3af', fontSize: 14.5 },
  btnPair: { flexDirection: 'row', gap: 10 },
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
  btnText: { color: '#f3f4f6', fontSize: 15 },
  foodLogLink: { color: '#7aa2ff', fontSize: 14, textAlign: 'center', marginTop: 16 },
})
