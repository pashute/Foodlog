// Filename: App.tsx
// Version: 0.2.2
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
import { isPrototype, devStage, platform } from './infrastructure/environment'
import { initializeConfiguration } from './infrastructure/config/configIo'
import { get as storageGet, KEYS } from './infrastructure/storage/storage.ts'
import { appConstants } from './infrastructure/config/config.ts'
import { report } from './infrastructure/log.ts'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState('settings')
  const [appError, setAppError] = useState(null)
  const [allSettingsOK, setAllSettingsOK] = useState(false)
  const [showDonatePopup, setShowDonatePopup] = useState(false)
  const [showContactPopup, setShowContactPopup] = useState(false)

  // Crash recovery (screens/interaction/entry.feature: "Continued log in
  // after crash"): the app was closed without logging out — an authToken
  // is still in storage from before this fresh load. Try a silent login;
  // if that fails, the token is stale — log out for real and surface it.
  useEffect(() => {
    ;(async () => {
      await initializeConfiguration()
      let leftoverToken
      try {
        leftoverToken = await Promise.resolve(storageGet(KEYS.authToken))
      } catch {
        report('debug', 'App startup: no stored token (first load), proceeding to login')
        return
      }
      if (!leftoverToken) return
      try {
        const result = await auth.trySilentLogin()
        if (result) {
          setLoggedIn(true)
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
      setAppError(null)
    }
  }

  const handleLogout = async () => {
    await auth.logout()
    setLoggedIn(false)
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
            currentPage={page}
            onLoginPress={handleLogin}
            onNavigate={setPage}
            onLogout={handleLogout}
            onLikeThis={() => setShowDonatePopup(true)}
            onTalkToUs={() => setShowContactPopup(true)}
            allSettingsOK={allSettingsOK}
          />
          {page === 'diary' && allSettingsOK ? (
            <Diary />
          ) : (
            <Settings
              loggedIn={loggedIn}
              appError={appError}
              onGoToDiary={() => setPage('diary')}
              onSettingsStateChange={setAllSettingsOK}
              showDonatePopup={showDonatePopup}
              onCloseDonatePopup={() => setShowDonatePopup(false)}
              showContactPopup={showContactPopup}
              onCloseContactPopup={() => setShowContactPopup(false)}
            />
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
