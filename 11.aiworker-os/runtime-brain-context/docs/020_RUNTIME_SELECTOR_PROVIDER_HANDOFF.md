# Runtime Brain Context Selector Provider Handoff

Generated: 20260504_105801

## Status
- FINAL TARGET: CX22073JW brain full-load data can be selected by AIWorkerOS runtime provider.
- AICM_TOUCH: NO
- DB env: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## Completed lanes
- Lane01: full-load domain catalog / coverage base / Pack05
- Lane02: existing CX source object ingestion / srcobj / srcrow
- Lane03: backlog high-confidence source object mapping
- Lane04: source registry material adapter / srcmat runtime material
- Lane05: target_min_unit_count fill-up / lane05 material
- Lane06: runtime selector function / two-stage domain-first ranking
- Lane07: runtime provider + HTTP bridge integration
- Lane08: regression smoke / prompt size guard / handoff

## Runtime selector
- Function: aiworker.fn_robot_brain_runtime_material_select_v1
- Selector mode: two_stage_domain_then_overall_rank
- Protected material buckets:
  - source_registry / srcmat_
  - lane05_fillup / lane05_
  - pack05_full_load / pack05_

## Runtime files
- Provider: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/src/aiworker-brain-context-provider.mjs
- HTTP bridge: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/brain-context-bridge.js
- HTTP server: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
- Regression smoke: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/smoke/smoke-lane08-runtime-selector-regression.mjs

## Safety boundary
- 読取は実行権限ではない。
- DB更新、外部操作、承認、契約、会計確定などは別レイヤー。
- security_crisis は risk_check / design_reference / safety_training / review / worldbuilding 等の安全用途に限定。
- HD-R1C は business/professional/security/civilization/health/exam を読まない。
- HD-R2系は business/professional を読まない。

## Regression command
```bash
cd /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context
SERVER_FILE='/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js' node '/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/smoke/smoke-lane08-runtime-selector-regression.mjs'
```

## Latest lane reports
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_204024_brain_full_load_lane_02_safe_rerun_dedup/000_BRAIN_FULL_LOAD_LANE_02_SAFE_DEDUP_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_211103_brain_full_load_lane_02_viewfix_compatible/000_BRAIN_FULL_LOAD_LANE_02_VIEWFIX_COMPATIBLE_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_215135_brain_full_load_lane_03_backlog_mapping/000_BRAIN_FULL_LOAD_LANE_03_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_223022_brain_full_load_lane_04_runtime_source_registry_adapter/000_BRAIN_FULL_LOAD_LANE_04_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260503_225854_brain_full_load_lane_05_target_fillup/000_BRAIN_FULL_LOAD_LANE_05_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053026_brain_full_load_lane_05_repair_axis_active_flag/000_BRAIN_FULL_LOAD_LANE_05_REPAIR_AXIS_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_053517_brain_full_load_lane_06_runtime_selection_tuning/000_BRAIN_FULL_LOAD_LANE_06_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061307_brain_full_load_lane_06_failure_diagnosis/000_BRAIN_FULL_LOAD_LANE_06_FAILURE_DIAGNOSIS_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_061524_brain_full_load_lane_06_srcmat_priority_repair/000_BRAIN_FULL_LOAD_LANE_06_SRCMAT_PRIORITY_REPAIR_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_062328_brain_full_load_lane_06_srcmat_repair_failure_diagnosis/000_LANE06_SRCMAT_REPAIR_FAILURE_DIAGNOSIS_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/brain-data-thickening/900.meta/20260504_062651_brain_full_load_lane_06_definitive_two_stage_rank_repair/000_BRAIN_FULL_LOAD_LANE_06_DEFINITIVE_REPAIR_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/live-aiworkeros-call/900.meta/hygiene_20260427_143301/000_ENV_RUNTIME_HYGIENE_FIX_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/live-aiworkeros-call/900.meta/hygiene_recovery_20260427_143414/000_ENV_RUNTIME_HYGIENE_FIX_RECOVERY_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_071003_runtime_brain_context_provider/000_RUNTIME_BRAIN_CONTEXT_PROVIDER_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_072056_runtime_prompt_builder_integration_inventory/000_RUNTIME_PROMPT_BUILDER_INTEGRATION_INVENTORY_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_072343_runtime_execution_http_api_brain_context_bridge/000_RUNTIME_EXECUTION_HTTP_API_BRAIN_CONTEXT_BRIDGE_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_072453_brain_context_bridge_smoke_retry_port_autodetect/000_BRAIN_CONTEXT_BRIDGE_SMOKE_RETRY_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_075051_runtime_brain_context_materials_patch/000_RUNTIME_BRAIN_CONTEXT_MATERIALS_PATCH_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_105640_runtime_material_probe_pack_02/000_RUNTIME_MATERIAL_PROBE_PACK_02_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_172650_runtime_material_probe_pack_03/000_RUNTIME_MATERIAL_PROBE_PACK_03_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_175921_runtime_material_probe_pack_04/000_RUNTIME_MATERIAL_PROBE_PACK_04_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180134_runtime_material_probe_pack_04_failure_diagnosis/000_PACK04_FAILURE_DIAGNOSIS_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180403_pack04_targeted_repair/000_PACK04_TARGETED_REPAIR_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_180659_pack04_final_repair/000_PACK04_FINAL_REPAIR_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064025_brain_full_load_lane_07_provider_selector_integration/000_BRAIN_FULL_LOAD_LANE_07_PROVIDER_SELECTOR_INTEGRATION_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064605_lane07_http_bridge_selector_repair/000_LANE07_HTTP_BRIDGE_SELECTOR_REPAIR_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064727_lane07_http_probe_esm_retry/000_LANE07_HTTP_PROBE_ESM_RETRY_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_064907_lane07_http_500_diagnosis/000_LANE07_HTTP_500_DIAGNOSIS_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_065115_lane07_render_prompt_alias_repair/000_LANE07_RENDER_PROMPT_ALIAS_REPAIR_REPORT.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260504_105801_brain_full_load_lane_08_regression_handoff/000_BRAIN_FULL_LOAD_LANE_08_REPORT.md
