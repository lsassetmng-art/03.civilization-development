# AICompanyManager R8 NAV V5 restore isPendingMajor

- run_ts: 20260502_181057
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/aicm-production-core.before_restore_isPendingMajor.js
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- task-ledger navigation works.
- browser-side task-ledger render fails with: isPendingMajor is not defined.
- fix scope is one helper only.

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- helper_count: 1
- call_count: 3
- render_major_count: 1
- safe_render_count: 1
- r8m_count: 1
- r8l_count: 0

## maintainability
- restored missing helper only: YES
- renderTaskLedgerPlaceholder changed: NO
- aicmRenderManagerMajorRows changed: NO
- render() changed: NO
- server changed: NO
- DB write during patch: NO
- API POST during patch: NO
- delete executed: NO

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/040_scan_after.txt
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/110_patch_result.json
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/200_server_nohup.log
- server_pid_file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/201_server.pid
- ui_url: http://127.0.0.1:8794/

## result
- final_status: R8_NAV_V5_RESTORE_IS_PENDING_MAJOR_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- delete_executed: NO
- rollback_backup: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/aicm-production-core.before_restore_isPendingMajor.js

## manual_check
1. 部門別タスク台帳ボタンを押す
2. 台帳が表示されることを確認
3. 次ページ/前ページが動くことを確認
4. 削除ボタンは確認カード表示まで確認。削除確定はまだ押さない
5. もし次の赤いエラーが出たら message/stack を貼る
