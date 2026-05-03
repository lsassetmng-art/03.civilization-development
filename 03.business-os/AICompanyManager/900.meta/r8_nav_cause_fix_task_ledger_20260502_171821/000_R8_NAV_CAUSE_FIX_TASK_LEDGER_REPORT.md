# AICompanyManager task-ledger navigation cause fix

- run_ts: 20260502_171821
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/aicm-production-core.before_nav_cause_fix.js
- db_write: NO
- api_post: NO
- delete_executed: NO

## intent
- rollbackではなく、遷移できない原因を切り分ける。
- 必要なら task-ledger 周辺の壊れた関数境界だけを修復する。
- data-core-action="go" data-screen="task-ledger" を専用遷移として明示処理する。

## cause classification
- core_syntax_before: PASS
- if FAIL, broken_copy: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/aicm-production-core.syntax_broken_if_any.js
- fix: explicit task-ledger navigation before generic go handler
- if syntax boundary was broken, patcher repaired aicmRenderManagerMajorRows -> aicmReloadTaskLedgerContext boundary only

## checks
- node_check_after_core_server: PASS
- nav_marker_count: 2
- go_handler_count: 1
- task_button_count: 2
- render_task_ledger_count: 1
- render_major_count: 1
- reload_task_ledger_count: 1
- r8m_marker_count: 1
- r8l_marker_count: 0

## outputs
- check_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/010_node_check_before.txt
- check_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/020_node_check_after.txt
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/040_scan_after.txt
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/110_patch_result.json
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/200_server.log
- ui_url: http://127.0.0.1:8794/

## result
- final_status: R8_NAV_CAUSE_FIX_TASK_LEDGER_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- delete_executed: NO
- rollback_backup: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/aicm-production-core.before_nav_cause_fix.js

## manual_check
1. UIを開く
2. ダッシュボードから部門別タスク台帳へ遷移できることを確認
3. 登録済み大項目が表示されることを確認
4. 課長へ送るボタンが残っていることを確認
5. ここがOKになってから、ページング/削除/プロンプト修正を小さく入れる
