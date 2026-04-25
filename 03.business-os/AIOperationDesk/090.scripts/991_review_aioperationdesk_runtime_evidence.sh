#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/runtime_evidence_review_$STAMP"
SUMMARY_MD="$OUT_DIR/000_RUNTIME_EVIDENCE_REVIEW_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_RUNTIME_EVIDENCE_REVIEW_RESULT.txt"
RUNTIME_EVIDENCE_DIR="$APP_ROOT/900.meta/runtime_evidence"

mkdir -p "$OUT_DIR"

TOTAL_COUNT="0"
PROVIDER_COUNT="0"
REPLAY_COUNT="0"

if [ -d "$RUNTIME_EVIDENCE_DIR" ]; then
  TOTAL_COUNT="$(find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name '*.json' | wc -l | tr -d ' ')"
  PROVIDER_COUNT="$(find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name 'provider_live_*.json' | wc -l | tr -d ' ')"
  REPLAY_COUNT="$(find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name 'replay_live_*.json' | wc -l | tr -d ' ')"
fi

LATEST_PROVIDER_FILE="$(find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name 'provider_live_*.json' 2>/dev/null | sort | tail -n 1 || true)"
LATEST_REPLAY_FILE="$(find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name 'replay_live_*.json' 2>/dev/null | sort | tail -n 1 || true)"
LATEST_LANE2_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_ACTUAL_HARDENING_EDIT_LANE_2_RESULT.txt' | sort | tail -n 1 || true)"

NEXT_CLASS="evidence_missing_fix"
NEXT_ACTION="run controlled live hardening with runtime evidence again and inspect failing live steps"
if [ "$TOTAL_COUNT" -gt 0 ]; then
  NEXT_CLASS="evidence_based_hardening_edit"
  NEXT_ACTION="use runtime evidence files to tighten provider/auth/replay implementation paths"
fi

cat > "$SUMMARY_MD" <<EOF_AHEL2_SUMMARY
# ============================================================
# AI OPERATION DESK RUNTIME EVIDENCE REVIEW SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

runtime_evidence_dir:
- $RUNTIME_EVIDENCE_DIR

counts:
- total_count: $TOTAL_COUNT
- provider_count: $PROVIDER_COUNT
- replay_count: $REPLAY_COUNT

latest_files:
- provider_live: ${LATEST_PROVIDER_FILE:-NOT_FOUND}
- replay_live: ${LATEST_REPLAY_FILE:-NOT_FOUND}
- lane2_result: ${LATEST_LANE2_RESULT:-NOT_FOUND}

decision:
- next_class: $NEXT_CLASS
- next_action: $NEXT_ACTION
EOF_AHEL2_SUMMARY

cat > "$RESULT_TXT" <<EOF_AHEL2_REVIEW_RESULT
TOTAL_COUNT=$TOTAL_COUNT
PROVIDER_COUNT=$PROVIDER_COUNT
REPLAY_COUNT=$REPLAY_COUNT
LATEST_PROVIDER_FILE=${LATEST_PROVIDER_FILE:-NOT_FOUND}
LATEST_REPLAY_FILE=${LATEST_REPLAY_FILE:-NOT_FOUND}
NEXT_CLASS=$NEXT_CLASS
NEXT_ACTION=$NEXT_ACTION
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_AHEL2_REVIEW_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK RUNTIME EVIDENCE REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "SUMMARY_MD=$SUMMARY_MD"
printf '%s\n' '============================================================'
sed -n '1,180p' "$SUMMARY_MD"

if [ -n "${LATEST_PROVIDER_FILE:-}" ] && [ -f "$LATEST_PROVIDER_FILE" ]; then
  printf '\n%s\n' '============================================================'
  printf '%s\n' 'LATEST PROVIDER EVIDENCE HEAD'
  printf '%s\n' '============================================================'
  sed -n '1,120p' "$LATEST_PROVIDER_FILE"
fi

if [ -n "${LATEST_REPLAY_FILE:-}" ] && [ -f "$LATEST_REPLAY_FILE" ]; then
  printf '\n%s\n' '============================================================'
  printf '%s\n' 'LATEST REPLAY EVIDENCE HEAD'
  printf '%s\n' '============================================================'
  sed -n '1,120p' "$LATEST_REPLAY_FILE"
fi
