#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/EVIDENCE_REVIEW_AND_NEXT_ACTION_POLICY.md" \
  "$APP_ROOT/090.scripts/750_review_aioperationdesk_latest_evidence.sh" \
  "$APP_ROOT/090.scripts/760_generate_aioperationdesk_next_action_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
