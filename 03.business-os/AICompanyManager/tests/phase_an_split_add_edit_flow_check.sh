#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"
JS="$ROOT/assets/js/phase-an-split-add-edit-ui.js"
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

echo "============================================================"
echo "AICompanyManager Phase AN split add/edit flow check"
echo "============================================================"

check_file "$INDEX"
check_file "$ROOT/assets/css/phase-an-split-add-edit-ui.css"
check_file "$JS"
check_file "$DESIGN/3700_PHASE_AN_SPLIT_ADD_EDIT_FLOW_ROADMAP.md"

check_grep 'phase-an-split-add-edit-ui.js' "$INDEX" "index loads Phase AN JS"
check_grep 'AI企業新規追加' "$JS" "company add separate screen"
check_grep 'data-screen="company-add"' "$JS" "company add screen route"
check_grep 'AI企業設定' "$JS" "company setting screen"
check_grep '新規会社でもここから部門を作成できます' "$JS" "new company department add guidance"
check_grep '部門追加' "$JS" "department add separate screen"
check_grep '部門変更' "$JS" "department edit separate screen"
check_grep '部門削除' "$JS" "department delete separate screen"
check_grep '組織追加' "$JS" "organization add separate screen"
check_grep '組織変更' "$JS" "organization edit separate screen"
check_grep '組織削除' "$JS" "organization delete separate screen"
check_grep '台帳を使うには部門が必要です' "$JS" "task ledger empty company guard"
check_grep '組織を追加するには先に部門が必要です' "$JS" "organization add no department guard"
check_grep 'departments: \[\]' "$JS" "new company can have empty departments"
check_grep 'if (!dept)' "$JS" "department null guard exists"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
[ "$SCRIPT_COUNT" -eq 1 ] && ok "index script count is 1" || ng "index script count is not 1"

if grep -q 'MutationObserver' "$JS"; then
  ng "MutationObserver removed"
else
  ok "MutationObserver removed"
fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_AN_SPLIT_ADD_EDIT_FLOW_PASS"
else
  echo "RESULT: PHASE_AN_SPLIT_ADD_EDIT_FLOW_FAIL"
  exit 1
fi
