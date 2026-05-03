# AICompanyManager Phase AFC-AFJ
# Dashboard-selected company context architecture

generated_at: 2026-04-30 05:10:46 +0900

## Result

```
PASS_COUNT=11
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=DASHBOARD_SELECTED_COMPANY_CONTEXT_APPLIED_REVIEW_REQUIRED

DB_READ=READ_ONLY only on dashboard company select
DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042/index.html.before_afc_afj.bak
CONTEXT_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-dashboard-selected-company-context.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/dashboard_selected_company_context_architecture_20260430_051042
```

## Canonical behavior

- Dashboard company select is the only DB-read trigger.
- Dashboard reads company + organizations once and holds context.
- Other screens do not read DB.
- Other screens consume AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT.
- Broad failed patches are disabled.
- Full UI remains.

## Browser URL

```
http://127.0.0.1:8794/?v=20260430_051042
```

## Browser console

```
window.AICMDashboardSelectedCompanyContext.get()
window.AICMDashboardSelectedCompanyContext.log()
```
