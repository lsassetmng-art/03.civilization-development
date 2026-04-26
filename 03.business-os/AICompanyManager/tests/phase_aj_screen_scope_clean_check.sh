#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

[ -f "$ROOT/index.html" ] && ok "index exists" || ng "index missing"
[ -f "$ROOT/assets/js/phase-aj-clean-ui.js" ] && ok "clean js exists" || ng "clean js missing"
[ -f "$ROOT/assets/css/phase-aj-clean-ui.css" ] && ok "clean css exists" || ng "clean css missing"

grep -q 'phase-aj-clean-ui.js' "$ROOT/index.html" && ok "index loads clean js" || ng "index does not load clean js"

SCRIPT_COUNT="$(grep -c '<script ' "$ROOT/index.html" || true)"
[ "$SCRIPT_COUNT" -eq 1 ] && ok "script count is 1" || ng "script count is not 1"

grep -q 'data-screen-scope="dashboard"' "$ROOT/assets/js/phase-aj-clean-ui.js" && ok "dashboard scoped" || ng "dashboard scope missing"
grep -q 'data-screen-scope="task-ledger"' "$ROOT/assets/js/phase-aj-clean-ui.js" && ok "task ledger scoped" || ng "task ledger scope missing"
grep -q 'data-screen-scope="inbox"' "$ROOT/assets/js/phase-aj-clean-ui.js" && ok "inbox scoped" || ng "inbox scope missing"
grep -q 'CSVアップロード' "$ROOT/assets/js/phase-aj-clean-ui.js" && ok "csv upload exists" || ng "csv upload missing"
grep -q '台帳行の変更' "$ROOT/assets/js/phase-aj-clean-ui.js" && ok "ledger edit exists" || ng "ledger edit missing"
grep -q '配布操作' "$ROOT/assets/js/phase-aj-clean-ui.js" && ok "distribution exists" || ng "distribution missing"

if grep -q 'MutationObserver' "$ROOT/assets/js/phase-aj-clean-ui.js"; then
  ng "MutationObserver remains"
else
  ok "MutationObserver removed"
fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_AJ_SCREEN_SCOPE_CLEAN_PASS"
else
  echo "RESULT: PHASE_AJ_SCREEN_SCOPE_CLEAN_FAIL"
  exit 1
fi
