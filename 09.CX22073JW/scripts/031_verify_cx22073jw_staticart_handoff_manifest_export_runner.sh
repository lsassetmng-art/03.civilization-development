#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LATEST_EXPORT_ROOT="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_handoff_export_batch_summary
LIMIT 1;
SQL
)"

echo "============================================================"
echo "LATEST_EXPORT_ROOT=$LATEST_EXPORT_ROOT"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== EXPORT BATCH SUMMARY ==='
TABLE cx22073jw.v_staticart_handoff_export_batch_summary;

\echo '=== EXPORT ITEM SUMMARY ==='
SELECT
  export_code,
  contract_level,
  target_status_code,
  COUNT(*) AS item_count
FROM cx22073jw.v_staticart_handoff_export_item_summary
GROUP BY export_code, contract_level, target_status_code
ORDER BY export_code, contract_level, target_status_code;
SQL

if [ -n "${LATEST_EXPORT_ROOT:-}" ] && [ -d "$LATEST_EXPORT_ROOT" ]; then
  echo "============================================================"
  echo "EXPORTED FILES"
  echo "============================================================"
  ls -l "$LATEST_EXPORT_ROOT"

  echo "============================================================"
  echo "FILE LINE COUNTS"
  echo "============================================================"
  wc -l \
    "$LATEST_EXPORT_ROOT/030_targets.jsonl" \
    "$LATEST_EXPORT_ROOT/040_payload_contracts.jsonl" \
    "$LATEST_EXPORT_ROOT/050_top_level_contracts.jsonl" \
    "$LATEST_EXPORT_ROOT/060_blocked_targets.jsonl" \
    "$LATEST_EXPORT_ROOT/070_targets.tsv" \
    "$LATEST_EXPORT_ROOT/080_payload_contracts.tsv" \
    "$LATEST_EXPORT_ROOT/090_top_level_contracts.tsv"

  echo "============================================================"
  echo "MANIFEST HEAD"
  echo "============================================================"
  sed -n '1,220p' "$LATEST_EXPORT_ROOT/010_manifest.json"

  echo "============================================================"
  echo "TARGETS JSONL HEAD"
  echo "============================================================"
  sed -n '1,20p' "$LATEST_EXPORT_ROOT/030_targets.jsonl"

  echo "============================================================"
  echo "PAYLOAD JSONL HEAD"
  echo "============================================================"
  sed -n '1,20p' "$LATEST_EXPORT_ROOT/040_payload_contracts.jsonl"

  echo "============================================================"
  echo "TOP LEVEL JSONL HEAD"
  echo "============================================================"
  sed -n '1,20p' "$LATEST_EXPORT_ROOT/050_top_level_contracts.jsonl"
else
  echo "ERROR: latest export root not found"
  exit 1
fi
