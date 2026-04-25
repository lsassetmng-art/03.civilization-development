#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/CLEANUP_EXECUTOR_EXACT.md" \
  "$APP_ROOT/000.docs/PRODUCTION_TRACK_CLOSEOUT_RUNBOOK.md" \
  "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_TRACK_INTEGRATED.md" \
  "$APP_ROOT/070.jobs/aiod_cleanup_executor.js" \
  "$APP_ROOT/090.scripts/470_run_aioperationdesk_cleanup_executor_dry_run.sh" \
  "$APP_ROOT/090.scripts/480_run_aioperationdesk_production_track_precheck_all.sh" \
  "$APP_ROOT/090.scripts/490_generate_aioperationdesk_production_track_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
