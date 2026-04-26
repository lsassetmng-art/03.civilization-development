#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

REPORT="${DESIGN_APP}/7590_PHASE_EO_ER_DB_RLS_APPLY_COMPLETION_REPORT.md"
BOSS_OK="${DESIGN_APP}/7510_BOSS_DB_OK_RECORD.md"
ENV_GATE="${DESIGN_APP}/7520_PERSONA_DB_APPLY_ENV_GATE.md"
NO_API_GATE="${DESIGN_APP}/7591_DB_APPLY_NO_API_GATE.md"

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
echo "AICompanyManager Phase EO-ER DB/RLS apply file check"
echo "============================================================"

check_file "$DESIGN_APP/7500_PHASE_EO_ER_DB_RLS_APPLY_ROADMAP.md"
check_file "$BOSS_OK"
check_file "$ENV_GATE"
check_file "$NO_API_GATE"
check_file "$REPORT"

check_grep "boss_db_ok: GO" "$BOSS_OK" "boss db ok recorded"
check_grep "sato_review: GO" "$BOSS_OK" "sato go recorded"
check_grep "PERSONA_DATABASE_URL" "$ENV_GATE" "persona db env gate"
check_grep "DB WRITE:" "$NO_API_GATE" "db write marker"
check_grep "EXECUTED" "$NO_API_GATE" "executed marker"
check_grep "REAL API CONNECT:" "$NO_API_GATE" "real api gate"
check_grep "NOT EXECUTED" "$NO_API_GATE" "not executed marker"
check_grep "result: PASS" "$REPORT" "apply report pass"

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_EO_ER_DB_RLS_APPLY_FILE_CHECK_PASS"
else
  echo "RESULT: PHASE_EO_ER_DB_RLS_APPLY_FILE_CHECK_FAIL"
  exit 1
fi
