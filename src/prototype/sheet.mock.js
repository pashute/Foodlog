// Filename sheet.mock.js  Version 0.1.0

// Mock Foodlog sheet (prototype stage). In-memory spreadsheet object.

const HEADER = ['date', 'dow', 'time', 'carbs', 'status', 'meal']

let sheet = null

export function existsOrCreate() {
  if (sheet) {
    return sheet
  }
  sheet = {
    id: 'abcd12345',
    name: 'Foodlog',
    link: 'http://localhost:3000/Foodlog.mock.html',
    header: HEADER,
    rows: [],
  }
  return sheet
}

export function log(mealData) {
  if (!sheet) {
    existsOrCreate()
  }
  sheet.rows.unshift(mealData)
  return sheet
}

export function idToLink(id) {
  return `http://localhost:3000/Foodlog.mock.html?id=${id}`
}

export function reset() {
  sheet = null
}
