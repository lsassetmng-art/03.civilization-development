# Civilization Web Gateway

Status: R4_R3 initial implementation.

This package implements the shared same-origin deployment boundary
defined by:

00.civilization-deployment/010_CIVILIZATION_WEB_GATEWAY_EXACT_DESIGN.md

## Ownership

Owner:

CIVILIZATION_WEB_DEPLOYMENT

The gateway is not owned by Portal, PersonaOS, CivilizationOS,
CommonOS, or CommonUIRuntime.

## Runtime

The implementation uses only Node.js standard-library modules.

No third-party runtime dependency is required.

## Required environment variables

CIVILIZATION_WEB_GATEWAY_HOST

CIVILIZATION_WEB_GATEWAY_PORT

CIVILIZATION_PORTAL_UPSTREAM_ORIGIN

PERSONAOS_WEB_UPSTREAM_ORIGIN

PERSONAOS_ROUTE_TARGET

PERSONAOS_ROUTE_TARGET accepts only:

portal

persona

Invalid or missing configuration fails startup.

## Routing

When PERSONAOS_ROUTE_TARGET is persona:

/persona-menu

and every path beginning with:

/persona-menu/

are sent to PersonaOS.

All other paths are sent to Portal.

/persona-menu-other does not match the Persona namespace.

When PERSONAOS_ROUTE_TARGET is portal, every request including the
Persona namespace is sent to Portal.

## Path preservation

The gateway preserves the original request URL when forwarding.

The /persona-menu prefix is not stripped.

This is required because PersonaOS owns:

basePath=/persona-menu

## Failure behavior

When target is persona and the PersonaOS upstream cannot be reached,
the gateway returns HTTP 502.

It does not automatically retry the request against Portal Persona.

Changing PERSONAOS_ROUTE_TARGET back to portal is an explicit
pre-removal rollback action, not automatic failover.

## Authentication boundary

CivilizationOS remains authentication owner.

The gateway forwards request context but does not issue, refresh,
translate, or validate application identity.

## Local validation reference topology

Reference-only loopback topology:

Gateway:
127.0.0.1:18080

Portal:
127.0.0.1:18081

PersonaOS:
127.0.0.1:18082

The automated contract test uses loopback-only ephemeral ports to
avoid collision with existing local processes.

## Commands

Syntax check:

node --check server.mjs

Contract test:

node --test tests/gateway-contract.test.mjs

Start gateway after supplying required environment configuration:

node server.mjs

R4_R3 implementation does not itself authorize production startup,
hosting changes, DNS changes, Portal route removal, or public
traffic switching.
