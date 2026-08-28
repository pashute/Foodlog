// Filename authClientIds.ts  Version 0.2.1

// Google OAuth client IDs supplied by the release environment.
export const client_id_tauri = process.env.EXPO_PUBLIC_GOOGLE_TAURI_CLIENT_ID ?? 'not implemented yet'
export const client_id_android = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? 'not implemented yet'
export const client_id_ios = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? 'not implemented yet'
// Web client is also the server-side exchange client for mobile Auth Session.
export const client_id_web = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? 'not implemented yet'

// Todo: fill in with real client IDs from Google Cloud Console (see develop.md 4.3).
