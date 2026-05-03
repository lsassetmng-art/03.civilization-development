# AICompanyManager Phase AIY-AJB
# Browser localStorage company source diagnostic

generated_at: 2026-04-30 06:39:11 +0900

PASS_COUNT=8
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=BROWSER_LOCAL_COMPANY_SOURCE_DIAG_READY_REVIEW_REQUIRED

SCOPE=UI_BROWSER_LOCALSTORAGE_DIAGNOSIS
MODIFY=DEBUG_HTML_ONLY
DB_WRITE=NOT_EXECUTED
DB_READ=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

DEBUG_URL=http://127.0.0.1:8794/aicm-local-company-source-debug.html?v=20260430_063908
DEBUG_HTML=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/aicm-local-company-source-debug.html
LOCAL_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/browser_local_company_source_diag_20260430_063908/100_local_js_company_source_scan.txt
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/browser_local_company_source_diag_20260430_063908/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/browser_local_company_source_diag_20260430_063908/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/browser_local_company_source_diag_20260430_063908/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/browser_local_company_source_diag_20260430_063908

Judge:
- companies.length がローカルUI状態にある会社数。
- ウルフ/Wolf 判定でFOUNDなら、ローカルにウルフがある。
- NOT_FOUNDなら、今のブラウザlocalStorageにはウルフがない。
- 起動時に出たり出なかったりする場合は、localStorageが別origin/別ブラウザ/初期化/上書きで揺れている。
