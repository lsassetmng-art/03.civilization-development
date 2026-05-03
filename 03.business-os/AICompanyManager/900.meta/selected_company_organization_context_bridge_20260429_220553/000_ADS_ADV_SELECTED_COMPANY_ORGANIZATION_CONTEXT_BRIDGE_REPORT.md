# AICompanyManager Phase ADS-ADV
# Selected company -> organization context propagation bridge

generated_at: 2026-04-29 22:05:56 +0900

## Result

```
PASS_COUNT=13
WARN_COUNT=0
FAIL_COUNT=0
FINAL_STATUS=SELECTED_COMPANY_ORG_BRIDGE_APPLIED_REVIEW_REQUIRED

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/selected_company_organization_context_bridge_20260429_220553/index.html.before_ads_adv.bak
BRIDGE_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-selected-company-organization-context-bridge.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/selected_company_organization_context_bridge_20260429_220553/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/selected_company_organization_context_bridge_20260429_220553/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/selected_company_organization_context_bridge_20260429_220553/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/selected_company_organization_context_bridge_20260429_220553
```

## Fixed policy

- AI企業選択で選んだ会社を current company として保持する。
- hidden互換DOM / 旧company_id / 旧会社選択欄へ選択会社を同期する。
- AI企業設定以降の会社ダッシュボード / 部門 / 課 / 組織画面へ selected company context を伝播する。
- 明示 company_id がある組織DOMのみ、選択会社と照合する。
- DB/API/RLS/delete は触らない。

## Browser URL

```
http://127.0.0.1:8794/?v=20260429_220553
```

## Browser console check

```
window.AICMSelectedCompanyOrganizationBridge.current()
window.AICMSelectedCompanyOrganizationBridge.visibleCompanyOptions()
window.AICMSelectedCompanyOrganizationBridge.log()
```
