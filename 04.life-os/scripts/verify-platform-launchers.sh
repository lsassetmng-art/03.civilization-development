#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY LIFE OS PLATFORM LAUNCHERS"
echo "============================================================"

echo "[portal]"
ls -1 "$BASE/portal-web/index.html" "$BASE/portal-web/platform-launcher.js"
echo

echo "[per-app launcher manifests]"
find "$BASE" -type f -path '*/run/platform-launcher.json' | sort
echo

echo "[per-app scripts]"
find "$BASE" -type f \
  \( -path '*/scripts/open-web.sh' \
  -o -path '*/scripts/show-android-root.sh' \
  -o -path '*/scripts/show-iphone-root.sh' \) \
  | sort
echo

echo "[portal references]"
grep -n 'platform-launcher.js' "$BASE/portal-web/index.html" || true
grep -n '_commonos/bridge/life-commonos-bridge.js' "$BASE/portal-web/index.html" || true
echo "============================================================"
