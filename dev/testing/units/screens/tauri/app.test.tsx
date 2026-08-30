// Filename: app.test.tsx
// Version: 0.2.1

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../../../../../src/App.tsx'

test('starts logged out, without an AI key, on the Settings page', () => {
  render(<App />)
  expect(screen.getByText('Login with Google')).toBeInTheDocument()
  expect(screen.getByText('Theme')).toBeInTheDocument()
  expect(screen.getByText('AI Key Missing')).toBeInTheDocument()
})
