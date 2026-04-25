# ============================================================
# STATICART FINAL HANDOFF PACKAGE RUNNER NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- finalize the latest StaticArt handoff export into a delivery package
- generate file index / sha256 / db summary / package manifest
- record the package metadata in CX22073JW

policy:
- additive only
- no schema drop
- package source is latest StaticArt handoff export root
