# R29G-P2J-R3R real runtime control profile base audit

## 1. Why this audit exists

P2J-R3 incorrectly selected:

- aiworker.runtime_execution_request

That table is request/history fact data, not the runtime control profile master.
It must NOT be used as the seed target for `cx22073jw_e2e_quality_gate × byd2_003_asic_leader3`.

## 2. Target

Create a dedicated control profile later for:

- app_surface_code=cx22073jw_e2e_quality_gate
- model_code=byd2_003_asic_leader3

by copying safe posture from:

- app_surface_code=ai_company_manager
- model_code=byd2_003_asic_leader3

## 3. Current safe conclusion

Do not seed `aiworker.runtime_execution_request`.

This audit excludes request/history/board/output tables and looks for actual control-profile style base tables.

## 4. Evidence

- View definition:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050843_b6r95r3z_r29g_p2j_r3r_real_control_profile_base_audit/020_control_profile_view_definition.log
- View dependencies:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050843_b6r95r3z_r29g_p2j_r3r_real_control_profile_base_audit/030_control_profile_view_dependencies.log
- Runtime function definition:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050843_b6r95r3z_r29g_p2j_r3r_real_control_profile_base_audit/040_runtime_create_function_definition.log
- Real base candidate list:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050843_b6r95r3z_r29g_p2j_r3r_real_control_profile_base_audit/050_real_control_base_candidates.log
- Candidate samples:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050843_b6r95r3z_r29g_p2j_r3r_real_control_profile_base_audit/060_real_control_base_samples.log

## 5. Sato review points

佐藤確認:

1. `runtime_execution_request` は seed 対象から除外する。
2. `vw_app_aiworker_runtime_control_profile_v1` の view definition を読み、実体元を確定する。
3. surface/model が単一base table由来か、app surface table × model/profile table のjoin由来か確認する。
4. join由来なら、seedは1テーブルではなく app surface / permission / model mapping のどれに入れるべきか確認する。
5. dangerous flags:
   - external_execution_allowed_flag=false
   - pg_apply_allowed_flag=false
   - destructive_action_allowed_flag=false
   を維持する。
6. exact apply SQL はこの確認後に作る。

## 6. Status

Read-only only.
No DB apply.
No POST.
No patch.
