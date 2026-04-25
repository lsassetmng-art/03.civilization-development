# ============================================================
# STREAMING OS PHASE1 ALL-IN-ONE V3
# ============================================================

status: generated
system: StreamingOS
owner: Boss
prepared_by: Zero
implemented_bundle: phase1_all_in_one_v3
watch_integrated_basis: replaced_in_this_chat
studio_integrated_basis: 00_STREAM_STUDIO_INTEGRATED.md
schema: streaming
db_target: PERSONA_DATABASE_URL

roadmap:
  current_bundle:
    - StreamStudio phase1 starter implementation
    - StreamStudio starter SQL / seed / verify
    - StreamStudio starter web / edge function
    - StreamWatch phase1 starter implementation based on updated integrated
    - StreamWatch phase1 SQL / seed / verify
    - StreamWatch viewer web / edge starter
    - root apply-all / verify-all runners
  next_bundle:
    - StreamStudio request/response exact payload hardening
    - StreamWatch request/response exact payload hardening
    - shared auth/session stub and BFF gateway alignment
    - viewer/creator cross-link routing polish

fixed_rules:
- implementation root is ~/03.civilization-development/06.streaming-os
- StreamStudio path is ~/03.civilization-development/06.streaming-os/StreamStudio
- StreamWatch path is ~/03.civilization-development/06.streaming-os/StreamWatch
- database target is PERSONA_DATABASE_URL
- schema is streaming
- SQL is additive only
- SQL requires Sato (DB) review before production apply
- favorites and watch later remain protected interpretation in Watch phase1
- TV route handoff is distinct from same-device large-screen mode
- Studio phase1 excludes marketplace, membership-manager, settlement, external push production execution

verification_targets:
- StreamStudio files exist
- StreamWatch files exist
- apply-all and verify-all runners exist
- each app has core / seed / verify SQL
