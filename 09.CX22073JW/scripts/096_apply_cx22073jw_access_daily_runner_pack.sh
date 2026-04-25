#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_legacy_readiness.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

echo "============================================================"
echo "ACCESS LEGACY READINESS"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;

SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  plan_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary;

SELECT
  blocker_group,
  COUNT(*) AS blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
GROUP BY blocker_group
ORDER BY blocker_group;
SQL

echo "============================================================"
echo "ACCESS LEGACY READINESS DONE"
echo "============================================================"
EOF
chmod +x "$TOOLS_DIR/access_legacy_readiness.sh"

cat > "$TOOLS_DIR/access_daily_refresh.sh" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"

STATUS_CMD="$BASE/tools/access_status.sh"
LEGACY_CMD="$BASE/tools/access_legacy_readiness.sh"

APPLY_088="$BASE/scripts/088_apply_cx22073jw_access_baseline_health_gate.sh"
VERIFY_089="$BASE/scripts/089_verify_cx22073jw_access_baseline_health_gate.sh"
APPLY_090="$BASE/scripts/090_apply_cx22073jw_access_current_state_bundle_export.sh"
VERIFY_091="$BASE/scripts/091_verify_cx22073jw_access_current_state_bundle_export.sh"

echo "============================================================"
echo "ACCESS DAILY REFRESH START"
echo "============================================================"

if [ -x "$APPLY_088" ]; then
  echo "[1/4] baseline health refresh"
  "$APPLY_088"
  if [ -x "$VERIFY_089" ]; then
    "$VERIFY_089"
  fi
else
  echo "WARN: missing baseline apply -> $APPLY_088"
fi

if [ -x "$APPLY_090" ]; then
  echo "[2/4] current bundle export"
  "$APPLY_090"
  if [ -x "$VERIFY_091" ]; then
    "$VERIFY_091"
  fi
else
  echo "WARN: missing bundle apply -> $APPLY_090"
fi

if [ -x "$STATUS_CMD" ]; then
  echo "[3/4] status"
  "$STATUS_CMD"
else
  echo "WARN: missing status cmd -> $STATUS_CMD"
fi

if [ -x "$LEGACY_CMD" ]; then
  echo "[4/4] legacy readiness"
  "$LEGACY_CMD"
else
  echo "WARN: missing legacy cmd -> $LEGACY_CMD"
fi

echo "============================================================"
echo "ACCESS DAILY REFRESH DONE"
echo "============================================================"
EOF
chmod +x "$TOOLS_DIR/access_daily_refresh.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_daily_refresh.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'EOF'

additional_commands:
- ./access_legacy_readiness.sh
- ./access_daily_refresh.sh

daily_flow:
1. ./access_daily_refresh.sh
2. confirm requests when needed
3. ./access_reverify_confirmed.sh
4. ./access_export_current_bundle.sh
EOF
  fi
else
  cat > "$README_FILE" <<'EOF'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

commands:
- ./access_status.sh
- ./access_show_latest_batch.sh
- ./access_confirm_request.sh REQUEST_CODE [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
- ./access_reverify_confirmed.sh [BATCH_CODE] [ACTOR_NAME]
- ./access_export_current_bundle.sh
- ./access_legacy_readiness.sh
- ./access_daily_refresh.sh

status values:
- confirmed_applied
- confirmed_skipped
- confirmed_failed

notes:
- PERSONA_DATABASE_URL must be exported
- latest batch is used by default where batch code is optional
EOF
fi

echo "============================================================"
echo "ACCESS DAILY RUNNER PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
