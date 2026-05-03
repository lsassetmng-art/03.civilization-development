============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- UI/context/viewには削除対象がある
- view基準ROLLBACKでは target found だが base table update が0件
- つまり view ID と base table ID/owner/company/status の対応確認が必要

今回:
1. view側の削除候補をTSVで抽出
2. view候補IDをbase tableへ owner/companyあり・なしで照合
3. base table側に同IDがあるか確認
4. company_id違い/owner違い/ID列違いを判定
5. 次の削除rollback条件を固定

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
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g3_delete_view_base_id_mapping_20260503_175437
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. DB mapping isolate
============================================================
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g3_delete_view_base_id_mapping_20260503_175437/010_delete_view_base_id_mapping.tsv
SQL_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g3_delete_view_base_id_mapping_20260503_175437/011_delete_view_base_id_mapping.err
---- SQL_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
VIEW_PENDING_TARGET	436b26b8-ea94-47d3-847e-69ba7d8e646c	00000000-0000-4000-8000-000000000001	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	開発案件全体ロードマップの整備	not_started	draft	4	2026-05-02 11:13:35.610793+00	2026-05-02 11:13:35.610793+00
VIEW_PENDING_TARGET	1f5c787f-3f9d-4571-9a62-ae258b6e8cb4	00000000-0000-4000-8000-000000000001	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	主要画面構成の整理	not_started	draft	5	2026-05-02 11:13:35.610793+00	2026-05-02 11:13:35.610793+00
VIEW_PENDING_TARGET	f2240a10-b712-4af4-a3a7-a11df53a9bf6	00000000-0000-4000-8000-000000000001	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	部門別タスク台帳画面の整備	not_started	draft	6	2026-05-02 11:13:35.610793+00	2026-05-02 11:13:35.610793+00
VIEW_PENDING_TARGET	f2badab8-43df-49cf-8400-022430bf22d5	00000000-0000-4000-8000-000000000001	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	ロボット配置表示の整備	not_started	draft	7	2026-05-02 11:13:35.610793+00	2026-05-02 11:13:35.610793+00
VIEW_PENDING_TARGET	9cbd039f-d44c-4c96-9be0-8d057d2966ad	00000000-0000-4000-8000-000000000001	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	引き継ぎ前確認画面の整備	not_started	draft	8	2026-05-02 11:13:35.610793+00	2026-05-02 11:13:35.610793+00
BASE_MATCH_BY_ID_ANY_OWNER_COMPANY	436b26b8-ea94-47d3-847e-69ba7d8e646c	00000000-0000-4000-8000-000000000001	8b9be487-7b74-4517-9b59-6c84a82ae6aa	ウルフ	開発案件全体ロードマップの整備	not_started	draft	4	2026-05-02 11:13:35.610793+00	2026-05-02 11:13:35.610793+00
MATCH_COUNTS	1	1	1	1
BASE_STATUS_COUNTS_TARGET_COMPANY	not_started	draft	34
BASE_STATUS_COUNTS_TARGET_COMPANY	decomposed	completed	3
BASE_STATUS_COUNTS_TARGET_COMPANY	archived	archived	1
VIEW_STATUS_COUNTS_TARGET_COMPANY	not_started	draft	34
VIEW_STATUS_COUNTS_TARGET_COMPANY	decomposed	completed	3
VIEW_STATUS_COUNTS_TARGET_COMPANY	archived	archived	1

============================================================
3. parse / judgement
============================================================
VIEW_TARGET_COUNT=5
BASE_MATCH_ANY=1
BASE_MATCH_OWNER=1
BASE_MATCH_OWNER_COMPANY=1
FINAL_JUDGEMENT=VIEW_BASE_ID_MAPPING_OK_NEXT_ROLLBACK_OWNER_ID_ONLY_OR_FIX_PRECHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g3_delete_view_base_id_mapping_20260503_175437/000_R8Z_V9G3_DELETE_VIEW_BASE_ID_MAPPING_REPORT.md
SQL_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g3_delete_view_base_id_mapping_20260503_175437/010_delete_view_base_id_mapping.tsv
DB_WRITE=NO
API_POST=NO
PATCH=NO
