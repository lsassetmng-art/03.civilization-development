# R29G-P2J-R1 exact writable base table audit

## 1. Purpose

Identify the exact writable base table and columns needed to seed:

- target app_surface_code: cx22073jw_e2e_quality_gate
- model_code: byd2_003_asic_leader3

Reference successful pair:

- source app_surface_code: ai_company_manager
- model_code: byd2_003_asic_leader3

## 2. What this audit did

- Captured view definition:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_212807_b6r95r3z_r29g_p2j_r1_exact_base_table_audit/020_view_definition.log
- Captured pg_depend dependencies:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_212807_b6r95r3z_r29g_p2j_r1_exact_base_table_audit/030_view_dependencies.log
- Captured function definitions:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_212807_b6r95r3z_r29g_p2j_r1_exact_base_table_audit/040_function_definition.log
- Captured candidate base tables:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_212807_b6r95r3z_r29g_p2j_r1_exact_base_table_audit/050_candidate_base_tables.log
- Captured candidate source/target samples:
  - /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260509_212807_b6r95r3z_r29g_p2j_r1_exact_base_table_audit/060_candidate_samples.log

## 3. Sato review instruction

佐藤は以下を確認する:

1. `vw_app_aiworker_runtime_control_profile_v1` の実体元テーブル。
2. `fn_runtime_execution_create_request` が実際に参照する runtime control source。
3. source pair `ai_company_manager × byd2_003_asic_leader3` が存在する base table。
4. target pair `cx22073jw_e2e_quality_gate × byd2_003_asic_leader3` が未存在であること。
5. INSERT対象の必須列、デフォルト列、unique/conflict key。
6. sourceからcloneする列と、target用に上書きする列。
7. external_execution_allowed_flag / pg_apply_allowed_flag / destructive_action_allowed_flag が false のまま維持されること。
8. RLS / trigger / generated columns / NOT NULL constraints。

## 4. Decision

This file is review-only.
No DB apply has been performed.
