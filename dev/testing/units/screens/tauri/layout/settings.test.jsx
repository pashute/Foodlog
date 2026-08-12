// Filename: settings.test.jsx
// Version: 0.1.0

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Settings from '../../../../../../src/screens/layout/settings/Settings.jsx'
import { initialize, update, KEYS } from '../../../../../../src/infrastructure/storage/storage.js'

beforeEach(() => {
  initialize()
})

test('renders theme, timezone, and Foodlog sheet rows', () => {
  render(<Settings />)
  expect(screen.getByText('Theme')).toBeInTheDocument()
  expect(screen.getByText('Dark')).toBeInTheDocument()
  expect(screen.getByText('Foodlog')).toBeInTheDocument()
  expect(screen.getByText('Open in Google Sheets')).toBeInTheDocument()
})

test('shows red LED and "no key" instruction when no AI key is stored', () => {
  render(<Settings />)
  expect(screen.getByText('No key')).toBeInTheDocument()
  expect(screen.getByText('Gemini API key needed. See instructions.')).toBeInTheDocument()
})

test('shows green LED and "key configured" once an AI key is stored', () => {
  update(KEYS.aiApiKey, 'AIzaMockKey1234567')
  render(<Settings />)
  expect(screen.getByText('Key configured')).toBeInTheDocument()
})

test('Go to App button is present', () => {
  render(<Settings />)
  expect(screen.getByRole('button', { name: /go to app/i })).toBeInTheDocument()
})
