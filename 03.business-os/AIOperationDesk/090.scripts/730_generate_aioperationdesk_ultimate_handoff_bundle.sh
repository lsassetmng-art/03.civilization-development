#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/ultimate_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_IMPLEMENTATION_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_HARDENING_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_TRACK_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_PROOF_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_PROOF_CLOSEOUT_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_MASTER_EXECUTION_CLOSEOUT_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_ONE_COMMAND_CLOSEOUT_INTEGRATED.md"
copy_if_exists "$APP_ROOT/000.docs/MASTER_ORCHESTRATION_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/MASTER_EXECUTION_CLOSEOUT_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/EXECUTION_DECISION_MATRIX.md"
copy_if_exists "$APP_ROOT/000.docs/ONE_COMMAND_FINAL_RUNBOOK.md"
copy_if_exists "$APP_ROOT/900.meta/900310_AIOPERATIONDESK_MASTER_FINAL_MANIFEST.md"
copy_if_exists "$APP_ROOT/900.meta/900330_AIOPERATIONDESK_MASTER_EXECUTION_FINAL_MANIFEST.md"
copy_if_exists "$APP_ROOT/900.meta/900340_AIOPERATIONDESK_ONE_COMMAND_BUNDLE_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900350_AIOPERATIONDESK_ULTIMATE_FINAL_MANIFEST.md"

cat > "$MANIFEST" <<EOF_ULTIMATE_HANDOFF_MANIFEST
# ============================================================
# AI OPERATION DESK ULTIMATE HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_ULTIMATE_HANDOFF_MANIFEST

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ULTIMATE HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,220p' "$MANIFEST"
