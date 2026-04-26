#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

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

check_not_grep_index() {
  grep -q "$1" "$ROOT/index.html" 2>/dev/null && ng "$2" || ok "$2"
}

echo "============================================================"
echo "AICompanyManager Phase AK simplified navigation check"
echo "============================================================"

check_file "$ROOT/index.html"
check_file "$ROOT/assets/css/phase-ak-simplified-ui.css"
check_file "$ROOT/assets/js/phase-ak-simplified-ui.js"
check_file "$DESIGN/3400_PHASE_AK_SIMPLIFIED_NAVIGATION_ROADMAP.md"

check_grep 'phase-ak-simplified-ui.js' "$ROOT/index.html" "index loads Phase AK JS"
check_grep 'AI企業設定' "$ROOT/assets/js/phase-ak-simplified-ui.js" "top tab AI企業設定"
check_grep '会社ダッシュボード' "$ROOT/assets/js/phase-ak-simplified-ui.js" "top tab dashboard"
check_grep '部門別タスク台帳' "$ROOT/assets/js/phase-ak-simplified-ui.js" "top tab task ledger"
check_grep 'レビュー・承認待ち一覧' "$ROOT/assets/js/phase-ak-simplified-ui.js" "top tab review"
check_grep '会社共通ルール' "$ROOT/assets/js/phase-ak-simplified-ui.js" "company common rules inside settings"
check_grep '組織 追加' "$ROOT/assets/js/phase-ak-simplified-ui.js" "org add in dashboard"
check_grep '組織 変更・削除' "$ROOT/assets/js/phase-ak-simplified-ui.js" "org edit delete in dashboard"
check_grep 'CSV操作' "$ROOT/assets/js/phase-ak-simplified-ui.js" "csv operation inside ledger"
check_grep '作成テンプレ' "$ROOT/assets/js/phase-ak-simplified-ui.js" "csv template inside ledger"
check_grep 'Manager分解: 自動' "$ROOT/assets/js/phase-ak-simplified-ui.js" "automatic manager workflow"

SCRIPT_COUNT="$(grep -c '<script ' "$ROOT/index.html" || true)"
[ "$SCRIPT_COUNT" -eq 1 ] && ok "script count is 1" || ng "script count is not 1"

if grep -q '仕事操作' "$ROOT/assets/js/phase-ak-simplified-ui.js"; then
  ng "removed work operation wording"
else
  ok "removed work operation wording"
fi

if grep -q '部門受信箱' "$ROOT/assets/js/phase-ak-simplified-ui.js"; then
  ng "removed department inbox wording"
else
  ok "removed department inbox wording"
fi

if grep -q 'MutationObserver' "$ROOT/assets/js/phase-ak-simplified-ui.js"; then
  ng "MutationObserver removed"
else
  ok "MutationObserver removed"
fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_AK_SIMPLIFIED_NAVIGATION_PASS"
else
  echo "RESULT: PHASE_AK_SIMPLIFIED_NAVIGATION_FAIL"
  exit 1
fi
