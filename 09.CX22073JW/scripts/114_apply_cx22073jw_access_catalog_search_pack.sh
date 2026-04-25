#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_catalog.sh" <<'ACCESS_CATALOG_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

print_entry() {
  local file_name="$1"
  local description="$2"
  local full_path="$TOOLS_DIR/$file_name"

  if [ -x "$full_path" ]; then
    printf '%-42s | %s\n' "./$file_name" "$description"
  fi
}

echo "============================================================"
echo "ACCESS CATALOG"
echo "============================================================"

echo "[core status / readiness]"
print_entry "access_status.sh" "latest baseline / pending / reverify / bundle summary"
print_entry "access_legacy_readiness.sh" "latest legacy cutover and retirement readiness"
print_entry "access_doctor.sh" "environment / table / view / self-reference health check"

echo
echo "[daily / launcher]"
print_entry "access_menu.sh" "interactive launcher menu"
print_entry "access_daily_refresh.sh" "baseline refresh + bundle export + status + legacy readiness"

echo
echo "[manual apply / batch]"
print_entry "access_show_latest_batch.sh" "show latest manual receipt batch"
print_entry "access_confirm_request.sh" "confirm one request"
print_entry "access_reverify_confirmed.sh" "run confirmed-only reverify"
print_entry "access_list_pending_requests.sh" "list pending request_code values"
print_entry "access_bulk_confirm_all_pending.sh" "bulk confirm all pending requests"
print_entry "access_bulk_apply_cycle.sh" "bulk confirm + reverify + bundle export"

echo
echo "[blockers / reports]"
print_entry "access_open_blockers.sh" "show current blockers"
print_entry "access_make_shift_report.sh" "generate shift handoff report"
print_entry "access_history.sh" "show recent run history"
print_entry "access_make_timeline_report.sh" "generate timeline report"

echo
echo "[artifacts / bundles / incident]"
print_entry "access_export_current_bundle.sh" "export current-state bundle"
print_entry "access_latest_artifacts.sh" "show latest artifact locations"
print_entry "access_collect_incident_bundle.sh" "collect incident evidence bundle"
print_entry "access_refresh_latest_links.sh" "refresh latest/ symlinks"
print_entry "access_show_latest_links.sh" "show latest/ symlinks"

echo
echo "[trace / investigation]"
print_entry "access_trace_request.sh" "trace one request_code"
print_entry "access_trace_logical_view.sh" "trace one logical_view_name"
print_entry "access_make_request_trace_bundle.sh" "export request trace bundle"
print_entry "access_make_logical_view_trace_bundle.sh" "export logical-view trace bundle"

echo
echo "[catalog / search]"
print_entry "access_catalog.sh" "show this catalog"
print_entry "access_find_keyword.sh" "search tools / docs / scripts by keyword"

echo
echo "[inventory]"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort

echo "============================================================"
echo "ACCESS CATALOG DONE"
echo "============================================================"
ACCESS_CATALOG_CMD
chmod +x "$TOOLS_DIR/access_catalog.sh"

cat > "$TOOLS_DIR/access_find_keyword.sh" <<'ACCESS_FIND_KEYWORD_CMD'
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
ACCESS_FIND_KEYWORD_CMD
chmod +x "$TOOLS_DIR/access_find_keyword.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_catalog.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_114'

catalog_search_commands:
- ./access_catalog.sh
- ./access_find_keyword.sh KEYWORD [all|tools|docs|scripts]

recommended_find_flow:
1. ./access_catalog.sh
2. ./access_find_keyword.sh trace
3. ./access_find_keyword.sh bundle docs
README_APPEND_114
  fi
else
  cat > "$README_FILE" <<'README_NEW_114'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

catalog_search_commands:
- ./access_catalog.sh
- ./access_find_keyword.sh KEYWORD [all|tools|docs|scripts]
README_NEW_114
fi

echo "============================================================"
echo "ACCESS CATALOG SEARCH PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
