// Filename: settings.test.jsx
// Version: 0.7.0

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

// NOTE: onPressIn/onPressOut (press-and-hold) can't be reliably simulated
// here — react-native-web's custom Responder System resolves the event path
// via Event.composedPath(), which jsdom doesn't populate the way real
// browsers do for synthetic mousedown/pointerdown dispatch. Confirmed via a
// throwaway probe test outside RTL's fireEvent helpers too. This is a test
// -environment gap, not a product bug — the actual onPressIn/onPressOut
// wiring in Settings.jsx (verified by code review) is unaffected; it just
// isn't exercised by an automated test. See issue #3.

test('pressing Start AI opens the Gemini key dialog', () => {
  render(<Settings loggedIn />)
  expect(screen.queryByText('Gemini key')).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Start AI'))
  expect(screen.getByText('Gemini key')).toBeInTheDocument()
})

test('pressing Go to Diary calls onGoToDiary when enabled', () => {
  update(KEYS.aiApiKey, 'AIzaMockKey1234567')
  const onGoToDiary = jest.fn()
  render(<Settings loggedIn onGoToDiary={onGoToDiary} />)
  fireEvent.click(screen.getByRole('button', { name: /go to diary/i }))
  expect(onGoToDiary).toHaveBeenCalled()
})

test('pressing Go to Diary does nothing when disabled', () => {
  const onGoToDiary = jest.fn()
  render(<Settings onGoToDiary={onGoToDiary} />)
  fireEvent.click(screen.getByRole('button', { name: /go to diary/i }))
  expect(onGoToDiary).not.toHaveBeenCalled()
})
