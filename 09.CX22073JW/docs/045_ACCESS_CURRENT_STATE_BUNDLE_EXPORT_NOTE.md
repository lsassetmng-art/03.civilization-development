# ============================================================
# ACCESS CURRENT STATE BUNDLE EXPORT NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- export the current access baseline state into a portable bundle
- include baseline health, legacy cutover gate, retirement plan, manual receipt, and reverify summaries
- keep a DB-side export run ledger

policy:
- additive only
- no schema drop
- no destructive action
- export / handoff only
