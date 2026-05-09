# B6R95R3Z-R3 Plan

## R2の目的

POST non-2xx の正体を確定する。

## 分岐

### PAYLOAD_VALIDATION_FAILED
R3では既存routeの期待payloadに合わせて再POSTする。
payload互換候補:
- request_id
- model_code
- purpose_code / use_purpose_code
- task_instruction_ja / instruction_ja
- input_json / request_payload / payload
- requester metadata
- zip_required_flag / return_zip_link_flag

### ROUTE_NOT_FOUND_OR_WRONG_ROUTE
R3では /aiworker/v1/runtime-execution/request を使わず、server.js上の実行routeを使う。
候補:
- workflow-start
- live-aiworkeros-call
- execute
- run

### REQUEST_CREATE_ONLY
R3では二段階:
1. request作成
2. returned request_id を execute/run route に渡す

### SERVER_INTERNAL_ERROR
R3では server log の stack/error_code をもとに最小修正またはpayload修正。
patchが必要な場合は、その前に別途確認。

## 禁止

- まだpatchしない
- まだgit pushしない
- AICMに触らない
