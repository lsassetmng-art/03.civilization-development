# AICompanyManager Worker Runtime API Contract

status: active
scope: local server endpoint contract
owner: Boss
prepared_by: Zero

## 1. AICompanyManager local endpoint

POST /api/aicm/v2/worker-runtime/request

## 2. Required env on server side

- PERSONA_AIWORKEROS_BASE_URL
- PERSONA_AIWORKEROS_AUTH_TOKEN

UI側へは出さない。

## 3. Required headers from UI to AICompanyManager local server

- Content-Type: application/json

## 4. Required body from UI

JSON shape:

{
  "owner_civilization_id": "uuid",
  "aicm_user_company_id": "uuid",
  "aicm_user_company_department_id": "uuid-or-empty",
  "aicm_user_company_section_id": "uuid-or-empty",
  "aicm_user_company_worker_placement_id": "uuid",
  "model_code": "byd1_003_asic_workers3",
  "robot_pool_id": "uuid-or-empty",
  "app_surface_code": "ai_company_manager_worker_execution",
  "task_domain_code": "design_document_creation",
  "task_title": "作業タイトル",
  "task_instruction_ja": "作業指示",
  "source_app_ref": "AICompanyManager",
  "source_request_ref": "task_ledger:<id> or manual:<timestamp>",
  "requested_by_ref": "human",
  "idempotency_key": "aicm:<source_request_ref>:<placement_id>"
}

## 5. AIWorkerOS outbound request

AICompanyManager server builds:

POST /aiworker/v1/runtime-execution/request

Headers:

- Authorization: Bearer <PERSONA_AIWORKEROS_AUTH_TOKEN>
- Content-Type: application/json
- Idempotency-Key: <idempotency_key>

Body shape:

{
  "app_surface_code": "ai_company_manager_worker_execution",
  "model_code": "<model_code>",
  "task_domain_code": "<task_domain_code>",
  "task_title": "<task_title>",
  "task_instruction_ja": "<task_instruction_ja>",
  "source_app_ref": "AICompanyManager",
  "source_request_ref": "<source_request_ref>",
  "requested_by_ref": "human",
  "idempotency_key": "<idempotency_key>"
}

## 6. AICompanyManager response

Success shape:

{
  "result": "ok",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "runtime_request": {
    "request_id": "...",
    "request_status_code": "..."
  },
  "aiworker_response": {}
}

Error shape:

{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "..."
}

## 7. Important

AICompanyManager should not decide robot behavior.
It only requests runtime execution.
AIWorkerOS resolves Runtime Control Profile.
