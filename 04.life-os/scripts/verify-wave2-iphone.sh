#!/data/data/com.termux/files/usr/bin/sh
set -eu
BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY WAVE2 IPHONE IMPLEMENTATION"
echo "============================================================"

find "$BASE" -type f \
  \( -path '*/LifePlanner/app-iphone/LifePlanner/*App.swift' \
  -o -path '*/LifePlanner/app-iphone/LifePlanner/ContentView.swift' \
  -o -path '*/LifePlanner/app-iphone/LifePlanner/*Store.swift' \
  -o -path '*/LifePlanner/app-iphone/LifePlanner/*Record.swift' \
  -o -path '*/LifePlanner/app-iphone/LifePlanner/common_ui_consumption.json' \
  -o -path '*/EndOfLifePlanner/app-iphone/EndOfLifePlanner/*App.swift' \
  -o -path '*/EndOfLifePlanner/app-iphone/EndOfLifePlanner/ContentView.swift' \
  -o -path '*/EndOfLifePlanner/app-iphone/EndOfLifePlanner/*Store.swift' \
  -o -path '*/EndOfLifePlanner/app-iphone/EndOfLifePlanner/*Record.swift' \
  -o -path '*/EndOfLifePlanner/app-iphone/EndOfLifePlanner/common_ui_consumption.json' \
  -o -path '*/InheritanceSupport/app-iphone/InheritanceSupport/*App.swift' \
  -o -path '*/InheritanceSupport/app-iphone/InheritanceSupport/ContentView.swift' \
  -o -path '*/InheritanceSupport/app-iphone/InheritanceSupport/*Store.swift' \
  -o -path '*/InheritanceSupport/app-iphone/InheritanceSupport/*Record.swift' \
  -o -path '*/InheritanceSupport/app-iphone/InheritanceSupport/common_ui_consumption.json' \) \
  | sort

echo "============================================================"
