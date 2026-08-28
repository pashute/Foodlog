// Production Android OAuth uses the shared Expo Auth Session flow.

import { get as storageGet, KEYS } from '../storage/storage.ts'
import { client_id_web } from './authClientIds.ts'
import { authorize, refresh } from './oauthSession.ts'

export const login = () => authorize(client_id_web, 'android')

export const trySilentLogin = async () => {
  const token = await Promise.resolve(storageGet(KEYS.authToken))
  if (!token) return null
  try { return await refresh(token, 'android') } catch { return null }
}

export const isLoggedIn = async () => Boolean(await Promise.resolve(storageGet(KEYS.authToken)))
export const logout = () => undefined
