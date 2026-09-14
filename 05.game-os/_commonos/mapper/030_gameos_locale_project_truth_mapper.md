# GameOS Locale Project Truth Mapper Skeleton

## Purpose

Provide a storage-neutral GameOS locale resolver for Phase1 Builder Foundation.

This skeleton is derived from the GameOS locale project truth mapper contract and is not a runtime implementation, database migration, API endpoint, or Portal language setting surface.

## Inputs

- loginContext.localeCode
- loginContext.languageCode
- projectTruth.defaultLocale
- projectTruth.supportedLocales
- projectTruth.currentLocale

## Canonical locale values

- ja-jp
- en-us

## Fallback

- ja-jp

## Resolution precedence

1. projectTruth.currentLocale
2. projectTruth.defaultLocale
3. loginContext.localeCode
4. loginContext.languageCode mapped to canonical locale
5. GameOS fallback locale

## Conceptual functions

- normalizeGameOSLocale(value)
- mapLanguageCodeToGameOSLocale(languageCode)
- resolveGameOSProjectLocale(loginContext, projectTruth)
- ensureGameOSSupportedLocale(locale, supportedLocales)

## Output shape

- currentLocale
- defaultLocale
- supportedLocales
- source
- fallbackUsed

## Ownership

- Portal owns language setting surface.
- CivilizationOS owns login/session result.
- GameOS owns project locale truth and display resolution.
- PersonaOS owns canonical Persona truth.

## Forbidden behavior

- Do not write Portal language settings.
- Do not mutate CivilizationOS session.
- Do not write PersonaOS canonical truth.
- Do not store password, accessToken, refreshToken, clientSecret, OAuth secret, DB URL, service_role, or private key.
- Do not perform DB write.
- Do not call API POST.
