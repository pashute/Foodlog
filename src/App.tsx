// Filename: App.tsx
// Version: 0.2.1
// App root (screens/interaction/entry): wires Header + Settings/Diary and
// owns login/page state.

import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Header from './screens/layout/header/Header.tsx'
import Settings from './screens/layout/settings/Settings.tsx'
import Diary from './screens/diary/Diary.tsx'
import PhonePanel from './screens/layout/phonePanel/PhonePanel.tsx'
import StarterDlg from './infrastructure/auth/starter.dlg.tsx'
import AccountChoiceDlg from './prototype/oauth/accountChoice.mock.dlg.tsx'
import PermitConsentDlg from './prototype/oauth/permitConsent.mock.dlg.tsx'
import MockSheet from './prototype/sheet/MockSheet.tsx'
import * as auth from './infrastructure/auth/auth.ts'
import { isPrototype } from './infrastructure/environment'
import { initializeConfiguration, loadUserConfiguration } from './infrastructure/config/configIo'
import { get as storageGet, KEYS } from './infrastructure/storage/storage.ts'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [usermail, setUsermail] = useState('')
  const [page, setPage] = useState('settings')
  const [appError, setAppError] = useState(null)

  // Crash recovery (screens/interaction/entry.feature: "Continued log in
  // after crash"): the app was closed without logging out — an authToken
  // is still in storage from before this fresh load. Try a silent login;
  // if that fails, the token is stale — log out for real and surface it.
  useEffect(() => {
    ;(async () => {
      await initializeConfiguration()
      const leftoverToken = await Promise.resolve(storageGet(KEYS.authToken))
      if (!leftoverToken) return
      try {
        const result = await auth.trySilentLogin()
        if (result) {
          await loadUserConfiguration(result.usermail)
          setLoggedIn(true)
          setUsermail(result.usermail ?? '')
          setUsername((result.usermail ?? '').split('@')[0])
          return
        }
      } catch {
        // fall through to the logout/error branch below
      }
      await auth.logout()
      setAppError('Your session expired. Please log in again.')
    })()
  }, [])

  const handleLogin = async () => {
    const result = await auth.login()
    if (result.success) {
      await loadUserConfiguration(result.usermail)
      setLoggedIn(true)
      setUsermail(result.usermail)
      setUsername(result.usermail.split('@')[0])
      setAppError(null)
    }
  }

  const handleLogout = async () => {
    await auth.logout()
    setLoggedIn(false)
    setUsername('')
    setUsermail('')
    setPage('settings')
  }

  const showingMockSheet = isPrototype() && typeof window !== 'undefined' && window.location.pathname.startsWith('/mock-sheet/')

  if (showingMockSheet) {
    return <MockSheet />
  }

  return (
    <>
      <PhonePanel>
        <View style={styles.app}>
          <Header
            loggedIn={loggedIn}
            username={username}
            currentPage={page}
            onLoginPress={handleLogin}
            onNavigate={setPage}
            onLogout={handleLogout}
          />
          {page === 'diary' && loggedIn ? (
            <Diary />
          ) : (
            <Settings loggedIn={loggedIn} usermail={usermail} appError={appError} onGoToDiary={() => setPage('diary')} />
          )}
        </View>
      </PhonePanel>

      {/* Login popups: mounted once here so their imperative popup()
          promises (starter.ts / accountChoice.mock.ts / permitConsent.mock.ts)
          have a rendered Modal to resolve against. Without this, auth.login()
          hangs forever awaiting a dialog that never appears. */}
      <StarterDlg />
      {isPrototype() && (
        <>
          <AccountChoiceDlg />
          <PermitConsentDlg />
        </>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#0b0b0d', minHeight: '100vh' },
})
