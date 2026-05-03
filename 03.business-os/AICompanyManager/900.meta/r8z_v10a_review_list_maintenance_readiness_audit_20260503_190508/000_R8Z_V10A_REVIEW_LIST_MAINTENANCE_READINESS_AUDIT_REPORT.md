============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳表示 OK
- 課長へ送る確認カード OK
- 課長へ送る確定 OK
- 削除確認カード OK
- 削除確定 OK
- git checkpoint / push OK: 9f7d2dc
- 次の本筋はレビュー・承認待ち一覧の2件表示

今回:
1. current core/server syntax確認
2. served coreとdisk coreの一致確認
3. context APIが正しい owner_civilization_id で review_wait_items=2 を返すか確認
4. DB/view上のレビュー待ち2件をSELECT onlyで確認
5. review-list描画経路とV8/V9系パッチ積み上がりを棚卸し
6. 次に触るべき最小修正点を判定

禁止:
- DB write
- API POST
- PATCH
- 追加bridge
- render関数丸ごと置換
- 台帳/課長へ送る/削除の既存OK部分への変更

方針:
- レビュー待ち修正前に、V8/V9の応急debug層を把握する
- 次パッチは成功時に画面起動まで行う

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508
DB_READ=YES
DB_WRITE=NO
API_GET=YES
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core / root
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 3 ms: Could not connect to server
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
ROOT_HTTP=000
SERVED_HTTP=000
DISK_SHA=a77bdc410d97023f3b4c16d2c8ea736336f8fda09582f2d0e27967625b56e11f
SERVED_SHA=
grep: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/010_root.html: No such file or directory
SCRIPT_SRC_LIST=
WARN: served core differs from disk

============================================================
4. context API review_wait_items check
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v10a_20260503_190508
CONTEXT_HTTP=000
CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/020_context_correct_owner.json
CONTEXT_RESULT=
CONTEXT_REVIEW_WAIT_ITEMS_COUNT=0
CONTEXT_TARGET_REVIEW_WAIT_ITEMS_COUNT=0
CONTEXT_PMLW_MAJOR_COUNT=0
CONTEXT_WORKER_WORK_UNITS_COUNT=0
CONTEXT_OWNER=
REVIEW_TITLES=
HAS_AI_COMPANY_START=false
HAS_MANAGER_MAJOR=false

============================================================
5. DB readonly review confirmation
============================================================
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/050_db_review_readonly.tsv
DB_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/051_db_review_readonly.err
---- DB_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
BEGIN
DB_HUMAN_REVIEW_PENDING_COUNT	2
DB_VIEW_WAIT_DISPLAY_COUNT	2
DB_VIEW_WAIT_TITLE	納品サマリー確認: AI企業業務開始導線の整備 作業	delivery_summary	delivery_package	urgent
DB_VIEW_WAIT_TITLE	納品サマリー確認: Manager大項目台帳運用の整備 作業	delivery_summary	delivery_package	urgent
ROLLBACK

============================================================
6. core review-list / patch stack scan
============================================================
CORE_REVIEW_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/030_core_review_scan.txt
CORE_PATCH_STACK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/031_core_patch_stack_scan.txt
---- patch marker counts ----
AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE=2
AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE=2
AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE=3
AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER=1
AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG=4
AICM_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK=2
AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE=2
AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE=3
AICM_R8Z_V9E=2
AICM_R8Z_V9G5_RESTORE_DELETE_CONFIRM_EXECUTE_BRIDGE_ONLY=1
AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE=3

---- high-risk review debug/function lines ----
9996:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: expose callback on globalThis as well as window
10493:            appState.aicmR8zV8kDebug = "xhr-fallback-error";
10824:    params.set("callback", "window.__aicmR8zV9ReviewContextCallback"); // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE
10848:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: loaded-without-callback diagnostics
10857:            appState.aicmR8zV8kDebug = "v9-script-loaded-no-callback";
10861:                : "script loaded but callback did not merge"
10907:      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
10908:      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
10922:      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'

============================================================
7. server context/script scan
============================================================
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/040_server_context_scan.txt
CONTEXT_SCRIPT_ROUTE_COUNT=1
SERVER_REVIEW_WAIT_SQL_COUNT=1

============================================================
8. git info
============================================================
---- git status ----
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/mock-bridge-adapter.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/mock-session.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/admin-store.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/auth-mock.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/launch-mock.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/os-launch/evaluate-os-entry.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/admin-client.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/auth-client.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/content-client.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/types/bridge.ts
 M ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/types/portal-admin-api.ts
 M 900.meta/git_checkpoint_after_delete_ok_20260503_183449/000_GIT_CHECKPOINT_AFTER_DELETE_OK_REPORT.md
?? ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260428_181520_compat_pass_b/
?? ../../01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260429_051353_compat_pass_c_missing_build_exports/
?? 900.meta/git_checkpoint_after_delete_ok_20260503_183449/020_status_after.txt
?? 900.meta/git_checkpoint_after_delete_ok_20260503_183449/050_git_log.txt
?? 900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/
?? ../CasualChatWorker/docs/final/20260426_052059_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
?? ../CasualChatWorker/docs/final/20260426_052059_CASUAL_CHAT_WORKER_PHASE_P_CLOSEOUT.md
?? ../CasualChatWorker/docs/final/20260426_055128_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
?? ../CasualChatWorker/docs/final/20260426_055128_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
?? ../CasualChatWorker/docs/final/20260426_211334_CASUAL_CHAT_WORKER_DB_BACKED_PAYLOAD_ACCEPTANCE_GATE.md
?? ../CasualChatWorker/docs/final/CASUAL_CHAT_WORKER_IMPLEMENTATION_PREPARED_COMPLETION_MARKER.md
?? ../CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
?? ../CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
?? ../CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
?? ../CasualChatWorker/docs/handoff/20260426_052059_CASUAL_CHAT_WORKER_FINAL_EXPORT_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/20260426_055128_CASUAL_CHAT_WORKER_EXPORT_INDEX_FOR_NEXT_CHAT.md
?? ../CasualChatWorker/docs/handoff/20260426_105214_PERSONA_DB_LIVE_ROLLBACK_GATE_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/20260426_105505_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/20260426_110851_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_FIX_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/20260426_200008_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/20260426_211334_PERSONA_DB_BACKED_PAYLOAD_ACCEPTANCE_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_EXPORT_INDEX_FOR_NEXT_CHAT.md
?? ../CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_FINAL_EXPORT_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_BACKED_PAYLOAD_ACCEPTANCE_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_FIX_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
?? ../CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_LIVE_ROLLBACK_GATE_HANDOFF.md
?? ../CasualChatWorker/docs/meta/20260426_052059_phase_p_closeout_report.md
?? ../CasualChatWorker/docs/meta/20260426_055128_post_closeout_final_quality_report.md
?? ../CasualChatWorker/docs/meta/20260426_105214_persona_db_live_rollback_gate_report.md
?? ../CasualChatWorker/docs/meta/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke_report.md
?? ../CasualChatWorker/docs/meta/20260426_110851_persona_db_confirm_rollback_smoke_fix_report.md
?? ../CasualChatWorker/docs/meta/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix_report.md
?? ../CasualChatWorker/docs/meta/20260426_211334_persona_db_backed_payload_acceptance_report.md
?? ../CasualChatWorker/docs/verification/20260426_052059_phase_p_closeout_verify.md
?? ../CasualChatWorker/docs/verification/20260426_055128_post_closeout_final_quality_gate/
?? ../CasualChatWorker/docs/verification/20260426_105214_persona_db_live_rollback_gate/
?? ../CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/
?? ../CasualChatWorker/docs/verification/20260426_110851_persona_db_confirm_rollback_smoke_fix_ambiguous/
?? ../CasualChatWorker/docs/verification/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix/
?? ../CasualChatWorker/docs/verification/20260426_211334_persona_db_backed_payload_acceptance/
?? ../RobotRentalStore/
?? ../_aiworker/
?? ../_businessos/
?? ../../09.CX22073JW/logs/20260428_074430_robot_role_knowledge_registration/
?? ../../11.aiworker-os/brain-access-integration/
?? ../../11.aiworker-os/brain-data-thickening/
?? ../../11.aiworker-os/robot-capability-profile/
?? ../../11.aiworker-os/robot-catalog-fix/
?? ../../11.aiworker-os/robot-list/
?? ../../11.aiworker-os/runtime-brain-context/
?? ../../11.aiworker-os/runtime-control-profile/
?? ../../11.aiworker-os/runtime-execution-app-api/
?? ../../11.aiworker-os/runtime-execution-complete/
?? ../../11.aiworker-os/runtime-execution-http-api/
?? ../../11.aiworker-os/runtime-execution-request/

---- git log ----
9f7d2dc checkpoint: AICompanyManager delete confirm execute ok 20260503_183449
ce87a09 aicm: add checkpoint report after R8Z V9D1 git push
9af0934 aicm: checkpoint R8Z V9D1 task ledger recovery before review fix
be02a5f AICompanyManager company change white screen guard
12c1720 AICompanyManager company edit action stable fix
5c62118 AICompanyManager current company single selector UI fix
841dea4 AICompanyManager production company context UI simplify
b20b5d0 AICompanyManager company save client v6 field dedup list sync

============================================================
9. final judgement
============================================================
FINAL_JUDGEMENT=SERVER_OR_ASSET_NOT_READY_RESTART_FIRST
ROOT_HTTP=000
SERVED_HTTP=000
DISK_SHA=a77bdc410d97023f3b4c16d2c8ea736336f8fda09582f2d0e27967625b56e11f
SERVED_SHA=
CONTEXT_HTTP=000
CONTEXT_REVIEW_COUNT=0
CONTEXT_TARGET_REVIEW_COUNT=0
DB_HUMAN_REVIEW_PENDING_COUNT=2
DB_VIEW_WAIT_DISPLAY_COUNT=2
HAS_AI_COMPANY_START=false
HAS_MANAGER_MAJOR=false
V7_MARKER_COUNT=2
V8G_MARKER_COUNT=3
V8K_MARKER_COUNT=4
V8L_MARKER_COUNT=2
V9_MARKER_COUNT=2
V9C_MARKER_COUNT=3
V9G8B_MARKER_COUNT=3
PATCH_STACK_REVIEW_DEBUG_COUNT=11
CONTEXT_SCRIPT_ROUTE_COUNT=1
SERVER_REVIEW_WAIT_SQL_COUNT=1
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/000_R8Z_V10A_REVIEW_LIST_MAINTENANCE_READINESS_AUDIT_REPORT.md
CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/021_context_summary.txt
CORE_REVIEW_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/030_core_review_scan.txt
CORE_PATCH_STACK=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/031_core_patch_stack_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/040_server_context_scan.txt
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/050_db_review_readonly.tsv
GIT_INFO=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10a_review_list_maintenance_readiness_audit_20260503_190508/060_git_info.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- REVIEW_DATA_OK_BUT_PATCH_STACKED_CLEANUP_THEN_MINIMAL_RENDER_FIX:
  次はV8K/V8L/V9/V9Cなどレビュー待ち用の応急debug/hydration層を、削除OK部分に触らず整理する。
  その後、review-list routeのpre-hydrate + local renderだけに寄せる。

- REVIEW_DATA_OK_READY_FOR_MINIMAL_RENDER_FIX:
  次はreview-listへ入る直前のcontext hydrateと、local renderer再描画だけを最小修正する。

- REVIEW_DATA_NOT_READY_CHECK_DB_VIEW_CONTEXT:
  DB/view/contextのどこで2件が消えたかを先に確認する。
