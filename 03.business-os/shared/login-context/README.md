# BusinessOS Login Context Foundation

## Scope

BusinessOS only.

This module is a parse-only foundation for receiving CivilizationOS login context.

It does not make BusinessOS a login authority.

## Authority boundary

- Login authority: CivilizationOS
- Entry and routing seed: Portal
- Consumer: BusinessOS

## Allowed context fields

- civilizationId
- owner
- sessionRef
- localeCode
- languageCode
- requestedOsCode
- returnTo
- afterLoginPath
- issuedAt
- expiresAt

Compatibility aliases are normalized where needed.

## Locale rule

- localeCode: ja-jp or en-us
- languageCode: ja or en

Unknown locale input falls back to ja-jp / ja.

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

## Current R2 behavior

- Parse only
- Normalize only
- Redact logs
- Detect forbidden auth secret fields
- No app consumer wiring
- No DB
- No API POST
