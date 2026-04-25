#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY COMMONOS UI APPLIED TO LIFE OS"
echo "============================================================"

echo "[shared runtime]"
find "$BASE/_shared-web" -maxdepth 1 -type f | sort
echo

echo "[consumer declarations]"
find "$BASE" -type f -name 'common-component-usage.json' | sort
echo

echo "[portal uses shared runtime]"
grep -n '_shared-web/common.css' "$BASE/portal-web/index.html" || true
echo

echo "[web apps using shared runtime]"
find "$BASE" -type f -path '*/app-web/index.html' -print | sort | while IFS= read -r f; do
  echo "--- $f"
  grep -n '_shared-web/common.css' "$f" || true
  grep -n '_shared-web/common.js' "$f" || true
done

echo "============================================================"
