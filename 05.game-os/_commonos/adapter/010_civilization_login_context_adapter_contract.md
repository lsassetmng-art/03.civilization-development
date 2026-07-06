# GameOS Civilization Login Context Adapter Contract

## 1. Purpose

This file defines the GameOS-side receiving contract for CivilizationOS login context.

GameOS must not implement independent login for this handoff path. GameOS receives the safe login context produced by CivilizationOS and converts it into a GameOS-safe owner/player/session/locale view.

## 2. Ownership Boundary

- Portal owns entry, menu routing, initial locale, and return context.
- CivilizationOS owns login, session, and authenticated result.
- GameOS receives and uses safe CivilizationOS login context.
- PersonaOS remains the canonical owner of Persona truth.
- GameOS may keep game-local state, game-local relationship state, save data, runtime state, title state, and entitlement state.
- GameOS must not mutate PersonaOS canonical truth from this adapter.

## 3. Allowed Input Fields

GameOS may receive only these fields:

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

## 4. Forbidden Input Fields

GameOS must not receive, persist, log, normalize, or forward these fields:

- password
- accessToken
- refreshToken
- clientSecret
- OAuth secret
- DB URL
- PERSONA_DATABASE_URL
- DATABASE_URL
- service_role key
- private key

## 5. Required Normalization

The adapter must normalize only safe string fields.

Rules:

- civilizationId: trim when string.
- owner: trim when string.
- sessionRef: trim when string; optional.
- requestedOsCode: trim when string; optional.
- returnTo: trim when string; optional.
- afterLoginPath: trim when string; optional.
- issuedAt: trim when string; optional.
- expiresAt: trim when string; optional.
- localeCode: accept only supported Civilization locale codes; fallback must be explicit.
- languageCode: derive from localeCode when absent or inconsistent.

## 6. Identity Rules

The context has GameOS identity only when both fields are non-empty:

- civilizationId
- owner

GameOS must not treat sessionRef alone as identity.

## 7. Expiration Rules

- If expiresAt is absent, the context is not expired by this adapter.
- If expiresAt is invalid, the context is expired.
- If expiresAt is earlier than the current time, the context is expired.
- Expired context must not unlock GameOS owner-scoped operations.

## 8. GameOS Safe View

The adapter should expose a GameOS-safe view equivalent to:

GameOSCivilizationContext fields:

- civilizationId
- owner
- playerOwner
- sessionRef
- localeCode
- languageCode
- requestedOsCode
- returnTo
- afterLoginPath
- issuedAt
- expiresAt
- hasIdentity
- isExpired
- trustStatus

Where:

- playerOwner is derived from owner.
- hasIdentity requires civilizationId and owner.
- isExpired follows expiration rules.
- trustStatus must not claim authentication unless backed by CivilizationOS session verification.

## 9. GameOS Usage

GameOS may use this context for:

- player owner boundary
- save data owner boundary
- title data owner boundary
- entitlement owner boundary
- runtime display language
- game UI language
- return routing after login
- requested OS routing

GameOS must not use this context for:

- password verification
- OAuth token handling
- refresh token handling
- DB connection
- service role access
- PersonaOS canonical mutation

## 10. First Implementation Constraint

The first implementation must be adapter-only.

Allowed first patch:

- add this adapter contract file
- add static validation/report script if needed

Disallowed first patch:

- DB connection
- DB write
- DDL
- API POST
- OAuth callback modification
- runtime mutation
- PersonaOS canonical mutation
- broad git add
