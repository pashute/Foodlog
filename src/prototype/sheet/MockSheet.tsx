import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { existsOrCreate } from '../sheet.mock.ts'

export default function MockSheet() {
  const sheet = existsOrCreate()
  const rows = sheet.rows as Array<Record<string, unknown>>

  return (
    <ScrollView contentContainerStyle={styles.container} horizontal>
      <View>
        <Text style={styles.title}>Mock Foodlog Sheet</Text>
        <View style={[styles.row, styles.header]}>
          {sheet.header.map((header) => <Text key={header} style={[styles.cell, styles.headerText]}>{header}</Text>)}
        </View>
        {rows.length === 0 ? (
          <View style={styles.row}><Text style={styles.empty}>No entries yet</Text></View>
        ) : rows.map((row, index) => (
          <View key={index} style={styles.row}>
            {sheet.header.map((header) => <Text key={header} style={styles.cell}>{String(row[header] ?? '')}</Text>)}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#ffffff' },
  title: { color: '#202124', fontSize: 22, fontWeight: '600', marginBottom: 20 },
  row: { flexDirection: 'row', minHeight: 36 },
  header: { backgroundColor: '#f8f9fa' },
  cell: { width: 130, borderWidth: 1, borderColor: '#e0e0e0', color: '#202124', fontSize: 13, padding: 8 },
  headerText: { fontWeight: '600' },
  empty: { width: 910, borderWidth: 1, borderColor: '#e0e0e0', color: '#5f6368', fontSize: 13, padding: 8 },
})