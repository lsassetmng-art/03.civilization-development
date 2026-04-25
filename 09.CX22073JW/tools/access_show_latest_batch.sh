#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

echo "============================================================"
echo "ACCESS LATEST BATCH"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  batch_code,
  source_handoff_run_code,
  source_export_root_path,
  requested_item_count,
  seeded_item_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL

echo "============================================================"
echo "ACCESS LATEST BATCH DONE"
echo "============================================================"
