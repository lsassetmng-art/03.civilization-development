# Sato review checklist: CX dedicated runtime surface seed

## 1. Review target

Seed proposal for:

- app_surface_code: cx22073jw_e2e_quality_gate
- model_code: byd2_003_asic_leader3
- source profile: ai_company_manager × byd2_003_asic_leader3

## 2. Required review points

佐藤確認項目:

1. aiworker.vw_app_aiworker_runtime_control_profile_v1 の実体元テーブルを確認する。
2. aiworker.fn_runtime_execution_create_request の参照先と一致することを確認する。
3. source profile ai_company_manager × byd2_003_asic_leader3 から複製してよい列を確定する。
4. target app_surface_code cx22073jw_e2e_quality_gate の名称・用途が妥当か確認する。
5. external_execution_allowed_flag=false を維持する。
6. pg_apply_allowed_flag=false を維持する。
7. destructive_action_allowed_flag=false を維持する。
8. response_style / checklist / handoff / context_scope は source profile と同等またはCX用途に安全な値にする。
9. conflict key / unique制約を確認する。
10. apply前後のverification SQLを確定する。

## 3. Do not execute yet

This packet is proposal-only.

- DB_WRITE=NO
- SQL_APPLY=NO
- Boss GO required before any apply
