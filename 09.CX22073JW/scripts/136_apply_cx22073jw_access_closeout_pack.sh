#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"
LOGS_DIR="$BASE/logs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR" "$LOGS_DIR"

cat > "$TOOLS_DIR/access_show_end_state.sh" <<'ACCESS_SHOW_END_STATE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LATEST_DIR="$BASE/latest"
LOGS_DIR="$BASE/logs"

count_files() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type f | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

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

latest_link_target() {
  local name="$1"
  local p="$LATEST_DIR/$name"
  if [ -L "$p" ]; then
    readlink "$p" || true
  elif [ -e "$p" ]; then
    printf '%s\n' "$p"
  fi
}

TOOLS_COUNT="$(count_files "$TOOLS_DIR")"
SCRIPTS_COUNT="$(count_files "$SCRIPTS_DIR")"
DOCS_COUNT="$(count_files "$DOCS_DIR")"
LOG_DIR_COUNT="$(
  if [ -d "$LOGS_DIR" ]; then
    find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
)"
LATEST_ENTRY_COUNT="$(
  if [ -d "$LATEST_DIR" ]; then
    find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
)"

echo "============================================================"
echo "ACCESS END STATE"
echo "============================================================"
echo "[workspace inventory]"
echo "tools_count=$TOOLS_COUNT"
echo "scripts_count=$SCRIPTS_COUNT"
echo "docs_count=$DOCS_COUNT"
echo "log_dir_count=$LOG_DIR_COUNT"
echo "latest_entry_count=$LATEST_ENTRY_COUNT"

echo
echo "[db snapshot]"
if view_exists "v_access_baseline_health_latest_summary"; then
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at
FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_baseline_health_latest_summary"
fi

if view_exists "v_access_current_state_bundle_export_latest_summary"; then
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  run_code,
  export_root_path,
  file_count,
  export_status,
  created_at
FROM cx22073jw.v_access_current_state_bundle_export_latest_summary;
SQL
else
  echo "VIEW_MISSING: v_access_current_state_bundle_export_latest_summary"
fi

echo
echo "[latest pointers]"
echo "latest_shift_report_dir=$(latest_link_target latest_shift_report_dir)"
echo "latest_incident_bundle_dir=$(latest_link_target latest_incident_bundle_dir)"
echo "latest_timeline_report_dir=$(latest_link_target latest_timeline_report_dir)"
echo "latest_current_bundle_dir=$(latest_link_target latest_current_bundle_dir)"
echo "latest_current_bundle_handoff_md=$(latest_link_target latest_current_bundle_handoff_md)"
echo "latest_retirement_plan_dir=$(latest_link_target latest_retirement_plan_dir)"

echo
echo "[recommended commands]"
echo "./access_dashboard.sh"
echo "./access_release_readiness.sh"
echo "./access_make_final_handoff_bundle.sh"
echo "./access_make_workspace_manifest.sh"
echo "./access_make_operator_handbook.sh"

echo "============================================================"
echo "ACCESS END STATE DONE"
echo "============================================================"
ACCESS_SHOW_END_STATE_CMD
chmod +x "$TOOLS_DIR/access_show_end_state.sh"

cat > "$TOOLS_DIR/access_run_closeout_flow.sh" <<'ACCESS_RUN_CLOSEOUT_FLOW_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

pass_count=0
warn_count=0
fail_count=0

run_step() {
  local label="$1"
  local path="$2"
  shift 2 || true

  echo "============================================================"
  echo "$label"
  echo "============================================================"

  if [ ! -x "$path" ]; then
    echo "WARN: missing cmd -> $path"
    warn_count=$((warn_count + 1))
    return 0
  fi

  if "$path" "$@"; then
    pass_count=$((pass_count + 1))
  else
    echo "WARN: step failed -> $path"
    fail_count=$((fail_count + 1))
  fi
}

echo "============================================================"
echo "ACCESS CLOSEOUT FLOW START"
echo "============================================================"

run_step "[1/9] end state" "$TOOLS_DIR/access_show_end_state.sh"
run_step "[2/9] release readiness" "$TOOLS_DIR/access_release_readiness.sh"
run_step "[3/9] final handoff bundle" "$TOOLS_DIR/access_make_final_handoff_bundle.sh"
run_step "[4/9] workspace manifest" "$TOOLS_DIR/access_make_workspace_manifest.sh"
run_step "[5/9] operator handbook" "$TOOLS_DIR/access_make_operator_handbook.sh"
run_step "[6/9] master bundle" "$TOOLS_DIR/access_make_master_bundle.sh"
run_step "[7/9] storage report" "$TOOLS_DIR/access_make_storage_report.sh"
run_step "[8/9] refresh latest links" "$TOOLS_DIR/access_refresh_latest_links.sh"
run_step "[9/9] show latest links" "$TOOLS_DIR/access_show_latest_links.sh"

echo "============================================================"
echo "ACCESS CLOSEOUT FLOW SUMMARY"
echo "============================================================"
echo "pass_count=$pass_count"
echo "warn_count=$warn_count"
echo "fail_count=$fail_count"
echo "============================================================"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
ACCESS_RUN_CLOSEOUT_FLOW_CMD
chmod +x "$TOOLS_DIR/access_run_closeout_flow.sh"

cat > "$TOOLS_DIR/access_make_closeout_bundle.sh" <<'ACCESS_MAKE_CLOSEOUT_BUNDLE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_closeout_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_closeout_summary.md"
END_STATE_LOG="$OUT_DIR/020_end_state.log"
CLOSEOUT_FLOW_LOG="$OUT_DIR/030_closeout_flow.log"
RELEASE_READINESS_LOG="$OUT_DIR/040_release_readiness.log"
FINAL_HANDOFF_LOG="$OUT_DIR/050_final_handoff_bundle.log"
WORKSPACE_MANIFEST_LOG="$OUT_DIR/060_workspace_manifest.log"
OPERATOR_HANDBOOK_LOG="$OUT_DIR/070_operator_handbook.log"
MASTER_BUNDLE_LOG="$OUT_DIR/080_master_bundle.log"
STORAGE_REPORT_LOG="$OUT_DIR/090_storage_report.log"
LATEST_LINKS_LOG="$OUT_DIR/100_latest_links.log"
DB_STATUS_TSV="$OUT_DIR/110_db_status.tsv"
GENERATED_REFS_TSV="$OUT_DIR/120_generated_refs.tsv"

mkdir -p "$OUT_DIR"
: > "$GENERATED_REFS_TSV"

run_capture() {
  local path="$1"
  local out_file="$2"

  if [ -x "$path" ]; then
    "$path" > "$out_file" 2>&1 || true
  else
    echo "MISSING: $path" > "$out_file"
  fi
}

capture_refs() {
  local label="$1"
  local file_path="$2"
  grep -E '(^[a-z_]+[[:space:]]*:)|(^[a-z_]+=)' "$file_path" 2>/dev/null | while IFS= read -r line; do
    [ -n "${line:-}" ] || continue
    printf '%s\t%s\n' "$label" "$line" >> "$GENERATED_REFS_TSV"
  done
}

echo "============================================================"
echo "ACCESS CLOSEOUT BUNDLE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_capture "$TOOLS_DIR/access_show_end_state.sh" "$END_STATE_LOG"
run_capture "$TOOLS_DIR/access_run_closeout_flow.sh" "$CLOSEOUT_FLOW_LOG"
run_capture "$TOOLS_DIR/access_release_readiness.sh" "$RELEASE_READINESS_LOG"
run_capture "$TOOLS_DIR/access_make_final_handoff_bundle.sh" "$FINAL_HANDOFF_LOG"
run_capture "$TOOLS_DIR/access_make_workspace_manifest.sh" "$WORKSPACE_MANIFEST_LOG"
run_capture "$TOOLS_DIR/access_make_operator_handbook.sh" "$OPERATOR_HANDBOOK_LOG"
run_capture "$TOOLS_DIR/access_make_master_bundle.sh" "$MASTER_BUNDLE_LOG"
run_capture "$TOOLS_DIR/access_make_storage_report.sh" "$STORAGE_REPORT_LOG"
run_capture "$TOOLS_DIR/access_show_latest_links.sh" "$LATEST_LINKS_LOG"

capture_refs "closeout_flow" "$CLOSEOUT_FLOW_LOG"
capture_refs "release_readiness" "$RELEASE_READINESS_LOG"
capture_refs "final_handoff" "$FINAL_HANDOFF_LOG"
capture_refs "workspace_manifest" "$WORKSPACE_MANIFEST_LOG"
capture_refs "operator_handbook" "$OPERATOR_HANDBOOK_LOG"
capture_refs "master_bundle" "$MASTER_BUNDLE_LOG"
capture_refs "storage_report" "$STORAGE_REPORT_LOG"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_STATUS_TSV"
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
  c.export_status,
  c.file_count
FROM cx22073jw.v_access_baseline_health_latest_summary b
LEFT JOIN cx22073jw.v_access_legacy_cutover_gate_latest_summary g
  ON TRUE
LEFT JOIN cx22073jw.v_access_legacy_retirement_plan_latest_summary r
  ON TRUE
LEFT JOIN cx22073jw.v_access_current_state_bundle_export_latest_summary c
  ON TRUE;
SQL

CORE_STATUS="$(awk -F '\t' 'NR==1{print $2}' "$DB_STATUS_TSV" 2>/dev/null || true)"
LEGACY_STATUS="$(awk -F '\t' 'NR==1{print $3}' "$DB_STATUS_TSV" 2>/dev/null || true)"
OPERATIONS_STATUS="$(awk -F '\t' 'NR==1{print $4}' "$DB_STATUS_TSV" 2>/dev/null || true)"
REF_COUNT="$(awk 'END{print NR+0}' "$GENERATED_REFS_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_CLOSEOUT_MANIFEST
# ============================================================
# ACCESS CLOSEOUT BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_closeout_summary.md
- 020_end_state.log
- 030_closeout_flow.log
- 040_release_readiness.log
- 050_final_handoff_bundle.log
- 060_workspace_manifest.log
- 070_operator_handbook.log
- 080_master_bundle.log
- 090_storage_report.log
- 100_latest_links.log
- 110_db_status.tsv
- 120_generated_refs.tsv
EOF_ACCESS_CLOSEOUT_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_CLOSEOUT_SUMMARY
# ============================================================
# ACCESS CLOSEOUT SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

status_snapshot:
- core_status: ${CORE_STATUS:-UNKNOWN}
- legacy_status: ${LEGACY_STATUS:-UNKNOWN}
- operations_status: ${OPERATIONS_STATUS:-UNKNOWN}

generated_reference_rows:
- ref_count: $REF_COUNT

note:
This bundle is intended as the final closeout package for the current access workspace.
EOF_ACCESS_CLOSEOUT_SUMMARY

echo "============================================================"
echo "ACCESS CLOSEOUT BUNDLE CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
ACCESS_MAKE_CLOSEOUT_BUNDLE_CMD
chmod +x "$TOOLS_DIR/access_make_closeout_bundle.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_show_end_state.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_136'

closeout_commands:
- ./access_show_end_state.sh
- ./access_run_closeout_flow.sh
- ./access_make_closeout_bundle.sh

recommended_closeout_flow:
1. ./access_show_end_state.sh
2. ./access_run_closeout_flow.sh
3. ./access_make_closeout_bundle.sh
README_APPEND_136
  fi
else
  cat > "$README_FILE" <<'README_NEW_136'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

closeout_commands:
- ./access_show_end_state.sh
- ./access_run_closeout_flow.sh
- ./access_make_closeout_bundle.sh
README_NEW_136
fi

echo "============================================================"
echo "ACCESS CLOSEOUT PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
