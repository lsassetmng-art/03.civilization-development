#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/final_implementation_tightening_precheck_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

: > "$OUT_DIR/000_CHECKLIST.txt"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_auth_mode_policy.js" \
  "$APP_ROOT/020.backend/lib/aiod_header_auth_keyed.js" \
  "$APP_ROOT/020.backend/lib/aiod_request_context.js" \
  "$APP_ROOT/020.backend/lib/aiod_operational_evidence_psql.js" \
  "$APP_ROOT/080.notifications/line_provider_http_impl.js" \
  "$APP_ROOT/070.jobs/aiod_replay_executor.js"
do
  if [ -f "$FILE" ]; then
    printf 'OK\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  else
    printf 'NG\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  fi
done

cat > "$OUT_DIR/000_REPORT.md" <<'EOF_FIT_PRECHECK_MIN_REPORT'
# ============================================================
# AI OPERATION DESK FINAL IMPLEMENTATION TIGHTENING PRECHECK
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero
EOF_FIT_PRECHECK_MIN_REPORT

printf '%s\n' 'FINAL_IMPLEMENTATION_TIGHTENING_PRECHECK_DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
