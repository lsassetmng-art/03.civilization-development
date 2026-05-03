# AICompanyManager Phase AEY-AFB
# Patch actual generator selected company source

generated_at: 2026-04-30 05:05:37 +0900

## Result

```
PASS_COUNT=10
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=ACTUAL_GENERATOR_PATCH_APPLIED_REVIEW_REQUIRED

TARGET_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js
BACKUP_TARGET=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/patch_actual_generator_selected_company_20260430_050533/phase-de-dh-workflow-final-local-ui.before_aey_afb.js
BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/patch_actual_generator_selected_company_20260430_050533/index.html.before_aey_afb.bak

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/patch_actual_generator_selected_company_20260430_050533/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/patch_actual_generator_selected_company_20260430_050533/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/patch_actual_generator_selected_company_20260430_050533/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/patch_actual_generator_selected_company_20260430_050533
```

## Fixed policy

- Patched actual generator file: phase-de-dh-workflow-final-local-ui.js
- currentCompany(data) now resolves selected company from:
  1. dashboard AI企業選択 DOM
  2. app selected/current company state
  3. window current company state
  4. local/session storage
  5. first valid company fallback
- AI企業設定 route stores dashboard-selected company before screen transition.
- Broad after-the-fact sync/overlay patch scripts are disabled.
- Full UI maintained.
- No DB write / no API save / no RLS / no delete.

## Browser URL

```
http://127.0.0.1:8794/?v=20260430_050533
```
