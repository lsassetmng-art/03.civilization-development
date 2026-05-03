import fs from "node:fs";

const files = process.argv.slice(2).filter(Boolean);
const marker = "AICM_HUMAN_REVIEW_QUEUE_ARN_ARQ_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }

      if (ch === "\\") {
        escape = true;
        continue;
      }

      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;

    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return { start, end: i + 1, text: source.slice(start, i + 1) };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function listFunctions(source) {
  const names = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(source))) names.push(m[1]);
  return names;
}

function detectBodyReader(src) {
  const hits = [];

  for (const name of listFunctions(src)) {
    let fn = "";
    try {
      fn = extractFunction(src, name).text;
    } catch (_) {
      continue;
    }

    const score =
      (fn.includes("JSON.parse") ? 4 : 0) +
      (fn.includes("Invalid JSON body") ? 4 : 0) +
      (fn.includes('req.on("data"') || fn.includes("req.on('data'") ? 3 : 0) +
      (fn.includes('req.on("end"') || fn.includes("req.on('end'") ? 3 : 0) +
      (fn.includes("resolve(") ? 1 : 0) +
      (fn.includes("reject(") ? 1 : 0);

    if (score >= 7) hits.push({ name, score });
  }

  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  if (hits.length > 0) return hits[0].name;

  throw new Error("Could not detect existing JSON body reader");
}

function insertBeforeFunction(src, functionName, insertion) {
  if (src.includes(marker)) return src;

  const pos = src.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("Insertion anchor function not found: " + functionName);

  return src.slice(0, pos) + insertion + "\n\n" + src.slice(pos);
}

function patchGetContext(src) {
  if (src.includes("'review_wait_items'")) return src;

  const fn = extractFunction(src, "getContext");
  const lines = fn.text.split("\n");
  const anchor = lines.findIndex((line) => line.includes("'robot_catalog'"));

  if (anchor < 0) throw new Error("robot_catalog anchor not found in getContext");

  const indent = (lines[anchor].match(/^(\s*)/) || ["", ""])[1];

  const add = [
    `${indent}// ${marker}_CONTEXT`,
    `${indent}"  'review_wait_items', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.priority_code DESC, r.requested_at DESC, r.created_at DESC), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_human_review_wait_display r",`,
    `${indent}"    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`
  ];

  lines.splice(anchor, 0, ...add);
  const patchedFn = lines.join("\n");

  return src.slice(0, fn.start) + patchedFn + src.slice(fn.end);
}

function makeFunctions() {
  return `
// ${marker}
// Human review queue functions.
// Human review is limited to delivery summaries and exception summaries.
// AI review remains internal; only ai_review_result_text summary is shown.

function aicmHumanReviewOptionalText(value) {
  return String(value || "").trim();
}

function aicmHumanReviewTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmHumanReviewOptionalUuidSql(value) {
  const text = String(value || "").trim();
  return text ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmHumanReviewOptionalDateSql(value) {
  const text = String(value || "").trim();
  return /^\\\\d{4}-\\\\d{2}-\\\\d{2}$/.test(text) ? sqlLiteral(text) + "::date" : "NULL";
}

function aicmHumanReviewKind(value) {
  const text = String(value || "delivery_summary").trim();
  return [
    "design_delivery_summary",
    "implementation_delivery_summary",
    "exception_review",
    "final_delivery_summary",
    "delivery_summary"
  ].includes(text) ? text : "delivery_summary";
}

function aicmHumanReviewArtifactKind(value) {
  const text = String(value || "design_doc").trim();
  return ["design_doc", "implementation", "exception", "delivery_package", "handoff"].includes(text) ? text : "design_doc";
}

function aicmHumanReviewPriority(value) {
  const text = String(value || "normal").trim();
  return ["low", "normal", "high", "urgent"].includes(text) ? text : "normal";
}

function createHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const title = requiredText(body.review_title || body.title, "review_title");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_human_review_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    related_president_policy_id, related_manager_major_work_item_id, related_leader_middle_work_item_id,",
    "    related_deliverable_requirement_id, related_worker_work_unit_id,",
    "    review_kind_code, artifact_kind_code, review_title,",
    "    delivery_summary_text, main_changes_text, ai_review_result_text, unresolved_issues_text, artifact_link,",
    "    responsible_ai_label, requested_by_ai_label, human_review_status_code, priority_code, due_date,",
    "    display_order, metadata_jsonb",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_department_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.aicm_user_company_section_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_president_policy_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_manager_major_work_item_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_leader_middle_work_item_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_deliverable_requirement_id) + ",",
    "    " + aicmHumanReviewOptionalUuidSql(body.related_worker_work_unit_id) + ",",
    "    " + sqlLiteral(aicmHumanReviewKind(body.review_kind_code)) + ",",
    "    " + sqlLiteral(aicmHumanReviewArtifactKind(body.artifact_kind_code)) + ",",
    "    " + sqlLiteral(title) + ",",
    "    " + aicmHumanReviewTextSql(body.delivery_summary_text) + ",",
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
  ].join("\\n");

  return runPsqlJson(sql);
}

function approveHumanReviewItem(body) {
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
  ].join("\\n");

  return runPsqlJson(sql);
}

function returnHumanReviewItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const reviewId = requiredUuid(body.aicm_human_review_item_id, "aicm_human_review_item_id");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_human_review_item",
    "  SET human_review_status_code = 'returned',",
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
  ].join("\\n");

  return runPsqlJson(sql);
}
`;
}

function insertRoutes(src, bodyReader) {
  if (src.includes("/api/aicm/v2/human-review/approve")) return src;

  const anchor = 'if (route === "/api/aicm/v2/context"';
  const pos = src.indexOf(anchor);

  if (pos < 0) throw new Error("context route anchor not found");

  const routes = `
    if (route === "/api/aicm/v2/human-review/create" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, createHumanReviewItem(body));
      return;
    }

    if (route === "/api/aicm/v2/human-review/approve" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, approveHumanReviewItem(body));
      return;
    }

    if (route === "/api/aicm/v2/human-review/return" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, returnHumanReviewItem(body));
      return;
    }

`;

  return src.slice(0, pos) + routes + src.slice(pos);
}

function assertNoNewDbConnection(before, after) {
  const prohibited = ["new Pool(", "new PgPool(", "new Client(", 'from "pg"', "from 'pg'", "AicmPmlwPgPool", "aicmPmlwPg"];

  for (const key of prohibited) {
    if (count(after, key) !== count(before, key)) {
      throw new Error("Prohibited DB connection change detected: " + key);
    }
  }
}

function patchFile(file) {
  if (!fs.existsSync(file)) return { file, skipped: true, reason: "missing" };

  const before = fs.readFileSync(file, "utf8");
  let after = before;
  const bodyReader = detectBodyReader(after);

  if (!after.includes(marker)) {
    after = insertBeforeFunction(after, "getContext", makeFunctions());
  }

  after = patchGetContext(after);
  after = insertRoutes(after, bodyReader);

  assertNoNewDbConnection(before, after);

  if (after !== before) fs.writeFileSync(file, after);

  return {
    file,
    changed: after !== before,
    bodyReader,
    markerCount: count(after, marker),
    contextCount: count(after, "review_wait_items"),
    createRouteCount: count(after, "/api/aicm/v2/human-review/create"),
    approveRouteCount: count(after, "/api/aicm/v2/human-review/approve"),
    returnRouteCount: count(after, "/api/aicm/v2/human-review/return")
  };
}

for (const file of files) {
  console.log(JSON.stringify(patchFile(file)));
}
