#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/OPERATIONS_HANDOFF_CHECKLIST.md" \
  "$APP_ROOT/090.scripts/200_run_aioperationdesk_release_candidate_audit.sh" \
  "$APP_ROOT/090.scripts/210_generate_aioperationdesk_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
