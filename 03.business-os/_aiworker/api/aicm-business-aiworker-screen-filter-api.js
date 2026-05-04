#!/usr/bin/env node
"use strict";

const http = require("http");
const { spawnSync } = require("child_process");
const { URL } = require("url");

const PORT = Number(process.env.PORT || process.env.AICM_AIWORKER_SCREEN_FILTER_API_PORT || process.env.AICM_AIWORKER_API_PORT || 8796);
const DATABASE_URL = process.env.PERSONA_DATABASE_URL || "";

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function text(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function runPsql(sql, variables) {
  if (!DATABASE_URL) {
    return {
      ok: false,
      error: "PERSONA_DATABASE_URL_not_set",
      stdout: "",
      stderr: ""
    };
  }

  const args = ["-q", "-v", "ON_ERROR_STOP=1", "-At"];

  Object.keys(variables || {}).forEach(key => {
    args.push("-v", `${key}=${variables[key] === null || variables[key] === undefined ? "" : String(variables[key])}`);
  });

  args.push(DATABASE_URL);

  const result = spawnSync("psql", args, {
    input: sql,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function parseJsonFromPsql(result) {
  if (!result.ok) {
    return {
      ok: false,
      error: "psql_failed",
      detail: result.stderr || result.stdout
    };
  }

  const raw = String(result.stdout || "").trim();

  if (!raw) {
    return {
      ok: false,
      error: "empty_psql_result"
    };
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      error: "invalid_json_from_psql",
      raw
    };
  }
}

function getRouteDefinitions() {
  const result = runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.route_code), '[]'::jsonb)
)
FROM business.vw_aicm_screen_robot_route_definition t;
`, {});

  return parseJsonFromPsql(result);
}

function getFilteredPlacements(companyId, roleCode, targetLevelCode, targetId, statusCode) {
  const result = runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.updated_at DESC), '[]'::jsonb),
  'filter', jsonb_build_object(
    'company_id', :'company_id',
    'role_code', :'role_code',
    'target_level_code', :'target_level_code',
    'target_id', :'target_id',
    'status_code', :'status_code'
  )
)
FROM business.fn_aicm_company_robot_placements_filtered(
  :'company_id'::uuid,
  NULLIF(:'role_code', ''),
  NULLIF(:'target_level_code', ''),
  NULLIF(:'target_id', '')::uuid,
  NULLIF(:'status_code', '')
) t;
`, {
    company_id: companyId || "",
    role_code: roleCode || "",
    target_level_code: targetLevelCode || "",
    target_id: targetId || "",
    status_code: statusCode || "active"
  });

  return parseJsonFromPsql(result);
}

async function handle(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "aicm-business-aiworker-screen-filter-api",
      persona_database_url_set: Boolean(DATABASE_URL)
    });
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/screen-routes") {
    const result = getRouteDefinitions();
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/placements-filtered") {
    const companyId = text(urlObj.searchParams.get("company_id"));
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const targetLevelCode = text(urlObj.searchParams.get("target_level_code"));
    const targetId = text(urlObj.searchParams.get("target_id"));
    const statusCode = text(urlObj.searchParams.get("status_code") || "active");

    if (!companyId) {
      sendJson(res, 400, {
        ok: false,
        errors: ["company_id_required"]
      });
      return;
    }

    const result = getFilteredPlacements(companyId, roleCode, targetLevelCode, targetId, statusCode);
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "not_found",
    path: urlObj.pathname
  });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(error => {
    sendJson(res, 500, {
      ok: false,
      error: "internal_error",
      detail: error.message
    });
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICM_BUSINESS_AIWORKER_SCREEN_FILTER_API_READY=true");
  console.log(`PORT=${PORT}`);
});
