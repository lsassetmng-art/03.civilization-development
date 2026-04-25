#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/final_terminal_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

LATEST_FINAL_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_CLOSEOUT_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_FINAL_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_CLOSEOUT_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_FINAL_END_REPORT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_CLOSEOUT_TO_END_REPORT.md' | sort | tail -n 1 || true)"
LATEST_FINAL_END_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_CLOSEOUT_TO_END_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_FOLLOWUP_HANDOFF_DIR="$(find "$APP_ROOT/900.meta" -maxdepth 1 -type d -name 'followup_handoff_bundle_*' | sort | tail -n 1 || true)"

copy_if_exists "$APP_ROOT/000.docs/FINAL_CLOSEOUT_TO_END.md"
copy_if_exists "$APP_ROOT/000.docs/FINAL_CLOSEOUT_TO_END_RUNBOOK.md"
copy_if_exists "$LATEST_FINAL_REVIEW_SUMMARY"
copy_if_exists "$LATEST_FINAL_REVIEW_RESULT"
copy_if_exists "$LATEST_FINAL_END_REPORT"
copy_if_exists "$LATEST_FINAL_END_RESULT"
copy_if_exists "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_IMPLEMENTATION.md"
copy_if_exists "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2.md"
copy_if_exists "$APP_ROOT/900.meta/900470_AIOPERATIONDESK_LINE_B_PASS_FOLLOWUP_LANE_2_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900480_AIOPERATIONDESK_FINAL_CLOSEOUT_TO_END_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900490_AIOPERATIONDESK_TERMINAL_FINAL_MANIFEST.md"

if [ -n "${LATEST_FOLLOWUP_HANDOFF_DIR:-}" ] && [ -d "$LATEST_FOLLOWUP_HANDOFF_DIR" ]; then
  DEST_DIR="$OUT_DIR/$(basename "$LATEST_FOLLOWUP_HANDOFF_DIR")"
  mkdir -p "$DEST_DIR"
  find "$LATEST_FOLLOWUP_HANDOFF_DIR" -maxdepth 1 -type f -print0 | while IFS= read -r -d '' FILE; do
    cp "$FILE" "$DEST_DIR/"
  done
fi

cat > "$MANIFEST" <<EOF_FINAL_END_MANIFEST
# ============================================================
# AI OPERATION DESK FINAL TERMINAL HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_FINAL_END_MANIFEST

find "$OUT_DIR" -maxdepth 2 -type f | sort | while read -r FILE; do
  REL_PATH="$(printf '%s' "$FILE" | sed "s#^$OUT_DIR/##")"
  printf -- '- %s\n' "$REL_PATH" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL TERMINAL HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,240p' "$MANIFEST"
