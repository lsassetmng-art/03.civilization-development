# ============================================================
# ACCESS DELTA COMPARE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide quick comparison between the latest run and the previous run
- generate a delta report for baseline / legacy / bundle export changes

delivered_commands:
- access_compare_latest_runs.sh
- access_make_delta_report.sh

policy:
- additive only
- no schema drop
- helper commands only
