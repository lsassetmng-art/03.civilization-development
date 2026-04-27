# AIWorkerOS local endpoint smoke summary

## Created

Local HTTP endpoint was created for AIWorkerOS live call testing.

## Base URL

export PERSONA_AIWORKEROS_BASE_URL="http://127.0.0.1:8787"

## Auth token

export PERSONA_AIWORKEROS_AUTH_TOKEN="local-aiworkeros-smoke-token"

## Endpoint

POST $PERSONA_AIWORKEROS_BASE_URL/aicm/v1/workflow-start/live-aiworkeros-call

## Smoke results

- health: 200
- valid request: 202
- duplicate idempotency request: 202
- missing auth: 401
- idempotency conflict: 409

## Safety

- DB write: not executed
- psql: not executed
- RLS apply: not executed
- destructive action: not executed
- external unapproved service call: not executed

## Runtime

- server pid: 17503
- stop command: kill $(cat "/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/live-aiworkeros-call/runtime/server.pid")
- env file: /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/live-aiworkeros-call/.env.local
