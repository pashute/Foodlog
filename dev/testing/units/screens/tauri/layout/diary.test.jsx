// Filename: diary.test.jsx
// Version: 0.3.0
// Short, readable tests following the diaryEntry sequence: 5.0 empty/placeholder
// -> 5.1 unrecognized text errors -> 5.2 canned text analyzes, then each button.
// Canned mock input/output comes from src/prototype/ai.mock.js (cannedAnalysis).

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Diary from '../../../../../../src/screens/layout/diary/Diary.jsx'
import { reset as resetSheet } from '../../../../../../src/prototype/sheet.mock.js'

const MEAL = 'cucumber yogurt'

beforeEach(() => {
  resetSheet()
})

async function submit(text) {
  fireEvent.change(screen.getByPlaceholderText('e.g. cucumber yogurt'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: /submit meal/i }))
  await waitFor(() => {})
}

test('5.0: starts empty with a placeholder, submit disabled until text entered', () => {
  render(<Diary />)
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveDisplayValue('')
  expect(screen.getByRole('button', { name: /submit meal/i })).toBeDisabled()

  fireEvent.change(screen.getByPlaceholderText('e.g. cucumber yogurt'), { target: { value: 'x' } })
  expect(screen.getByRole('button', { name: /submit meal/i })).not.toBeDisabled()
})

test('5.1: unrecognized text shows the AI error instead of a food list', async () => {
  render(<Diary />)
  await submit('not a canned meal')
  await screen.findByText('AI error occured. Please contact support@foodlog.com')
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Fix' })).toBeDisabled()
})

test('5.2: canned text analyzes into a guess list and enables the buttons', async () => {
  render(<Diary />)
  await submit(MEAL)

  await screen.findByText('cucumber? (200 g)')
  expect(screen.getByText('yogurt? (170 g)')).toBeInTheDocument()
  expect(screen.getByText('carbs 14 g · 138 kcal')).toBeInTheDocument()
  for (const label of ['Fix', 'Accept All', 'Save', 'Discard']) {
    expect(screen.getByRole('button', { name: label })).not.toBeDisabled()
  }
})

test('checkboxes: guesses start unticked, ticking accepts and removes the "?"', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')

  const cucumberBox = screen.getByRole('checkbox', { name: /accept cucumber/i })
  expect(cucumberBox).not.toBeChecked()

  fireEvent.click(cucumberBox)
  expect(cucumberBox).toBeChecked()
  expect(screen.getByText('cucumber (200 g)')).toBeInTheDocument()
})

test('unticking an already-accepted item marks it a guess again', async () => {
  render(<Diary />)
  await submit('(14g, 138cals), 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g,110c)')
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByRole('checkbox', { name: /accept cucumber/i }))
  expect(screen.getByText('cucumber? (200 g)')).toBeInTheDocument()
})

test('Accept All ticks every checkbox and clears every "?"', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')

  fireEvent.click(screen.getByText('Accept All'))
  expect(screen.getByText('cucumber (200 g)')).toBeInTheDocument()
  expect(screen.getByText('yogurt (170 g)')).toBeInTheDocument()
})

test('Fix rebuilds the telegraphic string, clears the list, and disables the buttons', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')

  fireEvent.click(screen.getByRole('button', { name: 'Fix' }))
  expect(screen.getByDisplayValue('(14g, 138cals), 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g,110c)')).toBeInTheDocument()
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Fix' })).toBeDisabled()
})

test('Fix keeps the displayed hour pinned to the original submit time', async () => {
  const base = new Date(2026, 0, 1, 10, 0, 0).getTime()
  const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(base)

  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')
  const timeShown = screen.getByText(/^\d{2}:\d{2}$/).textContent

  nowSpy.mockReturnValue(base + 3 * 60000) // 3 minutes pass in real time
  fireEvent.click(screen.getByText('Fix'))
  expect(screen.getByText(timeShown)).toBeInTheDocument() // hour is still pinned

  nowSpy.mockRestore()
})

test('resubmitting the fixed string clears the guesses', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')
  fireEvent.click(screen.getByText('Fix'))
  fireEvent.click(screen.getByRole('button', { name: /submit meal/i }))
  await waitFor(() => {})

  await screen.findByText('cucumber (200 g)')
  expect(screen.getByText('yogurt (170 g)')).toBeInTheDocument()
})

test('Save shows the confirmation popup and resets the form to zero minutes ago', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')

  fireEvent.click(screen.getByText('Save'))
  await screen.findByText('Record recorded ok.')

  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveDisplayValue('')
  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.queryByText(/cucumber/)).not.toBeInTheDocument()
})

test('Discard resets the form without a popup', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber? (200 g)')

  fireEvent.click(screen.getByText('Discard'))
  expect(screen.queryByText('Record recorded ok.')).not.toBeInTheDocument()
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveDisplayValue('')
  expect(screen.getByText('0')).toBeInTheDocument()
})

test('plus/minus minute stepper still works before submit', () => {
  render(<Diary />)
  expect(screen.getByRole('button', { name: /minus minute/i })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: /plus minute/i }))
  expect(screen.getByText('1')).toBeInTheDocument()
})
