# Runtime POST Read-only Root Cause Summary

## Confirmed

- R14 reached request creation.
- DB function attempted INSERT into aiworker.runtime_execution_request.
- INSERT failed because transaction was read-only.
- This is now a server/runtime DB session write-mode issue, not a payload required-field issue.

## DB session audit key lines

```
2:      section      | transaction_read_only | default_transaction_read_only | database_name | db_user  
4: 01_readonly_guard | on                    | on                            | postgres      | postgres
7:     section      | schema_name |                   function_name                   |                                                                                                                      args                                                                                                                       | volatility | security_definer 
9: 02_function_kind | aiworker    | fn_runtime_execution_create_request               | p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text, p_source_request_ref text, p_requested_by_ref text, p_idempotency_key text                           | volatile   | f
10: 02_function_kind | aiworker    | fn_runtime_execution_create_request_with_route_v1 | p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text, p_source_request_ref text, p_requested_by_ref text, p_idempotency_key text, p_source_route_code text | volatile   | t
11: 02_function_kind | aiworker    | fn_runtime_execution_start_request                | p_request_id uuid                                                                                                                                                                                                                               | volatile   | f
12: 02_function_kind | aiworker    | fn_runtime_execution_submit_worker_output         | p_request_id uuid, p_output_title_ja text, p_output_body_ja text, p_output_summary_ja text, p_output_payload_jsonb jsonb, p_artifacts_jsonb jsonb                                                                                               | volatile   | f
17: 03_function_definition_readonly_relevant_lines | aiworker    | fn_runtime_execution_create_request               | CREATE OR REPLACE FUNCTION aiworker.fn_runtime_execution_create_request(p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text DEFAULT ''::text, p_source_request_ref text DEFAULT ''::text, p_requested_by_ref text DEFAULT 'human'::text, p_idempotency_key text DEFAULT NULL::text)                                                           +
257: 03_function_definition_readonly_relevant_lines | aiworker    | fn_runtime_execution_create_request_with_route_v1 | CREATE OR REPLACE FUNCTION aiworker.fn_runtime_execution_create_request_with_route_v1(p_app_surface_code text, p_model_code text, p_task_domain_code text, p_task_title text, p_task_instruction_ja text, p_source_app_ref text DEFAULT ''::text, p_source_request_ref text DEFAULT ''::text, p_requested_by_ref text DEFAULT 'human'::text, p_idempotency_key text DEFAULT NULL::text, p_source_route_code text DEFAULT NULL::text)+
266:                                                |             |                                                   |   v_request_id := aiworker.fn_runtime_execution_create_request(                                                                                                                                                                                                                                                                                                                                                                     +
```

## Server/source audit key lines

```
14:/aiworker/v1/runtime-execution/request
26:  978:     "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
44: 1175:     if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
57:SERVER_HAS_READONLY_TEXT=NO
58:BRIDGE_HAS_READONLY_TEXT=NO
59:REQUEST_ROUTE_CALLS_CREATE_FUNCTION=YES
60:DIAGNOSIS=REQUEST_ROUTE_REACHES_DB_CREATE_BUT_SESSION_READONLY_FROM_ENV_OR_POOL
```

## Process env shape key lines

```
This section masks values and only checks whether likely read-only env names exist.
SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
RUNTIME_SERVER_PROCESS=FOUND
--- PID 11659 ---
AIWORKEROS_BASE_URL=***MASKED***
PERSONA_AIWORKEROS_AUTH_TOKEN=***MASKED***
PERSONA_AIWORKEROS_BASE_URL=***MASKED***
PERSONA_AIWORKEROS_HOST=***MASKED***
PERSONA_AIWORKEROS_PORT=***MASKED***
```

## Next

R17 should choose one of these:

1. If server/source explicitly sets read-only for all DB calls:
   - patch only the write route /runtime-execution/request to use read-write mode.

2. If no source read-only text exists:
   - inspect DB URL/env/pool configuration shape.
   - server may be connecting through a read-only session setting.

3. Do not retry POST until write-mode cause is fixed.
