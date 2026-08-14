// Filename: settings.test.jsx
// Version: 0.5.0

import { render, screen, fireEvent } from '@testing-library/react'
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

test('shows "AI Key Missing" label when no AI key is stored', () => {
  render(<Settings />)
  expect(screen.getByText('AI Key Missing')).toBeInTheDocument()
})

test('shows "AI Key OK" once a well-formed AI key is stored', () => {
  update(KEYS.aiApiKey, 'AIzaMockKey1234567')
  render(<Settings />)
  expect(screen.getByText('AI Key OK')).toBeInTheDocument()
})

test('shows "AI Key Invalid" when the stored key has the wrong shape', () => {
  update(KEYS.aiApiKey, 'not-a-real-key')
  render(<Settings />)
  expect(screen.getByText('AI Key Invalid')).toBeInTheDocument()
})

test('shows the login instruction when not logged in, regardless of AI key state', () => {
  update(KEYS.aiApiKey, 'AIzaMockKey1234567')
  render(<Settings />)
  expect(screen.getByText('Press "Login with Google" to use the app.')).toBeInTheDocument()
})

test('shows the AI key instruction when logged in but the key is missing or invalid', () => {
  render(<Settings loggedIn />)
  expect(screen.getByText('Press [Start AI] for AI key instructions')).toBeInTheDocument()
})

test('shows the "no problem" instruction when logged in with a valid key', () => {
  update(KEYS.aiApiKey, 'AIzaMockKey1234567')
  render(<Settings loggedIn />)
  expect(screen.getByText('Press Go to Data Entry')).toBeInTheDocument()
})

test('shows a red, bold instruction when an application error is passed', () => {
  render(<Settings loggedIn appError="Something went wrong." />)
  const errorText = screen.getByText('Something went wrong.')
  expect(errorText).toBeInTheDocument()
  expect(errorText).toHaveStyle({ fontWeight: '700' })
})

test('Go to Diary button is present', () => {
  render(<Settings />)
  expect(screen.getByRole('button', { name: /go to diary/i })).toBeInTheDocument()
})

test('pressing and holding the theme info icon shows its hint, releasing reverts it', () => {
  render(<Settings />)
  const icon = screen.getByLabelText('theme info')
  fireEvent.mouseDown(icon)
  expect(screen.getByText('Theme change not yet available')).toBeInTheDocument()
  fireEvent.mouseUp(icon)
  expect(screen.queryByText('Theme change not yet available')).not.toBeInTheDocument()
})

test('pressing and holding the AI key info icon shows its hint, releasing reverts it', () => {
  render(<Settings loggedIn />)
  const icon = screen.getByLabelText('AI key info')
  fireEvent.mouseDown(icon)
  expect(screen.getByText('Press "Start AI" to see how & why')).toBeInTheDocument()
  fireEvent.mouseUp(icon)
  expect(screen.queryByText('Press "Start AI" to see how & why')).not.toBeInTheDocument()
})

test('pressing and holding the timezone info icon shows its hint, releasing reverts it', () => {
  render(<Settings loggedIn />)
  const icon = screen.getByLabelText('timezone info')
  fireEvent.mouseDown(icon)
  expect(screen.getByText('This changes the timezone in this app. Not the system settings.')).toBeInTheDocument()
  fireEvent.mouseUp(icon)
  expect(
    screen.queryByText('This changes the timezone in this app. Not the system settings.')
  ).not.toBeInTheDocument()
})

test('pressing Start AI opens the Gemini key dialog', () => {
  render(<Settings loggedIn />)
  expect(screen.queryByText('Gemini key')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Start AI'))
  expect(screen.getByText('Gemini key')).toBeInTheDocument()
})
