#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

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

SATO_GO="${DESIGN_APP}/7410_SATO_REVIEW_GO_RECORD.md"
EXT_SQL="${DESIGN_APP}/7420_01_EXTENSION_PRECHECK_CANDIDATE.sql"
BASE_SQL="${DESIGN_APP}/7421_02_BASE_TABLES_REFINED_CANDIDATE.sql"
BOOTSTRAP_SQL="${DESIGN_APP}/7422_03_BOOTSTRAP_RPC_REFINED_CANDIDATE.sql"
RLS_HELPERS_SQL="${DESIGN_APP}/7423_04_RLS_HELPERS_REFINED_CANDIDATE.sql"
RLS_POLICIES_SQL="${DESIGN_APP}/7424_05_RLS_POLICIES_REFINED_CANDIDATE.sql"
VERIFY_SQL="${DESIGN_APP}/7425_06_VERIFICATION_CANDIDATE.sql"
ROLLBACK_SQL="${DESIGN_APP}/7426_90_ROLLBACK_REFINED_CANDIDATE.sql"
APPLY_SEQUENCE="${DESIGN_APP}/7430_FINAL_APPLY_SEQUENCE_PLAN.md"
BOSS_GATE="${DESIGN_APP}/7440_BOSS_DB_OK_WAIT_GATE.md"
NO_APPLY="${DESIGN_APP}/7450_REFINED_DB_RLS_V2_NO_APPLY_GATE.md"

echo "============================================================"
echo "AICompanyManager Phase EK-EN refined DB/RLS v2 check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/7400_PHASE_EK_EN_REFINED_DB_RLS_V2_ROADMAP.md"
check_file "$SATO_GO"
check_file "$EXT_SQL"
check_file "$BASE_SQL"
check_file "$BOOTSTRAP_SQL"
check_file "$RLS_HELPERS_SQL"
check_file "$RLS_POLICIES_SQL"
check_file "$VERIFY_SQL"
check_file "$ROLLBACK_SQL"
check_file "$APPLY_SEQUENCE"
check_file "$BOSS_GATE"
check_file "$NO_APPLY"

echo "------------------------------------------------------------"
echo "[2] Sato GO and Boss gate"
check_grep "review_result: GO" "$SATO_GO" "sato go recorded"
check_grep "Boss DB OK" "$BOSS_GATE" "boss db ok gate"
check_grep "WAITING" "$BOSS_GATE" "boss db ok waiting"
check_grep "DB OK" "$BOSS_GATE" "required db ok phrase"

echo "------------------------------------------------------------"
echo "[3] SQL candidates"
check_grep "create extension if not exists pgcrypto" "$EXT_SQL" "pgcrypto precheck"
check_grep "aicm_review_action" "$BASE_SQL" "review action table"
check_grep "idempotency_key" "$BASE_SQL" "idempotency column"
check_grep "aicm_create_company_with_owner" "$BOOTSTRAP_SQL" "bootstrap rpc"
check_grep "aicm_apply_review_action" "$BOOTSTRAP_SQL" "review action rpc"
check_grep "aicm_start_workflow_local_stub" "$BOOTSTRAP_SQL" "workflow local stub rpc"
check_grep "aicm_can_access_company" "$RLS_HELPERS_SQL" "rls access helper"
check_grep "enable row level security" "$RLS_POLICIES_SQL" "rls enable"
check_grep "pg_policies" "$VERIFY_SQL" "verification policies"
check_grep "drop function if exists business.aicm_create_company_with_owner" "$ROLLBACK_SQL" "rollback bootstrap function"

echo "------------------------------------------------------------"
echo "[4] No apply gate"
check_grep "DB WRITE:" "$NO_APPLY" "db write no apply"
check_grep "psql:" "$NO_APPLY" "psql no apply"
check_grep "NOT EXECUTED" "$NO_APPLY" "not executed markers"
check_grep "STOP" "$NO_APPLY" "db apply stop"

echo "------------------------------------------------------------"
echo "[5] Prohibited naming"
if grep -Riq "Aiemployee\|aiemployee\|ai_employee" "$EXT_SQL" "$BASE_SQL" "$BOOTSTRAP_SQL" "$RLS_HELPERS_SQL" "$RLS_POLICIES_SQL" "$VERIFY_SQL" "$ROLLBACK_SQL"; then
  ng "no aiemployee naming"
else
  ok "no aiemployee naming"
fi

echo "------------------------------------------------------------"
echo "[6] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_EK_EN_REFINED_DB_RLS_V2_PASS"
else
  echo "RESULT: PHASE_EK_EN_REFINED_DB_RLS_V2_FAIL"
  exit 1
fi
