# BusinessOS Multilingual Contract UI R1 Exact Design

## Scope
BusinessOS / RobotRentalStore only.
Multilingual UI only.

## Target files
- ui/static/index.html
- ui/static/contracts.html
- ui/static/application-contracts.html

## Out of scope
- CivilizationOS login/session
- Portal common i18n
- AIWorkerOS output translation
- PersonaOS
- DB schema
- RLS
- API POST/write
- pricing or contract business logic

## Fixed locale contract
- canonical localeCode: ja-jp | en-us
- compatibility languageCode: ja | en
- internal UI language may be ja | en
- default localeCode: ja-jp

## BusinessOS responsibility
BusinessOS reads locale and renders labels.
BusinessOS does not own global language settings or login session.

## Locale read priority
1. URL locale_code
2. URL localeCode
3. URL language_code
4. URL languageCode
5. window.localeCode / window.__LOCALE_CODE__
6. window.languageCode / window.__LANGUAGE_CODE__
7. localStorage portal.locale
8. localStorage portal.language
9. localStorage civilization.portal.locale
10. navigator.language
11. default ja-jp

## Normalization
- ja, ja-JP, ja_jp, ja-jp => ja-jp
- en, en-US, en_us, en-us => en-us
- unknown => ja-jp

## Implementation decision
Use inline i18n helper in each target HTML.

Reason:
- Portal route serves raw HTML.
- External relative helper files may resolve under Portal route.
- Inline helper keeps this BusinessOS-only and avoids Portal common patch.

## API policy
Do not translate API machine fields or error codes.
Translate UI labels only.

Stable API examples:
- contract_status
- payment_status
- grant_status
- application_contract_not_found
- invalid_contract_status

## Translation policy
Meaning-first translation for contract/payment/legal-sensitive wording.

Examples:
- 申込確定済み => Application confirmed
- 利用終了 => End use / Ended, depending on context
- 権限 => Entitlement
- 明細 => Line items or Details, depending on context

## Phase plan
R2: add inline i18n core/dictionary scaffolding to target HTML files.
R3: apply multilingual labels to rental UI.
R4: apply multilingual labels to contract viewer UIs.
R5: UI-centered E2E.
R6: commit readiness.
R7: commit/push.
