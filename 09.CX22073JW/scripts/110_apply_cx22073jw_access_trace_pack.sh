#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_trace_request.sh" <<'ACCESS_TRACE_REQUEST_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

REQUEST_CODE="${1:-}"
BATCH_CODE="${2:-}"

if [ -z "$REQUEST_CODE" ]; then
  echo "USAGE: access_trace_request.sh REQUEST_CODE [BATCH_CODE]"
  exit 1
fi

if [ -z "${BATCH_CODE:-}" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "${BATCH_CODE:-}" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

ESC_REQUEST="$(printf "%s" "$REQUEST_CODE" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

echo "============================================================"
echo "ACCESS TRACE REQUEST"
echo "============================================================"
echo "request_code : $REQUEST_CODE"
echo "batch_code   : $BATCH_CODE"
echo "============================================================"

echo "[receipt batch]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
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
WHERE batch_code = '$ESC_BATCH';
SQL

echo "[receipt items]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  receipt_status,
  manual_executor_name,
  manual_apply_note,
  created_at
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND i.request_code = '$ESC_REQUEST'
ORDER BY logical_view_name;
SQL

echo "[confirmation log]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  b.batch_code,
  l.request_code,
  l.actual_view_code,
  l.logical_view_name,
  l.previous_receipt_status,
  l.new_receipt_status,
  l.executor_name,
  l.confirmation_note,
  l.created_at
FROM cx22073jw.access_manual_apply_confirmation_log l
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = l.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND l.request_code = '$ESC_REQUEST'
ORDER BY l.created_at DESC, l.logical_view_name;
SQL

echo "[confirmed-only reverify items]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  run_code,
  source_receipt_batch_code,
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  role_exists_flag,
  view_exists_flag,
  select_grant_present_flag,
  verification_status,
  result_note,
  created_at
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items
WHERE source_receipt_batch_code = '$ESC_BATCH'
  AND request_code = '$ESC_REQUEST'
ORDER BY logical_view_name;
SQL

echo "[current pending / failed summary for this request]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  receipt_status,
  COUNT(*) AS item_count
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND i.request_code = '$ESC_REQUEST'
GROUP BY receipt_status
ORDER BY receipt_status;
SQL

echo "============================================================"
echo "ACCESS TRACE REQUEST DONE"
echo "============================================================"
ACCESS_TRACE_REQUEST_CMD
chmod +x "$TOOLS_DIR/access_trace_request.sh"

cat > "$TOOLS_DIR/access_trace_logical_view.sh" <<'ACCESS_TRACE_LOGICAL_VIEW_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LOGICAL_VIEW_NAME="${1:-}"
BATCH_CODE="${2:-}"

if [ -z "$LOGICAL_VIEW_NAME" ]; then
  echo "USAGE: access_trace_logical_view.sh LOGICAL_VIEW_NAME [BATCH_CODE]"
  exit 1
fi

if [ -z "${BATCH_CODE:-}" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "${BATCH_CODE:-}" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

ESC_VIEW="$(printf "%s" "$LOGICAL_VIEW_NAME" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

echo "============================================================"
echo "ACCESS TRACE LOGICAL VIEW"
echo "============================================================"
echo "logical_view_name : $LOGICAL_VIEW_NAME"
echo "batch_code        : $BATCH_CODE"
echo "============================================================"

echo "[latest receipt items for logical view]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  b.batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.receipt_status,
  i.manual_executor_name,
  i.manual_apply_note,
  i.created_at
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND i.logical_view_name = '$ESC_VIEW'
ORDER BY i.request_code;
SQL

echo "[confirmation log for logical view]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  b.batch_code,
  l.request_code,
  l.actual_view_code,
  l.logical_view_name,
  l.previous_receipt_status,
  l.new_receipt_status,
  l.executor_name,
  l.confirmation_note,
  l.created_at
FROM cx22073jw.access_manual_apply_confirmation_log l
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = l.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND l.logical_view_name = '$ESC_VIEW'
ORDER BY l.created_at DESC, l.request_code;
SQL

echo "[latest confirmed-only reverify items for logical view]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  run_code,
  source_receipt_batch_code,
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  role_exists_flag,
  view_exists_flag,
  select_grant_present_flag,
  verification_status,
  result_note,
  created_at
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items
WHERE source_receipt_batch_code = '$ESC_BATCH'
  AND logical_view_name = '$ESC_VIEW'
ORDER BY request_code;
SQL

echo "[legacy blockers mentioning logical view]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail,
  created_at
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
WHERE blocker_identity ILIKE '%' || '$ESC_VIEW' || '%'
   OR blocker_detail ILIKE '%' || '$ESC_VIEW' || '%'
ORDER BY blocker_group, blocker_identity;
SQL

echo "============================================================"
echo "ACCESS TRACE LOGICAL VIEW DONE"
echo "============================================================"
ACCESS_TRACE_LOGICAL_VIEW_CMD
chmod +x "$TOOLS_DIR/access_trace_logical_view.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_trace_request.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_110'

trace_commands:
- ./access_trace_request.sh REQUEST_CODE [BATCH_CODE]
- ./access_trace_logical_view.sh LOGICAL_VIEW_NAME [BATCH_CODE]
README_APPEND_110
  fi
else
  cat > "$README_FILE" <<'README_NEW_110'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

trace_commands:
- ./access_trace_request.sh REQUEST_CODE [BATCH_CODE]
- ./access_trace_logical_view.sh LOGICAL_VIEW_NAME [BATCH_CODE]
README_NEW_110
fi

echo "============================================================"
echo "ACCESS TRACE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
