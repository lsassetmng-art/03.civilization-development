# AICompanyManager R8 V5 verify restore + cache bust

- run_ts: 20260502_181812
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5_verify_restore_and_cache_bust_20260502_181812/aicm-production-core.before_verify_v5.js
- cache_tag: r8_v5_is_pending_major_20260502_181812
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- Browser still shows: isPendingMajor is not defined
- Stack URL still uses old query: ?v=20260430_112432_clean_production_core
- Need to verify both local core and served JS.
