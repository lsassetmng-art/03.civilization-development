#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY WAVE2 ANDROID IMPLEMENTATION"
echo "============================================================"

find "$BASE" -type f \
  \( -path '*/LifePlanner/app-android/app/src/main/java/*/MainActivity.java' \
  -o -path '*/LifePlanner/app-android/app/src/main/res/layout/activity_main.xml' \
  -o -path '*/LifePlanner/app-android/app/src/main/res/values/strings.xml' \
  -o -path '*/LifePlanner/app-android/app/src/main/assets/common_ui_consumption.json' \
  -o -path '*/EndOfLifePlanner/app-android/app/src/main/java/*/MainActivity.java' \
  -o -path '*/EndOfLifePlanner/app-android/app/src/main/res/layout/activity_main.xml' \
  -o -path '*/EndOfLifePlanner/app-android/app/src/main/res/values/strings.xml' \
  -o -path '*/EndOfLifePlanner/app-android/app/src/main/assets/common_ui_consumption.json' \
  -o -path '*/InheritanceSupport/app-android/app/src/main/java/*/MainActivity.java' \
  -o -path '*/InheritanceSupport/app-android/app/src/main/res/layout/activity_main.xml' \
  -o -path '*/InheritanceSupport/app-android/app/src/main/res/values/strings.xml' \
  -o -path '*/InheritanceSupport/app-android/app/src/main/assets/common_ui_consumption.json' \
  -o -path '*/app-android/app/src/main/AndroidManifest.xml' \
  -o -path '*/app-android/app/build.gradle' \
  -o -path '*/app-android/build.gradle' \
  -o -path '*/app-android/settings.gradle' \) \
  | sort

echo "============================================================"
