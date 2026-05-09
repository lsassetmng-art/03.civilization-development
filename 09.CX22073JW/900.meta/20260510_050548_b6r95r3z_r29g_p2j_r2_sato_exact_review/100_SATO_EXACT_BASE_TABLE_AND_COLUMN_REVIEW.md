# R29G-P2J-R2 佐藤レビュー: exact base table / columns

## 1. Seed target

- source app_surface_code: ai_company_manager
- target app_surface_code: cx22073jw_e2e_quality_gate
- model_code: byd2_003_asic_leader3

## 2. Current conclusion

P2I E2E succeeded using existing surface:

- app_surface_code=ai_company_manager
- model_code=byd2_003_asic_leader3

P2H failed using target surface:

- app_surface_code=cx22073jw_e2e_quality_gate
- model_code=byd2_003_asic_leader3

Therefore, the model and runtime generation path are valid.
The missing piece is the target app_surface_code × model_code runtime control profile.

## 3. Evidence hints

### View/base hints

/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log:aiworker.app_runtime_control_policy /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log:aiworker.model_runtime_control_override /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log:aiworker.role_runtime_control_default /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log:aiworker.series_runtime_control_default /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log:aiworker.vw_app_aiworker_model_selection_capability_card_v1 /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log:aiworker.vw_app_aiworker_runtime_control_profile_v1 /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/030_view_dependencies.log:aiworker.app_runtime_control_policy /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/030_view_dependencies.log:aiworker.model_runtime_control_override /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/030_view_dependencies.log:aiworker.role_runtime_control_default /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/030_view_dependencies.log:aiworker.series_runtime_control_default /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/030_view_dependencies.log:aiworker.vw_app_aiworker_model_selection_capability_card_v1 

### Function/base hints

aiworker.fn_runtime_execution_create_request aiworker.fn_runtime_execution_create_request_with_route_v1 aiworker.runtime_execution_event_log aiworker.runtime_execution_request aiworker.runtime_handoff_packet aiworker.runtime_review_gate_log aiworker.vw_app_aiworker_runtime_control_profile_v1 

### Candidate base tables

none

### Candidate tables where source pair appears

aiworker.runtime_execution_request 

## 4. Sato exact review items

佐藤確認:

1. `vw_app_aiworker_runtime_control_profile_v1` の実体元テーブルを確定する。
2. `fn_runtime_execution_create_request` が参照する profile source と一致するか確認する。
3. `ai_company_manager × byd2_003_asic_leader3` が存在する base table を確定する。
4. `cx22073jw_e2e_quality_gate × byd2_003_asic_leader3` が未存在であることを確認する。
5. INSERT/UPSERT対象の列を確定する。
6. unique key / conflict key を確定する。
7. NOT NULL / default / generated columns / triggers を確認する。
8. sourceからcloneする列と、target用に上書きする列を分ける。
9. 以下は必ず false 維持:
   - external_execution_allowed_flag
   - pg_apply_allowed_flag
   - destructive_action_allowed_flag
10. seed後 verification:
   - target pair count = 1
   - P2H equivalent POST using cx22073jw_e2e_quality_gate succeeds

## 5. Evidence files

- view definition: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/020_view_definition.log
- view dependencies: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/030_view_dependencies.log
- function definition: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/040_function_definition.log
- candidate tables: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/050_candidate_base_tables.log
- candidate samples: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/060_candidate_samples.log

## 6. Status

This is review-only.
No DB apply has been performed.
