#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/line_b_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

LATEST_LINE_B_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_LINE_B_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_LINE_B_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_LINE_B_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_LINE_B_REPORT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_LINE_B_LIVE_PROOF_REPORT.md' | sort | tail -n 1 || true)"
LATEST_LINE_B_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_LINE_B_LIVE_PROOF_RESULT.txt' | sort | tail -n 1 || true)"

copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_CLOSEOUT.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_RUNBOOK.md"
copy_if_exists "$LATEST_LINE_B_REVIEW_SUMMARY"
copy_if_exists "$LATEST_LINE_B_REVIEW_RESULT"
copy_if_exists "$LATEST_LINE_B_REPORT"
copy_if_exists "$LATEST_LINE_B_RESULT"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_LIVE_PROOF_POLICY.md"
copy_if_exists "$APP_ROOT/900.meta/900420_AIOPERATIONDESK_PRODUCTION_IMPLEMENTATION_BUNDLE_4_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900430_AIOPERATIONDESK_LINE_B_CLOSEOUT_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900440_AIOPERATIONDESK_LINE_B_FINAL_MANIFEST.md"

cat > "$MANIFEST" <<EOF_LINE_B_HANDOFF_MANIFEST
# ============================================================
# AI OPERATION DESK LINE B HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_LINE_B_HANDOFF_MANIFEST

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,220p' "$MANIFEST"
