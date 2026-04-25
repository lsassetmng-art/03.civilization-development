# AICompanyManager Server Route Candidates

## Browser-Facing Routes

- POST /api/v1/business/ai-company-manager/pipeline/start
- POST /api/v1/business/ai-company-manager/pipeline/snapshot
- POST /api/v1/business/ai-company-manager/reviews/return
- POST /api/v1/business/ai-company-manager/approvals/approve
- POST /api/v1/business/ai-company-manager/approvals/revision-request
- POST /api/v1/business/ai-company-manager/deliveries/accept

## Internal AIWorkerOS Routes

- POST /internal/v1/aiworker/company-pipeline/runs
- GET /internal/v1/aiworker/company-pipeline/runs/{aiworker_run_ref}/snapshot
- POST /internal/v1/aiworker/company-pipeline/runs/{aiworker_run_ref}/revision-requests

## Security Rule

No service role key in browser.

No AIWorkerOS internal secret in browser.

No AIWorkerOS internal prompt or reasoning is returned to browser.
