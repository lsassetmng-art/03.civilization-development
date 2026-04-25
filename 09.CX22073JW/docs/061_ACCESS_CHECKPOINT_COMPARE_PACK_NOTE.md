# ============================================================
# ACCESS CHECKPOINT COMPARE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- compare the latest checkpoint with the immediately previous checkpoint
- provide a diff report for tools / scripts / docs / latest links / db status

delivered_commands:
- access_compare_checkpoints.sh
- access_make_checkpoint_diff_report.sh

policy:
- additive only
- no schema drop
- helper commands only
