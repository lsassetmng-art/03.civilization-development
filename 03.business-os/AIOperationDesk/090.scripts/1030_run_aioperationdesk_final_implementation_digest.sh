#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/final_implementation_digest_$(date +%Y%m%d_%H%M%S)"
RUNTIME_DIR="$APP_ROOT/900.meta/runtime_evidence"

mkdir -p "$OUT_DIR"

PROVIDER_COUNT="0"
REPLAY_COUNT="0"

if [ -d "$RUNTIME_DIR" ]; then
  PROVIDER_COUNT="$(find "$RUNTIME_DIR" -maxdepth 1 -type f -name 'provider_live_*.json' | wc -l | tr -d ' ')"
  REPLAY_COUNT="$(find "$RUNTIME_DIR" -maxdepth 1 -type f -name 'replay_live_*.json' | wc -l | tr -d ' ')"
fi

cat > "$OUT_DIR/000_FINAL_IMPLEMENTATION_DIGEST.md" <<EOF_DIGEST_MIN
# ============================================================
# AI OPERATION DESK FINAL IMPLEMENTATION DIGEST
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero

runtime_evidence:
- dir: $RUNTIME_DIR
- provider_count: $PROVIDER_COUNT
- replay_count: $REPLAY_COUNT
EOF_DIGEST_MIN

printf '%s\n' 'AIOPERATIONDESK_FINAL_IMPLEMENTATION_DIGEST_DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
sed -n '1,120p' "$OUT_DIR/000_FINAL_IMPLEMENTATION_DIGEST.md"
