#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

DDL_SQL="${DESIGN_APP}/7210_DDL_EXACT_APPLY_CANDIDATE.sql"
RLS_SQL="${DESIGN_APP}/7220_RLS_EXACT_APPLY_CANDIDATE.sql"
ROLLBACK_SQL="${DESIGN_APP}/7230_DB_RLS_ROLLBACK_CANDIDATE.sql"

SELF_CHECK="${DESIGN_APP}/7310_SATO_REVIEW_SELF_CHECK.md"
ISSUE_LIST="${DESIGN_APP}/7320_DDL_RLS_CANDIDATE_ISSUE_LIST.md"
APPLY_ORDER="${DESIGN_APP}/7330_DB_APPLY_ORDER_PLAN.md"
SPLIT_PLAN="${DESIGN_APP}/7340_FINAL_SQL_SPLIT_PLAN.md"
NO_APPLY="${DESIGN_APP}/7350_SATO_SELF_REVIEW_NO_APPLY_GATE.md"

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
echo "AICompanyManager Phase EG-EJ Sato self review check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/7300_PHASE_EG_EJ_SATO_SELF_REVIEW_ROADMAP.md"
check_file "$SELF_CHECK"
check_file "$ISSUE_LIST"
check_file "$APPLY_ORDER"
check_file "$SPLIT_PLAN"
check_file "$NO_APPLY"
check_file "$DDL_SQL"
check_file "$RLS_SQL"
check_file "$ROLLBACK_SQL"

echo "------------------------------------------------------------"
echo "[2] Self check"
check_grep "gen_random_uuid" "$SELF_CHECK" "gen_random_uuid issue"
check_grep "bootstrap" "$SELF_CHECK" "bootstrap issue"
check_grep "aiworker_robot_id" "$SELF_CHECK" "aiworker id type issue"
check_grep "idempotency" "$SELF_CHECK" "idempotency issue"
check_grep "STOP" "$SELF_CHECK" "self decision stop"

echo "------------------------------------------------------------"
echo "[3] Issue list"
check_grep "pgcrypto" "$ISSUE_LIST" "pgcrypto issue listed"
check_grep "First owner membership" "$ISSUE_LIST" "first owner issue listed"
check_grep "review action" "$ISSUE_LIST" "review issue listed"
check_grep "aiworker_robot_id" "$ISSUE_LIST" "aiworker type issue listed"
check_grep "Must fix" "$ISSUE_LIST" "must fix section"

echo "------------------------------------------------------------"
echo "[4] Apply order and split plan"
check_grep "Step 0" "$APPLY_ORDER" "apply step 0"
check_grep "extension precheck" "$APPLY_ORDER" "extension precheck"
check_grep "bootstrap strategy" "$APPLY_ORDER" "bootstrap strategy"
check_grep "RLS helper functions" "$APPLY_ORDER" "rls helper step"
check_grep "01_extension_precheck.sql" "$SPLIT_PLAN" "split extension file"
check_grep "03_bootstrap_rpc.sql" "$SPLIT_PLAN" "split bootstrap file"
check_grep "05_rls_enable_and_policies.sql" "$SPLIT_PLAN" "split rls file"
check_grep "90_rollback.sql" "$SPLIT_PLAN" "split rollback file"

echo "------------------------------------------------------------"
echo "[5] No apply gate"
check_grep "DB WRITE:" "$NO_APPLY" "db write no apply"
check_grep "psql:" "$NO_APPLY" "psql no apply"
check_grep "STOP" "$NO_APPLY" "stop marker"
check_grep "real API connect" "$NO_APPLY" "real api stop"
check_grep "live AIWorkerOS call" "$NO_APPLY" "live aiworker stop"

echo "------------------------------------------------------------"
echo "[6] Candidate files still candidate only"
check_grep "CANDIDATE ONLY / NOT APPLIED" "$DDL_SQL" "ddl still candidate"
check_grep "CANDIDATE ONLY / NOT APPLIED" "$RLS_SQL" "rls still candidate"
check_grep "CANDIDATE ONLY / NOT APPLIED" "$ROLLBACK_SQL" "rollback still candidate"

echo "------------------------------------------------------------"
echo "[7] Prohibited naming"
if grep -Riq "Aiemployee\|aiemployee\|ai_employee" "$DDL_SQL" "$RLS_SQL" "$ROLLBACK_SQL" "$SELF_CHECK" "$ISSUE_LIST"; then
  ng "no aiemployee naming"
else
  ok "no aiemployee naming"
fi

echo "------------------------------------------------------------"
echo "[8] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_EG_EJ_SATO_SELF_REVIEW_PASS"
else
  echo "RESULT: PHASE_EG_EJ_SATO_SELF_REVIEW_FAIL"
  exit 1
fi
