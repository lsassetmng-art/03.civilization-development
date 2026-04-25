#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/final_implementation_handoff_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"
RUNTIME_DIR="$APP_ROOT/900.meta/runtime_evidence"

mkdir -p "$OUT_DIR"

LATEST_DIGEST="$(find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name '000_FINAL_IMPLEMENTATION_DIGEST.md' | sort | tail -n 1 || true)"

if [ -n "${LATEST_DIGEST:-}" ] && [ -f "$LATEST_DIGEST" ]; then
  cp "$LATEST_DIGEST" "$OUT_DIR/"
fi

if [ -d "$RUNTIME_DIR" ]; then
  mkdir -p "$OUT_DIR/runtime_evidence"
  find "$RUNTIME_DIR" -maxdepth 1 -type f -name '*.json' -print0 | while IFS= read -r -d '' FILE; do
    cp "$FILE" "$OUT_DIR/runtime_evidence/"
  done
fi

cat > "$MANIFEST" <<EOF_HANDOFF_MIN
# ============================================================
# AI OPERATION DESK FINAL IMPLEMENTATION HANDOFF MANIFEST
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero
generated_at: $STAMP
EOF_HANDOFF_MIN

find "$OUT_DIR" -maxdepth 2 -type f | sort >> "$MANIFEST"

printf '%s\n' 'AIOPERATIONDESK_FINAL_IMPLEMENTATION_HANDOFF_DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
sed -n '1,200p' "$MANIFEST"
