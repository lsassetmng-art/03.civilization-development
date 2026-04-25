#!/data/data/com.termux/files/usr/bin/sh
set -eu

DESIGN_ROOT="$HOME/01.civilization-system/07.applications/03.business-app/AIOperationDesk"
RUNNER="$DESIGN_ROOT/900.meta/900060_run_aioperationdesk_design_verification.sh"

if [ ! -f "$RUNNER" ]; then
  printf '%s\n' "Design verification runner not found: $RUNNER" >&2
  exit 1
fi

sh "$RUNNER"
