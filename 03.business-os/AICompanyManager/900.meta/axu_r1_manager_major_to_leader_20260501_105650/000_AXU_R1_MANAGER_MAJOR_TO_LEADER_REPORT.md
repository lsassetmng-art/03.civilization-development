# AICompanyManager Phase AXU-R1 Manager Major to Leader Handoff report

## Result
- FINAL_STATUS=MANAGER_MAJOR_TO_LEADER_HANDOFF_READY
- PASS_COUNT=29
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write in script: NO
- API POST in script: NO
- server change: NO
- core change: YES
- index change: NO

## What changed

Manager major rows now show:

- 課長へ送る

The action opens the existing DB confirmation flow and reuses:

- /api/aicm/v2/manager-major/update

Payload fields:

- assigned_leader_label
- decomposition_status_code=assigned_to_leader
- handoff_status_code=handed_off

## Important

Worker Runtime request is not created in this phase.

Correct next flow:
- Leader/課長 decomposes into middle work items
- Leader creates deliverable requirements
- Leader creates Worker work units
- Worker work unit creates Runtime request

## HTTP
- AICM_PID=6876
- AIWORKER_BASE=http://127.0.0.1:8787
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_105650_axu_r1_manager_to_leader
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/aicm-production-core.before_axu_r1_manager_to_leader.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/030_scan.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/040_aicm_server.log
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/050_http_check.txt
- DESIGN_NOTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/docs/worker-runtime/080_MANAGER_MAJOR_TO_LEADER_HANDOFF_NOTE.md

## Manual test

1. 部門別タスク台帳を開く。
2. Manager大項目の行に「課長へ送る」が出る。
3. 押す。
4. 確認画面へ遷移する。
5. 内容が manager-major/update で、assigned_to_leader / handed_off になっている。
6. 確定して保存。
7. 再読み込み後、分解状態がLeader割当済、引渡しが引渡し済になる。

## Next

AXV-PRE:
- Leader middle / deliverable / Worker work unit API/UI追加前確認

## Rollback

cp "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_r1_manager_major_to_leader_20260501_105650/aicm-production-core.before_axu_r1_manager_to_leader.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
