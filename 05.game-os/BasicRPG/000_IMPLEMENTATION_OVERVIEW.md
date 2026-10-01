# ============================================================
# BASIC RPG IMPLEMENTATION OVERVIEW
# ============================================================

status: active
system: civilization-development
os: game-os
application: BasicRPG
owner: Boss
prepared_by: Zero

purpose:
Implementation workspace for GameOS BasicRPG and Builder surfaces.

current_phase:
- M01 Builder Foundation

M01 responsibilities:
- canonical project-create boundary
- workspace/runtime/template basis resolution
- initial revision seed
- idempotent create semantics
- Builder Home
- Template Gallery
- Project Overview
- project reopen/read basis

workspace ownership:
- 010.web: Builder web surface, local server/proxy, UI interaction tests
- 020.shared-js: storage-neutral Builder domain validation/mapping
- 030.android: Android surface; out of R26 M01 scope
- 040.supabase: GameOS M01 schema migration source and Edge Function source
- 050.assets: static assets; out of R26 M01 scope
- 900.meta: implementation metadata

deployment rule:
Database migrations and Edge Functions are source artifacts only in R26.
R26 must not connect to or mutate a live database.

acceptance:
- TC-GAME-001
- TC-GAME-002
- TC-GAME-003

next_handoff:
M02 may begin only after M01 create/reopen/idempotency gates pass.
