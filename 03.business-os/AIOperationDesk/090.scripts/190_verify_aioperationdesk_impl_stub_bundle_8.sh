#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/00_AIOPERATIONDESK_IMPLEMENTATION_INTEGRATED.md" \
  "$APP_ROOT/000.docs/FIRST_LOCAL_WALKTHROUGH.md" \
  "$APP_ROOT/000.docs/LOCAL_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/100_run_aioperationdesk_local_mock_stack.sh" \
  "$APP_ROOT/090.scripts/110_run_aioperationdesk_local_db_stack.sh" \
  "$APP_ROOT/090.scripts/120_stop_aioperationdesk_local_stack.sh" \
  "$APP_ROOT/090.scripts/130_smoke_test_aioperationdesk_local_stack.sh" \
  "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh" \
  "$APP_ROOT/090.scripts/150_run_aioperationdesk_full_local_mock_walkthrough.sh" \
  "$APP_ROOT/090.scripts/160_run_aioperationdesk_full_local_db_walkthrough.sh" \
  "$APP_ROOT/090.scripts/170_collect_aioperationdesk_local_run_artifacts.sh" \
  "$APP_ROOT/090.scripts/180_run_aioperationdesk_final_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
