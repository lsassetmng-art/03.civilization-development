# ============================================================
# ACCESS BLOCKER REPORT PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide fast blocker visibility for operators
- generate a shift handoff report from latest access views

delivered_commands:
- access_open_blockers.sh
- access_make_shift_report.sh

policy:
- additive only
- no schema drop
- helper commands only
