# AICompanyManager R8U Manager major count summary

- run_ts: 20260502_204621
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- cache_tag: r8u_manager_major_summary_20260502_204621
- db_write: NO
- api_post: NO
- physical_delete: NO

## scope
部門別タスク台帳の上部に、Manager大項目由来の件数サマリを表示する。

## summary buckets
- 未引き継ぎ
- Leader受信済み
- 自動処理中
- 完了/分解済み
- 削除済み
- その他

## detail
件数カードを押すと、同じ台帳画面内に該当行の詳細確認を表示する。

## not included
- DB更新
- API POST
- Leader以降の自動処理実行

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- mark_count: 4
- rows_helper_count: 1
- counts_helper_count: 1
- render_helper_count: 1
- action_filter_count: 1
- action_clear_count: 1
- render_call_count: 2
- summary_title_count: 1
- r8l_count: 0
- cache_tag: r8u_manager_major_summary_20260502_204621
- after_script_src: assets/js/aicm-production-core.js?v=r8u_manager_major_summary_20260502_204621

## maintainability
- summary rows helper: YES
- summary count helper: YES
- summary renderer helper: YES
- summary detail helper: YES
- action handler is small: YES
- renderTaskLedgerPlaceholder injection only: YES
- server route changed: NO
- DB write: NO
- API POST: NO
- physical delete: NO

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/040_scan_after.txt
- helper_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/050_summary_helper_snippet.txt
- render_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/060_task_ledger_render_snippet.txt
- handler_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/070_summary_handler_snippet.txt
- html_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/080_html_after.html
- served_js_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/090_served_js_scan.txt
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/200_server_nohup.log

## result
- final_status: R8U_MANAGER_MAJOR_SUMMARY_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- physical_delete: NO
- rollback_backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/aicm-production-core.before_r8u.js
- rollback_backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/aicm-local-ui-api-server.before_r8u.mjs

## manual_check
1. ブラウザタブを閉じる
2. http://127.0.0.1:8794/ を開き直す
3. 部門別タスク台帳を開く
4. 登録済み大項目をリロード
5. 台帳一覧の上に「Manager大項目サマリ」が出ること
6. 未引き継ぎ=36件、Leader受信済み=1件に近い値が出ること
7. 件数カードを押すと詳細が表示されること
8. 詳細表示を閉じるボタンが動くこと
