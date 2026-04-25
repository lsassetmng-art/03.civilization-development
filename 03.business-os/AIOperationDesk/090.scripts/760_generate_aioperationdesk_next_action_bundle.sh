#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/next_action_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

LATEST_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_EVIDENCE_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_EVIDENCE_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_ULTIMATE_HANDOFF_DIR="$(find "$APP_ROOT/900.meta" -maxdepth 1 -type d -name 'ultimate_handoff_bundle_*' | sort | tail -n 1 || true)"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/000.docs/EVIDENCE_REVIEW_AND_NEXT_ACTION_POLICY.md"
copy_if_exists "$LATEST_REVIEW_SUMMARY"
copy_if_exists "$LATEST_REVIEW_RESULT"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_ONE_COMMAND_CLOSEOUT_INTEGRATED.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_MASTER_EXECUTION_CLOSEOUT_INTEGRATED.md"
copy_if_exists "$APP_ROOT/900.meta/900350_AIOPERATIONDESK_ULTIMATE_FINAL_MANIFEST.md"

if [ -n "${LATEST_ULTIMATE_HANDOFF_DIR:-}" ] && [ -d "$LATEST_ULTIMATE_HANDOFF_DIR" ]; then
  DEST_DIR="$OUT_DIR/$(basename "$LATEST_ULTIMATE_HANDOFF_DIR")"
  mkdir -p "$DEST_DIR"
  find "$LATEST_ULTIMATE_HANDOFF_DIR" -maxdepth 1 -type f -print0 | while IFS= read -r -d '' FILE; do
    cp "$FILE" "$DEST_DIR/"
  done
fi

cat > "$MANIFEST" <<EOF_NEXT_MANIFEST
# ============================================================
# AI OPERATION DESK NEXT ACTION BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_NEXT_MANIFEST

find "$OUT_DIR" -maxdepth 2 -type f | sort | while read -r FILE; do
  REL_PATH="$(printf '%s' "$FILE" | sed "s#^$OUT_DIR/##")"
  printf -- '- %s\n' "$REL_PATH" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK NEXT ACTION BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,220p' "$MANIFEST"
