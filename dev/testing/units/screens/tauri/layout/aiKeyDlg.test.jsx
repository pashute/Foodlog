// Filename: aiKeyDlg.test.jsx
// Version: 0.1.0

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AiKeyDlg from '../../../../../../src/screens/layout/settings/aiKey.dlg.jsx'

test('shows the header and numbered steps when visible', () => {
  render(<AiKeyDlg visible />)
  expect(screen.getByText('Gemini key')).toBeInTheDocument()
  expect(screen.getByText(/Google AI Studio/)).toBeInTheDocument()
  expect(screen.getByText(/Create API Key in the top-left corner/)).toBeInTheDocument()
  expect(screen.getByText(/Just use the default project/)).toBeInTheDocument()
})

test('renders nothing when not visible', () => {
  render(<AiKeyDlg visible={false} />)
  expect(screen.queryByText('Gemini key')).not.toBeInTheDocument()
})

test('SAVE is disabled until a valid-looking key is entered', () => {
  render(<AiKeyDlg visible />)
  const saveBtn = screen.getByRole('button', { name: /save/i })
  expect(saveBtn).toBeDisabled()

  fireEvent.change(screen.getByPlaceholderText('AIza...'), { target: { value: 'AIzaMockKey1234567' } })
  expect(saveBtn).not.toBeDisabled()
})

test('an invalid save attempt shows the warning instead of calling onSave', () => {
  const onSave = jest.fn()
  render(<AiKeyDlg visible onSave={onSave} />)
  fireEvent.change(screen.getByPlaceholderText('AIza...'), { target: { value: 'not-a-real-key' } })
  fireEvent.click(screen.getByRole('button', { name: /save/i }))
  expect(screen.getByText('Invalid key, try again')).toBeInTheDocument()
  expect(onSave).not.toHaveBeenCalled()
})

test('a valid key calls onSave with the key', () => {
  const onSave = jest.fn()
  render(<AiKeyDlg visible onSave={onSave} />)
  fireEvent.change(screen.getByPlaceholderText('AIza...'), { target: { value: 'AIzaMockKey1234567' } })
  fireEvent.click(screen.getByRole('button', { name: /save/i }))
  expect(onSave).toHaveBeenCalledWith('AIzaMockKey1234567')
})

test('Close calls onClose', () => {
  const onClose = jest.fn()
  render(<AiKeyDlg visible onClose={onClose} />)
  fireEvent.click(screen.getByText('Close'))
  expect(onClose).toHaveBeenCalled()
})
