// Filename header.test.jsx  Version 0.1.0

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../../../../../../src/screens/layout/header/Header.jsx'

test('renders the header stripe with app name, version, login, and hamburger', () => {
  render(<Header />)
  expect(screen.getByText('Foodlog')).toBeInTheDocument()
  expect(screen.getByText('v0.1.1')).toBeInTheDocument()
  expect(screen.getByText('Login with Google')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /hamburger/i })).toBeInTheDocument()
})
