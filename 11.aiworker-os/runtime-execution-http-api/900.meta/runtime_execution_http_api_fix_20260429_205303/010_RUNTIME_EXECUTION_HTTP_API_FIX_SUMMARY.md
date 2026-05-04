# AIWORKER RUNTIME EXECUTION HTTP API FIX SUMMARY

## Fixed

Rewrote server.js psql execution wrapper.

Previous issue:

- SQL was passed with psql -c.
- psql variables like :'app_surface_code' were not substituted.
- PostgreSQL received raw colon syntax and returned syntax error.

Fix:

- SQL is now passed to psql through stdin.
- psql variables are substituted before PostgreSQL receives SQL.

## curl smoke

- health=200
- noauth=401
- contract=200
- endpoint_ready=200
- persistent_smoke=200
- post_request=201
- app_read_payload=200
- pipeline_board=200
- delivery=200

## Created or reused request

- request_id: be00a954-c34c-4893-9bec-65aa6d6f87da
- idempotency_key: runtime-execution-http-api-fix-smoke-v1

## Safety

- external API execution: not performed
- PG apply: not performed
- destructive action: not performed

## Report

- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/900.meta/runtime_execution_http_api_fix_20260429_205303/000_runtime_execution_http_api_fix_report.txt
