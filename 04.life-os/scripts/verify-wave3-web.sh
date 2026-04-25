#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY WAVE3 WEB IMPLEMENTATION"
echo "============================================================"

find "$BASE" -type f \
  \( -path '*/LegalSupport/app-web/index.html' \
  -o -path '*/LegalSupport/app-web/styles.css' \
  -o -path '*/LegalSupport/app-web/app.js' \
  -o -path '*/LegalSupport/app-web/common-component-usage.json' \
  -o -path '*/BusinessLegalSupport/app-web/index.html' \
  -o -path '*/BusinessLegalSupport/app-web/styles.css' \
  -o -path '*/BusinessLegalSupport/app-web/app.js' \
  -o -path '*/BusinessLegalSupport/app-web/common-component-usage.json' \
  -o -path '*/portal-web/index.html' \) \
  | sort

echo "============================================================"
