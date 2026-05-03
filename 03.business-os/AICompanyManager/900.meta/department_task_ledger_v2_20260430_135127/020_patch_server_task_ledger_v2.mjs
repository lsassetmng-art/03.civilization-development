import fs from "node:fs";

const files = process.argv.slice(2).filter(Boolean);

function replaceFunction(source, functionName, replacement) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
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
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const newGetContext = `
function getContext(ownerCivilizationId) {
  const owner = requiredUuid(ownerCivilizationId, "owner_civilization_id");

  const sql = [
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'owner_civilization_id', " + sqlLiteral(owner) + ",",
    "  'companies', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb)",
    "    FROM business.aicm_user_company c",
    "    WHERE c.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND c.company_status = 'active'",
    "  ),",
    "  'departments', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb)",
    "    FROM business.aicm_user_company_department d",
    "    WHERE d.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND d.department_status = 'active'",
    "  ),",
    "  'sections', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb)",
    "    FROM business.aicm_user_company_section s",
    "    WHERE s.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND s.section_status = 'active'",
    "  ),",
    "  'placements', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_user_company_worker_placement_display p",
    "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND p.status_code = 'active'",
    "  ),",
    "  'task_ledger', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
    "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
    "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
    "      AND t.task_status_code <> 'archived'",
    "  ),",
    "  'robot_catalog', (",
    "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb)",
    "    FROM business.vw_ai_company_manager_system_robot_selector_options r",
    "  )",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}`;

const createTaskLedgerFunction = `
function createTaskLedger(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const sectionId = String(body.aicm_user_company_section_id || "").trim();

  const deliverableName = requiredText(body.deliverable_name, "deliverable_name");
  const taskName = requiredText(body.task_name, "task_name");
  const workTypeCode = String(body.work_type_code || "design").trim() || "design";
  const responsibleRoleCode = String(body.responsible_role_code || "Manager").trim() || "Manager";
  const responsibleRobotLabel = String(body.responsible_robot_label || "");
  const taskStatusCode = String(body.task_status_code || "todo").trim() || "todo";
  const priorityCode = String(body.priority_code || "normal").trim() || "normal";
  const dueDate = String(body.due_date || "").trim();

  const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
  const dueDateSql = dueDate ? sqlLiteral(dueDate) + "::date" : "NULL";

  const sql = [
    "WITH department_ok AS (",
    "  SELECT d.aicm_user_company_id, d.aicm_user_company_department_id",
    "  FROM business.aicm_user_company_department d",
    "  JOIN business.aicm_user_company c",
    "    ON c.aicm_user_company_id = d.aicm_user_company_id",
    "  WHERE d.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND d.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND d.aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
    "    AND d.department_status = 'active'",
    "    AND c.company_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_department_task_ledger (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, aicm_user_company_section_id,",
    "    deliverable_name, task_name, work_type_code, responsible_role_code, responsible_robot_label,",
    "    task_status_code, priority_code, due_date,",
    "    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    aicm_user_company_department_id,",
    "    " + sectionSql + ",",
    "    " + sqlLiteral(deliverableName) + ",",
    "    " + sqlLiteral(taskName) + ",",
    "    " + sqlLiteral(workTypeCode) + ",",
    "    " + sqlLiteral(responsibleRoleCode) + ",",
    "    " + sqlLiteral(responsibleRobotLabel) + ",",
    "    " + sqlLiteral(taskStatusCode) + ",",
    "    " + sqlLiteral(priorityCode) + ",",
    "    " + dueDateSql + ",",
    "    " + sqlLiteral(body.reference_files_text || "") + ",",
    "    " + sqlLiteral(body.supplemental_materials_text || "") + ",",
    "    " + sqlLiteral(body.applicable_rules_text || "") + ",",
    "    " + sqlLiteral(body.note || "") + ",",
    "    " + sqlLiteral(body.handoff_link || "") + "",
    "  FROM department_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'task_ledger', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業と部門を作成・選択してください。'",
    "    )::text",
    "END;"
  ].join("\\n");

  return runPsqlJson(sql);
}
`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let src = fs.readFileSync(file, "utf8");

  src = replaceFunction(src, "getContext", newGetContext);

  if (!src.includes("function createTaskLedger(")) {
    const marker = "function createPlacement(";
    const pos = src.indexOf(marker);
    if (pos < 0) throw new Error("createPlacement insertion point not found in " + file);
    src = src.slice(0, pos) + createTaskLedgerFunction + "\n\n" + src.slice(pos);
  }

  if (!src.includes('route === "/api/aicm/v2/task-ledger/create"')) {
    const marker = 'if (route === "/api/aicm/v2/placement/create" && req.method === "POST")';
    const pos = src.indexOf(marker);
    if (pos < 0) throw new Error("route insertion point not found in " + file);

    const routeBlock = `
    if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
      const payload = createTaskLedger(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

`;
    src = src.slice(0, pos) + routeBlock + src.slice(pos);
  }

  fs.writeFileSync(file, src);
  console.log("patched server task ledger v2:", file);
}
