// Production desktop OAuth uses the shared Expo Auth Session flow.

import { getSessionToken } from '../storage/storage.ts'
import { client_id_tauri } from './authClientIds.ts'
import { authorize, refresh } from './oauthSession.ts'

export const login = () => authorize(client_id_tauri, 'desktop')

export const trySilentLogin = async () => {
  if (!getSessionToken()) return null
  try { return await refresh(token, 'desktop') } catch { return null }
}

export const isLoggedIn = async () => Boolean(await Promise.resolve(storageGet(KEYS.authToken)))
export const logout = () => undefined
