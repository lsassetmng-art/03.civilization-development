# AICompanyManager Phase AEQ-AET
# AI企業設定 route selected company hydrator

generated_at: 2026-04-30 04:55:46 +0900

## Result

```
PASS_COUNT=11
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=SETTINGS_ROUTE_SELECTED_COMPANY_HYDRATOR_APPLIED_REVIEW_REQUIRED

DB_READ=READ_ONLY via existing local API
DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542/index.html.before_aeq_aet.bak
JS_FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-ai-company-settings-route-selected-company-hydrator.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/ai_company_settings_route_selected_company_hydrator_20260430_045542
```

## Fixed policy

- Full UI remains.
- Dashboard AI企業選択 is captured before AI企業設定 route.
- AI企業設定 screen fields are hydrated from the selected company.
- President/Manager/Leader/Worker select values are not treated as company.
- AI企業新規追加 is not overwritten.
- Company name / business domain / company_id fields are synced on the settings screen.
- No DB write / no API save / no RLS / no delete.

## Browser URL

```
http://127.0.0.1:8794/?v=20260430_045542
```

## Browser console check

```
window.AICMAICompanySettingsRouteHydrator.selected()
window.AICMAICompanySettingsRouteHydrator.target()
window.AICMAICompanySettingsRouteHydrator.hydrate()
window.AICMAICompanySettingsRouteHydrator.log()
```
