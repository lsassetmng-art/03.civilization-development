# AICompanyManager R8S leader handoff confirm flow

- run_ts: 20260502_201858
- app_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
- core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/aicm-production-core.before_r8s.js
- backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/aicm-local-ui-api-server.before_r8s.mjs
- cache_tag: r8s_leader_handoff_20260502_201858

## scope
- Implement 「課長へ送る」
- Open confirmation card from each Manager大項目 row
- On confirmation, POST to /api/aicm/v2/manager-major/update
- Update:
  - decomposition_status_code = assigned_to_leader
  - handoff_status_code = handed_off
- Reload context after success
- Do not change server route
- Do not execute DB write/API POST during patch

## write policy
- db_write_during_patch: NO
- api_post_during_patch: NO
- db_write_on_manual_confirm: YES

## checks
- node_check_before_core_server: PASS
- node_check_after_core_server: PASS
- mark_count: 4
- open_helper_count: 1
- render_confirm_count: 1
- execute_helper_count: 1
- action_open_count: 1
- action_execute_count: 1
- action_cancel_count: 1
- update_endpoint_count: 3
- assigned_status_count: 4
- handed_off_count: 7
- renderer_card_count: 3
- r8l_count: 0
- cache_tag: r8s_leader_handoff_20260502_201858
- after_script_src: assets/js/aicm-production-core.js?v=r8s_leader_handoff_20260502_201858

## maintainability
- target resolution helperized: YES
- confirmation card helperized: YES
- execute POST helperized: YES
- central click handler remains short: YES
- server route changed: NO
- DB write during patch: NO
- API POST during patch: NO
- DB write on manual confirm: YES
- confirmation before write: YES

## outputs
- scan_before: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/030_scan_before.txt
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/040_scan_after.txt
- helper_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/050_leader_handoff_helper_snippet.txt
- handler_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/060_leader_handoff_handler_snippet.txt
- render_snippet: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/070_render_manager_major_rows_snippet.txt
- html_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/080_html_after.html
- served_js_scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/090_served_js_scan_after.txt
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/110_patch_result.json
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/200_server_nohup.log
- ui_url: http://127.0.0.1:8794/

## result
- final_status: R8S_LEADER_HANDOFF_CONFIRM_FLOW_DONE_REVIEW_REQUIRED
- db_write_during_patch: NO
- api_post_during_patch: NO
- db_write_on_manual_confirm: YES
- rollback_backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/aicm-production-core.before_r8s.js
- rollback_backup_server: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/aicm-local-ui-api-server.before_r8s.mjs

## manual_check
1. ブラウザタブを閉じる
2. http://127.0.0.1:8794/ を開き直す
3. 部門別タスク台帳を開く
4. 登録済み大項目をリロード
5. 任意の1件で「課長へ送る」を押す
6. 「課長へ送る確認」カードが出ることを確認
7. 送ってよい1件だけ「課長へ送るを確定」
8. 成功後、その行が未引き継ぎ一覧から消えることを確認
