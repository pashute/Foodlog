// Filename: diary.test.jsx
// Version: 0.1.0

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Diary from '../../../../../../src/screens/layout/diary/Diary.jsx'

test('renders minutes-ago stepper, meal input, submit button, AI estimate, and Food log link', () => {
  render(<Diary />)
  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.getByText(/minutes ago/)).toBeInTheDocument()
  expect(screen.getByDisplayValue('cucumber yogurt')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /submit meal/i })).toBeInTheDocument()
  expect(screen.getByText('AI estimate')).toBeInTheDocument()
  expect(screen.getByText('Total')).toBeInTheDocument()
  expect(screen.getByText(/Food log/)).toBeInTheDocument()
})

test('shows the total carbs and energy computed from the AI mock', () => {
  render(<Diary />)
  // cucumber (crb:6, cal:28) + yogurt (crb:8, cal:110) = 14 g carbs, 138 kcal
  expect(screen.getByText('Total').parentElement).toHaveTextContent('carbs 14 g · 138 kcal')
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
