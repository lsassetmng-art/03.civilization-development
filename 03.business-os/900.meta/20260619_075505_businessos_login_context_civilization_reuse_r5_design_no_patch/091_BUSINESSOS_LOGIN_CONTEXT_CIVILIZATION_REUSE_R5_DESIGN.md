# BusinessOS Login Context Civilization Reuse R5 Design

## Corrected architecture

Login context is not OS-specific.

Canonical login/session context is owned by CivilizationOS.

BusinessOS must reuse CivilizationOS login context and must not create a separate BusinessOS login context schema.

## Correct naming

The current file name may remain for compatibility:

- shared/login-context/businessos-login-context.mjs

But its architectural meaning must be clarified as:

- BusinessOS-side consumer adapter for CivilizationOS login context

Not:

- BusinessOS-owned login authority
- BusinessOS-specific login context schema
- BusinessOS session authority

## Canonical context fields

These are reused across OS consumers:

- civilizationId
- owner
- sessionRef
- localeCode
- languageCode
- issuedAt
- expiresAt

## Consumer routing fields

These may differ by OS/app because they are routing hints, not login-context identity:

- requestedOsCode
- returnTo
- afterLoginPath

## BusinessOS-specific rule

AICompanyManager is a system/internal non-public app.

Therefore:

- AICompanyManager should not be treated as a login-context consumer by default.
- AICompanyManager should not be login-required by this work.
- AICompanyManager should not be patched in RobotRentalStore login-context work.
- AIWorkerOS queue/runtime integration is out of scope.

## RobotRentalStore rule

RobotRentalStore is the first user-facing BusinessOS target for future login-context consumer wiring.

R6 must not wire RobotRentalStore yet unless explicitly scoped.
R6 should only align helper/README wording and read-priority semantics.

## R6 patch target

Allowed files:

- 03.business-os/shared/login-context/businessos-login-context.mjs
- 03.business-os/shared/login-context/README.md
- 03.business-os/900.meta/*businessos_login_context_civilization_reuse_r6*

No app consumer wiring.

## R6 required changes

### README

Clarify that:

- CivilizationOS login context is canonical.
- BusinessOS uses a thin consumer adapter.
- OS-specific login-context schemas are forbidden.
- AICompanyManager is excluded from login wiring by default.
- RobotRentalStore is the future user-facing target.
- `businessos.loginContext` and `BusinessOSLoginContext` are compatibility-only, not canonical.

### Helper

Do not rename exported functions in R6, to avoid breaking consumer imports.

Keep:

- businessosNormalizeLocaleCode
- businessosLocaleCodeToLanguageCode
- businessosNormalizeLoginContext
- businessosReadLoginContextFromBrowser
- businessosReadLoginContextFromRequestLike
- businessosRedactLoginContextForLog
- businessosContainsForbiddenAuthSecret

Add or clarify comments:

- This module is a BusinessOS consumer adapter for CivilizationOS login context.
- It is parse-only.
- It is not a login authority.
- It does not validate CivilizationOS sessionRef.
- It does not create a BusinessOS-specific login schema.

### Browser read priority

R6 should prefer CivilizationOS canonical surfaces over BusinessOS compatibility surfaces:

1. URL search params
2. window.CivilizationLoginContext
3. localStorage civilization.loginContext
4. window.BusinessOSLoginContext as compatibility-only
5. localStorage businessos.loginContext as compatibility-only
6. empty fallback

URL search params remain first because Portal/CivilizationOS routing may pass context in the URL during development or bridge mode.

### Request-like read priority

Request-like adapter remains generic but should be documented as consuming CivilizationOS-derived headers:

- x-civilization-id
- x-civilization-session-ref
- x-locale-code
- x-language-code

`x-business-owner` may remain compatibility alias only if owner header is needed during BusinessOS app routing.

## R6 verification

- helper syntax OK
- behavior tests updated for Civilization-first priority
- no app consumer wiring
- no AICompanyManager references introduced except README boundary statement
- no DB/API POST
- no git commit/push in R6 unless separately approved
