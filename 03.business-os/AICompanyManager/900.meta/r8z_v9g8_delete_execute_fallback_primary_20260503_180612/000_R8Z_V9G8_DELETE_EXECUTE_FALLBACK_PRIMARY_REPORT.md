============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 削除確認カード: OK
- 削除確定: NG
- 原因追及:
  - 旧execute関数は存在
  - 旧executeはAPIも持つ
  - ただしV9G5が旧executeを先に呼んでreturnしている
  - そのためV9G5 fallbackの manager-major/update に到達しない可能性が高い

今回:
1. core/server syntax確認
2. core backup
3. V9G5 execute関数の中だけ修正
4. 旧execute優先呼び出しを停止
5. V9G5 fallbackの /api/aicm/v2/manager-major/update を正本実行にする
6. 旧execute関数本体は削除しない
7. server再起動
8. 成功したら画面自動起動

禁止:
- patch実行中のDB write
- patch実行中のAPI POST
- server patch
- 旧execute関数の削除
- render関数全体置換
- レビュー待ち側の追加変更

注意:
- 画面で削除確定を押すと実POST/DB更新されます。

============================================================
1. ENV
============================================================
PHASE=R8Z-V9G8 delete execute fallback-primary fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8_delete_execute_fallback_primary_20260503_180612
DB_WRITE=NO_DURING_PATCH
API_POST=NO_DURING_PATCH
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g8_delete_execute_fallback_primary_20260503_180612/aicm-production-core.before_r8z_v9g8.js

============================================================
4. patch V9G5 fallback primary
============================================================
PATCH_APPLIED: V9G5 legacy execute priority disabled

============================================================
5. syntax postcheck
============================================================
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js:6690
    }
    ^

SyntaxError: Missing catch or finally after try
    at wrapSafe (node:internal/modules/cjs/loader:1743:18)
    at checkSyntax (node:internal/main/check_syntax:76:3)

Node.js v24.14.1
FAIL: core syntax failed; rollback
FINAL_JUDGEMENT=CORE_PATCH_SYNTAX_FAILED_ROLLED_BACK
logout
