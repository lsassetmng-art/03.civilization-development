# ============================================================
# CX22073JW PERSONA IMPLEMENTATION README
# status: implementation-ready
# target_db_env: PERSONA_DATABASE_URL
# reviewer: Sato (DB)
# ============================================================

Target:
- /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW

This package does:
- full reset of schema `cx22073jw` on PERSONA_DATABASE_URL
- recreates foundation structure for CX22073JW
- includes:
  - foundation skeleton
  - embedded optimization layer
  - Secret First Slice
  - Priority 26-29 reference slice

Notes:
- reset scope is only `cx22073jw`
- this is a destructive rebuild for that schema
- execution uses psql "$PERSONA_DATABASE_URL" <<'SQL'
