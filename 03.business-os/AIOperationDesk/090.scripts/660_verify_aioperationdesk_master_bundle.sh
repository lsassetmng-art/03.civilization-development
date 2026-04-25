#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/MASTER_ORCHESTRATION_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/600_run_aioperationdesk_master_verify.sh" \
  "$APP_ROOT/090.scripts/610_run_aioperationdesk_master_local_pass.sh" \
  "$APP_ROOT/090.scripts/620_run_aioperationdesk_master_hardening_pass.sh" \
  "$APP_ROOT/090.scripts/630_run_aioperationdesk_master_production_track_pass.sh" \
  "$APP_ROOT/090.scripts/640_run_aioperationdesk_master_production_proof_pass.sh" \
  "$APP_ROOT/090.scripts/650_run_aioperationdesk_master_closeout.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
