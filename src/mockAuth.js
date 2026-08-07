// Phase 1 (mock version, see src/docs/develop.md): stands in for real Google OAuth.
// Tests override the resolved user via window.__foodlogMockUser.
export function mockLogin() {
  const override = typeof window !== 'undefined' ? window.__foodlogMockUser : undefined
  return override ?? { name: 'Demo User' }
}
