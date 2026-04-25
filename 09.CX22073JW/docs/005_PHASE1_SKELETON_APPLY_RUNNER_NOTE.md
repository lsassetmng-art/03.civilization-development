# ============================================================
# CX22073JW PHASE1 SKELETON APPLY RUNNER NOTE
# target_db_env: PERSONA_DATABASE_URL
# reviewer: Sato (DB)
# ============================================================

This package adds:
- phase1 skeleton apply batch tracking
- phase1 skeleton apply item log
- apply summary / target status views
- shell runner that reads generated DDL from registry,
  writes SQL files under $HOME/.tmp,
  and applies them in priority order

Policy:
- additive only
- no schema drop
- uses generated DDL from official_prepare_generation_registry
- apply target is cx22073jw schema
