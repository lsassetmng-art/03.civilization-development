# B6R96R1G2 patch guide

## R1G failure
- R1G assumed function sendJson(...), but SENDJSON_COUNT=1.
- Real response structure must be patched based on exact anchor.

## Counts
- SENDJSON_COUNT=1
- RES_END_JSON_COUNT=1
- JSON_STRINGIFY_COUNT=9
- WRITEHEAD_COUNT=1

## Recommended strategy
- Use inline res.end(JSON.stringify(...)) anchor.
- Patch only the runtime accepted response object or wrap the payload immediately before stringify.

## Next
B6R96R1G2 should create a temp patch using the exact response anchor found in:
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/20260510_105632_b6r96r1g0_response_anchor_audit_no_patch/dumps/030_response_anchor_windows.txt

It must still be temp patch only until node --check passes.
