#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"

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

check_grep_any() {
  local file="$1"
  local label="$2"
  shift 2

  local pattern
  for pattern in "$@"; do
    if grep -q "$pattern" "$file" 2>/dev/null; then
      ok "$label"
      return
    fi
  done

  ng "$label"
}

echo "============================================================"
echo "AICompanyManager Phase FY-GB Web API architecture canon check REPAIRED"
echo "============================================================"

check_file "$DESIGN_APP/8400_PHASE_FY_GB_WEB_API_ARCHITECTURE_CANON_ROADMAP.md"
check_file "$DESIGN_APP/8410_WEB_COMPLETE_WITH_BACKEND_API_CANON.md"
check_file "$DESIGN_APP/8420_BROWSER_SECURITY_BOUNDARY_CANON.md"
check_file "$DESIGN_APP/8430_BACKEND_API_RECOMMENDED_STRUCTURE_CANON.md"
check_file "$DESIGN_APP/8440_READONLY_API_CONNECT_NEXT_GATE_UPDATED.md"
check_file "$DESIGN_APP/8450_WEB_API_ARCHITECTURE_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8460_PHASE_FY_GB_WEB_API_ARCHITECTURE_REPAIR_ROADMAP.md"

check_grep_any "$DESIGN_APP/8410_WEB_COMPLETE_WITH_BACKEND_API_CANON.md" "recommended backend api" \
  "HTML UI + backend API" \
  "Backend API" \
  "backend API" \
  "Web complete with backend API" \
  "Web API込み"

check_grep "browser-only service role" "$DESIGN_APP/8410_WEB_COMPLETE_WITH_BACKEND_API_CANON.md" "browser only forbidden"
check_grep "service role key" "$DESIGN_APP/8420_BROWSER_SECURITY_BOUNDARY_CANON.md" "service role forbidden"
check_grep "backend API" "$DESIGN_APP/8430_BACKEND_API_RECOMMENDED_STRUCTURE_CANON.md" "backend api structure"
check_grep "GET /api/aicm/v1/bootstrap" "$DESIGN_APP/8440_READONLY_API_CONNECT_NEXT_GATE_UPDATED.md" "readonly bootstrap next"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8450_WEB_API_ARCHITECTURE_NO_CONNECT_GATE.md" "real api not executed"
check_grep "NOT EXECUTED" "$DESIGN_APP/8450_WEB_API_ARCHITECTURE_NO_CONNECT_GATE.md" "not executed marker"

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_FY_GB_WEB_API_ARCHITECTURE_CANON_REPAIRED_PASS"
else
  echo "RESULT: PHASE_FY_GB_WEB_API_ARCHITECTURE_CANON_REPAIRED_FAIL"
  exit 1
fi
