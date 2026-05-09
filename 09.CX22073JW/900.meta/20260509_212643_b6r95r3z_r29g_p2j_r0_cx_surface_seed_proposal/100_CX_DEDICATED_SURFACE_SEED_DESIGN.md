# CX22073JW dedicated runtime app_surface seed design

## 1. Purpose

Create a dedicated AIWorkerOS runtime execution surface for CX22073JW E2E / quality-gate use.

Current successful E2E uses:

- app_surface_code: ai_company_manager
- source_app_ref: cx22073jw
- model_code: byd2_003_asic_leader3

Desired dedicated surface:

- app_surface_code: cx22073jw_e2e_quality_gate
- app_surface_name_ja: CX22073JW E2E品質ゲート
- model_code: byd2_003_asic_leader3

## 2. Reason

P2H failed with:

Runtime control profile not found:
app_surface_code=cx22073jw_e2e_quality_gate
model_code=byd2_003_asic_leader3

P2I succeeded by using existing surface:

app_surface_code=ai_company_manager
model_code=byd2_003_asic_leader3

Therefore the model is valid, and the runtime material / zip generation path works.
The missing part is only the target app_surface_code × model_code control profile.

## 3. Policy

- Do not change robot model master.
- Do not change CX material canon.
- Do not change AICM code.
- Do not use hardcoded model alias.
- Do not drop old views.
- Do not widen execution permissions beyond the source profile.
- Seed should clone the safe runtime-control posture from ai_company_manager × byd2_003_asic_leader3.
- external_execution_allowed_flag remains false.
- pg_apply_allowed_flag remains false.
- destructive_action_allowed_flag remains false.

## 4. DB apply rule

This is only a proposal.
Actual DB write requires:

- Sato review
- Boss explicit GO
- psql against PERSONA_DATABASE_URL only
- no DATABASE_URL / ERP DB
- no CASCADE / DROP / DELETE / TRUNCATE
