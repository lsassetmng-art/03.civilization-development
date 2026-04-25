#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
RUN_DIR="$APP_ROOT/900.meta/local_run"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/local_run_collection_$STAMP"

mkdir -p "$OUT_DIR"

if [ -d "$RUN_DIR" ]; then
  find "$RUN_DIR" -maxdepth 1 -type f -print0 | while IFS= read -r -d '' FILE; do
    cp "$FILE" "$OUT_DIR/"
  done
fi

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LOCAL RUN ARTIFACT COLLECTION DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort || true
