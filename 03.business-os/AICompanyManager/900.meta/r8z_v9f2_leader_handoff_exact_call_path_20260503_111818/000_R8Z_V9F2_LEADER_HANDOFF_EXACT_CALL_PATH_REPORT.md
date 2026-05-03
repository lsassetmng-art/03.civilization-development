============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 課長へ送るボタン/action/state/cardは静的には存在
- しかしクリックで確認カードが出ない
- よって「追加」ではなく、既存経路のどこで切れているかを見る

今回:
1. syntax確認
2. served core一致確認
3. pmlw-major-leader-handoff の exact handler を抽出
4. state.managerMajorLeaderHandoffConfirm の代入箇所を抽出
5. 代入後に render() があるか確認
6. 確認カード描画関数が task-ledger に差し込まれているか確認
7. 次の最小修正方針を判定

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F2 leader handoff exact call path isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f2_leader_handoff_exact_call_path_20260503_111818
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core check
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=64e6ba6bcdc72a001229916bdd848ea723f59f063ed8aa3deafd6285503f520a
SERVED_SHA=64e6ba6bcdc72a001229916bdd848ea723f59f063ed8aa3deafd6285503f520a
PASS: served core matches disk

============================================================
4. exact call path extraction
============================================================
EXTRACT_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f2_leader_handoff_exact_call_path_20260503_111818/020_exact_call_path_extract.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f2_leader_handoff_exact_call_path_20260503_111818/030_classification.txt

============================================================
5. classification
============================================================
ACTION_HIT_COUNT=9
STATE_ASSIGN_HIT_COUNT=3
CONFIRM_TITLE_HIT_COUNT=4
HAS_OPEN_CONFIRM_FUNCTION=false
OPEN_CONFIRM_ASSIGNS_STATE=false
OPEN_CONFIRM_CALLS_RENDER=false
HAS_CONFIRM_CARD_RENDERER=false
TASK_LEDGER_CALLS_CONFIRM_CARD=false
MANAGER_ROWS_BUTTON_HAS_ACTION=true
MANAGER_ROWS_BUTTON_HAS_MAJOR_ID=true

SUGGESTED_NEXT=
RESTORE_OPEN_CONFIRM_FUNCTION_ONLY

============================================================
DONE
============================================================
ACTION_HIT_COUNT=9
STATE_ASSIGN_HIT_COUNT=3
CONFIRM_TITLE_HIT_COUNT=4
HAS_OPEN_CONFIRM_FUNCTION=false
OPEN_CONFIRM_ASSIGNS_STATE=false
OPEN_CONFIRM_CALLS_RENDER=false
HAS_CONFIRM_CARD_RENDERER=false
TASK_LEDGER_CALLS_CONFIRM_CARD=false
MANAGER_ROWS_BUTTON_HAS_ACTION=true
MANAGER_ROWS_BUTTON_HAS_MAJOR_ID=true

SUGGESTED_NEXT=
RESTORE_OPEN_CONFIRM_FUNCTION_ONLY
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f2_leader_handoff_exact_call_path_20260503_111818/000_R8Z_V9F2_LEADER_HANDOFF_EXACT_CALL_PATH_REPORT.md
EXTRACT_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f2_leader_handoff_exact_call_path_20260503_111818/020_exact_call_path_extract.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO
