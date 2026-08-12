// Filename: oauth.tauri.js  Version 0.2.0

// Real login for Tauri desktop — loopback flow (open system browser → Google
// consent → redirect to 127.0.0.1:<port>). Not implemented yet — see develop.md
// 4.3 "Path of least resistance" for the intended approach.

import { isPrototype } from '../config/config.js'
import * as authMock from '../../prototype/oauth/oauth.mock.js'

export const login = async () => {
  if (isPrototype()) {
    return authMock.login()
  }
  throw new Error('Not implemented yet')
}

export const trySilentLogin = async () => {
  if (isPrototype()) {
    return authMock.trySilentLogin()
  }
  throw new Error('Not implemented yet')
}
