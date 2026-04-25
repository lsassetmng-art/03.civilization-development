#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AGE_DAYS="${1:-30}"

case "$AGE_DAYS" in
  ''|*[!0-9]*)
    echo "ERROR: AGE_DAYS must be numeric"
    echo "USAGE: access_archive_old_artifacts_preview.sh [AGE_DAYS]"
    exit 1
    ;;
esac

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"

TMP_LATEST="$BASE/.tmp_access_latest_targets_$$.txt"
trap 'rm -f "$TMP_LATEST"' EXIT

: > "$TMP_LATEST"
if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 -type l | sort | while IFS= read -r lnk; do
    [ -n "${lnk:-}" ] || continue
    readlink "$lnk" >> "$TMP_LATEST" 2>/dev/null || true
  done
fi

is_latest_target() {
  local candidate="$1"
  grep -Fxq "$candidate" "$TMP_LATEST" 2>/dev/null
}

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS PREVIEW"
echo "============================================================"
echo "age_days : $AGE_DAYS"
echo "============================================================"

echo "[log dir candidates]"
if [ -d "$LOGS_DIR" ]; then
  find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if is_latest_target "$d"; then
      printf 'SKIP_LATEST\t%s\n' "$d"
    else
      printf 'CANDIDATE\t%s\n' "$d"
    fi
  done
fi

echo
echo "[export dir candidates]"
if [ -d "$EXPORTS_DIR" ]; then
  find "$EXPORTS_DIR" -mindepth 2 -maxdepth 2 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if is_latest_target "$d"; then
      printf 'SKIP_LATEST\t%s\n' "$d"
    else
      printf 'CANDIDATE\t%s\n' "$d"
    fi
  done
fi

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS PREVIEW DONE"
echo "============================================================"
