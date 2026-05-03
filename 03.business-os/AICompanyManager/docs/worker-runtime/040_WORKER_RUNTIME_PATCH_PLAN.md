# AICompanyManager Worker Runtime Patch Plan

status: ready-for-next
scope: implementation plan
owner: Boss
prepared_by: Zero

## Phase AXS: server endpoint add

Add to server/aicm-local-ui-api-server.mjs:

- function createWorkerRuntimeRequest(body)
- POST /api/aicm/v2/worker-runtime/request

Rules:

- existing readBody / sendJson / safePublicError pattern
- no new pg Pool
- no DB helper
- no index.html change
- no secret exposure to UI
- use global fetch available in Node v24
- require PERSONA_AIWORKEROS_BASE_URL
- require PERSONA_AIWORKEROS_AUTH_TOKEN

## Phase AXT: UI screen add

Add to clean core:

- screen: worker-runtime-request
- renderWorkerRuntimeRequest()
- renderWorkerRuntimeConfirm()
- executeWorkerRuntimeConfirm()

Rules:

- confirmation required
- no direct POST from input screen
- use existing renderShell
- use existing requestJson/aicmOrgPostJson style
- no script tag add
- no wrapper/bridge/debug HTML postprocess

## Phase AXU: read payload display

Add read-only display:

- GET app-read-payload through AICompanyManager server or direct safe read route
- show request status
- show gates
- show handoff packets
- show outputs/artifacts

## Phase AXV: task ledger binding

Connect from:

- task ledger row
- PMLW major row
- selected section Worker

Store request_id later only after DB design confirmation.
For first smoke, display request_id only.

## First implementation recommendation

Start with AXS server endpoint only, no UI write.
Then test by curl to local endpoint with dummy manual source.
