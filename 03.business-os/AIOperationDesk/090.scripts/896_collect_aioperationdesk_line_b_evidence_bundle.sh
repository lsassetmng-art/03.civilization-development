#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/line_b_evidence_bundle_$STAMP"

mkdir -p "$OUT_DIR"

copy_recent_dir() {
  PREFIX="$1"
  RECENT_DIR="$(find "$APP_ROOT/900.meta" -maxdepth 1 -type d -name "${PREFIX}_*" | sort | tail -n 1 || true)"
  if [ -n "${RECENT_DIR:-}" ] && [ -d "$RECENT_DIR" ]; then
    DEST="$OUT_DIR/$(basename "$RECENT_DIR")"
    mkdir -p "$DEST"
    find "$RECENT_DIR" -maxdepth 1 -type f -print0 | while IFS= read -r -d '' FILE; do
      cp "$FILE" "$DEST/"
    done
  fi
}

copy_recent_dir "line_b_live_proof"
copy_recent_dir "line_b_review"
copy_recent_dir "line_b_handoff_bundle"
copy_recent_dir "line_b_actual_execute"
copy_recent_dir "provider_live_readiness_probe"
copy_recent_dir "production_implementation_precheck_4"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B EVIDENCE BUNDLE DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 2 -type f | sort || true
