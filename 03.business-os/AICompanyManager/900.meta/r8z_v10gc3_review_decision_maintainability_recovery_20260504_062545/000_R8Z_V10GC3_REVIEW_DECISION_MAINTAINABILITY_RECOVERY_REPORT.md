============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 成果物レビュー 承認 / 差し戻し

現在位置:
- V10GC2Kで原因確定
- 確認カード生成元に disabled 固定の実行ボタンがある
- V10GC2系は wrapper / prime / debug / fallback が重なり保守性が低い
- server側の既存route / 関数は使える
  - /api/aicm/v2/human-review/approve
  - /api/aicm/v2/human-review/return

今回:
1. core/server syntax確認
2. core backup
3. V10GC2系の後付け補正ブロックを撤去
4. 確認カード生成元のbuttonを直接修正
5. 実行handlerをV10GC3の1本に統一
6. payloadはserver要求keyに合わせる
   - aicm_human_review_item_id
   - owner_civilization_id
   - human_reviewer_label
   - human_review_note
7. owner_civilization_idはreview rowからdata属性で渡す
8. hardcoded owner fallbackは使わない
9. server patchなし
10. ブラウザ起動

禁止:
- DB write during script
- API POST during script
- server patch
- 確認画面なしPOST
- 追加wrapper連打
- MutationObserver / 常時interval / debug残置
- hardcoded owner fallback

注意:
- 画面で「承認を実行する」を押すと本当にDB更新します。
- まず1件だけ実行してください。

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3_review_decision_maintainability_recovery_20260504_062545
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3_review_decision_maintainability_recovery_20260504_062545/aicm-production-core.before_v10gc3.js

============================================================
4. patch core maintainability recovery
============================================================
