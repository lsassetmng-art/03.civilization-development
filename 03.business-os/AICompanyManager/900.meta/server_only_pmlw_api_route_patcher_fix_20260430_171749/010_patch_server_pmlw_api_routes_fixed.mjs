import fs from "node:fs";

const files = process.argv.slice(2).filter(Boolean);
const marker = "AICM_PMLW_API_ARJ_ARM_V1";

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

function makeServerFunctions() {
  return `
// ${marker}
// PMLW API functions use the existing SQL-array + runPsqlJson(sql) pattern.
// No new Pool, no new DB helper, no new connection path.

function aicmPmlwOptionalText(value) {
  return String(value || "").trim();
}

function aicmPmlwTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmPmlwOptionalUuidSql(value) {
  const text = String(value || "").trim();
  return text ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmPmlwOptionalDateSql(value) {
  const text = String(value || "").trim();
  return /^\\\\d{4}-\\\\d{2}-\\\\d{2}$/.test(text) ? sqlLiteral(text) + "::date" : "NULL";
}

function aicmPmlwPriority(value) {
  const text = String(value || "normal").trim();
  return ["low", "normal", "high", "urgent"].includes(text) ? text : "normal";
}

function aicmPmlwMajorStatus(value) {
  const text = String(value || "not_started").trim();
  return ["not_started", "assigned_to_leader", "leader_decomposing", "decomposed", "returned", "archived"].includes(text) ? text : "not_started";
}

function aicmPmlwHandoffStatus(value) {
  const text = String(value || "draft").trim();
  return ["draft", "ready_handoff", "handed_off", "accepted", "completed", "archived"].includes(text) ? text : "draft";
}

function aicmPmlwCsvRows(body) {
  const rows = Array.isArray(body.rows) ? body.rows : [];
  return rows.slice(0, 300).map((row) => {
    const majorName = aicmPmlwOptionalText(
      row.major_item_name ||
      row.major_name ||
      row.deliverable_name ||
      row.task_name ||
      row.title
    );

    return {
      department_name: aicmPmlwOptionalText(row.department_name),
      section_name: aicmPmlwOptionalText(row.section_name),
      major_item_name: majorName,
      major_item_description: aicmPmlwOptionalText(row.major_item_description || row.description || row.task_name || row.note),
      assigned_leader_label: aicmPmlwOptionalText(row.assigned_leader_label || row.leader_label || row.responsible_role_code),
      priority_code: aicmPmlwPriority(row.priority_code),
      due_date: aicmPmlwOptionalText(row.due_date),
      note: aicmPmlwOptionalText(row.note)
    };
  }).filter((row) => row.major_item_name.length > 0);
}

function createPresidentPolicy(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const title = requiredText(body.policy_title || body.title, "policy_title");
  const text = requiredText(body.policy_text || body.president_policy_instruction_text || body.description, "policy_text");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_president_policy (",
    "    owner_civilization_id, aicm_user_company_id, source_route_code, policy_title, policy_text,",
    "    president_robot_label, requested_by_text, company_common_rules_snapshot,",
    "    policy_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + sqlLiteral(body.source_route_code || "user_to_president") + ",",
    "    " + sqlLiteral(title) + ",",
    "    " + sqlLiteral(text) + ",",
    "    " + aicmPmlwTextSql(body.president_robot_label) + ",",
    "    " + aicmPmlwTextSql(body.requested_by_text || "user") + ",",
    "    " + aicmPmlwTextSql(body.company_common_rules_snapshot) + ",",
    "    " + sqlLiteral(body.policy_status_code || "submitted") + ",",
    "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
    "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
    "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
    "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
    "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
    "    " + aicmPmlwTextSql(body.note) + ",",
    "    " + aicmPmlwTextSql(body.handoff_link),
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'president_policy', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function createManagerMajorItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const majorName = requiredText(body.major_item_name || body.deliverable_name || body.task_name, "major_item_name");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_manager_major_work_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_president_policy_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    major_item_name, major_item_description, source_route_code,",
    "    manager_robot_label, assigned_leader_label,",
    "    decomposition_status_code, handoff_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(companyId) + "::uuid,",
    "    " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id) + ",",
    "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id) + ",",
    "    " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id) + ",",
    "    " + sqlLiteral(majorName) + ",",
    "    " + aicmPmlwTextSql(body.major_item_description || body.description || body.note) + ",",
    "    " + sqlLiteral(body.source_route_code || "manual") + ",",
    "    " + aicmPmlwTextSql(body.manager_robot_label) + ",",
    "    " + aicmPmlwTextSql(body.assigned_leader_label) + ",",
    "    " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)) + ",",
    "    " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)) + ",",
    "    " + sqlLiteral(aicmPmlwPriority(body.priority_code)) + ",",
    "    " + aicmPmlwOptionalDateSql(body.due_date) + ",",
    "    " + aicmPmlwTextSql(body.reference_files_text) + ",",
    "    " + aicmPmlwTextSql(body.supplemental_materials_text) + ",",
    "    " + aicmPmlwTextSql(body.applicable_rules_text) + ",",
    "    " + aicmPmlwTextSql(body.note) + ",",
    "    " + aicmPmlwTextSql(body.handoff_link),
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'manager_major_item', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function updateManagerMajorItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");
  const updates = [];

  if (body.major_item_name !== undefined) updates.push("major_item_name = " + sqlLiteral(String(body.major_item_name || "").trim()));
  if (body.major_item_description !== undefined) updates.push("major_item_description = " + aicmPmlwTextSql(body.major_item_description));
  if (body.aicm_president_policy_id !== undefined) updates.push("aicm_president_policy_id = " + aicmPmlwOptionalUuidSql(body.aicm_president_policy_id));
  if (body.aicm_user_company_department_id !== undefined) updates.push("aicm_user_company_department_id = " + aicmPmlwOptionalUuidSql(body.aicm_user_company_department_id));
  if (body.aicm_user_company_section_id !== undefined) updates.push("aicm_user_company_section_id = " + aicmPmlwOptionalUuidSql(body.aicm_user_company_section_id));
  if (body.manager_robot_label !== undefined) updates.push("manager_robot_label = " + aicmPmlwTextSql(body.manager_robot_label));
  if (body.assigned_leader_label !== undefined) updates.push("assigned_leader_label = " + aicmPmlwTextSql(body.assigned_leader_label));
  if (body.decomposition_status_code !== undefined) updates.push("decomposition_status_code = " + sqlLiteral(aicmPmlwMajorStatus(body.decomposition_status_code)));
  if (body.handoff_status_code !== undefined) updates.push("handoff_status_code = " + sqlLiteral(aicmPmlwHandoffStatus(body.handoff_status_code)));
  if (body.priority_code !== undefined) updates.push("priority_code = " + sqlLiteral(aicmPmlwPriority(body.priority_code)));
  if (body.due_date !== undefined) updates.push("due_date = " + aicmPmlwOptionalDateSql(body.due_date));
  if (body.reference_files_text !== undefined) updates.push("reference_files_text = " + aicmPmlwTextSql(body.reference_files_text));
  if (body.supplemental_materials_text !== undefined) updates.push("supplemental_materials_text = " + aicmPmlwTextSql(body.supplemental_materials_text));
  if (body.applicable_rules_text !== undefined) updates.push("applicable_rules_text = " + aicmPmlwTextSql(body.applicable_rules_text));
  if (body.note !== undefined) updates.push("note = " + aicmPmlwTextSql(body.note));
  if (body.handoff_link !== undefined) updates.push("handoff_link = " + aicmPmlwTextSql(body.handoff_link));

  updates.push("updated_at = now()");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_manager_major_work_item",
    "  SET " + updates.join(", "),
    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'manager_major_item', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function archiveManagerMajorItem(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const majorId = requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id");

  const sql = [
    "WITH archived AS (",
    "  UPDATE business.aicm_manager_major_work_item",
    "  SET decomposition_status_code = 'archived',",
    "      handoff_status_code = 'archived',",
    "      updated_at = now()",
    "  WHERE aicm_manager_major_work_item_id = " + sqlLiteral(majorId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM archived) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'manager_major_item', COALESCE((SELECT to_jsonb(archived) FROM archived), '{}'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function importManagerMajorItemsCsv(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const rows = aicmPmlwCsvRows(body);

  if (rows.length === 0) {
    return { result: "ok", api_identifier: SERVER_MARK, inserted_count: 0, manager_major_items: [] };
  }

  const values = rows.map((row, index) => [
    "(",
    index,
    ", " + sqlLiteral(owner) + "::uuid",
    ", " + sqlLiteral(companyId) + "::uuid",
    ", " + sqlLiteral(row.department_name),
    ", " + sqlLiteral(row.section_name),
    ", " + sqlLiteral(row.major_item_name),
    ", " + sqlLiteral(row.major_item_description),
    ", " + sqlLiteral(row.assigned_leader_label),
    ", " + sqlLiteral(row.priority_code),
    ", " + aicmPmlwOptionalDateSql(row.due_date),
    ", " + sqlLiteral(row.note),
    ")"
  ].join("")).join(",\\\\n    ");

  const sql = [
    "WITH input_rows(row_order, owner_civilization_id, aicm_user_company_id, department_name, section_name, major_item_name, major_item_description, assigned_leader_label, priority_code, due_date, note) AS (",
    "  VALUES",
    "    " + values,
    "), resolved AS (",
    "  SELECT i.*, (",
    "    SELECT d.aicm_user_company_department_id",
    "    FROM business.aicm_user_company_department d",
    "    WHERE d.owner_civilization_id = i.owner_civilization_id",
    "      AND d.aicm_user_company_id = i.aicm_user_company_id",
    "      AND d.department_status = 'active'",
    "      AND (i.department_name = '' OR d.department_name = i.department_name)",
    "    ORDER BY CASE WHEN d.department_name = i.department_name THEN 0 ELSE 1 END, d.display_order, d.created_at",
    "    LIMIT 1",
    "  ) AS department_id",
    "  FROM input_rows i",
    "), resolved_section AS (",
    "  SELECT r.*, (",
    "    SELECT s.aicm_user_company_section_id",
    "    FROM business.aicm_user_company_section s",
    "    WHERE s.owner_civilization_id = r.owner_civilization_id",
    "      AND s.aicm_user_company_id = r.aicm_user_company_id",
    "      AND s.section_status = 'active'",
    "      AND (r.department_id IS NULL OR s.aicm_user_company_department_id = r.department_id)",
    "      AND (r.section_name = '' OR s.section_name = r.section_name)",
    "    ORDER BY CASE WHEN s.section_name = r.section_name THEN 0 ELSE 1 END, s.display_order, s.created_at",
    "    LIMIT 1",
    "  ) AS section_id",
    "  FROM resolved r",
    "), inserted AS (",
    "  INSERT INTO business.aicm_manager_major_work_item (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    major_item_name, major_item_description, source_route_code, assigned_leader_label,",
    "    decomposition_status_code, handoff_status_code, priority_code, due_date, note, display_order",
    "  )",
    "  SELECT owner_civilization_id, aicm_user_company_id, department_id, section_id,",
    "         major_item_name, major_item_description, 'csv_import', assigned_leader_label,",
    "         'not_started', 'draft', priority_code, due_date, note, 100 + row_order",
    "  FROM resolved_section",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'inserted_count', (SELECT count(*) FROM inserted),",
    "  'manager_major_items', COALESCE((SELECT jsonb_agg(to_jsonb(inserted) ORDER BY display_order, created_at) FROM inserted), '[]'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}
`;
}

function insertRoutes(src, bodyReader) {
  if (src.includes("/api/aicm/v2/manager-major/import-csv")) return src;

  const anchor = 'if (route === "/api/aicm/v2/context"';
  const pos = src.indexOf(anchor);
  if (pos < 0) throw new Error("context route anchor not found");

  const routes = `
    if (route === "/api/aicm/v2/president-policy/create" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, createPresidentPolicy(body));
      return;
    }

    if (route === "/api/aicm/v2/manager-major/create" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, createManagerMajorItem(body));
      return;
    }

    if (route === "/api/aicm/v2/manager-major/update" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, updateManagerMajorItem(body));
      return;
    }

    if (route === "/api/aicm/v2/manager-major/archive" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, archiveManagerMajorItem(body));
      return;
    }

    if (route === "/api/aicm/v2/manager-major/import-csv" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, importManagerMajorItemsCsv(body));
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
    after = insertBeforeFunction(after, "getContext", makeServerFunctions());
  }

  after = insertRoutes(after, bodyReader);
  assertNoNewDbConnection(before, after);

  if (after !== before) fs.writeFileSync(file, after);

  return {
    file,
    changed: after !== before,
    bodyReader,
    markerCount: count(after, marker),
    presidentRouteCount: count(after, "/api/aicm/v2/president-policy/create"),
    managerCreateRouteCount: count(after, "/api/aicm/v2/manager-major/create"),
    managerUpdateRouteCount: count(after, "/api/aicm/v2/manager-major/update"),
    managerArchiveRouteCount: count(after, "/api/aicm/v2/manager-major/archive"),
    managerImportRouteCount: count(after, "/api/aicm/v2/manager-major/import-csv")
  };
}

for (const file of files) {
  console.log(JSON.stringify(patchFile(file)));
}
