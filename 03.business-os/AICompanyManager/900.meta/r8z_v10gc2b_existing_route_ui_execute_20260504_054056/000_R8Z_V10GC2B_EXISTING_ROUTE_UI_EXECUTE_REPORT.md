============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー・承認待ち一覧
- 成果物レビュー 承認/差し戻し

現在位置:
- V10GB3 rollback smoke PASS
- 実テーブル: business.aicm_human_review_item
- 表示view: business.vw_aicm_human_review_wait_display
- V10GC は pool名探索で停止
- V10GC2 は route scanner 呼び出しミスの可能性が高い
- serverには既に approveHumanReviewItem / returnHumanReviewItem がある

今回:
1. core/server syntax確認
2. 前回V10GC2のpartial patch有無確認
3. DB pending件数確認
4. 既存server routeを正しく抽出
5. server patchなしで、coreだけ最終確認ボタンから既存routeへPOST接続
6. server再起動
7. invalid POST smokeでroute到達だけ確認
8. ブラウザ起動

禁止:
- server patch
- DB persistent write during script
- 確認画面なしPOST
- 台帳/課/従業員/削除への変更

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2b_existing_route_ui_execute_20260504_054056
DB_WRITE=NO
API_POST=INVALID_SMOKE_ONLY
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. previous / current marker check
============================================================
V10GC_CORE_MARKER_COUNT=0
V10GC_SERVER_MARKER_COUNT=0
V10GC2_CORE_MARKER_COUNT=0
V10GC2B_CORE_MARKER_COUNT=0
V10F4A_MARKER_COUNT=3

============================================================
4. DB precheck
============================================================
review_item_table	business.aicm_human_review_item
wait_display_view	business.vw_aicm_human_review_wait_display
pending_table	2
pending_view	2

============================================================
5. scan existing server approve/return routes
============================================================
APPROVE_ROUTE=/api/aicm/v2/human-review/approve
RETURN_ROUTE=/api/aicm/v2/human-review/return
APPROVE_HIT_COUNT=2
RETURN_HIT_COUNT=2

---- APPROVE HITS ----
LINE=572 ROUTES=
    "    " + aicmHumanReviewTextSql(body.main_changes_text) + ",",
    "    " + aicmHumanReviewTextSql(body.ai_review_result_text) + ",",
    "    " + aicmHumanReviewTextSql(body.unresolved_issues_text) + ",",
    "    " + aicmHumanReviewTextSql(body.artifact_link) + ",",
    "    " + aicmHumanReviewTextSql(body.responsible_ai_label) + ",",
    "    " + aicmHumanReviewTextSql(body.requested_by_ai_label) + ",",
    "    'pending',",
    "    " + sqlLiteral(aicmHumanReviewPriority(body.priority_code)) + ",",
    "    " + aicmHumanReviewOptionalDateSql(body.due_date) + ",",
    "    COALESCE(NULLIF(" + sqlLiteral(String(body.display_order || "")) + ", '')::integer, 100),",
    "    '{}'::jsonb",
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function approveHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'approved',",

LINE=2127 ROUTES=/api/aicm/v2/manager-major/archive,/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return
      sendJson(res, 200, runLeaderAutoDecomposition(body));
      return true;
    }
if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return true;
    }

// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
      return true;
    }


    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return true;


---- RETURN HITS ----
LINE=598 ROUTES=
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'approved',",
    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
    "      reviewed_at = now(),",
    "      updated_at = now()",
    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\n");

  return runPsqlJson(sql);
}

function returnHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'returned',",

LINE=2133 ROUTES=/api/aicm/v2/manager-major/import-csv,/api/aicm/v2/human-review/create,/api/aicm/v2/human-review/approve,/api/aicm/v2/human-review/return,/api/aicm/v2/company/update
      return true;
    }

// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
      return true;
    }


    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return true;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return true;
    }


    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, updateCompany(body));

APPROVE_ROUTE=/api/aicm/v2/human-review/approve
RETURN_ROUTE=/api/aicm/v2/human-review/return

============================================================
6. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2b_existing_route_ui_execute_20260504_054056/aicm-production-core.before_v10gc2b.js

============================================================
7. patch core only
============================================================
PATCH_APPLIED: core V10GC2B existing route review executor appended

============================================================
8. syntax postcheck
============================================================
PASS: syntax OK after core patch

============================================================
9. static verify
============================================================
V10GC2B_CORE_MARKER_COUNT=2
V10GC2B_APPROVE_ACTION_COUNT=3
V10GC2B_RETURN_ACTION_COUNT=3
V10GC2B_APPROVE_ROUTE_COUNT=2
V10GC2B_RETURN_ROUTE_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
V10F4A_MARKER_COUNT=3
DB_WRITE=NO
API_POST=INVALID_SMOKE_ONLY

============================================================
10. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=a9191bff4b5bc15c1b76202551c225e9206a3180c68255d0606de25f3fa0ed34
SERVED_SHA=a9191bff4b5bc15c1b76202551c225e9206a3180c68255d0606de25f3fa0ed34
SERVED_V10GC2B_COUNT=2

============================================================
11. invalid endpoint smoke
============================================================
APPROVE_SMOKE_HTTP=500
{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "owner_civilization_id must be UUID"
}
RETURN_SMOKE_HTTP=500
{
  "result": "error",
  "api_identifier": "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1",
  "error_message": "owner_civilization_id must be UUID"
}
============================================================
12. final
============================================================
FINAL_JUDGEMENT=V10GC2B_EXISTING_REVIEW_ROUTE_UI_READY_BROWSER_OPENED
REVIEW_ITEM_TABLE=business.aicm_human_review_item
WAIT_DISPLAY_VIEW=business.vw_aicm_human_review_wait_display
PENDING_TABLE=2
PENDING_VIEW=2
APPROVE_ROUTE=/api/aicm/v2/human-review/approve
RETURN_ROUTE=/api/aicm/v2/human-review/return
APPROVE_HIT_COUNT=2
RETURN_HIT_COUNT=2
APPROVE_SMOKE_HTTP=500
RETURN_SMOKE_HTTP=500
V10GC2B_CORE_MARKER_COUNT=2
V10GC2B_APPROVE_ACTION_COUNT=3
V10GC2B_RETURN_ACTION_COUNT=3
V10GC2B_APPROVE_ROUTE_COUNT=2
V10GC2B_RETURN_ROUTE_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2B_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2b_20260504_054056
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2b_existing_route_ui_execute_20260504_054056/000_R8Z_V10GC2B_EXISTING_ROUTE_UI_EXECUTE_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2b_existing_route_ui_execute_20260504_054056/aicm-production-core.before_v10gc2b.js
ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2b_existing_route_ui_execute_20260504_054056/010_existing_review_route_scan.txt
DB_WRITE=NO
API_POST=INVALID_SMOKE_ONLY
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 承認確認へ進む
4. 「承認を実行する」が有効になっていること
5. まず1件だけ実行
6. 実行後、レビュー一覧が 2件 -> 1件 になればOK

注意:
- ボタンを押すと本当にDB更新します。
- まず承認/差し戻しのどちらか1件だけ。
- 成功後に結果を貼ってください。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2b_existing_route_ui_execute_20260504_054056/aicm-production-core.before_v10gc2b.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
