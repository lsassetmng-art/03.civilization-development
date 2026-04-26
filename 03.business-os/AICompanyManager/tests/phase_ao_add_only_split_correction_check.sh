#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"
JS="$ROOT/assets/js/phase-ao-add-only-split-ui.js"
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
echo "AICompanyManager Phase AO add-only split correction check"
echo "============================================================"

check_file "$INDEX"
check_file "$ROOT/assets/css/phase-ao-add-only-split-ui.css"
check_file "$JS"
check_file "$DESIGN/3800_PHASE_AO_ADD_ONLY_SPLIT_CORRECTION_ROADMAP.md"

check_grep 'phase-ao-add-only-split-ui.js' "$INDEX" "index loads Phase AO JS"
check_grep 'AI企業新規追加' "$JS" "company add remains separate"
check_grep 'AI企業設定' "$JS" "company settings remains separate"
check_grep '部門一覧' "$JS" "department list exists"
check_grep 'data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加' "$JS" "dashboard department detail plus new add"
check_grep '組織一覧' "$JS" "organization list exists"
check_grep 'data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加' "$JS" "dashboard organization detail plus new add"
check_grep '部門変更・削除' "$JS" "department update delete inside detail"
check_grep 'data-action="save-department">部門を変更' "$JS" "department update action inside detail"
check_grep 'data-action="delete-department">部門を削除' "$JS" "department delete action inside detail"
check_grep '組織変更・削除' "$JS" "organization update delete inside detail"
check_grep 'data-action="save-organization">組織を変更' "$JS" "organization update action inside detail"
check_grep 'data-action="delete-organization">組織を削除' "$JS" "organization delete action inside detail"
check_grep 'ロボット配置' "$JS" "robot placement inside organization detail"
check_grep '部門がありません。新規追加を押して作成してください。' "$JS" "empty company department guidance"
check_grep '台帳を使うには部門が必要です' "$JS" "task ledger department guard"

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
  echo "RESULT: PHASE_AO_ADD_ONLY_SPLIT_CORRECTION_PASS"
else
  echo "RESULT: PHASE_AO_ADD_ONLY_SPLIT_CORRECTION_FAIL"
  exit 1
fi
