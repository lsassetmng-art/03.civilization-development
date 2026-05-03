============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 成果物レビュー 承認/差し戻し

現在位置:
- V10Gはpatch前停止。core/serverは未汚染
- V10G停止原因: 存在しない view business.aicm_human_review_wait_view
- V10G-B停止原因: 存在しない table business.aicm_human_review_queue
- 実在する正本:
  - business.aicm_human_review_item
  - business.vw_aicm_human_review_wait_display

今回:
1. 実テーブル/実viewの存在確認
2. pending件数確認
3. business.aicm_human_review_item に対して pending -> approved -> returned をROLLBACK内だけで検証
4. ROLLBACK後にpending件数が維持されていることを確認
5. 次のV10G-Cで API/UI 接続へ進む

禁止:
- persistent DB write
- API POST
- file patch

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
DB_REVIEW=佐藤(DB担当)

============================================================
2. precheck actual review table/view
============================================================
review_item_table	wait_display_view
business.aicm_human_review_item	business.vw_aicm_human_review_wait_display
(1 row)
key	value
table_pending_count	2
(1 row)
key	value
view_pending_count	2
(1 row)
key	value
status_breakdown	pending:2
(1 row)

============================================================
3. rollback smoke on business.aicm_human_review_item
============================================================
BEGIN
target_review_item_id	before_status	approve_status	return_status	pending_count_inside	approved_count_inside	returned_count_inside
bc553839-ebca-4610-81e3-31dc21476a48	pending	approved		2	0	0
(1 row)
ROLLBACK

============================================================
4. persisted after rollback
============================================================
key	value
table_pending_count_after_rollback	2
(1 row)
key	value
view_pending_count_after_rollback	2
(1 row)
key	value
status_breakdown_after_rollback	pending:2
(1 row)

============================================================
5. classification
============================================================
FINAL_JUDGEMENT=V10GB2_REVIEW_ITEM_ROLLBACK_SMOKE_FAILED_CHECK_OUTPUT
TARGET_REVIEW_ITEM_ID=target_review_item_id
BEFORE_STATUS=before_status
APPROVE_STATUS=approve_status
RETURN_STATUS=return_status
PERSIST_PENDING_TABLE=2
PERSIST_PENDING_VIEW=2
PRECHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414/010_precheck.tsv
SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414/020_review_item_rollback_smoke.tsv
PERSIST_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414/030_persist_after_rollback.tsv
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414/000_R8Z_V10GB2_REVIEW_ITEM_ROLLBACK_SMOKE_REPORT.md
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
