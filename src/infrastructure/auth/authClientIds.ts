// Filename authClientIds.ts  Version 0.1.1

// stores auth client ids,
// one for Tauri desktop, one for android app, and in the future, one for iOS app
export const client_id_tauri = "not implemented yet";
export const client_id_android = "not implemented yet";
// One Google Cloud "Web application" OAuth client, used two ways:
// GoogleSignin's required webClientId on Android, AND oauth.web.ts's
// browser-side Google Identity Services token client (Expo web).
export const client_id_web = "not implemented yet";

// Todo: fill in with real client IDs from Google Cloud Console (see develop.md 4.3).
