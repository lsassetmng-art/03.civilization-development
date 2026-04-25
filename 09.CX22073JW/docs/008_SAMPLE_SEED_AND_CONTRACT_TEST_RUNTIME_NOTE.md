# ============================================================
# CX22073JW SAMPLE SEED AND CONTRACT TEST RUNTIME NOTE
# target_db_env: PERSONA_DATABASE_URL
# reviewer: Sato (DB)
# ============================================================

This package adds:
- sample case registry
- sample execution log
- wrapper-based sample executor
- valid / invalid default sample cases
- batch runner views

Policy:
- additive only
- no schema drop
- uses generated wrapper functions
- valid cases should upsert rows
- invalid cases should fail by exact payload contract
