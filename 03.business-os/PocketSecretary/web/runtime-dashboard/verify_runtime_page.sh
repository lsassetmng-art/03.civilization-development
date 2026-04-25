#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

test -f "$BASE_DIR/dashboard.html"
test -f "$BASE_DIR/dashboard.css"
test -f "$BASE_DIR/dashboard.js"
test -f "$BASE_DIR/mock-state.json"

grep -Fq "PocketSecretary" "$BASE_DIR/dashboard.html"
grep -Fq "PocketSecretary" "$BASE_DIR/dashboard.js"

echo "VERIFY_OK:PocketSecretary"
