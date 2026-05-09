# B6R95R3Z-R2 Next Route Plan

## 現在の推定

B6R95R3Z は /aiworker/v1/runtime-execution/request を選択したが、
このrouteは「request作成」までで、成果物生成/zip作成まで実行しない可能性が高い。

## 重要

EXISTING_ZIP が B6R95R3J の古いzipだった場合、
今回のE2E PASSとは扱わない。

## 次に進む条件

### REQUEST_ROUTE_ACCEPTED_BUT_DID_NOT_EXECUTE_ZIP の場合

B6R95R3Z-R2:
- server.jsから実行系routeを特定する
- 候補:
  - workflow-start
  - live-aiworkeros-call
  - execute
  - run
  - worker runtime pipeline
- request create routeではなく、成果物生成まで行くrouteへPOSTする
- または request_id 作成後に execute route をPOSTする二段階テストにする

### POST_STATUS_NOT_2XX の場合

B6R95R3Z-R2:
- response bodyの error_code/message に合わせてpayloadを修正
- まだpatchしない

### 現在runのzipが既にある場合

B6R95R3Z-R2:
- response linkが返らないだけか確認
- zip生成契約のresponse mappingを診断
