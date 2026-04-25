# ============================================================
# ACCESS LAUNCHER AND DOCTOR PACK NOTE
# ============================================================

status: implementation-support
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- provide a single launcher entrypoint for daily access operations
- provide a doctor command for fast environment / script / view health inspection

delivered_commands:
- access_menu.sh
- access_doctor.sh

policy:
- additive only
- no schema drop
- helper commands only
