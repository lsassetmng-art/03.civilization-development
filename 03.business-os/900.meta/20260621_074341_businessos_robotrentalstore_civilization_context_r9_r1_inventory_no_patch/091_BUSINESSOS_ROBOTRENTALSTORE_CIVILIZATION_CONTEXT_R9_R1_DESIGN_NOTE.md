# BusinessOS RobotRentalStore Civilization Context R9_R1 Inventory Design Note

## Status

Inventory only. No patch.

## Retry note

R9 failed because the README canonical-context check used an overly strict exact phrase.
R9_R1 accepts equivalent canonical wording.

## Boundary

- BusinessOS only
- RobotRentalStore only
- CivilizationOS login/session context remains canonical
- BusinessOS adapter remains consumer-only
- AICompanyManager is excluded
- AIWorkerOS runtime/queue is excluded
- Portal/CivilizationOS are not patched

## Current observation

- RobotRentalStore files inventoried: 64
- HTML entrypoints: 3
- API/server signal lines: 0
- fetch/form signal lines: 0
- locale/i18n signal lines: 0
- context signal lines: 0
- storage/url signal lines: 0
- helper import signal lines: 0
- contract flow signal lines: 0
- target candidate files: 3
- API endpoint candidate lines: 24

## Likely R10 design direction

R10 should be design-only first.

Recommended R10 target decision:

1. UI side reads CivilizationOS context via BusinessOS consumer adapter or a safe browser bridge.
2. API side accepts safe CivilizationOS-derived headers:
   - x-civilization-id
   - x-owner
   - x-civilization-session-ref
   - x-locale-code
   - x-language-code
   - x-requested-os-code
   - x-return-to
   - x-after-login-path
3. API remains parse-only:
   - trustStatus = parsed_only_not_authenticated
   - no session verification
   - no auth enforcement
4. UI may use localeCode/languageCode for display language only.
5. Contract/application actions may attach context to request metadata later, but no DB/RLS/session validation in the first wiring patch.

## Forbidden in R10/R11 unless explicitly approved

- AICompanyManager login wiring
- AIWorkerOS queue/runtime integration
- CivilizationOS session verification
- DB writes
- RLS changes
- Portal patch
- CivilizationOS patch
- broad git add
