// Filename: sheet.js
// version 0.2.1

// Sheet module to access and retrieve data from the Foodlog sheet on Google Drive.

import { isPrototype } from '../config/config.js'
import * as sheetMock from '../../prototype/sheet.mock.js'

// Real Drive/Sheets API creation isn't built yet — same NotImplementedYet
// placeholder convention as auth.js/starter.js's driveSafeUrl.
const REAL_SHEET_LINK = 'https://NotImplementedYet.github.com/drive-sheet.html'

function _realExistsOrCreate() {
  return { id: null, name: 'Foodlog', link: REAL_SHEET_LINK, header: [], rows: [] }
}

export function existsOrCreate() {
  return isPrototype() ? sheetMock.existsOrCreate() : _realExistsOrCreate()
}

export function log(mealData) {
  if (isPrototype()) return sheetMock.log(mealData)
  throw new Error('Not implemented yet')
}

export function link() {
  return existsOrCreate().link
}
