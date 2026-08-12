// Filename: App.jsx
// Version: 0.1.0
// App root (screens/interaction/entry): wires Header + Settings/Diary and
// owns login/page state.

import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Header from './screens/layout/header/Header.jsx'
import Settings from './screens/layout/settings/Settings.jsx'
import Diary from './screens/layout/diary/Diary.jsx'
import * as auth from './infrastructure/auth/auth.js'
import { isPrototype } from './infrastructure/config/config.js'
import { update as storageUpdate, KEYS } from './infrastructure/storage/storage.js'

// Prototype-stage demo seed: start already logged in as "pashute" with a
// configured AI key, so the running app matches the reference mockups
// instead of an empty first-run state. Not real auth — Log out below still
// exercises the real logged-out state, and Login with Google still runs
// the real mock popup flow.
function seedPrototypeDemo() {
  if (!isPrototype()) return
  storageUpdate(KEYS.aiApiKey, 'AIzaSyDemoKeyForPrototypeStage7Qk')
  storageUpdate('usermail', 'pashute@gmail.com')
}
seedPrototypeDemo()

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isPrototype())
  const [username, setUsername] = useState(isPrototype() ? 'pashute' : '')
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
    <View style={styles.app}>
      <Header
        loggedIn={loggedIn}
        username={username}
        currentPage={page}
        onLoginPress={handleLogin}
        onNavigate={setPage}
        onLogout={handleLogout}
      />
      {page === 'diary' && loggedIn ? <Diary /> : <Settings />}
    </View>
  )
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#0b0b0d', minHeight: '100vh' },
})
