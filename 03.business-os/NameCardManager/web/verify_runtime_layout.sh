#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

test -f "$BASE_DIR/index.html"
test -f "$BASE_DIR/styles.css"
test -f "$BASE_DIR/app.js"
test -f "$BASE_DIR/manifest.webmanifest"
test -f "$BASE_DIR/offline.html"

echo "WEB_VERIFY_OK:NameCardManager"
