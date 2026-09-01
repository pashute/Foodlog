// Filename: environment.ts
// Version 0.2.1
// Always loaded from .env file. Never mocked.

export type OptDevStage = 'prototype' | 'production'
export type OptPlatform = 'desktop' | 'android' | 'ios' | 'web'

function readDevStage(): OptDevStage {
  return process.env.EXPO_PUBLIC_STAGE === 'production' ? 'production' : 'prototype'
}

function readPlatform(): OptPlatform {
  switch (process.env.PLATFORM) {
    case 'desktop':
    case 'android':
    case 'ios':
    case 'web':
      return process.env.PLATFORM
    default:
      return 'web'
  }
}

export const devStage: OptDevStage = readDevStage()
export const platform: OptPlatform = readPlatform()

let prototype: boolean | undefined

export function isPrototype(): boolean {
  prototype ??= devStage === 'prototype'
  return prototype
}
