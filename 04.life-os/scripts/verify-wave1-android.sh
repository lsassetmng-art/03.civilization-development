#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="$HOME/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY WAVE1 ANDROID IMPLEMENTATION"
echo "============================================================"

find "$BASE" -type f \
  \( -path '*/app-android/app/src/main/java/*/MainActivity.java' \
  -o -path '*/app-android/app/src/main/res/layout/activity_main.xml' \
  -o -path '*/app-android/app/src/main/res/values/strings.xml' \
  -o -path '*/app-android/app/src/main/AndroidManifest.xml' \
  -o -path '*/app-android/app/build.gradle' \
  -o -path '*/app-android/build.gradle' \
  -o -path '*/app-android/settings.gradle' \) \
  | sort

echo "============================================================"
