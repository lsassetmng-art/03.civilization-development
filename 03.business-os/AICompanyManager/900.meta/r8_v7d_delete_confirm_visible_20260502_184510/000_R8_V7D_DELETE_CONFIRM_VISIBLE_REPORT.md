# AICompanyManager R8 V7D delete confirm visible

- run_ts: 20260502_184510
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d_delete_confirm_visible_20260502_184510/aicm-production-core.before_r8_v7d.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d_delete_confirm_visible_20260502_184510/aicm-local-ui-api-server.before_r8_v7d.mjs
- cache_tag: r8_v7d_delete_confirm_visible_20260502_184510
- db_write: NO
- api_post: NO
- delete_executed: NO

## diagnosis
- Delete button is visible but confirmation card is not visible.
- Likely causes:
  1. action not reaching delete-open handler
  2. confirm card renders above current scroll position
  3. confirm card has no stable anchor/id
- V7D keeps handler/helper separation, adds a stable confirm card id, and scrolls it into view.
