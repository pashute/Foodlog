// Filename: loginHelper.js
// Version: 0.1.0

// Shared Playwright helper: drives the real mock-OAuth popup chain (Header
// "Login with Google" -> starter dialog -> account choice -> permit
// consent) to reach a genuinely logged-in state, since App.jsx's `loggedIn`
// is plain in-memory React state with no way to seed it directly. Optionally
// also sets a valid-looking AI key so "Go to Diary" becomes enabled. Reused
// by any screens/* scenario that needs a logged-in (and/or Diary-reachable)
// starting point.

export async function loginAsUser1(page) {
  await page.getByText('Login with Google', { exact: true }).click()
  await page.getByText('Continue Login with Google', { exact: true }).click()
  await page.getByText('Continue', { exact: true }).click()
  await page.getByText('Allow', { exact: true }).click()
  await page.getByText('Press [Start AI] for AI key instructions').waitFor()
}

export async function setValidAiKey(page) {
  await page.getByText('Start AI', { exact: true }).click()
  await page.getByPlaceholder('AIza...').fill('AIzaMockKeyForE2E12345')
  await page.getByRole('button', { name: 'SAVE' }).click()
}

export async function loginAndReachDiary(page) {
  await loginAsUser1(page)
  await setValidAiKey(page)
  await page.getByText('Press Go to Data Entry', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Go to Diary' }).click()
}
