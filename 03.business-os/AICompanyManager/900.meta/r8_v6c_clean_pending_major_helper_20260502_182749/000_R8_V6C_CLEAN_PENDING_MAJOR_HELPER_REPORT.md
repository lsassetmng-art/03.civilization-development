# AICompanyManager R8 V6C clean pending major helper

- run_ts: 20260502_182749
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/aicm-production-core.before_r8_v6c.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/aicm-local-ui-api-server.before_r8_v6c.mjs
- cache_tag: r8_v6c_clean_pending_major_20260502_182749
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- V6-clean failed because assertion counted function declaration "function isPendingMajor(row)" as external call.
- V6C verifies only inside aicmRenderManagerMajorRows.
- Existing isPendingMajor helper may remain elsewhere, but renderer will no longer depend on it.

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- helper_count: 1
- render_major_count: 1
- renderer_old_call_count: 0
- renderer_clean_call_count: 1
- helper_line: 4517
- render_line: 4554
- served_helper_count: 2
- cache_tag: r8_v6c_clean_pending_major_20260502_182749
- after_script_src: assets/js/aicm-production-core.js?v=r8_v6c_clean_pending_major_20260502_182749
- r8m_count: 1
- r8l_count: 0

## maintainability
- renderer dependency on generic isPendingMajor: REMOVED
- dedicated helper name: aicmIsPendingManagerMajorRowR8V6
- helper is directly before renderer: YES
- validation only checks renderer chunk, not unrelated declarations: YES
- server route changed: NO
- DB write during patch: NO
- API POST during patch: NO
- delete executed: NO

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/040_scan_after.txt
- helper_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/070_helper_render_snippet.txt
- renderer_chunk: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/080_renderer_chunk_after.txt
- html_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/050_html_after.html
- served_js_scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/060_served_js_scan_after.txt
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/110_patch_result.json
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/200_server_nohup.log
- ui_url: http://127.0.0.1:8794/

## result
- final_status: R8_V6C_CLEAN_PENDING_MAJOR_HELPER_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- delete_executed: NO
- rollback_backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/aicm-production-core.before_r8_v6c.js
- rollback_backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/aicm-local-ui-api-server.before_r8_v6c.mjs

## manual_check
1. ブラウザタブを閉じる
2. http://127.0.0.1:8794/ を開き直す
3. 部門別タスク台帳を開く
4. 台帳が表示されるか確認
5. まだ赤エラーなら message/stack を貼る
