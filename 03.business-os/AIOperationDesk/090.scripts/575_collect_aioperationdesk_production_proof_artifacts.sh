#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/production_proof_artifacts_$STAMP"

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

copy_recent_dir "production_proof_precheck"
copy_recent_dir "production_proof_audit"
copy_recent_dir "provider_env_probe"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION PROOF ARTIFACT COLLECTION DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 2 -type f | sort || true
