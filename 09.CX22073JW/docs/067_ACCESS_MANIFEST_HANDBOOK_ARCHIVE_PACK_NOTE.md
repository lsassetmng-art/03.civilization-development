# ============================================================
# ACCESS MANIFEST HANDBOOK ARCHIVE PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide a consolidated workspace manifest export
- provide an operator handbook generator
- provide safe archive preview and gated archive move helpers

delivered_commands:
- access_make_workspace_manifest.sh
- access_make_operator_handbook.sh
- access_archive_old_artifacts_preview.sh
- access_archive_old_artifacts_move.sh

policy:
- additive only
- no schema drop
- helper commands only
- archive preview is non-destructive
- archive move executes only when explicitly given apply
