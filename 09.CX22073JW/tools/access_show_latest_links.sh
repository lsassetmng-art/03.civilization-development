#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LATEST_DIR="$BASE/latest"

echo "============================================================"
echo "ACCESS SHOW LATEST LINKS"
echo "============================================================"

if [ ! -d "$LATEST_DIR" ]; then
  echo "MISSING DIR: $LATEST_DIR"
  exit 1
fi

find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | sort | while IFS= read -r p; do
  if [ -L "$p" ]; then
    target="$(readlink "$p" || true)"
    printf 'LINK\t%s\t%s\n' "$(basename "$p")" "$target"
  elif [ -e "$p" ]; then
    printf 'FILE\t%s\t%s\n' "$(basename "$p")" "$p"
  else
    printf 'BROKEN\t%s\t%s\n' "$(basename "$p")" "$p"
  fi
done

echo "============================================================"
echo "ACCESS SHOW LATEST LINKS DONE"
echo "============================================================"
