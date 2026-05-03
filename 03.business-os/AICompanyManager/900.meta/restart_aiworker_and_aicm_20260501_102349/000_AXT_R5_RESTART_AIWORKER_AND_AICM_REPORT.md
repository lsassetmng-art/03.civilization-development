# AICompanyManager Phase AXT-R5 restart AIWorkerOS + AICM

## Result
- FINAL_STATUS=AIWORKER_AND_AICM_RESTARTED_READY
- PASS_COUNT=12
- WARN_COUNT=2
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- patch: NO

## AIWorkerOS
- AIWORKER_SERVER_FILE=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api/server.js
- AIWORKER_PID=20761
- AIWORKER_BASE=http://127.0.0.1:8787
- HEALTH_CODE=200
- READY_CODE=401
- CONTRACT_CODE=401
- LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_aiworker_and_aicm_20260501_102349/020_aiworker_runtime_server.log

## AICompanyManager
- AICM_PID=20780
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_CODE=200
- CORE_CODE=200
- CONTEXT_CODE=200
- LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_aiworker_and_aicm_20260501_102349/030_aicm_server.log

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_102349_runtime_restart
- TERMUX_OPEN_STATUS=OPENED

## Next manual test
1. AI実行Workbenchを開く
2. 入力する
3. 確認へ進む
4. 確定して実行
5. fetch failed が消えるか確認

## If still fails
- tail -n 220 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_aiworker_and_aicm_20260501_102349/020_aiworker_runtime_server.log"
- tail -n 220 "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restart_aiworker_and_aicm_20260501_102349/030_aicm_server.log"
