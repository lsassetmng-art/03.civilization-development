# Civilization 4OS menu delivery

Read-only static HTTP delivery for BusinessOS, GameOS, StreamingOS and StaticArtOS.
Requires Node.js 20 or newer and the full repository checkout.

R21 REQUIRED: deploy the Portal GET /api/portal/menu-identity identity verifier on the same host.
Run (trusted loopback only): OS_MENU_AUTH_VERIFY_ORIGIN=http://127.0.0.1:<PORTAL_PORT> OS_MENU_DELIVERY_PORT=8787 node 00.civilization-deployment/civilization-os-menu-delivery/server.mjs
The delivery service fails closed if identity verification is unavailable. The four OS menu HTML/JS/CSS remain OS-owned. OS-specific API authorization remains separately mandatory.

For local Gateway opt-in, set the following four targets to os and all four origins to http://127.0.0.1:8787:
BUSINESSOS_ROUTE_TARGET, GAMEOS_ROUTE_TARGET, STREAMINGOS_ROUTE_TARGET, STATICARTOS_ROUTE_TARGET;
BUSINESSOS_WEB_UPSTREAM_ORIGIN, GAMEOS_WEB_UPSTREAM_ORIGIN, STREAMINGOS_WEB_UPSTREAM_ORIGIN, STATICARTOS_WEB_UPSTREAM_ORIGIN.

The Gateway preserves request paths. To roll back, set those four route targets to portal and restart Gateway. LifeOS, PersonaOS and AIWorkerOS remain unchanged. Production routing requires separate authorization.
