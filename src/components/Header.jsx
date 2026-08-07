import { appConfig } from '../../foodlog.config.js'

export default function Header({ user, onLoginClick, onUserClick }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <span
          className="app-logo"
          style={{ fontFamily: appConfig.logoFont, color: appConfig.colors.primary }}
        >
          {appConfig.name}
        </span>
        <span className="app-version">v{__APP_VERSION__}</span>
      </div>
      {user ? (
        <button className="user-button" onClick={onUserClick}>{user.name}</button>
      ) : (
        <button className="login-button" onClick={onLoginClick}>Login</button>
      )}
    </header>
  )
}
