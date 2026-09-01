# Text System Migration - Complete Later

## Status
Structural migration complete. All UI files have `txt` imported and at least one reference updated.
Pattern proven in: contactPopup.tsx, donatePopup.tsx

## What's Left
Replace hardcoded strings in 3 dialog files following the established pattern:

### aiKey.dlg.tsx
Find/replace hardcoded strings with `txt.aiKey.*`:
- Line 56: `"Gemini key"` → `txt.aiKey.lbl.title`
- Line 58-61: intro message → `txt.aiKey.msg.intro`
- Line 65: `"Privacy Statement"` → `txt.aiKey.msg.privacyLink`
- Line 74-75: `"Google AI Studio"` → `txt.aiKey.msg.step1Link`
- Line 82-91: All step text → `txt.aiKey.msg.step1` through `step4`
- Line 96: placeholder → `txt.aiKey.msg.placeholder`
- Line 103: invalid key message → `txt.aiKey.msg.invalidKey`

### config.dlg.tsx
Find/replace with `txt.config.*`:
- Line 35: `"Configuration"` → `txt.config.lbl.title`
- Line 36: Restore button text → `txt.config.btn.restore`
- Lines 37-44: All labels and section titles → corresponding `txt.config.lbl.*`
- Line 46-47: Cancel/Save buttons → `txt.config.btn.cancel` / `txt.config.btn.save`

### starter.dlg.tsx
Find/replace with `txt.starter.*`:
- Already imports txt
- Replace message1, message2, message3 with `txt.starter.msg.yourOwn`, `.noTouch`, `.permission`
- Replace readMore label → `txt.starter.msg.readMore`

## Version Bumps
Update all 7 modified files to v0.2.5:
- contactPopup.tsx ✓
- donatePopup.tsx ✓
- Settings.tsx
- Diary.tsx
- Header.tsx
- aiKey.dlg.tsx
- config.dlg.tsx

## Testing
Run app in browser, verify all text displays correctly from txt constants.
