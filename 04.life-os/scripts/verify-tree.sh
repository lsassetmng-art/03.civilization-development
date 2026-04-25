#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="$HOME/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY LIFE OS IMPLEMENTATION TREE"
echo "============================================================"

find "$BASE" -maxdepth 3 -type f \
  \( -name 'index.html' -o -name 'app.js' -o -name 'styles.css' -o -name 'MainActivity.java' -o -name 'ContentView.swift' -o -name '*App.swift' -o -name 'AndroidManifest.xml' -o -name 'build.gradle' -o -name 'settings.gradle' -o -name 'app-shell-config.json' \) \
  | sort

echo "============================================================"
