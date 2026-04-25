#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/actual_hardening_terminal_handoff_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

LATEST_EVIDENCE_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_RUNTIME_EVIDENCE_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_EVIDENCE_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_RUNTIME_EVIDENCE_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_EVIDENCE_DIGEST_MD="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_RUNTIME_EVIDENCE_DIGEST.md' | sort | tail -n 1 || true)"
LATEST_EVIDENCE_DIGEST_JSON="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_RUNTIME_EVIDENCE_DIGEST.json' | sort | tail -n 1 || true)"
LATEST_LANE2_REPORT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_ACTUAL_HARDENING_EDIT_LANE_2_REPORT.md' | sort | tail -n 1 || true)"
LATEST_LANE2_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_ACTUAL_HARDENING_EDIT_LANE_2_RESULT.txt' | sort | tail -n 1 || true)"
RUNTIME_EVIDENCE_DIR="$APP_ROOT/900.meta/runtime_evidence"

copy_if_exists "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_1.md"
copy_if_exists "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_1_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_2.md"
copy_if_exists "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_2_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_3.md"
copy_if_exists "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_3_RUNBOOK.md"
copy_if_exists "$LATEST_EVIDENCE_REVIEW_SUMMARY"
copy_if_exists "$LATEST_EVIDENCE_REVIEW_RESULT"
copy_if_exists "$LATEST_EVIDENCE_DIGEST_MD"
copy_if_exists "$LATEST_EVIDENCE_DIGEST_JSON"
copy_if_exists "$LATEST_LANE2_REPORT"
copy_if_exists "$LATEST_LANE2_RESULT"
copy_if_exists "$APP_ROOT/900.meta/900500_AIOPERATIONDESK_ACTUAL_HARDENING_EDIT_LANE_1_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900510_AIOPERATIONDESK_ACTUAL_HARDENING_EDIT_LANE_2_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900520_AIOPERATIONDESK_ACTUAL_HARDENING_EDIT_LANE_3_NOTE.md"

if [ -d "$RUNTIME_EVIDENCE_DIR" ]; then
  DEST_DIR="$OUT_DIR/runtime_evidence"
  mkdir -p "$DEST_DIR"
  find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name '*.json' -print0 | while IFS= read -r -d '' FILE; do
    cp "$FILE" "$DEST_DIR/"
  done
fi

cat > "$MANIFEST" <<EOF_AHEL3_MANIFEST
# ============================================================
# AI OPERATION DESK ACTUAL HARDENING TERMINAL HANDOFF MANIFEST
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_AHEL3_MANIFEST

find "$OUT_DIR" -maxdepth 2 -type f | sort | while read -r FILE; do
  REL_PATH="$(printf '%s' "$FILE" | sed "s#^$OUT_DIR/##")"
  printf -- '- %s\n' "$REL_PATH" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL HARDENING TERMINAL HANDOFF GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,260p' "$MANIFEST"
