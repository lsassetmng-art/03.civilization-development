# R29F Model Identifier Canon Exact Design Draft

## Design direction

Use DB-side identifier canon, not server.js hardcoded alias.

## Identifier meanings

- registry_code:
  - stable master registry identifier
  - FK candidate to aiworker.model_public_registry(registry_code)

- public_model_no:
  - public product/model number such as BYD2-003
  - comes from aiworker.model_public_registry.model_no

- runtime_model_code:
  - internal runtime code such as byd2_003_asic_leader3
  - comes from aiworker.model_public_registry.model_code

- legacy_material_model_code:
  - old value currently exposed as material model_code
  - preserved to avoid destructive rewrite

## Canonical material view should expose

- registry_code
- public_model_no
- runtime_model_code
- legacy_material_model_code
- model_code as runtime_model_code for AIWorkerOS runtime lookup compatibility
- old material body columns
- source/caution/quality columns

## Do not do yet

- Do not DROP old views.
- Do not CASCADE DROP.
- Do not patch AICM.
- Do not reintroduce server.js one-off alias.
- Do not update all material rows destructively before exact source-table ownership is confirmed.

## Likely next SQL phase

1. Add canonical identifier columns to the true model-bearing source table(s).
2. Backfill by joining aiworker.model_public_registry:
   - old value = model_no -> public_model_no match
   - old value = model_code -> runtime_model_code match
   - old value = registry_code -> registry_code match
3. Create new canonical view.
4. Switch dependent views to new canonical view.
5. Switch server.js to new canonical view.
6. Verify old view references are zero.
7. Sato review.
8. Boss explicit GO.
9. DROP old views without CASCADE.
