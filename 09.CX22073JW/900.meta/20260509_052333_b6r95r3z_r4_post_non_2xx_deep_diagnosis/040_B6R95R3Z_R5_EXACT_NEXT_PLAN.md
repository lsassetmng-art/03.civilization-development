# B6R95R3Z-R5 Exact Next Plan

## R4で見ること

- R3 POSTの HTTP_STATUS
- ERROR_CODE
- MESSAGE
- selected route handler が request作成専用か
- handler上の要求body key
- payloadに不足しているkey
- execute/run/zip route候補

## 分岐

### NEXT_RECOMMENDATION=PAYLOAD_MISSING_FIELDS
R5:
- 不足fieldだけを追加した最小payloadで再POST
- routeは同じ /aiworker/v1/runtime-execution/request

### NEXT_RECOMMENDATION=REQUEST_CREATE_ONLY_USE_EXECUTE_ROUTE
R5:
- request作成routeではなく execute/run/workflow route を使う
- もしくは request作成 -> returned request_id -> execute の二段階にする

### NEXT_RECOMMENDATION=USE_DIFFERENT_ROUTE
R5:
- /aiworker/v1/runtime-execution/request は違う
- route候補から live-aiworkeros-call / workflow-start / execute / run を選ぶ

### NEXT_RECOMMENDATION=SERVER_LOG_ERROR_DIAGNOSIS
R5:
- server log stack/error line を基に最小修正案を出す
- patchが必要なら明示確認を分ける

## 禁止

- R4ではPOSTしない
- R4ではpatchしない
- R4ではDB writeしない
- AICMに触らない
