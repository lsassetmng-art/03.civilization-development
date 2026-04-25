#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$BASE_DIR/NameCardManager"

test -f "$APP_DIR/NameCardManagerApp.swift"
test -f "$APP_DIR/ContentView.swift"
test -f "$APP_DIR/RuntimeTheme.swift"
test -f "$APP_DIR/Info.plist.template"

echo "IPHONE_VERIFY_OK:NameCardManager"
