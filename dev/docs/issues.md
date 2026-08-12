### Filename issues.md
File version 0.4.0
Last updated: 2026-08-13 01:44

## Blocking: web bundle blank page

`require is not defined` in browser. Added metro.config.cjs + babel.config.cjs (were missing). Rebuild after adding them produced byte-identical bundle hash to broken one — suspect stale Metro cache, not confirmed.

