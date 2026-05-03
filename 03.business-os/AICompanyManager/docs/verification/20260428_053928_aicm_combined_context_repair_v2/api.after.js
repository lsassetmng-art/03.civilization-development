#!/usr/bin/env node
"use strict";

const http = require("http");
const { spawnSync } = require("child_process");
const { URL } = require("url");

const PORT = Number(process.env.PORT || process.env.AICM_AIWORKER_API_PORT || 8801);
const DATABASE_URL = process.env.PERSONA_DATABASE_URL || "";
const AUTH_REQUIRED = String(process.env.AICM_AIWORKER_AUTH_REQUIRED || "0") === "1";
const AUDIT_ENABLED = String(process.env.AICM_AIWORKER_AUDIT_ENABLED || "1") !== "0";
const AUDIT_DRY_RUN = String(process.env.AICM_AIWORKER_AUDIT_DRY_RUN || "1") !== "0";
const DRY_RUN_DEFAULT = String(process.env.AICM_AIWORKER_DRY_RUN || "1") !== "0";

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-AICM-AIWORKER-TOKEN,X-AICM-Dry-Run,Authorization"
  });
  res.end(body);
}

function text(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function sqlLit(value) {
  return "'" + String(value === null || value === undefined ? "" : value).replace(/'/g, "''") + "'";
}

function uuidSql(value) {
  const v = text(value);
  return v ? `${sqlLit(v)}::uuid` : "NULL::uuid";
}

function boolSql(value) {
  return value ? "true" : "false";
}

function jsonSql(value) {
  return `${sqlLit(JSON.stringify(value || {}))}::jsonb`;
}

function runPsql(sql) {
  if (!DATABASE_URL) {
    return {
      ok: false,
      status: 1,
      stdout: "",
      stderr: "PERSONA_DATABASE_URL_not_set"
    };
  }

  const result = spawnSync("psql", ["-q", "-v", "ON_ERROR_STOP=1", "-At", DATABASE_URL], {
    input: sql,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function extractJsonLine(raw) {
  const lines = String(raw || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("{") || line.startsWith("[")) return line;
  }

  return "";
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
  const jsonLine = extractJsonLine(raw);

  if (!jsonLine) {
    return {
      ok: false,
      error: "empty_json_result",
      raw
    };
  }

  try {
    return JSON.parse(jsonLine);
  } catch (error) {
    return {
      ok: false,
      error: "invalid_json_from_psql",
      raw
    };
  }
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

function getToken(req) {
  const direct = text(req.headers["x-aicm-aiworker-token"]);
  if (direct) return direct;

  const auth = text(req.headers.authorization);
  if (/^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }

  return "";
}

function getDryRun(req, body) {
  const header = text(req.headers["x-aicm-dry-run"]).toLowerCase();
  if (header === "true" || header === "1") return true;
  if (header === "false" || header === "0") return false;

  if (body && body.dry_run !== undefined) return Boolean(body.dry_run);
  if (body && body.dryRun !== undefined) return Boolean(body.dryRun);

  return DRY_RUN_DEFAULT;
}

function auditOnly(req, endpointCode, actionCode, companyId, dryRun, allowed, reason, requestJson, responseJson) {
  if (!AUDIT_ENABLED) {
    return {
      ok: true,
      audit_skipped: true
    };
  }

  const userAgent = text(req.headers["user-agent"]);

  const sql = `
${AUDIT_DRY_RUN ? "BEGIN;" : ""}
SELECT jsonb_build_object(
  'ok', true,
  'audit_id', business.fn_aicm_aiworker_api_audit_write(
    NULL::uuid,
    NULL::uuid,
    ${sqlLit(AUTH_REQUIRED ? "" : "auth_off_local")},
    ${uuidSql(companyId)},
    ${sqlLit(endpointCode)},
    ${sqlLit(actionCode)},
    ${boolSql(dryRun)},
    ${boolSql(allowed)},
    ${sqlLit(allowed ? "allowed" : "denied")},
    ${allowed ? "NULL" : sqlLit("AUTH_DENIED")},
    ${sqlLit(reason)},
    ${jsonSql(requestJson)},
    ${jsonSql(responseJson)},
    NULL::inet,
    ${sqlLit(userAgent)},
    '{"source":"api_v3_audit_only"}'::jsonb
  )
);
${AUDIT_DRY_RUN ? "ROLLBACK;" : ""}
`;

  return parseJsonFromPsql(runPsql(sql));
}

function authCheck(req, endpointCode, actionCode, companyId, dryRun, requestJson) {
  const token = getToken(req);

  if (!AUTH_REQUIRED && !token) {
    auditOnly(req, endpointCode, actionCode, companyId, dryRun, true, "auth_not_required", requestJson, {
      allowed: true,
      reason: "auth_not_required"
    });

    return {
      ok: true,
      allowed: true,
      auth_required: false,
      reason: "auth_not_required",
      client_code: "auth_off_local"
    };
  }

  const userAgent = text(req.headers["user-agent"]);

  const sql = `
${AUDIT_DRY_RUN ? "BEGIN;" : ""}
SELECT business.fn_aicm_aiworker_api_auth_check(
  ${sqlLit(token)},
  ${uuidSql(companyId)},
  ${sqlLit(endpointCode)},
  ${sqlLit(actionCode)},
  ${boolSql(dryRun)},
  ${jsonSql(requestJson)},
  NULL::inet,
  ${sqlLit(userAgent)}
);
${AUDIT_DRY_RUN ? "ROLLBACK;" : ""}
`;

  return parseJsonFromPsql(runPsql(sql));
}

function requireAuth(req, res, endpointCode, actionCode, companyId, dryRun, requestJson) {
  const auth = authCheck(req, endpointCode, actionCode, companyId, dryRun, requestJson);

  if (!auth.ok || auth.allowed !== true) {
    sendJson(res, 401, {
      ok: false,
      error: "unauthorized",
      auth
    });
    return null;
  }

  return auth;
}

function selectorGlobal(roleCode) {
  return parseJsonFromPsql(runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_rank, t.aiworker_model_code), '[]'::jsonb)
)
FROM business.fn_business_robot_selector_options_for_role(${sqlLit(roleCode)}) t;
`));
}

function selectorCompany(companyId, roleCode) {
  return parseJsonFromPsql(runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_rank, t.aiworker_model_code), '[]'::jsonb)
)
FROM business.fn_company_robot_selector_options_for_role(${uuidSql(companyId)}, ${sqlLit(roleCode)}) t;
`));
}

function placementsFiltered(companyId, roleCode, targetLevelCode, targetId, statusCode) {
  return parseJsonFromPsql(runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.updated_at DESC), '[]'::jsonb)
)
FROM business.fn_aicm_company_robot_placements_filtered(
  ${uuidSql(companyId)},
  NULLIF(${sqlLit(roleCode)}, ''),
  NULLIF(${sqlLit(targetLevelCode)}, ''),
  NULLIF(${sqlLit(targetId)}, '')::uuid,
  NULLIF(${sqlLit(statusCode || "active")}, '')
) t;
`));
}

function grantEntitlement(body, dryRun) {
  const companyId = body.company_id || body.companyId || "";
  const modelCode = body.aiworker_model_code || body.aiworkerModelCode || "";
  const quantity = Number(body.quantity || body.contracted_quantity || body.contractedQuantity || 1);
  const offerCode = body.business_offer_code || body.businessOfferCode || "standard";
  const scopeCode = body.entitlement_scope_code || body.entitlementScopeCode || "company";
  const assignmentMode = body.assignment_mode_code || body.assignmentModeCode || "unlimited_placement";

  return parseJsonFromPsql(runPsql(`
${dryRun ? "BEGIN;" : ""}
SELECT jsonb_build_object(
  'ok', true,
  'dry_run', ${boolSql(dryRun)},
  'company_robot_entitlement_id', business.fn_company_robot_grant_entitlement(
    ${uuidSql(companyId)},
    ${sqlLit(modelCode)},
    ${Number.isFinite(quantity) ? quantity : 1},
    ${sqlLit(offerCode)},
    ${sqlLit(scopeCode)},
    ${sqlLit(assignmentMode)}
  )
);
${dryRun ? "ROLLBACK;" : ""}
`));
}

function placeRobot(body, dryRun) {
  const companyId = body.company_id || body.companyId || "";
  const modelCode = body.aiworker_model_code || body.aiworkerModelCode || "HD-R3";
  const targetLevel = body.target_level_code || body.targetLevelCode || "section";
  const roleCode = body.role_code || body.roleCode || "Worker";
  const nickname = body.internal_nickname || body.internalNickname || "Smoke Worker";
  const targetId = body.target_id || body.targetId || "";
  const appCode = body.app_code || body.appCode || "AICompanyManager";
  const quantity = Number(body.placement_quantity || body.placementQuantity || 1);
  const metadata = body.metadata_jsonb || body.metadataJsonb || {};

  return parseJsonFromPsql(runPsql(`
BEGIN;

CREATE TEMP TABLE tmp_aicm_grant_result ON COMMIT DROP AS
SELECT business.fn_company_robot_grant_entitlement(
  ${uuidSql(companyId)},
  ${sqlLit(modelCode)},
  1,
  'standard',
  'company',
  'unlimited_placement'
) AS entitlement_id;

CREATE TEMP TABLE tmp_aicm_place_result ON COMMIT DROP AS
SELECT business.fn_company_robot_place(
  ${uuidSql(companyId)},
  ${sqlLit(modelCode)},
  ${sqlLit(targetLevel)},
  ${sqlLit(roleCode)},
  ${sqlLit(nickname)},
  ${uuidSql(targetId)},
  ${sqlLit(appCode)},
  ${Number.isFinite(quantity) ? quantity : 1},
  jsonb_build_object(
    'source', 'api_v3_place_endpoint_repair_v3',
    'repair_mode', 'active_js_template_interpolation',
    'model_code', ${sqlLit(modelCode)},
    'role_code', ${sqlLit(roleCode)}
  ) || ${jsonSql(metadata)}
) AS placement_id
FROM tmp_aicm_grant_result;

SELECT jsonb_build_object(
  'ok', true,
  'dry_run', ${boolSql(dryRun)},
  'repair_mode', 'active_js_template_interpolation',
  'aiworker_model_code', ${sqlLit(modelCode)},
  'role_code', ${sqlLit(roleCode)},
  'target_level_code', ${sqlLit(targetLevel)},
  'company_robot_entitlement_id', (SELECT entitlement_id FROM tmp_aicm_grant_result),
  'company_robot_placement_id', (SELECT placement_id FROM tmp_aicm_place_result),
  'display_label', ${sqlLit(nickname)} || '@' || ${sqlLit(roleCode)}
);

${dryRun ? "ROLLBACK;" : "COMMIT;"}
`));
}

function updatePlacement(body, dryRun) {
  const placementId = body.company_robot_placement_id || body.companyRobotPlacementId || "";
  const nickname = body.internal_nickname || body.internalNickname || "";
  const roleCode = body.role_code || body.roleCode || "";
  const targetLevel = body.target_level_code || body.targetLevelCode || "";
  const targetId = body.target_id || body.targetId || "";
  const metadata = body.metadata_jsonb || body.metadataJsonb || {};

  return parseJsonFromPsql(runPsql(`
${dryRun ? "BEGIN;" : ""}
SELECT jsonb_build_object(
  'ok', true,
  'dry_run', ${boolSql(dryRun)},
  'company_robot_placement_id', business.fn_company_robot_placement_update(
    ${uuidSql(placementId)},
    NULLIF(${sqlLit(nickname)}, ''),
    NULLIF(${sqlLit(roleCode)}, ''),
    NULLIF(${sqlLit(targetLevel)}, ''),
    NULLIF(${sqlLit(targetId)}, '')::uuid,
    ${jsonSql(metadata)}
  )
);
${dryRun ? "ROLLBACK;" : ""}
`));
}

function deactivatePlacement(body, dryRun) {
  const placementId = body.company_robot_placement_id || body.companyRobotPlacementId || "";
  const reason = body.reason || "api_v3_deactivate";
  const metadata = body.metadata_jsonb || body.metadataJsonb || {};

  return parseJsonFromPsql(runPsql(`
${dryRun ? "BEGIN;" : ""}
SELECT jsonb_build_object(
  'ok', true,
  'dry_run', ${boolSql(dryRun)},
  'company_robot_placement_id', business.fn_company_robot_placement_deactivate(
    ${uuidSql(placementId)},
    ${sqlLit(reason)},
    ${jsonSql(metadata)}
  )
);
${dryRun ? "ROLLBACK;" : ""}
`));
}

function smokeCrud(body, dryRun) {
  const companyId = body.company_id || body.companyId || "00000000-0000-4000-8000-000000000001";
  const modelCode = body.aiworker_model_code || body.aiworkerModelCode || "HD-R3";
  const roleCode = body.role_code || body.roleCode || "Worker";

  return parseJsonFromPsql(runPsql(`
SELECT jsonb_build_object(
  'ok', true,
  'dry_run', ${boolSql(dryRun)},
  'smoke_mode', 'readonly_preflight',
  'company_id', ${uuidSql(companyId)},
  'aiworker_model_code', ${sqlLit(modelCode)},
  'role_code', ${sqlLit(roleCode)},
  'robot_pool_exists', EXISTS (
    SELECT 1
    FROM business.robot_pool
    WHERE aiworker_model_code = ${sqlLit(modelCode)}
      AND status_code = 'active'
  ),
  'role_catalog_exists', EXISTS (
    SELECT 1
    FROM business.robot_placement_role_catalog
    WHERE role_code = ${sqlLit(roleCode)}
      AND status_code = 'active'
  ),
  'selector_has_model', EXISTS (
    SELECT 1
    FROM business.fn_business_robot_selector_options_for_role(${sqlLit(roleCode)}) s
    WHERE s.aiworker_model_code = ${sqlLit(modelCode)}
  ),
  'required_functions', jsonb_build_object(
    'fn_business_robot_selector_options_for_role',
      to_regprocedure('business.fn_business_robot_selector_options_for_role(text)') IS NOT NULL,
    'fn_company_robot_grant_entitlement',
      to_regprocedure('business.fn_company_robot_grant_entitlement(uuid,text,integer,text,text,text)') IS NOT NULL,
    'fn_company_robot_place',
      to_regprocedure('business.fn_company_robot_place(uuid,text,text,text,text,uuid,text,integer,jsonb)') IS NOT NULL
  )
);
`));
}

function referenceRoles(roleCode) {
  const sql =
    "SELECT jsonb_build_object(" +
    "  'ok', true, " +
    "  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.role_code), '[]'::jsonb) " +
    ") " +
    "FROM ( " +
    "  SELECT * FROM cx22073jw.vw_robot_role_reference_v1 " +
    "  WHERE (" + sqlLit(roleCode) + " = '' OR role_code = " + sqlLit(roleCode) + ") " +
    ") t;";
  return parseJsonFromPsql(runPsql(sql));
}

function referencePersonalities(modelCode, seriesCode) {
  const sql =
    "SELECT jsonb_build_object(" +
    "  'ok', true, " +
    "  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.aiworker_series_code, t.aiworker_model_code), '[]'::jsonb) " +
    ") " +
    "FROM ( " +
    "  SELECT * FROM cx22073jw.vw_robot_personality_reference_v1 " +
    "  WHERE (" + sqlLit(modelCode) + " = '' OR aiworker_model_code = " + sqlLit(modelCode) + ") " +
    "    AND (" + sqlLit(seriesCode) + " = '' OR aiworker_series_code = " + sqlLit(seriesCode) + ") " +
    ") t;";
  return parseJsonFromPsql(runPsql(sql));
}

function referencePublicProfiles(modelCode, seriesCode, profileStatusCode) {
  const sql =
    "SELECT jsonb_build_object(" +
    "  'ok', true, " +
    "  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.aiworker_series_code, t.aiworker_model_code), '[]'::jsonb) " +
    ") " +
    "FROM ( " +
    "  SELECT * FROM cx22073jw.vw_robot_public_profile_reference_v1 " +
    "  WHERE (" + sqlLit(modelCode) + " = '' OR aiworker_model_code = " + sqlLit(modelCode) + ") " +
    "    AND (" + sqlLit(seriesCode) + " = '' OR aiworker_series_code = " + sqlLit(seriesCode) + ") " +
    "    AND (" + sqlLit(profileStatusCode) + " = '' OR public_profile_status_code = " + sqlLit(profileStatusCode) + ") " +
    ") t;";
  return parseJsonFromPsql(runPsql(sql));
}

function referenceModelFull(modelCode, seriesCode, roleCode) {
  const sql =
    "SELECT jsonb_build_object(" +
    "  'ok', true, " +
    "  'items', COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.aiworker_series_code, t.aiworker_model_code), '[]'::jsonb) " +
    ") " +
    "FROM ( " +
    "  SELECT * FROM cx22073jw.vw_robot_model_full_reference_v2 " +
    "  WHERE (" + sqlLit(modelCode) + " = '' OR aiworker_model_code = " + sqlLit(modelCode) + ") " +
    "    AND (" + sqlLit(seriesCode) + " = '' OR aiworker_series_code = " + sqlLit(seriesCode) + ") " +
    "    AND (" + sqlLit(roleCode) + " = '' OR " + sqlLit(roleCode) + " = ANY(placement_role_codes)) " +
    ") t;";
  return parseJsonFromPsql(runPsql(sql));
}

function combinedRollbackSmoke(body, auth) {
  const companyId = body.company_id || body.companyId || "";
  const modelCode = body.aiworker_model_code || body.aiworkerModelCode || "HD-R3";
  const targetLevel = body.target_level_code || body.targetLevelCode || "section";
  const roleCode = body.role_code || body.roleCode || "Worker";
  const nickname = body.internal_nickname || body.internalNickname || "Smoke Worker";
  const updateNickname = body.update_internal_nickname || body.updateInternalNickname || nickname + " Updated";
  const targetId = body.target_id || body.targetId || "";
  const appCode = body.app_code || body.appCode || "AICompanyManager";
  const quantity = Number(body.placement_quantity || body.placementQuantity || 1);
  const metadata = body.metadata_jsonb || body.metadataJsonb || {};

  const apiClientId =
    (auth && (auth.api_client_id || auth.apiClientId || auth.client_id || auth.clientId)) ||
    body.api_client_id ||
    body.apiClientId ||
    "";

  return parseJsonFromPsql(runPsql(`
BEGIN;

SELECT set_config('app.current_company_id', ${sqlLit(companyId)}, true);
SELECT set_config('app.current_api_client_id', ${sqlLit(apiClientId)}, true);

CREATE TEMP TABLE tmp_aicm_combined_grant_result ON COMMIT DROP AS
SELECT business.fn_company_robot_grant_entitlement(
  ${uuidSql(companyId)},
  ${sqlLit(modelCode)},
  1,
  'standard',
  'company',
  'unlimited_placement'
) AS entitlement_id;

CREATE TEMP TABLE tmp_aicm_combined_place_result ON COMMIT DROP AS
SELECT business.fn_company_robot_place(
  ${uuidSql(companyId)},
  ${sqlLit(modelCode)},
  ${sqlLit(targetLevel)},
  ${sqlLit(roleCode)},
  ${sqlLit(nickname)},
  ${uuidSql(targetId)},
  ${sqlLit(appCode)},
  ${Number.isFinite(quantity) ? quantity : 1},
  jsonb_build_object(
    'source', 'combined_api_rollback_smoke_endpoint',
    'smoke_mode', 'combined_grant_place_update_deactivate',
    'model_code', ${sqlLit(modelCode)},
    'role_code', ${sqlLit(roleCode)}
  ) || ${jsonSql(metadata)}
) AS placement_id
FROM tmp_aicm_combined_grant_result;

CREATE TEMP TABLE tmp_aicm_combined_update_result ON COMMIT DROP AS
SELECT business.fn_company_robot_placement_update(
  placement_id,
  ${sqlLit(updateNickname)},
  ${sqlLit(roleCode)},
  ${sqlLit(targetLevel)},
  ${uuidSql(targetId)},
  jsonb_build_object(
    'source', 'combined_api_rollback_smoke_endpoint',
    'step', 'update',
    'model_code', ${sqlLit(modelCode)},
    'role_code', ${sqlLit(roleCode)}
  ) || ${jsonSql(metadata)}
) AS updated_placement_id
FROM tmp_aicm_combined_place_result;

CREATE TEMP TABLE tmp_aicm_combined_deactivate_result ON COMMIT DROP AS
SELECT business.fn_company_robot_placement_deactivate(
  placement_id,
  'combined_api_rollback_smoke_deactivate',
  jsonb_build_object(
    'source', 'combined_api_rollback_smoke_endpoint',
    'step', 'deactivate',
    'model_code', ${sqlLit(modelCode)},
    'role_code', ${sqlLit(roleCode)}
  ) || ${jsonSql(metadata)}
) AS deactivated_placement_id
FROM tmp_aicm_combined_place_result;

SELECT jsonb_build_object(
  'ok', true,
  'dry_run', true,
  'rollback_smoke', true,
  'smoke_mode', 'combined_grant_place_update_deactivate',
  'aiworker_model_code', ${sqlLit(modelCode)},
  'role_code', ${sqlLit(roleCode)},
  'target_level_code', ${sqlLit(targetLevel)},
  'combined_api_context_company_id', current_setting('app.current_company_id', true),
  'combined_api_context_api_client_id', current_setting('app.current_api_client_id', true),
  'combined_api_context_matched', (business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)})->>'matched')::boolean,
  'company_robot_entitlement_id', (SELECT entitlement_id FROM tmp_aicm_combined_grant_result),
  'company_robot_placement_id', (SELECT placement_id FROM tmp_aicm_combined_place_result),
  'updated_company_robot_placement_id', (SELECT updated_placement_id FROM tmp_aicm_combined_update_result),
  'deactivated_company_robot_placement_id', (SELECT deactivated_placement_id FROM tmp_aicm_combined_deactivate_result),
  'display_label', ${sqlLit(updateNickname)} || '@' || ${sqlLit(roleCode)}
);

ROLLBACK;
`));
}

function companyContextRollbackSmoke(body, auth) {
  const companyId = body.company_id || body.companyId || "";
  const apiClientId =
    (auth && (auth.api_client_id || auth.apiClientId || auth.client_id || auth.clientId)) ||
    body.api_client_id ||
    body.apiClientId ||
    "";

  return parseJsonFromPsql(runPsql(`
BEGIN;

SELECT set_config('app.current_company_id', ${sqlLit(companyId)}, true);
SELECT set_config('app.current_api_client_id', ${sqlLit(apiClientId)}, true);

SELECT jsonb_build_object(
  'ok', true,
  'dry_run', true,
  'rollback_smoke', true,
  'context_smoke', true,
  'company_id', ${uuidSql(companyId)},
  'api_client_id_text', ${sqlLit(apiClientId)},
  'current_company_id', current_setting('app.current_company_id', true),
  'current_api_client_id', current_setting('app.current_api_client_id', true),
  'context_check', business.fn_aicm_aiworker_company_context_check(${uuidSql(companyId)})
);

ROLLBACK;
`));
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
      service: "aicm-business-aiworker-local-api-v3-auth-audit",
      auth_required: AUTH_REQUIRED,
      audit_enabled: AUDIT_ENABLED,
      audit_dry_run: AUDIT_DRY_RUN,
      dry_run_default: DRY_RUN_DEFAULT,
      persona_database_url_set: Boolean(DATABASE_URL)
    });
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/roles") {
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "reference/roles", "read", null, dryRun, { role_code: roleCode });
    if (!auth) return;

    sendJson(res, 200, referenceRoles(roleCode));
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/personalities") {
    const modelCode = text(urlObj.searchParams.get("aiworker_model_code"));
    const seriesCode = text(urlObj.searchParams.get("aiworker_series_code"));
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "reference/personalities", "read", null, dryRun, { aiworker_model_code: modelCode, aiworker_series_code: seriesCode });
    if (!auth) return;

    sendJson(res, 200, referencePersonalities(modelCode, seriesCode));
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/public-profiles") {
    const modelCode = text(urlObj.searchParams.get("aiworker_model_code"));
    const seriesCode = text(urlObj.searchParams.get("aiworker_series_code"));
    const profileStatusCode = text(urlObj.searchParams.get("public_profile_status_code"));
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "reference/public-profiles", "read", null, dryRun, { aiworker_model_code: modelCode, aiworker_series_code: seriesCode, public_profile_status_code: profileStatusCode });
    if (!auth) return;

    sendJson(res, 200, referencePublicProfiles(modelCode, seriesCode, profileStatusCode));
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/reference/model-full") {
    const modelCode = text(urlObj.searchParams.get("aiworker_model_code"));
    const seriesCode = text(urlObj.searchParams.get("aiworker_series_code"));
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "reference/model-full", "read", null, dryRun, { aiworker_model_code: modelCode, aiworker_series_code: seriesCode, role_code: roleCode });
    if (!auth) return;

    sendJson(res, 200, referenceModelFull(modelCode, seriesCode, roleCode));
    return;
  }
  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/global-selector-options") {
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "global-selector-options", "read", null, dryRun, { role_code: roleCode });
    if (!auth) return;

    sendJson(res, 200, selectorGlobal(roleCode));
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/company-selector-options") {
    const companyId = text(urlObj.searchParams.get("company_id"));
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "company-selector-options", "read", companyId, dryRun, { company_id: companyId, role_code: roleCode });
    if (!auth) return;

    sendJson(res, 200, selectorCompany(companyId, roleCode));
    return;
  }

  if (req.method === "GET" && urlObj.pathname === "/api/v1/business/aiworker/aicm/placements") {
    const companyId = text(urlObj.searchParams.get("company_id"));
    const roleCode = text(urlObj.searchParams.get("role_code"));
    const targetLevel = text(urlObj.searchParams.get("target_level_code"));
    const targetId = text(urlObj.searchParams.get("target_id"));
    const statusCode = text(urlObj.searchParams.get("status_code") || "active");
    const dryRun = DRY_RUN_DEFAULT;
    const auth = requireAuth(req, res, "placements", "read", companyId, dryRun, {
      company_id: companyId,
      role_code: roleCode,
      target_level_code: targetLevel,
      target_id: targetId,
      status_code: statusCode
    });
    if (!auth) return;

    sendJson(res, 200, placementsFiltered(companyId, roleCode, targetLevel, targetId, statusCode));
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const dryRun = getDryRun(req, body);
    const companyId = body.company_id || body.companyId || null;

    if (urlObj.pathname === "/api/v1/business/aiworker/company-context/rollback-smoke") {
      const contextDryRun = true;
      const auth = requireAuth(req, res, "company-context/rollback-smoke", "write", companyId, contextDryRun, body);
      if (!auth) return;
      sendJson(res, 200, companyContextRollbackSmoke(body, auth));
      return;
    }

    if (urlObj.pathname === "/api/v1/business/aiworker/company-robot/combined-rollback-smoke") {
      const smokeDryRun = true;
      const auth = requireAuth(req, res, "company-robot/combined-rollback-smoke", "write", companyId, smokeDryRun, body);
      if (!auth) return;
      sendJson(res, 200, combinedRollbackSmoke(body, auth));
      return;
    }
    if (urlObj.pathname === "/api/v1/business/aiworker/company-entitlement/grant") {
      const auth = requireAuth(req, res, "company-entitlement/grant", "write", companyId, dryRun, body);
      if (!auth) return;
      sendJson(res, 200, grantEntitlement(body, dryRun));
      return;
    }

    if (urlObj.pathname === "/api/v1/business/aiworker/company-robot/place") {
      const auth = requireAuth(req, res, "company-robot/place", "write", companyId, dryRun, body);
      if (!auth) return;
      sendJson(res, 200, placeRobot(body, dryRun));
      return;
    }

    if (urlObj.pathname === "/api/v1/business/aiworker/company-robot/update") {
      const auth = requireAuth(req, res, "company-robot/update", "write", companyId, dryRun, body);
      if (!auth) return;
      sendJson(res, 200, updatePlacement(body, dryRun));
      return;
    }

    if (urlObj.pathname === "/api/v1/business/aiworker/company-robot/deactivate") {
      const auth = requireAuth(req, res, "company-robot/deactivate", "write", companyId, dryRun, body);
      if (!auth) return;
      sendJson(res, 200, deactivatePlacement(body, dryRun));
      return;
    }

    if (urlObj.pathname === "/api/v1/business/aiworker/company-robot/smoke-crud") {
      const auth = requireAuth(req, res, "company-robot/smoke-crud", "write", companyId, dryRun, body);
      if (!auth) return;
      sendJson(res, 200, smokeCrud(body, dryRun));
      return;
    }
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
  console.log("AICM_BUSINESS_AIWORKER_LOCAL_API_V3_READY=true");
  console.log(`PORT=${PORT}`);
  console.log(`AUTH_REQUIRED=${AUTH_REQUIRED}`);
  console.log(`AUDIT_ENABLED=${AUDIT_ENABLED}`);
  console.log(`AUDIT_DRY_RUN=${AUDIT_DRY_RUN}`);
  console.log(`DRY_RUN_DEFAULT=${DRY_RUN_DEFAULT}`);
});
