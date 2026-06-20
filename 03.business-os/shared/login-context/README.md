# BusinessOS Login Context Consumer Adapter

## Scope

BusinessOS only.

This module is a BusinessOS-side consumer adapter for the canonical CivilizationOS login/session context.

It does not define a BusinessOS-specific login context.
It does not make BusinessOS a login authority.
It does not validate CivilizationOS sessionRef.
It does not make any app login-required by itself.

## Authority boundary

- Login/session authority: CivilizationOS
- Entry and routing seed: Portal
- Consumer adapter: BusinessOS
- User-facing BusinessOS target for later wiring: RobotRentalStore

## Non-public system app boundary

AICompanyManager is a system/internal non-public app.

Therefore, by default:

- AICompanyManager is excluded from BusinessOS login-context wiring.
- AICompanyManager is not made login-required by this adapter.
- AICompanyManager to AIWorkerOS queue/runtime integration is out of scope.

## Canonical context fields

These fields come from CivilizationOS login/session context and should not become OS-specific schemas:

- civilizationId
- owner
- sessionRef
- localeCode
- languageCode
- issuedAt
- expiresAt

## Consumer routing fields

These fields are routing hints and may differ by OS/app:

- requestedOsCode
- returnTo
- afterLoginPath

## Locale rule

- localeCode: ja-jp or en-us
- languageCode: ja or en

Unknown locale input falls back to ja-jp / ja.

## Browser read priority

1. URL search params
2. window.CivilizationLoginContext
3. localStorage civilization.loginContext
4. window.BusinessOSLoginContext as compatibility-only
5. localStorage businessos.loginContext as compatibility-only
6. empty fallback

## Request-like read priority

The request adapter consumes CivilizationOS-derived headers where present:

- x-civilization-id
- x-owner
- x-civilization-session-ref
- x-locale-code
- x-language-code
- x-requested-os-code
- x-return-to
- x-after-login-path
- x-issued-at
- x-expires-at

`x-business-owner` and `x-session-ref` are compatibility aliases only.

## Trust rule

Every parsed context is returned with:

trustStatus = parsed_only_not_authenticated

Session validation and authorization must be implemented later against CivilizationOS/session authority.

## Forbidden data

Do not store or propagate:

- password
- OAuth access token
- OAuth refresh token
- OAuth client secret
- service role key
- private key
- DB connection string
- bearer token as persisted context

## Current behavior

- Parse only
- Normalize only
- Redact logs
- Detect forbidden auth secret fields
- Prefer CivilizationOS canonical context surfaces
- Accept BusinessOS-named surfaces only for compatibility
- No app consumer wiring
- No DB
- No API POST
