#!/usr/bin/env node
"use strict";

const http = require("http");
const { spawnSync } = require("child_process");
const { URL } = require("url");

const PORT = Number(process.env.PORT || process.env.AICM_AIWORKER_API_PORT || 8789);
const DATABASE_URL = process.env.PERSONA_DATABASE_URL || "";
const DEFAULT_DRY_RUN = String(process.env.AICM_AIWORKER_DRY_RUN || "0") === "1";

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-AICM-Dry-Run"
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

function number(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < 0) return fallback;
  return Math.floor(parsed);
}

function getDryRun(req, urlObj) {
  const header = text(req.headers["x-aicm-dry-run"]).toLowerCase();
  const query = text(urlObj.searchParams.get("dry_run")).toLowerCase();

  if (header === "1" || header === "true") return true;
  if (query === "1" || query === "true") return true;

  return DEFAULT_DRY_RUN;
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

function validateGrantPayload(body) {
  const payload = {
    company_id: text(body.company_id || body.companyId),
    aiworker_model_code: text(body.aiworker_model_code || body.aiworkerModelCode),
    quantity: number(body.quantity || body.contracted_quantity || body.contractedQuantity || 1, 1) || 1,
    business_offer_code: text(body.business_offer_code || body.businessOfferCode || "standard"),
    entitlement_scope_code: text(body.entitlement_scope_code || body.entitlementScopeCode || "company"),
    assignment_mode_code: text(body.assignment_mode_code || body.assignmentModeCode || "unlimited_placement")
  };

  const errors = [];
  if (!payload.company_id) errors.push("company_id_required");
  if (!payload.aiworker_model_code) errors.push("aiworker_model_code_required");
  if (payload.quantity < 1) errors.push("quantity_must_be_positive");

  return { ok: errors.length === 0, errors, payload };
}

function validatePlacementPayload(body) {
  const metadata = body.metadata_jsonb || body.metadataJsonb || { source: "AICompanyManagerSaveClient" };

  const payload = {
    company_id: text(body.company_id || body.companyId),
    aiworker_model_code: text(body.aiworker_model_code || body.aiworkerModelCode),
    target_level_code: text(body.target_level_code || body.targetLevelCode),
    target_id: text(body.target_id || body.targetId),
    app_code: text(body.app_code || body.appCode || "AICompanyManager"),
    role_code: text(body.role_code || body.roleCode),
    internal_nickname: text(body.internal_nickname || body.internalNickname),
    placement_quantity: number(body.placement_quantity || body.placementQuantity || 1, 1) || 1,
    metadata_jsonb: JSON.stringify(metadata)
  };

  const errors = [];
  if (!payload.company_id) errors.push("company_id_required");
  if (!payload.aiworker_model_code) errors.push("aiworker_model_code_required");
  if (!payload.target_level_code) errors.push("target_level_code_required");
  if (!payload.role_code) errors.push("role_code_required");
  if (!payload.internal_nickname) errors.push("internal_nickname_required");

  return { ok: errors.length === 0, errors, payload };
}

function getGlobalSelectorOptions(roleCode) {
  const result = runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
)
FROM business.fn_business_robot_selector_options_for_role(:'role_code') t;
`, {
    role_code: roleCode || ""
  });

  return parseJsonFromPsql(result);
}

function getCompanySelectorOptions(companyId, roleCode) {
  const result = runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
)
FROM business.fn_company_robot_selector_options_for_role(:'company_id'::uuid, :'role_code') t;
`, {
    company_id: companyId || "",
    role_code: roleCode || ""
  });

  return parseJsonFromPsql(result);
}

function grantEntitlement(payload, dryRun) {
  const result = runPsql(`
BEGIN;

SELECT jsonb_build_object(
  'ok', true,
  'dry_run', :'dry_run',
  'company_robot_entitlement_id',
  business.fn_company_robot_grant_entitlement(
    :'company_id'::uuid,
    :'aiworker_model_code',
    :'quantity'::integer,
    :'business_offer_code',
    :'entitlement_scope_code',
    :'assignment_mode_code'
  )
);

${dryRun ? "ROLLBACK;" : "COMMIT;"}
`, {
    dry_run: dryRun ? "true" : "false",
    company_id: payload.company_id,
    aiworker_model_code: payload.aiworker_model_code,
    quantity: payload.quantity,
    business_offer_code: payload.business_offer_code,
    entitlement_scope_code: payload.entitlement_scope_code,
    assignment_mode_code: payload.assignment_mode_code
  });

  return parseJsonFromPsql(result);
}

function placeRobot(payload, dryRun) {
  const dryRunGrantCte = dryRun ? `
WITH _grant AS (
  SELECT business.fn_company_robot_grant_entitlement(
    :'company_id'::uuid,
    :'aiworker_model_code',
    1,
    'standard',
    'company',
    'unlimited_placement'
  ) AS entitlement_id
)
` : `
WITH _grant AS (
  SELECT NULL::uuid AS entitlement_id WHERE false
)
`;

  const result = runPsql(`
BEGIN;

${dryRunGrantCte}
SELECT jsonb_build_object(
  'ok', true,
  'dry_run', :'dry_run',
  'dry_run_entitlement_id', (SELECT entitlement_id FROM _grant LIMIT 1),
  'company_robot_placement_id',
  business.fn_company_robot_place(
    :'company_id'::uuid,
    :'aiworker_model_code',
    :'target_level_code',
    :'role_code',
    :'internal_nickname',
    NULLIF(:'target_id', '')::uuid,
    :'app_code',
    :'placement_quantity'::integer,
    :'metadata_jsonb'::jsonb
  ),
  'display_label',
  :'internal_nickname' || '@' || :'role_code'
);

${dryRun ? "ROLLBACK;" : "COMMIT;"}
`, {
    dry_run: dryRun ? "true" : "false",
    company_id: payload.company_id,
    aiworker_model_code: payload.aiworker_model_code,
    target_level_code: payload.target_level_code,
    role_code: payload.role_code,
    internal_nickname: payload.internal_nickname,
    target_id: payload.target_id || "",
    app_code: payload.app_code,
    placement_quantity: payload.placement_quantity,
    metadata_jsonb: payload.metadata_jsonb
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
      service: "aicm-business-aiworker-local-api",
      dry_run_default: DEFAULT_DRY_RUN,
      persona_database_url_set: Boolean(DATABASE_URL)
    });
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/global-selector-options") {
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const result = getGlobalSelectorOptions(roleCode);
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/company-selector-options") {
    const companyId = text(urlObj.searchParams.get("company_id"));
    const roleCode = text(urlObj.searchParams.get("role_code"));

    if (!companyId) {
      sendJson(res, 400, { ok: false, errors: ["company_id_required"] });
      return;
    }

    const result = getCompanySelectorOptions(companyId, roleCode);
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "POST" && urlObj.pathname === "/api/v1/business/aiworker/company-entitlement/grant") {
    const body = await readBody(req);
    const validation = validateGrantPayload(body);

    if (!validation.ok) {
      sendJson(res, 400, { ok: false, errors: validation.errors });
      return;
    }

    const result = grantEntitlement(validation.payload, getDryRun(req, urlObj));
    sendJson(res, result.ok ? 200 : 500, result);
    return;
  }

  if (req.method === "POST" && urlObj.pathname === "/api/v1/business/aiworker/company-robot/place") {
    const body = await readBody(req);
    const validation = validatePlacementPayload(body);

    if (!validation.ok) {
      sendJson(res, 400, { ok: false, errors: validation.errors });
      return;
    }

    const result = placeRobot(validation.payload, getDryRun(req, urlObj));
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
  console.log(`AICM_BUSINESS_AIWORKER_LOCAL_API_READY=true`);
  console.log(`PORT=${PORT}`);
  console.log(`DRY_RUN_DEFAULT=${DEFAULT_DRY_RUN ? "true" : "false"}`);
});
