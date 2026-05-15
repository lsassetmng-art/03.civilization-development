# B6R95R3 Proposed AIWorkerOS -> AICM Deliverable Contract Skeleton

Status:
- Draft only.
- Not applied.
- Must be mapped onto exact server.js anchors after B6R95R3A review.

## Current confirmed issue

AICM runtime requests exist, but latest AICM app-read payload rows have:
- outputs_count=0
- artifacts_count=0
- app_read_payload_has_body_like_key=false

Existing AIWorkerOS DB functions:
- aiworker.fn_runtime_execution_create_request_with_route_v1(...)
- aiworker.fn_runtime_execution_submit_worker_output(...)
- aiworker.fn_runtime_execution_mark_delivery_ready(...)

## Intended minimal AIWorkerOS behavior

After runtime request creation for AICM internal-only work:
1. Build sanitized deliverable body from:
   - task title
   - task instruction
   - route/source metadata
   - compact worker context
   - safety/internal-only flags
2. Call aiworker.fn_runtime_execution_submit_worker_output(...)
3. Call aiworker.fn_runtime_execution_mark_delivery_ready(...)
4. Return response payload containing:
   - request_id
   - request_status_code
   - output_id
   - delivery_id
   - deliverable.body_format
   - deliverable.body_markdown or body_text
   - deliverable.summary_text
   - deliverable_ref

## Important boundary

This patch does not:
- change AICM
- change CX22073JW brain access control
- perform external execution
- perform PG apply
- perform destructive operations
- perform git push
