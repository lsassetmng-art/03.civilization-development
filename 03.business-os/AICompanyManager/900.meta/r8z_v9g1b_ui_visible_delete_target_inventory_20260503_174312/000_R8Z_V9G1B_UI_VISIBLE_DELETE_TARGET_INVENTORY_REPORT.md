============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 画面上は未処理大項目が30件以上ある
- 前回precheckは削除対象0件と出た
- よって前回のDB対象条件/対象sourceがUIとズレている

今回:
1. context API の pmlw_major_items 件数を確認
2. view: business.vw_aicm_pmlw_major_work_display の件数を確認
3. base table: business.aicm_manager_major_work_item の件数を確認
4. company_id別にどこに30件以上あるか特定
5. UIで削除ボタンが出る候補IDを抽出

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. context API inventory
============================================================
CONTEXT_HTTP=200
CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312/020_context.json
CONTEXT_RESULT=ok
CONTEXT_PMLW_MAJOR_TOTAL=38
CONTEXT_TARGET_COMPANY_MAJOR_COUNT=38
CONTEXT_TARGET_COMPANY_UI_PENDING_COUNT=34

CONTEXT_COMPANY_COUNTS
38	8b9be487-7b74-4517-9b59-6c84a82ae6aa|ウルフ

CONTEXT_TARGET_FIRST_10
86457c2c-4078-4efc-9109-28fa45b78ab4	ウルフ	AI企業業務開始導線の整備	decomposed	completed
eab18cda-a3e2-4dc7-8d0c-7068fdc980f4	ウルフ	Manager大項目台帳運用の整備	decomposed	completed
002ef7b8-3f5d-49e5-90e6-49235f99ee86	ウルフ	Leader引き継ぎ方針の整備	decomposed	completed
436b26b8-ea94-47d3-847e-69ba7d8e646c	ウルフ	開発案件全体ロードマップの整備	not_started	draft
1f5c787f-3f9d-4571-9a62-ae258b6e8cb4	ウルフ	主要画面構成の整理	not_started	draft
f2240a10-b712-4af4-a3a7-a11df53a9bf6	ウルフ	部門別タスク台帳画面の整備	not_started	draft
f2badab8-43df-49cf-8400-022430bf22d5	ウルフ	ロボット配置表示の整備	not_started	draft
9cbd039f-d44c-4c96-9be0-8d057d2966ad	ウルフ	引き継ぎ前確認画面の整備	not_started	draft
eb5019b3-70b0-45ce-a5a5-34a001366674	ウルフ	レビュー承認待ち一覧の整備	not_started	draft
49cb5824-fa59-4dc7-9919-28a09b851f6a	ウルフ	President方針受領API領域の整備	not_started	draft

============================================================
3. DB/view inventory
============================================================
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312/010_ui_visible_delete_target_inventory.tsv
SQL_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312/011_ui_visible_delete_target_inventory.err
---- SQL_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
VIEW_COMPANY_COUNTS	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	38
VIEW_TARGET_STATUS_COUNTS	not_started	draft	34
VIEW_TARGET_STATUS_COUNTS	decomposed	completed	3
VIEW_TARGET_STATUS_COUNTS	archived	archived	1
VIEW_TARGET_FIRST_20	86457c2c-4078-4efc-9109-28fa45b78ab4	ウルフ	AI企業業務開始導線の整備	decomposed	completed
VIEW_TARGET_FIRST_20	eab18cda-a3e2-4dc7-8d0c-7068fdc980f4	ウルフ	Manager大項目台帳運用の整備	decomposed	completed
VIEW_TARGET_FIRST_20	002ef7b8-3f5d-49e5-90e6-49235f99ee86	ウルフ	Leader引き継ぎ方針の整備	decomposed	completed
VIEW_TARGET_FIRST_20	436b26b8-ea94-47d3-847e-69ba7d8e646c	ウルフ	開発案件全体ロードマップの整備	not_started	draft
VIEW_TARGET_FIRST_20	1f5c787f-3f9d-4571-9a62-ae258b6e8cb4	ウルフ	主要画面構成の整理	not_started	draft
VIEW_TARGET_FIRST_20	f2240a10-b712-4af4-a3a7-a11df53a9bf6	ウルフ	部門別タスク台帳画面の整備	not_started	draft
VIEW_TARGET_FIRST_20	f2badab8-43df-49cf-8400-022430bf22d5	ウルフ	ロボット配置表示の整備	not_started	draft
VIEW_TARGET_FIRST_20	9cbd039f-d44c-4c96-9be0-8d057d2966ad	ウルフ	引き継ぎ前確認画面の整備	not_started	draft
VIEW_TARGET_FIRST_20	eb5019b3-70b0-45ce-a5a5-34a001366674	ウルフ	レビュー承認待ち一覧の整備	not_started	draft
VIEW_TARGET_FIRST_20	49cb5824-fa59-4dc7-9919-28a09b851f6a	ウルフ	President方針受領API領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	d5415e3c-54e4-4f87-90c3-aaa31cebd7bb	ウルフ	Manager大項目登録API領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	9b585672-b3df-4cf8-8151-7ec9ed0f3abb	ウルフ	Leader引き継ぎAPI領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	0353be4e-be2b-49fe-a51b-14de73654c5a	ウルフ	ロボット参照API領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	a22c789e-b255-4379-84cf-cb92a38b3a50	ウルフ	AI企業基本データ領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	d6948313-6a0c-4bc9-8091-22ce18b1c5af	ウルフ	Manager大項目データ領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	a71aae34-f997-4ac9-ab39-1185e02f7e7d	ウルフ	Leader分解結果データ領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	5b6a423b-6dd6-4043-a48f-bd5a241f275f	ウルフ	成果物参照データ領域の整備	not_started	draft
VIEW_TARGET_FIRST_20	b96ffef0-6952-416a-ae15-906d6b79c1a8	ウルフ	PresidentからManagerへの業務変換整備	not_started	draft
VIEW_TARGET_FIRST_20	0ca95f87-556c-469a-b113-3e32dd1a86b3	ウルフ	ManagerからLeaderへの配布整備	not_started	draft
VIEW_TARGET_FIRST_20	fe3223c2-2f27-4330-901d-65110a550369	ウルフ	LeaderからWorkerへの作業化整備	not_started	draft
BASE_COMPANY_COUNTS	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	38
BASE_TARGET_STATUS_COUNTS	not_started	draft	34
BASE_TARGET_STATUS_COUNTS	decomposed	completed	3
BASE_TARGET_STATUS_COUNTS	archived	archived	1

============================================================
4. final
============================================================
CONTEXT_TOTAL=38
CONTEXT_TARGET_COUNT=38
CONTEXT_TARGET_PENDING=34
FINAL_JUDGEMENT=UI_VISIBLE_DELETE_TARGET_EXISTS_USE_CONTEXT_VIEW_TARGET
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312/000_R8Z_V9G1B_UI_VISIBLE_DELETE_TARGET_INVENTORY_REPORT.md
CONTEXT_SUMMARY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312/021_context_summary.txt
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g1b_ui_visible_delete_target_inventory_20260503_174312/010_ui_visible_delete_target_inventory.tsv
DB_WRITE=NO
API_POST=NO
PATCH=NO
