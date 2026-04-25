#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/project_terminal_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"
RUNTIME_EVIDENCE_DIR="$APP_ROOT/900.meta/runtime_evidence"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

LATEST_FINAL_BEHAVIOR_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_BEHAVIOR_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_FINAL_BEHAVIOR_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_BEHAVIOR_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_FINAL_BEHAVIOR_REPORT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_BEHAVIOR_PROOF_REPORT.md' | sort | tail -n 1 || true)"
LATEST_FINAL_BEHAVIOR_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_BEHAVIOR_PROOF_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_FINAL_IMPLEMENTATION_DIGEST="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_IMPLEMENTATION_DIGEST.md' | sort | tail -n 1 || true)"

copy_if_exists "$APP_ROOT/000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION.md"
copy_if_exists "$APP_ROOT/000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/FINAL_IMPLEMENTATION_TIGHTENING.md"
copy_if_exists "$APP_ROOT/000.docs/FINAL_IMPLEMENTATION_TIGHTENING_RUNBOOK.md"
copy_if_exists "$LATEST_FINAL_BEHAVIOR_REVIEW_SUMMARY"
copy_if_exists "$LATEST_FINAL_BEHAVIOR_REVIEW_RESULT"
copy_if_exists "$LATEST_FINAL_BEHAVIOR_REPORT"
copy_if_exists "$LATEST_FINAL_BEHAVIOR_RESULT"
copy_if_exists "$LATEST_FINAL_IMPLEMENTATION_DIGEST"
copy_if_exists "$APP_ROOT/900.meta/900530_AIOPERATIONDESK_FINAL_IMPLEMENTATION_TIGHTENING_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900540_AIOPERATIONDESK_PROJECT_TERMINAL_NOTE.md"

if [ -d "$RUNTIME_EVIDENCE_DIR" ]; then
  DEST_DIR="$OUT_DIR/runtime_evidence"
  mkdir -p "$DEST_DIR"
  find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name '*.json' -print0 | while IFS= read -r -d '' FILE; do
    cp "$FILE" "$DEST_DIR/"
  done
fi

cat > "$MANIFEST" <<EOF_TERM_HANDOFF_MANIFEST
# ============================================================
# AI OPERATION DESK PROJECT TERMINAL BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_TERM_HANDOFF_MANIFEST

find "$OUT_DIR" -maxdepth 2 -type f | sort | while read -r FILE; do
  REL_PATH="$(printf '%s' "$FILE" | sed "s#^$OUT_DIR/##")"
  printf -- '- %s\n' "$REL_PATH" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PROJECT TERMINAL BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,260p' "$MANIFEST"
