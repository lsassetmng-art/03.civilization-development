# AICompanyManager server drop cause + stable restart report

- run_ts: 20260502_174736
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- port: 8794
- db_write: NO
- api_post: NO
- delete_executed: NO

## purpose
- サーバ落ちの原因をログ/PIDから確認する
- node --check で構文破損を除外する
- nohup起動でTermuxセッション終了後も落ちにくくする

## checks
- node_check_core_server: PASS
- pid_scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_drop_cause_stable_restart_20260502_174736/020_pid_scan_before.txt
- latest_log_tail: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_drop_cause_stable_restart_20260502_174736/040_latest_server_log_tail.txt
- pid_scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_drop_cause_stable_restart_20260502_174736/030_pid_scan_after.txt
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_drop_cause_stable_restart_20260502_174736/200_server_nohup.log
- server_pid_file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_drop_cause_stable_restart_20260502_174736/201_server.pid
- curl_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/server_drop_cause_stable_restart_20260502_174736/300_curl_ui.txt
- ui_url: http://127.0.0.1:8794/

## likely_cause
- 直前の起動方式が通常background起動だった場合、Termuxセッション終了/親shell終了でサーバが落ちた可能性が高い。
- 今回は nohup 起動に変更。

## result
- final_status: SERVER_DROP_CAUSE_STABLE_RESTART_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- delete_executed: NO

## manual_check
1. UIを開く
2. ダッシュボードから部門別タスク台帳へ遷移
3. 登録済み大項目が表示されることを確認
4. 次ページ/削除確認/ChatGPTプロンプトの状態を確認
