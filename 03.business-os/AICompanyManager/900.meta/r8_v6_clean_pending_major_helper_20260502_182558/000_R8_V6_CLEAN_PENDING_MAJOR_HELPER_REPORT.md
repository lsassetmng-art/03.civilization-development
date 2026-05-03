# AICompanyManager R8 V6-clean pending major helper

- run_ts: 20260502_182558
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6_clean_pending_major_helper_20260502_182558/aicm-production-core.before_r8_v6_clean.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6_clean_pending_major_helper_20260502_182558/aicm-local-ui-api-server.before_r8_v6_clean.mjs
- cache_tag: r8_v6_clean_pending_major_20260502_182558
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- task-ledger navigation works.
- served JS cache-bust works.
- render fails because aicmRenderManagerMajorRows calls isPendingMajor(row).
- Previous helper may exist outside visible scope or may not be installed near renderer.
- V6-clean adds dedicated helper directly before renderer and removes external isPendingMajor dependency.

## result
- final_status: FAILED_PATCH_ROLLED_BACK
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6_clean_pending_major_helper_20260502_182558/110_patch_result.json
- backup_restored: YES
