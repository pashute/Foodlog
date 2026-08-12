// Filename: oauth.android.js  Version 0.2.0

// Real login for Android — @react-native-google-signin/google-signin.
// Native account picker + drive.file consent + offline access (refresh token).
// Will fail until client ids are filled in — see authClientIds.js.

import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { isPrototype } from '../config/config.js'
import * as authMock from '../../prototype/oauth/oauth.mock.js'
import { client_id_web } from './authClientIds.js'

export const login = async () => {
  if (isPrototype()) {
    return authMock.login()
  }
  GoogleSignin.configure({
    webClientId: client_id_web,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    offlineAccess: true,
  })
  await GoogleSignin.hasPlayServices()
  const response = await GoogleSignin.signIn()
  const userInfo = response.data ? response.data : response
  // TODO: persist userInfo.user.email and tokens once infrastructure/storage is built
  return userInfo
}

// Skips the account picker if the device already has a cached Google session for
// this app (GoogleSignin's own cache, unrelated to Chrome's login state).
export const trySilentLogin = async () => {
  if (isPrototype()) {
    return authMock.trySilentLogin()
  }
  try {
    const response = await GoogleSignin.signInSilently()
    return response.data ? response.data : response
  } catch {
    return null
  }
}
