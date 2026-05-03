import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1";
const HOOK = "AICM_V2_PRODUCTION_UI_API_HOOK_AMF_AMI_V1";

function addImport(source) {
  if (source.includes("_aicmV2ProdExecFileSync")) return source;
  const line = 'import { execFileSync as _aicmV2ProdExecFileSync } from "node:child_process";\n';
  const matches = Array.from(source.matchAll(/^import\s+[\s\S]*?;\s*$/gm));
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    return source.slice(0, last.index + last[0].length) + "\n" + line + source.slice(last.index + last[0].length);
  }
  return line + source;
}

function addHelper(source) {
  if (source.includes(MARK)) return source;

  const helper = `

/* ${MARK}
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
    "  'server_mark', " + _aicmV2ProdSqlLiteral("${MARK}") + ",",
    "  'owner_civilization_id', " + _aicmV2ProdSqlLiteral(owner) + ",",
    "  'companies', (SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb) FROM business.aicm_user_company c WHERE c.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'departments', (SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb) FROM business.aicm_user_company_department d WHERE d.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'sections', (SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb) FROM business.aicm_user_company_section s WHERE s.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'placements', (SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb) FROM business.vw_aicm_user_company_worker_placement_display p WHERE p.owner_civilization_id::text = " + _aicmV2ProdSqlLiteral(owner) + "),",
    "  'robot_catalog', (SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.aiworker_model_code), '[]'::jsonb) FROM business.vw_ai_company_manager_system_robot_selector_options r)",
    ")::text;"
  ].join("\\n");

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
    "SELECT jsonb_build_object('result','ok','server_mark'," + _aicmV2ProdSqlLiteral("${MARK}") + ",'company',to_jsonb(inserted))::text FROM inserted;"
  ].join("\\n");

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
    "SELECT jsonb_build_object('result','ok','server_mark'," + _aicmV2ProdSqlLiteral("${MARK}") + ",'department',to_jsonb(inserted))::text FROM inserted;"
  ].join("\\n");

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
    "SELECT jsonb_build_object('result','ok','server_mark'," + _aicmV2ProdSqlLiteral("${MARK}") + ",'section',to_jsonb(inserted))::text FROM inserted;"
  ].join("\\n");

  return _aicmV2ProdPsqlJson(sql);
}

function _aicmV2ProdHandle(req, res) {
  var url = new URL(req.url || "/", "http://127.0.0.1");
  var path = url.pathname;

  if (!path.startsWith("/api/aicm/v2/")) return false;

  if (req.method === "OPTIONS") {
    _aicmV2ProdJson(res, 200, { result: "ok", server_mark: "${MARK}" });
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

      return { result: "error", server_mark: "${MARK}", error_message: "unknown v2 endpoint" };
    })
    .then(function (payload) {
      var code = payload && payload.result === "ok" ? 200 : 400;
      _aicmV2ProdJson(res, code, payload || { result: "error", error_message: "empty response" });
    })
    .catch(function (error) {
      _aicmV2ProdJson(res, 500, {
        result: "error",
        server_mark: "${MARK}",
        error_message: error && error.message ? error.message : String(error)
      });
    });

  return true;
}
`;

  return source + helper;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findInsertionPoint(source) {
  const patterns = [
    /(?:[A-Za-z_$][\w$]*\.)?createServer\s*\(\s*(?:async\s+)?function\s*(?:[A-Za-z_$][\w$]*)?\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)\s*\{/m,
    /(?:[A-Za-z_$][\w$]*\.)?createServer\s*\(\s*(?:async\s*)?\(?\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>\s*\{/m,
    /\.on\s*\(\s*["']request["']\s*,\s*(?:async\s+)?function\s*(?:[A-Za-z_$][\w$]*)?\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)\s*\{/m,
    /\.on\s*\(\s*["']request["']\s*,\s*(?:async\s*)?\(?\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>\s*\{/m
  ];

  for (const re of patterns) {
    const m = source.match(re);
    if (m && typeof m.index === "number") {
      return { req: m[1], res: m[2], insertPos: m.index + m[0].length };
    }
  }

  const named = source.match(/(?:[A-Za-z_$][\w$]*\.)?createServer\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/m);
  if (named) {
    const handlerName = named[1];
    const namedPatterns = [
      new RegExp("function\\s+" + escapeRegExp(handlerName) + "\\s*\\(\\s*([A-Za-z_$][\\\\w$]*)\\s*,\\s*([A-Za-z_$][\\\\w$]*)\\s*\\)\\s*\\{", "m"),
      new RegExp("(?:const|let|var)\\s+" + escapeRegExp(handlerName) + "\\s*=\\s*(?:async\\s*)?\\(?\\s*([A-Za-z_$][\\\\w$]*)\\s*,\\s*([A-Za-z_$][\\\\w$]*)\\s*\\)?\\s*=>\\s*\\{", "m"),
      new RegExp("(?:const|let|var)\\s+" + escapeRegExp(handlerName) + "\\s*=\\s*(?:async\\s+)?function\\s*\\(\\s*([A-Za-z_$][\\\\w$]*)\\s*,\\s*([A-Za-z_$][\\\\w$]*)\\s*\\)\\s*\\{", "m")
    ];

    for (const re of namedPatterns) {
      const m = source.match(re);
      if (m && typeof m.index === "number") {
        return { req: m[1], res: m[2], insertPos: m.index + m[0].length };
      }
    }
  }

  return null;
}

src = addImport(src);
src = addHelper(src);

if (!src.includes(HOOK)) {
  const point = findInsertionPoint(src);
  if (!point) {
    throw new Error("Could not locate server request handler");
  }

  const hook = `
  /* ${HOOK} */
  if (_aicmV2ProdHandle(${point.req}, ${point.res})) return;
`;

  src = src.slice(0, point.insertPos) + hook + src.slice(point.insertPos);
}

fs.writeFileSync(file, src);
console.log("production v2 API patched");
