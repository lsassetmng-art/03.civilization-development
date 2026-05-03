# AICompanyManager R8 V7D2 delete confirm visible

- run_ts: 20260502_184726
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d2_delete_confirm_visible_20260502_184726/aicm-production-core.before_r8_v7d2.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d2_delete_confirm_visible_20260502_184726/aicm-local-ui-api-server.before_r8_v7d2.mjs
- cache_tag: r8_v7d2_delete_confirm_visible_20260502_184726
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- Previous V7D failed because literal backslash-n was inserted into JS.
- Rollback restored backups.
- V7D2 uses join("\n") inside the patcher to insert real newlines safely.

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- mark_count: 2
- confirm_id_count: 2
- scroll_helper_count: 1
- scroll_call_count: 3
- scroll_into_view_count: 2
- open_wrapper_count: 1
- v7c2_count: 4
- v6c_count: 2
- r8m_count: 1
- r8l_count: 0
- cache_tag: r8_v7d2_delete_confirm_visible_20260502_184726
- after_script_src: assets/js/aicm-production-core.js?v=r8_v7d2_delete_confirm_visible_20260502_184726

## maintainability
- stable confirm card id: YES
- scroll helper isolated: YES
- delete wrapper reused: YES
- central handler changed: NO
- server route changed: NO
- DB write during patch: NO
- API POST during patch: NO
- delete executed by patch: NO
- literal backslash-n insertion avoided: YES

## result
- final_status: R8_V7D2_DELETE_CONFIRM_VISIBLE_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- delete_executed: NO
- rollback_backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d2_delete_confirm_visible_20260502_184726/aicm-production-core.before_r8_v7d2.js
- rollback_backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d2_delete_confirm_visible_20260502_184726/aicm-local-ui-api-server.before_r8_v7d2.mjs
