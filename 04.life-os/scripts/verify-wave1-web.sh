#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="$HOME/03.civilization-development/04.life-os"
echo "============================================================"
echo "VERIFY WAVE1 WEB IMPLEMENTATION"
echo "============================================================"
find "$BASE" -type f \
  \( -path '*/app-web/index.html' -o -path '*/app-web/app.js' -o -path '*/app-web/styles.css' -o -path '*/_shared-web/common.css' -o -path '*/_shared-web/common.js' -o -path '*/portal-web/index.html' \) \
  | sort
echo "============================================================"
