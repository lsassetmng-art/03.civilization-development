#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$BASE_DIR/PocketSecretary"

test -f "$APP_DIR/PocketSecretaryApp.swift"
test -f "$APP_DIR/ContentView.swift"
test -f "$APP_DIR/RuntimeTheme.swift"
test -f "$APP_DIR/Info.plist.template"

echo "IPHONE_VERIFY_OK:PocketSecretary"
