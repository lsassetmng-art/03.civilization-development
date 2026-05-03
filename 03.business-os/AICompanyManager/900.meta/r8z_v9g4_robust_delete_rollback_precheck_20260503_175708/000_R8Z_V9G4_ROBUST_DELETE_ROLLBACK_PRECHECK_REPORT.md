============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 削除確認カードは表示OK
- view/base ID対応は正常
- 前回rollback precheckは集計ズレの疑い

今回:
1. syntax確認
2. UI/view基準で削除候補を1件選ぶ
3. 同一IDをbase tableでROLLBACK内archive更新
4. update count / rollback後残存mark / pending件数をTSVで堅く確認
5. passなら画面を開き、UI削除確定へ進む

禁止:
- 永続DB write
- API POST
- PATCH

注意:
- このワンブロック自体はROLLBACKのみ
- 画面で削除確定を押すと実POST/DB更新になる

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g4_robust_delete_rollback_precheck_20260503_175708
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. robust rollback SQL
============================================================
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g4_robust_delete_rollback_precheck_20260503_175708/010_robust_delete_rollback.tsv
SQL_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g4_robust_delete_rollback_precheck_20260503_175708/011_robust_delete_rollback.err
---- SQL_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
BEGIN
VIEW_TOTAL_COUNT	38
VIEW_UI_PENDING_COUNT	34
TARGET_ID	436b26b8-ea94-47d3-847e-69ba7d8e646c
TARGET_TITLE	開発案件全体ロードマップの整備
ROLLBACK_UPDATE_COUNT	1
UPDATED_ID	436b26b8-ea94-47d3-847e-69ba7d8e646c
UPDATED_TITLE	開発案件全体ロードマップの整備
ROLLBACK
PERSISTENT_PROBE_MARK_COUNT	0
VIEW_UI_PENDING_AFTER_ROLLBACK	34

============================================================
4. server reachability
============================================================
ROOT_HTTP=200

============================================================
5. final
============================================================
FINAL_JUDGEMENT=ROBUST_DELETE_ROLLBACK_PASS_READY_FOR_UI_EXECUTE
VIEW_TOTAL_COUNT=38
VIEW_UI_PENDING_COUNT=34
TARGET_ID=436b26b8-ea94-47d3-847e-69ba7d8e646c
TARGET_TITLE=開発案件全体ロードマップの整備
ROLLBACK_UPDATE_COUNT=1
UPDATED_ID=436b26b8-ea94-47d3-847e-69ba7d8e646c
PERSISTENT_PROBE_MARK_COUNT=0
VIEW_UI_PENDING_AFTER=34
ROOT_HTTP=200
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9g4_20260503_175708
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g4_robust_delete_rollback_precheck_20260503_175708/000_R8Z_V9G4_ROBUST_DELETE_ROLLBACK_PRECHECK_REPORT.md
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. 削除確認カードを出す
3. 削除確定ボタンを押す

期待:
- 実POSTされる
- 対象Manager大項目が archived 扱いになる
- 台帳から1件消える
