# AICompanyManager R8Z-G Worker runtime payload precheck

## Roadmap
1. R8Z-D: Leader auto decomposition persisted child rows.
2. R8Z-F: context normalize fixed; UI shows 1/1/1.
3. R8Z-G: verify Worker作業単位 can map to existing Worker runtime request payload.

## Scope
- DB write: NO
- API POST: NO
- Persistent write: NO
- Physical DELETE: NO

## Expected
Create a local candidate payload for:
- /api/aicm/v2/worker-runtime/request

No request is posted in this phase.

## Checks
- node_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/010_node_check.log
- db_precheck: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/020_db_worker_payload_precheck.log
- target_worker_work_unit_id: c8995f67-3a57-48f6-a2d7-a95d79eb4b80
- payload_candidate: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/040_runtime_payload_candidate.json
- payload_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/060_payload_check.log
- server_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/070_server_runtime_scan.log
- core_scan: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/080_core_runtime_scan.log
- context_check: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_g_worker_runtime_payload_precheck_20260502_222257/110_context_check.log

## Result
- final_status: R8Z_G_WORKER_RUNTIME_PAYLOAD_PRECHECK_DONE_REVIEW_REQUIRED
- db_write: NO
- api_post: NO
- persistent_db_write: NO

## Next
R8Z-H should add a UI/confirmation route:
Worker作業単位 card
-> 実行確認
-> /api/aicm/v2/worker-runtime/request
-> review wait / runtime status connection
