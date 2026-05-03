# AICompanyManager R8 V8C delete owner payload

- run_ts: 20260502_192943
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8c_delete_owner_payload_20260502_192943/aicm-production-core.before_r8_v8c.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8c_delete_owner_payload_20260502_192943/aicm-local-ui-api-server.before_r8_v8c.mjs
- cache_tag: r8_v8c_delete_owner_payload_20260502_192943
- db_write_during_patch: NO
- api_post_during_patch: NO
- delete_executed_during_patch: NO

## confirmed cause
server archiveManagerMajorItem requires:
- owner_civilization_id
- aicm_manager_major_work_item_id

current core delete execute sends only:
- aicm_manager_major_work_item_id

V8B failed because validation depended on V6C marker count.
V8C validates functional anchors instead of old marker counts.

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- mark_count: 2
- owner_helper_count: 1
- execute_helper_count: 1
- owner_payload_count: 38
- major_payload_count: 4
- server_owner_req_count: 18
- server_major_req_count: 2
- served_mark_count: 2
- served_owner_count: 38
- served_major_count: 4
- cache_tag: r8_v8c_delete_owner_payload_20260502_192943
- after_script_src: assets/js/aicm-production-core.js?v=r8_v8c_delete_owner_payload_20260502_192943

## maintainability
- delete execute helper replaced only: YES
- owner id extraction helperized: YES
- API error formatting helperized: YES
- no dependency on old V6C marker count: YES
- server route changed: NO
- DB write during patch: NO
- API POST during patch: NO
- delete executed by patch: NO

## result
- final_status: R8_V8C_DELETE_OWNER_PAYLOAD_DONE_REVIEW_REQUIRED
- db_write_during_patch: NO
- api_post_during_patch: NO
- delete_executed_during_patch: NO
- rollback_backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8c_delete_owner_payload_20260502_192943/aicm-production-core.before_r8_v8c.js
- rollback_backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8c_delete_owner_payload_20260502_192943/aicm-local-ui-api-server.before_r8_v8c.mjs

## manual_check
1. ブラウザタブを閉じる
2. http://127.0.0.1:8794/ を開き直す
3. 部門別タスク台帳を開く
4. 削除確認カードを開く
5. 削除してよい1件だけ「削除を確定」
6. 成功なら件数が減る/対象行が消える
7. 失敗なら画面の赤いエラーメッセージを貼る
