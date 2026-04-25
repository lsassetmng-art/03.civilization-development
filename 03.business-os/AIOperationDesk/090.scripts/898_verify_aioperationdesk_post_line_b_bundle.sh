#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/POST_LINE_B_NEXT_ACTION_POLICY.md" \
  "$APP_ROOT/00_AIOPERATIONDESK_POST_LINE_B_INTEGRATED.md" \
  "$APP_ROOT/090.scripts/895_run_aioperationdesk_line_b_actual_execute.sh" \
  "$APP_ROOT/090.scripts/896_collect_aioperationdesk_line_b_evidence_bundle.sh" \
  "$APP_ROOT/090.scripts/897_generate_aioperationdesk_post_line_b_next_action_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
