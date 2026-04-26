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
SATO_PACKAGE="${DESIGN_APP}/7240_SATO_REVIEW_SUBMISSION_PACKAGE.md"
NO_APPLY="${DESIGN_APP}/7250_DB_RLS_CANDIDATE_NO_APPLY_GATE.md"

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
echo "AICompanyManager Phase EC-EF DB/RLS candidates check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/7200_PHASE_EC_EF_DB_RLS_CANDIDATES_ROADMAP.md"
check_file "$DDL_SQL"
check_file "$RLS_SQL"
check_file "$ROLLBACK_SQL"
check_file "$SATO_PACKAGE"
check_file "$NO_APPLY"

echo "------------------------------------------------------------"
echo "[2] DDL candidate"
check_grep "CANDIDATE ONLY / NOT APPLIED" "$DDL_SQL" "ddl candidate only marker"
check_grep "create schema if not exists business" "$DDL_SQL" "business schema"
check_grep "aicm_company" "$DDL_SQL" "company table"
check_grep "aicm_actor_membership" "$DDL_SQL" "actor membership table"
check_grep "aicm_department_task_ledger" "$DDL_SQL" "task ledger table"
check_grep "aicm_task_file_metadata" "$DDL_SQL" "file metadata table"
check_grep "aicm_review_item" "$DDL_SQL" "review item table"
check_grep "aicm_workflow_run" "$DDL_SQL" "workflow run table"

echo "------------------------------------------------------------"
echo "[3] RLS candidate"
check_grep "CANDIDATE ONLY / NOT APPLIED" "$RLS_SQL" "rls candidate only marker"
check_grep "enable row level security" "$RLS_SQL" "rls enable marker"
check_grep "aicm_can_access_company" "$RLS_SQL" "access helper"
check_grep "aicm_has_company_role" "$RLS_SQL" "role helper"
check_grep "create policy" "$RLS_SQL" "policy exists"
check_grep "auth.uid" "$RLS_SQL" "auth uid reference"

echo "------------------------------------------------------------"
echo "[4] Rollback candidate"
check_grep "Rollback Candidate" "$ROLLBACK_SQL" "rollback candidate marker"
check_grep "drop policy if exists" "$ROLLBACK_SQL" "drop policies"
check_grep "drop table if exists business.aicm_workflow_step" "$ROLLBACK_SQL" "drop workflow step"
check_grep "drop function if exists business.aicm_can_access_company" "$ROLLBACK_SQL" "drop helper function"

echo "------------------------------------------------------------"
echo "[5] Sato package and gates"
check_grep "佐藤" "$SATO_PACKAGE" "sato reviewer"
check_grep "PERSONA_DATABASE_URL" "$SATO_PACKAGE" "persona env"
check_grep "DATABASE_URL" "$SATO_PACKAGE" "database url warning"
check_grep "DB apply:" "$NO_APPLY" "db apply decision"
check_grep "STOP" "$NO_APPLY" "stop decision"
check_grep "psql:" "$NO_APPLY" "psql no apply marker"

echo "------------------------------------------------------------"
echo "[6] Prohibited naming"
if grep -Riq "Aiemployee\|aiemployee\|ai_employee" "$DDL_SQL" "$RLS_SQL" "$ROLLBACK_SQL"; then
  ng "no aiemployee table naming"
else
  ok "no aiemployee table naming"
fi

echo "------------------------------------------------------------"
echo "[7] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_EC_EF_DB_RLS_CANDIDATES_PASS"
else
  echo "RESULT: PHASE_EC_EF_DB_RLS_CANDIDATES_FAIL"
  exit 1
fi
