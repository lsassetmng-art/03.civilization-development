============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー一覧にも、ダッシュボード画像と同系統の画面ナビが必要
- V10F2KのDOM除去ガードはダッシュボードに誤表示しており撤去対象
- 新規課の従業員表示はDOM削除ではなく、従業員設定renderer本体で section-new を除外する

今回:
1. core/server syntax確認
2. core backup
3. V10F2H/I/J/K のdebug/DOM除去系ブロックを撤去
4. V10F3B/C/D の戻る系ナビを撤去
5. レビュー一覧に共通ナビを追加
6. 従業員設定renderer本体を一意特定できる場合のみ、section-new guardを追加
7. server再起動
8. 成功したら画面起動

禁止:
- DB write
- API POST
- server patch
- dashboardへの従業員未設定カード表示
- DOM後処理での本修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f4a_review_nav_and_section_worker_source_guard_20260503_225117
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f4a_review_nav_and_section_worker_source_guard_20260503_225117/aicm-production-core.before_v10f4a.js

============================================================
4. patch core
============================================================
PATCH_APPLIED: common nav helper installed for review-list
PATCH_APPLIED: section-new guard inserted into renderAicmWorkerInlineRows
REMOVED_AICM_R8Z_V10F2H_SECTION_NEW_RUNTIME_VISIBLE_DEBUG=true
REMOVED_AICM_R8Z_V10F2I_WORKER_LEAK_ALWAYS_VISIBLE_DEBUG=true
REMOVED_AICM_R8Z_V10F2J_WORKER_LEAK_DOM_SOURCE_DEBUG=true
REMOVED_AICM_R8Z_V10F2K_SECTION_ADD_WORKER_BLOCK_GUARD=true
REMOVED_AICM_R8Z_V10F3B_REVIEW_LIST_TOP_BACK_BUTTON=true
REMOVED_AICM_R8Z_V10F3C_REVIEW_LIST_BACK_SIMPLE_DASHBOARD=true
REMOVED_AICM_R8Z_V10F3D_REVIEW_LIST_BACK_SINGLE_DASHBOARD=true
WORKER_RENDERER_CANDIDATE_COUNT=2
WORKER_RENDERER_CANDIDATES_BEGIN
name=renderAicmWorkerInlineRows	line=2372	length=1833	score=140	safe=true
name=aicmInjectInlineRoleSettingsForAddScreens	line=2451	length=1118	score=100	safe=false
WORKER_RENDERER_CANDIDATES_END
SAFE_WORKER_RENDERER_COUNT=1
WORKER_GUARD_PATCHED=true
WORKER_GUARD_FUNCTION=renderAicmWorkerInlineRows
WORKER_GUARD_LINE=2372

============================================================
5. syntax postcheck
============================================================
PASS: core syntax PASS after patch

============================================================
6. verify
============================================================
OLD_V10F2H_COUNT=0
OLD_V10F2I_COUNT=0
OLD_V10F2J_COUNT=0
OLD_V10F2K_COUNT=0
OLD_V10F3B_COUNT=0
OLD_V10F3C_COUNT=0
OLD_V10F3D_COUNT=0
V10F4A_MARKER_COUNT=3
V10F4A_NAV_ID_COUNT=2
V10F4A_WORKER_GUARD_COUNT=1
V10F4A_REVIEW_NAV_BUTTONS=10
V10F4A_NO_DB_WRITE=true
V10F4A_NO_API_POST=true

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=1e6a80cd00d897bee7c0bf7e090ab153651ab76128d6419f3f46e70fb393400c
SERVED_SHA=1e6a80cd00d897bee7c0bf7e090ab153651ab76128d6419f3f46e70fb393400c
SERVED_V10F4A_COUNT=3
SERVED_OLD_V10F2K_COUNT=0

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10F4A_NAV_READY_AND_SECTION_WORKER_SOURCE_GUARD_PATCHED_BROWSER_OPENED
OLD_V10F2H_COUNT=0
OLD_V10F2I_COUNT=0
OLD_V10F2J_COUNT=0
OLD_V10F2K_COUNT=0
OLD_V10F3B_COUNT=0
OLD_V10F3C_COUNT=0
OLD_V10F3D_COUNT=0
V10F4A_MARKER_COUNT=3
V10F4A_NAV_ID_COUNT=2
V10F4A_WORKER_GUARD_COUNT=1
V10F4A_REVIEW_NAV_BUTTONS=10
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10F4A_COUNT=3
SERVED_OLD_V10F2K_COUNT=0
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10f4a_20260503_225117
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f4a_review_nav_and_section_worker_source_guard_20260503_225117/000_R8Z_V10F4A_REVIEW_NAV_AND_SECTION_WORKER_SOURCE_GUARD_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f4a_review_nav_and_section_worker_source_guard_20260503_225117/aicm-production-core.before_v10f4a.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f4a_review_nav_and_section_worker_source_guard_20260503_225117/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

BROWSER_CHECK:
1. ダッシュボードに「V10F2K / 課追加の従業員設定」が出ない
2. レビュー一覧にも「AI企業運営アプリ」の共通ナビが出る
3. 新規課で従業員設定ロボットが出ない
4. 既存課詳細/課変更では従業員設定が残る

If worker guard not patched:
- PATCH_ANALYSIS の SAFE_WORKER_RENDERER_COUNT / WORKER_RENDERER_CANDIDATES を貼る

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f4a_review_nav_and_section_worker_source_guard_20260503_225117/aicm-production-core.before_v10f4a.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
