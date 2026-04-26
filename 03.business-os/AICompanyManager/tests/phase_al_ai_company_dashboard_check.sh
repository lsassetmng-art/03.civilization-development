#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"
JS="$ROOT/assets/js/phase-ak-simplified-ui.js"
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
echo "AICompanyManager Phase AL AI company dashboard check"
echo "============================================================"

check_file "$JS"
check_file "$INDEX"
check_file "$DESIGN/3500_PHASE_AL_AI_COMPANY_DASHBOARD_ROADMAP.md"
check_file "$DESIGN/3510_AI_COMPANY_DASHBOARD_CANON.md"

check_grep 'screen: "dashboard"' "$JS" "default screen is dashboard"
check_grep 'AI企業ダッシュボード' "$JS" "AI company dashboard label"
check_grep 'AI企業選択' "$JS" "dashboard has company selector card"
check_grep 'company-select' "$JS" "dashboard has company select id"
check_grep 'switch-company' "$JS" "dashboard can switch company"
check_grep 'companyOptions(data)' "$JS" "dashboard uses company options"
check_grep 'AI企業設定' "$JS" "AI company settings remains"
check_grep '部門別タスク台帳' "$JS" "department task ledger remains"
check_grep 'レビュー・承認待ち一覧' "$JS" "review approval screen remains"
check_not_grep '会社ダッシュボード' "$JS" "old company dashboard label removed"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
[ "$SCRIPT_COUNT" -eq 1 ] && ok "index script count is 1" || ng "index script count is not 1"

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_AL_AI_COMPANY_DASHBOARD_PASS"
else
  echo "RESULT: PHASE_AL_AI_COMPANY_DASHBOARD_FAIL"
  exit 1
fi
