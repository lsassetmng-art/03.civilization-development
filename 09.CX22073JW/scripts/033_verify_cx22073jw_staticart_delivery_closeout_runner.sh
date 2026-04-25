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
\echo '=== DELIVERY CLOSEOUT SUMMARY ==='
TABLE cx22073jw.v_staticart_delivery_closeout_summary;

\echo '=== RELEASE SUMMARY ==='
TABLE cx22073jw.v_staticart_fixed_contract_release_summary;

\echo '=== EXPORT BATCH SUMMARY ==='
TABLE cx22073jw.v_staticart_handoff_export_batch_summary;

\echo '=== SAMPLE RUN SUMMARY ==='
SELECT
  sample_code,
  run_status,
  total_area_count,
  preflight_pass_count,
  preflight_fail_count,
  wrapper_applied_count,
  wrapper_skipped_count
FROM cx22073jw.v_staticart_knowledge_pack_run_latest
LIMIT 1;

\echo '=== READINESS GATE SUMMARY ==='
TABLE cx22073jw.v_readiness_gate_latest_run_summary;
SQL

if [ -n "${LATEST_EXPORT_ROOT:-}" ] && [ -d "$LATEST_EXPORT_ROOT" ]; then
  echo "============================================================"
  echo "FINAL FILE CHECK"
  echo "============================================================"
  ls -l "$LATEST_EXPORT_ROOT"

  echo "============================================================"
  echo "FINAL CLOSEOUT HEAD"
  echo "============================================================"
  sed -n '1,220p' "$LATEST_EXPORT_ROOT/999_FINAL_DELIVERY_CLOSEOUT.md"
else
  echo "ERROR: latest export root not found"
  exit 1
fi
