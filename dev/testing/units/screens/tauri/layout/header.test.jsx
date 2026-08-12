// Filename: header.test.jsx
// Version: 0.2.0

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '../../../../../../src/screens/layout/header/Header.jsx'

test('renders the header stripe with app name, version, login, and hamburger', () => {
  render(<Header />)
  expect(screen.getByText('Foodlog')).toBeInTheDocument()
  expect(screen.getByText('v0.1.1')).toBeInTheDocument()
  expect(screen.getByText('Login with Google')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /hamburger/i })).toBeInTheDocument()
})

test('shows avatar and username instead of login when logged in', () => {
  render(<Header loggedIn username="pashute" />)
  expect(screen.getByText('pashute')).toBeInTheDocument()
  expect(screen.getByText('P')).toBeInTheDocument()
  expect(screen.queryByText('Login with Google')).not.toBeInTheDocument()
})

test('hamburger opens a menu with settings, enter meal, and log out', () => {
  render(<Header loggedIn username="pashute" currentPage="settings" />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  expect(screen.getByText('Enter meal')).toBeInTheDocument()
  expect(screen.getByText('Log out')).toBeInTheDocument()
})

test('Enter meal calls onNavigate with diary', () => {
  const onNavigate = jest.fn()
  render(<Header loggedIn username="pashute" currentPage="settings" onNavigate={onNavigate} />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  fireEvent.click(screen.getByText('Enter meal'))
  expect(onNavigate).toHaveBeenCalledWith('diary')
})
