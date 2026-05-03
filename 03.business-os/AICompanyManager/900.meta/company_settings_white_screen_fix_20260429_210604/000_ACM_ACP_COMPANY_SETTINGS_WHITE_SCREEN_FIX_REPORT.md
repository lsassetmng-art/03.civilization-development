# AICompanyManager Phase ACM-ACP
# Company settings white screen fix

generated_at: 2026-04-29 21:06:04 +0900

## Scope

- Target: 03.business-os / AICompanyManager
- Problem: AI企業設定 -> 遷移先で白画面
- Fix policy:
  - Disable early hard guard: aicm-company-change-white-screen-guard.js
  - Add safe unified company UI controller at final script position
  - Do not add DB/API/RLS/delete behavior
  - Do not physically delete old files
- DB_WRITE: NOT_EXECUTED
- API_SAVE: NOT_EXECUTED
- RLS_APPLY: NOT_EXECUTED
- DELETE: NOT_EXECUTED
- Python: NOT_USED

## Paths

- APP_ROOT: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager`
- INDEX_HTML: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/index.html`
- SAFE_JS: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-settings-unified-safe-controller.js`
- RUN_DIR: `/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_fix_20260429_210604`


## Result

```
PASS_COUNT=9
WARN_COUNT=3
FAIL_COUNT=0
FINAL_STATUS=FIX_APPLIED_REVIEW_REQUIRED

DB_WRITE=NOT_EXECUTED
API_SAVE=NOT_EXECUTED
RLS_APPLY=NOT_EXECUTED
DELETE=NOT_EXECUTED

BACKUP_INDEX=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_fix_20260429_210604/index.html.before_acm_acp.bak
SAFE_JS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-company-settings-unified-safe-controller.js
SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_fix_20260429_210604/010_local_ui_server_8794.log
CURL_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_fix_20260429_210604/021_curl_8794.log
VERIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_fix_20260429_210604/030_verify.txt
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/company_settings_white_screen_fix_20260429_210604
```

## Manual browser check

Open:

```
http://127.0.0.1:8794/
```

Then check:

1. AI企業設定を押して白画面にならないこと
2. AI企業選択でウルフを選べること
3. AI企業を表示で会社概要に反映されること
4. 会社変更画面に不要な変更対象select / 読込ボタンが復活していないこと
5. 会社削除が安全停止されること

## Browser console helper

If needed, run in browser console:

```
window.AICMCompanySettingsSafeController && window.AICMCompanySettingsSafeController.diag()
```

