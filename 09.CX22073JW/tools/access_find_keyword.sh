#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

KEYWORD="${1:-}"
SCOPE="${2:-all}"

if [ -z "$KEYWORD" ]; then
  echo "USAGE: access_find_keyword.sh KEYWORD [all|tools|docs|scripts]"
  exit 1
fi

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"
SCRIPTS_DIR="$BASE/scripts"

SEARCH_DIRS=""
case "$SCOPE" in
  all)
    SEARCH_DIRS="$TOOLS_DIR $DOCS_DIR $SCRIPTS_DIR"
    ;;
  tools)
    SEARCH_DIRS="$TOOLS_DIR"
    ;;
  docs)
    SEARCH_DIRS="$DOCS_DIR"
    ;;
  scripts)
    SEARCH_DIRS="$SCRIPTS_DIR"
    ;;
  *)
    echo "ERROR: unsupported scope -> $SCOPE"
    echo "allowed: all | tools | docs | scripts"
    exit 1
    ;;
esac

echo "============================================================"
echo "ACCESS FIND KEYWORD"
echo "============================================================"
echo "keyword : $KEYWORD"
echo "scope   : $SCOPE"
echo "============================================================"

echo "[filename hits]"
found_filename=0
for dir in $SEARCH_DIRS; do
  if [ -d "$dir" ]; then
    while IFS= read -r path; do
      [ -n "${path:-}" ] || continue
      printf 'FILE | %s\n' "$path"
      found_filename=1
    done <<EOF_ACCESS_FILENAME_HITS
$(find "$dir" -type f | sort | grep -i -- "$KEYWORD" || true)
EOF_ACCESS_FILENAME_HITS
  fi
done
if [ "$found_filename" -eq 0 ]; then
  echo "NO_FILENAME_HITS"
fi

echo
echo "[content hits]"
found_content=0
for dir in $SEARCH_DIRS; do
  if [ -d "$dir" ]; then
    while IFS= read -r path; do
      [ -n "${path:-}" ] || continue
      if grep -nFi -- "$KEYWORD" "$path" >/dev/null 2>&1; then
        echo "----- $path"
        grep -nFi -- "$KEYWORD" "$path" || true
        found_content=1
      fi
    done <<EOF_ACCESS_CONTENT_FILES
$(find "$dir" -type f | sort)
EOF_ACCESS_CONTENT_FILES
  fi
done
if [ "$found_content" -eq 0 ]; then
  echo "NO_CONTENT_HITS"
fi

echo "============================================================"
echo "ACCESS FIND KEYWORD DONE"
echo "============================================================"
