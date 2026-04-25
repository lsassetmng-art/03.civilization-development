#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
SCRIPTS_DIR="$BASE/scripts"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_DIR="$LOGS_DIR/${RUN_TS}_access_legacy_file_blocker_patch_and_gate_refresh"

PATCH_TARGETS="$RUN_DIR/010_patch_targets.txt"
PATCH_LOG="$RUN_DIR/020_patch_log.txt"
SKIP_LOG="$RUN_DIR/030_skip_log.txt"
REFRESH_DB_BLOCKERS_TSV="$RUN_DIR/040_refresh_db_blockers.tsv"
REFRESH_GATE_SUMMARY_JSON="$RUN_DIR/050_refresh_gate_summary.json"
LOG_FILE="$RUN_DIR/060_run.log"

AUDIT_APPLY="$SCRIPTS_DIR/078_apply_cx22073jw_access_legacy_compat_audit.sh"
GATE_APPLY="$SCRIPTS_DIR/080_apply_cx22073jw_access_legacy_cutover_readiness_gate.sh"

mkdir -p "$RUN_DIR"

{
  echo "============================================================"
  echo "ACCESS LEGACY FILE BLOCKER PATCH / GATE REFRESH START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "base         : $BASE"
  echo "run_dir      : $RUN_DIR"
  echo "============================================================"

  if [ ! -x "$AUDIT_APPLY" ]; then
    echo "ERROR: missing audit apply script -> $AUDIT_APPLY"
    exit 1
  fi

  if [ ! -x "$GATE_APPLY" ]; then
    echo "ERROR: missing gate apply script -> $GATE_APPLY"
    exit 1
  fi

  echo "============================================================"
  echo "PHASE 1: COLLECT LATEST FILE BLOCKERS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$PATCH_TARGETS"
SELECT DISTINCT file_path
FROM cx22073jw.v_access_legacy_compat_audit_latest_file_items
WHERE matched_text ~ '\mv_access_[A-Za-z0-9_]+\M'
ORDER BY file_path;
SQL

  sed -n '1,200p' "$PATCH_TARGETS" || true

  : > "$PATCH_LOG"
  : > "$SKIP_LOG"

  echo "============================================================"
  echo "PHASE 2: PATCH FILE BLOCKERS"
  echo "============================================================"

  if [ -s "$PATCH_TARGETS" ]; then
    while IFS= read -r file_path; do
      [ -n "${file_path:-}" ] || continue

      if [ ! -f "$file_path" ]; then
        printf 'MISSING\t%s\n' "$file_path" >> "$SKIP_LOG"
        continue
      fi

      cp "$file_path" "$file_path.bak_access_legacy_file_patch"

      perl -0pi -e 's/\bv_access_/v_access_/g' "$file_path"

      if ! cmp -s "$file_path" "$file_path.bak_access_legacy_file_patch"; then
        printf 'PATCHED\t%s\n' "$file_path" >> "$PATCH_LOG"
      else
        rm -f "$file_path.bak_access_legacy_file_patch"
        printf 'UNCHANGED\t%s\n' "$file_path" >> "$SKIP_LOG"
      fi
    done < "$PATCH_TARGETS"
  else
    echo "WARN: no latest file blockers found"
  fi

  echo "--- PATCH LOG ---"
  sed -n '1,200p' "$PATCH_LOG" || true

  echo "--- SKIP LOG ---"
  sed -n '1,200p' "$SKIP_LOG" || true

  echo "============================================================"
  echo "PHASE 3: RERUN LEGACY COMPAT AUDIT"
  echo "============================================================"
  "$AUDIT_APPLY"

  echo "============================================================"
  echo "PHASE 4: RERUN CUTOVER GATE"
  echo "============================================================"
  "$GATE_APPLY"

  echo "============================================================"
  echo "PHASE 5: EXPORT REFRESHED DB BLOCKERS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$REFRESH_DB_BLOCKERS_TSV"
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
WHERE blocker_group IN ('db_view','db_function')
ORDER BY blocker_group, blocker_identity, blocker_detail;
SQL

  GATE_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT run_code
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  READINESS_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT readiness_status
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  DB_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT db_hit_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  FILE_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT file_hit_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  BLOCKER_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  PATCHED_COUNT="$(grep -c '^PATCHED' "$PATCH_LOG" || true)"
  TARGET_COUNT="$(awk 'END{print NR+0}' "$PATCH_TARGETS")"

  cat > "$REFRESH_GATE_SUMMARY_JSON" <<EOF
{
  "gate_run_code": "$GATE_RUN_CODE",
  "readiness_status": "$READINESS_STATUS",
  "db_hit_count": $DB_HIT_COUNT,
  "file_hit_count": $FILE_HIT_COUNT,
  "blocker_count": $BLOCKER_COUNT,
  "file_blocker_target_count": $TARGET_COUNT,
  "patched_file_count": $PATCHED_COUNT
}
EOF

  echo "============================================================"
  echo "FINAL VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_legacy_cutover_gate_latest_summary;

SELECT
  blocker_group,
  COUNT(*) AS blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
GROUP BY blocker_group
ORDER BY blocker_group;
SQL

  echo "============================================================"
  echo "ACCESS LEGACY FILE BLOCKER PATCH / GATE REFRESH DONE"
  echo "patch_targets : $PATCH_TARGETS"
  echo "patch_log     : $PATCH_LOG"
  echo "skip_log      : $SKIP_LOG"
  echo "db_blockers   : $REFRESH_DB_BLOCKERS_TSV"
  echo "gate_summary  : $REFRESH_GATE_SUMMARY_JSON"
  echo "log_file      : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
