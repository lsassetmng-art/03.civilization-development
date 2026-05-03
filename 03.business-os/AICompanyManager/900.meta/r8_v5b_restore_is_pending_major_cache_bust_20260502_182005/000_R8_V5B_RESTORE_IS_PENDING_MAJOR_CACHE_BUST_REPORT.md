# AICompanyManager R8 V5B restore isPendingMajor + cache bust

- run_ts: 20260502_182005
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/aicm-production-core.before_v5b.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/aicm-local-ui-api-server.before_v5b.mjs
- cache_tag: r8_v5b_is_pending_major_20260502_182005
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- Browser still loads old script version.
- Previous V5 failed because marker assertion was too strict.
- V5B accepts an existing helper even without marker and focuses on served JS verification.

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- local_helper_count: 1
- local_call_count: 3
- served_helper_count: 1
- served_call_count: 3
- cache_tag: r8_v5b_is_pending_major_20260502_182005
- after_script_src: assets/js/aicm-production-core.js?v=r8_v5b_is_pending_major_20260502_182005
- r8m_count: 1
- r8l_count: 0

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/040_scan_after.txt
- html_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/050_html_after.html
- served_js_scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/060_served_js_scan_after.txt
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/110_patch_result.json
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/200_server_nohup.log
- ui_url: http://127.0.0.1:8794/

## result
- final_status: R8_V5B_RESTORE_IS_PENDING_MAJOR_CACHE_BUST_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- delete_executed: NO
- rollback_backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/aicm-production-core.before_v5b.js
- rollback_backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/aicm-local-ui-api-server.before_v5b.mjs

## manual_check
1. ブラウザの該当タブを閉じる
2. http://127.0.0.1:8794/ を開き直す
3. 部門別タスク台帳を開く
4. まだエラーなら stack URL の ?v= が r8_v5b_is_pending_major_20260502_182005 になっているか確認する
