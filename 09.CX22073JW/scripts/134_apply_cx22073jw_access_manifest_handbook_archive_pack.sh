#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"
LOGS_DIR="$BASE/logs"
ARCHIVE_DIR="$BASE/archive"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR" "$LOGS_DIR" "$ARCHIVE_DIR"

cat > "$TOOLS_DIR/access_make_workspace_manifest.sh" <<'ACCESS_WORKSPACE_MANIFEST_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LATEST_DIR="$BASE/latest"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
ARCHIVE_DIR="$BASE/archive"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_workspace_manifest"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_workspace_manifest_summary.md"
TOOLS_TSV="$OUT_DIR/020_tools.tsv"
SCRIPTS_TSV="$OUT_DIR/030_scripts.tsv"
DOCS_TSV="$OUT_DIR/040_docs.tsv"
LATEST_TSV="$OUT_DIR/050_latest.tsv"
EXPORTS_TSV="$OUT_DIR/060_exports.tsv"
ARCHIVE_TSV="$OUT_DIR/070_archive.tsv"
DB_STATUS_TSV="$OUT_DIR/080_db_status.tsv"
HASH_TSV="$OUT_DIR/090_hash.tsv"

mkdir -p "$OUT_DIR"

list_files_simple() {
  local dir_path="$1"
  local tag="$2"
  local out_file="$3"

  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type f | sort | while IFS= read -r p; do
      [ -n "${p:-}" ] || continue
      size_bytes="$(wc -c < "$p" | tr -d '[:space:]' || true)"
      printf '%s\t%s\t%s\n' "$tag" "$p" "${size_bytes:-0}"
    done > "$out_file"
  else
    : > "$out_file"
  fi
}

list_dir_simple() {
  local dir_path="$1"
  local tag="$2"
  local out_file="$3"

  if [ -d "$dir_path" ]; then
    find "$dir_path" -mindepth 1 -maxdepth 2 | sort | while IFS= read -r p; do
      [ -n "${p:-}" ] || continue
      if [ -d "$p" ]; then
        printf '%s\t%s\t%s\n' "$tag" "dir" "$p"
      elif [ -f "$p" ]; then
        printf '%s\t%s\t%s\n' "$tag" "file" "$p"
      elif [ -L "$p" ]; then
        printf '%s\t%s\t%s\n' "$tag" "link" "$p"
      fi
    done > "$out_file"
  else
    : > "$out_file"
  fi
}

list_files_simple "$TOOLS_DIR" "tool" "$TOOLS_TSV"
list_files_simple "$SCRIPTS_DIR" "script" "$SCRIPTS_TSV"
list_files_simple "$DOCS_DIR" "doc" "$DOCS_TSV"

if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | sort | while IFS= read -r p; do
    [ -n "${p:-}" ] || continue
    if [ -L "$p" ]; then
      printf '%s\t%s\t%s\n' "link" "$(basename "$p")" "$(readlink "$p" || true)"
    elif [ -d "$p" ]; then
      printf '%s\t%s\t%s\n' "dir" "$(basename "$p")" "$p"
    elif [ -f "$p" ]; then
      printf '%s\t%s\t%s\n' "file" "$(basename "$p")" "$p"
    fi
  done > "$LATEST_TSV"
else
  : > "$LATEST_TSV"
fi

list_dir_simple "$EXPORTS_DIR" "export" "$EXPORTS_TSV"
list_dir_simple "$ARCHIVE_DIR" "archive" "$ARCHIVE_TSV"

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

{
  find "$TOOLS_DIR" -maxdepth 1 -type f
  find "$SCRIPTS_DIR" -maxdepth 1 -type f
  find "$DOCS_DIR" -maxdepth 1 -type f
} | sort | while IFS= read -r p; do
  [ -n "${p:-}" ] || continue
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$p"
  else
    cksum "$p"
  fi
done > "$HASH_TSV"

TOOLS_COUNT="$(awk 'END{print NR+0}' "$TOOLS_TSV")"
SCRIPTS_COUNT="$(awk 'END{print NR+0}' "$SCRIPTS_TSV")"
DOCS_COUNT="$(awk 'END{print NR+0}' "$DOCS_TSV")"
LATEST_COUNT="$(awk 'END{print NR+0}' "$LATEST_TSV")"
EXPORTS_COUNT="$(awk 'END{print NR+0}' "$EXPORTS_TSV")"
ARCHIVE_COUNT="$(awk 'END{print NR+0}' "$ARCHIVE_TSV")"
HASH_COUNT="$(awk 'END{print NR+0}' "$HASH_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_MANIFEST_134
# ============================================================
# ACCESS WORKSPACE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_workspace_manifest_summary.md
- 020_tools.tsv
- 030_scripts.tsv
- 040_docs.tsv
- 050_latest.tsv
- 060_exports.tsv
- 070_archive.tsv
- 080_db_status.tsv
- 090_hash.tsv
EOF_ACCESS_MANIFEST_134

cat > "$SUMMARY_MD" <<EOF_ACCESS_SUMMARY_134
# ============================================================
# ACCESS WORKSPACE MANIFEST SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

inventory_counts:
- tools: $TOOLS_COUNT
- scripts: $SCRIPTS_COUNT
- docs: $DOCS_COUNT
- latest_entries: $LATEST_COUNT
- export_entries: $EXPORTS_COUNT
- archive_entries: $ARCHIVE_COUNT
- hash_rows: $HASH_COUNT

note:
This manifest is the consolidated workspace inventory and DB status snapshot.
EOF_ACCESS_SUMMARY_134

echo "============================================================"
echo "ACCESS WORKSPACE MANIFEST CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
ACCESS_WORKSPACE_MANIFEST_CMD
chmod +x "$TOOLS_DIR/access_make_workspace_manifest.sh"

cat > "$TOOLS_DIR/access_make_operator_handbook.sh" <<'ACCESS_OPERATOR_HANDBOOK_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
DOCS_DIR="$BASE/docs"
OUT_FILE="$DOCS_DIR/068_ACCESS_OPERATOR_HANDBOOK.md"

mkdir -p "$DOCS_DIR"

cat > "$OUT_FILE" <<'EOF_ACCESS_HANDBOOK_134'
# ============================================================
# ACCESS OPERATOR HANDBOOK
# ============================================================

## 1. 入口
- `./access_dashboard.sh`
- `./access_quickstart.sh`
- `./access_menu.sh`

## 2. 日常確認
- `./access_status.sh`
- `./access_run_review_flow.sh`
- `./access_legacy_readiness.sh`
- `./access_open_blockers.sh`

## 3. pending 対応
- `./access_list_pending_requests.sh`
- `./access_trace_request.sh REQUEST_CODE`
- `./access_confirm_request.sh REQUEST_CODE confirmed_applied`
- `./access_reverify_confirmed.sh`
- `./access_export_current_bundle.sh`

## 4. 一括処理
- `./access_bulk_confirm_all_pending.sh confirmed_applied`
- `./access_bulk_apply_cycle.sh confirmed_applied`

## 5. 調査 / trace
- `./access_trace_request.sh REQUEST_CODE`
- `./access_trace_logical_view.sh LOGICAL_VIEW_NAME`
- `./access_make_request_trace_bundle.sh REQUEST_CODE`
- `./access_make_logical_view_trace_bundle.sh LOGICAL_VIEW_NAME`

## 6. 引き継ぎ / 証跡
- `./access_make_shift_report.sh`
- `./access_make_timeline_report.sh`
- `./access_make_master_bundle.sh`
- `./access_make_final_handoff_bundle.sh`
- `./access_collect_incident_bundle.sh`

## 7. 健全性 / 回帰
- `./access_doctor.sh`
- `./access_validate_workspace.sh`
- `./access_smoke_suite.sh`
- `./access_make_regression_bundle.sh`
- `./access_release_readiness.sh`

## 8. 台帳 / 差分 / checkpoint
- `./access_make_checkpoint.sh`
- `./access_list_checkpoints.sh`
- `./access_compare_checkpoints.sh`
- `./access_make_checkpoint_diff_report.sh`
- `./access_compare_latest_runs.sh`
- `./access_make_delta_report.sh`

## 9. 保管 / cleanup
- `./access_workspace_stats.sh`
- `./access_make_storage_report.sh`
- `./access_cleanup_preview.sh 14`
- `./access_cleanup_empty_dirs.sh`
- `./access_archive_old_artifacts_preview.sh 30`
- `./access_archive_old_artifacts_move.sh 30 apply`

## 10. 正本整理
- `./access_make_workspace_manifest.sh`
- `./access_make_command_matrix.sh`
- `./access_refresh_latest_links.sh`
- `./access_show_latest_links.sh`
- `./access_latest_artifacts.sh`

## 11. 推奨フロー
1. `./access_dashboard.sh`
2. `./access_run_review_flow.sh`
3. 必要なら pending / trace / confirm
4. `./access_run_handoff_flow.sh`
5. `./access_release_readiness.sh`
6. `./access_make_final_handoff_bundle.sh`
EOF_ACCESS_HANDBOOK_134

echo "============================================================"
echo "ACCESS OPERATOR HANDBOOK CREATED"
echo "============================================================"
echo "out_file : $OUT_FILE"
echo "============================================================"
sed -n '1,160p' "$OUT_FILE"
ACCESS_OPERATOR_HANDBOOK_CMD
chmod +x "$TOOLS_DIR/access_make_operator_handbook.sh"

cat > "$TOOLS_DIR/access_archive_old_artifacts_preview.sh" <<'ACCESS_ARCHIVE_PREVIEW_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AGE_DAYS="${1:-30}"

case "$AGE_DAYS" in
  ''|*[!0-9]*)
    echo "ERROR: AGE_DAYS must be numeric"
    echo "USAGE: access_archive_old_artifacts_preview.sh [AGE_DAYS]"
    exit 1
    ;;
esac

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"

TMP_LATEST="$BASE/.tmp_access_latest_targets_$$.txt"
trap 'rm -f "$TMP_LATEST"' EXIT

: > "$TMP_LATEST"
if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 -type l | sort | while IFS= read -r lnk; do
    [ -n "${lnk:-}" ] || continue
    readlink "$lnk" >> "$TMP_LATEST" 2>/dev/null || true
  done
fi

is_latest_target() {
  local candidate="$1"
  grep -Fxq "$candidate" "$TMP_LATEST" 2>/dev/null
}

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS PREVIEW"
echo "============================================================"
echo "age_days : $AGE_DAYS"
echo "============================================================"

echo "[log dir candidates]"
if [ -d "$LOGS_DIR" ]; then
  find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if is_latest_target "$d"; then
      printf 'SKIP_LATEST\t%s\n' "$d"
    else
      printf 'CANDIDATE\t%s\n' "$d"
    fi
  done
fi

echo
echo "[export dir candidates]"
if [ -d "$EXPORTS_DIR" ]; then
  find "$EXPORTS_DIR" -mindepth 2 -maxdepth 2 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if is_latest_target "$d"; then
      printf 'SKIP_LATEST\t%s\n' "$d"
    else
      printf 'CANDIDATE\t%s\n' "$d"
    fi
  done
fi

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS PREVIEW DONE"
echo "============================================================"
ACCESS_ARCHIVE_PREVIEW_CMD
chmod +x "$TOOLS_DIR/access_archive_old_artifacts_preview.sh"

cat > "$TOOLS_DIR/access_archive_old_artifacts_move.sh" <<'ACCESS_ARCHIVE_MOVE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AGE_DAYS="${1:-30}"
MODE="${2:-dry_run}"

case "$AGE_DAYS" in
  ''|*[!0-9]*)
    echo "ERROR: AGE_DAYS must be numeric"
    echo "USAGE: access_archive_old_artifacts_move.sh [AGE_DAYS] [dry_run|apply]"
    exit 1
    ;;
esac

case "$MODE" in
  dry_run|apply)
    ;;
  *)
    echo "ERROR: MODE must be dry_run or apply"
    exit 1
    ;;
esac

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"
ARCHIVE_DIR="$BASE/archive"
ARCHIVE_LOGS_DIR="$ARCHIVE_DIR/logs"
ARCHIVE_EXPORTS_DIR="$ARCHIVE_DIR/exports"

TMP_LATEST="$BASE/.tmp_access_latest_targets_move_$$.txt"
TMP_CANDIDATES="$BASE/.tmp_access_archive_candidates_$$.txt"
trap 'rm -f "$TMP_LATEST" "$TMP_CANDIDATES"' EXIT

mkdir -p "$ARCHIVE_LOGS_DIR" "$ARCHIVE_EXPORTS_DIR"
: > "$TMP_LATEST"
: > "$TMP_CANDIDATES"

if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 -type l | sort | while IFS= read -r lnk; do
    [ -n "${lnk:-}" ] || continue
    readlink "$lnk" >> "$TMP_LATEST" 2>/dev/null || true
  done
fi

is_latest_target() {
  local candidate="$1"
  grep -Fxq "$candidate" "$TMP_LATEST" 2>/dev/null
}

if [ -d "$LOGS_DIR" ]; then
  find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if ! is_latest_target "$d"; then
      printf 'logs\t%s\n' "$d" >> "$TMP_CANDIDATES"
    fi
  done
fi

if [ -d "$EXPORTS_DIR" ]; then
  find "$EXPORTS_DIR" -mindepth 2 -maxdepth 2 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if ! is_latest_target "$d"; then
      printf 'exports\t%s\n' "$d" >> "$TMP_CANDIDATES"
    fi
  done
fi

CANDIDATE_COUNT="$(awk 'END{print NR+0}' "$TMP_CANDIDATES")"

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS MOVE"
echo "============================================================"
echo "age_days       : $AGE_DAYS"
echo "mode           : $MODE"
echo "candidate_count: $CANDIDATE_COUNT"
echo "============================================================"

sed -n '1,200p' "$TMP_CANDIDATES" || true

if [ "$MODE" != "apply" ]; then
  echo "DRY_RUN_ONLY"
  exit 0
fi

while IFS=$'\t' read -r group path; do
  [ -n "${group:-}" ] || continue
  [ -n "${path:-}" ] || continue

  base_name="$(basename "$path")"
  if [ "$group" = "logs" ]; then
    dest="$ARCHIVE_LOGS_DIR/$base_name"
  else
    dest="$ARCHIVE_EXPORTS_DIR/$base_name"
  fi

  if [ -e "$dest" ]; then
    dest="${dest}_dup_$(date +%Y%m%d_%H%M%S)"
  fi

  mv "$path" "$dest"
  printf 'MOVED\t%s\t%s\n' "$path" "$dest"
done < "$TMP_CANDIDATES"

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS MOVE DONE"
echo "============================================================"
ACCESS_ARCHIVE_MOVE_CMD
chmod +x "$TOOLS_DIR/access_archive_old_artifacts_move.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_make_workspace_manifest.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_134'

manifest_archive_commands:
- ./access_make_workspace_manifest.sh
- ./access_make_operator_handbook.sh
- ./access_archive_old_artifacts_preview.sh [AGE_DAYS]
- ./access_archive_old_artifacts_move.sh [AGE_DAYS] [dry_run|apply]

recommended_manifest_archive_flow:
1. ./access_make_workspace_manifest.sh
2. ./access_make_operator_handbook.sh
3. ./access_archive_old_artifacts_preview.sh 30
4. ./access_archive_old_artifacts_move.sh 30 dry_run
README_APPEND_134
  fi
else
  cat > "$README_FILE" <<'README_NEW_134'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

manifest_archive_commands:
- ./access_make_workspace_manifest.sh
- ./access_make_operator_handbook.sh
- ./access_archive_old_artifacts_preview.sh [AGE_DAYS]
- ./access_archive_old_artifacts_move.sh [AGE_DAYS] [dry_run|apply]
README_NEW_134
fi

echo "============================================================"
echo "ACCESS MANIFEST HANDBOOK ARCHIVE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
