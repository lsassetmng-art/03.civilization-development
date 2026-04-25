#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

run_cmd() {
  local label="$1"
  local path="$2"
  shift 2 || true

  echo "============================================================"
  echo "$label"
  echo "============================================================"

  if [ ! -x "$path" ]; then
    echo "MISSING COMMAND: $path"
    return 1
  fi

  "$path" "$@"
}

while true; do
  echo "============================================================"
  echo "ACCESS MENU"
  echo "============================================================"
  echo "1) status"
  echo "2) latest batch"
  echo "3) open blockers"
  echo "4) legacy readiness"
  echo "5) daily refresh"
  echo "6) export current bundle"
  echo "7) make shift report"
  echo "8) confirm request"
  echo "9) reverify confirmed"
  echo "10) doctor"
  echo "0) exit"
  printf "select> "
  IFS= read -r choice

  case "${choice:-}" in
    1)
      run_cmd "ACCESS STATUS" "$TOOLS_DIR/access_status.sh"
      ;;
    2)
      run_cmd "ACCESS LATEST BATCH" "$TOOLS_DIR/access_show_latest_batch.sh"
      ;;
    3)
      run_cmd "ACCESS OPEN BLOCKERS" "$TOOLS_DIR/access_open_blockers.sh"
      ;;
    4)
      run_cmd "ACCESS LEGACY READINESS" "$TOOLS_DIR/access_legacy_readiness.sh"
      ;;
    5)
      run_cmd "ACCESS DAILY REFRESH" "$TOOLS_DIR/access_daily_refresh.sh"
      ;;
    6)
      run_cmd "ACCESS EXPORT CURRENT BUNDLE" "$TOOLS_DIR/access_export_current_bundle.sh"
      ;;
    7)
      run_cmd "ACCESS MAKE SHIFT REPORT" "$TOOLS_DIR/access_make_shift_report.sh"
      ;;
    8)
      printf "request_code> "
      IFS= read -r request_code
      printf "status[confirmed_applied]> "
      IFS= read -r status_value
      printf "executor[Zero]> "
      IFS= read -r executor_name
      printf "note[manual confirm]> "
      IFS= read -r note_text
      printf "batch_code[latest]> "
      IFS= read -r batch_code

      [ -n "${status_value:-}" ] || status_value="confirmed_applied"
      [ -n "${executor_name:-}" ] || executor_name="Zero"
      [ -n "${note_text:-}" ] || note_text="manual confirm from access_menu.sh"

      run_cmd \
        "ACCESS CONFIRM REQUEST" \
        "$TOOLS_DIR/access_confirm_request.sh" \
        "${request_code:-}" \
        "$status_value" \
        "$executor_name" \
        "$note_text" \
        "${batch_code:-}"
      ;;
    9)
      printf "batch_code[latest]> "
      IFS= read -r batch_code
      printf "actor[Zero]> "
      IFS= read -r actor_name
      [ -n "${actor_name:-}" ] || actor_name="Zero"

      run_cmd \
        "ACCESS REVERIFY CONFIRMED" \
        "$TOOLS_DIR/access_reverify_confirmed.sh" \
        "${batch_code:-}" \
        "$actor_name"
      ;;
    10)
      run_cmd "ACCESS DOCTOR" "$TOOLS_DIR/access_doctor.sh"
      ;;
    0)
      echo "EXIT"
      break
      ;;
    *)
      echo "INVALID SELECTION"
      ;;
  esac
done
