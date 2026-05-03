============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V10F確認カード OK / git checkpoint OK: 9f4f9b3
- 課新規追加画面で他課の従業員が漏れる
- V10F2A exact call path:
  - renderSectionNew found
  - renderSectionNew itself does not read selectedSection / placements
  - worker renderer側が state を読んで漏れている
  - FINAL_JUDGEMENT=FIX_WORKER_RENDERER_ADD_MODE_NEW_EMPTY_DRAFT

今回:
1. core/server syntax確認
2. core backup
3. renderSectionNew が呼ぶ worker renderer を特定
4. worker renderer に mode="new" を受ける小さい分岐を追加
5. renderSectionNew から worker renderer へ { aicmSectionWorkerMode: "new", rows: [] } を渡す
6. section-new では既存DB/context placementsを読まず、未設定カードを表示
7. section-edit/detail は既存挙動を維持
8. server再起動
9. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- HTML文字列の後置換
- renderSectionNew外側wrap
- selectedSectionId一時退避/復元
- 台帳/レビュー/課長へ送る/削除への変更

保守性方針:
- 修正点は「共通worker rendererのmode分岐」と「section-new callsite」だけ
- mode=new のときだけ空draft表示
- edit/detail mode は既存のstate/placements読込を維持

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2b_section_new_worker_renderer_mode_fix_20260503_215356
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. guard against old low-maint patch
============================================================
LOW_MAINT_V10F2_COUNT=0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2b_section_new_worker_renderer_mode_fix_20260503_215356/aicm-production-core.before_r8z_v10f2b.js

============================================================
5. patch worker renderer mode=new
============================================================
