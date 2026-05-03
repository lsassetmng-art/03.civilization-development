# AICompanyManager Emergency Rollback
# Rollback AFC-AFJ dashboard selected company context white screen

generated_at: 2026-04-30 05:12:15 +0900

## Result

```
PASS_COUNT=10
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=ROLLBACK_APPLIED_REVIEW_REQUIRED

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

LATEST_AFC_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042
AFC_INDEX_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042/index.html.before_afc_afj.bak
CURRENT_INDEX_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_afc_afj_white_screen_20260430_051212/index.html.current.before_rollback.bak
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_afc_afj_white_screen_20260430_051212/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_afc_afj_white_screen_20260430_051212/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_afc_afj_white_screen_20260430_051212/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_afc_afj_white_screen_20260430_051212
```

## Next policy

- AFC-AFJ caused white screen.
- Do not add more late-loaded dashboard/context overlay scripts.
- Next fix should stop patching runtime from outside.
- Next step should inspect existing active generator and alter only local data source or screen state in-place.
