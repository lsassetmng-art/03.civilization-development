# AICompanyManager rebuild plan

## Problem

Current production UI has become patch-stacked:
- multiple company state owners
- multiple bridge/guard/save clients
- duplicate click handlers
- old localStorage and v2 DB mixed
- debug surfaces mixed with production logic
- server routes layered by patches

This caused:
- AI企業 selection reverting
- department save using legacy company_id
- raw DATABASE_URL leak in alert
- white screen risk
- maintenance difficulty

## Decision

Stop patching.

Rebuild production UI path.

## Phase 1: Freeze and inventory

Current phase.
No modify.

## Phase 2: Create clean production core next to current JS

Create:
assets/js/aicm-production-core.js

Do not load it yet.

It must contain:
- state owner
- API client
- renderer
- action dispatcher
- error presenter

## Phase 3: Create clean server v2 API block

Create or consolidate:
server v2 API routes

One handler for:
- context
- company create
- department create
- section create
- placement create later

No raw psql error to browser.

## Phase 4: Switch index to clean production core

Stop loading:
- old company bridge
- old save client broad handlers
- old debug cards
- old exact sync panels
- old rescue overlays
- old localStorage compatibility layers

Keep only:
- CSS
- clean production core
- required AIWorker connector only if proven necessary

## Phase 5: Verify

Manual UI:
1. start empty v2 context
2. create company
3. create department
4. create section
5. reload
6. select company
7. confirm no legacy company
8. confirm no raw DB URL in errors

## Phase 6: Archive old patch files

No delete.
Move to archive after verification.
