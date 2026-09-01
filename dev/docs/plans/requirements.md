# Foodlog Requirements (v0.2.4)

## Header
- App name + version (from config)
- Login/Avatar (top right)
- Hamburger menu (when logged in)

## Authentication
- Google OAuth login (drive.file scope)
- Silent login on crash recovery
- Logout available in menu

## Menu (Hamburger ☰)
**Before login:** Settings only

**After login:**
- Settings
- Enter meal (disabled until: logged in AND AI key OK AND sheet ID exists)
- I like this! (→ Donate popup)
- Talk to us (→ Contact popup)
- Log out

## Settings Screen
- **Theme** card (Dark by default, change button disabled)
- **Config** row (Open / Reload buttons, disabled until logged in)
- **AI Key** status LED + "Start AI" button (disabled until logged in)
  - Opens AI key setup dialog with instructions + paste field
- **Timezone** display (city, country, abbrev, UTC offset; e.g., "Jerusalem, Israel (IDT UTC+3)")
- **Sheet link** card with "Open in Google Sheets" button
- **Instruction box** (dark gray bg, green monospace text, yellow "info:" label)
  - Text: "To get going press [Go to Diary]. Bon appétite!" (line break before last sentence)
- **"Go to Diary"** button (disabled until all settings OK; gray when disabled)

**Errors shown in instruction box:** not logged in → missing AI key → no sheet ID

## Diary Screen
- **Time box:** [-] [0] [+] minutes + current HH:MM (does not auto-advance)
- **Totals:** Carbs (g) + Energy (kcal)
- **Meal input:** multiline text box
- **Submit button:** green ▶
- **AI estimate:** per-item breakdown (name, weight, carbs, kcal) + totals
- **Row editor:** qty, unit, type, food name (with ? marks for guesses)
- **Buttons:** Fix | Accept | Save | Revert
- **Instruction box** (dark gray bg, red monospace text, red "info:" label)
  - Text: "Log a meal, AI estimates carbs & energy. Fix guesses, save."
- **Food log link:** opens user's Foodlog sheet

## Donate Popup ("Enjoyed?")
- Title: "Enjoyed?" + GitHub icon (🐙)
- Subtitle: "Wanna help us make it even better?"
- **Tiers:**
  1. $1 Donate — "a cup of ice cold natural orange juice!"
  2. $18 Say Hi — "chai—18 in gimatriya" (חי icon)
  3. I seriously wish to assist — custom input (default: $10,018, smiley)
- **Footer:** "Have remarks, questions, feature requests?" → "Contact us" link

## Contact Popup ("Talk to us")
- Text area for message
- SEND button (disabled if empty)
- Opens mailto: to pashute@gmail.com
- Close button

## AI Logic
- Parses meal text → estimates carbs & energy per item + totals
- Ambiguities marked with `?` (guess) or `???` (unclear)
- User can Fix (edit with suggested corrections) or Accept (confirm)

## Foodlog Sheet
- Auto-created in user's Google Drive on first access (if not exists)
- Columns: date, dow, time, carbs, calories, status, meal
- Rows prepended (newest first)
- Link to sheet always available in Settings

## Constraints
- Menu items hidden before login
- "Enter meal" disabled until all settings OK (visual gray)
- "Go to Diary" disabled until all settings OK (visual gray)
- Instruction boxes are reference text, not interactive
- Prototype mode: in-memory storage (state shared across tabs/users)
- Production mode: per-user KV storage (Cloudflare)

## Text Constants
All UI text lives in `infrastructure/texts.ts` (telegraphic style, minimal remarks)

## Future
- Cloudflare KV storage (per-user)
- GitHub Sponsors donor count
- Anonymous like button
- Internationalization
- Diary timestamp display: "minutes ago" updates every minute (stays fixed to app open time)
