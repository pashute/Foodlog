# Technologies & Stack

## Current Setup (as of 2026-08-31)

### Core Framework
- **React** // was 18.3.1
- **React Native** // was 0.86.3 - these two are incompatible
- **React Native Web** // 0.19.13
- **Expo** // 46.0.21 (CLI & runtime)

### Language & Tooling
- **TypeScript** 5.6.3
- **Babel** 7.26.0 (with presets: env, react)
- **Metro** bundler (Expo's bundler)

### Platforms & Targets
- **Web** (via expo-web → react-native-web → DOM)
- **Desktop** (via Tauri 2.0 wrapping expo-web bundle)
- **Android** (native React Native, via Expo)
- **iOS** (future, native React Native, via Expo)

### Secure Storage & Auth
- **expo-auth-session** 57.0.10 (OAuth flow)
- Note: secure storage moved to backend (cloudflare)

### Assets & Media
- **expo-asset** 11.1.7  // what is this for?

### Backend (Non-Production)
- **Cloudflare Workers** (production backend, deployed separately)
- **Mock sheet server** (localhost:3000, prototype-only Node.js)

### Build & Deploy
- **Wrangler** (Cloudflare Workers CLI, for backend deployment)
- **GitHub Pages** (frontend hosting, production web)

### Testing
- **Jest** (UI tests) // 29.7.0 
- **Playwright** (E2E tests) // 1.62.0 
- **Cucumber/BDD** (feature tests) // 13.2.0 
- **React Testing Library** // 16.0.1
- **tsx**  (TypeScript runner for tests) // 4.23.12

### Infrastructure
- **Concurrently** 9.2.1 (run mock server + expo in parallel)
- **Expo config-plugins** (for native module config)

### Logging
- **Custom report() module** (src/infrastructure/log.ts)
  - Severity levels: always, error, warn, debug, verbose
  - LOG_LEVEL env var controls filtering
  - Timestamp in ISO format
  - Per-module logging with source location

## Known Issues (2026-08-31)
- Dependency conflicts: React/React-Native/Expo versions not fully aligned
- expo/config-plugins sometimes fails to resolve in certain npm states
- --legacy-peer-deps required for clean install
