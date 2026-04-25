#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

view_exists() {
  local v="$1"
  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | grep -qx 't'
SELECT EXISTS (
  SELECT 1
  FROM information_schema.views
  WHERE table_schema = 'cx22073jw'
    AND table_name = '$v'
);
SQL
}

echo "============================================================"
echo "ACCESS OPEN BLOCKERS"
echo "============================================================"

if view_exists "v_access_baseline_health_latest_summary"; then
  echo "[baseline summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  core_blocker_count,
  core_status,
  legacy_status,
  operations_status,
  created_at,
  ended_at
FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL
fi

if view_exists "v_access_baseline_health_latest_items"; then
  echo "[baseline blocker items]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  check_group,
  check_code,
  observed_value,
  expected_rule,
  check_status,
  detail_text
FROM cx22073jw.v_access_baseline_health_latest_items
WHERE severity = 'blocker'
  AND check_status = 'fail'
ORDER BY check_group, check_code;
SQL
fi

if view_exists "v_access_legacy_cutover_gate_latest_summary"; then
  echo "[legacy gate summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  created_at,
  ended_at
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;
SQL
fi

if view_exists "v_access_legacy_cutover_gate_latest_blockers"; then
  echo "[legacy blockers]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
ORDER BY blocker_group, blocker_identity;
SQL
fi

if view_exists "v_access_manual_apply_receipt_latest_pending_summary"; then
  echo "[manual pending summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;
SQL
fi

if view_exists "v_access_manual_apply_receipt_latest_items"; then
  echo "[manual items needing action]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  receipt_status,
  manual_executor_name,
  manual_apply_note
FROM cx22073jw.v_access_manual_apply_receipt_latest_items
WHERE receipt_status IN ('pending_confirmation','confirmed_failed')
ORDER BY request_code, logical_view_name;
SQL
fi

if view_exists "v_access_post_apply_verification_latest_confirmed_only_summary"; then
  echo "[confirmed-only reverify summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL
fi

if view_exists "v_access_post_apply_verification_latest_confirmed_only_items"; then
  echo "[confirmed-only reverify blockers]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  verification_status,
  result_note
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items
WHERE verification_status IN ('not_yet_applied','precheck_fail')
ORDER BY request_code, logical_view_name;
SQL
fi

echo "============================================================"
echo "ACCESS OPEN BLOCKERS DONE"
echo "============================================================"
