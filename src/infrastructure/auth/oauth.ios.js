// Filename: oauth.ios.js  Version 0.2.0

// Real login for iOS — far future, not implemented yet.

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
