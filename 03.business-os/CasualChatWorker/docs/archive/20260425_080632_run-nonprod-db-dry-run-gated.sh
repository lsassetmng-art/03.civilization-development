#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
RUNNER="${IMPL_ROOT}/backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js"
OUT_DIR="${IMPL_ROOT}/docs/verification/$(date +%Y%m%d_%H%M%S)_nonprod_db_dryrun_gated"
mkdir -p "$OUT_DIR"

echo '============================================================'
echo 'CasualChatWorker NonProd DB DryRun Gated Runner'
echo 'This runner is rollback-only and requires explicit flags.'
echo '============================================================'

: "${CCW_APPROVE_NONPROD_DB_DRY_RUN:?ERROR: set CCW_APPROVE_NONPROD_DB_DRY_RUN=1}"
: "${CCW_BACKEND_MODE:?ERROR: set CCW_BACKEND_MODE=nonprod_db_dry_run}"
: "${CCW_ENABLE_NONPROD_DB_DRY_RUN:?ERROR: set CCW_ENABLE_NONPROD_DB_DRY_RUN=1}"
: "${CCW_CONFIRM_ROLLBACK_TEST:?ERROR: set CCW_CONFIRM_ROLLBACK_TEST=1}"
: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

if [ "$CCW_APPROVE_NONPROD_DB_DRY_RUN" != "1" ]; then
  echo 'STOP: CCW_APPROVE_NONPROD_DB_DRY_RUN must be 1'
  exit 1
fi

if [ "$CCW_BACKEND_MODE" != "nonprod_db_dry_run" ]; then
  echo 'STOP: CCW_BACKEND_MODE must be nonprod_db_dry_run'
  exit 1
fi

if [ "$CCW_ENABLE_NONPROD_DB_DRY_RUN" != "1" ]; then
  echo 'STOP: CCW_ENABLE_NONPROD_DB_DRY_RUN must be 1'
  exit 1
fi

if [ "$CCW_CONFIRM_ROLLBACK_TEST" != "1" ]; then
  echo 'STOP: CCW_CONFIRM_ROLLBACK_TEST must be 1'
  exit 1
fi

if [ ! -f "$RUNNER" ]; then
  echo "STOP: runner missing: $RUNNER"
  exit 1
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo 'STOP: DATABASE_URL is set. ERP DB path is forbidden for this dry-run.'
  exit 1
fi

set +e
node "$RUNNER" > "$OUT_DIR/010_stdout.log" 2> "$OUT_DIR/011_stderr.log"
EXIT_CODE="$?"
set -e

cat > "$OUT_DIR/000_summary.md" <<MD_SUMMARY
# CasualChatWorker NonProd DB DryRun Gated Summary

status: completed
exit_code: ${EXIT_CODE}

runner:
- ${RUNNER}

logs:
- ${OUT_DIR}/010_stdout.log
- ${OUT_DIR}/011_stderr.log

important:
- This dry-run must rollback.
- Inspect stdout for ROLLBACK DONE.
MD_SUMMARY

cat "$OUT_DIR/000_summary.md"
echo '============================================================'
echo '[STDOUT]'
cat "$OUT_DIR/010_stdout.log" || true
echo '============================================================'
echo '[STDERR]'
cat "$OUT_DIR/011_stderr.log" || true
echo '============================================================'

if [ "$EXIT_CODE" -ne 0 ]; then
  exit "$EXIT_CODE"
fi

if ! grep -q 'ROLLBACK DONE' "$OUT_DIR/010_stdout.log"; then
  echo 'STOP: rollback confirmation missing'
  exit 1
fi

echo 'DRYRUN PASS WITH ROLLBACK CONFIRMED'
