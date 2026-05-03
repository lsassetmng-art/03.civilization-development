# AICompanyManager Phase ADK-ADN
# Restore full UI + add legacy company DOM compatibility anchors

generated_at: 2026-04-29 21:53:20 +0900

## Result

```
PASS_COUNT=16
WARN_COUNT=1
FAIL_COUNT=0
FINAL_STATUS=FULL_UI_COMPAT_APPLIED_REVIEW_REQUIRED

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

CURRENT_INDEX_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_ui_legacy_company_dom_compat_20260429_215316/index.html.current.before_adk_adn.bak
SELECTED_RESTORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_visible_rescue_20260429_214127/index.html.before_acy_adb.bak
COMPAT_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-legacy-dom-compatibility.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_ui_legacy_company_dom_compat_20260429_215316/040_server.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_ui_legacy_company_dom_compat_20260429_215316/051_curl.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_ui_legacy_company_dom_compat_20260429_215316/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/full_ui_legacy_company_dom_compat_20260429_215316
```

## Policy fixed by this phase

- Do not physically delete BusinessOS company selection card dependencies.
- Do not physically delete pre-rename company selector dependencies.
- Keep legacy DOM anchors for old JS.
- Hide compatibility anchors visually, not with display:none.
- Keep full UI instead of emergency minimal UI.
- DB/API/RLS/delete remain untouched.

## Browser URL

```
http://127.0.0.1:8794/?v=20260429_215316
```

## Check

1. Full UI appears, not emergency safe-mode UI.
2. AI企業設定 opens without white screen.
3. AI企業選択 remains the user-facing current-company selector.
4. 会社変更 does not white screen.
5. Company delete remains safety-stopped.
