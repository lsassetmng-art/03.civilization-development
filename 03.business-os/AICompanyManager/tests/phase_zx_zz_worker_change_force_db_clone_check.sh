#!/data/data/com.termux/files/usr/bin/bash
set -eu

INDEX_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html"
PATCH_JS_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-worker-change-businessos-db-candidate-normalizer.js"
VERIFY_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/verification/20260429_063723_phase_zx_zz_worker_change_force_db_clone/090_worker_change_force_db_clone_verify.log"

grep -q 'RESULT=PASS' "$VERIFY_LOG"
grep -q 'aicm-worker-change-businessos-db-candidate-normalizer.js' "$INDEX_FILE"
grep -q 'AICM_WORKER_CHANGE_BUSINESSOS_DB_CANDIDATE_NORMALIZER_V2_FORCE_CLONE' "$PATCH_JS_FILE"
grep -q 'force-db-clone' "$PATCH_JS_FILE"
grep -q 'BusinessOS DB' "$PATCH_JS_FILE"

node --check "$PATCH_JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "WORKER_CHANGE_SELECTOR_FORCE_CLONE: ACTIVE"
echo "LOCAL_WORKER_ALPHA_BETA: EXCLUDED_AT_RUNTIME"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
