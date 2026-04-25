#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="$HOME/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY WAVE1 IPHONE IMPLEMENTATION"
echo "============================================================"

find "$BASE" -type f \
  \( -path '*/app-iphone/*/*App.swift' \
  -o -path '*/app-iphone/*/ContentView.swift' \
  -o -path '*/app-iphone/*/*Store.swift' \
  -o -path '*/app-iphone/*/*Record.swift' \) \
  | sort

echo "============================================================"
