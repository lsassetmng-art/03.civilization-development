# AICompanyManager delete execute cause prescan

- run_ts: 20260502_185916
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- db_write: NO
- api_post: NO
- delete_executed: NO

## known
- delete confirm card is visible.
- delete execute does not complete.

## purpose
Find whether the failure is:
1. execute button action not handled
2. execute helper not called
3. confirm state missing id
4. API payload mismatch
5. server route mismatch
6. SQL/DB/RLS failure
7. UI reload/filter issue

## outputs
- check_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/delete_execute_cause_prescan_20260502_185916/010_node_check.txt
- core_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/delete_execute_cause_prescan_20260502_185916/020_core_delete_scan.txt
- server_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/delete_execute_cause_prescan_20260502_185916/030_server_archive_scan.txt
- core_snippets: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/delete_execute_cause_prescan_20260502_185916/040_core_delete_snippets.txt
- server_snippets: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/delete_execute_cause_prescan_20260502_185916/050_server_archive_snippets.txt
- latest_server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/delete_execute_cause_prescan_20260502_185916/060_latest_server_log_tail.txt

## result
- final_status: DELETE_EXECUTE_CAUSE_PRESCAN_DONE
- db_write: NO
- api_post: NO
- delete_executed: NO

## next
- Paste the core/server snippets around delete execute and archive route.
- Then choose exact fix based on evidence.
