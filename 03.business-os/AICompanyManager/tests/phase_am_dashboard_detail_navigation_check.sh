#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"
JS="$ROOT/assets/js/phase-am-dashboard-detail-ui.js"
INDEX="$ROOT/index.html"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

check_file() {
  [ -f "$1" ] && ok "$1" || ng "$1"
}

check_grep() {
  grep -q "$1" "$2" 2>/dev/null && ok "$3" || ng "$3"
}

check_not_grep() {
  grep -q "$1" "$2" 2>/dev/null && ng "$3" || ok "$3"
}

echo "============================================================"
echo "AICompanyManager Phase AM dashboard detail navigation check"
echo "============================================================"

check_file "$INDEX"
check_file "$ROOT/assets/css/phase-am-dashboard-detail-ui.css"
check_file "$JS"
check_file "$DESIGN/3600_PHASE_AM_DASHBOARD_DETAIL_NAVIGATION_ROADMAP.md"

check_grep 'screen: "dashboard"' "$JS" "default screen dashboard"
check_grep 'AI企業ダッシュボード' "$JS" "AI company dashboard tab"
check_grep 'data-screen="settings">AI企業設定' "$JS" "settings button from dashboard"
check_grep '部門一覧' "$JS" "department list on dashboard"
check_grep '組織一覧' "$JS" "organization list on dashboard"
check_grep 'data-screen="department-detail">部門詳細' "$JS" "department detail button"
check_grep 'data-screen="organization-detail">組織詳細' "$JS" "organization detail button"
check_grep 'data-screen="department-add">部門追加' "$JS" "department add button"
check_grep 'data-screen="department-edit">部門変更' "$JS" "department edit button"
check_grep 'data-screen="department-delete">部門削除' "$JS" "department delete button"
check_grep 'data-screen="organization-add">組織追加' "$JS" "organization add button"
check_grep 'data-screen="organization-edit">組織変更' "$JS" "organization edit button"
check_grep 'data-screen="organization-delete">組織削除' "$JS" "organization delete button"
check_grep 'ロボット配置' "$JS" "robot placement in organization edit"
check_grep 'phase-am-dashboard-detail-ui.js' "$INDEX" "index loads Phase AM JS"

if grep -q 'tab("AI企業設定"' "$JS"; then
  ng "AI企業設定 appears as top tab"
else
  ok "AI企業設定 not top tab"
fi

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
[ "$SCRIPT_COUNT" -eq 1 ] && ok "index script count is 1" || ng "index script count is not 1"

if grep -q 'MutationObserver' "$JS"; then
  ng "MutationObserver remains"
else
  ok "MutationObserver removed"
fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_AM_DASHBOARD_DETAIL_NAVIGATION_PASS"
else
  echo "RESULT: PHASE_AM_DASHBOARD_DETAIL_NAVIGATION_FAIL"
  exit 1
fi
