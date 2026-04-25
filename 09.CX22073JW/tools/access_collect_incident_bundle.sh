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
