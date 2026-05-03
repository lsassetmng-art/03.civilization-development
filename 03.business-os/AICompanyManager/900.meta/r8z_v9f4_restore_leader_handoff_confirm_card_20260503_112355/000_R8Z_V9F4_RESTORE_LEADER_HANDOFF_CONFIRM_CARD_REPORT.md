============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V9F3で aicmOpenLeaderHandoffConfirmR8S は復旧済み
- しかし画面で「課長へ送る確認」カードが出ない
- 静的確認ではカードrenderer/task-ledger差し込みが欠けていた
- レビュー待ち修正はいったん停止

今回:
1. core/server syntax確認
2. core backup
3. 確認カードrendererを復旧
4. task-ledger画面へ確認カードを局所差し込み
5. data-core-action="pmlw-major-leader-handoff" 専用click bridgeを追加
6. server再起動
7. 成功したら画面自動起動

禁止:
- DB write
- API POST
- server patch
- レビュー待ち側の追加変更
- render関数全体置換

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F4 restore leader handoff confirm card display only
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4_restore_leader_handoff_confirm_card_20260503_112355
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
SUCCESS_BROWSER_OPEN=YES

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4_restore_leader_handoff_confirm_card_20260503_112355/aicm-production-core.before_r8z_v9f4.js

============================================================
4. patch confirm card/display only
============================================================
PATCH_APPLIED: confirm card renderer + task-ledger injection + exact action click bridge\n
============================================================
5. syntax postcheck
============================================================
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js:4800
\n// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_START
^

SyntaxError: Invalid or unexpected token
    at wrapSafe (node:internal/modules/cjs/loader:1743:18)
    at checkSyntax (node:internal/main/check_syntax:76:3)

Node.js v24.14.1
FAIL: core syntax failed; rollback
FINAL_JUDGEMENT=CORE_PATCH_SYNTAX_FAILED_ROLLED_BACK
logout
