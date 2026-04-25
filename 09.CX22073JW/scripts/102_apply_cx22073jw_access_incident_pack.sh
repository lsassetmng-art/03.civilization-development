#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_latest_artifacts.sh" <<'ACCESS_LATEST_ARTIFACTS_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"

latest_dir() {
  local pattern="$1"
  find "$LOGS_DIR" -maxdepth 1 -type d -name "$pattern" 2>/dev/null | sort | tail -n 1
}

latest_file_under() {
  local dir="$1"
  local pattern="$2"
  if [ -n "${dir:-}" ] && [ -d "$dir" ]; then
    find "$dir" -maxdepth 1 -type f -name "$pattern" 2>/dev/null | sort | tail -n 1
  fi
}

latest_export_dir() {
  local sub="$1"
  if [ -d "$EXPORTS_DIR/$sub" ]; then
    find "$EXPORTS_DIR/$sub" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sort | tail -n 1
  fi
}

LATEST_SHIFT_DIR="$(latest_dir '*_access_shift_report')"
LATEST_BUNDLE_DIR="$(latest_export_dir 'access-current-state-bundle')"
LATEST_BASELINE_DIR="$(latest_dir '*_access_baseline_health_gate')"
LATEST_RETIRE_DIR="$(latest_dir '*_access_legacy_retirement_plan_export')"
LATEST_INCIDENT_DIR="$(latest_dir '*_access_incident_bundle')"

echo "============================================================"
echo "ACCESS LATEST ARTIFACTS"
echo "============================================================"
echo "latest_shift_report_dir     : ${LATEST_SHIFT_DIR:-NOT_FOUND}"
echo "latest_shift_report_md      : $(latest_file_under "$LATEST_SHIFT_DIR" '*.md' || true)"
echo "latest_current_bundle_dir   : ${LATEST_BUNDLE_DIR:-NOT_FOUND}"
echo "latest_current_bundle_md    : $(latest_file_under "$LATEST_BUNDLE_DIR" '*.md' || true)"
echo "latest_baseline_gate_dir    : ${LATEST_BASELINE_DIR:-NOT_FOUND}"
echo "latest_retirement_plan_dir  : ${LATEST_RETIRE_DIR:-NOT_FOUND}"
echo "latest_incident_bundle_dir  : ${LATEST_INCIDENT_DIR:-NOT_FOUND}"
echo "============================================================"
echo "ACCESS LATEST ARTIFACTS DONE"
echo "============================================================"
ACCESS_LATEST_ARTIFACTS_CMD
chmod +x "$TOOLS_DIR/access_latest_artifacts.sh"

cat > "$TOOLS_DIR/access_collect_incident_bundle.sh" <<'ACCESS_INCIDENT_BUNDLE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_incident_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_incident_summary.md"
BASELINE_SUMMARY_TSV="$OUT_DIR/020_baseline_summary.tsv"
BASELINE_ITEMS_TSV="$OUT_DIR/021_baseline_items.tsv"
LEGACY_SUMMARY_TSV="$OUT_DIR/030_legacy_summary.tsv"
LEGACY_BLOCKERS_TSV="$OUT_DIR/031_legacy_blockers.tsv"
MANUAL_PENDING_TSV="$OUT_DIR/040_manual_pending.tsv"
MANUAL_ITEMS_TSV="$OUT_DIR/041_manual_items.tsv"
REVERIFY_SUMMARY_TSV="$OUT_DIR/050_reverify_summary.tsv"
REVERIFY_ITEMS_TSV="$OUT_DIR/051_reverify_items.tsv"
BUNDLE_SUMMARY_TSV="$OUT_DIR/060_bundle_summary.tsv"
BUNDLE_FILES_TSV="$OUT_DIR/061_bundle_files.tsv"
LATEST_ARTIFACTS_TXT="$OUT_DIR/070_latest_artifacts.txt"

mkdir -p "$OUT_DIR"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_ITEMS_TSV"
SELECT * FROM cx22073jw.v_access_baseline_health_latest_items;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_BLOCKERS_TSV"
SELECT * FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MANUAL_PENDING_TSV"
SELECT * FROM cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MANUAL_ITEMS_TSV"
SELECT * FROM cx22073jw.v_access_manual_apply_receipt_latest_items;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$REVERIFY_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$REVERIFY_ITEMS_TSV"
SELECT * FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_SUMMARY_TSV"
SELECT * FROM cx22073jw.v_access_current_state_bundle_export_latest_summary;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_FILES_TSV"
SELECT * FROM cx22073jw.v_access_current_state_bundle_export_latest_files;
SQL

"$BASE/tools/access_latest_artifacts.sh" > "$LATEST_ARTIFACTS_TXT"

CORE_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

LEGACY_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(legacy_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

OPERATIONS_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(operations_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

BASELINE_FAIL_COUNT="$(grep -c $'\tfail\t' "$BASELINE_ITEMS_TSV" || true)"
LEGACY_BLOCKER_COUNT="$(awk 'END{print NR+0}' "$LEGACY_BLOCKERS_TSV")"
MANUAL_ACTION_COUNT="$(grep -cE $'\t(pending_confirmation|confirmed_failed)\t' "$MANUAL_ITEMS_TSV" || true)"
REVERIFY_BLOCKER_COUNT="$(grep -cE $'\t(not_yet_applied|precheck_fail)\t' "$REVERIFY_ITEMS_TSV" || true)"

cat > "$MANIFEST_MD" <<INCIDENT_MANIFEST_MD
# ============================================================
# ACCESS INCIDENT BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_incident_summary.md
- 020_baseline_summary.tsv
- 021_baseline_items.tsv
- 030_legacy_summary.tsv
- 031_legacy_blockers.tsv
- 040_manual_pending.tsv
- 041_manual_items.tsv
- 050_reverify_summary.tsv
- 051_reverify_items.tsv
- 060_bundle_summary.tsv
- 061_bundle_files.tsv
- 070_latest_artifacts.txt
INCIDENT_MANIFEST_MD

cat > "$SUMMARY_MD" <<INCIDENT_SUMMARY_MD
# ============================================================
# ACCESS INCIDENT SUMMARY
# ============================================================

status_snapshot:
- core_status: $CORE_STATUS
- legacy_status: $LEGACY_STATUS
- operations_status: $OPERATIONS_STATUS

counts:
- baseline_fail_count: $BASELINE_FAIL_COUNT
- legacy_blocker_count: $LEGACY_BLOCKER_COUNT
- manual_action_count: $MANUAL_ACTION_COUNT
- reverify_blocker_count: $REVERIFY_BLOCKER_COUNT

bundle_note:
This bundle is intended for incident review, evidence gathering, and shift handoff.
INCIDENT_SUMMARY_MD

echo "============================================================"
echo "ACCESS INCIDENT BUNDLE CREATED"
echo "============================================================"
echo "out_dir     : $OUT_DIR"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
ACCESS_INCIDENT_BUNDLE_CMD
chmod +x "$TOOLS_DIR/access_collect_incident_bundle.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_collect_incident_bundle.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_102'

incident_commands:
- ./access_latest_artifacts.sh
- ./access_collect_incident_bundle.sh
README_APPEND_102
  fi
else
  cat > "$README_FILE" <<'README_NEW_102'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

incident_commands:
- ./access_latest_artifacts.sh
- ./access_collect_incident_bundle.sh
README_NEW_102
fi

echo "============================================================"
echo "ACCESS INCIDENT PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
