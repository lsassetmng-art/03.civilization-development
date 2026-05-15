# B6R96R1I5 next guide

## Current confirmed cause

B6R96R1I2 failed because DB function raised:

Runtime control profile not found:
- app_surface_code=ai_company_manager
- model_code=HD-R3

## Meaning

The requester_delivery_payload wrapper has not been properly tested yet.
The runtime request failed before a normal success response.

## What to do next

Use a model_code that actually exists for app_surface_code=ai_company_manager.

Most likely candidates will be shown in:
/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_113702_b6r96r1i4_runtime_control_profile_inventory_no_post/out/020_model_code_hints.txt

## If a valid model is found

Run one controlled POST again with:

- app_surface_code=ai_company_manager
- model_code=<valid existing model_code>
- same endpoint:
  /aiworker/v1/runtime-execution/request

Expected:
- HTTP 200/201/202
- requester_delivery_payload exists
- body_markdown non-empty
- performance_profile exists
- reference_usage_profile exists

## If no valid ai_company_manager profile exists

Do not patch server first.

Next should be DB proposal, not apply:
- add runtime control profile for ai_company_manager + intended model_code
- Sato review
- apply only after approval

## Boundaries

This phase did not POST.
This phase did not DB write.
This phase did not patch.
