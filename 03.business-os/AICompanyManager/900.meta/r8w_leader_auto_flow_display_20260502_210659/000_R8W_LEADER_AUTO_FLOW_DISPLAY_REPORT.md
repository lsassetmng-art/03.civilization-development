# AICompanyManager R8W Leader auto-flow status display

- run_ts: 20260502_210659
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- cache_tag: r8w_leader_auto_flow_display_20260502_210659
- db_write: NO
- api_post: NO
- physical_delete: NO

## scope
Leader/課長へ送った後はユーザー操作ではなく自動処理として扱う。

今回:
- handed_off / assigned_to_leader のManager大項目を自動処理対象として表示
- 「中項目へ分解」などの通常操作ボタンは出さない
- Manager大項目サマリの下に自動処理状態パネルを表示
- DB/APIは触らない

次回:
- 自動分解キュー
- Leader中項目自動生成
- Worker作業単位自動展開
- 例外/レビュー待ち表示

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- mark_count: 2
- rows_helper_count: 1
- render_helper_count: 1
- render_call_count: 2
- title_count: 1
- r8l_count: 0
- cache_tag: r8w_leader_auto_flow_display_20260502_210659
- after_script_src: assets/js/aicm-production-core.js?v=r8u_manager_major_summary_20260502_204621

## maintainability
- Leader以降自動処理 rows helper: YES
- Leader以降自動処理 renderer: YES
- normal user operation button added: NO
- server route changed: NO
- db_write: NO
- api_post: NO
- physical_delete: NO

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/040_scan_after.txt
- helper_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/050_auto_flow_helper_snippet.txt
- render_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/060_task_ledger_render_snippet.txt
- served_js_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/080_served_js_scan.txt
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/200_server_nohup.log

## result
- final_status: R8W_LEADER_AUTO_FLOW_DISPLAY_DONE_REVIEW_REQUIRED

## manual_check
1. ブラウザを開き直す
2. 部門別タスク台帳を開く
3. Manager大項目サマリの下に「Leader以降自動処理」が出ること
4. 自動分解対象が1件表示されること
5. ユーザーが押す「中項目へ分解」ボタンが通常操作として出ていないこと
