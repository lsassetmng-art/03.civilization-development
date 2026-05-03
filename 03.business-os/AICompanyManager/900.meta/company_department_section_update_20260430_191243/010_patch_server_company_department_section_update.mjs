import fs from "node:fs";

const files = process.argv.slice(2).filter(Boolean);
const marker = "AICM_COMPANY_DEPT_SECTION_UPDATE_ARU_ARX_V1";

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

function makeFunctions() {
  return `
// ${marker}
// Company / Department / Section update functions.
// Uses existing SQL-array + runPsqlJson(sql) pattern only.
// No new Pool, no new DB helper, no new connection path.

function aicmOrgUpdateOptionalText(value) {
  return String(value || "").trim();
}

function aicmOrgUpdateTextSql(value) {
  return sqlLiteral(String(value || ""));
}

function aicmOrgUpdateStatus(value, allowed, fallback) {
  const text = String(value || fallback).trim();
  return allowed.includes(text) ? text : fallback;
}

function updateCompany(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const name = requiredText(body.company_name || body.companyName, "company_name");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company",
    "  SET company_name = " + sqlLiteral(name) + ",",
    "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
    "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
    "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function updateDepartment(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  const name = requiredText(body.department_name || body.departmentName, "department_name");
  const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company_department",
    "  SET department_name = " + sqlLiteral(name) + ",",
    "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
    "      department_status = " + sqlLiteral(status) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'department', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function updateSection(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const sectionId = requiredUuid(body.aicm_user_company_section_id, "aicm_user_company_section_id");
  const name = requiredText(body.section_name || body.sectionName, "section_name");
  const status = aicmOrgUpdateStatus(body.section_status || body.section_status_code, ["active", "inactive", "archived"], "active");

  const sql = [
    "WITH updated AS (",
    "  UPDATE business.aicm_user_company_section",
    "  SET section_name = " + sqlLiteral(name) + ",",
    "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
    "      section_status = " + sqlLiteral(status) + ",",
    "      updated_at = now()",
    "  WHERE aicm_user_company_section_id = " + sqlLiteral(sectionId) + "::uuid",
    "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'section', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}
`;
}

function insertRoutes(src, bodyReader) {
  if (src.includes("/api/aicm/v2/company/update")) return src;

  const anchor = 'if (route === "/api/aicm/v2/context"';
  const pos = src.indexOf(anchor);

  if (pos < 0) throw new Error("context route anchor not found");

  const routes = `
    if (route === "/api/aicm/v2/company/update" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, updateCompany(body));
      return;
    }

    if (route === "/api/aicm/v2/department/update" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, updateDepartment(body));
      return;
    }

    if (route === "/api/aicm/v2/section/update" && req.method === "POST") {
      const body = await ${bodyReader}(req);
      sendJson(res, 200, updateSection(body));
      return;
    }

`;

  return src.slice(0, pos) + routes + src.slice(pos);
}

function assertNoNewDbConnection(before, after) {
  const prohibited = ["new Pool(", "new PgPool(", "new Client(", 'from "pg"', "from 'pg'", "AicmOrgUpdatePgPool", "aicmOrgUpdatePg"];

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

  after = insertRoutes(after, bodyReader);
  assertNoNewDbConnection(before, after);

  if (after !== before) fs.writeFileSync(file, after);

  return {
    file,
    changed: after !== before,
    bodyReader,
    markerCount: count(after, marker),
    companyUpdateRouteCount: count(after, "/api/aicm/v2/company/update"),
    departmentUpdateRouteCount: count(after, "/api/aicm/v2/department/update"),
    sectionUpdateRouteCount: count(after, "/api/aicm/v2/section/update")
  };
}

for (const file of files) {
  console.log(JSON.stringify(patchFile(file)));
}
