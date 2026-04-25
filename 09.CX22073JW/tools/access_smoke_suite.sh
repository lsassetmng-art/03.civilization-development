#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_smoke_suite"
SUMMARY_TXT="$OUT_DIR/000_summary.txt"
RESULTS_TSV="$OUT_DIR/010_results.tsv"

mkdir -p "$OUT_DIR"

pass_count=0
warn_count=0
fail_count=0

run_one() {
  local label="$1"
  local path="$2"
  local out_file="$3"

  if [ ! -x "$path" ]; then
    printf '%s\t%s\t%s\n' "missing" "$label" "$path" >> "$RESULTS_TSV"
    warn_count=$((warn_count + 1))
    return 0
  fi

  if "$path" > "$out_file" 2>&1; then
    printf '%s\t%s\t%s\n' "pass" "$label" "$path" >> "$RESULTS_TSV"
    pass_count=$((pass_count + 1))
  else
    printf '%s\t%s\t%s\n' "fail" "$label" "$path" >> "$RESULTS_TSV"
    fail_count=$((fail_count + 1))
  fi
}

: > "$RESULTS_TSV"

echo "============================================================"
echo "ACCESS SMOKE SUITE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_one "doctor" "$TOOLS_DIR/access_doctor.sh" "$OUT_DIR/100_doctor.log"
run_one "status" "$TOOLS_DIR/access_status.sh" "$OUT_DIR/110_status.log"
run_one "legacy_readiness" "$TOOLS_DIR/access_legacy_readiness.sh" "$OUT_DIR/120_legacy_readiness.log"
run_one "open_blockers" "$TOOLS_DIR/access_open_blockers.sh" "$OUT_DIR/130_open_blockers.log"
run_one "history" "$TOOLS_DIR/access_history.sh" "$OUT_DIR/140_history.log"
run_one "catalog" "$TOOLS_DIR/access_catalog.sh" "$OUT_DIR/150_catalog.log"
run_one "latest_links" "$TOOLS_DIR/access_show_latest_links.sh" "$OUT_DIR/160_latest_links.log"
run_one "list_pending_requests" "$TOOLS_DIR/access_list_pending_requests.sh" "$OUT_DIR/170_list_pending_requests.log"
run_one "list_checkpoints" "$TOOLS_DIR/access_list_checkpoints.sh" "$OUT_DIR/180_list_checkpoints.log"
run_one "compare_latest_runs" "$TOOLS_DIR/access_compare_latest_runs.sh" "$OUT_DIR/190_compare_latest_runs.log"

cat > "$SUMMARY_TXT" <<EOF_ACCESS_SMOKE_SUMMARY
============================================================
ACCESS SMOKE SUITE SUMMARY
============================================================
out_dir=$OUT_DIR
pass_count=$pass_count
warn_count=$warn_count
fail_count=$fail_count
results_tsv=$RESULTS_TSV
============================================================
EOF_ACCESS_SMOKE_SUMMARY

cat "$SUMMARY_TXT"
echo "[results]"
sed -n '1,120p' "$RESULTS_TSV"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
