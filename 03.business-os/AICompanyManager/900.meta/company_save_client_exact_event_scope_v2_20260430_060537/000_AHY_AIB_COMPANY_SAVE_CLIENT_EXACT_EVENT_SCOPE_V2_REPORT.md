# AICompanyManager Phase AHY-AIB
# Company save client exact event scope v2

generated_at: 2026-04-30 06:05:41 +0900

PASS_COUNT=10
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=COMPANY_SAVE_CLIENT_EXACT_EVENT_SCOPE_V2_APPLIED_REVIEW_REQUIRED

SCOPE=UI_ONLY
DB_WRITE=NOT_EXECUTED
DB_READ=NOT_EXECUTED
API_SAVE=NOT_EXECUTED_BY_THIS_SCRIPT
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

INDEX_HTML=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html
SAVE_CLIENT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js
BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537/index.html.before_ahy_aib.bak
BACKUP_SAVE_CLIENT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537/aicm-company-persistent-save-client.before_ahy_aib.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537/051_curl.log
ROLLBACK_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537/090_ROLLBACK_NOTE.txt
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_save_client_exact_event_scope_v2_20260430_060537

Changed:
- Wrapped company save client's document/window event listeners during its own file load.
- Allowed only add-company and save-company.
- touchend/click/pointerup/submit navigation events are ignored by save client without toast/intercept.
- AI企業を表示 is outside company save client scope.
