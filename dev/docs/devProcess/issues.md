### Filename issues.md
File version 0.2.1
Last updated: 2026-08-17

## 2026-08-24 Prototype Test Migration

- BDD suite failures: fixed. 
	- Fixed: prototype.feature mock.sheet scenario

- UI Jest suite previously failed because test files imported renamed `.ts`/`.tsx` source files through a broad `.js`/`.jsx` mapper.
	- Cause: the mapper also rewrote JavaScript imports inside third-party packages, including `react-is`.
	- Fixed: all test and feature-support files converted to `.ts`/`.tsx`; direct app imports updated.
	- Fixed: broad Jest extension mapper removed; framework JavaScript imports remain unchanged.
	- Fixed: UI configuration and mock sheet assertions use typed config metadata.

- Prototype stage ownership: `environment.isPrototype()` is the single lazy cached source; configuration reads it and does not expose another stage switch.

- Infrastructure unit suite passed on the prior run: 25 passed, 2 intentionally skipped.
	- The skipped tests require the pending live Google Sheet session and the superseded sheet integration contract.

- The latest combined command did not reach recorded unit or UI output after the BDD failures.
	- Exact BDD scenario names and stack traces were not retained in terminal output; a focused BDD rerun is required only if individual failing scenarios must be enumerated.

## 2026-08-24 Feature Suites Reached

- Ran: prototype feature suite; failures and undefined steps remain from old mock configuration and sheet scenarios.
- Ran: infrastructure AI feature suite; result details were not retained after the combined run.
- Ran: infrastructure configuration feature suite; result details were not retained after the combined run.
- Ran: infrastructure OAuth feature suite; result details were not retained after the combined run.
- Ran: infrastructure sheets feature suite; old step contract was identified and corrected afterward.
- Ran: infrastructure storage feature suite; result details were not retained after the combined run.
- Ran: screen diary, entry, setup, header, phone panel, and settings feature suites; result details were not retained after the combined run.

## 2026-08-26 Settings Async Test Waits

- Fixed async waits in `Settings.tsx`: AI-key status and sheet loading complete in effects after the initial render.
- `settings.test.tsx:31` — Fixed AI Key OK assertion by awaiting the loaded status.
- `settings.test.tsx:38` — Fixed AI Key Invalid assertion by awaiting the loaded status.
- `settings.test.tsx:91` — Fixed Go to Diary test by awaiting the enabled key and sheet state.
- `settings.test.tsx:99` — Fixed Google Sheets link test by awaiting the loaded sheet state.

