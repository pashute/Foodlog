// Filename: diary.test.jsx
// Version: 0.2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Diary from '../../../../../../src/screens/layout/diary/Diary.jsx'
import { reset as resetSheet } from '../../../../../../src/prototype/sheet.mock.js'

beforeEach(() => {
  resetSheet()
})

test('renders minutes-ago stepper, meal input, submit button, AI estimate, and Food log link', async () => {
  render(<Diary />)
  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.getByText(/minutes ago/)).toBeInTheDocument()
  expect(screen.getByDisplayValue('cucumber yogurt')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /submit meal/i })).toBeInTheDocument()
  expect(screen.getByText('AI estimate')).toBeInTheDocument()
  expect(screen.getByText('Total')).toBeInTheDocument()
  expect(screen.getByText(/Food log/)).toBeInTheDocument()
  await screen.findByText('cucumber? (200 g)')
})

test('shows the total carbs and energy computed from the AI mock', async () => {
  render(<Diary />)
  // cucumber (crb:6, cal:28) + yogurt (crb:8, cal:110) = 14 g carbs, 138 kcal
  await waitFor(() => expect(screen.getByText('Total').parentElement).toHaveTextContent('carbs 14 g · 138 kcal'))
  expect(screen.getAllByText(/138 kcal/).length).toBeGreaterThan(0)
})

test('plus button increments minutes ago', () => {
  render(<Diary />)
  fireEvent.click(screen.getByRole('button', { name: /plus minute/i }))
  expect(screen.getByText('1')).toBeInTheDocument()
})

test('minus button is disabled at 0', () => {
  render(<Diary />)
  expect(screen.getByRole('button', { name: /minus minute/i })).toBeDisabled()
})

test('shows Save Anyway while items are guesses, Fix regenerates the input', async () => {
  render(<Diary />)
  await screen.findByText('cucumber? (200 g)')
  expect(screen.getByText('Save Anyway')).toBeInTheDocument()

  fireEvent.click(screen.getByText('Fix'))
  expect(screen.getByDisplayValue('(14g, 138cals), 1? med? cucumber (200g, 6g,28c), 1? std? yogurt (170g, 8g,110c)')).toBeInTheDocument()
})

test('resubmitting the fixed string clears the guesses and shows Save', async () => {
  render(<Diary />)
  await screen.findByText('cucumber? (200 g)')

  fireEvent.click(screen.getByText('Fix'))
  fireEvent.click(screen.getByRole('button', { name: /submit meal/i }))

  await screen.findByText('cucumber (200 g)')
  expect(screen.getByText('Save')).toBeInTheDocument()
  expect(screen.queryByText('Save Anyway')).not.toBeInTheDocument()
})

test('Save logs the entry to the sheet and clears the form', async () => {
  render(<Diary />)
  await screen.findByText('cucumber? (200 g)')

  fireEvent.click(screen.getByText('Save Anyway'))

  expect(screen.getByDisplayValue('')).toBeInTheDocument()
  expect(screen.queryByText('cucumber? (200 g)')).not.toBeInTheDocument()
})
