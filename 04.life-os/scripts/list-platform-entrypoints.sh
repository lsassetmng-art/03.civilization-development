#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "LIFE OS PLATFORM ENTRYPOINTS"
echo "============================================================"

find "$BASE" -type f \
  \( -path '*/run/platform-launcher.json' \
  -o -path '*/scripts/open-web.sh' \
  -o -path '*/scripts/show-android-root.sh' \
  -o -path '*/scripts/show-iphone-root.sh' \
  -o -path '*/portal-web/index.html' \
  -o -path '*/portal-web/platform-launcher.js' \) \
  | sort

echo "============================================================"
