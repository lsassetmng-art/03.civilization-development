# AICompanyManager R8 V8B delete owner payload

- run_ts: 20260502_192606
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8b_delete_owner_payload_20260502_192606/aicm-production-core.before_r8_v8b.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8b_delete_owner_payload_20260502_192606/aicm-local-ui-api-server.before_r8_v8b.mjs
- cache_tag: r8_v8b_delete_owner_payload_20260502_192606
- db_write_during_patch: NO
- api_post_during_patch: NO
- delete_executed_during_patch: NO

## confirmed cause
server archiveManagerMajorItem requires:
- owner_civilization_id
- aicm_manager_major_work_item_id

current core delete execute sends only:
- aicm_manager_major_work_item_id

Therefore delete archive fails before SQL because owner_civilization_id is missing.

## result
- final_status: FAILED_PATCH_ROLLED_BACK
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8b_delete_owner_payload_20260502_192606/110_patch_result.json
- backup_restored: YES
