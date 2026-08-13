The Coding AI SHOULD NOT TOUCH THIS FILE

What needs to be fixed now

This temporary file, will be removed from git once development is done.

You do not change anything until discussed and approved. Only consult. Remember the instructions.md. 

# My tracker

# Possible problems
## Blocking: web bundle blank page

`require is not defined` in browser. Added metro.config.cjs + babel.config.cjs (were missing). Rebuild after adding them produced byte-identical bundle hash to broken one — suspect stale Metro cache, not confirmed.


