// Filename: diary.test.tsx
// Version: 0.5.1
// Short, readable tests following the diaryEntry sequence: 5.0 empty/placeholder
// -> 5.1 unrecognized text errors -> 5.2 canned text analyzes, then each button.
// Canned mock input/output comes from src/prototype/ai.mock.ts (cannedAnalysis).
// Rows never show "?" (Aug 18 20:50 batch) — the accept checkbox is the only
// guess indicator in the row; "?" only ever shows up in the Fix string.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Diary from '../../../../../../src/screens/diary/Diary.tsx'
import { reset as resetSheet } from '../../../../../../src/prototype/sheet.mock.ts'

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

test('5.2: canned text analyzes into a food list (no "?") and enables the buttons', async () => {
  render(<Diary />)
  await submit(MEAL)

  await screen.findByText('cucumber (200 g)')
  expect(screen.getByText('yogurt (170 g)')).toBeInTheDocument()
  expect(screen.getByText('carbs 14 g · 138 kcal')).toBeInTheDocument()
  expect(screen.getAllByText('Accept').length).toBeGreaterThanOrEqual(2) // tiny column header + button
  for (const label of ['Fix', 'Accept', 'Save', 'Revert']) {
    expect(screen.getByRole('button', { name: label })).not.toBeDisabled()
  }
})

test('checkboxes: guesses start unticked, ticking checks them without changing row text', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  const cucumberBox = screen.getByRole('checkbox', { name: /accept cucumber/i })
  expect(cucumberBox).not.toBeChecked()

  fireEvent.click(cucumberBox)
  expect(cucumberBox).toBeChecked()
  expect(screen.getByText('cucumber (200 g)')).toBeInTheDocument()
})

test('unticking an already-accepted item unchecks it, row text still unchanged', async () => {
  render(<Diary />)
  await submit('(14g, 138cals), 1 med cucumber (wgt: 200g, crb: 6g, nrg: 28kc),\n1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)')
  await screen.findByText('cucumber (200 g)')

  const cucumberBox = screen.getByRole('checkbox', { name: /accept cucumber/i })
  fireEvent.click(cucumberBox)
  expect(cucumberBox).not.toBeChecked()
  expect(screen.getByText('cucumber (200 g)')).toBeInTheDocument()
})

test('Accept ticks every checkbox', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByRole('button', { name: 'Accept' }))
  for (const box of screen.getAllByRole('checkbox')) {
    expect(box).toBeChecked()
  }
}, 10000)

test('editing qty proportionally rescales weight/carbs/calories', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  fireEvent.change(screen.getByLabelText(/cucumber quantity/i), { target: { value: '2' } })
  expect(screen.getByText('cucumber (400 g)')).toBeInTheDocument()
  expect(screen.getByText('carbs 12 g · 56 kcal')).toBeInTheDocument()
})

test('type textbox is empty by default, editable, and truncates at 9 letters', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  const typeBox = screen.getByLabelText(/cucumber type/i)
  expect(typeBox).toHaveValue('')

  fireEvent.change(typeBox, { target: { value: 'abcdefghij' } })
  expect(typeBox).toHaveValue('abcdefghi')
})

test('Fix rebuilds the telegraphic string, clears the list, and disables the buttons', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByRole('button', { name: 'Fix' }))
  // getByDisplayValue doesn't reliably match multi-line textarea values
  // (RTL/jsdom quirk) — check the raw .value directly instead.
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt').value).toBe(
    '(14g, 138cals), 1 med? cucumber (wgt: 200g, crb: 6g, nrg: 28kc),\n1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)'
  )
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Fix' })).toBeDisabled()
})

test('Fix keeps the displayed hour pinned to the original submit time', async () => {
  const base = new Date(2026, 0, 1, 10, 0, 0).getTime()
  const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(base)

  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')
  const timeShown = screen.getByText(/^\d{2}:\d{2}$/).textContent

  nowSpy.mockReturnValue(base + 3 * 60000) // 3 minutes pass in real time
  fireEvent.click(screen.getByText('Fix'))
  expect(screen.getByText(timeShown)).toBeInTheDocument() // hour is still pinned

  nowSpy.mockRestore()
})

test('resubmitting an unedited fixed string round-trips, guesses stay guessed', async () => {
  // Nothing was edited before resubmitting, so the "?" marks Fix put in the
  // meal text still mean "not confirmed" — the original-record comparison
  // (diaryEntry.ts) reads those marks as "not given," same as if the field
  // had been omitted, so the checkbox stays unticked until the user
  // actually types a value that matches, or ticks it manually.
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')
  fireEvent.click(screen.getByText('Fix'))
  fireEvent.click(screen.getByRole('button', { name: /submit meal/i }))
  await waitFor(() => {})

  await screen.findByText('cucumber (200 g)')
  expect(screen.getByText('yogurt (170 g)')).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: /accept cucumber/i })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: /accept yogurt/i })).not.toBeChecked()
})

test('Save shows an inline "Meal saved" message and resets the form to zero minutes ago', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByText('Save'))
  await screen.findByText('Meal saved')

  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveDisplayValue('')
  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.queryByText(/cucumber/)).not.toBeInTheDocument()
})

test('Revert restores the original typed text and closes the rows view', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByText('Revert'))
  expect(screen.queryByText('Meal saved')).not.toBeInTheDocument()
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveDisplayValue(MEAL)
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
})

test('Revert after Fix restores the original typed text, not the fixed string', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')
  fireEvent.click(screen.getByText('Fix'))
  fireEvent.click(screen.getByRole('button', { name: /submit meal/i }))
  await waitFor(() => {})
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByText('Revert'))
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveDisplayValue(MEAL)
})

test('meal textbox locks after submit and unlocks after Fix', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).toHaveAttribute('readonly')

  fireEvent.click(screen.getByRole('button', { name: 'Fix' }))
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).not.toHaveAttribute('readonly')
})

test('meal textbox unlocks after Revert', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')

  fireEvent.click(screen.getByText('Revert'))
  expect(screen.getByPlaceholderText('e.g. cucumber yogurt')).not.toHaveAttribute('readonly')
})

test('editing the meal text clears the "Meal saved" message', async () => {
  render(<Diary />)
  await submit(MEAL)
  await screen.findByText('cucumber (200 g)')
  fireEvent.click(screen.getByText('Save'))
  await screen.findByText('Meal saved')

  fireEvent.change(screen.getByPlaceholderText('e.g. cucumber yogurt'), { target: { value: 'x' } })
  expect(screen.queryByText('Meal saved')).not.toBeInTheDocument()
})

test('an explicit, already-given qty/unit matching the AI response starts checked', async () => {
  render(<Diary />)
  await submit('(14g, 138cals), 1 med cucumber (wgt: 200g, crb: 6g, nrg: 28kc),\n1 cup? yogurt (wgt: 170g, crb: 8g, nrg: 110kc)')
  await screen.findByText('cucumber (200 g)')

  expect(screen.getByRole('checkbox', { name: /accept cucumber/i })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: /accept yogurt/i })).not.toBeChecked()
})

test('plus/minus minute stepper still works before submit', () => {
  render(<Diary />)
  expect(screen.getByRole('button', { name: /minus minute/i })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: /plus minute/i }))
  expect(screen.getByText('1')).toBeInTheDocument()
})
