============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 成果物レビュー 承認/差し戻し

現在位置:
- 実テーブル: business.aicm_human_review_item
- 表示view: business.vw_aicm_human_review_wait_display
- pendingは table/view ともに2件
- 前回はSQL結果の行抽出が失敗

今回:
1. key/value形式だけでrollback smokeを出す
2. pending -> approved -> returned をROLLBACK内だけで検証
3. ROLLBACK後にpending件数が2件維持されることを確認
4. 成功したらV10G-CでAPI/UI接続へ進む

禁止:
- persistent DB write
- API POST
- file patch

============================================================
1. ENV
============================================================
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb3_review_item_kv_rollback_smoke_20260504_052837
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
DB_REVIEW=佐藤(DB担当)

============================================================
2. key/value rollback smoke
============================================================
BEGIN
CREATE TABLE
DO
approve_status	approved
before_status	pending
final_static_judgement	REVIEW_ITEM_ROLLBACK_SMOKE_PASS
pending_table_inside_rollback	1
pending_view_inside_rollback	1
return_status	returned
review_item_table	business.aicm_human_review_item
target_review_item_id	bc553839-ebca-4610-81e3-31dc21476a48
wait_display_view	business.vw_aicm_human_review_wait_display
ROLLBACK

============================================================
3. persisted after rollback
============================================================
persist_pending_table	2
persist_pending_view	2
persist_status_breakdown	pending:2

============================================================
4. classification
============================================================
FINAL_JUDGEMENT=V10GB3_REVIEW_ITEM_ROLLBACK_SMOKE_PASS_READY_FOR_V10GC_API_UI_PATCH
TARGET_REVIEW_ITEM_ID=bc553839-ebca-4610-81e3-31dc21476a48
BEFORE_STATUS=pending
APPROVE_STATUS=approved
RETURN_STATUS=returned
FINAL_STATIC=REVIEW_ITEM_ROLLBACK_SMOKE_PASS
PERSIST_PENDING_TABLE=2
PERSIST_PENDING_VIEW=2
SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb3_review_item_kv_rollback_smoke_20260504_052837/010_review_item_kv_rollback_smoke.tsv
PERSIST_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb3_review_item_kv_rollback_smoke_20260504_052837/020_persist_after_rollback.tsv
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb3_review_item_kv_rollback_smoke_20260504_052837/000_R8Z_V10GB3_REVIEW_ITEM_KV_ROLLBACK_SMOKE_REPORT.md
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO
