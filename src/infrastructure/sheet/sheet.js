// Filename: sheet.js
// version 0.2.0

// Sheet module to access and retrieve data from the Foodlog sheet on Google Drive.

import { _ensurePrototype } from '../config/config.js'
import * as sheetMock from '../../prototype/sheet.mock.js'

export function existsOrCreate() {
  _ensurePrototype()
  return sheetMock.existsOrCreate()
}

export function log(mealData) {
  _ensurePrototype()
  return sheetMock.log(mealData)
}

export function link() {
  _ensurePrototype()
  return sheetMock.existsOrCreate().link
}
