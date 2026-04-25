#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/retention_precheck_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

check_file() {
  FILE="$1"
  if [ -f "$FILE" ]; then
    printf 'OK\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  else
    printf 'NG\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  fi
}

: > "$OUT_DIR/000_CHECKLIST.txt"

check_file "$APP_ROOT/000.docs/RETENTION_CLEANUP_REPLAY_POLICY.md"
check_file "$APP_ROOT/020.backend/lib/aiod_notification_replay_candidates.js"
check_file "$APP_ROOT/020.backend/lib/aiod_retention_review_psql.js"
check_file "$APP_ROOT/070.jobs/aiod_replay_jobs_stub.js"
check_file "$APP_ROOT/090.scripts/370_query_aioperationdesk_retention_review_state.sh"
check_file "$APP_ROOT/090.scripts/371_run_aioperationdesk_notification_replay_review.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_RETENTION_REPORT
# ============================================================
# AI OPERATION DESK RETENTION PRECHECK REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- retention / cleanup / replay skeleton presence
- review query script presence
- replay review script presence
EOF_RETENTION_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK RETENTION PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
