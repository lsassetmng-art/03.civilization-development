============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- レビュー待ち2件表示 OK
- 成果物確認カード表示 OK
- git checkpoint OK: 65212c5
- 次は承認/差し戻しのDB更新前 rollback smoke

今回:
1. core/server syntax確認
2. DB/view/context のレビュー待ち2件確認
3. rollback transaction 内で承認status候補を試す
4. rollback transaction 内で差し戻しstatus候補を試す
5. ROLLBACK後に pending 2件が残っていることを確認
6. core/serverの既存承認/差し戻しaction/routeを棚卸し
7. 次のUI確認カード/API実行パッチに進めるか判定

禁止:
- 永続DB write
- API POST
- PATCH
- 承認/差し戻し本実行

今回のDB書込:
- ROLLBACK内のみ
- smoke対象は business.aicm_human_review_item.human_review_status_code

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. rollback smoke SQL
============================================================
ROLLBACK_SQL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/010_v10e_rollback_smoke.sql
ROLLBACK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/020_v10e_rollback_smoke.tsv
ROLLBACK_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/021_v10e_rollback_smoke.err
---- ROLLBACK_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
BEGIN
CREATE TABLE
INSERT 0 1
INSERT 0 1
INSERT 0 1
INSERT 0 1
DO
DB_VIEW_WAIT_DISPLAY_COUNT_BEFORE	2
DB_HUMAN_REVIEW_PENDING_COUNT_BEFORE	2
EXISTING_STATUS_CODES	pending
CHECK_CONSTRAINTS	CHECK ((human_review_status_code = ANY (ARRAY['pending'::text, 'approved'::text, 'returned'::text, 'archived'::text])))
TARGET_REVIEW_ID	bc553839-ebca-4610-81e3-31dc21476a48
BEFORE_STATUS	pending
APPROVE_TRY_approved	updated=1,visible_after=0
APPROVE_TRY_approve_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
APPROVE_TRY_accepted_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
APPROVE_TRY_completed_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
APPROVE_FIRST_OK	approved
RETURN_TRY_returned	updated=1,visible_after=1
RETURN_TRY_return_requested_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
RETURN_TRY_needs_revision_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
RETURN_TRY_rejected_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
RETURN_TRY_sent_back_ERROR	new row for relation "aicm_human_review_item" violates check constraint "chk_aicm_human_review_status"
RETURN_FIRST_OK	returned
INSIDE_STATUS_AFTER_RESET	pending
INSIDE_VIEW_WAIT_COUNT_AFTER_RESET	2
ROLLBACK

============================================================
4. persistent after rollback check
============================================================
PERSIST_SQL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/030_v10e_persist_after_rollback.sql
PERSIST_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/040_v10e_persist_after_rollback.tsv
PERSIST_ERR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/041_v10e_persist_after_rollback.err
---- PERSIST_OUT ----
Pager usage is off.
Output format is unaligned.
Field separator is "	".
BEGIN
PERSIST_DB_VIEW_WAIT_DISPLAY_COUNT	2
PERSIST_DB_HUMAN_REVIEW_PENDING_COUNT	2
PERSIST_TARGET_STATUS	pending
ROLLBACK

============================================================
5. context after rollback check
============================================================
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&aicm_user_company_id=8b9be487-7b74-4517-9b59-6c84a82ae6aa&v=r8z_v10e_20260503_211919
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2

============================================================
6. core/server action route scan
============================================================
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/060_core_review_action_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/070_server_review_route_scan.txt
CORE_APPROVE_ACTION_COUNT=12
CORE_RETURN_ACTION_COUNT=16
SERVER_REVIEW_ROUTE_COUNT=5

============================================================
7. final
============================================================
FINAL_JUDGEMENT=V10E_ROLLBACK_SMOKE_PASS_READY_FOR_CONFIRM_UI_AND_API_PATCH
TARGET_REVIEW_ID=bc553839-ebca-4610-81e3-31dc21476a48
BEFORE_STATUS=pending
APPROVE_FIRST_OK=approved
RETURN_FIRST_OK=returned
PERSIST_VIEW_COUNT=2
PERSIST_PENDING_COUNT=2
PERSIST_TARGET_STATUS=pending
CONTEXT_HTTP=200
CONTEXT_REVIEW_COUNT=2
CORE_APPROVE_ACTION_COUNT=12
CORE_RETURN_ACTION_COUNT=16
SERVER_REVIEW_ROUTE_COUNT=5
ROLLBACK_SQL=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/010_v10e_rollback_smoke.sql
ROLLBACK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/020_v10e_rollback_smoke.tsv
PERSIST_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/040_v10e_persist_after_rollback.tsv
CONTEXT_JSON=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/050_context_after_rollback.json
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/060_core_review_action_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/070_server_review_route_scan.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10e_approve_return_rollback_smoke_20260503_211919/000_R8Z_V10E_APPROVE_RETURN_ROLLBACK_SMOKE_REPORT.md
DB_WRITE=ROLLBACK_ONLY
API_POST=NO
PATCH=NO

NEXT:
- PASSの場合:
  V10Fでは、成果物確認カード内に「承認確認カード」「差し戻し確認カード」を追加し、
  DB更新前に必ず確認画面を挟む。
  API/DB本更新はその次の最小パッチで行う。

- STATUS_CODE_CHECK_REQUIREDの場合:
  APPROVE_FIRST_OK / RETURN_FIRST_OK の候補失敗内容を見て、正しい status code を固定する。

- ROLLBACK_FAILEDの場合:
  永続DB状態に影響した可能性があるため、次へ進まず確認する。
