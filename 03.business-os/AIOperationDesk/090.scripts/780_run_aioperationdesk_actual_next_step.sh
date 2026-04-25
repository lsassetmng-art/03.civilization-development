#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
RUN_DIR="$APP_ROOT/900.meta/actual_next_step_run_$STAMP"
RESULT_TXT="$RUN_DIR/000_ACTUAL_NEXT_STEP_RESULT.txt"
SUMMARY_MD="$RUN_DIR/000_ACTUAL_NEXT_STEP_SUMMARY.md"
FIX_MD="$RUN_DIR/010_FIX_LANE_PLAN.md"
IMPL_MD="$RUN_DIR/020_PRODUCTION_IMPLEMENTATION_LANE_PLAN.md"

mkdir -p "$RUN_DIR"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL NEXT STEP START'
printf '%s\n' "RUN_DIR=$RUN_DIR"
printf '%s\n' '============================================================'

if [ -f "$APP_ROOT/090.scripts/710_run_aioperationdesk_one_command_final.sh" ]; then
  sh "$APP_ROOT/090.scripts/710_run_aioperationdesk_one_command_final.sh" \
    > "$RUN_DIR/010_one_command_final.log" 2>&1 || true
fi

if [ -f "$APP_ROOT/090.scripts/750_review_aioperationdesk_latest_evidence.sh" ]; then
  sh "$APP_ROOT/090.scripts/750_review_aioperationdesk_latest_evidence.sh" \
    > "$RUN_DIR/020_evidence_review.log" 2>&1 || true
fi

LATEST_REVIEW_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_EVIDENCE_REVIEW_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_REVIEW_SUMMARY="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_EVIDENCE_REVIEW_SUMMARY.md' | sort | tail -n 1 || true)"
LATEST_ONE_COMMAND_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_ONE_COMMAND_FINAL_RESULT.txt' | sort | tail -n 1 || true)"
LATEST_MASTER_RESULT="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_MASTER_CLOSEOUT_RESULT.txt' | sort | tail -n 1 || true)"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

NEXT_CLASS="$(extract_kv "$LATEST_REVIEW_RESULT" 'NEXT_CLASS')"
NEXT_REASON="$(extract_kv "$LATEST_REVIEW_RESULT" 'NEXT_REASON')"
RECOMMENDED_COMMAND="$(extract_kv "$LATEST_REVIEW_RESULT" 'RECOMMENDED_COMMAND')"
FAIL_COUNT="$(extract_kv "$LATEST_REVIEW_RESULT" 'FAIL_COUNT')"
SKIP_COUNT="$(extract_kv "$LATEST_REVIEW_RESULT" 'SKIP_COUNT')"
ONE_COMMAND_FINAL_RESULT="$(extract_kv "$LATEST_ONE_COMMAND_RESULT" 'FINAL_RESULT')"
MASTER_FINAL_RESULT="$(extract_kv "$LATEST_MASTER_RESULT" 'FINAL_RESULT')"

LATEST_FAIL_FILE="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '010_FAIL_LINES.txt' | sort | tail -n 1 || true)"
LATEST_SKIP_FILE="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '020_SKIP_LINES.txt' | sort | tail -n 1 || true)"

cat > "$SUMMARY_MD" <<EOF_SUMMARY
# ============================================================
# AI OPERATION DESK ACTUAL NEXT STEP SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_inputs:
- latest_review_result: ${LATEST_REVIEW_RESULT:-NOT_FOUND}
- latest_review_summary: ${LATEST_REVIEW_SUMMARY:-NOT_FOUND}
- latest_one_command_result: ${LATEST_ONE_COMMAND_RESULT:-NOT_FOUND}
- latest_master_result: ${LATEST_MASTER_RESULT:-NOT_FOUND}

parsed_state:
- next_class: ${NEXT_CLASS:-UNKNOWN}
- next_reason: ${NEXT_REASON:-UNKNOWN}
- recommended_command: ${RECOMMENDED_COMMAND:-UNKNOWN}
- fail_count: ${FAIL_COUNT:-UNKNOWN}
- skip_count: ${SKIP_COUNT:-UNKNOWN}
- one_command_final_result: ${ONE_COMMAND_FINAL_RESULT:-UNKNOWN}
- master_final_result: ${MASTER_FINAL_RESULT:-UNKNOWN}
EOF_SUMMARY

if [ "${NEXT_CLASS:-}" = "production_implementation" ]; then
  cat > "$IMPL_MD" <<EOF_IMPL
# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE PLAN
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

lane: production_implementation

why_this_lane:
${NEXT_REASON:-No explicit reason available.}

start_now:
1. provider http real implementation tightening
   - target file:
     - 080.notifications/line_provider_http_adapter.js
   - next work:
     - real endpoint contract tightening
     - response parsing tightening
     - provider error normalization strengthening

2. trusted auth adapter tightening
   - target file:
     - 020.backend/lib/aiod_header_auth_adapter.js
   - next work:
     - signed/trusted header discipline
     - stronger actor validation
     - fail-closed behavior review

3. replay / cleanup implementation tightening
   - target files:
     - 070.jobs/aiod_replay_executor.js
     - 070.jobs/aiod_cleanup_executor.js
   - next work:
     - guarded live semantics strengthening
     - evidence logging strengthening
     - operational proof strengthening

recommended_next_real_command:
review latest handoff bundle and begin provider/auth/replay/cleanup real implementation edits
EOF_IMPL
else
  cat > "$FIX_MD" <<EOF_FIX
# ============================================================
# AI OPERATION DESK FIX LANE PLAN
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

lane: ${NEXT_CLASS:-UNKNOWN}

why_this_lane:
${NEXT_REASON:-No explicit reason available.}

recommended_first_action:
${RECOMMENDED_COMMAND:-No recommended command available.}

latest_fail_file:
${LATEST_FAIL_FILE:-NOT_FOUND}

latest_skip_file:
${LATEST_SKIP_FILE:-NOT_FOUND}

fix_strategy:
1. inspect latest fail / skip lines
2. identify broken script or missing prerequisite
3. repair lowest broken layer first
4. rerun:
   - 090.scripts/710_run_aioperationdesk_one_command_final.sh
   - 090.scripts/750_review_aioperationdesk_latest_evidence.sh
EOF_FIX

  if [ -n "${LATEST_FAIL_FILE:-}" ] && [ -f "$LATEST_FAIL_FILE" ]; then
    {
      printf '\n%s\n' 'fail_lines:'
      sed -n '1,200p' "$LATEST_FAIL_FILE"
    } >> "$FIX_MD"
  fi

  if [ -n "${LATEST_SKIP_FILE:-}" ] && [ -f "$LATEST_SKIP_FILE" ]; then
    {
      printf '\n%s\n' 'skip_lines:'
      sed -n '1,200p' "$LATEST_SKIP_FILE"
    } >> "$FIX_MD"
  fi
fi

cat > "$RESULT_TXT" <<EOF_RESULT
NEXT_CLASS=${NEXT_CLASS:-UNKNOWN}
NEXT_REASON=${NEXT_REASON:-UNKNOWN}
RECOMMENDED_COMMAND=${RECOMMENDED_COMMAND:-UNKNOWN}
FAIL_COUNT=${FAIL_COUNT:-UNKNOWN}
SKIP_COUNT=${SKIP_COUNT:-UNKNOWN}
SUMMARY_MD=$SUMMARY_MD
FIX_MD=$FIX_MD
IMPL_MD=$IMPL_MD
RUN_DIR=$RUN_DIR
EOF_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL NEXT STEP DONE'
printf '%s\n' "RUN_DIR=$RUN_DIR"
printf '%s\n' "RESULT_TXT=$RESULT_TXT"
printf '%s\n' '============================================================'
sed -n '1,160p' "$SUMMARY_MD"

if [ -f "$IMPL_MD" ]; then
  printf '\n%s\n' '============================================================'
  printf '%s\n' 'PRODUCTION IMPLEMENTATION LANE PLAN'
  printf '%s\n' '============================================================'
  sed -n '1,200p' "$IMPL_MD"
fi

if [ -f "$FIX_MD" ]; then
  printf '\n%s\n' '============================================================'
  printf '%s\n' 'FIX LANE PLAN'
  printf '%s\n' '============================================================'
  sed -n '1,220p' "$FIX_MD"
fi
