#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

test -f "$BASE_DIR/settings.gradle"
test -f "$BASE_DIR/build.gradle"
test -f "$BASE_DIR/app/build.gradle"
test -f "$BASE_DIR/app/src/main/AndroidManifest.xml"
test -f "$BASE_DIR/app/src/main/java/com/lsam/NameCardManager/MainActivity.java"
test -f "$BASE_DIR/app/src/main/res/layout/activity_main.xml"
test -f "$BASE_DIR/app/src/main/res/values/strings.xml"

echo "VERIFY_OK:NameCardManager"
