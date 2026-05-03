============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 成果物レビュー 承認/差し戻し rollback smoke

現在位置:
- 実テーブルは business.aicm_human_review_item
- 表示viewは business.vw_aicm_human_review_wait_display
- V10G-B2はDB rollback smoke後の分類でヘッダー行を拾った可能性が高い

今回:
1. 既存のSMOKE_OUTを行番号付きで確認
2. ヘッダー行ではなく、statusが pending/approved/returned の実データ行を抽出
3. ROLLBACK後pending件数を確認
4. V10G-Cへ進めるか判定

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
LATEST_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2b_robust_parse_20260503_230601
SMOKE_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414/020_review_item_rollback_smoke.tsv
PERSIST_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2_review_item_rollback_smoke_20260503_230414/030_persist_after_rollback.tsv
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. raw smoke output with line numbers
============================================================
     1	BEGIN
     2	target_review_item_id	before_status	approve_status	return_status	pending_count_inside	approved_count_inside	returned_count_inside
     3	bc553839-ebca-4610-81e3-31dc21476a48	pending	approved		2	0	0
     4	(1 row)
     5	ROLLBACK

============================================================
3. robust parse
============================================================
PARSED_LINE=
TARGET_REVIEW_ITEM_ID=
BEFORE_STATUS=
APPROVE_STATUS=
RETURN_STATUS=
PENDING_COUNT_INSIDE=
APPROVED_COUNT_INSIDE=
RETURNED_COUNT_INSIDE=
PERSIST_PENDING_TABLE=2
PERSIST_PENDING_VIEW=2

============================================================
4. classification
============================================================
FINAL_JUDGEMENT=V10GB2B_ROBUST_PARSE_FAILED_CHECK_RAW
TARGET_REVIEW_ITEM_ID=
BEFORE_STATUS=
APPROVE_STATUS=
RETURN_STATUS=
PERSIST_PENDING_TABLE=2
PERSIST_PENDING_VIEW=2
RAW_NUMBERED=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2b_robust_parse_20260503_230601/010_smoke_raw_numbered.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gb2b_robust_parse_20260503_230601/000_R8Z_V10GB2B_ROBUST_PARSE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
