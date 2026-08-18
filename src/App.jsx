// Filename: App.jsx
// Version: 0.2.6
// App root (screens/interaction/entry): wires Header + Settings/Diary and
// owns login/page state.

import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Header from './screens/layout/header/Header.jsx'
import Settings from './screens/layout/settings/Settings.jsx'
import Diary from './screens/diary/Diary.jsx'
import PhonePanel from './screens/layout/phonePanel/PhonePanel.jsx'
import StarterDlg from './infrastructure/auth/starter.dlg.jsx'
import AccountChoiceDlg from './prototype/oauth/accountChoice.mock.dlg.jsx'
import PermitConsentDlg from './prototype/oauth/permitConsent.mock.dlg.jsx'
import * as auth from './infrastructure/auth/auth.js'
import { isPrototype } from './infrastructure/config/config.js'
import { get as storageGet, KEYS } from './infrastructure/storage/storage.js'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [page, setPage] = useState('settings')
  const [appError, setAppError] = useState(null)

  // Crash recovery (screens/interaction/entry.feature: "Continued log in
  // after crash"): the app was closed without logging out — an authToken
  // is still in storage from before this fresh load. Try a silent login;
  // if that fails, the token is stale — log out for real and surface it.
  useEffect(() => {
    ;(async () => {
      const leftoverToken = await Promise.resolve(storageGet(KEYS.authToken))
      if (!leftoverToken) return
      try {
        const result = await auth.trySilentLogin()
        if (result) {
          setLoggedIn(true)
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
      setLoggedIn(true)
      setUsername(result.usermail.split('@')[0])
      setAppError(null)
    }
  }

  const handleLogout = async () => {
    await auth.logout()
    setLoggedIn(false)
    setUsername('')
    setPage('settings')
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
            <Settings loggedIn={loggedIn} appError={appError} onGoToDiary={() => setPage('diary')} />
          )}
        </View>
      </PhonePanel>

      {/* Login popups: mounted once here so their imperative popup()
          promises (starter.js / accountChoice.mock.js / permitConsent.mock.js)
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
