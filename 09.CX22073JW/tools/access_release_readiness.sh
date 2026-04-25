#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_release_readiness"
SUMMARY_TXT="$OUT_DIR/000_summary.txt"
RESULTS_TSV="$OUT_DIR/010_results.tsv"

mkdir -p "$OUT_DIR"
: > "$RESULTS_TSV"

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

echo "============================================================"
echo "ACCESS RELEASE READINESS"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

run_one "dashboard" "$TOOLS_DIR/access_dashboard.sh" "$OUT_DIR/100_dashboard.log"
run_one "doctor" "$TOOLS_DIR/access_doctor.sh" "$OUT_DIR/110_doctor.log"
run_one "validate_workspace" "$TOOLS_DIR/access_validate_workspace.sh" "$OUT_DIR/120_validate_workspace.log"
run_one "review_flow" "$TOOLS_DIR/access_run_review_flow.sh" "$OUT_DIR/130_review_flow.log"
run_one "compare_latest_runs" "$TOOLS_DIR/access_compare_latest_runs.sh" "$OUT_DIR/140_compare_latest_runs.log"
run_one "workspace_stats" "$TOOLS_DIR/access_workspace_stats.sh" "$OUT_DIR/150_workspace_stats.log"
run_one "smoke_suite" "$TOOLS_DIR/access_smoke_suite.sh" "$OUT_DIR/160_smoke_suite.log"

cat > "$SUMMARY_TXT" <<EOF_ACCESS_RELEASE_SUMMARY
============================================================
ACCESS RELEASE READINESS SUMMARY
============================================================
out_dir=$OUT_DIR
pass_count=$pass_count
warn_count=$warn_count
fail_count=$fail_count
results_tsv=$RESULTS_TSV
============================================================
EOF_ACCESS_RELEASE_SUMMARY

cat "$SUMMARY_TXT"
echo "[results]"
sed -n '1,120p' "$RESULTS_TSV"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
