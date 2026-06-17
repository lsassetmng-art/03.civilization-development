# BusinessOS Login Context Multilingual R1 Design

## Scope

BusinessOS only.

This design prepares BusinessOS to receive CivilizationOS login context.
It does not make BusinessOS a login authority.

## R0 conclusion

BusinessOS currently has no implemented login/session/owner/locale context signal.

Therefore the first patch must be a small BusinessOS-side foundation, not consumer wiring.

## Source of truth

- Login authority: CivilizationOS
- Entry / routing / locale seed: Portal
- Consumer: BusinessOS
- Shared UI/adapter future candidate: CommonOS

BusinessOS must not duplicate CivilizationOS login.

## Minimal context contract

BusinessOS may accept only this shape:

type BusinessOSLoginContext = {
  civilizationId: string;
  owner: string;
  sessionRef?: string;
  localeCode: "ja-jp" | "en-us";
  languageCode: "ja" | "en";
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
  issuedAt?: string;
  expiresAt?: string;
};

## Allowed inbound fields

- civilizationId
- owner
- sessionRef
- sessionId, only as compatibility alias converted to sessionRef
- localeCode
- locale_code, only as compatibility alias converted to localeCode
- languageCode
- language_code, only as compatibility alias converted to languageCode
- requestedOsCode
- requested_os_code, only as compatibility alias converted to requestedOsCode
- returnTo
- return_to, only as compatibility alias converted to returnTo
- afterLoginPath
- after_login_path, only as compatibility alias converted to afterLoginPath
- issuedAt
- expiresAt

## Forbidden inbound fields

BusinessOS must reject or strip these:

- password
- passwd
- accessToken
- access_token
- refreshToken
- refresh_token
- clientSecret
- client_secret
- serviceRoleKey
- service_role
- privateKey
- private_key
- DATABASE_URL
- PERSONA_DATABASE_URL
- Authorization bearer token as persisted context

## Locale rule

Canonical:
- localeCode: ja-jp | en-us

Compatibility:
- languageCode: ja | en

Normalization:
- ja, ja-JP, ja_jp, ja-jp => ja-jp / ja
- en, en-US, en_us, en-us => en-us / en
- unknown => ja-jp / ja

## Trust rule

R2 foundation is parse-only.

BusinessOS may parse the context, but must mark it as not authenticated.
Authorization/session validation must be a later step against CivilizationOS/session authority.

Recommended internal metadata:

type BusinessOSLoginContextEnvelope = {
  context: BusinessOSLoginContext;
  source: "url" | "window" | "localStorage" | "header" | "cookie" | "object" | "empty";
  trustStatus: "parsed_only_not_authenticated";
  warnings: string[];
};

## R2 target files

Create new BusinessOS shared foundation:

- 03.business-os/shared/login-context/businessos-login-context.mjs
- 03.business-os/shared/login-context/README.md

R2 must not patch:
- RobotRentalStore UI
- AICompanyManager UI/API
- DB
- Portal
- CivilizationOS
- AIWorkerOS
- PersonaOS

## R2 helper API

businessos-login-context.mjs should export:

- BUSINESSOS_LOGIN_CONTEXT_ALLOWED_LOCALE_CODES
- BUSINESSOS_LOGIN_CONTEXT_ALLOWED_LANGUAGE_CODES
- businessosNormalizeLocaleCode(input)
- businessosLocaleCodeToLanguageCode(localeCode)
- businessosNormalizeLoginContext(raw, options)
- businessosReadLoginContextFromBrowser(globalObject)
- businessosReadLoginContextFromRequestLike(requestLike)
- businessosRedactLoginContextForLog(value)
- businessosContainsForbiddenAuthSecret(value)

## Browser read priority

For future UI consumers, read order should be:

1. URL search params
2. window.BusinessOSLoginContext
3. window.CivilizationLoginContext
4. localStorage businessos.loginContext
5. localStorage civilization.loginContext
6. fallback empty parsed context

## Request-like read priority

For future API consumers, read order should be:

1. explicit object body/context field if already parsed by caller
2. x-civilization-id
3. x-business-owner
4. x-civilization-session-ref
5. x-locale-code
6. x-language-code
7. query-like params if provided by caller

Do not read raw OAuth tokens.

## R2 verification requirements

- helper file exists
- README exists
- no app consumer behavior changed
- no DB/API POST
- no git write
- locale normalization tests via node
- forbidden secret key detection tests via node
- redaction tests via node
- API syntax for existing BusinessOS known API remains OK if file exists
- no secret literals in staged candidate content
