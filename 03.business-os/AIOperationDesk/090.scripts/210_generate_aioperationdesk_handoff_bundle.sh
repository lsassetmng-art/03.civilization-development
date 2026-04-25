#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_IMPLEMENTATION_INTEGRATED.md"
copy_if_exists "$APP_ROOT/000.docs/README.md"
copy_if_exists "$APP_ROOT/000.docs/IMPLEMENTATION_SOURCE_MAP.md"
copy_if_exists "$APP_ROOT/000.docs/LOCAL_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/FIRST_LOCAL_WALKTHROUGH.md"
copy_if_exists "$APP_ROOT/000.docs/OPERATIONS_HANDOFF_CHECKLIST.md"
copy_if_exists "$APP_ROOT/900.meta/900080_AIOPERATIONDESK_IMPLEMENTATION_STUB_BUNDLE_8_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900090_AIOPERATIONDESK_IMPLEMENTATION_FINAL_HANDOFF_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900100_AIOPERATIONDESK_IMPLEMENTATION_COMPLETION_CANDIDATE_SUMMARY.md"

cat > "$MANIFEST" <<EOF
# ============================================================
# AI OPERATION DESK HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,200p' "$MANIFEST"
