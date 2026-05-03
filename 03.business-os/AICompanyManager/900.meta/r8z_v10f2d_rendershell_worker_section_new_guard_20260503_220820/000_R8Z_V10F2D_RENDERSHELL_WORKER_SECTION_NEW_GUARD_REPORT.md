============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V10F確認カード OK / git checkpoint OK: 9f4f9b3
- 課新規追加で他課の従業員が表示される
- V10F2A:
  - renderSectionNew は worker/placement を直接読まない
- V10F2B:
  - worker renderer自動特定はNO_SAFE_CANDIDATEで安全停止
- V10F2C:
  - FINAL_JUDGEMENT=FIX_RENDER_SHELL_EXCLUDE_WORKER_UI_FOR_SECTION_NEW
  - renderShell に worker/従業員UIがある
  - renderShell worker call count = 1

今回:
1. core/server syntax確認
2. core backup
3. renderShell 内の worker/従業員UI関数呼び出しを1箇所だけ特定
4. その呼び出しを screen-aware guard 経由に変更
5. state.screen === "section-new" の時だけ「従業員は未設定です」カードを返す
6. section-detail / section-edit / dashboard 等は既存挙動を維持
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- HTML後置換
- renderSectionNew wrap
- selectedSectionId 退避/復元
- 台帳/レビュー/課長へ送る/削除への変更

保守性方針:
- 原因箇所 renderShell の worker UI 呼び出しだけに guard
- screen 判定は helper 化
- section-new 以外は元のworker UI関数をそのまま呼ぶ

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2d_rendershell_worker_section_new_guard_20260503_220820
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. guard against abandoned low-maint patches
============================================================
LOW_MAINT_V10F2_COUNT=0
PARTIAL_V10F2B_COUNT=0
V10F2D_EXISTING_COUNT=0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2d_rendershell_worker_section_new_guard_20260503_220820/aicm-production-core.before_r8z_v10f2d.js

============================================================
5. patch renderShell worker call with section-new guard
============================================================
