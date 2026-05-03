# AICompanyManager Phase AHE-AHH
# Fix currentCompany no first fallback

generated_at: 2026-04-30 05:51:37 +0900

PASS_COUNT=9
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=CURRENT_COMPANY_NO_FIRST_FALLBACK_APPLIED_REVIEW_REQUIRED

SCOPE=UI_ONLY
NO_EXTRA_JS=YES
DB_WRITE=NOT_EXECUTED
DB_READ=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

TARGET_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js
BACKUP_TARGET=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_current_company_no_first_fallback_20260430_055133/phase-de-dh-workflow-final-local-ui.before_ahe_ahh.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_current_company_no_first_fallback_20260430_055133/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_current_company_no_first_fallback_20260430_055133/051_curl.log
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_current_company_no_first_fallback_20260430_055133/090_ROLLBACK_NOTE.txt
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_current_company_no_first_fallback_20260430_055133/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/fix_current_company_no_first_fallback_20260430_055133

Changed:
- currentCompany(data) only
- initial fallback to first company is allowed only when app.companyId is empty
- if app.companyId is set but not found, return null instead of data.companies[0]
