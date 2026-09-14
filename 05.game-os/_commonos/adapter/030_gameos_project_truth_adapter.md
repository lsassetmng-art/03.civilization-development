# GameOS Project Truth Adapter Skeleton

## Purpose

Provide a storage-neutral adapter shape for GameOS Phase1 project truth.

This skeleton defines adapter boundaries only. It does not connect to DB, write DB records, call API POST, or activate runtime launcher behavior.

## Upstream safe login context fields

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

## GameOS project truth snapshot

- workspaceId
- projectId
- latestRevisionId
- owner
- createdByCivilizationId
- status
- createdAt
- updatedAt
- defaultLocale
- supportedLocales
- currentLocale
- localizedTitle
- localizedDescription

## GameOS revision snapshot

- revisionId
- projectId
- revisionNumber
- basisRevisionId
- createdByCivilizationId
- createdAt
- summary
- validationStatus

## Conceptual functions

- buildInitialGameOSProjectTruth(input)
- buildGameOSRevisionSnapshot(input)
- summarizeGameOSProjectTruth(snapshot)
- validateGameOSProjectTruthShape(snapshot)

## Adapter boundary

- Accept safe login context.
- Produce GameOS-owned project truth shape.
- Preserve locale fields.
- Preserve owner/civilization identity.
- Keep PersonaOS canonical truth separate.

## Forbidden behavior

- Do not store password, accessToken, refreshToken, clientSecret, OAuth secret, DB URL, service_role, or private key.
- Do not perform DB write.
- Do not call API POST.
- Do not mutate PersonaOS canonical truth.
- Do not mutate Portal language settings.
- Do not mutate CivilizationOS session state.
