# GameOS Locale Project Truth Mapper Contract

## 1. Purpose

This contract defines how GameOS maps login locale context into GameOS project truth.

## 2. Inputs

Allowed context inputs:

- localeCode
- languageCode

Optional project inputs:

- defaultLocale
- supportedLocales
- currentLocale

## 3. Normalization

GameOS should normalize locale values before using them in Builder or Runtime display.

Recommended canonical locale values:

- ja-jp
- en-us

Recommended internal short language values:

- ja
- en

## 4. Precedence

Locale resolution order:

1. explicit project currentLocale
2. project defaultLocale
3. login context localeCode
4. login context languageCode mapped to default region
5. GameOS fallback locale

## 5. Fallback

Fallback must be deterministic.

Recommended fallback:

- ja-jp

## 6. Project Truth

GameOS project truth owns:

- defaultLocale
- supportedLocales
- currentLocale
- localizedTitle
- localizedDescription

## 7. Non-Ownership

Portal owns the language setting surface.
CivilizationOS owns session/auth result.
GameOS owns GameOS display and project text resolution.
PersonaOS owns Persona canonical truth.

## 8. Forbidden Behavior

The mapper must not:

- write Portal language settings
- write CivilizationOS session
- write PersonaOS canonical truth
- store secrets
- call API POST
- perform DB write
