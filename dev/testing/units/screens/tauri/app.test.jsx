// Filename: app.test.jsx
// Version: 0.1.0

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../../../../../src/App.jsx'

test('starts logged in as pashute on the Settings page (prototype demo seed)', () => {
  render(<App />)
  expect(screen.getByText('pashute')).toBeInTheDocument()
  expect(screen.getByText('Theme')).toBeInTheDocument()
})

test('Enter meal navigates to the Diary page', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  fireEvent.click(screen.getByText('Enter meal'))
  expect(screen.getByText('AI estimate')).toBeInTheDocument()
})

test('Log out returns to Settings, logged out', async () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  fireEvent.click(screen.getByText('Log out'))
  // auth.logout() is async — wait for the resulting state update.
  expect(await screen.findByText('Login with Google')).toBeInTheDocument()
  expect(screen.getByText('Theme')).toBeInTheDocument()
})
