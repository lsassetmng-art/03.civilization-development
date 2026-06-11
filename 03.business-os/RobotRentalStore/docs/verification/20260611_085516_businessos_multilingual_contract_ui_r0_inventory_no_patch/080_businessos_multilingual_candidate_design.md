# BusinessOS Multilingual Contract UI R0 Candidate Design

## Scope
BusinessOS / RobotRentalStore only.

## Target UIs
- RobotRentalStore rental/purchase UI
- AI Worker契約閲覧
- アプリケーション契約閲覧

## Locale contract to adopt
- canonical localeCode: ja-jp | en-us
- compatibility languageCode: ja | en
- internal UI dictionary may use ja / en
- external/session/API handoff should use localeCode

## Recommended BusinessOS implementation shape
1. Add UI-only i18n helper in RobotRentalStore static layer.
2. Normalize locale:
   - ja, ja-JP, ja_jp -> ja-jp
   - en, en-US, en_us -> en-us
3. Derive UI language:
   - ja-jp -> ja
   - en-us -> en
4. Read priority:
   - URL locale_code
   - window.localeCode / window.__LOCALE_CODE__
   - localStorage portal.locale
   - localStorage portal.language
   - navigator.language
   - default ja-jp
5. Keep API contract stable.
6. Do not translate legal/contract/payment wording mechanically.
7. No DB/RLS/session migration in BusinessOS R2/R3.

## Translation policy
- Meaning-first for contract/payment/status labels.
- Avoid changing DB status codes.
- Display labels can be translated.
- API error codes remain stable machine-readable English snake_case.

## Candidate phases
- R1: exact design / no patch
- R2: shared static i18n helper/dictionary
- R3: RobotRentalStore rental UI multilingual patch
- R4: contract viewer UIs multilingual patch
- R5: UI-centered E2E
- R6: commit readiness
- R7: commit/push
