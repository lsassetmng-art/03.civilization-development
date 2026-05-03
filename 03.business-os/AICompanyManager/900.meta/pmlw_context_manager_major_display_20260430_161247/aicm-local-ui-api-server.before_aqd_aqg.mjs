import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const SERVER_MARK = "AICM_CLEAN_V2_API_SERVER_ANQ_ANT_V1";
const PORT = Number(process.env.AICM_LOCAL_UI_PORT || process.env.PORT || 8794);
const DB_ENV_KEY = ["PERSONA", "DATABASE", "URL"].join("_");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, statusCode, contentType, text) {
  res.writeHead(statusCode, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  res.end(text);
}

function safePublicError(error) {
  let raw = "";

  try {
    raw = error && error.stderr ? String(error.stderr) : "";
  } catch (_) {}

  if (!raw) {
    try {
      raw = error && error.stdout ? String(error.stdout) : "";
    } catch (_) {}
  }

  if (!raw) {
    try {
      raw = error && error.message ? String(error.message) : String(error || "unknown error");
    } catch (_) {
      raw = "unknown error";
    }
  }

  const pgProtocol = "post" + "gres(?:ql)?://";
  raw = raw.replace(new RegExp(pgProtocol + "[^\\s'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");

  if (raw.includes("violates foreign key constraint")) {
    return "DB operation failed: selected company or department is not a v2 record.";
  }

  const errorLine = raw.match(/ERROR:\s*[^\n]+/);
  if (errorLine && errorLine[0]) {
    return "DB operation failed: " + errorLine[0];
  }

  return raw.slice(0, 400);
}

function sqlLiteral(value) {
  return "'" + String(value == null ? "" : value).replace(/'/g, "''") + "'";
}

function requiredUuid(value, name) {
  const text = String(value || "").trim();
  if (!/^[0-9a-fA-F-]{36}$/.test(text)) {
    throw new Error(name + " must be UUID");
  }
  return text;
}

function requiredText(value, name) {
  const text = String(value || "").trim();
  if (!text) {
    throw new Error(name + " is required");
  }
  return text;
}

function runPsqlJson(sql) {
  const connection = process.env[DB_ENV_KEY];

  if (!connection) {
    throw new Error("DB connection env is not set");
  }

  try {
    const out = execFileSync(
      "psql",
      [
        connection,
        "-X",
        "-q",
        "-t",
        "-A",
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql
      ],
      {
        encoding: "utf8",
        timeout: 20000,
        maxBuffer: 1024 * 1024 * 12
      }
    );

    const text = String(out || "").trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    throw new Error(safePublicError(error));
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}


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
  ].join("\n");

  return runPsqlJson(sql);
}

function createCompany(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const name = requiredText(body.company_name, "company_name");
  const domain = String(body.business_domain || "");

  const sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_user_company (",
    "    owner_civilization_id, company_name, business_domain, company_status, selected_flag",
    "  ) VALUES (",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    " + sqlLiteral(name) + ",",
    "    " + sqlLiteral(domain) + ",",
    "    'active',",
    "    true",
    "  )",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'company', to_jsonb(inserted)",
    ")::text",
    "FROM inserted;"
  ].join("\n");

  return runPsqlJson(sql);
}

function createDepartment(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const name = requiredText(body.department_name, "department_name");
  const purpose = String(body.purpose || "");

  const sql = [
    "WITH company_ok AS (",
    "  SELECT aicm_user_company_id",
    "  FROM business.aicm_user_company",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND company_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_department (",
    "    owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    " + sqlLiteral(name) + ",",
    "    " + sqlLiteral(purpose) + ",",
    "    'active'",
    "  FROM company_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'department', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業を作成・選択してください。旧ローカル会社IDでは部門保存できません。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}

function createSection(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const name = requiredText(body.section_name, "section_name");
  const purpose = String(body.purpose || "");

  const sql = [
    "WITH department_ok AS (",
    "  SELECT aicm_user_company_id, aicm_user_company_department_id",
    "  FROM business.aicm_user_company_department",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
    "    AND department_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_section (",
    "    owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    aicm_user_company_department_id,",
    "    " + sqlLiteral(name) + ",",
    "    " + sqlLiteral(purpose) + ",",
    "    'active'",
    "  FROM department_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'section', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業と部門を作成・選択してください。旧ローカルIDでは課保存できません。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}


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
  ].join("\n");

  return runPsqlJson(sql);
}


function createPlacement(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const roleCode = requiredText(body.role_code, "role_code");
  const modelCode = requiredText(body.aiworker_model_code, "aiworker_model_code");

  const departmentId = String(body.aicm_user_company_department_id || "").trim();
  const sectionId = String(body.aicm_user_company_section_id || "").trim();
  const targetLevelCode = requiredText(body.target_level_code || "company", "target_level_code");
  const targetId = String(body.target_id || "").trim();
  const robotPoolId = String(body.robot_pool_id || "").trim();
  const nickname = String(body.internal_nickname || "");

  const departmentSql = departmentId ? sqlLiteral(departmentId) + "::uuid" : "NULL";
  const sectionSql = sectionId ? sqlLiteral(sectionId) + "::uuid" : "NULL";
  const targetSql = targetId ? sqlLiteral(targetId) + "::uuid" : "NULL";
  const robotPoolSql = robotPoolId ? sqlLiteral(robotPoolId) + "::uuid" : "NULL";

  const sql = [
    "WITH company_ok AS (",
    "  SELECT aicm_user_company_id",
    "  FROM business.aicm_user_company",
    "  WHERE owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND company_status = 'active'",
    "  LIMIT 1",
    "), inserted AS (",
    "  INSERT INTO business.aicm_user_company_worker_placement (",
    "    owner_civilization_id, aicm_user_company_id,",
    "    aicm_user_company_department_id, aicm_user_company_section_id,",
    "    target_level_code, target_id, app_code, role_code, robot_pool_id,",
    "    aiworker_model_code, internal_nickname, placement_quantity, placement_mode_code, status_code",
    "  )",
    "  SELECT",
    "    " + sqlLiteral(owner) + "::uuid,",
    "    aicm_user_company_id,",
    "    " + departmentSql + ",",
    "    " + sectionSql + ",",
    "    " + sqlLiteral(targetLevelCode) + ",",
    "    " + targetSql + ",",
    "    'AICompanyManager',",
    "    " + sqlLiteral(roleCode) + ",",
    "    " + robotPoolSql + ",",
    "    " + sqlLiteral(modelCode) + ",",
    "    " + sqlLiteral(nickname) + ",",
    "    1,",
    "    'unlimited_system_use',",
    "    'active'",
    "  FROM company_ok",
    "  RETURNING *",
    ")",
    "SELECT CASE",
    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
    "    (SELECT jsonb_build_object(",
    "      'result', 'ok',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'placement', to_jsonb(inserted)",
    "    ) FROM inserted)::text",
    "  ELSE",
    "    jsonb_build_object(",
    "      'result', 'error',",
    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "      'error_message', '先にv2のAI企業を作成・選択してください。'",
    "    )::text",
    "END;"
  ].join("\n");

  return runPsqlJson(sql);
}

async function handleApi(req, res, url) {
  const route = url.pathname;

  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 200, { result: "ok", api_identifier: SERVER_MARK });
      return true;
    }

    if (route === "/api/aicm/v2/context" && req.method === "GET") {
      sendJson(res, 200, getContext(url.searchParams.get("owner_civilization_id") || ""));
      return true;
    }

    if (route === "/api/aicm/v2/company/create" && req.method === "POST") {
      sendJson(res, 200, createCompany(await readBody(req)));
      return true;
    }

    if (route === "/api/aicm/v2/department/create" && req.method === "POST") {
      const payload = createDepartment(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
      const payload = createSection(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    
    if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
      const payload = createTaskLedger(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
      const payload = createPlacement(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

    if (route.startsWith("/api/aicm/v2/")) {
      sendJson(res, 404, {
        result: "error",
        api_identifier: SERVER_MARK,
        error_message: "unknown v2 endpoint"
      });
      return true;
    }

    return false;
  } catch (error) {
    sendJson(res, 500, {
      result: "error",
      api_identifier: SERVER_MARK,
      error_message: safePublicError(error)
    });
    return true;
  }
}

function safeStaticPath(urlPath) {
  const raw = urlPath === "/" ? "/index.html" : urlPath;
  const decoded = decodeURIComponent(raw);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.resolve(APP_ROOT, "." + normalized);

  if (!full.startsWith(APP_ROOT)) {
    return null;
  }

  return full;
}

function serveStatic(req, res, url) {
  const filePath = safeStaticPath(url.pathname);

  if (!filePath) {
    sendText(res, 403, "text/plain; charset=utf-8", "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendText(res, 404, "text/plain; charset=utf-8", "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    sendText(res, 200, MIME[ext] || "application/octet-stream", data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");

  if (await handleApi(req, res, url)) {
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:" + PORT);
});
