# GameOS Builder Foundation Project Truth Contract

## 1. Purpose

This contract defines the GameOS Phase1 Builder Foundation and Project Truth boundary.

It is not a runtime implementation.
It is not a database migration.
It is not an API endpoint.
It is not a PersonaOS mutation path.

## 2. Upstream Context

GameOS may receive safe session context from the Civilization Login Context adapter.

Required usable context fields:

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

The Login Context provides identity and locale input only.
It does not define GameOS project truth.

## 3. GameOS-Owned Truth

GameOS owns the following Builder Foundation records conceptually:

- game_workspace
- game_project
- game_project_revision
- game_autosave_snapshot
- game_template_profile
- game_runtime_profile

These names describe GameOS truth objects.
This contract does not require a database table to exist yet.

## 4. Minimum Project Identity

A GameOS project must have a stable identity independent from display text.

Minimum identity fields:

- projectId
- workspaceId
- owner
- createdByCivilizationId
- latestRevisionId
- status
- createdAt
- updatedAt

## 5. Minimum Revision Identity

A GameOS project revision must have stable identity and basis.

Minimum revision fields:

- revisionId
- projectId
- revisionNumber
- basisRevisionId
- createdByCivilizationId
- createdAt
- summary
- validationStatus

## 6. Locale Fields

Phase1 must preserve locale truth at project level.

Minimum locale fields:

- defaultLocale
- supportedLocales
- currentLocale
- localeCode
- languageCode
- localizedTitle
- localizedDescription

The localeCode and languageCode values come from login context.
The defaultLocale and supportedLocales values belong to GameOS project truth.

## 7. Builder Surfaces

Phase1 Builder UI surfaces:

- Builder Home
- Template Gallery
- Project Overview
- Project Create
- Project Open

These surfaces may read project truth.
They must not create independent authentication truth.

## 8. Forbidden Behavior

GameOS Builder Foundation must not:

- store password
- store accessToken
- store refreshToken
- store clientSecret
- store OAuth secret
- store DB URL
- store service_role key
- write PersonaOS canonical truth
- bypass CivilizationOS login/session boundary
- perform API POST from this contract
- perform DB write from this contract

## 9. Completion Criteria

Phase1 is complete when:

- a creator can create a project
- a creator can reopen the project
- latest revision identity is stable
- project summary loads from GameOS truth
- locale basis is preserved
- no PersonaOS canonical mutation is required
