#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/followup_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

LATEST_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FOLLOWUP_EVIDENCE_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FOLLOWUP_EVIDENCE_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_PASS_REPORT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_CONTROLLED_LIVE_HARDENING_PASS_REPORT.md' | sort | tail -n 1 || true)"
LATEST_PASS_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_CONTROLLED_LIVE_HARDENING_PASS_RESULT.txt' | sort | tail -n 1 || true)"

copy_if_exists "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_IMPLEMENTATION.md"
copy_if_exists "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2.md"
copy_if_exists "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2_RUNBOOK.md"
copy_if_exists "$LATEST_REVIEW_SUMMARY"
copy_if_exists "$LATEST_REVIEW_RESULT"
copy_if_exists "$LATEST_PASS_REPORT"
copy_if_exists "$LATEST_PASS_RESULT"
copy_if_exists "$APP_ROOT/900.meta/900460_AIOPERATIONDESK_LINE_B_PASS_FOLLOWUP_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900470_AIOPERATIONDESK_LINE_B_PASS_FOLLOWUP_LANE_2_NOTE.md"

cat > "$MANIFEST" <<EOF_FOLLOWUP2_MANIFEST
# ============================================================
# AI OPERATION DESK FOLLOWUP HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_FOLLOWUP2_MANIFEST

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FOLLOWUP HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,220p' "$MANIFEST"
