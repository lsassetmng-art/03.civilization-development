#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_run_master_flow.sh" <<'ACCESS_MASTER_FLOW_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

run_if_exists() {
  local step_label="$1"
  local cmd_path="$2"
  shift 2 || true

  echo "============================================================"
  echo "$step_label"
  echo "============================================================"

  if [ -x "$cmd_path" ]; then
    "$cmd_path" "$@"
  else
    echo "WARN: missing cmd -> $cmd_path"
  fi
}

echo "============================================================"
echo "ACCESS MASTER FLOW START"
echo "============================================================"

run_if_exists "[1/8] doctor" "$TOOLS_DIR/access_doctor.sh"
run_if_exists "[2/8] daily refresh" "$TOOLS_DIR/access_daily_refresh.sh"
run_if_exists "[3/8] review flow" "$TOOLS_DIR/access_run_review_flow.sh"
run_if_exists "[4/8] handoff flow" "$TOOLS_DIR/access_run_handoff_flow.sh"
run_if_exists "[5/8] checkpoint" "$TOOLS_DIR/access_make_checkpoint.sh"
run_if_exists "[6/8] delta report" "$TOOLS_DIR/access_make_delta_report.sh"
run_if_exists "[7/8] regression bundle" "$TOOLS_DIR/access_make_regression_bundle.sh"
run_if_exists "[8/8] latest links refresh" "$TOOLS_DIR/access_refresh_latest_links.sh"

echo "============================================================"
echo "ACCESS MASTER FLOW DONE"
echo "============================================================"
ACCESS_MASTER_FLOW_CMD
chmod +x "$TOOLS_DIR/access_run_master_flow.sh"

cat > "$TOOLS_DIR/access_make_master_bundle.sh" <<'ACCESS_MASTER_BUNDLE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"
LATEST_DIR="$BASE/latest"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_master_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_master_bundle_summary.md"
STATUS_LOG="$OUT_DIR/020_status.log"
DOCTOR_LOG="$OUT_DIR/030_doctor.log"
OPEN_BLOCKERS_LOG="$OUT_DIR/040_open_blockers.log"
HISTORY_LOG="$OUT_DIR/050_history.log"
CATALOG_LOG="$OUT_DIR/060_catalog.log"
LATEST_LINKS_LOG="$OUT_DIR/070_latest_links.log"
BASELINE_SUMMARY_TSV="$OUT_DIR/080_baseline_summary.tsv"
LEGACY_SUMMARY_TSV="$OUT_DIR/090_legacy_summary.tsv"
RETIREMENT_SUMMARY_TSV="$OUT_DIR/100_retirement_summary.tsv"
BUNDLE_SUMMARY_TSV="$OUT_DIR/110_bundle_summary.tsv"
LATEST_DIR_TSV="$OUT_DIR/120_latest_dir_inventory.tsv"

mkdir -p "$OUT_DIR"

run_capture() {
  local path="$1"
  local out_file="$2"

  if [ -x "$path" ]; then
    "$path" > "$out_file" 2>&1 || true
  else
    echo "MISSING: $path" > "$out_file"
  fi
}

echo "============================================================"
echo "ACCESS MASTER BUNDLE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_capture "$TOOLS_DIR/access_status.sh" "$STATUS_LOG"
run_capture "$TOOLS_DIR/access_doctor.sh" "$DOCTOR_LOG"
run_capture "$TOOLS_DIR/access_open_blockers.sh" "$OPEN_BLOCKERS_LOG"
run_capture "$TOOLS_DIR/access_history.sh" "$HISTORY_LOG"
run_capture "$TOOLS_DIR/access_catalog.sh" "$CATALOG_LOG"
run_capture "$TOOLS_DIR/access_show_latest_links.sh" "$LATEST_LINKS_LOG"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$RETIREMENT_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_current_state_bundle_export_latest_summary;
SQL

if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | sort | while IFS= read -r p; do
    [ -n "${p:-}" ] || continue
    if [ -L "$p" ]; then
      printf '%s\t%s\t%s\n' "link" "$(basename "$p")" "$(readlink "$p" || true)"
    elif [ -e "$p" ]; then
      printf '%s\t%s\t%s\n' "path" "$(basename "$p")" "$p"
    else
      printf '%s\t%s\t%s\n' "broken" "$(basename "$p")" "$p"
    fi
  done > "$LATEST_DIR_TSV"
else
  : > "$LATEST_DIR_TSV"
fi

CORE_STATUS="$(awk -F '\t' 'NR==1{print $5}' "$BASELINE_SUMMARY_TSV" 2>/dev/null || true)"
LEGACY_STATUS="$(awk -F '\t' 'NR==1{print $6}' "$BASELINE_SUMMARY_TSV" 2>/dev/null || true)"
OPERATIONS_STATUS="$(awk -F '\t' 'NR==1{print $7}' "$BASELINE_SUMMARY_TSV" 2>/dev/null || true)"
LATEST_LINK_COUNT="$(awk 'END{print NR+0}' "$LATEST_DIR_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_MASTER_MANIFEST
# ============================================================
# ACCESS MASTER BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_master_bundle_summary.md
- 020_status.log
- 030_doctor.log
- 040_open_blockers.log
- 050_history.log
- 060_catalog.log
- 070_latest_links.log
- 080_baseline_summary.tsv
- 090_legacy_summary.tsv
- 100_retirement_summary.tsv
- 110_bundle_summary.tsv
- 120_latest_dir_inventory.tsv
EOF_ACCESS_MASTER_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_MASTER_SUMMARY
# ============================================================
# ACCESS MASTER BUNDLE SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

status_snapshot:
- core_status: ${CORE_STATUS:-UNKNOWN}
- legacy_status: ${LEGACY_STATUS:-UNKNOWN}
- operations_status: ${OPERATIONS_STATUS:-UNKNOWN}

bundle_contents:
- latest_link_count: $LATEST_LINK_COUNT

note:
This master bundle is intended for broad handoff, review, and workspace snapshot packaging.
EOF_ACCESS_MASTER_SUMMARY

echo "============================================================"
echo "ACCESS MASTER BUNDLE CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
ACCESS_MASTER_BUNDLE_CMD
chmod +x "$TOOLS_DIR/access_make_master_bundle.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_run_master_flow.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_126'

master_commands:
- ./access_run_master_flow.sh
- ./access_make_master_bundle.sh

recommended_master_flow:
1. ./access_run_master_flow.sh
2. ./access_make_master_bundle.sh
README_APPEND_126
  fi
else
  cat > "$README_FILE" <<'README_NEW_126'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

master_commands:
- ./access_run_master_flow.sh
- ./access_make_master_bundle.sh
README_NEW_126
fi

echo "============================================================"
echo "ACCESS MASTER FLOW BUNDLE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
