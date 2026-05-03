# AICompanyManager Emergency Rollback
# Rollback AEQ-AET settings route hydrator white screen

generated_at: 2026-04-30 04:59:31 +0900

## Result

```
PASS_COUNT=12
WARN_COUNT=0
FAIL_COUNT=0
FINAL_STATUS=ROLLBACK_APPLIED_REVIEW_REQUIRED

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

CURRENT_BROKEN_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_aeq_aet_white_screen_20260430_045929/index.html.current.before_rollback.bak
LATEST_AEQ_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542
AEQ_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542/index.html.before_aeq_aet.bak
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_aeq_aet_white_screen_20260430_045929/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_aeq_aet_white_screen_20260430_045929/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_aeq_aet_white_screen_20260430_045929/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/rollback_aeq_aet_white_screen_20260430_045929
```

## Policy

- AEQ-AET route hydrator caused white screen.
- Rollback applied.
- Full UI restored to previous state.
- Do not add more broad overlay/sync JS.
- Next fix should modify the actual AI企業設定 screen source directly.
