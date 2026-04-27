import http from "http";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const host = process.env.AICM_UI_SMOKE_HOST || "127.0.0.1";
const port = Number(process.env.AICM_UI_SMOKE_PORT || "8792");
const dbUrl = process.env.PERSONA_DATABASE_URL || "";
const authToken = process.env.AICM_UI_SMOKE_AUTH_TOKEN || "";
const runtimeDir = process.env.AICM_UI_SMOKE_RUNTIME_DIR || "/data/data/com.termux/files/home/.tmp/AICompanyManager/ui_login_smoke_runtime";

const companyId = process.env.AICM_COMPANY_ID || "";
const departmentId = process.env.AICM_DEPARTMENT_ID || "";
const organizationId = process.env.AICM_ORGANIZATION_ID || "";

const uiPath = "/aicm/ui/post-release-login-smoke";
const apiPath = "/aicm/v1/ui-login-smoke/session";

function nowIso() {
  return new Date().toISOString();
}

function send(res, statusCode, contentType, text) {
  res.writeHead(statusCode, {
    "content-type": contentType,
    "content-length": Buffer.byteLength(text)
  });
  res.end(text);
}

function sendJson(res, statusCode, body) {
  send(res, statusCode, "application/json; charset=utf-8", JSON.stringify(body, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseLines(output) {
  const result = {};
  for (const line of String(output || "").split(/\r?\n/)) {
    if (!line.includes("|")) continue;
    const parts = line.split("|");
    const key = parts.shift();
    result[key] = parts.join("|");
  }
  return result;
}

function dollarQuoteJson(jsonText) {
  return `$claims$${jsonText}$claims$`;
}

function uiHtml() {
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>AICompanyManager Post-release UI Login Smoke</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; line-height: 1.6; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin: 12px 0; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 4px; }
    button { padding: 10px 14px; border-radius: 8px; border: 1px solid #aaa; }
  </style>
</head>
<body>
  <h1>AICompanyManager Post-release UI Login Smoke</h1>
  <div class="card">
    <p>Release status: <strong>PRODUCTION_RELEASE_EXECUTED</strong></p>
    <p>Strict tenant RLS: <strong>ACTIVE</strong></p>
    <p>Smoke-safe policy: <strong>REMOVED</strong></p>
  </div>
  <div class="card">
    <p>API endpoint: <code>${apiPath}</code></p>
    <p>Required claims: <code>company_id</code>, <code>department_ids</code>, <code>organization_ids</code>, <code>aicm_roles</code></p>
  </div>
  <div class="card" id="smoke-result">
    UI smoke page loaded.
  </div>
  <script>
    window.AICM_POST_RELEASE_UI_LOGIN_SMOKE = {
      status: "loaded",
      apiPath: "${apiPath}",
      strictTenantRls: true
    };
  </script>
</body>
</html>`;
}

function runDbClaimSmoke(claimsJson) {
  fs.mkdirSync(runtimeDir, { recursive: true });

  const sqlPath = path.join(runtimeDir, `ui_login_smoke_${Date.now()}_${Math.random().toString(16).slice(2)}.sql`);

  const sql = `
\\set ON_ERROR_STOP on
\\pset tuples_only on
\\pset format unaligned
\\pset fieldsep '|'

BEGIN READ ONLY;

SELECT set_config('request.jwt.claims', ${dollarQuoteJson(claimsJson)}, true);

SET LOCAL ROLE authenticated;

SELECT 'CLAIM_COMPANY_ID|' || coalesce(business.aicm_jwt_company_id()::text, 'NULL');
SELECT 'CLAIM_HAS_ADMIN|' || business.aicm_jwt_has_role('Admin')::text;
SELECT 'CLAIM_HAS_MANAGER|' || business.aicm_jwt_has_role('Manager')::text;
SELECT 'CLAIM_HAS_LEADER|' || business.aicm_jwt_has_role('Leader')::text;
SELECT 'CLAIM_HAS_WORKER|' || business.aicm_jwt_has_role('Worker')::text;
SELECT 'CLAIM_HAS_REVIEWER|' || business.aicm_jwt_has_role('Reviewer')::text;
SELECT 'CLAIM_HAS_DEPARTMENT|' || business.aicm_jwt_has_department('${departmentId}'::uuid)::text;
SELECT 'CLAIM_HAS_ORGANIZATION|' || business.aicm_jwt_has_organization('${organizationId}'::uuid)::text;

SELECT 'COMPANY_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_company
WHERE company_id = '${companyId}'::uuid;

SELECT 'DEPARTMENT_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_department
WHERE department_id = '${departmentId}'::uuid;

SELECT 'ORGANIZATION_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_organization
WHERE organization_id = '${organizationId}'::uuid;

SELECT 'LEDGER_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_department_task_ledger
WHERE company_id = '${companyId}'::uuid;

SELECT 'REVIEW_ITEM_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_review_item
WHERE company_id = '${companyId}'::uuid;

SELECT 'REVIEW_ACTION_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_review_action
WHERE company_id = '${companyId}'::uuid;

SELECT 'WORKFLOW_VISIBLE_COUNT|' || count(*)::text
FROM business.aicm_workflow_run
WHERE company_id = '${companyId}'::uuid;

RESET ROLE;

COMMIT;

SELECT 'BACKEND_DB_MODE|READ_ONLY';
`;

  fs.writeFileSync(sqlPath, sql, "utf8");

  const output = execFileSync("psql", [dbUrl, "-f", sqlPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return {
    sql_path: sqlPath,
    raw: output,
    parsed: parseLines(output)
  };
}

function evaluateCase(caseType, parsed) {
  const companyCount = Number(parsed.COMPANY_VISIBLE_COUNT || 0);
  const departmentCount = Number(parsed.DEPARTMENT_VISIBLE_COUNT || 0);
  const organizationCount = Number(parsed.ORGANIZATION_VISIBLE_COUNT || 0);

  if (caseType === "manager_login") {
    return companyCount >= 1 && departmentCount >= 1 && organizationCount >= 1;
  }

  if (caseType === "worker_login") {
    return companyCount >= 1 && departmentCount >= 1 && organizationCount >= 1;
  }

  if (caseType === "reviewer_login") {
    return companyCount >= 1 && departmentCount >= 1 && organizationCount >= 1;
  }

  if (caseType === "cross_company_login") {
    return companyCount === 0;
  }

  if (caseType === "missing_claims_login") {
    return companyCount === 0;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${host}:${port}`);

    if (req.method === "GET" && url.pathname === "/health") {
      return sendJson(res, 200, {
        result: "ok",
        service: "AICompanyManager post-release UI login smoke",
        ui_path: uiPath,
        api_path: apiPath
      });
    }

    if (req.method === "GET" && url.pathname === uiPath) {
      return send(res, 200, "text/html; charset=utf-8", uiHtml());
    }

    if (req.method !== "POST" || url.pathname !== apiPath) {
      return sendJson(res, 404, {
        result: "error",
        error_code: "NOT_FOUND"
      });
    }

    const auth = String(req.headers.authorization || "");
    if (!authToken || auth !== `Bearer ${authToken}`) {
      return sendJson(res, 401, {
        result: "error",
        error_code: "UNAUTHORIZED",
        message: "Bearer token is required."
      });
    }

    if (!dbUrl) {
      return sendJson(res, 500, {
        result: "error",
        error_code: "DATABASE_URL_MISSING"
      });
    }

    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const caseType = body.case_type || "manager_login";
    const claims = body.claims || {};

    const dbResult = runDbClaimSmoke(JSON.stringify(claims));
    const pass = evaluateCase(caseType, dbResult.parsed);

    return sendJson(res, pass ? 200 : 409, {
      result: pass ? "pass" : "fail",
      case_type: caseType,
      ui_login_smoke: true,
      release_status: "PRODUCTION_RELEASE_EXECUTED",
      strict_tenant_rls: true,
      db_mode: "READ_ONLY",
      db_data_write: false,
      policy_change: false,
      counts: {
        company_visible_count: Number(dbResult.parsed.COMPANY_VISIBLE_COUNT || 0),
        department_visible_count: Number(dbResult.parsed.DEPARTMENT_VISIBLE_COUNT || 0),
        organization_visible_count: Number(dbResult.parsed.ORGANIZATION_VISIBLE_COUNT || 0),
        ledger_visible_count: Number(dbResult.parsed.LEDGER_VISIBLE_COUNT || 0),
        review_item_visible_count: Number(dbResult.parsed.REVIEW_ITEM_VISIBLE_COUNT || 0),
        review_action_visible_count: Number(dbResult.parsed.REVIEW_ACTION_VISIBLE_COUNT || 0),
        workflow_visible_count: Number(dbResult.parsed.WORKFLOW_VISIBLE_COUNT || 0)
      },
      claims_seen: {
        company_id: dbResult.parsed.CLAIM_COMPANY_ID || "NULL",
        has_admin: dbResult.parsed.CLAIM_HAS_ADMIN || "false",
        has_manager: dbResult.parsed.CLAIM_HAS_MANAGER || "false",
        has_leader: dbResult.parsed.CLAIM_HAS_LEADER || "false",
        has_worker: dbResult.parsed.CLAIM_HAS_WORKER || "false",
        has_reviewer: dbResult.parsed.CLAIM_HAS_REVIEWER || "false",
        has_department: dbResult.parsed.CLAIM_HAS_DEPARTMENT || "false",
        has_organization: dbResult.parsed.CLAIM_HAS_ORGANIZATION || "false"
      },
      sql_path: dbResult.sql_path,
      timestamp: nowIso()
    });
  } catch (error) {
    return sendJson(res, 500, {
      result: "error",
      error_code: "INTERNAL_ERROR",
      message: error && error.message ? error.message : "unknown error",
      db_mode: "READ_ONLY_OR_NOT_REACHED",
      policy_change: false,
      db_data_write: false
    });
  }
});

server.listen(port, host, () => {
  console.log(`[${nowIso()}] AICompanyManager post-release UI login smoke listening on http://${host}:${port}`);
  console.log(`[${nowIso()}] GET ${uiPath}`);
  console.log(`[${nowIso()}] POST ${apiPath}`);
});
