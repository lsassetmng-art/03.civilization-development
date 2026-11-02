# Civilization 4OS menu delivery

Read-only static HTTP delivery for BusinessOS, GameOS, StreamingOS and StaticArtOS.
Requires Node.js 20 or newer and the full repository checkout.

Run: OS_MENU_DELIVERY_PORT=8787 node 00.civilization-deployment/civilization-os-menu-delivery/server.mjs

For local Gateway opt-in, set the following four targets to os and all four origins to http://127.0.0.1:8787:
BUSINESSOS_ROUTE_TARGET, GAMEOS_ROUTE_TARGET, STREAMINGOS_ROUTE_TARGET, STATICARTOS_ROUTE_TARGET;
BUSINESSOS_WEB_UPSTREAM_ORIGIN, GAMEOS_WEB_UPSTREAM_ORIGIN, STREAMINGOS_WEB_UPSTREAM_ORIGIN, STATICARTOS_WEB_UPSTREAM_ORIGIN.

The Gateway preserves request paths. To roll back, set those four route targets to portal and restart Gateway. LifeOS, PersonaOS and AIWorkerOS remain unchanged. Production routing requires separate authorization.

## M6-R1 health and readiness

The 4OS delivery server owns GET/HEAD /healthz and /readyz.

- /healthz: HTTP 200 process liveness.
- /readyz: HTTP 200 when all 16 required menu files exist.
- /readyz: HTTP 503 when required files are unavailable.
- Responses: no-store and nosniff.
- Unsupported methods: HTTP 405.

The Gateway does not own these paths.
LifeOS, PersonaOS and CivilizationOS authentication remain unchanged.

Production routing, TLS, hosting and login require separate
validation and explicit GO.

Rollback: restore the four OS route targets to portal
through the approved deployment procedure.

## M6-R1 R4 readiness regression

createServer accepts an optional readinessDirectories argument
for isolated test injection. The default remains all four
production menu directories.

The HTTP regression checks 503 on missing readiness files,
including HEAD without a response body. Liveness remains 200.

The R4 GitHub Actions workflow executes Gateway contracts,
delivery contracts, health tests and the real Chromium mobile
UI test through the Gateway.

This does not authorize production routing changes.
