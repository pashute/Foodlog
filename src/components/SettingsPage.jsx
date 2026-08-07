export default function SettingsPage({ onGoToApp }) {
  return (
    <main className="page settings-page">
      <button className="go-to-app-button" onClick={onGoToApp}>Go to App</button>
    </main>
  )
}
