// Filename: oauth.ios.ts  Version 0.2.1

// Real login for iOS — far future, not implemented yet.

import { isPrototype } from '../environment.ts'
import * as authMock from '../../prototype/oauth/oauth.mock.ts'

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
