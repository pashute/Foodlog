// Filename: Header.jsx
// Version: 0.2.2
// App header (screens/layout/header): brand + login/avatar + hamburger menu

import { useState } from 'react'
import { Text, View, Pressable, StyleSheet } from 'react-native'
import { get as configGet } from '../../../infrastructure/config/config.js'

// Controlled component — App entry owns login/page state and passes it in,
// so Header stays a pure view (easy to test, easy to reuse).
export default function Header({
  loggedIn = false,
  username = '',
  currentPage = 'settings',
  onLoginPress = () => {},
  onNavigate = () => {},
  onLogout = () => {},
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const appname = configGet('app', 'app-name')
  const version = configGet('app', 'app-version')

  // Items hide themselves when not relevant (already on that page, or not
  // logged in for logout) rather than showing disabled. `enabled` only
  // applies to "Enter meal", which stays visible on the settings page but
  // is greyed out until logged in.
  const menuItems = [
    { name: 'settings', label: 'Settings', action: () => onNavigate('settings'), shown: currentPage !== 'settings' },
    { name: 'diary', label: 'Enter meal', action: () => onNavigate('diary'), shown: currentPage !== 'diary', enabled: loggedIn },
    { name: 'logout', label: 'Log out', action: onLogout, shown: loggedIn },
  ].filter((item) => item.shown)

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>{appname}</Text>
        <Text style={styles.version}>v{version}</Text>
      </View>
      <View style={styles.right}>
        {loggedIn ? (
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.username}>{username}</Text>
          </View>
        ) : (
          <Pressable onPress={onLoginPress}>
            <Text style={styles.loginText}>Login with Google</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          aria-label="hamburger menu"
          onPress={() => setMenuOpen((open) => !open)}
        >
          <Text style={styles.hamburger}>☰</Text>
        </Pressable>
      </View>

      {menuOpen && (
        <View style={styles.menu}>
          {menuItems.map((item) => {
            const enabled = item.enabled !== false
            return (
              <Pressable
                key={item.name}
                disabled={!enabled}
                onPress={() => {
                  setMenuOpen(false)
                  item.action()
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuItemText, !enabled && styles.menuItemDisabled]}>
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2e303a',
    backgroundColor: '#16171d',
    zIndex: 10,
    elevation: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'baseline' },
  brand: { fontSize: 20, fontWeight: '700', color: '#f3f4f6' },
  version: { fontSize: 12, color: '#9ca3af', marginLeft: 6 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3b5a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  username: { color: '#f3f4f6', fontSize: 14 },
  loginText: { color: '#f3f4f6', fontSize: 14 },
  hamburger: { fontSize: 18, color: '#9ca3af', marginLeft: 6 },
  menu: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#1c1d24',
    borderWidth: 1,
    borderColor: '#2e303a',
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 140,
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 14 },
  menuItemText: { color: '#f3f4f6', fontSize: 14 },
  menuItemDisabled: { color: '#4b4d58' },
})
