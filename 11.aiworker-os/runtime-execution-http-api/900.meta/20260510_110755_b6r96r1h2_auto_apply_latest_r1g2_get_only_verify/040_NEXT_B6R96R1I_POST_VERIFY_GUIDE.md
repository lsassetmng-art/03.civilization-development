# B6R96R1I next guide

## Current status

B6R96R1H2 applied the latest B6R96R1G2 temp patch to AIWorkerOS server.js and ran GET-only verification.

## Important boundary

This step did not run API POST.

Reason:
- API POST may create runtime request rows.
- Runtime request creation can be DB write.
- Project rule requires explicit confirmation before API POST / DB write.

## Next step

B6R96R1I should run controlled local HTTP POST verification only if approved.

It should check:
- requester_delivery_payload exists
- body_markdown is non-empty
- low performance still stable
- performance_profile exists
- reference_usage_profile exists
- response still includes request_id/status

## AICM follow-up

After AIWorkerOS POST response includes requester_delivery_payload:
- run AICM consumer flow
- verify business.ai_company_manager_deliverable save
- verify human_review_item metadata deliverable_id
- verify delivery-summary uses成果物本文
