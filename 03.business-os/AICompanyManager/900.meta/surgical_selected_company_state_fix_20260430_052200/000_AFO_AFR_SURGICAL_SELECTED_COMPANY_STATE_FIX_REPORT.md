# AICompanyManager Phase AFO-AFR
# Surgical selected company state fix

generated_at: 2026-04-30 05:22:04 +0900

## Result

```
PASS_COUNT=8
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=SURGICAL_SELECTED_COMPANY_STATE_FIX_APPLIED_REVIEW_REQUIRED

TARGET_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js
BACKUP_TARGET=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/surgical_selected_company_state_fix_20260430_052200/phase-de-dh-workflow-final-local-ui.before_afo_afr.js

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/surgical_selected_company_state_fix_20260430_052200/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/surgical_selected_company_state_fix_20260430_052200/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/surgical_selected_company_state_fix_20260430_052200/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/surgical_selected_company_state_fix_20260430_052200
```

## Changed

- currentCompany(data) now respects app.companyId / sessionStorage before falling back to first company.
- companyOptions(data) selects by app.companyId and supports id/company_id.
- renderSettings(data, company) ignores stale app.editCompanyId and uses selected company.
- data-screen transition captures dashboard company-select before moving to settings.
- switch-company action stores app.companyId and app.editCompanyId.
- load-company-edit aligns app.companyId and app.editCompanyId.
- No extra JS added.
- No DB write / no API save / no RLS / no delete.

## Browser URL

```
http://127.0.0.1:8794/?v=20260430_052200
```

## Rollback

```
cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/surgical_selected_company_state_fix_20260430_052200/phase-de-dh-workflow-final-local-ui.before_afo_afr.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js"
```
