import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { execFileSync as _aicmSystemRobotSelectorExecFileSync } from "node:child_process";

import { execFileSync as _aicmV2ProdExecFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, "..");
const BUSINESS_OS_ROOT = path.resolve(APP_ROOT, "..");
const AIWORKER_ROOT = path.resolve(BUSINESS_OS_ROOT, "_aiworker");
const PORT = Number(process.env.AICM_LOCAL_UI_PORT || process.env.PORT || 8794);
const HOST = process.env.AICM_LOCAL_UI_HOST || "127.0.0.1";
const SERVER_MARK = "AICM_LOCAL_UI_STATIC_PLUS_READ_API_ADW_ADZ_V1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

let schemaCache = null;

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "access-control-allow-origin": "*",
    "x-aicm-local-ui-server": SERVER_MARK
  });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj, null, 2), "application/json; charset=utf-8");
}

function safeDecode(value) {
  try { return decodeURIComponent(value || "/"); } catch { return "/"; }
}

function safeJoin(root, requestPath) {
  const clean = String(requestPath || "/").replace(/^\/+/, "");
  const full = path.resolve(root, clean);
  const rootResolved = path.resolve(root);
  if (full !== rootResolved && !full.startsWith(rootResolved + path.sep)) return null;
  return full;
}

function fileExists(filePath) {
  try { return !!filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile(); }
  catch { return false; }
}

function serveFile(res, filePath) {
  if (!fileExists(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.writeHead(200, {
    "content-type": type,
    "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "access-control-allow-origin": "*",
    "x-aicm-local-ui-server": SERVER_MARK
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function resolveFile(reqUrl) {
  const parsed = new URL(String(reqUrl || "/"), "http://127.0.0.1");
  const pathname = safeDecode(parsed.pathname || "/");

  if (pathname === "/" || pathname === "") return path.join(APP_ROOT, "index.html");
  if (pathname === "/favicon.ico") return null;

  if (pathname.startsWith("/_aiworker/")) {
    return safeJoin(AIWORKER_ROOT, pathname.replace(/^\/_aiworker\/?/, ""));
  }

  return safeJoin(APP_ROOT, pathname);
}

function psql(sql) {
  return new Promise((resolve, reject) => {
    if (!process.env.PERSONA_DATABASE_URL) {
      reject(new Error("PERSONA_DATABASE_URL is not set"));
      return;
    }

    const child = spawn("bash", [
      "-lc",
      "psql \"$PERSONA_DATABASE_URL\" -X -q -v ON_ERROR_STOP=1 -t -A -F $'\\t'"
    ], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => { stdout += String(d); });
    child.stderr.on("data", (d) => { stderr += String(d); });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr || `psql failed with code ${code}`));
    });

    child.stdin.end(sql);
  });
}

function qIdent(name) {
  const s = String(name || "");
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) {
    throw new Error("unsafe identifier: " + s);
  }
  return '"' + s.replace(/"/g, '""') + '"';
}

function lit(value) {
  return "'" + String(value == null ? "" : value).replace(/'/g, "''") + "'";
}

function firstCol(cols, names) {
  for (const n of names) {
    if (cols.includes(n)) return n;
  }
  return "";
}

function scoreCompanyTable(table, cols) {
  let score = 0;
  const t = table.toLowerCase();

  if (t === "company") score += 100;
  if (t === "ai_company") score += 90;
  if (t.includes("company")) score += 40;
  if (t.includes("robot") || t.includes("placement") || t.includes("history") || t.includes("status") || t.includes("line")) score -= 50;

  if (firstCol(cols, ["company_id", "id"])) score += 30;
  if (firstCol(cols, ["company_name", "name", "display_name", "legal_name"])) score += 30;
  if (firstCol(cols, ["business_domain", "business_area", "business_field", "domain", "description"])) score += 10;

  return score;
}

function scoreOrgTable(table, cols) {
  let score = 0;
  const t = table.toLowerCase();

  if (t === "department") score += 100;
  if (t === "organization") score += 90;
  if (t.includes("department")) score += 60;
  if (t.includes("organization")) score += 55;
  if (t.includes("org")) score += 30;
  if (t.includes("section")) score += 25;
  if (t.includes("team")) score += 20;

  if (t.includes("ledger") || t.includes("task") || t.includes("history") || t.includes("status") || t.includes("placement") || t.includes("robot")) score -= 40;

  if (cols.includes("company_id")) score += 40;
  if (firstCol(cols, ["department_id", "organization_id", "org_id", "id"])) score += 20;
  if (firstCol(cols, ["department_name", "organization_name", "org_name", "name", "display_name", "title"])) score += 20;

  return score;
}

async function loadSchema() {
  if (schemaCache) return schemaCache;

  const out = await psql(`
select table_name, string_agg(column_name, ',' order by ordinal_position) as columns
from information_schema.columns
where table_schema = 'business'
group by table_name
order by table_name;
`);

  const tables = [];
  out.split("\n").forEach((line) => {
    if (!line.trim()) return;
    const parts = line.split("\t");
    const table = parts[0] || "";
    const cols = (parts[1] || "").split(",").filter(Boolean);
    tables.push({ table, cols });
  });

  schemaCache = {
    loaded_at: new Date().toISOString(),
    tables
  };

  return schemaCache;
}

function selectCompanyTable(schema) {
  const ranked = schema.tables
    .map((x) => ({ ...x, score: scoreCompanyTable(x.table, x.cols) }))
    .filter((x) => x.score > 60)
    .sort((a, b) => b.score - a.score);

  return ranked[0] || null;
}

function selectOrgTables(schema) {
  return schema.tables
    .map((x) => ({ ...x, score: scoreOrgTable(x.table, x.cols) }))
    .filter((x) => x.score > 55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

async function readCompanies() {
  const schema = await loadSchema();
  const table = selectCompanyTable(schema);

  if (!table) {
    return {
      result: "ok",
      server_mark: SERVER_MARK,
      source: "read-only-db",
      table: null,
      companies: [],
      warning: "company table not discovered"
    };
  }

  const idCol = firstCol(table.cols, ["company_id", "id"]);
  const nameCol = firstCol(table.cols, ["company_name", "name", "display_name", "legal_name"]);
  const domainCol = firstCol(table.cols, ["business_domain", "business_area", "business_field", "domain", "description", "note"]);

  const tq = qIdent("business") + "." + qIdent(table.table);
  const idExpr = `${qIdent(idCol)}::text`;
  const nameExpr = nameCol ? `${qIdent(nameCol)}::text` : `${idExpr}`;
  const domainExpr = domainCol ? `coalesce(${qIdent(domainCol)}::text, '')` : `''`;

  const json = await psql(`
select coalesce(jsonb_agg(x order by x->>'company_name'), '[]'::jsonb)::text
from (
  select jsonb_build_object(
    'company_id', ${idExpr},
    'company_name', ${nameExpr},
    'business_domain', ${domainExpr},
    'source_table', ${lit("business." + table.table)}
  ) as x
  from ${tq}
  where ${idExpr} is not null
    and ${nameExpr} is not null
  limit 300
) s;
`);

  let companies = [];
  try { companies = JSON.parse(json || "[]"); } catch { companies = []; }

  companies = companies.filter((c) => {
    const id = String(c.company_id || "").trim();
    const name = String(c.company_name || "").trim();
    if (!id || !name) return false;
    if (id === "選択してください" || name === "選択してください") return false;
    if (id === "company" || name === "company" || name === "会社") return false;
    return true;
  });

  return {
    result: "ok",
    server_mark: SERVER_MARK,
    source: "read-only-db",
    table: "business." + table.table,
    companies
  };
}

async function readOrganizations(companyId) {
  const company_id = String(companyId || "").trim();

  if (!company_id || company_id === "選択してください" || company_id === "company" || company_id === "会社") {
    return {
      result: "ok",
      server_mark: SERVER_MARK,
      source: "read-only-db",
      company_id,
      organizations: [],
      warning: "invalid or placeholder company_id"
    };
  }

  const schema = await loadSchema();
  const tables = selectOrgTables(schema);
  const organizations = [];

  for (const table of tables) {
    if (!table.cols.includes("company_id")) continue;

    const idCol = firstCol(table.cols, ["department_id", "organization_id", "org_id", "id"]);
    const nameCol = firstCol(table.cols, ["department_name", "organization_name", "org_name", "name", "display_name", "title"]);
    const descCol = firstCol(table.cols, ["description", "summary", "purpose", "note", "business_domain"]);
    const parentCol = firstCol(table.cols, ["parent_department_id", "parent_organization_id", "parent_id"]);

    if (!idCol || !nameCol) continue;

    const tq = qIdent("business") + "." + qIdent(table.table);
    const idExpr = `${qIdent(idCol)}::text`;
    const nameExpr = `${qIdent(nameCol)}::text`;
    const descExpr = descCol ? `coalesce(${qIdent(descCol)}::text, '')` : `''`;
    const parentExpr = parentCol ? `coalesce(${qIdent(parentCol)}::text, '')` : `''`;

    const json = await psql(`
select coalesce(jsonb_agg(x order by x->>'organization_name'), '[]'::jsonb)::text
from (
  select jsonb_build_object(
    'organization_id', ${idExpr},
    'organization_name', ${nameExpr},
    'description', ${descExpr},
    'parent_id', ${parentExpr},
    'company_id', company_id::text,
    'source_table', ${lit("business." + table.table)}
  ) as x
  from ${tq}
  where company_id::text = ${lit(company_id)}
    and ${idExpr} is not null
    and ${nameExpr} is not null
  limit 500
) s;
`);

    try {
      const rows = JSON.parse(json || "[]");
      rows.forEach((r) => organizations.push(r));
    } catch {}
  }

  return {
    result: "ok",
    server_mark: SERVER_MARK,
    source: "read-only-db",
    company_id,
    table_candidates: tables.map((t) => ({ table: "business." + t.table, score: t.score })),
    organizations
  };
}

async function handleApi(req, res, parsed) {
  const pathname = parsed.pathname;

  if (pathname === "/__aicm_health") {
    sendJson(res, 200, {
      result: "ok",
      server_mark: SERVER_MARK,
      app_root: APP_ROOT,
      index_exists: fileExists(path.join(APP_ROOT, "index.html")),
      persona_database_url_set: !!process.env.PERSONA_DATABASE_URL
    });
    return true;
  }

  if (
    pathname === "/api/aicm/companies" ||
    pathname === "/api/companies" ||
    pathname === "/api/company-list" ||
    pathname === "/api/aicm/company-list"
  ) {
    try {
      sendJson(res, 200, await readCompanies());
    } catch (err) {
      sendJson(res, 500, {
        result: "error",
        server_mark: SERVER_MARK,
        error_code: "COMPANY_READ_FAILED",
        message: String(err && err.message || err)
      });
    }
    return true;
  }

  if (
    pathname === "/api/aicm/organizations" ||
    pathname === "/api/aicm/company-organizations" ||
    pathname === "/api/organizations" ||
    pathname === "/api/company-organizations" ||
    pathname === "/api/departments"
  ) {
    try {
      sendJson(res, 200, await readOrganizations(parsed.searchParams.get("company_id") || ""));
    } catch (err) {
      sendJson(res, 500, {
        result: "error",
        server_mark: SERVER_MARK,
        error_code: "ORGANIZATION_READ_FAILED",
        message: String(err && err.message || err)
      });
    }
    return true;
  }

  if (pathname === "/api/aicm/debug/schema") {
    try {
      const schema = await loadSchema();
      sendJson(res, 200, {
        result: "ok",
        server_mark: SERVER_MARK,
        schema
      });
    } catch (err) {
      sendJson(res, 500, {
        result: "error",
        server_mark: SERVER_MARK,
        error_code: "SCHEMA_READ_FAILED",
        message: String(err && err.message || err)
      });
    }
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  /* AICM_V2_PRODUCTION_UI_API_HOOK_AMF_AMI_V1 */
  if (_aicmV2ProdHandle(req, res)) return;

  /* AICM_SYSTEM_ROBOT_SELECTOR_ROUTE_HOOK_ALT_ALW_V1 inserted_by=inline arrow createServer */
  if (_aicmSystemRobotSelectorHandle(req, res)) return;

  try {
    const rawUrl = String(req.url || "/");
    const parsed = new URL(rawUrl, "http://127.0.0.1");

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,HEAD,OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      res.end();
      return;
    }

    if (await handleApi(req, res, parsed)) return;

    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, {
        result: "error",
        error_code: "METHOD_NOT_ALLOWED",
        server_mark: SERVER_MARK
      });
      return;
    }

    const filePath = resolveFile(rawUrl);

    if (filePath === null) {
      res.writeHead(204, { "cache-control": "no-store" });
      res.end();
      return;
    }

    if (serveFile(res, filePath)) return;

    const pathname = safeDecode(parsed.pathname || "/");
    const looksLikeAsset = /\.[a-zA-Z0-9]+$/.test(pathname) || pathname.startsWith("/assets/") || pathname.startsWith("/_aiworker/");
    if (!looksLikeAsset && serveFile(res, path.join(APP_ROOT, "index.html"))) return;

    sendJson(res, 404, {
      result: "error",
      error_code: "NOT_FOUND",
      server_mark: SERVER_MARK,
      request_url: rawUrl
    });
  } catch (err) {
    sendJson(res, 500, {
      result: "error",
      error_code: "SERVER_EXCEPTION",
      server_mark: SERVER_MARK,
      message: String(err && err.message || err)
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(SERVER_MARK);
  console.log("listening=http://" + HOST + ":" + PORT + "/");
  console.log("APP_ROOT=" + APP_ROOT);
});


/* AICM_SYSTEM_ROBOT_SELECTOR_ENDPOINT_ALT_ALW_V1
 * Read-only endpoint for AICompanyManager system-unlimited robot selector.
 * Source view:
 *   business.vw_ai_company_manager_system_robot_selector_options
 * Intended caller:
 *   Dashboard AI企業を表示 only.
 */
function _aicmSystemRobotSelectorJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function _aicmSystemRobotSelectorSqlLiteral(value) {
  return "'" + String(value || "").replace(/'/g, "''") + "'";
}

function _aicmSystemRobotSelectorHandle(req, res) {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const pathname = url.pathname;

  if (pathname !== "/api/aicm/ai-company-manager/system-robot-selector-options") {
    return false;
  }

  if (!process.env.PERSONA_DATABASE_URL) {
    _aicmSystemRobotSelectorJson(res, 500, {
      result: "error",
      server_mark: "AICM_SYSTEM_ROBOT_SELECTOR_ENDPOINT_ALT_ALW_V1",
      source: "business.vw_ai_company_manager_system_robot_selector_options",
      error_message: "PERSONA_DATABASE_URL is not set"
    });
    return true;
  }

  const companyId = url.searchParams.get("company_id") || "";
  const whereCompany = companyId ? " WHERE company_id::text = " + _aicmSystemRobotSelectorSqlLiteral(companyId) : "";

  const sql = `
SELECT COALESCE(jsonb_agg(to_jsonb(q) ORDER BY q.aiworker_model_code), '[]'::jsonb)::text
FROM (
  SELECT
    company_robot_entitlement_id::text AS company_robot_entitlement_id,
    company_id::text AS company_id,
    robot_pool_id::text AS robot_pool_id,
    aiworker_model_code,
    display_name,
    selector_label,
    aiworker_series_code,
    manufacturer_code,
    app_code,
    entitlement_scope_code,
    contracted_quantity,
    usable_quantity,
    assignment_mode_code,
    status_code,
    recommended_role_codes,
    updated_at::text AS updated_at
  FROM business.vw_ai_company_manager_system_robot_selector_options
  ${whereCompany}
) q;
`;

  try {
    const out = _aicmSystemRobotSelectorExecFileSync(
      "psql",
      [
        process.env.PERSONA_DATABASE_URL,
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
        maxBuffer: 1024 * 1024 * 8
      }
    );

    const text = String(out || "").trim() || "[]";
    const robots = JSON.parse(text);

    _aicmSystemRobotSelectorJson(res, 200, {
      result: "ok",
      server_mark: "AICM_SYSTEM_ROBOT_SELECTOR_ENDPOINT_ALT_ALW_V1",
      source: "business.vw_ai_company_manager_system_robot_selector_options",
      company_id: companyId,
      count: Array.isArray(robots) ? robots.length : 0,
      robots: Array.isArray(robots) ? robots : []
    });
  } catch (error) {
    _aicmSystemRobotSelectorJson(res, 500, {
      result: "error",
      server_mark: "AICM_SYSTEM_ROBOT_SELECTOR_ENDPOINT_ALT_ALW_V1",
      source: "business.vw_ai_company_manager_system_robot_selector_options",
      error_message: error && error.message ? error.message : String(error)
    });
  }

  return true;
}


/* AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1
 * Production UI v2 read/create API.
 * Data migration is not performed.
 */
function _aicmV2ProdJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function _aicmV2ProdSqlLiteral(value) {
  return "'" + String(value == null ? "" : value).replace(/'/g, "''") + "'";
}

function _aicmV2ProdReadBody(req) {
  return new Promise(function (resolve, reject) {
    var chunks = [];
    req.on("data", function (chunk) { chunks.push(chunk); });
    req.on("end", function () {
      var raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON body: " + error.message));
      }
    });
    req.on("error", reject);
  });
}

function _aicmV2ProdPsqlJson(sql) {
  if (!process.env.PERSONA_DATABASE_URL) {
    throw new Error("PERSONA_DATABASE_URL is not set");
  }

  var out = _aicmV2ProdExecFileSync(
    "psql",
    [
      process.env.PERSONA_DATABASE_URL,
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

  var text = String(out || "").trim();
  if (!text) return null;
  return JSON.parse(text);
}

function _aicmV2ProdRequiredUuid(value, name) {
  var v = String(value || "").trim();
  if (!/^[0-9a-fA-F-]{36}$/.test(v)) {
    throw new Error(name + " must be UUID");
  }
  return v;
}

function _aicmV2ProdRequiredText(value, name) {
  var v = String(value || "").trim();
  if (!v) throw new Error(name + " is required");
  return v;
}

function _aicmV2ProdContext(ownerCivilizationId) {
  var owner = _aicmV2ProdRequiredUuid(ownerCivilizationId, "owner_civilization_id");

  var sql = [
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'server_mark', " + _aicmV2ProdSqlLiteral("AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1") + ",",
    "  'owner_civilization_id', " + _aicmV2ProdSqlLiteral(owner) + ",",
    "  'companies', (SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb) FROM business.aicm_user_company c WHERE c.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'departments', (SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb) FROM business.aicm_user_company_department d WHERE d.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'sections', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb) FROM business.aicm_user_company_section s WHERE s.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'placements', (SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb) FROM business.vw_aicm_user_company_worker_placement_display p WHERE p.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'robot_catalog', (SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb) FROM business.vw_ai_company_manager_system_robot_selector_options r)",
    ")::text;"
  ].join("\n");

  return _aicmV2ProdPsqlJson(sql);
}

function _aicmV2ProdCreateCompany(body) {
  var owner = _aicmV2ProdRequiredUuid(body.owner_civilization_id, "owner_civilization_id");
  var name = _aicmV2ProdRequiredText(body.company_name, "company_name");
  var domain = String(body.business_domain || "");

  var sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_user_company (owner_civilization_id, company_name, business_domain, company_status, selected_flag)",
    "  VALUES (" + _aicmV2ProdSqlLiteral(owner) + "::uuid, " + _aicmV2ProdSqlLiteral(name) + ", " + _aicmV2ProdSqlLiteral(domain) + ", 'active', true)",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object('result','ok','server_mark'," + _aicmV2ProdSqlLiteral("AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1") + ",'company',to_jsonb(inserted))::text FROM inserted;"
  ].join("\n");

  return _aicmV2ProdPsqlJson(sql);
}

function _aicmV2ProdCreateDepartment(body) {
  var owner = _aicmV2ProdRequiredUuid(body.owner_civilization_id, "owner_civilization_id");
  var companyId = _aicmV2ProdRequiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  var name = _aicmV2ProdRequiredText(body.department_name, "department_name");
  var purpose = String(body.purpose || "");

  var sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_user_company_department (owner_civilization_id, aicm_user_company_id, department_name, purpose, department_status)",
    "  VALUES (" + _aicmV2ProdSqlLiteral(owner) + "::uuid, " + _aicmV2ProdSqlLiteral(companyId) + "::uuid, " + _aicmV2ProdSqlLiteral(name) + ", " + _aicmV2ProdSqlLiteral(purpose) + ", 'active')",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object('result','ok','server_mark'," + _aicmV2ProdSqlLiteral("AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1") + ",'department',to_jsonb(inserted))::text FROM inserted;"
  ].join("\n");

  return _aicmV2ProdPsqlJson(sql);
}

function _aicmV2ProdCreateSection(body) {
  var owner = _aicmV2ProdRequiredUuid(body.owner_civilization_id, "owner_civilization_id");
  var companyId = _aicmV2ProdRequiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  var departmentId = _aicmV2ProdRequiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
  var name = _aicmV2ProdRequiredText(body.section_name, "section_name");
  var purpose = String(body.purpose || "");

  var sql = [
    "WITH inserted AS (",
    "  INSERT INTO business.aicm_user_company_section (owner_civilization_id, aicm_user_company_id, aicm_user_company_department_id, section_name, purpose, section_status)",
    "  VALUES (" + _aicmV2ProdSqlLiteral(owner) + "::uuid, " + _aicmV2ProdSqlLiteral(companyId) + "::uuid, " + _aicmV2ProdSqlLiteral(departmentId) + "::uuid, " + _aicmV2ProdSqlLiteral(name) + ", " + _aicmV2ProdSqlLiteral(purpose) + ", 'active')",
    "  RETURNING *",
    ")",
    "SELECT jsonb_build_object('result','ok','server_mark'," + _aicmV2ProdSqlLiteral("AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1") + ",'section',to_jsonb(inserted))::text FROM inserted;"
  ].join("\n");

  return _aicmV2ProdPsqlJson(sql);
}

function _aicmV2ProdHandle(req, res) {
  var url = new URL(req.url || "/", "http://127.0.0.1");
  var path = url.pathname;

  if (!path.startsWith("/api/aicm/v2/")) return false;

  if (req.method === "OPTIONS") {
    _aicmV2ProdJson(res, 200, { result: "ok", server_mark: "AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1" });
    return true;
  }

  Promise.resolve()
    .then(function () {
      if (path === "/api/aicm/v2/context" && req.method === "GET") {
        return _aicmV2ProdContext(url.searchParams.get("owner_civilization_id") || "");
      }

      if (path === "/api/aicm/v2/company/create" && req.method === "POST") {
        return _aicmV2ProdReadBody(req).then(_aicmV2ProdCreateCompany);
      }

      if (path === "/api/aicm/v2/department/create" && req.method === "POST") {
        return _aicmV2ProdReadBody(req).then(_aicmV2ProdCreateDepartment);
      }

      if (path === "/api/aicm/v2/section/create" && req.method === "POST") {
        return _aicmV2ProdReadBody(req).then(_aicmV2ProdCreateSection);
      }

      return { result: "error", server_mark: "AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1", error_message: "unknown v2 endpoint" };
    })
    .then(function (payload) {
      var code = payload && payload.result === "ok" ? 200 : 400;
      _aicmV2ProdJson(res, code, payload || { result: "error", error_message: "empty response" });
    })
    .catch(function (error) {
      _aicmV2ProdJson(res, 500, {
        result: "error",
        server_mark: "AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1",
        error_message: error && error.message ? error.message : String(error)
      });
    });

  return true;
}
