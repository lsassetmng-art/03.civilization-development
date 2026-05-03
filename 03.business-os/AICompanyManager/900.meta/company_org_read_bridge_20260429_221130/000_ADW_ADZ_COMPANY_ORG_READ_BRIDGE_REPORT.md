# AICompanyManager Phase ADW-ADZ
# Company list + organization read bridge

generated_at: 2026-04-29 22:11:36 +0900

## Result

```
PASS_COUNT=16
WARN_COUNT=2
FAIL_COUNT=0
FINAL_STATUS=COMPANY_ORG_READ_BRIDGE_APPLIED_REVIEW_REQUIRED

DB_READ=READ_ONLY
DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

BACKUP_SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/aicm-local-ui-api-server.before_adw_adz.mjs
BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/index.html.before_adw_adz.bak
READ_BRIDGE_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-organization-read-bridge.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/040_server.log
CURL_COMPANIES=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/050_curl_companies.json
CURL_ORGS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/051_curl_orgs.json
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/053_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_org_read_bridge_20260429_221130
```

## Fixed policy

- Do not treat "選択してください" as company.
- Populate AI企業選択 from read-only DB company API.
- Load selected company's departments/organizations from read-only DB organization API.
- Render selected company organization panel in the full UI.
- Keep full UI. Do not switch to minimal UI.
- No DB write / no API save / no RLS / no delete.

## Browser URL

```
http://127.0.0.1:8794/?v=20260429_221130
```

## Browser console check

```
window.AICMCompanyOrganizationReadBridge.companies()
window.AICMCompanyOrganizationReadBridge.current()
window.AICMCompanyOrganizationReadBridge.organizations()
window.AICMCompanyOrganizationReadBridge.log()
```
