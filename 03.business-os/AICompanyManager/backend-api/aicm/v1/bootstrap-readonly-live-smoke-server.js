"use strict";

/**
 * AICompanyManager readonly bootstrap live smoke server.
 *
 * This is a local readonly smoke endpoint for Phase HE-HH.
 * It uses psql with PERSONA_DATABASE_URL on the backend side only.
 * It runs only SELECT statements inside a READ ONLY transaction.
 */

const http = require("http");
const { spawnSync } = require("child_process");

const PORT = Number(process.env.AICM_READONLY_PORT || "18761");
const DATABASE_URL_VALUE = process.env.PERSONA_DATABASE_URL || "";

const SQL = `
BEGIN READ ONLY;

WITH
companies AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) AS j
  FROM (
    SELECT *
    FROM business.aicm_company
    ORDER BY 1
    LIMIT 50
  ) x
),
departments AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) AS j
  FROM (
    SELECT *
    FROM business.aicm_department
    ORDER BY 1
    LIMIT 100
  ) x
),
organizations AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) AS j
  FROM (
    SELECT *
    FROM business.aicm_organization
    ORDER BY 1
    LIMIT 200
  ) x
),
task_ledger AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) AS j
  FROM (
    SELECT *
    FROM business.aicm_department_task_ledger
    ORDER BY 1
    LIMIT 200
  ) x
),
review_items AS (
  SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb) AS j
  FROM (
    SELECT *
    FROM business.aicm_review_item
    ORDER BY 1
    LIMIT 100
  ) x
)
SELECT jsonb_pretty(
  jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'companies', companies.j,
      'current_company_id', COALESCE(companies.j->0->>'company_id', ''),
      'departments', departments.j,
      'organizations', organizations.j,
      'task_ledger', task_ledger.j,
      'review_items', review_items.j,
      'repository_mode', 'api_readonly_connect_smoke'
    ),
    'warnings', jsonb_build_array('readonly_smoke', 'no_write_executed'),
    'request_id', 'phase_he_hh_readonly_bootstrap'
  )
)
FROM companies, departments, organizations, task_ledger, review_items;

COMMIT;
`;

function runReadonlyBootstrapQuery() {
  if (!DATABASE_URL_VALUE) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "PERSONA_DATABASE_URL_MISSING",
        error_message: "PERSONA_DATABASE_URL is required for readonly backend smoke.",
        details: {},
        request_id: "phase_he_hh_env_missing"
      }
    };
  }

  const result = spawnSync(
    "psql",
    ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", DATABASE_URL_VALUE],
    {
      input: SQL,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20
    }
  );

  if (result.status !== 0) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "READONLY_BOOTSTRAP_QUERY_FAILED",
        error_message: "Readonly bootstrap query failed.",
        details: {
          stderr: result.stderr || "",
          stdout: result.stdout || ""
        },
        request_id: "phase_he_hh_query_failed"
      }
    };
  }

  const text = (result.stdout || "").trim();

  try {
    return {
      statusCode: 200,
      body: JSON.parse(text)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        ok: false,
        error_code: "READONLY_BOOTSTRAP_RESPONSE_PARSE_FAILED",
        error_message: "Readonly bootstrap SQL returned non JSON output.",
        details: {
          parse_error: String(error && error.message ? error.message : error),
          raw: text
        },
        request_id: "phase_he_hh_parse_failed"
      }
    };
  }
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" || req.url.split("?")[0] !== "/api/aicm/v1/bootstrap") {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: false,
      error_code: "NOT_FOUND",
      error_message: "Endpoint not found.",
      details: {
        method: req.method,
        url: req.url
      },
      request_id: "phase_he_hh_not_found"
    }));
    return;
  }

  const result = runReadonlyBootstrapQuery();
  res.writeHead(result.statusCode, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(result.body, null, 2));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICM_READONLY_BOOTSTRAP_SERVER_READY port=" + PORT);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
