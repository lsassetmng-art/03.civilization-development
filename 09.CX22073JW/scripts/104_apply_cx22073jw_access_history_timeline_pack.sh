#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_history.sh" <<'ACCESS_HISTORY_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"

latest_dir() {
  local root="$1"
  local pattern="$2"
  if [ -d "$root" ]; then
    find "$root" -maxdepth 1 -mindepth 1 \( -type d -o -type f \) -name "$pattern" 2>/dev/null | sort | tail -n 1
  fi
}

echo "============================================================"
echo "ACCESS HISTORY"
echo "============================================================"

echo "[recent baseline health runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at,
  ended_at
FROM cx22073jw.access_baseline_health_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent legacy cutover gate runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  source_audit_run_code,
  readiness_status,
  blocker_count,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_cutover_gate_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent retirement plan runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  plan_status,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_retirement_plan_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent current-state bundle exports]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  export_root_path,
  baseline_run_code,
  legacy_gate_run_code,
  retirement_plan_run_code,
  manual_receipt_batch_code,
  confirmed_reverify_run_code,
  file_count,
  export_status,
  created_at,
  ended_at
FROM cx22073jw.access_current_state_bundle_export_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[recent db blocker patch runs]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  target_view_count,
  target_function_count,
  patched_view_count,
  patched_function_count,
  error_count,
  run_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_db_blocker_patch_run
ORDER BY created_at DESC
LIMIT 10;
SQL

echo "[filesystem latest artifacts]"
echo "latest_shift_report_dir      : $(latest_dir "$LOGS_DIR" '*_access_shift_report' || true)"
echo "latest_incident_bundle_dir   : $(latest_dir "$LOGS_DIR" '*_access_incident_bundle' || true)"
echo "latest_timeline_report_dir   : $(latest_dir "$LOGS_DIR" '*_access_timeline_report' || true)"
echo "latest_current_bundle_dir    : $(latest_dir "$EXPORTS_DIR/access-current-state-bundle" '*' || true)"
echo "latest_retirement_export_dir : $(latest_dir "$EXPORTS_DIR/access-legacy-retirement-plan" '*' || true)"

echo "============================================================"
echo "ACCESS HISTORY DONE"
echo "============================================================"
ACCESS_HISTORY_CMD
chmod +x "$TOOLS_DIR/access_history.sh"

cat > "$TOOLS_DIR/access_make_timeline_report.sh" <<'ACCESS_TIMELINE_REPORT_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_timeline_report"

REPORT_MD="$OUT_DIR/000_access_timeline_report.md"
BASELINE_TSV="$OUT_DIR/010_baseline_runs.tsv"
LEGACY_GATE_TSV="$OUT_DIR/020_legacy_gate_runs.tsv"
RETIREMENT_TSV="$OUT_DIR/030_retirement_plan_runs.tsv"
BUNDLE_TSV="$OUT_DIR/040_bundle_export_runs.tsv"
DB_PATCH_TSV="$OUT_DIR/050_db_blocker_patch_runs.tsv"
LATEST_STATUS_TSV="$OUT_DIR/060_latest_status_snapshot.tsv"

mkdir -p "$OUT_DIR"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_TSV"
SELECT
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at,
  ended_at
FROM cx22073jw.access_baseline_health_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_GATE_TSV"
SELECT
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_cutover_gate_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$RETIREMENT_TSV"
SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  plan_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_retirement_plan_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_TSV"
SELECT
  run_code,
  export_root_path,
  baseline_run_code,
  legacy_gate_run_code,
  retirement_plan_run_code,
  manual_receipt_batch_code,
  confirmed_reverify_run_code,
  file_count,
  export_status,
  created_at,
  ended_at
FROM cx22073jw.access_current_state_bundle_export_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_PATCH_TSV"
SELECT
  run_code,
  target_view_count,
  target_function_count,
  patched_view_count,
  patched_function_count,
  error_count,
  run_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_db_blocker_patch_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LATEST_STATUS_TSV"
SELECT
  b.run_code AS baseline_run_code,
  b.core_status,
  b.legacy_status,
  b.operations_status,
  b.core_blocker_count,
  g.run_code AS legacy_gate_run_code,
  g.readiness_status,
  g.blocker_count,
  r.run_code AS retirement_run_code,
  r.plan_status,
  c.run_code AS bundle_run_code,
  c.export_status
FROM cx22073jw.v_access_baseline_health_latest_summary b
LEFT JOIN cx22073jw.v_access_legacy_cutover_gate_latest_summary g
  ON TRUE
LEFT JOIN cx22073jw.v_access_legacy_retirement_plan_latest_summary r
  ON TRUE
LEFT JOIN cx22073jw.v_access_current_state_bundle_export_latest_summary c
  ON TRUE;
SQL

LATEST_CORE_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

LATEST_LEGACY_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(legacy_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

LATEST_OPERATIONS_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(operations_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

BASELINE_COUNT="$(awk 'END{print NR+0}' "$BASELINE_TSV")"
LEGACY_COUNT="$(awk 'END{print NR+0}' "$LEGACY_GATE_TSV")"
RETIREMENT_COUNT="$(awk 'END{print NR+0}' "$RETIREMENT_TSV")"
BUNDLE_COUNT="$(awk 'END{print NR+0}' "$BUNDLE_TSV")"
DB_PATCH_COUNT="$(awk 'END{print NR+0}' "$DB_PATCH_TSV")"

cat > "$REPORT_MD" <<TIMELINE_REPORT_MD
# ============================================================
# ACCESS TIMELINE REPORT
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
latest_core_status: $LATEST_CORE_STATUS
latest_legacy_status: $LATEST_LEGACY_STATUS
latest_operations_status: $LATEST_OPERATIONS_STATUS

included_counts:
- baseline_runs: $BASELINE_COUNT
- legacy_gate_runs: $LEGACY_COUNT
- retirement_plan_runs: $RETIREMENT_COUNT
- bundle_export_runs: $BUNDLE_COUNT
- db_blocker_patch_runs: $DB_PATCH_COUNT

artifacts:
- 010_baseline_runs.tsv
- 020_legacy_gate_runs.tsv
- 030_retirement_plan_runs.tsv
- 040_bundle_export_runs.tsv
- 050_db_blocker_patch_runs.tsv
- 060_latest_status_snapshot.tsv

note:
Use this report for trend review, handoff, and recent-run tracing.
TIMELINE_REPORT_MD

echo "============================================================"
echo "ACCESS TIMELINE REPORT CREATED"
echo "============================================================"
echo "out_dir    : $OUT_DIR"
echo "report_md  : $REPORT_MD"
echo "============================================================"
sed -n '1,120p' "$REPORT_MD"
ACCESS_TIMELINE_REPORT_CMD
chmod +x "$TOOLS_DIR/access_make_timeline_report.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_history.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_104'

history_commands:
- ./access_history.sh
- ./access_make_timeline_report.sh
README_APPEND_104
  fi
else
  cat > "$README_FILE" <<'README_NEW_104'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

history_commands:
- ./access_history.sh
- ./access_make_timeline_report.sh
README_NEW_104
fi

echo "============================================================"
echo "ACCESS HISTORY TIMELINE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
