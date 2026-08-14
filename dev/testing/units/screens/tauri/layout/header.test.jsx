// Filename: header.test.jsx
// Version: 0.3.0

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

test('on settings page: Settings is hidden, Enter meal and Log out are shown', () => {
  render(<Header loggedIn username="pashute" currentPage="settings" />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  expect(screen.getByText('Enter meal')).toBeInTheDocument()
  expect(screen.getByText('Log out')).toBeInTheDocument()
})

test('on diary page: Settings is shown, Enter meal is hidden', () => {
  render(<Header loggedIn username="pashute" currentPage="diary" />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  expect(screen.getByText('Settings')).toBeInTheDocument()
  expect(screen.queryByText('Enter meal')).not.toBeInTheDocument()
})

test('not logged in: Enter meal is shown but disabled, Log out is hidden', () => {
  render(<Header currentPage="settings" />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  const enterMeal = screen.getByText('Enter meal')
  expect(enterMeal).toBeInTheDocument()
  expect(screen.queryByText('Log out')).not.toBeInTheDocument()
  fireEvent.click(enterMeal)
  // disabled Pressable ignores the click, so the menu stays open
  expect(screen.getByText('Enter meal')).toBeInTheDocument()
})

test('Enter meal calls onNavigate with diary', () => {
  const onNavigate = jest.fn()
  render(<Header loggedIn username="pashute" currentPage="settings" onNavigate={onNavigate} />)
  fireEvent.click(screen.getByRole('button', { name: /hamburger/i }))
  fireEvent.click(screen.getByText('Enter meal'))
  expect(onNavigate).toHaveBeenCalledWith('diary')
})
