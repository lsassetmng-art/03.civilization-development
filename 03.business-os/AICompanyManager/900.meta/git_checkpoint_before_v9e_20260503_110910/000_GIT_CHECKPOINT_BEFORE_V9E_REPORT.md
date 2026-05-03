============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳 isPendingMajor scope callsite は復旧済み
- レビュー待ちは未解決
- 次は review-list 専用局所再描画 V9E の前段

今回:
1. git root確認
2. status確認
3. AICompanyManager配下の変更だけ確認
4. 秘密情報らしき直書きがないか軽く確認
5. commit
6. remoteがあれば push

禁止:
- DB write
- API POST
- patch

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/git_checkpoint_before_v9e_20260503_110910
DB_WRITE=NO
API_POST=NO
PATCH=NO
GIT_ROOT=/data/data/com.termux/files/home/03.civilization-development
APP_REL=03.business-os/AICompanyManager

============================================================
2. git status before
============================================================
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
 M 03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js
 M 03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js
 M 03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js
 M 03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js
 M 03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js
 M 03.business-os/AICompanyManager/index.html
 M 03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
?? 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260428_181520_compat_pass_b/
?? 01.civilization-os/08.civilization-portal-site/civilization-portal-site-web/.backup/20260429_051353_compat_pass_c_missing_build_exports/
?? 03.business-os/AICompanyManager/900.meta/
?? 03.business-os/AICompanyManager/aicm-local-company-source-debug.html
?? 03.business-os/AICompanyManager/assets/js/aicm-ai-company-settings-route-selected-company-hydrator.js
?? 03.business-os/AICompanyManager/assets/js/aicm-authoritative-selected-company-panel.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-api-config-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-auth-token-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-reference-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js
?? 03.business-os/AICompanyManager/assets/js/aicm-company-legacy-dom-compatibility.js
?? 03.business-os/AICompanyManager/assets/js/aicm-company-organization-read-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-company-settings-unified-safe-controller.js
?? 03.business-os/AICompanyManager/assets/js/aicm-dashboard-company-select-load-all-orgs.js
?? 03.business-os/AICompanyManager/assets/js/aicm-dashboard-selected-company-context.js
?? 03.business-os/AICompanyManager/assets/js/aicm-exact-ai-company-selection-sync.js
?? 03.business-os/AICompanyManager/assets/js/aicm-production-core.js
?? 03.business-os/AICompanyManager/assets/js/aicm-selected-company-organization-context-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-selected-company-visible-consistency-fix.js
?? 03.business-os/AICompanyManager/assets/js/aicm-white-screen-visible-rescue.js
?? 03.business-os/AICompanyManager/docs/090_AICM_BUSINESS_AIWORKER_BRIDGE_CANON.md
?? 03.business-os/AICompanyManager/docs/091_AICM_BUSINESS_AIWORKER_ROUTE_INTEGRATION_CANON.md
?? 03.business-os/AICompanyManager/docs/092_AICM_BUSINESS_AIWORKER_SCREEN_FILTER_CANON.md
?? 03.business-os/AICompanyManager/docs/093_AICM_BUSINESS_AIWORKER_SAVE_RELOAD_BRIDGE_CANON.md
?? 03.business-os/AICompanyManager/docs/094_AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_CANON.md
?? 03.business-os/AICompanyManager/docs/096_AICM_BUSINESS_AIWORKER_SAVE_DOUBLE_SUBMIT_GUARD_CANON.md
?? 03.business-os/AICompanyManager/docs/097_AICM_BUSINESS_AIWORKER_AUTH_TOKEN_CLIENT_CANON.md
?? 03.business-os/AICompanyManager/docs/098_AICM_BUSINESS_AIWORKER_API_CONFIG_CLIENT_CANON.md
?? 03.business-os/AICompanyManager/docs/099_AICM_BUSINESS_AIWORKER_WRITE_ENDPOINT_COMPAT_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/100_AICM_BUSINESS_AIWORKER_WRITE_ENDPOINT_COMPAT_REVIEW_V2_CANON.md
?? 03.business-os/AICompanyManager/docs/101_AICM_BUSINESS_AIWORKER_API_PLACE_ENDPOINT_REPAIR_CANON.md
?? 03.business-os/AICompanyManager/docs/102_AICM_BUSINESS_AIWORKER_API_PLACE_ENDPOINT_REPAIR_V2_CANON.md
?? 03.business-os/AICompanyManager/docs/103_AICM_BUSINESS_AIWORKER_API_PLACE_ENDPOINT_REPAIR_V3_CANON.md
?? 03.business-os/AICompanyManager/docs/104_AICM_ROBOT_ROLE_PERSONALITY_CX_REFERENCE_CANON.md
?? 03.business-os/AICompanyManager/docs/105_AICM_ROBOT_PUBLIC_PROFILE_REFERENCE_CANON.md
?? 03.business-os/AICompanyManager/docs/106_AICM_BUSINESS_AIWORKER_CX_REFERENCE_CLIENT_CANON.md
?? 03.business-os/AICompanyManager/docs/108_AICM_FULL_WRITE_ENDPOINT_COMPAT_RERUN_CANON.md
?? 03.business-os/AICompanyManager/docs/109_AICM_COMBINED_API_ROLLBACK_SMOKE_ENDPOINT_CANON.md
?? 03.business-os/AICompanyManager/docs/110_AICM_BUSINESS_AIWORKER_PRODUCTION_POLICY_RLS_PREP_CANON.md
?? 03.business-os/AICompanyManager/docs/111_AICM_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/112_AICM_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_CANON.md
?? 03.business-os/AICompanyManager/docs/113_AICM_BUSINESS_AIWORKER_RLS_PHASE1_CLOSEOUT_VERIFY_CANON.md
?? 03.business-os/AICompanyManager/docs/114_AICM_BUSINESS_AIWORKER_RLS_PHASE2_AUTH_AUDIT_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/115_AICM_BUSINESS_AIWORKER_RLS_PHASE2_STRATEGY_A_APPLY_CANON.md
?? 03.business-os/AICompanyManager/docs/116_AICM_BUSINESS_AIWORKER_RLS_PHASE2_CLOSEOUT_VERIFY_CANON.md
?? 03.business-os/AICompanyManager/docs/117_AICM_BUSINESS_AIWORKER_RLS_PHASE2_FUNCTION_DEFINER_REPAIR_CANON.md
?? 03.business-os/AICompanyManager/docs/118_AICM_BUSINESS_AIWORKER_CONNECTION_FINAL_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/119_AICM_COMPANY_IDENTITY_ENTITLEMENT_PLACEMENT_RLS_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/120_AICM_COMPANY_CONTEXT_FOUNDATION_CANON.md
?? 03.business-os/AICompanyManager/docs/121_AICM_COMBINED_CONTEXT_REPAIR_CANON.md
?? 03.business-os/AICompanyManager/docs/122_AICM_COMPANY_CONTEXT_FOUNDATION_CLOSEOUT_CANON.md
?? 03.business-os/AICompanyManager/docs/123_AICM_COMPANY_CONTEXT_ENFORCEMENT_WRAPPER_CANON.md
?? 03.business-os/AICompanyManager/docs/124_AICM_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_CANON.md
?? 03.business-os/AICompanyManager/docs/125_AICM_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_CLOSEOUT_V2_CANON.md
?? 03.business-os/AICompanyManager/docs/126_AICM_ENTITLEMENT_PLACEMENT_COMPANY_SCOPED_RLS_CANON.md
?? 03.business-os/AICompanyManager/docs/127_AICM_BUSINESS_AIWORKER_COMPANY_SCOPED_RLS_FINAL_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/128_AICM_BUSINESS_AIWORKER_ROLE_KNOWLEDGE_BOUNDARY_COMBAT_SEPARATION.md
?? 03.business-os/AICompanyManager/docs/129_AICM_BUSINESS_AIWORKER_FINAL_INTEGRATED_DESIGN.md
?? 03.business-os/AICompanyManager/docs/130_AICM_ROBOT_CATALOG_BASELINE_REFERENCE_ADDENDUM.md
?? 03.business-os/AICompanyManager/docs/131_AICM_ROBOT_POOL_BASELINE_INVENTORY_CANON.md
?? 03.business-os/AICompanyManager/docs/132_AICM_ROBOT_CATALOG_ROLE_CX_BOUNDARY_FINAL_CLOSEOUT.md
?? 03.business-os/AICompanyManager/docs/handoff/AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_HANDOFF_20260428_170910.md
?? 03.business-os/AICompanyManager/docs/handoff/AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_RECOVERY_HANDOFF_20260428_171200.md
?? 03.business-os/AICompanyManager/docs/handoff/AICompanyManager_ROBOT_REFERENCE_SAFE_DOM_WIRE_HANDOFF_20260428_171451.md
?? 03.business-os/AICompanyManager/docs/handoff/LATEST_AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/handoff/LATEST_AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_RECOVERY_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/handoff/LATEST_AICompanyManager_ROBOT_REFERENCE_SAFE_DOM_WIRE_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/verification/20260427_140136_phase_nd_ng_l_live_aiworkeros_call_localhost/
?? 03.business-os/AICompanyManager/docs/verification/20260427_140505_phase_nh_nk_live_aiworkeros_localhost_auth_retry/
?? 03.business-os/AICompanyManager/docs/verification/20260427_140706_phase_nm_np_live_aiworkeros_phase_fix_retry/
?? 03.business-os/AICompanyManager/docs/verification/20260427_140800_phase_nq_nt_live_aiworkeros_idempotency_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_143100_phase_pc_pf_first_real_use_absolute_runtime/
?? 03.business-os/AICompanyManager/docs/verification/20260427_150256_phase_sc_sf_real_api_jwt_backend_integration_smoke/
?? 03.business-os/AICompanyManager/docs/verification/20260427_150953_phase_ss_sv_post_release_ui_login_smoke/
?? 03.business-os/AICompanyManager/docs/verification/20260427_154948_phase_ts_actual_ui_source_structure_inventory/
?? 03.business-os/AICompanyManager/docs/verification/20260427_155601_phase_ts2_direct_edit_target_snippet_diagnostic/
?? 03.business-os/AICompanyManager/docs/verification/20260427_205233_aicm_business_aiworker_bridge/
?? 03.business-os/AICompanyManager/docs/verification/20260427_205605_aicm_business_aiworker_save_route/
?? 03.business-os/AICompanyManager/docs/verification/20260427_205902_aicm_business_aiworker_save_route_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_210058_aicm_business_aiworker_place_dryrun_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_210227_aicm_business_aiworker_dryrun_json_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_210858_aicm_business_aiworker_placement_management/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211024_aicm_business_aiworker_placement_management_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211203_aicm_business_aiworker_route_integration/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211730_aicm_business_aiworker_screen_filter/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211846_aicm_business_aiworker_save_reload/
?? 03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/
?? 03.business-os/AICompanyManager/docs/verification/20260427_212156_aicm_business_aiworker_duplicate_guard_verify_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_213433_business_aiworker_role_slot_columns_only/
?? 03.business-os/AICompanyManager/docs/verification/20260427_214015_business_aiworker_role_catalog_only/
?? 03.business-os/AICompanyManager/docs/verification/20260427_214117_business_aiworker_current_robots_by_series/
?? 03.business-os/AICompanyManager/docs/verification/20260427_220941_business_aiworker_role_catalog_add_lover_battler/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221142_business_aiworker_add_missing_robot_pool/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221345_business_aiworker_assign_role_slots/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221510_business_aiworker_selector_role_slots/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221723_business_aiworker_selector_role_slots_robust_verify/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221907_business_aiworker_role_slot_selector_self_heal/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222021_aicm_president_default_model_hd_r5p/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222241_aicm_business_aiworker_save_double_submit_guard/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222403_aicm_business_aiworker_save_double_submit_guard/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222655_aicm_business_aiworker_auth_audit_foundation/
?? 03.business-os/AICompanyManager/docs/verification/20260427_223035_aicm_business_aiworker_auth_audit_api_v3_bundle/
?? 03.business-os/AICompanyManager/docs/verification/20260427_223410_aicm_business_aiworker_auth_audit_foundation_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_042455_aicm_business_aiworker_auth_audit_foundation_repair_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_042731_aicm_business_aiworker_api_v3_skip_db_foundation/
?? 03.business-os/AICompanyManager/docs/verification/20260428_042939_aicm_business_aiworker_api_v3_smoke_crud_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043107_aicm_business_aiworker_api_v3_readonly_smoke_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043421_aicm_business_aiworker_write_endpoint_compat_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043613_aicm_business_aiworker_write_endpoint_compat_review_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043855_aicm_business_aiworker_api_place_endpoint_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_044051_aicm_business_aiworker_api_place_endpoint_repair_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_044743_aicm_business_aiworker_api_place_endpoint_repair_v3/
?? 03.business-os/AICompanyManager/docs/verification/20260428_045447_robot_role_personality_cx_reference/
?? 03.business-os/AICompanyManager/docs/verification/20260428_045848_robot_public_profile_lovers_megami_cx_reference/
?? 03.business-os/AICompanyManager/docs/verification/20260428_050207_aicm_cx_reference_api_client/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051026_aicm_full_write_endpoint_compat_rerun/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051249_aicm_combined_api_rollback_smoke_endpoint/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051419_aicm_business_aiworker_production_policy_rls_prep/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051545_aicm_business_aiworker_production_policy_rls_prep_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051646_aicm_business_aiworker_rls_reference_inventory_v3/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051800_aicm_business_aiworker_rls_reference_inventory_v4/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051927_aicm_business_aiworker_rls_phase1_apply_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052255_aicm_business_aiworker_rls_phase1_closeout_verify/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052423_aicm_business_aiworker_rls_phase2_auth_audit_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052546_aicm_business_aiworker_rls_phase2_strategy_a_apply/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052713_aicm_business_aiworker_rls_phase2_closeout_verify/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053039_aicm_business_aiworker_final_handoff_package/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053812_aicm_combined_context_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054043_aicm_company_context_foundation_closeout/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054254_aicm_company_context_enforcement_wrapper/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054643_aicm_individual_api_ctx_wrapper_switch_closeout_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/
?? 03.business-os/AICompanyManager/docs/verification/20260428_055720_aicm_final_company_scoped_rls_closeout/
?? 03.business-os/AICompanyManager/docs/verification/20260428_060938_aicm_combat_role_separation/
?? 03.business-os/AICompanyManager/docs/verification/20260428_061128_aicm_combat_role_separation_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_061322_aicm_combat_role_separation_v3/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064022_robot_catalog_baseline_design_addendum/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064220_aicm_final_integrated_design_docs/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064253_robot_pool_baseline_inventory/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064502_robot_catalog_role_cx_boundary_final_closeout/
?? 03.business-os/AICompanyManager/docs/verification/20260429_054729_manager_payload_robot_role_guard_v12/
?? 03.business-os/AICompanyManager/docs/worker-runtime/
?? 03.business-os/AICompanyManager/ops/
?? 03.business-os/AICompanyManager/server/aicm-clean-v2-api-server.candidate.mjs
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_api_config_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_auth_token_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_bridge.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_duplicate_guard.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_placement_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_reference_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_route_integration.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_save_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_save_double_submit_guard.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_save_reload_bridge.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_screen_filter.js
?? 03.business-os/AICompanyManager/tests/phase_kn_kq_ledger_persistent_write_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_kr_ku_ledger_persistent_write_repair_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_kv_ky_ledger_constraint_guided_repair_check.sh
?? 03.business-os/AICompanyManager/tests/phase_li_ll_review_action_persistent_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_lz_mc_csv_import_persistent_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_md_mg_csv_import_uuid_repair_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_mi_ml_csv_import_temp_collision_repair_check.sh
?? 03.business-os/AICompanyManager/tests/phase_nd_ng_l_live_aiworkeros_localhost_call_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_nh_nk_live_aiworkeros_localhost_auth_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_nm_np_live_aiworkeros_phase_fix_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_ny_oc_rls_apply_check.sh
?? 03.business-os/AICompanyManager/tests/phase_ol_oo_first_real_use_live_aiworkeros_check.sh
?? 03.business-os/AICompanyManager/tests/phase_ox_pa_first_real_use_actual_node_server_check.sh
?? 03.business-os/AICompanyManager/tests/phase_pt_pw_strict_tenant_rls_shadow_apply_check.sh
?? 03.business-os/AICompanyManager/tests/phase_qj_qm_api_jwt_claim_integration_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_uz_vc_recovery_robot_reference_actual_ui_wire_check.sh
?? 03.business-os/AICompanyManager/tests/phase_uz_vc_robot_reference_actual_ui_wire_check.sh
?? 03.business-os/AICompanyManager/tests/phase_vd_vg_robot_reference_safe_dom_wire_check.sh
?? 03.business-os/AICompanyManager/tests/phase_zzp_zzs_worker_persisted_ui_reload_verify_check.sh
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
BRANCH=main

============================================================
3. AICompanyManager changed files
============================================================
 M 03.business-os/AICompanyManager/assets/js/aicm-businessos-db-company-binding.js
 M 03.business-os/AICompanyManager/assets/js/aicm-businessos-db-robot-pool-wire.js
 M 03.business-os/AICompanyManager/assets/js/aicm-company-persistent-save-client.js
 M 03.business-os/AICompanyManager/assets/js/aicm-robot-placement-payload-preview.js
 M 03.business-os/AICompanyManager/assets/js/phase-de-dh-workflow-final-local-ui.js
 M 03.business-os/AICompanyManager/index.html
 M 03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
?? 03.business-os/AICompanyManager/900.meta/
?? 03.business-os/AICompanyManager/aicm-local-company-source-debug.html
?? 03.business-os/AICompanyManager/assets/js/aicm-ai-company-settings-route-selected-company-hydrator.js
?? 03.business-os/AICompanyManager/assets/js/aicm-authoritative-selected-company-panel.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-api-config-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-auth-token-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-duplicate-guard.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-placement-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-reference-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-route-integration.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-client.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-double-submit-guard.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-save-reload-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-business-aiworker-screen-filter.js
?? 03.business-os/AICompanyManager/assets/js/aicm-company-legacy-dom-compatibility.js
?? 03.business-os/AICompanyManager/assets/js/aicm-company-organization-read-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-company-settings-unified-safe-controller.js
?? 03.business-os/AICompanyManager/assets/js/aicm-dashboard-company-select-load-all-orgs.js
?? 03.business-os/AICompanyManager/assets/js/aicm-dashboard-selected-company-context.js
?? 03.business-os/AICompanyManager/assets/js/aicm-exact-ai-company-selection-sync.js
?? 03.business-os/AICompanyManager/assets/js/aicm-production-core.js
?? 03.business-os/AICompanyManager/assets/js/aicm-selected-company-organization-context-bridge.js
?? 03.business-os/AICompanyManager/assets/js/aicm-selected-company-visible-consistency-fix.js
?? 03.business-os/AICompanyManager/assets/js/aicm-white-screen-visible-rescue.js
?? 03.business-os/AICompanyManager/docs/090_AICM_BUSINESS_AIWORKER_BRIDGE_CANON.md
?? 03.business-os/AICompanyManager/docs/091_AICM_BUSINESS_AIWORKER_ROUTE_INTEGRATION_CANON.md
?? 03.business-os/AICompanyManager/docs/092_AICM_BUSINESS_AIWORKER_SCREEN_FILTER_CANON.md
?? 03.business-os/AICompanyManager/docs/093_AICM_BUSINESS_AIWORKER_SAVE_RELOAD_BRIDGE_CANON.md
?? 03.business-os/AICompanyManager/docs/094_AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_CANON.md
?? 03.business-os/AICompanyManager/docs/096_AICM_BUSINESS_AIWORKER_SAVE_DOUBLE_SUBMIT_GUARD_CANON.md
?? 03.business-os/AICompanyManager/docs/097_AICM_BUSINESS_AIWORKER_AUTH_TOKEN_CLIENT_CANON.md
?? 03.business-os/AICompanyManager/docs/098_AICM_BUSINESS_AIWORKER_API_CONFIG_CLIENT_CANON.md
?? 03.business-os/AICompanyManager/docs/099_AICM_BUSINESS_AIWORKER_WRITE_ENDPOINT_COMPAT_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/100_AICM_BUSINESS_AIWORKER_WRITE_ENDPOINT_COMPAT_REVIEW_V2_CANON.md
?? 03.business-os/AICompanyManager/docs/101_AICM_BUSINESS_AIWORKER_API_PLACE_ENDPOINT_REPAIR_CANON.md
?? 03.business-os/AICompanyManager/docs/102_AICM_BUSINESS_AIWORKER_API_PLACE_ENDPOINT_REPAIR_V2_CANON.md
?? 03.business-os/AICompanyManager/docs/103_AICM_BUSINESS_AIWORKER_API_PLACE_ENDPOINT_REPAIR_V3_CANON.md
?? 03.business-os/AICompanyManager/docs/104_AICM_ROBOT_ROLE_PERSONALITY_CX_REFERENCE_CANON.md
?? 03.business-os/AICompanyManager/docs/105_AICM_ROBOT_PUBLIC_PROFILE_REFERENCE_CANON.md
?? 03.business-os/AICompanyManager/docs/106_AICM_BUSINESS_AIWORKER_CX_REFERENCE_CLIENT_CANON.md
?? 03.business-os/AICompanyManager/docs/108_AICM_FULL_WRITE_ENDPOINT_COMPAT_RERUN_CANON.md
?? 03.business-os/AICompanyManager/docs/109_AICM_COMBINED_API_ROLLBACK_SMOKE_ENDPOINT_CANON.md
?? 03.business-os/AICompanyManager/docs/110_AICM_BUSINESS_AIWORKER_PRODUCTION_POLICY_RLS_PREP_CANON.md
?? 03.business-os/AICompanyManager/docs/111_AICM_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/112_AICM_BUSINESS_AIWORKER_RLS_PHASE1_APPLY_CANON.md
?? 03.business-os/AICompanyManager/docs/113_AICM_BUSINESS_AIWORKER_RLS_PHASE1_CLOSEOUT_VERIFY_CANON.md
?? 03.business-os/AICompanyManager/docs/114_AICM_BUSINESS_AIWORKER_RLS_PHASE2_AUTH_AUDIT_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/115_AICM_BUSINESS_AIWORKER_RLS_PHASE2_STRATEGY_A_APPLY_CANON.md
?? 03.business-os/AICompanyManager/docs/116_AICM_BUSINESS_AIWORKER_RLS_PHASE2_CLOSEOUT_VERIFY_CANON.md
?? 03.business-os/AICompanyManager/docs/117_AICM_BUSINESS_AIWORKER_RLS_PHASE2_FUNCTION_DEFINER_REPAIR_CANON.md
?? 03.business-os/AICompanyManager/docs/118_AICM_BUSINESS_AIWORKER_CONNECTION_FINAL_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/119_AICM_COMPANY_IDENTITY_ENTITLEMENT_PLACEMENT_RLS_REVIEW_CANON.md
?? 03.business-os/AICompanyManager/docs/120_AICM_COMPANY_CONTEXT_FOUNDATION_CANON.md
?? 03.business-os/AICompanyManager/docs/121_AICM_COMBINED_CONTEXT_REPAIR_CANON.md
?? 03.business-os/AICompanyManager/docs/122_AICM_COMPANY_CONTEXT_FOUNDATION_CLOSEOUT_CANON.md
?? 03.business-os/AICompanyManager/docs/123_AICM_COMPANY_CONTEXT_ENFORCEMENT_WRAPPER_CANON.md
?? 03.business-os/AICompanyManager/docs/124_AICM_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_CANON.md
?? 03.business-os/AICompanyManager/docs/125_AICM_INDIVIDUAL_API_CTX_WRAPPER_SWITCH_CLOSEOUT_V2_CANON.md
?? 03.business-os/AICompanyManager/docs/126_AICM_ENTITLEMENT_PLACEMENT_COMPANY_SCOPED_RLS_CANON.md
?? 03.business-os/AICompanyManager/docs/127_AICM_BUSINESS_AIWORKER_COMPANY_SCOPED_RLS_FINAL_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/128_AICM_BUSINESS_AIWORKER_ROLE_KNOWLEDGE_BOUNDARY_COMBAT_SEPARATION.md
?? 03.business-os/AICompanyManager/docs/129_AICM_BUSINESS_AIWORKER_FINAL_INTEGRATED_DESIGN.md
?? 03.business-os/AICompanyManager/docs/130_AICM_ROBOT_CATALOG_BASELINE_REFERENCE_ADDENDUM.md
?? 03.business-os/AICompanyManager/docs/131_AICM_ROBOT_POOL_BASELINE_INVENTORY_CANON.md
?? 03.business-os/AICompanyManager/docs/132_AICM_ROBOT_CATALOG_ROLE_CX_BOUNDARY_FINAL_CLOSEOUT.md
?? 03.business-os/AICompanyManager/docs/handoff/AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_HANDOFF_20260428_170910.md
?? 03.business-os/AICompanyManager/docs/handoff/AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_RECOVERY_HANDOFF_20260428_171200.md
?? 03.business-os/AICompanyManager/docs/handoff/AICompanyManager_ROBOT_REFERENCE_SAFE_DOM_WIRE_HANDOFF_20260428_171451.md
?? 03.business-os/AICompanyManager/docs/handoff/LATEST_AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/handoff/LATEST_AICompanyManager_ROBOT_REFERENCE_ACTUAL_UI_WIRE_RECOVERY_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/handoff/LATEST_AICompanyManager_ROBOT_REFERENCE_SAFE_DOM_WIRE_HANDOFF.md
?? 03.business-os/AICompanyManager/docs/verification/20260427_140136_phase_nd_ng_l_live_aiworkeros_call_localhost/
?? 03.business-os/AICompanyManager/docs/verification/20260427_140505_phase_nh_nk_live_aiworkeros_localhost_auth_retry/
?? 03.business-os/AICompanyManager/docs/verification/20260427_140706_phase_nm_np_live_aiworkeros_phase_fix_retry/
?? 03.business-os/AICompanyManager/docs/verification/20260427_140800_phase_nq_nt_live_aiworkeros_idempotency_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_143100_phase_pc_pf_first_real_use_absolute_runtime/
?? 03.business-os/AICompanyManager/docs/verification/20260427_150256_phase_sc_sf_real_api_jwt_backend_integration_smoke/
?? 03.business-os/AICompanyManager/docs/verification/20260427_150953_phase_ss_sv_post_release_ui_login_smoke/
?? 03.business-os/AICompanyManager/docs/verification/20260427_154948_phase_ts_actual_ui_source_structure_inventory/
?? 03.business-os/AICompanyManager/docs/verification/20260427_155601_phase_ts2_direct_edit_target_snippet_diagnostic/
?? 03.business-os/AICompanyManager/docs/verification/20260427_205233_aicm_business_aiworker_bridge/
?? 03.business-os/AICompanyManager/docs/verification/20260427_205605_aicm_business_aiworker_save_route/
?? 03.business-os/AICompanyManager/docs/verification/20260427_205902_aicm_business_aiworker_save_route_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_210058_aicm_business_aiworker_place_dryrun_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_210227_aicm_business_aiworker_dryrun_json_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_210858_aicm_business_aiworker_placement_management/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211024_aicm_business_aiworker_placement_management_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211203_aicm_business_aiworker_route_integration/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211730_aicm_business_aiworker_screen_filter/
?? 03.business-os/AICompanyManager/docs/verification/20260427_211846_aicm_business_aiworker_save_reload/
?? 03.business-os/AICompanyManager/docs/verification/20260427_212029_aicm_business_aiworker_duplicate_guard/
?? 03.business-os/AICompanyManager/docs/verification/20260427_212156_aicm_business_aiworker_duplicate_guard_verify_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260427_213433_business_aiworker_role_slot_columns_only/
?? 03.business-os/AICompanyManager/docs/verification/20260427_214015_business_aiworker_role_catalog_only/
?? 03.business-os/AICompanyManager/docs/verification/20260427_214117_business_aiworker_current_robots_by_series/
?? 03.business-os/AICompanyManager/docs/verification/20260427_220941_business_aiworker_role_catalog_add_lover_battler/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221142_business_aiworker_add_missing_robot_pool/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221345_business_aiworker_assign_role_slots/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221510_business_aiworker_selector_role_slots/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221723_business_aiworker_selector_role_slots_robust_verify/
?? 03.business-os/AICompanyManager/docs/verification/20260427_221907_business_aiworker_role_slot_selector_self_heal/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222021_aicm_president_default_model_hd_r5p/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222241_aicm_business_aiworker_save_double_submit_guard/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222403_aicm_business_aiworker_save_double_submit_guard/
?? 03.business-os/AICompanyManager/docs/verification/20260427_222655_aicm_business_aiworker_auth_audit_foundation/
?? 03.business-os/AICompanyManager/docs/verification/20260427_223035_aicm_business_aiworker_auth_audit_api_v3_bundle/
?? 03.business-os/AICompanyManager/docs/verification/20260427_223410_aicm_business_aiworker_auth_audit_foundation_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_042455_aicm_business_aiworker_auth_audit_foundation_repair_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_042731_aicm_business_aiworker_api_v3_skip_db_foundation/
?? 03.business-os/AICompanyManager/docs/verification/20260428_042939_aicm_business_aiworker_api_v3_smoke_crud_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043107_aicm_business_aiworker_api_v3_readonly_smoke_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043248_aicm_business_aiworker_api_v3_canonical_promotion/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043421_aicm_business_aiworker_write_endpoint_compat_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043613_aicm_business_aiworker_write_endpoint_compat_review_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_043855_aicm_business_aiworker_api_place_endpoint_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_044051_aicm_business_aiworker_api_place_endpoint_repair_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_044743_aicm_business_aiworker_api_place_endpoint_repair_v3/
?? 03.business-os/AICompanyManager/docs/verification/20260428_045447_robot_role_personality_cx_reference/
?? 03.business-os/AICompanyManager/docs/verification/20260428_045848_robot_public_profile_lovers_megami_cx_reference/
?? 03.business-os/AICompanyManager/docs/verification/20260428_050207_aicm_cx_reference_api_client/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051026_aicm_full_write_endpoint_compat_rerun/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051249_aicm_combined_api_rollback_smoke_endpoint/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051419_aicm_business_aiworker_production_policy_rls_prep/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051545_aicm_business_aiworker_production_policy_rls_prep_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051646_aicm_business_aiworker_rls_reference_inventory_v3/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051800_aicm_business_aiworker_rls_reference_inventory_v4/
?? 03.business-os/AICompanyManager/docs/verification/20260428_051927_aicm_business_aiworker_rls_phase1_apply_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052118_aicm_business_aiworker_rls_phase1_apply/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052255_aicm_business_aiworker_rls_phase1_closeout_verify/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052423_aicm_business_aiworker_rls_phase2_auth_audit_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052546_aicm_business_aiworker_rls_phase2_strategy_a_apply/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052713_aicm_business_aiworker_rls_phase2_closeout_verify/
?? 03.business-os/AICompanyManager/docs/verification/20260428_052912_aicm_business_aiworker_rls_phase2_function_definer_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053039_aicm_business_aiworker_final_handoff_package/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053431_aicm_company_identity_entitlement_placement_rls_review/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053633_aicm_company_context_foundation/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053812_aicm_combined_context_repair/
?? 03.business-os/AICompanyManager/docs/verification/20260428_053928_aicm_combined_context_repair_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054043_aicm_company_context_foundation_closeout/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054254_aicm_company_context_enforcement_wrapper/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054452_aicm_individual_api_ctx_wrapper_switch/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054643_aicm_individual_api_ctx_wrapper_switch_closeout_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_054852_aicm_entitlement_placement_rls_apply/
?? 03.business-os/AICompanyManager/docs/verification/20260428_055720_aicm_final_company_scoped_rls_closeout/
?? 03.business-os/AICompanyManager/docs/verification/20260428_060938_aicm_combat_role_separation/
?? 03.business-os/AICompanyManager/docs/verification/20260428_061128_aicm_combat_role_separation_v2/
?? 03.business-os/AICompanyManager/docs/verification/20260428_061322_aicm_combat_role_separation_v3/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064022_robot_catalog_baseline_design_addendum/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064220_aicm_final_integrated_design_docs/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064253_robot_pool_baseline_inventory/
?? 03.business-os/AICompanyManager/docs/verification/20260428_064502_robot_catalog_role_cx_boundary_final_closeout/
?? 03.business-os/AICompanyManager/docs/verification/20260429_054729_manager_payload_robot_role_guard_v12/
?? 03.business-os/AICompanyManager/docs/worker-runtime/
?? 03.business-os/AICompanyManager/ops/
?? 03.business-os/AICompanyManager/server/aicm-clean-v2-api-server.candidate.mjs
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_api_config_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_auth_token_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_bridge.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_duplicate_guard.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_placement_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_reference_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_route_integration.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_save_client.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_save_double_submit_guard.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_save_reload_bridge.js
?? 03.business-os/AICompanyManager/tests/node_smoke_aicm_business_aiworker_screen_filter.js
?? 03.business-os/AICompanyManager/tests/phase_kn_kq_ledger_persistent_write_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_kr_ku_ledger_persistent_write_repair_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_kv_ky_ledger_constraint_guided_repair_check.sh
?? 03.business-os/AICompanyManager/tests/phase_li_ll_review_action_persistent_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_lz_mc_csv_import_persistent_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_md_mg_csv_import_uuid_repair_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_mi_ml_csv_import_temp_collision_repair_check.sh
?? 03.business-os/AICompanyManager/tests/phase_nd_ng_l_live_aiworkeros_localhost_call_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_nh_nk_live_aiworkeros_localhost_auth_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_nm_np_live_aiworkeros_phase_fix_retry_check.sh
?? 03.business-os/AICompanyManager/tests/phase_ny_oc_rls_apply_check.sh
?? 03.business-os/AICompanyManager/tests/phase_ol_oo_first_real_use_live_aiworkeros_check.sh
?? 03.business-os/AICompanyManager/tests/phase_ox_pa_first_real_use_actual_node_server_check.sh
?? 03.business-os/AICompanyManager/tests/phase_pt_pw_strict_tenant_rls_shadow_apply_check.sh
?? 03.business-os/AICompanyManager/tests/phase_qj_qm_api_jwt_claim_integration_smoke_check.sh
?? 03.business-os/AICompanyManager/tests/phase_uz_vc_recovery_robot_reference_actual_ui_wire_check.sh
?? 03.business-os/AICompanyManager/tests/phase_uz_vc_robot_reference_actual_ui_wire_check.sh
?? 03.business-os/AICompanyManager/tests/phase_vd_vg_robot_reference_safe_dom_wire_check.sh
?? 03.business-os/AICompanyManager/tests/phase_zzp_zzs_worker_persisted_ui_reload_verify_check.sh
CHANGE_COUNT=193

============================================================
4. diff summary
============================================================
 .../js/aicm-businessos-db-company-binding.js       |   10 +
 .../js/aicm-businessos-db-robot-pool-wire.js       |  336 +++
 .../js/aicm-company-persistent-save-client.js      |  863 ++-----
 .../js/aicm-robot-placement-payload-preview.js     |   20 +
 .../js/phase-de-dh-workflow-final-local-ui.js      |  435 +++-
 03.business-os/AICompanyManager/index.html         |   38 +-
 .../server/aicm-local-ui-api-server.mjs            | 2449 ++++++++++++++++++--
 7 files changed, 3183 insertions(+), 968 deletions(-)

============================================================
5. secret direct-value scan
============================================================
PASS: no obvious secret direct values in changed files

============================================================
6. git add AICompanyManager only
============================================================
warning: in the working copy of '03.business-os/AICompanyManager/900.meta/context_500_diag_after_axc_r2_20260501_052830/011_context_headers.txt', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of '03.business-os/AICompanyManager/900.meta/context_500_diag_after_axc_r2_20260501_052830/040_code_scan.txt', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of '03.business-os/AICompanyManager/900.meta/context_owner_param_verify_20260501_053001/021_context_owner_headers.txt', CRLF will be replaced by LF the next time Git touches it
