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
- V10GCはpool名探索で停止
- ただしserverには既に approveHumanReviewItem / returnHumanReviewItem がある
- core/serverはV10GC partial patchなし

今回:
1. core/server syntax確認
2. 既存server routeから approve/return endpointを検出
3. coreのみbackup
4. coreに最終確認カード専用の実行接続を追加
5. server patchなし
6. server再起動
7. invalid POST smokeでendpoint到達だけ確認
8. ブラウザ起動

重要:
- このスクリプト中は永続DB更新しない
- invalid smokeは空IDで400/409/500など到達確認だけ
- 本更新は画面の最終確認ボタン押下時だけ
- 確認画面なしPOSTは禁止

禁止:
- server patch
- 新規DB pool/helper追加
- 台帳/課/従業員/削除への変更

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2_review_existing_route_ui_execute_20260504_053901
DB_WRITE=NO
API_POST=INVALID_SMOKE_ONLY
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. DB precheck
============================================================
review_item_table	business.aicm_human_review_item
wait_display_view	business.vw_aicm_human_review_wait_display
pending_table	2
pending_view	2

============================================================
4. scan existing server routes
============================================================
node:fs:440
    return binding.readFileUtf8(path, stringToFlags(options.flag));
                   ^

Error: ENOENT: no such file or directory, open 'x'
    at Object.readFileSync (node:fs:440:20)
    at Object.<anonymous> (/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2_review_existing_route_ui_execute_20260504_053901/scan_existing_review_routes.cjs:6:16)
    at Module._compile (node:internal/modules/cjs/loader:1812:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1943:10)
    at Module.load (node:internal/modules/cjs/loader:1533:32)
    at Module._load (node:internal/modules/cjs/loader:1335:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'x'
}

Node.js v24.14.1
WARN: automatic route scan failed; fallback grep follows
475:// Human review queue functions.
476:// Human review is limited to delivery summaries and exception summaries.
477:// AI review remains internal; only ai_review_result_text summary is shown.
502:    "exception_review",
521:  const title = requiredText(body.review_title || body.title, "review_title");
525:    "  INSERT INTO business.aicm_human_review_item (",
529:    "    review_kind_code, artifact_kind_code, review_title,",
530:    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
531:    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
543:    "    " + sqlLiteral(aicmHumanReviewKind(body.review_kind_code)) + ",",
548:    "    " + aicmHumanReviewTextSql(body.ai_review_result_text) + ",",
564:    "  'human_review_item', to_jsonb(inserted)",
572:function approveHumanReviewItem(body) {
574:  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
578:    "  UPDATE business.aicm_human_review_item",
579:    "  SET human_review_status_code = 'approved',",
580:    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
581:    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
582:    "      reviewed_at = now(),",
584:    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
591:    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
598:function returnHumanReviewItem(body) {
600:  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
604:    "  UPDATE business.aicm_human_review_item",
605:    "  SET human_review_status_code = 'returned',",
606:    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
607:    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
608:    "      reviewed_at = now(),",
610:    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
617:    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
796:    "  'review_wait_items', (",
798:    "    FROM business.vw_aicm_human_review_wait_display r",
1745:    "    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,",
1767:    "    assigned_worker_label, worker_model_code, work_status_code, review_status_code,",
1972:    review_required_flag: ["required", "waiting"].includes(aicmR8ZIText(unit.review_status_code)),
2081:    if (route === "/api/aicm/v2/president-policy/create" && req.method === "POST") {
2087:    if (route === "/api/aicm/v2/manager-major/create" && req.method === "POST") {
2093:    if (route === "/api/aicm/v2/manager-major/update" && req.method === "POST") {
2100:    if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {
2105:if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
2112:    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
2119:    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
2125:    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
2127:      sendJson(res, 200, approveHumanReviewItem(body));
2131:    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
2133:      sendJson(res, 200, returnHumanReviewItem(body));
2138:    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
2144:    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
2153:    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
2159:    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
2166:    // AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE: review-list script transport for local browser hydration
2167:    if (route === "/api/aicm/v2/context-script" && req.method === "GET") {
2192:if (route === "/api/aicm/v2/context" && req.method === "GET") {
2197:    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
2202:    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
2208:    if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
2215:    if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
2221:    if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
2227:if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
2234:    if (route === "/api/aicm/v2/worker-auto-execution/run" && req.method === "POST") {
2239:    if (route === "/api/aicm/v2/worker-runtime/request" && req.method === "POST") {
2247:    if (route === "/api/aicm/v2/worker-runtime/pipeline-board" && req.method === "GET") {
2253:    if (route === "/api/aicm/v2/worker-runtime/app-read-payload" && req.method === "GET") {
APPROVE_ROUTE=
RETURN_ROUTE=
FINAL_JUDGEMENT=EXISTING_REVIEW_ROUTE_NOT_FOUND_STOP
ROUTE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2_review_existing_route_ui_execute_20260504_053901/020_existing_review_route_scan.txt
logout
