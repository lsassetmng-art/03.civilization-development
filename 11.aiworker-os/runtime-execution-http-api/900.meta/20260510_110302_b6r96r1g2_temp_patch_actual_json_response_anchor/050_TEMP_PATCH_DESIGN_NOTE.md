# B6R96R1G2 temp patch design note

## Status

Patched temp server generated only.

## Applied to real server

No.

## Strategy

R1G failed because server.js does not have function sendJson(...).

R1G2 uses actual response anchors:
- res.end(JSON.stringify(...)) family

It wraps JSON response payloads with:
- aiwB6R96R1G2EnsureRequesterDeliveryPayload(...)

The wrapper returns unchanged payload unless it looks like runtime/request response.

## Key behavior

If a response looks like runtime accepted/request payload, it adds:

- requester_delivery_payload
- deliverable alias
- non-empty body_markdown
- minimum_guarantee_status
- performance_profile
- reference_usage_profile

## Low performance policy

Low performance robots still return stable deliverables.
Performance difference is CX permission, reference depth, originality, specialty, prediction, and review precision.

## Files

- Temp patched server:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_110302_b6r96r1g2_temp_patch_actual_json_response_anchor/020_server.patched_b6r96r1g2.js

- Replacement report:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_110302_b6r96r1g2_temp_patch_actual_json_response_anchor/out/030_patcher_replacement_report.json

- Node check:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_110302_b6r96r1g2_temp_patch_actual_json_response_anchor/030_node_check_patched_server.txt

- Diff:
  /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_110302_b6r96r1g2_temp_patch_actual_json_response_anchor/out/040_temp_patch_diff.diff

## Next

B6R96R1H:
Inspect diff, apply to server.js if acceptable, start server, run HTTP checks.

Do not push until UI/AICM integration is confirmed and user says push.
