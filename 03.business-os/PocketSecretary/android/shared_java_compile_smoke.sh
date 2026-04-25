#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$BASE_DIR/.compile-smoke"
SRC_LIST="$OUT_DIR/java_sources.list"
LOG_FILE="$OUT_DIR/compile.log"

mkdir -p "$OUT_DIR/classes"

find "$BASE_DIR/app/src/main/java/com/lsam/PocketSecretary" -type f -name '*.java' ! -name 'MainActivity.java' | LC_ALL=C sort > "$SRC_LIST"

if [ ! -s "$SRC_LIST" ]; then
  echo "NO_SHARED_JAVA"
  exit 0
fi

javac -d "$OUT_DIR/classes" @"$SRC_LIST" >"$LOG_FILE" 2>&1
echo "COMPILE_OK:PocketSecretary"
