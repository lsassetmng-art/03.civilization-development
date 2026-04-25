#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AGE_DAYS="${1:-30}"
MODE="${2:-dry_run}"

case "$AGE_DAYS" in
  ''|*[!0-9]*)
    echo "ERROR: AGE_DAYS must be numeric"
    echo "USAGE: access_archive_old_artifacts_move.sh [AGE_DAYS] [dry_run|apply]"
    exit 1
    ;;
esac

case "$MODE" in
  dry_run|apply)
    ;;
  *)
    echo "ERROR: MODE must be dry_run or apply"
    exit 1
    ;;
esac

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"
ARCHIVE_DIR="$BASE/archive"
ARCHIVE_LOGS_DIR="$ARCHIVE_DIR/logs"
ARCHIVE_EXPORTS_DIR="$ARCHIVE_DIR/exports"

TMP_LATEST="$BASE/.tmp_access_latest_targets_move_$$.txt"
TMP_CANDIDATES="$BASE/.tmp_access_archive_candidates_$$.txt"
trap 'rm -f "$TMP_LATEST" "$TMP_CANDIDATES"' EXIT

mkdir -p "$ARCHIVE_LOGS_DIR" "$ARCHIVE_EXPORTS_DIR"
: > "$TMP_LATEST"
: > "$TMP_CANDIDATES"

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

if [ -d "$LOGS_DIR" ]; then
  find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if ! is_latest_target "$d"; then
      printf 'logs\t%s\n' "$d" >> "$TMP_CANDIDATES"
    fi
  done
fi

if [ -d "$EXPORTS_DIR" ]; then
  find "$EXPORTS_DIR" -mindepth 2 -maxdepth 2 -type d -mtime +"$AGE_DAYS" | sort | while IFS= read -r d; do
    [ -n "${d:-}" ] || continue
    if ! is_latest_target "$d"; then
      printf 'exports\t%s\n' "$d" >> "$TMP_CANDIDATES"
    fi
  done
fi

CANDIDATE_COUNT="$(awk 'END{print NR+0}' "$TMP_CANDIDATES")"

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS MOVE"
echo "============================================================"
echo "age_days       : $AGE_DAYS"
echo "mode           : $MODE"
echo "candidate_count: $CANDIDATE_COUNT"
echo "============================================================"

sed -n '1,200p' "$TMP_CANDIDATES" || true

if [ "$MODE" != "apply" ]; then
  echo "DRY_RUN_ONLY"
  exit 0
fi

while IFS=$'\t' read -r group path; do
  [ -n "${group:-}" ] || continue
  [ -n "${path:-}" ] || continue

  base_name="$(basename "$path")"
  if [ "$group" = "logs" ]; then
    dest="$ARCHIVE_LOGS_DIR/$base_name"
  else
    dest="$ARCHIVE_EXPORTS_DIR/$base_name"
  fi

  if [ -e "$dest" ]; then
    dest="${dest}_dup_$(date +%Y%m%d_%H%M%S)"
  fi

  mv "$path" "$dest"
  printf 'MOVED\t%s\t%s\n' "$path" "$dest"
done < "$TMP_CANDIDATES"

echo "============================================================"
echo "ACCESS ARCHIVE OLD ARTIFACTS MOVE DONE"
echo "============================================================"
