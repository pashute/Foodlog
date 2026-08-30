// Filename: index.ts  
// Version 0.2.1

import { maybeCompleteAuthSession } from 'expo-auth-session'

export function completeAuthCallback(): void {
    maybeCompleteAuthSession()
}