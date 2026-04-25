#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_status.sh" <<'EOF'
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
echo "ACCESS STATUS"
echo "============================================================"

if view_exists "v_access_baseline_health_latest_summary"; then
  echo "[baseline summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_baseline_health_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_baseline_health_latest_summary"
fi

if view_exists "v_access_manual_apply_receipt_latest_pending_summary"; then
  echo "[manual pending summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;
SQL
else
  echo "VIEW_MISSING: v_access_manual_apply_receipt_latest_pending_summary"
fi

if view_exists "v_access_post_apply_verification_latest_confirmed_only_summary"; then
  echo "[confirmed-only reverify summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL
else
  echo "VIEW_MISSING: v_access_post_apply_verification_latest_confirmed_only_summary"
fi

if view_exists "v_access_current_state_bundle_export_latest_summary"; then
  echo "[current-state bundle summary]"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_current_state_bundle_export_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_current_state_bundle_export_latest_summary"
fi

echo "============================================================"
echo "ACCESS STATUS DONE"
echo "============================================================"
EOF
chmod +x "$TOOLS_DIR/access_status.sh"

cat > "$TOOLS_DIR/access_show_latest_batch.sh" <<'EOF'
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
EOF
chmod +x "$TOOLS_DIR/access_show_latest_batch.sh"

cat > "$TOOLS_DIR/access_confirm_request.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

REQUEST_CODE="${1:-}"
NEW_STATUS="${2:-confirmed_applied}"
EXECUTOR_NAME="${3:-Zero}"
CONFIRM_NOTE="${4:-manual confirmation from access_confirm_request.sh}"
BATCH_CODE="${5:-}"

if [ -z "$REQUEST_CODE" ]; then
  echo "USAGE: access_confirm_request.sh REQUEST_CODE [confirmed_applied|confirmed_skipped|confirmed_failed] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]"
  exit 1
fi

if [ -z "$BATCH_CODE" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "$BATCH_CODE" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

ESC_NOTE="$(printf "%s" "$CONFIRM_NOTE" | sed "s/'/''/g")"
ESC_EXECUTOR="$(printf "%s" "$EXECUTOR_NAME" | sed "s/'/''/g")"
ESC_REQUEST="$(printf "%s" "$REQUEST_CODE" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

echo "============================================================"
echo "ACCESS CONFIRM REQUEST"
echo "batch_code   : $BATCH_CODE"
echo "request_code : $REQUEST_CODE"
echo "new_status   : $NEW_STATUS"
echo "executor     : $EXECUTOR_NAME"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_confirm_access_manual_apply_receipt_items(
  '$ESC_BATCH',
  '$ESC_REQUEST',
  '$NEW_STATUS',
  '$ESC_EXECUTOR',
  '$ESC_NOTE'
);
SQL

echo "============================================================"
echo "ACCESS CONFIRM REQUEST DONE"
echo "============================================================"
EOF
chmod +x "$TOOLS_DIR/access_confirm_request.sh"

cat > "$TOOLS_DIR/access_reverify_confirmed.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BATCH_CODE="${1:-}"
ACTOR_NAME="${2:-Zero}"
RUN_CODE="access_confirmed_reverify_$(date +%Y%m%d_%H%M%S)"

if [ -z "$BATCH_CODE" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "$BATCH_CODE" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"
ESC_ACTOR="$(printf "%s" "$ACTOR_NAME" | sed "s/'/''/g")"

echo "============================================================"
echo "ACCESS CONFIRMED-ONLY REVERIFY"
echo "batch_code : $BATCH_CODE"
echo "run_code   : $RUN_CODE"
echo "actor      : $ACTOR_NAME"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_run_access_post_apply_verification_confirmed_only(
  '$RUN_CODE',
  '$ESC_BATCH',
  '$ESC_ACTOR',
  'Confirmed-only post-apply verification.'
);
SQL

echo "[latest confirmed-only reverify summary]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL

echo "============================================================"
echo "ACCESS CONFIRMED-ONLY REVERIFY DONE"
echo "============================================================"
EOF
chmod +x "$TOOLS_DIR/access_reverify_confirmed.sh"

cat > "$TOOLS_DIR/access_export_current_bundle.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
APPLY_090="$BASE/scripts/090_apply_cx22073jw_access_current_state_bundle_export.sh"
VERIFY_091="$BASE/scripts/091_verify_cx22073jw_access_current_state_bundle_export.sh"

if [ ! -x "$APPLY_090" ]; then
  echo "ERROR: missing apply script -> $APPLY_090"
  exit 1
fi

echo "============================================================"
echo "ACCESS CURRENT BUNDLE EXPORT"
echo "============================================================"

"$APPLY_090"

if [ -x "$VERIFY_091" ]; then
  "$VERIFY_091"
fi

echo "============================================================"
echo "ACCESS CURRENT BUNDLE EXPORT DONE"
echo "============================================================"
EOF
chmod +x "$TOOLS_DIR/access_export_current_bundle.sh"

cat > "$TOOLS_DIR/README_ACCESS_COMMANDS.md" <<'EOF'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

commands:
- ./access_status.sh
- ./access_show_latest_batch.sh
- ./access_confirm_request.sh REQUEST_CODE [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
- ./access_reverify_confirmed.sh [BATCH_CODE] [ACTOR_NAME]
- ./access_export_current_bundle.sh

status values:
- confirmed_applied
- confirmed_skipped
- confirmed_failed

notes:
- PERSONA_DATABASE_URL must be exported
- latest batch is used by default where batch code is optional
EOF

echo "============================================================"
echo "ACCESS OPERATOR COMMAND PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
