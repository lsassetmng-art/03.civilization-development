#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/12.common-os"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_DIR="$ROOT/.reports/${STAMP}_verify_commonos_phase_c1"
REPORT_FILE="$REPORT_DIR/000_verify_report.txt"

mkdir -p "$REPORT_DIR"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf 'PASS: %s\n' "$1" >> "$REPORT_FILE"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf 'FAIL: %s\n' "$1" >> "$REPORT_FILE"
}

require_file() {
  TARGET="$1"
  if [ -f "$TARGET" ]; then
    pass "file exists -> $TARGET"
  else
    fail "missing file -> $TARGET"
  fi
}

require_grep() {
  PATTERN="$1"
  TARGET="$2"
  LABEL="$3"
  if grep -q "$PATTERN" "$TARGET"; then
    pass "$LABEL"
  else
    fail "$LABEL"
  fi
}

: > "$REPORT_FILE"

require_file "$ROOT/CommonTokenSet/dist/commonos.tokens.css"
require_file "$ROOT/CommonTokenSet/dist/commonos.variants.css"
require_file "$ROOT/CommonUIRuntime/dist/commonos.components.css"
require_file "$ROOT/CommonUIRuntime/dist/commonos.runtime.js"
require_file "$ROOT/CommonShell/dist/commonos.shell.css"
require_file "$ROOT/CommonShell/dist/commonos.shell.js"
require_file "$ROOT/CommonSyncPresentation/dist/commonos.sync.css"
require_file "$ROOT/CommonSyncPresentation/dist/commonos.sync.js"
require_file "$ROOT/CommonOSPlayground/dist/index.html"
require_file "$ROOT/AppCommonStarter/sql/001_app_common_phase_c1_bootstrap.sql"

require_grep "button:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Button component implementation present"
require_grep "iconButton:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "IconButton component implementation present"
require_grep "textField:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "TextField component implementation present"
require_grep "textArea:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "TextArea component implementation present"
require_grep "selectField:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Select component implementation present"
require_grep "checkboxField:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Checkbox component implementation present"
require_grep "radioGroup:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Radio component implementation present"
require_grep "switchField:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Switch component implementation present"
require_grep "card:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Card component implementation present"
require_grep "table:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Table component implementation present"
require_grep "list:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "List component implementation present"
require_grep "dialog:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Dialog component implementation present"
require_grep "toastHost:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Toast component implementation present"
require_grep "statusChip:" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "Status chip implementation present"
require_grep "createShell" "$ROOT/CommonShell/dist/commonos.shell.js" "App shell implementation present"

require_grep "offline" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "offline queue surface present"
require_grep "pending" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "pending queue surface present"
require_grep "processing" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "processing queue surface present"
require_grep "retry_wait" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "retry_wait queue surface present"
require_grep "sent" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "sent queue surface present"
require_grep "failed" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "failed queue surface present"
require_grep "conflict" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "conflict queue surface present"
require_grep "Retry now" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js" "retry action entry point present"

require_grep "aria-live" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "state announcement support present"
require_grep ":focus-visible" "$ROOT/CommonUIRuntime/dist/commonos.components.css" "focus visibility present"
require_grep "role: \"dialog\"" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js" "semantic dialog role present"
require_grep "queue meaning remains in the owning domain" "$ROOT/CommonOSPlayground/dist/index.html" "boundary note present"

{
  printf '%s\n' '============================================================'
  printf '%s\n' 'COMMONOS PHASE C1 VERIFY SUMMARY'
  printf '%s\n' '============================================================'
  printf 'PASS_COUNT=%s\n' "$PASS_COUNT"
  printf 'FAIL_COUNT=%s\n' "$FAIL_COUNT"
  printf '%s\n' '------------------------------------------------------------'
  cat "$REPORT_FILE"
  printf '%s\n' '------------------------------------------------------------'
  if [ "$FAIL_COUNT" -eq 0 ]; then
    printf '%s\n' 'FINAL_RESULT=PASS'
  else
    printf '%s\n' 'FINAL_RESULT=FAIL'
    exit 1
  fi
} | tee "$REPORT_DIR/001_verify_summary.txt"
