#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JS_DIR="$ROOT/assets/js"
DESIGN_APP="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

check_file() {
  if [ -f "$1" ]; then ok "$1"; else ng "$1"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

echo "============================================================"
echo "AICompanyManager Phase BM-BP repository skeleton check"
echo "============================================================"

check_file "$JS_DIR/aicm-api-client.js"
check_file "$JS_DIR/aicm-state-adapter.js"
check_file "$JS_DIR/aicm-repository.js"
check_file "$JS_DIR/aicm-local-repository.js"
check_file "$JS_DIR/aicm-api-repository-stub.js"

check_file "$DESIGN_APP/5300_PHASE_BM_BP_REPOSITORY_SKELETON_ROADMAP.md"
check_file "$DESIGN_APP/5310_REPOSITORY_SKELETON_IMPLEMENTATION_CANON.md"
check_file "$DESIGN_APP/5320_LOCAL_REPOSITORY_CANON.md"
check_file "$DESIGN_APP/5330_API_REPOSITORY_STUB_CANON.md"
check_file "$DESIGN_APP/5340_NO_DB_API_CONNECT_GATE.md"

check_grep "AicmApiClient" "$JS_DIR/aicm-api-client.js" "api client class"
check_grep "API_NETWORK_DISABLED" "$JS_DIR/aicm-api-client.js" "api disabled guard"
check_grep "AicmStateAdapter" "$JS_DIR/aicm-state-adapter.js" "state adapter namespace"
check_grep "AicmRepository" "$JS_DIR/aicm-repository.js" "repository interface"
check_grep "AicmLocalRepository" "$JS_DIR/aicm-local-repository.js" "local repository"
check_grep "AicmApiRepositoryStub" "$JS_DIR/aicm-api-repository-stub.js" "api repository stub"
check_grep "AICM_API_STUB_DISABLED" "$JS_DIR/aicm-api-repository-stub.js" "api stub disabled"
check_grep "NO DB/API Connect Gate" "$DESIGN_APP/5340_NO_DB_API_CONNECT_GATE.md" "no connect gate"

if grep -q "aicm-api-client.js" "$ROOT/index.html" 2>/dev/null; then
  ng "index not wired to repository skeleton yet"
else
  ok "index not wired to repository skeleton yet"
fi

SCRIPT_COUNT="$(grep -c '<script ' "$ROOT/index.html" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then
  ok "accepted index one script maintained"
else
  ng "accepted index one script maintained"
fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_BM_BP_REPOSITORY_SKELETON_PASS"
else
  echo "RESULT: PHASE_BM_BP_REPOSITORY_SKELETON_FAIL"
  exit 1
fi
