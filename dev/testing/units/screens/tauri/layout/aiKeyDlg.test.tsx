// Filename: aiKeyDlg.test.tsx
// Version: 0.2.1

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AiKeyDlg from '../../../../../../src/screens/layout/settings/aiKey.dlg.tsx'

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

// SAVE is disabled while the key doesn't look valid (previous test), so a
// click while it's disabled is a no-op — that disabled state IS the
// invalid-key feedback for format errors. The "Invalid key, try again"
// warning text is reserved for a real (non-prototype) Gemini-side rejection
// of a correctly-*shaped* key, which needs a live API call to trigger and
// isn't simulated here (see ai.ts's real branch — no test, per instruction).
test('clicking a disabled SAVE (invalid-looking key) does not call onSave', () => {
  const onSave = jest.fn()
  render(<AiKeyDlg visible onSave={onSave} />)
  fireEvent.change(screen.getByPlaceholderText('AIza...'), { target: { value: 'not-a-real-key' } })
  fireEvent.click(screen.getByRole('button', { name: /save/i }))
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
