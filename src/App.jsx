import { useState } from 'react'
import Header from './components/Header.jsx'
import MainPage from './components/MainPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import { mockLogin } from './mockAuth.js'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('main')

  return (
    <div className="app">
      <Header
        user={user}
        onLoginClick={() => setUser(mockLogin())}
        onUserClick={() => setView('settings')}
      />
      {view === 'settings' ? (
        <SettingsPage onGoToApp={() => setView('main')} />
      ) : (
        <MainPage />
      )}
    </div>
  )
}

export default App
