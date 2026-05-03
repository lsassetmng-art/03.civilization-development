# AICompanyManager nav log: task-ledger stuck on workbench

- run_ts: 20260502_180440
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- port: 8794
- db_write: NO
- api_post: NO
- delete_executed: NO

## observed
- ボタン押下後に「部門別タスク台帳を表示します。」は出る。
- ただし表示本体が AI実行Workbench のまま。

## likely
- click handler は動いている。
- 問題は state.screen の上書き、または render() 分岐順/条件。

## outputs
- check_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/010_node_check.txt
- pid_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/020_pid_and_curl.txt
- latest_server_log_tail: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/030_latest_server_log_tail.txt
- core_nav_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/050_core_nav_scan.txt
- render_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/060_render_snippet.txt
- open_helper_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/070_task_ledger_open_helper_snippet.txt
- handler_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/080_click_handler_snippet.txt
- state_assign_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/090_state_screen_assign_scan.txt
- workbench_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/nav_log_task_ledger_stuck_on_workbench_20260502_180440/100_workbench_scan.txt

## result
- final_status: NAV_LOG_TASK_LEDGER_STUCK_ON_WORKBENCH_COLLECTED
- db_write: NO
- api_post: NO
- delete_executed: NO

## next
- render_snippet と state_assign_scan から、state.screen が task-ledger 後に上書きされる箇所を特定する。
- 修正対象は server ではなく core の render分岐または open helper。
