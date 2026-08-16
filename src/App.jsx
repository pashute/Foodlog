// Filename: App.jsx
// Version: 0.2.4
// App root (screens/interaction/entry): wires Header + Settings/Diary and
// owns login/page state.

import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Header from './screens/layout/header/Header.jsx'
import Settings from './screens/layout/settings/Settings.jsx'
import Diary from './screens/layout/diary/Diary.jsx'
import PhonePanel from './screens/layout/phonePanel/PhonePanel.jsx'
import StarterDlg from './infrastructure/auth/starter.dlg.jsx'
import AccountChoiceDlg from './prototype/oauth/accountChoice.mock.dlg.jsx'
import PermitConsentDlg from './prototype/oauth/permitConsent.mock.dlg.jsx'
import * as auth from './infrastructure/auth/auth.js'
import { isPrototype } from './infrastructure/config/config.js'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [page, setPage] = useState('settings')

  const handleLogin = async () => {
    const result = await auth.login()
    if (result.success) {
      setLoggedIn(true)
      setUsername(result.usermail.split('@')[0])
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
            <Settings loggedIn={loggedIn} onGoToDiary={() => setPage('diary')} />
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
