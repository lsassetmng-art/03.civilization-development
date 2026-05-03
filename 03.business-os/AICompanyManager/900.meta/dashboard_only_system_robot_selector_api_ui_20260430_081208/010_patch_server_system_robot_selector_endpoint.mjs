import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_SYSTEM_ROBOT_SELECTOR_ENDPOINT_ALP_ALS_V1";
const HOOK = "AICM_SYSTEM_ROBOT_SELECTOR_ROUTE_HOOK_ALP_ALS_V1";

if (!src.includes(MARK)) {
  const importLine = 'import { execFileSync as _aicmSystemRobotSelectorExecFileSync } from "node:child_process";\n';

  if (!src.includes("_aicmSystemRobotSelectorExecFileSync")) {
    const importMatches = Array.from(src.matchAll(/^import\s+[\s\S]*?;\s*$/gm));
    if (importMatches.length > 0) {
      const last = importMatches[importMatches.length - 1];
      src = src.slice(0, last.index + last[0].length) + "\n" + importLine + src.slice(last.index + last[0].length);
    } else {
      src = importLine + src;
    }
  }

  const helper = `

/* ${MARK}
 * Read-only endpoint for AICompanyManager system-unlimited robot selector.
 * Source view:
 *   business.vw_ai_company_manager_system_robot_selector_options
 * DB read should be invoked by dashboard AI企業を表示 only.
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
  const allowed = pathname === "/api/aicm/ai-company-manager/system-robot-selector-options";

  if (!allowed) return false;

  if (!process.env.PERSONA_DATABASE_URL) {
    _aicmSystemRobotSelectorJson(res, 500, {
      result: "error",
      error_message: "PERSONA_DATABASE_URL is not set",
      source: "business.vw_ai_company_manager_system_robot_selector_options"
    });
    return true;
  }

  const companyId = url.searchParams.get("company_id") || "";
  const whereCompany = companyId ? " WHERE company_id::text = " + _aicmSystemRobotSelectorSqlLiteral(companyId) : "";

  const sql = \`
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
  \${whereCompany}
) q;
\`;

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
      server_mark: "${MARK}",
      source: "business.vw_ai_company_manager_system_robot_selector_options",
      company_id: companyId,
      count: Array.isArray(robots) ? robots.length : 0,
      robots: Array.isArray(robots) ? robots : []
    });
  } catch (error) {
    _aicmSystemRobotSelectorJson(res, 500, {
      result: "error",
      server_mark: "${MARK}",
      source: "business.vw_ai_company_manager_system_robot_selector_options",
      error_message: error && error.message ? error.message : String(error)
    });
  }

  return true;
}
`;

  src = src + helper;
}

if (!src.includes(HOOK)) {
  const arrow = src.match(/createServer\s*\(\s*(?:async\s*)?\(?\s*([A-Za-z_$][\\w$]*)\s*,\s*([A-Za-z_$][\\w$]*)\s*\)?\s*=>\s*\{/);
  const func = src.match(/createServer\s*\(\s*function\s*\(\s*([A-Za-z_$][\\w$]*)\s*,\s*([A-Za-z_$][\\w$]*)\s*\)\s*\{/);

  const match = arrow || func;
  if (!match) {
    throw new Error("Could not locate createServer request handler");
  }

  const insertPos = match.index + match[0].length;
  const reqName = match[1];
  const resName = match[2];

  const hook = `
  /* ${HOOK} */
  if (_aicmSystemRobotSelectorHandle(${reqName}, ${resName})) return;
`;

  src = src.slice(0, insertPos) + hook + src.slice(insertPos);
}

fs.writeFileSync(file, src);
console.log("server endpoint patched");
