import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_SYSTEM_ROBOT_SELECTOR_ENDPOINT_ALT_ALW_V1";
const HOOK = "AICM_SYSTEM_ROBOT_SELECTOR_ROUTE_HOOK_ALT_ALW_V1";

function addImport(source) {
  if (source.includes("_aicmSystemRobotSelectorExecFileSync")) return source;

  const importLine = 'import { execFileSync as _aicmSystemRobotSelectorExecFileSync } from "node:child_process";\n';
  const importMatches = Array.from(source.matchAll(/^import\s+[\s\S]*?;\s*$/gm));

  if (importMatches.length > 0) {
    const last = importMatches[importMatches.length - 1];
    return source.slice(0, last.index + last[0].length) + "\n" + importLine + source.slice(last.index + last[0].length);
  }

  return importLine + source;
}

function addHelper(source) {
  if (source.includes(MARK)) return source;

  const helper = `

/* ${MARK}
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
      server_mark: "${MARK}",
      source: "business.vw_ai_company_manager_system_robot_selector_options",
      error_message: "PERSONA_DATABASE_URL is not set"
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

  return source + helper;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findInsertionPoint(source) {
  const patterns = [
    {
      name: "inline function createServer",
      re: /(?:[A-Za-z_$][\w$]*\.)?createServer\s*\(\s*(?:async\s+)?function\s*(?:[A-Za-z_$][\w$]*)?\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)\s*\{/m
    },
    {
      name: "inline arrow createServer",
      re: /(?:[A-Za-z_$][\w$]*\.)?createServer\s*\(\s*(?:async\s*)?\(?\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>\s*\{/m
    },
    {
      name: "server on request function",
      re: /\.on\s*\(\s*["']request["']\s*,\s*(?:async\s+)?function\s*(?:[A-Za-z_$][\w$]*)?\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)\s*\{/m
    },
    {
      name: "server on request arrow",
      re: /\.on\s*\(\s*["']request["']\s*,\s*(?:async\s*)?\(?\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>\s*\{/m
    }
  ];

  for (const item of patterns) {
    const m = source.match(item.re);
    if (m && typeof m.index === "number") {
      return {
        name: item.name,
        req: m[1],
        res: m[2],
        insertPos: m.index + m[0].length
      };
    }
  }

  const named = source.match(/(?:[A-Za-z_$][\w$]*\.)?createServer\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/m);
  if (named) {
    const handlerName = named[1];

    const namedPatterns = [
      {
        name: "named function handler",
        re: new RegExp("function\\s+" + escapeRegExp(handlerName) + "\\s*\\(\\s*([A-Za-z_$][\\\\w$]*)\\s*,\\s*([A-Za-z_$][\\\\w$]*)\\s*\\)\\s*\\{", "m")
      },
      {
        name: "named const arrow handler",
        re: new RegExp("(?:const|let|var)\\s+" + escapeRegExp(handlerName) + "\\s*=\\s*(?:async\\s*)?\\(?\\s*([A-Za-z_$][\\\\w$]*)\\s*,\\s*([A-Za-z_$][\\\\w$]*)\\s*\\)?\\s*=>\\s*\\{", "m")
      },
      {
        name: "named const function handler",
        re: new RegExp("(?:const|let|var)\\s+" + escapeRegExp(handlerName) + "\\s*=\\s*(?:async\\s+)?function\\s*\\(\\s*([A-Za-z_$][\\\\w$]*)\\s*,\\s*([A-Za-z_$][\\\\w$]*)\\s*\\)\\s*\\{", "m")
      }
    ];

    for (const item of namedPatterns) {
      const m = source.match(item.re);
      if (m && typeof m.index === "number") {
        return {
          name: item.name + " / " + handlerName,
          req: m[1],
          res: m[2],
          insertPos: m.index + m[0].length
        };
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
    const scan = [];
    scan.push("Could not locate request handler insertion point.");
    scan.push("");
    scan.push("Relevant lines:");
    src.split(/\n/).forEach((line, index) => {
      if (/createServer|listen\(|request|writeHead|end\(|pathname|url\.pathname|api\/aicm|index\.html|static/i.test(line)) {
        scan.push(String(index + 1).padStart(5, " ") + ": " + line);
      }
    });
    fs.writeFileSync(file + ".alt_alw_patch_failed_context.txt", scan.join("\n") + "\n");
    throw new Error("Could not locate request handler insertion point. Context file: " + file + ".alt_alw_patch_failed_context.txt");
  }

  const hook = `
  /* ${HOOK} inserted_by=${point.name} */
  if (_aicmSystemRobotSelectorHandle(${point.req}, ${point.res})) return;
`;

  src = src.slice(0, point.insertPos) + hook + src.slice(point.insertPos);
}

fs.writeFileSync(file, src);
console.log("server endpoint hook patched");
