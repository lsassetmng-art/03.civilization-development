#!/usr/bin/env node
"use strict";

const http = require("http");
const { spawnSync } = require("child_process");
const { URL } = require("url");

const PORT = Number(process.env.PORT || process.env.AICM_AIWORKER_DUPLICATE_GUARD_API_PORT || 8797);
const DATABASE_URL = process.env.PERSONA_DATABASE_URL || "";

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("invalid_json_body"));
      }
    });
    req.on("error", reject);
  });
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

function guardByFields(input) {
  const result = runPsql(`
SELECT business.fn_aicm_robot_placement_duplicate_guard(
  :'company_id'::uuid,
  :'role_code',
  :'target_level_code',
  NULLIF(:'target_id', '')::uuid,
  NULLIF(:'exclude_company_robot_placement_id', '')::uuid
);
`, {
    company_id: input.company_id || "",
    role_code: input.role_code || "",
    target_level_code: input.target_level_code || "",
    target_id: input.target_id || "",
    exclude_company_robot_placement_id: input.exclude_company_robot_placement_id || ""
  });

  return parseJsonFromPsql(result);
}

function getRoleRules() {
  const result = runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.role_code), '[]'::jsonb)
)
FROM business.vw_aicm_robot_role_duplicate_rule t;
`, {});

  return parseJsonFromPsql(result);
}

function normalizeInput(bodyOrQuery) {
  return {
    company_id: text(bodyOrQuery.company_id || bodyOrQuery.companyId),
    role_code: text(bodyOrQuery.role_code || bodyOrQuery.roleCode),
    target_level_code: text(bodyOrQuery.target_level_code || bodyOrQuery.targetLevelCode),
    target_id: text(bodyOrQuery.target_id || bodyOrQuery.targetId),
    exclude_company_robot_placement_id: text(
      bodyOrQuery.exclude_company_robot_placement_id || bodyOrQuery.excludeCompanyRobotPlacementId
    )
  };
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
      service: "aicm-business-aiworker-duplicate-guard-api",
      persona_database_url_set: Boolean(DATABASE_URL)
    });
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/duplicate-rules") {
    const result = getRoleRules();
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/duplicate-guard") {
    const input = normalizeInput({
      company_id: urlObj.searchParams.get("company_id"),
      role_code: urlObj.searchParams.get("role_code"),
      target_level_code: urlObj.searchParams.get("target_level_code"),
      target_id: urlObj.searchParams.get("target_id"),
      exclude_company_robot_placement_id: urlObj.searchParams.get("exclude_company_robot_placement_id")
    });

    if (!input.company_id || !input.role_code || !input.target_level_code) {
      sendJson(res, 400, {
        ok: false,
        errors: ["company_id_role_code_target_level_code_required"]
      });
      return;
    }

    const result = guardByFields(input);
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "POST" && urlObj.pathname === "/api/v1/business/aiworker/aicm/duplicate-guard") {
    const body = await readBody(req);
    const input = normalizeInput(body);

    if (!input.company_id || !input.role_code || !input.target_level_code) {
      sendJson(res, 400, {
        ok: false,
        errors: ["company_id_role_code_target_level_code_required"]
      });
      return;
    }

    const result = guardByFields(input);
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
  console.log("AICM_BUSINESS_AIWORKER_DUPLICATE_GUARD_API_READY=true");
  console.log(`PORT=${PORT}`);
});
