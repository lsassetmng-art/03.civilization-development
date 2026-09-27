#!/data/data/com.termux/files/usr/bin/bash
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BUSINESS_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
MONOREPO_ROOT="$(CDPATH= cd -- "$BUSINESS_ROOT/.." && pwd)"
COMMONOS_ROOT="$MONOREPO_ROOT/12.common-os"

BASE="$BUSINESS_ROOT/_commonos"
DEST="$BASE/provider"
STAGE="$BASE/.provider-stage.$$"
OLD="$BASE/.provider-old.$$"

cleanup() {
  RC=$?
  trap - EXIT INT TERM

  rm -rf "$STAGE"

  if [ "$RC" -ne 0 ] && [ -d "$OLD" ] && [ ! -e "$DEST" ]; then
    mv "$OLD" "$DEST"
  else
    rm -rf "$OLD"
  fi

  exit "$RC"
}

trap cleanup EXIT INT TERM

rm -rf "$STAGE" "$OLD"
mkdir -p "$STAGE"

copy_one() {
  SRC="$1"
  NAME="$2"

  [ -f "$SRC" ] || {
    echo "MISSING_PROVIDER_DIST=$SRC"
    exit 20
  }

  cp "$SRC" "$STAGE/$NAME"
  chmod 0644 "$STAGE/$NAME"

  cmp -s "$SRC" "$STAGE/$NAME" || {
    echo "STAGE_CMP_FAIL=$NAME"
    exit 21
  }
}

copy_one "$COMMONOS_ROOT/CommonTokenSet/dist/commonos.tokens.css" "commonos.tokens.css"
copy_one "$COMMONOS_ROOT/CommonTokenSet/dist/commonos.variants.css" "commonos.variants.css"
copy_one "$COMMONOS_ROOT/CommonUIRuntime/dist/commonos.components.css" "commonos.components.css"
copy_one "$COMMONOS_ROOT/CommonUIRuntime/dist/commonos.runtime.js" "commonos.runtime.js"
copy_one "$COMMONOS_ROOT/CommonShell/dist/commonos.shell.css" "commonos.shell.css"
copy_one "$COMMONOS_ROOT/CommonShell/dist/commonos.shell.js" "commonos.shell.js"
copy_one "$COMMONOS_ROOT/CommonSyncPresentation/dist/commonos.sync.css" "commonos.sync.css"
copy_one "$COMMONOS_ROOT/CommonSyncPresentation/dist/commonos.sync.js" "commonos.sync.js"

COUNT="$(find "$STAGE" -maxdepth 1 -type f | wc -l | tr -d ' ')"

[ "$COUNT" -eq 8 ] || {
  echo "STAGE_FILE_COUNT_FAIL=$COUNT"
  exit 22
}

if [ -e "$DEST" ]; then
  mv "$DEST" "$OLD"
fi

mv "$STAGE" "$DEST"

verify_one() {
  SRC="$1"
  NAME="$2"

  cmp -s "$SRC" "$DEST/$NAME" || {
    echo "PUBLISHED_CMP_FAIL=$NAME"
    exit 23
  }
}

verify_one "$COMMONOS_ROOT/CommonTokenSet/dist/commonos.tokens.css" "commonos.tokens.css"
verify_one "$COMMONOS_ROOT/CommonTokenSet/dist/commonos.variants.css" "commonos.variants.css"
verify_one "$COMMONOS_ROOT/CommonUIRuntime/dist/commonos.components.css" "commonos.components.css"
verify_one "$COMMONOS_ROOT/CommonUIRuntime/dist/commonos.runtime.js" "commonos.runtime.js"
verify_one "$COMMONOS_ROOT/CommonShell/dist/commonos.shell.css" "commonos.shell.css"
verify_one "$COMMONOS_ROOT/CommonShell/dist/commonos.shell.js" "commonos.shell.js"
verify_one "$COMMONOS_ROOT/CommonSyncPresentation/dist/commonos.sync.css" "commonos.sync.css"
verify_one "$COMMONOS_ROOT/CommonSyncPresentation/dist/commonos.sync.js" "commonos.sync.js"

rm -rf "$OLD"

printf '%s\n' \
"COMMONOS_PROVIDER_PUBLISH=PASS" \
"PUBLISHED_ASSET_COUNT=8" \
"DESTINATION=$DEST"
