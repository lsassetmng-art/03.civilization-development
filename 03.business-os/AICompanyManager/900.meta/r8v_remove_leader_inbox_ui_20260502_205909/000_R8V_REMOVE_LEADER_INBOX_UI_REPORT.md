# AICompanyManager R8V remove Leader inbox routine UI

- run_ts: 20260502_205909
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- cache_tag: r8v_remove_leader_inbox_ui_20260502_205909
- db_write: NO
- api_post: NO
- physical_delete: NO

## reason
Manager大項目サマリで Leader受信済み件数と詳細確認ができるため、
別枠の Leader受信箱 は台帳画面上で重複する。

## scope
- renderTaskLedgerPlaceholder から Leader受信箱セクション表示を外す
- R8T helper は残す
- R8U summary は残す
- DB/API/server route は触らない

## checks
- node_check_before: PASS
- node_check_after: PASS
- r8v_count: 2
- summary_call_count: 2
- leader_call_count_global: 1
- leader_title_count_global: 0
- cache_tag: r8v_remove_leader_inbox_ui_20260502_205909

## maintainability
- Manager大項目サマリ remains canonical: YES
- Leader受信箱 routine section removed from task ledger: YES
- R8T helper left in file for now: YES
- server route changed: NO
- db_write: NO
- api_post: NO
- physical_delete: NO

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/040_scan_after.txt
- render_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/050_task_ledger_render_snippet.txt
- served_js_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/070_served_js_scan.txt
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/200_server_nohup.log

## result
- final_status: R8V_REMOVE_LEADER_INBOX_UI_DONE_REVIEW_REQUIRED

## manual_check
1. ブラウザを開き直す
2. 部門別タスク台帳を開く
3. Manager大項目サマリが表示されること
4. Leader受信済み件数カードで詳細確認できること
5. 独立した課長/Leader受信箱セクションが表示されないこと
