#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/production_proof_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_PROOF_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_PROOF_CLOSEOUT_INTEGRATED.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_PROOF_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_PROOF_POLICY.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_PROOF_CLOSEOUT_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_PROOF_HANDOFF_CHECKLIST.md"
copy_if_exists "$APP_ROOT/900.meta/900270_AIOPERATIONDESK_PRODUCTION_PROOF_BUNDLE_1_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900280_AIOPERATIONDESK_PRODUCTION_PROOF_CLOSEOUT_BUNDLE_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900290_AIOPERATIONDESK_PRODUCTION_PROOF_FINAL_MANIFEST.md"

cat > "$MANIFEST" <<EOF_PROOF_HANDOFF_MANIFEST
# ============================================================
# AI OPERATION DESK PRODUCTION PROOF HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_PROOF_HANDOFF_MANIFEST

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION PROOF HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,200p' "$MANIFEST"
