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
echo "ACCESS FINISH LINE START"
echo "============================================================"

run_step "[1/5] completion gate" "$TOOLS_DIR/access_completion_gate.sh"
run_step "[2/5] release readiness" "$TOOLS_DIR/access_release_readiness.sh"
run_step "[3/5] completion bundle" "$TOOLS_DIR/access_make_completion_bundle.sh"
run_step "[4/5] refresh latest links" "$TOOLS_DIR/access_refresh_latest_links.sh"
run_step "[5/5] end state" "$TOOLS_DIR/access_show_end_state.sh"

echo "============================================================"
echo "ACCESS FINISH LINE SUMMARY"
echo "============================================================"
echo "pass_count=$pass_count"
echo "warn_count=$warn_count"
echo "fail_count=$fail_count"
echo "============================================================"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
