============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 残り1件の差し戻し実行

現在位置:
- 承認側は成功済み / git checkpoint済み: ae5e770
- 残りpendingは1件
- 差し戻し確認後のread-only確認では、まだ pending のまま
- 次は、差し戻しボタン押下が server に届いているか、payload不足か、server側エラーかを切り分ける

今回:
1. DB read-onlyで対象状態を再確認
2. 最新server logから return route / 対象review_id / error / 500 を抽出
3. core側の差し戻しボタン生成・click handler・payload生成を静的確認
4. server側の return route / returnHumanReviewItem を静的確認
5. 原因分類

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
TARGET_REVIEW_ID=bd30bc28-c6d8-4fee-aebc-1311db979988
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. DB readonly target status
============================================================
target_table_status	bd30bc28-c6d8-4fee-aebc-1311db979988	returned	2026-05-03 21:59:07.447782+00	2026-05-03 21:59:07.447782+00	納品サマリー確認: Manager大項目台帳運用の整備 作業
target_view_status	bd30bc28-c6d8-4fee-aebc-1311db979988	returned	00000000-0000-4000-8000-000000000001	ウルフ	納品サマリー確認: Manager大項目台帳運用の整備 作業
pending_table_count	0
pending_view_count	0
approved_table_count	1
returned_table_count	1

============================================================
4. latest server log scan
============================================================
LATEST_SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/040_server.log

---- tail 240 ----
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794

---- grep return/human-review/error/target ----

============================================================
5. core scan
============================================================
V10GC3I_MARKER_COUNT=2
RETURN_LABEL_COUNT=0
REVIEW_DECISION_EXECUTE_COUNT=2
RETURN_ROUTE_COUNT=2
APPROVE_ROUTE_COUNT=2
DATA_REVIEW_DECISION_COUNT=2
DATA_OWNER_COUNT=2
DATA_REVIEW_ITEM_COUNT=2

---- renderConfirm / return button nearby ----
12656-
12657-    function findRowById(id) {
12658-      id = text(id);
12659-      var rows = fetchRows();
12660-
12661-      for (var i = 0; i < rows.length; i += 1) {
12662-        if (reviewId(rows[i]) === id) return rows[i];
12663-      }
12664-
12665-      return null;
12666-    }
12667-
12668-    function field(label, value) {
12669-      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
12670-    }
12671-
12672-    function removeExistingConfirm() {
12673-      if (typeof document === "undefined") return;
12674-
12675-      var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
12676-      for (var i = 0; i < nodes.length; i += 1) {
12677-        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
12678-      }
12679-    }
12680-
12681:    function renderConfirm(row, mode, id) {
12682-      var isApprove = mode === "approve";
12683-      var title = isApprove ? "承認前の最終確認" : "差し戻し前の最終確認";
12684-      var nextStatus = isApprove ? "approved" : "returned";
12685-      var operation = isApprove ? "承認" : "差し戻し";
12686-      var border = isApprove ? "#22c55e" : "#f97316";
12687-      var bg = isApprove ? "#f0fdf4" : "#fff7ed";
12688-
12689-      return [
12690-        '<section class="aicm-core-card" style="border:3px solid ' + border + ';background:' + bg + ';">',
12691-        '  <p class="aicm-eyebrow">V10F / DB更新前確認</p>',
12692-        '  <h2>' + esc(title) + '</h2>',
12693-        '  <p class="aicm-selected-note">この確認画面で内容を確認し、問題なければDB更新を実行します。</p>',
12694-        '  <dl class="aicm-core-detail-list">',
12695-        field("操作予定", operation),
12696-        field("status遷移予定", "pending → " + nextStatus),
12697-        field("review_id", id),
12698-        field("レビュー", row.review_title || row.title || "レビュー項目"),
12699-        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
12700-        field("優先度", row.priority_code),
12701-        field("依頼日時", row.requested_at || row.created_at),
12702-        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
12703-        field("会社", row.company_name),
12704-        '  </dl>',
12705-        '  <div class="aicm-core-card" style="background:#ffffff;">',
12706-        '    <p class="aicm-eyebrow">確認事項</p>',

---- V10GC3I handler nearby ----
13212-      window.aicmR8zV10d4HandleReviewDetailAction = function(actionEl) {
13213-        return handle(actionEl, null, "manual");
13214-      };
13215-    }
13216-  })();
13217-  // AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE_END
13218-
13219-
13220-
13221-
13222-
13223-
13224-
13225-
13226-// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END
13227-
13228-
13229-// AICM_R8Z_V10F3_REVIEW_CONFIRM_BACK_BUTTON_APPLIED
13230-
13231-
13232:// AICM_R8Z_V10GC3I_RENDERCONFIRM_DIRECT_BUTTON_CANON_START
13233-// Canonical review decision handler for renderConfirm(row, mode, id).
13234-// No DOM post-render normalization, no observer, no hardcoded owner fallback.
13235-function aicmR8zV10gc3iText(value) {
13236-  return String(value === undefined || value === null ? "" : value).trim();
13237-}
13238-
13239-function aicmR8zV10gc3iApp() {
13240-  if (typeof state !== "undefined" && state && typeof state === "object") return state;
13241-  if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
13242-  return {};
13243-}
13244-
13245-function aicmR8zV10gc3iNoteValue() {
13246-  try {
13247-    var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
13248-    return node ? aicmR8zV10gc3iText(node.value) : "";
13249-  } catch (_) {
13250-    return "";
13251-  }
13252-}
13253-
13254-function aicmR8zV10gc3iSetMessage(kind, value) {
13255-  try {
13256-    if (typeof setMessage === "function") {
13257-      setMessage(kind, value);
13258-      return;
13259-    }
13260-  } catch (_) {}
13261-
13262-  try {
13263-    var s = aicmR8zV10gc3iApp();
13264-    s.messageKind = kind;
13265-    s.messageText = value;
13266-  } catch (_) {}
13267-}
13268-
13269-function aicmR8zV10gc3iBuildPayload(button) {
13270-  return {
13271-    aicm_human_review_item_id: aicmR8zV10gc3iText(button.getAttribute("data-review-item-id") || ""),
13272-    owner_civilization_id: aicmR8zV10gc3iText(button.getAttribute("data-owner-civilization-id") || ""),
13273-    human_reviewer_label: aicmR8zV10gc3iText(button.getAttribute("data-human-reviewer-label") || "user") || "user",
13274-    human_review_note: aicmR8zV10gc3iNoteValue()
13275-  };
13276-}
13277-
13278-function aicmR8zV10gc3iMissingPayloadKeys(payload) {
13279-  return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
13280-    return !aicmR8zV10gc3iText(payload[key]);
13281-  });
13282-}
13283-
13284-function aicmR8zV10gc3iRoute(decision) {
13285-  return decision === "returned" ? "/api/aicm/v2/human-review/return" : "/api/aicm/v2/human-review/approve";
13286-}
13287-
13288-async function aicmR8zV10gc3iPostDecision(decision, payload) {
13289-  var response = await fetch(aicmR8zV10gc3iRoute(decision), {
13290-    method: "POST",
13291-    headers: { "Content-Type": "application/json" },
13292-    body: JSON.stringify(payload)
13293-  });
13294-
13295-  var json = null;
13296-  try { json = await response.json(); } catch (_) { json = null; }
13297-
13298-  if (!response.ok || (json && json.result === "error")) {
13299-    throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "レビュー更新に失敗しました。");
13300-  }
13301-
13302-  return json || { result: "ok" };
13303-}
13304-
13305-function aicmR8zV10gc3iRemoveReviewFromState(reviewId) {
13306-  var s = aicmR8zV10gc3iApp();
13307-  var id = aicmR8zV10gc3iText(reviewId);
13308-
13309-  function same(row) {
13310-    return aicmR8zV10gc3iText(row && (
13311-      row.aicm_human_review_item_id ||
13312-      row.human_review_item_id ||
13313-      row.review_item_id ||
13314-      row.review_id ||
13315-      row.id ||
13316-      ""
13317-    )) === id;
13318-  }
13319-
13320-  function filterRows(rows) {
13321-    return Array.isArray(rows) ? rows.filter(function(row) { return !same(row); }) : rows;
13322-  }
13323-
13324-  try {
13325-    s.review_wait_items = filterRows(s.review_wait_items);
13326-    s.reviewWaitItems = filterRows(s.reviewWaitItems);
13327-    s.reviewRows = filterRows(s.reviewRows);
13328-
13329-    if (s.context && typeof s.context === "object") {
13330-      Object.keys(s.context).forEach(function(key) {
13331-        if (Array.isArray(s.context[key])) {
13332-          s.context[key] = filterRows(s.context[key]);
13333-        }
13334-      });
13335-    }
13336-
13337-    s.aicmR8zV10fReviewConfirm = null;
13338-    s.reviewDecisionConfirm = null;
13339-    s.reviewConfirm = null;
13340-    s.aicmReviewConfirm = null;
13341-    s.selectedReview = null;
13342-    s.reviewDetail = null;
13343-    s.screen = "review-list";
13344-  } catch (_) {}
13345-}
13346-
13347-async function aicmR8zV10gc3iRefreshReviewList(reviewId) {
13348-  aicmR8zV10gc3iRemoveReviewFromState(reviewId);
13349-
13350-  try {
13351-    if (typeof aicmR8zV9ReviewListScriptHydrate === "function") {
13352-      aicmR8zV9ReviewListScriptHydrate(aicmR8zV10gc3iApp());
13353-    }
13354-  } catch (_) {}
13355-
13356-  try {
13357-    if (typeof render === "function") render();
13358-  } catch (_) {}
13359-}
13360-
13361-async function aicmR8zV10gc3iExecuteReviewDecision(button) {
13362-  var decision = aicmR8zV10gc3iText(button.getAttribute("data-review-decision") || "");
13363-  var payload = aicmR8zV10gc3iBuildPayload(button);
13364-  var missing = aicmR8zV10gc3iMissingPayloadKeys(payload);
13365-
13366-  if (decision !== "approved" && decision !== "returned") {
13367-    aicmR8zV10gc3iSetMessage("error", "レビュー操作種別が不明です。");
13368-    return;
13369-  }
13370-
13371-  if (missing.length > 0) {
13372-    aicmR8zV10gc3iSetMessage("error", "レビュー更新に必要な値が不足しています: " + missing.join(", "));
13373-    try {
13374-      if (typeof window !== "undefined") {
13375-        window.aicmR8zV10gc3iLastMissingPayload = payload;
13376-      }
13377-    } catch (_) {}
13378-    if (typeof render === "function") render();
13379-    return;
13380-  }
13381-
13382-  try {
13383-    button.disabled = true;
13384-    aicmR8zV10gc3iSetMessage("info", decision === "approved" ? "承認を実行しています。" : "差し戻しを実行しています。");
13385-
13386-    await aicmR8zV10gc3iPostDecision(decision, payload);
13387-
13388-    aicmR8zV10gc3iSetMessage("ok", decision === "approved" ? "承認しました。" : "差し戻しました。");
13389-
13390-    await aicmR8zV10gc3iRefreshReviewList(payload.aicm_human_review_item_id);
13391-  } catch (error) {
13392-    button.disabled = false;
13393-    aicmR8zV10gc3iSetMessage("error", error && error.message ? error.message : "レビュー更新に失敗しました。");
13394-    if (typeof render === "function") render();
13395-  }
13396-}
13397-
13398-if (typeof document !== "undefined") {
13399-  document.addEventListener("click", function(event) {
13400-    var target = event && event.target;
13401-    var button = target && target.closest ? target.closest('button[data-core-action="review-decision-execute"]') : null;
13402-    if (!button) return;
13403-
13404-    try { event.preventDefault(); } catch (_) {}
13405-    try { event.stopPropagation(); } catch (_) {}
13406-    try { event.stopImmediatePropagation(); } catch (_) {}
13407-
13408-    aicmR8zV10gc3iExecuteReviewDecision(button);
13409-  }, true);
13410-}
13411-
13412-if (typeof window !== "undefined") {

============================================================
6. server scan
============================================================
SERVER_RETURN_ROUTE_COUNT=1
SERVER_APPROVE_ROUTE_COUNT=1
SERVER_RETURN_FUNCTION_COUNT=1
SERVER_APPROVE_FUNCTION_COUNT=1

---- return route / function nearby ----
568-
569-  return runPsqlJson(sql);
570-}
571-
572-function approveHumanReviewItem(body) {
573-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
574-  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
575-
576-  const sql = [
577-    "WITH updated AS (",
578-    "  UPDATE business.aicm_human_review_item",
579-    "  SET human_review_status_code = 'approved',",
580-    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
581-    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
582-    "      reviewed_at = now(),",
583-    "      updated_at = now()",
584-    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
585-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
586-    "  RETURNING *",
587-    ")",
588-    "SELECT jsonb_build_object(",
589-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
590-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
591-    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
592-    ")::text;"
593-  ].join("\n");
594-
595-  return runPsqlJson(sql);
596-}
597-
598:function returnHumanReviewItem(body) {
599-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
600-  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");
601-
602-  const sql = [
603-    "WITH updated AS (",
604-    "  UPDATE business.aicm_human_review_item",
605-    "  SET human_review_status_code = 'returned',",
606-    "      human_reviewer_label = " + aicmHumanReviewTextSql(body.human_reviewer_label || "user") + ",",
607-    "      human_review_note = " + aicmHumanReviewTextSql(body.human_review_note) + ",",
608-    "      reviewed_at = now(),",
609-    "      updated_at = now()",
610-    "  WHERE aicm_human_review_item_id = " + sqlLiteral(reviewId) + "::uuid",
611-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
612-    "  RETURNING *",
613-    ")",
614-    "SELECT jsonb_build_object(",
615-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
616-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
617-    "  'human_review_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
618-    ")::text;"
619-  ].join("\n");
620-
621-  return runPsqlJson(sql);
622-}
623-
624-
625-
626-// AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1
627-// Company / Department / Section update functions.
628-// Uses existing SQL-array + runPsqlJson(sql) pattern only.
629-// No new Pool, no new DB helper, no new connection path.
630-
631-function aicmOrgUpdateOptionalText(value) {
632-  return String(value || "").trim();
633-}
634-
635-function aicmOrgUpdateTextSql(value) {
636-  return sqlLiteral(String(value || ""));
637-}
638-
639-function aicmOrgUpdateStatus(value, allowed, fallback) {
640-  const text = String(value || fallback).trim();
641-  return allowed.includes(text) ? text : fallback;
642-}
643-
644-function updateCompany(body) {
645-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
646-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
647-  const name = requiredText(body.company_name || body.companyName, "company_name");
648-
649-  const sql = [
650-    "WITH updated AS (",
651-    "  UPDATE business.aicm_user_company",
652-    "  SET company_name = " + sqlLiteral(name) + ",",
653-    "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
654-    "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
655-    "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
656-    "      updated_at = now()",
657-    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
658-    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
659-    "  RETURNING *",
660-    ")",
661-    "SELECT jsonb_build_object(",
662-    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
663-    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
664-    "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
665-    ")::text;"
666-  ].join("\n");
667-
668-  return runPsqlJson(sql);
669-}
670-
671-function updateDepartment(body) {
672-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
673-  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
674-  const name = requiredText(body.department_name || body.departmentName, "department_name");
675-  const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");
676-
677-  const sql = [
678-    "WITH updated AS (",
--
2103-      return true;
2104-    }
2105-if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
2106-      const body = await readBody(req);
2107-      sendJson(res, 200, archiveManagerMajorItem(body));
2108-      return true;
2109-    }
2110-
2111-// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
2112-    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
2113-      const body = await readBody(req);
2114-      sendJson(res, 200, importManagerMajorItemsCsv(body));
2115-      return true;
2116-    }
2117-
2118-
2119-    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
2120-      const body = await readBody(req);
2121-      sendJson(res, 200, createHumanReviewItem(body));
2122-      return true;
2123-    }
2124-
2125-    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
2126-      const body = await readBody(req);
2127-      sendJson(res, 200, approveHumanReviewItem(body));
2128-      return true;
2129-    }
2130-
2131-    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
2132-      const body = await readBody(req);
2133:      sendJson(res, 200, returnHumanReviewItem(body));
2134-      return true;
2135-    }
2136-
2137-
2138-    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
2139-      const body = await readBody(req);
2140-      sendJson(res, 200, updateCompany(body));
2141-      return true;
2142-    }
2143-
2144-    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
2145-      const body = await readBody(req);
2146-      sendJson(res, 200, updateDepartment(body));
2147-      return true;
2148-    }
2149-
2150-    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
2151-    // UI label "組織変更" is connected to the current section/k課 update responsibility.
2152-    // Keep this as an explicit compatibility route so future split can be handled here.
2153-    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
2154-      const body = await readBody(req);
2155-      sendJson(res, 200, updateSection(body));
2156-      return true;
2157-    }
2158-
2159-    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
2160-      const body = await readBody(req);
2161-      sendJson(res, 200, updateSection(body));
2162-      return true;
2163-    }
2164-
2165-
2166-    // AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE: review-list script transport for local browser hydration
2167-    if (route === "/api/aicm/v2/context-script" && req.method === "GET") {
2168-      const owner = url.searchParams.get("owner_civilization_id") || "";
2169-      const callbackRaw = url.searchParams.get("callback") || "__aicmR8zV9ReviewContextCallback";
2170-      const callback = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(callbackRaw)
2171-        ? callbackRaw
2172-        : "__aicmR8zV9ReviewContextCallback";
2173-      const payload = getContext(owner);
2174-      const js = [
2175-        "/* AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE */",
2176-        "try {",
2177-        callback + "(" + JSON.stringify(payload) + ");",
2178-        "} catch (error) {",
2179-        "  try { window.__aicmR8zV9ReviewContextError = String(error && error.message ? error.message : error); } catch (_) {}",
2180-        "}"
2181-      ].join("\n");
2182-
2183-      res.writeHead(200, {
2184-        "content-type": "application/javascript; charset=utf-8",
2185-        "access-control-allow-origin": "*",
2186-        "cache-control": "no-store"
2187-      });
2188-      res.end(js);
2189-      return true;
2190-    }
2191-
2192-if (route === "/api/aicm/v2/context" && req.method === "GET") {
2193-      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
2194-      return true;
2195-    }
2196-
2197-    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
2198-      sendJson(res, 200, createCompany(await readBody(req)));
2199-      return true;
2200-    }
2201-
2202-    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
2203-      const payload = createDepartment(await readBody(req));
2204-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2205-      return true;
2206-    }
2207-
2208-    if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
2209-      const payload = createSection(await readBody(req));
2210-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
2211-      return true;
2212-    }
2213-

---- route handler nearby ----
2091-    }
2092-
2093-    if (route === "/api/aicm/v2/manager-major/update" && req.method === "POST") {
2094-      const body = await readBody(req);
2095-      sendJson(res, 200, updateManagerMajorItem(body));
2096-      return true;
2097-    }
2098-
2099-    
2100-    if (route === "/api/aicm/v2/leader-auto-decomposition/run" && req.method === "POST") {
2101-      const body = await readBody(req);
2102-      sendJson(res, 200, runLeaderAutoDecomposition(body));
2103-      return true;
2104-    }
2105-if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
2106-      const body = await readBody(req);
2107-      sendJson(res, 200, archiveManagerMajorItem(body));
2108-      return true;
2109-    }
2110-
2111-// AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1: repaired literal backslash-n near CSV import SQL assembly
2112-    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
2113-      const body = await readBody(req);
2114-      sendJson(res, 200, importManagerMajorItemsCsv(body));
2115-      return true;
2116-    }
2117-
2118-
2119-    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
2120-      const body = await readBody(req);
2121-      sendJson(res, 200, createHumanReviewItem(body));
2122-      return true;
2123-    }
2124-
2125-    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
2126-      const body = await readBody(req);
2127-      sendJson(res, 200, approveHumanReviewItem(body));
2128-      return true;
2129-    }
2130-
2131:    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
2132-      const body = await readBody(req);
2133-      sendJson(res, 200, returnHumanReviewItem(body));
2134-      return true;
2135-    }
2136-
2137-
2138-    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
2139-      const body = await readBody(req);
2140-      sendJson(res, 200, updateCompany(body));
2141-      return true;
2142-    }
2143-
2144-    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
2145-      const body = await readBody(req);
2146-      sendJson(res, 200, updateDepartment(body));
2147-      return true;
2148-    }
2149-
2150-    // AICM_ORGANIZATION_UPDATE_DELEGATES_TO_SECTION_UPDATE
2151-    // UI label "組織変更" is connected to the current section/k課 update responsibility.
2152-    // Keep this as an explicit compatibility route so future split can be handled here.
2153-    if (route === "/api/aicm/v2/organization/update" && req.method === "POST") {
2154-      const body = await readBody(req);
2155-      sendJson(res, 200, updateSection(body));
2156-      return true;
2157-    }
2158-
2159-    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
2160-      const body = await readBody(req);
2161-      sendJson(res, 200, updateSection(body));
2162-      return true;
2163-    }
2164-
2165-
2166-    // AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE: review-list script transport for local browser hydration
2167-    if (route === "/api/aicm/v2/context-script" && req.method === "GET") {
2168-      const owner = url.searchParams.get("owner_civilization_id") || "";
2169-      const callbackRaw = url.searchParams.get("callback") || "__aicmR8zV9ReviewContextCallback";
2170-      const callback = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(callbackRaw)
2171-        ? callbackRaw
2172-        : "__aicmR8zV9ReviewContextCallback";
2173-      const payload = getContext(owner);
2174-      const js = [
2175-        "/* AICM_R8Z_V9_CONTEXT_SCRIPT_ROUTE */",
2176-        "try {",
2177-        callback + "(" + JSON.stringify(payload) + ");",
2178-        "} catch (error) {",
2179-        "  try { window.__aicmR8zV9ReviewContextError = String(error && error.message ? error.message : error); } catch (_) {}",
2180-        "}"
2181-      ].join("\n");
2182-
2183-      res.writeHead(200, {
2184-        "content-type": "application/javascript; charset=utf-8",
2185-        "access-control-allow-origin": "*",
2186-        "cache-control": "no-store"
2187-      });
2188-      res.end(js);
2189-      return true;
2190-    }
2191-

============================================================
7. classification
============================================================
FINAL_JUDGEMENT=RETURN_SUCCESS_DB_CONFIRMED
NEXT_ACTION=GIT_CHECKPOINT_AFTER_RETURN_SUCCESS
TARGET_STATUS=returned
TARGET_VIEW_OWNER=00000000-0000-4000-8000-000000000001
PENDING_TABLE_COUNT=0
PENDING_VIEW_COUNT=0
RETURNED_TABLE_COUNT=1
SERVER_RETURN_LOG_HIT_COUNT=0
SERVER_TARGET_LOG_HIT_COUNT=0
SERVER_ERROR_HIT_COUNT=1
CORE_V10GC3I_MARKER_COUNT=2
CORE_RETURN_ROUTE_COUNT=2
CORE_REVIEW_DECISION_EXECUTE_COUNT=2
SERVER_RETURN_ROUTE_COUNT=1
SERVER_RETURN_FUNCTION_COUNT=1
DB_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933/010_db_pending_target_readonly.tsv
SERVER_LOG_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933/020_server_log_return_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933/030_core_return_execute_scan.txt
SERVER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933/040_server_return_route_scan.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933/050_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc3j2_return_click_server_isolate_20260504_065933/000_R8Z_V10GC3J2_RETURN_CLICK_SERVER_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO
