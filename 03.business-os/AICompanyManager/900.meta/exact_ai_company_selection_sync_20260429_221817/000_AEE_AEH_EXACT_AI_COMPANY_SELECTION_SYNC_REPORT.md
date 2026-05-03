# AICompanyManager Phase AEE-AEH
# Exact AI company selection sync

generated_at: 2026-04-29 22:18:21 +0900

## Result

```
PASS_COUNT=11
WARN_COUNT=2
FAIL_COUNT=0
FINAL_STATUS=EXACT_AI_COMPANY_SELECTION_SYNC_APPLIED_REVIEW_REQUIRED

DB_READ=READ_ONLY via existing local API when available
DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_ai_company_selection_sync_20260429_221817/index.html.before_aee_aeh.bak
EXACT_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-exact-ai-company-selection-sync.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_ai_company_selection_sync_20260429_221817/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_ai_company_selection_sync_20260429_221817/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_ai_company_selection_sync_20260429_221817/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/exact_ai_company_selection_sync_20260429_221817
```

## Fixed policy

- Full UI remains.
- Broad company-sync patches are disabled.
- President/Manager/Leader/Worker selects are no longer treated as company selects.
- Only the card containing both "AI企業選択" and "AI企業を表示" is treated as current company source.
- Company overview and company change form are synced to that selected company.
- No DB write / no API save / no RLS / no delete.

## Browser URL

```
http://127.0.0.1:8794/?v=20260429_221817
```

## Browser console check

```
window.AICMExactAICompanySelectionSync.current()
window.AICMExactAICompanySelectionSync.findAiCompanySelect()
window.AICMExactAICompanySelectionSync.log()
```
