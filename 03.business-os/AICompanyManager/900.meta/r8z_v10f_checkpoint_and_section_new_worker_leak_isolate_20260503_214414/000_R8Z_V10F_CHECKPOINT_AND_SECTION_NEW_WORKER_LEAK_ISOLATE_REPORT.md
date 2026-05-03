============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- 成果物確認 OK
- 承認前/差し戻し前の最終確認カード OK
- 次に、課新規追加画面で他課の従業員設定が漏れているバグを確認

今回:
1. V10F OK状態をgit checkpoint
2. core/server syntax確認
3. served core一致確認
4. 課新規追加 render / state / action を調査
5. 既存課の従業員配置が section-new に流れている経路を特定
6. 次の修正方針を分類する

禁止:
- DB write
- API POST
- PATCH
- 課新規追加の即時修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax / V10F verify
============================================================
PASS: syntax OK
V10F_MARKER_COUNT=2
V10F_HAS_CONFIRM_CARD=1
V10F_EXECUTE_DISABLED=1
V10D5_MARKER_COUNT=2
V9G8B_MARKER_COUNT=3

============================================================
3. git checkpoint for V10F OK
============================================================
GIT_ROOT=/data/data/com.termux/files/home/03.civilization-development
APP_REL=03.business-os/AICompanyManager
STATUS_BEFORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/010_git_status_before.txt
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/mock-bridge-adapter.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/mock-session.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/admin-store.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/auth-mock.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/launch-mock.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/os-launch/evaluate-os-entry.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/admin-client.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/auth-client.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/content-client.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/types/bridge.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/types/portal-admin-api.ts
 M 03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/000_GIT_CHECKPOINT_AFTER_V10D5_ARTIFACT_DETAIL_OK_REPORT.md
 M 03.business-os/AICompanyManager/assets/js/aicm-production-core.js
?? 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260428_181520_compat_pass_b/
?? 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260429_051353_compat_pass_c_missing_build_exports/
?? 03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/020_status_after.txt
?? 03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/040_git_log.txt
?? 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/
?? 03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/
?? 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/
?? 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/
?? 03.business-os/CasualChatWorker/docs/final/20260426_052059_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_052059_CASUAL_CHAT_WORKER_PHASE_P_CLOSEOUT.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_055128_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_055128_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_211334_CASUAL_CHAT_WORKER_DB_BACKED_PAYLOAD_ACCEPTANCE_GATE.md
?? 03.business-os/CasualChatWorker/docs/final/CASUAL_CHAT_WORKER_IMPLEMENTATION_PREPARED_COMPLETION_MARKER.md
?? 03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
?? 03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
?? 03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_052059_CASUAL_CHAT_WORKER_FINAL_EXPORT_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_055128_CASUAL_CHAT_WORKER_EXPORT_INDEX_FOR_NEXT_CHAT.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_105214_PERSONA_DB_LIVE_ROLLBACK_GATE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_105505_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_110851_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_200008_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_211334_PERSONA_DB_BACKED_PAYLOAD_ACCEPTANCE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_EXPORT_INDEX_FOR_NEXT_CHAT.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_FINAL_EXPORT_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_BACKED_PAYLOAD_ACCEPTANCE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_LIVE_ROLLBACK_GATE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_052059_phase_p_closeout_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_055128_post_closeout_final_quality_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_105214_persona_db_live_rollback_gate_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_110851_persona_db_confirm_rollback_smoke_fix_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_211334_persona_db_backed_payload_acceptance_report.md
?? 03.business-os/CasualChatWorker/docs/verification/20260426_052059_phase_p_closeout_verify.md
?? 03.business-os/CasualChatWorker/docs/verification/20260426_055128_post_closeout_final_quality_gate/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_105214_persona_db_live_rollback_gate/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_110851_persona_db_confirm_rollback_smoke_fix_ambiguous/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_211334_persona_db_backed_payload_acceptance/
?? 03.business-os/RobotRentalStore/
?? 03.business-os/_aiworker/
?? 03.business-os/_businessos/
?? 09.CX22073JW/logs/20260428_074430_robot_role_knowledge_registration/
?? 11.aiworker-os/brain-access-integration/
?? 11.aiworker-os/brain-data-thickening/
?? 11.aiworker-os/robot-capability-profile/
?? 11.aiworker-os/robot-catalog-fix/
?? 11.aiworker-os/robot-list/
?? 11.aiworker-os/runtime-brain-context/
?? 11.aiworker-os/runtime-control-profile/
?? 11.aiworker-os/runtime-execution-app-api/
?? 11.aiworker-os/runtime-execution-complete/
?? 11.aiworker-os/runtime-execution-http-api/
?? 11.aiworker-os/runtime-execution-request/
STATUS_AFTER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/011_git_status_after.txt
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/mock-bridge-adapter.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/civilization-auth/mock-session.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/admin-store.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/auth-mock.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/mock-server/launch-mock.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/os-launch/evaluate-os-entry.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/admin-client.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/auth-client.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/services/portal-api/content-client.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/types/bridge.ts
 M 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/types/portal-admin-api.ts
M  03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/000_GIT_CHECKPOINT_AFTER_V10D5_ARTIFACT_DETAIL_OK_REPORT.md
A  03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/020_status_after.txt
A  03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/040_git_log.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/000_R8Z_V10E_APPROVE_RETURN_ROLLBACK_SMOKE_REPORT.md
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/010_v10e_rollback_smoke.sql
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/020_v10e_rollback_smoke.tsv
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/021_v10e_rollback_smoke.err
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/030_v10e_persist_after_rollback.sql
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/040_v10e_persist_after_rollback.tsv
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/041_v10e_persist_after_rollback.err
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/050_context_after_rollback.json
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/060_core_review_action_scan.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/070_server_review_route_scan.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/000_R8Z_V10F_CHECKPOINT_AND_SECTION_NEW_WORKER_LEAK_ISOLATE_REPORT.md
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/010_git_status_before.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/020_v10f_verify.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/000_R8Z_V10F_REVIEW_CONFIRM_UI_REPORT.md
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/020_static_verify.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/040_served_core.js
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/050_context.json
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/aicm-production-core.before_r8z_v10f.js
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/r8z_v10f_patch.cjs
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/root.html
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/server.pid
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/verify_v10f.cjs
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/000_R8Z_V10F_REVIEW_CONFIRM_UI_REPORT.md
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/020_static_verify.txt
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/040_served_core.js
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/050_context.json
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/aicm-production-core.before_r8z_v10f.js
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/r8z_v10f_patch.cjs
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/root.html
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/server.pid
A  03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/verify_v10f.cjs
M  03.business-os/AICompanyManager/assets/js/aicm-production-core.js
?? 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260428_181520_compat_pass_b/
?? 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260429_051353_compat_pass_c_missing_build_exports/
?? 03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/011_git_status_after.txt
?? 03.business-os/CasualChatWorker/docs/final/20260426_052059_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_052059_CASUAL_CHAT_WORKER_PHASE_P_CLOSEOUT.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_055128_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_055128_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
?? 03.business-os/CasualChatWorker/docs/final/20260426_211334_CASUAL_CHAT_WORKER_DB_BACKED_PAYLOAD_ACCEPTANCE_GATE.md
?? 03.business-os/CasualChatWorker/docs/final/CASUAL_CHAT_WORKER_IMPLEMENTATION_PREPARED_COMPLETION_MARKER.md
?? 03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_ARTIFACT_MANIFEST.md
?? 03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_FINAL_OUTPUT_INDEX.md
?? 03.business-os/CasualChatWorker/docs/final/LATEST_CASUAL_CHAT_WORKER_POST_CLOSEOUT_FINAL_QUALITY_GATE.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_052059_CASUAL_CHAT_WORKER_FINAL_EXPORT_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_055128_CASUAL_CHAT_WORKER_EXPORT_INDEX_FOR_NEXT_CHAT.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_105214_PERSONA_DB_LIVE_ROLLBACK_GATE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_105505_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_110851_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_200008_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/20260426_211334_PERSONA_DB_BACKED_PAYLOAD_ACCEPTANCE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_EXPORT_INDEX_FOR_NEXT_CHAT.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_CASUAL_CHAT_WORKER_FINAL_EXPORT_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_BACKED_PAYLOAD_ACCEPTANCE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONFIRM_ROLLBACK_SMOKE_SEQUENTIAL_FIX_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_CONTRACT_QUOTE_CONFIRM_ROLLBACK_SMOKE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/handoff/LATEST_PERSONA_DB_LIVE_ROLLBACK_GATE_HANDOFF.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_052059_phase_p_closeout_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_055128_post_closeout_final_quality_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_105214_persona_db_live_rollback_gate_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_110851_persona_db_confirm_rollback_smoke_fix_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix_report.md
?? 03.business-os/CasualChatWorker/docs/meta/20260426_211334_persona_db_backed_payload_acceptance_report.md
?? 03.business-os/CasualChatWorker/docs/verification/20260426_052059_phase_p_closeout_verify.md
?? 03.business-os/CasualChatWorker/docs/verification/20260426_055128_post_closeout_final_quality_gate/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_105214_persona_db_live_rollback_gate/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_105505_persona_db_contract_quote_confirm_rollback_smoke/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_110851_persona_db_confirm_rollback_smoke_fix_ambiguous/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_200008_persona_db_confirm_rollback_smoke_sequential_fix/
?? 03.business-os/CasualChatWorker/docs/verification/20260426_211334_persona_db_backed_payload_acceptance/
?? 03.business-os/RobotRentalStore/
?? 03.business-os/_aiworker/
?? 03.business-os/_businessos/
?? 09.CX22073JW/logs/20260428_074430_robot_role_knowledge_registration/
?? 11.aiworker-os/brain-access-integration/
?? 11.aiworker-os/brain-data-thickening/
?? 11.aiworker-os/robot-capability-profile/
?? 11.aiworker-os/robot-catalog-fix/
?? 11.aiworker-os/robot-list/
?? 11.aiworker-os/runtime-brain-context/
?? 11.aiworker-os/runtime-control-profile/
?? 11.aiworker-os/runtime-execution-app-api/
?? 11.aiworker-os/runtime-execution-complete/
?? 11.aiworker-os/runtime-execution-http-api/
?? 11.aiworker-os/runtime-execution-request/
[main 9f4f9b3] checkpoint: AICompanyManager review confirm UI ok 20260503_214414
 35 files changed, 66853 insertions(+)
 create mode 100644 03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/020_status_after.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/git_checkpoint_after_v10d5_artifact_detail_ok_20260503_211228/040_git_log.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/000_R8Z_V10E_APPROVE_RETURN_ROLLBACK_SMOKE_REPORT.md
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/010_v10e_rollback_smoke.sql
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/020_v10e_rollback_smoke.tsv
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/021_v10e_rollback_smoke.err
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/030_v10e_persist_after_rollback.sql
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/040_v10e_persist_after_rollback.tsv
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/041_v10e_persist_after_rollback.err
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/050_context_after_rollback.json
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/060_core_review_action_scan.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/070_server_review_route_scan.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/000_R8Z_V10F_CHECKPOINT_AND_SECTION_NEW_WORKER_LEAK_ISOLATE_REPORT.md
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/010_git_status_before.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/020_v10f_verify.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/000_R8Z_V10F_REVIEW_CONFIRM_UI_REPORT.md
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/020_static_verify.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/040_served_core.js
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/050_context.json
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/aicm-production-core.before_r8z_v10f.js
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/r8z_v10f_patch.cjs
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/root.html
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/server.pid
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_212413/verify_v10f.cjs
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/000_R8Z_V10F_REVIEW_CONFIRM_UI_REPORT.md
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/020_static_verify.txt
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/040_served_core.js
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/050_context.json
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/aicm-production-core.before_r8z_v10f.js
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/r8z_v10f_patch.cjs
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/root.html
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/server.pid
 create mode 100644 03.business-os/AICompanyManager/900.meta/r8z_v10f_review_confirm_ui_20260503_213503/verify_v10f.cjs
To github.com:lsassetmng-art/03.civilization-development.git
   65212c5..9f4f9b3  main -> main
COMMIT_STATUS=COMMITTED
COMMIT_HASH=9f4f9b3
PUSH_RESULT=PUSH_OK

============================================================
4. served core check
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
SERVED_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
PASS: served core matches disk

============================================================
5. section-new / worker placement leak scans
============================================================
SECTION_NEW_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/040_section_new_scan.txt
SECTION_EDIT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/041_section_edit_scan.txt
PLACEMENT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/042_placement_worker_scan.txt
STATE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/043_state_scope_scan.txt
ACTION_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/044_action_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/045_server_section_placement_scan.txt
SECTION_NEW_RENDER_COUNT=16
SECTION_EDIT_RENDER_COUNT=32
WORKER_UI_COUNT=110
SELECTED_SECTION_REF_COUNT=36
STATE_PLACEMENT_REF_COUNT=8
SECTION_NEW_ACTION_COUNT=9
SERVER_PLACEMENT_ROUTE_COUNT=158

============================================================
6. focused snippets for likely leak
============================================================
---- section-new focused ----
2913-    ].join("");
2914-  }
2915-
2916-  function renderCompanyNew() {
2917-    return renderShell([
2918-      '<form data-core-form="company-create" class="aicm-core-card">',
2919-      '  <label>会社名</label>',
2920-      '  <input name="companyName" autocomplete="off" required>',
2921-      '  <label>事業領域</label>',
2922-      '  <textarea name="businessDomain" rows="3"></textarea>',
2923-      '  <button type="submit">AI企業を作成</button>',
2924-      '</form>'
2925-    ].join(""));
2926-  }
2927-
2928-  function renderDepartmentNew() {
2929-    return renderShell([
2930-      '<section class="aicm-core-card">',
2931-      renderCompanySelect(),
2932-      '</section>',
2933-      '<form data-core-form="department-create" class="aicm-core-card">',
2934-      '  <label>部門名</label>',
2935-      '  <input name="departmentName" autocomplete="off" required>',
2936-      '  <label>目的</label>',
2937-      '  <textarea name="purpose" rows="3"></textarea>',
2938-      '  <button type="submit">部門を作成</button>',
2939-      '</form>'
2940-    ].join(""));
2941-  }
2942-
2943:  function renderSectionNew() {
2944-    return renderShell([
2945-      '<section class="aicm-core-card">',
2946-      renderCompanySelect(),
2947-      renderDepartmentSelect(),
2948-      '</section>',
2949-      '<form data-core-form="section-create" class="aicm-core-card">',
2950-      '  <label>課名</label>',
2951-      '  <input name="sectionName" autocomplete="off" required>',
2952-      '  <label>目的</label>',
2953-      '  <textarea name="purpose" rows="3"></textarea>',
2954-      '  <button type="submit">課を作成</button>',
2955-      '</form>'
2956-    ].join(""));
2957-  }
2958-
2959-  function renderPlacementNew() {
2960-    var company = selectedCompany();
2961-    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
2962-    var selectedDept = selectedDepartment();
2963-    var sections = selectedDept ? departmentSections(selectedDept.aicm_user_company_department_id) : [];
2964-    var robots = state.context.robotCatalog;
2965-
2966-    return renderShell([
2967-      '<form data-core-form="placement-create" class="aicm-core-card">',
2968-      renderCompanySelect(),
2969-      renderDepartmentSelect(),
2970-      '  <label>配置先</label>',
2971-      '  <select name="targetLevelCode">',
2972-      '    <option value="company">会社 / President</option>',
2973-      '    <option value="department">部門 / Manager</option>',
2974-      '    <option value="section">課 / Leader / Worker</option>',
2975-      '  </select>',
2976-      '  <label>Role</label>',
2977-      '  <select name="roleCode">',
2978-      '    <option value="President">President</option>',
2979-      '    <option value="Manager">Manager</option>',
2980-      '    <option value="Leader">Leader</option>',
2981-      '    <option value="Worker">Worker</option>',
2982-      '  </select>',
2983-      '  <label>課</label>',
2984-      '  <select name="sectionId">',
2985-      '    <option value="">未選択</option>',
2986-      sections.map(function (section) {
2987-        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
2988-      }).join(""),
2989-      '  </select>',
2990-      '  <label>Robot</label>',
2991-      '  <select name="robotPoolId">',
2992-      robots.map(function (robot) {
2993-        return '<option value="' + escapeHtml(robot.robot_pool_id || "") + '" data-model="' + escapeHtml(robot.aiworker_model_code || "") + '">' + escapeHtml(robot.selector_label || robot.display_name || robot.aiworker_model_code) + '</option>';
2994-      }).join(""),
2995-      '  </select>',
2996-      '  <label>社内通称</label>',
2997-      '  <input name="internalNickname" autocomplete="off">',
2998-      '  <button type="submit">Worker配置を作成</button>',
2999-      '</form>',
3000-      departments.length === 0 ? '<p class="aicm-core-empty">先に部門を作成してください。</p>' : ''
3001-    ].join(""));
3002-  }
3003-
3004-  function renderSettings() {
3005-    var company = selectedCompany();
3006-
3007-    return renderShell([
3008-      '<section class="aicm-core-card">',
3009-      renderCompanySelect(),
3010-      company ? [
3011-        '<p>会社名: ' + escapeHtml(company.company_name) + '</p>',
3012-        '<p>事業領域: ' + escapeHtml(company.business_domain || "") + '</p>',
3013-        '<p class="aicm-core-empty">編集/削除は未設定。作成系の確認後に実装します。</p>'
3014-      ].join("") : '<p class="aicm-core-empty">会社なし</p>',
3015-      '</section>'
3016-    ].join(""));
3017-  }
3018-
3019-  
3020-
3021-function taskLedgerRows(companyId) {
3022-    var rows = [];
3023-
3024-    if (state.context && Array.isArray(state.context.taskLedger)) {
3025-      rows = state.context.taskLedger;
3026-    } else if (state.context && Array.isArray(state.context.task_ledger)) {
3027-      rows = state.context.task_ledger;
3028-    }
3029-
3030-    if (!companyId) return rows;
3031-
3032-    return rows.filter(function (row) {
3033-      return String(row.aicm_user_company_id || "") === String(companyId || "");
3034-    });
3035-  }
3036-
3037-  function sectionsForDepartment(departmentId) {
3038-    return state.context.sections.filter(function (section) {
3039-      return String(section.aicm_user_company_department_id || "") === String(departmentId || "");
3040-    });
3041-  }
3042-
3043-  function firstDepartmentId(company) {
3044-    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
3045-    return departments.length ? departments[0].aicm_user_company_department_id : "";
3046-  }
3047-
3048-  function renderTaskLedgerRows(rows) {
3049-    if (!rows.length) {
3050-      return [
3051-        '<div class="aicm-empty-state">',
3052-        '  <strong>台帳行がまだありません</strong>',
3053-        '  <p>部門を選び、成果物名と作業名を入力して追加してください。</p>',
3054-        '</div>'
3055-      ].join("");
3056-    }
3057-
3058-    return [
3059-      '<div class="aicm-ledger-list">',
3060-      rows.map(function (row) {
3061-        return [
3062-          '<article class="aicm-ledger-row">',
3063-          '  <div class="aicm-ledger-row-head">',
3064-          '    <span class="aicm-node-badge">' + escapeHtml(row.priority_code || "normal") + '</span>',
3065-          '    <strong>' + escapeHtml(row.deliverable_name || "") + '</strong>',
3066-          '    <em>' + escapeHtml(row.task_status_code || "todo") + '</em>',
3067-          '  </div>',
3068-          '  <p>' + escapeHtml(row.task_name || "") + '</p>',
3069-          '  <dl class="aicm-ledger-meta">',
3070-          '    <div><dt>部門</dt><dd>' + escapeHtml(row.department_name || "-") + '</dd></div>',
3071-          '    <div><dt>課</dt><dd>' + escapeHtml(row.section_name || "-") + '</dd></div>',
3072-          '    <div><dt>作業種別</dt><dd>' + escapeHtml(row.work_type_code || "-") + '</dd></div>',
3073-          '    <div><dt>担当</dt><dd>' + escapeHtml(row.responsible_role_code || "-") + '</dd></div>',
3074-          '  </dl>',
3075-          row.note ? '<p class="aicm-ledger-note">' + escapeHtml(row.note) + '</p>' : '',
3076-          '</article>'
3077-        ].join("");
3078-      }).join(""),
3079-      '</div>'
3080-    ].join("");
3081-  }
3082-
3083-  function renderTaskLedgerCreateForm(company, departments) {
3084-    if (!company) {
3085-      return [
3086-        '<div class="aicm-empty-state">',
3087-        '  <strong>AI企業が未選択です</strong>',
3088-        '  <p>ダッシュボードでAI企業を選択してください。</p>',
3089-        '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ</button>',
3090-        '</div>'
3091-      ].join("");
3092-    }
3093-
3094-    if (!departments.length) {
3095-      return [
3096-        '<div class="aicm-empty-state">',
3097-        '  <strong>部門がありません</strong>',
3098-        '  <p>部門別タスク台帳を作るには、先に部門が必要です。</p>',
3099-        '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加へ</button>',
3100-        '</div>'
3101-      ].join("");
3102-    }
3103-
3104-    var firstDepartment = departments[0];
3105-    var sections = sectionsForDepartment(firstDepartment.aicm_user_company_department_id);
3106-
3107-    return [
3108-      '<section class="aicm-core-card">',
3109-      '  <p class="aicm-eyebrow">台帳行追加</p>',
3110-      '  <h2>部門別タスクを追加</h2>',
3111-      '  <div class="aicm-form-grid">',
3112-      '    <label>部門<select id="aicm-ledger-department">',
3113-      departments.map(function (department) {
3114-        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '">' + escapeHtml(department.department_name) + '</option>';
3115-      }).join(""),
3116-      '    </select></label>',
3117-      '    <label>課<select id="aicm-ledger-section">',
3118-      '      <option value="">部門直下</option>',
3119-      sections.map(function (section) {
3120-        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
3121-      }).join(""),
3122-      '    </select></label>',
3123-      '    <label>成果物名<input id="aicm-ledger-deliverable" type="text" placeholder="例: 部門別タスク台帳UI"></label>',
--
8298-  }
8299-
8300-function renderAicmBusinessStartDashboardCard() {
8301-    var company = null;
8302-    if (typeof selectedCompany === "function") company = selectedCompany();
8303-    if (!company && typeof aicmOrgSelectedCompany === "function") company = aicmOrgSelectedCompany();
8304-
8305-    return [
8306-      '<section class="aicm-core-card aicm-operation-card">',
8307-      '  <p class="aicm-eyebrow">AI企業業務開始</p>',
8308-      '  <h2>President起点で業務を開始</h2>',
8309-      company ? '  <p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name || "") + '</strong></p>' : '  <p class="aicm-core-empty">AI企業を選択してください。</p>',
8310-      '  <p class="aicm-selected-note">Presidentが業務を送り、Manager/部長が大項目へ分解し、課長へ引き継ぐ正本ルートです。</p>',
8311-      '  <div class="aicm-dashboard-action-row">',
8312-      '    <button type="button" data-core-action="go" data-screen="ai-business-start">AI企業業務開始</button>',
8313-      '  </div>',
8314-      '</section>'
8315-    ].join("");
8316-  }
8317-
8318-function render() {
8319-    if (!root) return;
8320-
8321-    var html = "";
8322-
8323-    if (state.screen === "company-new") {
8324-      html = renderCompanyNew();
8325-    } else if (state.screen === "department-new") {
8326-      html = renderDepartmentNew();
8327-    } else if (state.screen === "section-new") {
8328:      html = renderSectionNew();
8329-    } else if (state.screen === "placement-new") {
8330-      html = renderPlacementNew();
8331-    } else if (state.screen === "worker-runtime-confirm") {
8332-      // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
8333-      html = renderWorkerRuntimeConfirm();
8334-    } else if (state.screen === "worker-runtime-request") {
8335-      html = renderWorkerRuntimeRequest();
8336-    } else if (state.screen === "settings") {
8337-      html = renderSettings();
8338-    } else if (state.screen === "department-edit") {
8339-      html = renderDepartmentEditPlaceholder();
8340-    } else if (state.screen === "section-edit") {
8341-      html = renderSectionEditPlaceholder();
8342-    } else if (state.screen === "ai-business-start") {
8343-      html = renderAicmBusinessStartScreen();
8344-    } else if (state.screen === "task-ledger") {
8345-      html = renderTaskLedgerPlaceholder();

---- worker/placement renderer focused ----
30-    selectedSectionId: "AICM_V2_SELECTED_SECTION_ID",
31-    contextCache: "AICM_V2_SELECTED_COMPANY_CONTEXT"
32-  };
33-
34-  var DEFAULT_OWNER_CIVILIZATION_ID = "00000000-0000-4000-8000-000000000001";
35-
36-  var API = {
37-    context: "/api/aicm/v2/context",
38-    createCompany: "/api/aicm/v2/company/create",
39-    createDepartment: "/api/aicm/v2/department/create",
40-    createSection: "/api/aicm/v2/section/create",
41-    createPlacement: "/api/aicm/v2/placement/create"
42-  };
43-
44-  var root = null;
45-
46-  var state = {
47-    booted: false,
48-    loading: false,
49-    screen: "dashboard",
50-    errorMessage: "",
51-    noticeMessage: "",
52-    ownerCivilizationId: readStorage(STORAGE.ownerCivilizationId) || DEFAULT_OWNER_CIVILIZATION_ID,
53-    selectedCompanyId: readStorage(STORAGE.selectedCompanyId) || "",
54-    selectedDepartmentId: readStorage(STORAGE.selectedDepartmentId) || "",
55-    selectedSectionId: readStorage(STORAGE.selectedSectionId) || "",
56-    context: {
57-      companies: [],
58-      departments: [],
59-      sections: [],
60:      placements: [],
61-      robotCatalog: []
62-    }
63-  };
64-
65-  function readStorage(key) {
66-    try {
67-      return window.localStorage.getItem(key) || "";
68-    } catch (error) {
69-      return "";
70-    }
71-  }
72-
73-  function writeStorage(key, value) {
74-    try {
75-      if (value === null || value === undefined || value === "") {
76-        window.localStorage.removeItem(key);
77-      } else {
78-        window.localStorage.setItem(key, String(value));
79-      }
80-    } catch (error) {
81-      /* storage unavailable */
82-    }
83-  }
84-
85-  function list(value) {
86-    return Array.isArray(value) ? value : [];
87-  }
88-
89-  function text(value) {
90-    return value === null || value === undefined ? "" : String(value);
91-  }
92-
93-  function escapeHtml(value) {
94-    return text(value)
95-      .replace(/&/g, "&amp;")
96-      .replace(/</g, "&lt;")
97-      .replace(/>/g, "&gt;")
98-      .replace(/"/g, "&quot;")
99-      .replace(/'/g, "&#39;");
100-  }
101-
102-  function publicErrorMessage(error) {
103-    var message = error && error.message ? String(error.message) : String(error || "不明なエラーです。");
104-    message = message.replace(new RegExp("post" + "gres(?:ql)?://" + "[^\\s\'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
105-    if (message.length > 500) {
106-      message = message.slice(0, 500) + "...";
107-    }
108-    return message;
109-  }
110-
111-  function endpointWithOwner() {
112-    return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
113-  }
114-
115-  function requestJson(url, body) {
116-    var options = body ? {
117-      method: "POST",
118-      headers: { "content-type": "application/json" },
119-      body: JSON.stringify(body)
120-    } : {
121-      method: "GET"
122-    };
123-
124-    return window.fetch(url, options)
125-      .then(function (response) {
126-        return response.json().then(function (json) {
127-          if (!response.ok || !json || json.result !== "ok") {
128-            throw new Error(json && json.error_message ? json.error_message : "API error");
129-          }
130-          return json;
131-        });
132-      });
133-  }
134-
135-  
136-function normalizeContext(json) {
137-    json = json || {};
138-    return {
139-      companies: Array.isArray(json.companies) ? json.companies : [],
140-      departments: Array.isArray(json.departments) ? json.departments : [],
141-      sections: Array.isArray(json.sections) ? json.sections : [],
142:      placements: Array.isArray(json.placements) ? json.placements : [],
143-      taskLedger: Array.isArray(json.task_ledger) ? json.task_ledger : [],
144-      robotCatalog: Array.isArray(json.robot_catalog) ? json.robot_catalog : []
145-    };
146-  }
147-
148-  function getCompany(companyId) {
149-    return state.context.companies.find(function (company) {
150-      return company.aicm_user_company_id === companyId;
151-    }) || null;
152-  }
153-
154-  function getDepartment(departmentId) {
155-    return state.context.departments.find(function (department) {
156-      return department.aicm_user_company_department_id === departmentId;
157-    }) || null;
158-  }
159-
160-  function getSection(sectionId) {
161-    return state.context.sections.find(function (section) {
162-      return section.aicm_user_company_section_id === sectionId;
163-    }) || null;
164-  }
165-
166-  function companyDepartments(companyId) {
167-    return state.context.departments.filter(function (department) {
168-      return department.aicm_user_company_id === companyId;
169-    });
170-  }
171-
172-  function departmentSections(departmentId) {
173-    return state.context.sections.filter(function (section) {
174-      return section.aicm_user_company_department_id === departmentId;
175-    });
176-  }
177-
178-  function companyPlacements(companyId) {
179:    return state.context.placements.filter(function (placement) {
180-      return placement.aicm_user_company_id === companyId;
181-    });
182-  }
183-
184-  function selectedCompany() {
185-    return getCompany(state.selectedCompanyId);
186-  }
187-
188-  function selectedDepartment() {
189-    return getDepartment(state.selectedDepartmentId);
190-  }
191-
192-  function selectedSection() {
193-    return getSection(state.selectedSectionId);
194-  }
195-
196-  function hasCompany(companyId) {
197-    return !!getCompany(companyId);
198-  }
199-
200-  function hasDepartment(departmentId) {
201-    return !!getDepartment(departmentId);
202-  }
203-
204-  function setSelectedCompany(companyId) {
205-    if (hasCompany(companyId)) {
206-      state.selectedCompanyId = companyId;
207-      writeStorage(STORAGE.selectedCompanyId, companyId);
208-
209-      var departments = companyDepartments(companyId);
210-      if (!hasDepartment(state.selectedDepartmentId)) {
211-        state.selectedDepartmentId = departments[0] ? departments[0].aicm_user_company_department_id : "";
212-        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
213-      }
214-    } else {
215-      state.selectedCompanyId = "";
216-      state.selectedDepartmentId = "";
217-      state.selectedSectionId = "";
218-      writeStorage(STORAGE.selectedCompanyId, "");
219-      writeStorage(STORAGE.selectedDepartmentId, "");
220-      writeStorage(STORAGE.selectedSectionId, "");
221-    }
222-  }
223-
224-  function setSelectedDepartment(departmentId) {
225-    if (hasDepartment(departmentId)) {
226-      state.selectedDepartmentId = departmentId;
227-      writeStorage(STORAGE.selectedDepartmentId, departmentId);
228-
229-      var sections = departmentSections(departmentId);
230-      if (!getSection(state.selectedSectionId)) {
231-        state.selectedSectionId = sections[0] ? sections[0].aicm_user_company_section_id : "";
232-        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
233-      }
234-    } else {
235-      state.selectedDepartmentId = "";
236-      state.selectedSectionId = "";
237-      writeStorage(STORAGE.selectedDepartmentId, "");
238-      writeStorage(STORAGE.selectedSectionId, "");
239-    }
240-  }
241-
242-  function syncSelectionAfterContextLoad() {
243-    if (hasCompany(state.selectedCompanyId)) {
244-      setSelectedCompany(state.selectedCompanyId);
245-      return;
246-    }
247-
248-    if (state.context.companies[0]) {
249-      setSelectedCompany(state.context.companies[0].aicm_user_company_id);
250-      return;
251-    }
252-
253-    setSelectedCompany("");
254-  }
255-
256-  function loadContext() {
257-    state.loading = true;
258-    state.errorMessage = "";
259-    render();
260-
261-    return requestJson(endpointWithOwner())
262-      .then(function (json) {
263-        state.context = normalizeContext(json);
264-    // AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_CALL
265-    if (typeof aicmHydrateManagerMajorContextArraysR8M === "function") {
266-      aicmHydrateManagerMajorContextArraysR8M(
267-        typeof json !== "undefined" ? json :
268-        (typeof data !== "undefined" ? data :
269-        (typeof contextJson !== "undefined" ? contextJson :
270-        (typeof ctx !== "undefined" ? ctx : null)))
271-      );
272-    }
273-        writeStorage(STORAGE.contextCache, JSON.stringify(state.context));
274-        syncSelectionAfterContextLoad();
275-        state.loading = false;
276-        state.booted = true;
277-        render();
278-      })
279-      .catch(function (error) {
280-        state.loading = false;
281-        state.errorMessage = publicErrorMessage(error);
282-        render();
283-      });
284-  }
285-
286-
287-// AICM_R8Z_F_CANONICAL_CONTEXT_NORMALIZE_START
288-  function aicmR8ZFArrayFromContext(rawContext, targetContext, names) {
289-    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
290-    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
291-    var current = state && state.context && typeof state.context === "object" ? state.context : {};
292-
293-    for (var i = 0; i < names.length; i += 1) {
294-      var key = names[i];
295-
296-      if (Array.isArray(raw[key])) return raw[key];
297-      if (Array.isArray(target[key])) return target[key];
298-      if (Array.isArray(current[key])) return current[key];
299-      if (Array.isArray(state && state[key])) return state[key];
300-    }
301-
302-    return [];
303-  }
304-
305-  function aicmNormalizePmlwContextR8ZF(rawContext, targetContext) {
306-    var raw = rawContext && typeof rawContext === "object" ? rawContext : {};
307-    var target = targetContext && typeof targetContext === "object" ? targetContext : {};
308-
309-    if (!target || typeof target !== "object") {
310-      target = {};
311-    }
312-
313-    var middleItems = aicmR8ZFArrayFromContext(raw, target, [
314-      "pmlw_middle_items",
315-      "pmlwMiddleItems",
316-      "leader_middle_items",
317-      "leaderMiddleItems"
318-    ]);
319-
320-    var deliverableRequirements = aicmR8ZFArrayFromContext(raw, target, [
321-      "pmlw_deliverable_requirements",
322-      "pmlwDeliverableRequirements",
323-      "deliverable_requirements",
324-      "deliverableRequirements"
325-    ]);
326-
327-    var workerWorkUnits = aicmR8ZFArrayFromContext(raw, target, [
328-      "pmlw_worker_work_units",
329-      "pmlwWorkerWorkUnits",
330-      "worker_work_units",
331-      "workerWorkUnits"
332-    ]);
333-
334-    var workflowTree = aicmR8ZFArrayFromContext(raw, target, [
335-      "pmlw_workflow_tree",
336-      "pmlwWorkflowTree",
337-      "workflow_tree",
338-      "workflowTree"
339-    ]);
340-
341-    target.pmlw_middle_items = middleItems;
342-    target.pmlwMiddleItems = middleItems;
343-
344-    target.pmlw_deliverable_requirements = deliverableRequirements;
345-    target.pmlwDeliverableRequirements = deliverableRequirements;
346-
347-    target.pmlw_worker_work_units = workerWorkUnits;
348-    target.pmlwWorkerWorkUnits = workerWorkUnits;
349-
350-    target.pmlw_workflow_tree = workflowTree;
351-    target.pmlwWorkflowTree = workflowTree;
352-
353-    if (state) {
354-      state.context = target;
355-
356-      state.pmlw_middle_items = middleItems;
357-      state.pmlwMiddleItems = middleItems;
358-
359-      state.pmlw_deliverable_requirements = deliverableRequirements;
360-      state.pmlwDeliverableRequirements = deliverableRequirements;
361-
362-      state.pmlw_worker_work_units = workerWorkUnits;
363-      state.pmlwWorkerWorkUnits = workerWorkUnits;
364-
365-      state.pmlw_workflow_tree = workflowTree;
366-      state.pmlwWorkflowTree = workflowTree;
367-    }
368-
369-    return target;
370-  }
371-
372-  if (typeof normalizeContext === "function" && !normalizeContext.__aicmR8ZF) {
373-    var aicmNormalizeContextBeforeR8ZF = normalizeContext;
374-
375-    normalizeContext = function normalizeContext(rawContext) {
376-      var normalizedContext = aicmNormalizeContextBeforeR8ZF.apply(this, arguments);
377-      return aicmNormalizePmlwContextR8ZF(rawContext, normalizedContext);
378-    };
379-
380-    normalizeContext.__aicmR8ZF = true;
381-  }
382-
383-  if (typeof loadContext === "function" && !loadContext.__aicmR8ZF) {
384-    var aicmLoadContextBeforeR8ZF = loadContext;
385-
386-    loadContext = async function loadContext() {
387-      var result = await aicmLoadContextBeforeR8ZF.apply(this, arguments);
388-
389-      if (state && state.context) {

---- render route focused ----
517-
518-    state.__taskLedgerContextRefreshing = true;
519-
520-    Promise.resolve()
521-      .then(function () {
522-        return loadContext();
523-      })
524-      .catch(function (error) {
525-        state.errorMessage = error && error.message ? error.message : "部門別タスク台帳の最新情報取得に失敗しました。";
526-      })
527-      .then(function () {
528-        state.__taskLedgerContextRefreshing = false;
529-        state.screen = "task-ledger";
530-        render();
531-      });
532-  }
533-
534-  function pageTitle() {
535-    if (state.screen === "company-new") return "AI企業新規追加";
536-    if (state.screen === "department-new") return "部門新規追加";
537:    if (state.screen === "section-new") return "課新規追加";
538-    if (state.screen === "placement-new") return "Worker配置";
539-    if (state.screen === "settings") return "AI企業設定";
540-    return "AI企業ダッシュボード";
541-  }
542-
543-  
544-// AICM_WORKER_RUNTIME_UI_NAV_AXT_R1_V1
545-function renderShell(content) {
546-    return [
547-      '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
548-      '  <header class="aicm-core-header">',
549-      '    <h1>AI企業運営アプリ</h1>',
550-      '  </header>',
551-      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
552-      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
553-      '    <button type="button" data-core-action="task-ledger-open">部門別タスク台帳</button>',
554-      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
555-      '  <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
556-      '  </nav>',
557-      renderMessages(),
558-      '  <main class="aicm-core-main">',
559-      content,
560-      '  </main>',
561-      '</div>'
562-    ].join("");
563-  }
564-
565-  function renderMessages() {
566-    var parts = [];
567-
568-    if (state.loading) {
569-      parts.push('<div class="aicm-core-message">読込中...</div>');
570-    }
571-
572-    if (state.noticeMessage) {
573-      parts.push('<div class="aicm-core-message aicm-core-message-ok">' + escapeHtml(state.noticeMessage) + '</div>');
574-    }
575-
576-    if (state.errorMessage) {
577-      parts.push('<div class="aicm-core-message aicm-core-message-error">' + escapeHtml(state.errorMessage) + '</div>');
--
1203-
1204-  var leader = aicmAxcSelectedRobotMeta("aicm-section-leader-robot");
1205-  var leaderRow = aicmAxcBuildRolePlacement({
1206-    role_code: "Leader",
1207-    target_level_code: "section",
1208-    target_id: section.aicm_user_company_section_id,
1209-    aicm_user_company_department_id: section.aicm_user_company_department_id,
1210-    aicm_user_company_section_id: section.aicm_user_company_section_id,
1211-    robot_pool_id: leader ? leader.robot_pool_id : "",
1212-    aiworker_model_code: leader ? leader.aiworker_model_code : "",
1213-    internal_nickname: aicmAxcInputValue("aicm-section-leader-robot-nickname")
1214-  });
1215-  if (leaderRow) rows.push(leaderRow);
1216-
1217-  var index = 0;
1218-  while (index < 30) {
1219-    var robotEl = aicmAxcFindElement([
1220-      "aicm-inline-worker-" + String(index) + "-robot",
1221-      "aicm-role-worker-robot-" + String(index),
1222-      "aicm-role-worker-section-robot-" + String(index),
1223:      "aicm-role-worker-section-new-robot-" + String(index)
1224-    ]);
1225-
1226-    var nickEl = aicmAxcFindElement([
1227-      "aicm-inline-worker-" + String(index) + "-nickname",
1228-      "aicm-role-worker-nickname-" + String(index),
1229-      "aicm-role-worker-section-nickname-" + String(index),
1230:      "aicm-role-worker-section-new-nickname-" + String(index)
1231-    ]);
1232-
1233-    if (!robotEl && !nickEl) break;
1234-
1235-    var worker = aicmAxcSelectedRobotMeta(robotEl);
1236-    var workerRow = aicmAxcBuildRolePlacement({
1237-      role_code: "Worker",
1238-      target_level_code: "section",
1239-      target_id: section.aicm_user_company_section_id,
1240-      aicm_user_company_department_id: section.aicm_user_company_department_id,
1241-      aicm_user_company_section_id: section.aicm_user_company_section_id,
1242-      robot_pool_id: worker ? worker.robot_pool_id : "",
1243-      aiworker_model_code: worker ? worker.aiworker_model_code : "",
1244-      internal_nickname: nickEl ? String(nickEl.value || "").trim() : ""
1245-    });
1246-    if (workerRow) rows.push(workerRow);
1247-
1248-    index += 1;
1249-  }
1250-
1251-  return rows;
1252-}
1253-
1254-async function aicmAxcSyncRolePlacementsForPayload(payload) {
1255-  // AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1
1256-  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];
1257-
1258-  if (!rows.length) {
1259-    return { result: "ok", skipped: true };
1260-  }
1261-
1262-  var body = payload.body || {};
1263-  var companyId = body.aicm_user_company_id || "";
1264-
1265-  if (!companyId && state && state.selectedCompanyId) {
1266-    companyId = state.selectedCompanyId;
1267-  }
1268-
1269-  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
1270-    // AICM_ROLE_SYNC_OWNER_RESOLVER_AXK_V1
--
2311-      "aicm-department-manager-robot-nickname",
2312-
2313-      "aicm-section-edit-id",
2314-      "aicm-section-edit-company-id",
2315-      "aicm-section-edit-department-id",
2316-      "aicm-section-edit-name",
2317-      "aicm-section-edit-purpose",
2318-      "aicm-section-edit-status",
2319-      "aicm-section-leader-robot",
2320-      "aicm-section-leader-robot-nickname"
2321-    ].forEach(aicmAxoCaptureField);
2322-
2323-    var workers = [];
2324-    var index = 0;
2325-
2326-    while (index < 60) {
2327-      var robotIds = [
2328-        "aicm-inline-worker-" + String(index) + "-robot",
2329-        "aicm-role-worker-robot-" + String(index),
2330-        "aicm-role-worker-section-robot-" + String(index),
2331:        "aicm-role-worker-section-new-robot-" + String(index)
2332-      ];
2333-
2334-      var nicknameIds = [
2335-        "aicm-inline-worker-" + String(index) + "-nickname",
2336-        "aicm-role-worker-nickname-" + String(index),
2337-        "aicm-role-worker-section-nickname-" + String(index),
2338:        "aicm-role-worker-section-new-nickname-" + String(index)
2339-      ];
2340-
2341-      var robotEl = null;
2342-      var nicknameEl = null;
2343-
2344-      for (var r = 0; r < robotIds.length; r += 1) {
2345-        robotEl = document.getElementById(robotIds[r]);
2346-        if (robotEl) break;
2347-      }
2348-
2349-      for (var n = 0; n < nicknameIds.length; n += 1) {
2350-        nicknameEl = document.getElementById(nicknameIds[n]);
2351-        if (nicknameEl) break;
2352-      }
2353-
2354-      if (!robotEl && !nicknameEl) break;
2355-
2356-      workers.push({
2357-        robot_pool_id: robotEl ? String(robotEl.value || "") : "",
2358-        internal_nickname: nicknameEl ? String(nicknameEl.value || "") : ""
2359-      });

============================================================
7. classification
============================================================
FINAL_JUDGEMENT=SECTION_NEW_WORKER_LEAK_LIKELY_STATE_SCOPE
COMMIT_STATUS=COMMITTED
COMMIT_HASH=9f4f9b3
PUSH_RESULT=PUSH_OK
ROOT_HTTP=200
SERVED_HTTP=200
SECTION_NEW_RENDER_COUNT=16
SECTION_EDIT_RENDER_COUNT=32
WORKER_UI_COUNT=110
SELECTED_SECTION_REF_COUNT=36
STATE_PLACEMENT_REF_COUNT=8
SECTION_NEW_ACTION_COUNT=9
SERVER_PLACEMENT_ROUTE_COUNT=158
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/000_R8Z_V10F_CHECKPOINT_AND_SECTION_NEW_WORKER_LEAK_ISOLATE_REPORT.md
SECTION_NEW_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/040_section_new_scan.txt
PLACEMENT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/042_placement_worker_scan.txt
STATE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f_checkpoint_and_section_new_worker_leak_isolate_20260503_214414/043_state_scope_scan.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT_PATCH_POLICY:
- 新規課画面では既存section placementを絶対に表示しない。
- section-new entering時に以下を初期化する:
  - selectedSectionId / editingSectionId / sectionPlacementDraft / worker rows draft
- renderSectionNew 内では既存DB placement rowsを読まない。
- 新規課保存前の従業員設定は local draft only。
- 保存後に初めて section_id と紐づけて配置保存へ進む。
