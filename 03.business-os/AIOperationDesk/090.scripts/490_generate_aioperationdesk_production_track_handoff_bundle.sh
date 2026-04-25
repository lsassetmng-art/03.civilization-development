#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/production_track_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_TRACK_INTEGRATED.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_TRACK_ROADMAP.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_SECRET_ENV_POLICY.md"
copy_if_exists "$APP_ROOT/000.docs/PROVIDER_HTTP_EXECUTION_POLICY.md"
copy_if_exists "$APP_ROOT/000.docs/REPLAY_EXECUTOR_EXACT.md"
copy_if_exists "$APP_ROOT/000.docs/CLEANUP_EXECUTOR_EXACT.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_TRACK_RUNBOOK.md"
copy_if_exists "$APP_ROOT/000.docs/PRODUCTION_TRACK_CLOSEOUT_RUNBOOK.md"
copy_if_exists "$APP_ROOT/900.meta/900230_AIOPERATIONDESK_PRODUCTION_TRACK_BUNDLE_1_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900240_AIOPERATIONDESK_PRODUCTION_TRACK_BUNDLE_2_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900250_AIOPERATIONDESK_PRODUCTION_TRACK_BUNDLE_3_NOTE.md"

cat > "$MANIFEST" <<EOF_PROD_HANDOFF
# ============================================================
# AI OPERATION DESK PRODUCTION TRACK HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_PROD_HANDOFF

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION TRACK HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,200p' "$MANIFEST"
