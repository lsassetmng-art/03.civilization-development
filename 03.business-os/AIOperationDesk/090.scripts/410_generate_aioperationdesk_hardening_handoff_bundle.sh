#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/hardening_handoff_bundle_$STAMP"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_HARDENING_INTEGRATED.md"
copy_if_exists "$APP_ROOT/000.docs/HARDENING_ROADMAP.md"
copy_if_exists "$APP_ROOT/000.docs/HARDENING_ENTRY_CHECKLIST.md"
copy_if_exists "$APP_ROOT/000.docs/RUNTIME_ENV_EXACT.md"
copy_if_exists "$APP_ROOT/000.docs/AUTH_PERMISSION_PROVIDER_EXACT.md"
copy_if_exists "$APP_ROOT/000.docs/HARDENED_RUNTIME_ENTRY.md"
copy_if_exists "$APP_ROOT/000.docs/HARDENED_POST_WRITE_FLOW.md"
copy_if_exists "$APP_ROOT/000.docs/HARDENED_DB_POST_WRITE_FLOW.md"
copy_if_exists "$APP_ROOT/000.docs/PROVIDER_DELIVERY_RESULT_FLOW.md"
copy_if_exists "$APP_ROOT/000.docs/RETENTION_CLEANUP_REPLAY_POLICY.md"
copy_if_exists "$APP_ROOT/000.docs/HARDENING_RUNBOOK.md"
copy_if_exists "$APP_ROOT/900.meta/900140_AIOPERATIONDESK_HARDENING_BUNDLE_1_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900150_AIOPERATIONDESK_HARDENING_BUNDLE_2_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900160_AIOPERATIONDESK_HARDENING_BUNDLE_3_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900170_AIOPERATIONDESK_HARDENING_BUNDLE_4_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900180_AIOPERATIONDESK_HARDENING_BUNDLE_5_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900190_AIOPERATIONDESK_HARDENING_BUNDLE_6_NOTE.md"
copy_if_exists "$APP_ROOT/900.meta/900200_AIOPERATIONDESK_HARDENING_BUNDLE_7_NOTE.md"

cat > "$MANIFEST" <<EOF_HANDOFF_MANIFEST
# ============================================================
# AI OPERATION DESK HARDENING HANDOFF BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_HANDOFF_MANIFEST

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK HARDENING HANDOFF BUNDLE GENERATED'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,200p' "$MANIFEST"
