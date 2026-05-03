============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち/成果物確認/承認確認カードは表示OK
- ただしレビュー確認カードに戻るボタンがない
- 課新規追加の他課従業員表示は V10F2G でも未解決
- つまり section-new entry state hygiene だけでは不足

今回:
1. core/server syntax確認
2. core backup
3. レビュー確認カードに「成果物詳細へ戻る」「レビュー一覧へ戻る」を追加
4. section-new画面へ runtime-visible debug を追加
   - screen
   - selectedSectionId
   - selectedSection有無
   - currentSection有無
   - placement/worker関連state数
   - 画面内の従業員設定文言数
5. section-newで何が漏れているかを画面上に出す
6. server再起動
7. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- HTML後置換による修正
- renderSectionNew wrapによる修正
- 課新規追加の本修正は今回しない。原因特定を優先。

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3_review_back_and_v10f2h_section_new_runtime_20260503_222332
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3_review_back_and_v10f2h_section_new_runtime_20260503_222332/aicm-production-core.before_v10f3_v10f2h.js

============================================================
4. patch review back button + section-new runtime debug
============================================================
WARN: exact V10F button block not found; installing event/back compatibility only
PATCH_APPLIED: V10F back-list action handler inserted
PATCH_APPLIED: V10F2H section-new runtime visible debug installed

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. verify
============================================================
V10F3_MARKER_COUNT=1
V10F3_BACK_LIST_COUNT=1
V10F2H_MARKER_COUNT=2
V10F2H_DEBUG_DOM_ID_COUNT=2
V10F2H_NO_DB_WRITE=true
V10F2H_NO_API_POST=true
V10F2G_MARKER_COUNT=3
V10F_MARKER_COUNT=2
V10D5_MARKER_COUNT=2

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=acbed25f807cd56d5ef742ac34f00bd25f4bebf97ff03c67731093d674ec5c9b
SERVED_SHA=acbed25f807cd56d5ef742ac34f00bd25f4bebf97ff03c67731093d674ec5c9b
SERVED_V10F3_COUNT=1
SERVED_V10F2H_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10F3_BACK_BUTTON_AND_V10F2H_RUNTIME_DEBUG_READY_BROWSER_OPENED
V10F3_MARKER_COUNT=1
V10F3_BACK_LIST_COUNT=1
V10F2H_MARKER_COUNT=2
V10F2H_DEBUG_DOM_ID_COUNT=2
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F3_COUNT=1
SERVED_V10F2H_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f3_v10f2h_20260503_222332
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3_review_back_and_v10f2h_section_new_runtime_20260503_222332/000_R8Z_V10F3_REVIEW_BACK_AND_V10F2H_SECTION_NEW_RUNTIME_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3_review_back_and_v10f2h_section_new_runtime_20260503_222332/aicm-production-core.before_v10f3_v10f2h.js
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
A. レビュー確認カード
- 成果物確認 → 承認確認へ進む
- 期待:
  - 「成果物詳細へ戻る」
  - 「レビュー一覧へ戻る」

B. 課新規追加
- 課の新規追加を開く
- 赤枠の「V10F2H / 課新規追加 runtime debug」の数値を確認して貼ってください。
- 特に見る値:
  - selectedSectionId
  - selectedSection
  - currentSection
  - context.placements
  - state.placements
  - matching placements for selectedSectionId
  - DOM worker text hits
  - V10F2G cleared

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f3_review_back_and_v10f2h_section_new_runtime_20260503_222332/aicm-production-core.before_v10f3_v10f2h.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
