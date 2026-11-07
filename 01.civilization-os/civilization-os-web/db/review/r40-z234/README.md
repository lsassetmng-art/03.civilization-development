# R40-Z234 — implementation staging package

Status: **review artifact, not a working authentication integration**.

Evidence: HEAD `d4eaaa94ed3e895f626e41ca9e9a305d5953f414`, clean worktree; PostgreSQL role `postgres` has `BYPASSRLS`; schema `civilization` CREATE privilege exists; no dedicated LifeOS handoff table was found. `auth.one_time_tokens` is not reused.

## Security gate

The DDL is intentionally not applied. `FORCE RLS` does not constrain a role with `BYPASSRLS`; the application must not use `postgres` for the handoff runtime. Before applying, approve a dedicated least-privilege DB role, narrow `SECURITY DEFINER` issue/consume routines with fixed `search_path`, origin/audience verification, PKCE S256, atomic consumption, and independent server-side session verification/revocation. A signed cookie alone does not automatically provide immediate logout revocation across origins.

## Acceptance tests

1. Authenticated CivilizationOS session can start handoff; unauthenticated cannot.
2. Portal receives only an allowlisted audience and redirect origin.
3. PKCE verifier/state must match, 120-second expiry enforced.
4. Concurrent duplicate redemption: exactly one success, all others rejected.
5. Forged URL identity and replay cannot establish a session.
6. Logout invalidates Portal session and prevents reuse; cross-origin logout semantics tested.
7. Playwright browser UI validates both valid and rejection flows with real backend, not mocked success.

## Delivery boundary

`stage.sh` creates a **new local Git worktree and branch**, copies this review SQL and README, and commits only these review artifacts. No database, production, main, or remote push modifications. It is not a complete R40-Z234 implementation.
