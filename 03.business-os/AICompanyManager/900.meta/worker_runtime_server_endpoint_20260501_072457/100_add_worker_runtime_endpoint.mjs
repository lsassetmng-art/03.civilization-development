import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
if (!serverFile) {
  console.error('SERVER_FILE env missing');
  process.exit(1);
}

let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const marker = 'AICM_WORKER_RUNTIME_REQUEST_AXS_V1';
const routeMarker = 'AICM_WORKER_RUNTIME_REQUEST_ROUTE_AXS_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function insertBeforeNeedle(needle, text) {
  const idx = src.indexOf(needle);
  if (idx < 0) {
    console.error('Needle not found: ' + needle);
    process.exit(1);
  }
  src = src.slice(0, idx) + text + '\n\n' + src.slice(idx);
}

if (!src.includes(marker)) {
  const functionBlock = `
// ${marker}
// Server-side bridge from AICompanyManager to AIWorkerOS Runtime Execution.
// UI must never receive PERSONA_AIWORKEROS_AUTH_TOKEN.
// This function does local placement validation, then forwards a sanitized request to AIWorkerOS.
function aicmWorkerRuntimeText(value) {
  return String(value || "").trim();
}

function aicmWorkerRuntimeDefault(value, fallback) {
  const text = aicmWorkerRuntimeText(value);
  return text || fallback;
}

function aicmWorkerRuntimeOptionalUuidSql(value) {
  const text = aicmWorkerRuntimeText(value);
  return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
}

function aicmWorkerRuntimeBaseUrl() {
  const base = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_BASE_URL);
  if (!base) {
    throw new Error("PERSONA_AIWORKEROS_BASE_URL is not set");
  }
  return base.replace(/\\/+$/, "");
}

function aicmWorkerRuntimeAuthToken() {
  const token = aicmWorkerRuntimeText(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN);
  if (!token) {
    throw new Error("PERSONA_AIWORKEROS_AUTH_TOKEN is not set");
  }
  return token;
}

function getAicmWorkerRuntimePlacement(body) {
  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
  const placementId = requiredUuid(body.aicm_user_company_worker_placement_id, "aicm_user_company_worker_placement_id");

  const sql = [
    "WITH placement AS (",
    "  SELECT",
    "    p.aicm_user_company_worker_placement_id,",
    "    p.owner_civilization_id,",
    "    p.aicm_user_company_id,",
    "    p.aicm_user_company_department_id,",
    "    p.aicm_user_company_section_id,",
    "    p.target_level_code,",
    "    p.target_id,",
    "    p.app_code,",
    "    p.role_code,",
    "    p.robot_pool_id,",
    "    p.aiworker_model_code,",
    "    p.internal_nickname,",
    "    p.status_code,",
    "    COALESCE(v.display_label, NULLIF(p.internal_nickname, '') || '@' || p.role_code, p.aiworker_model_code || '@' || p.role_code) AS display_label",
    "  FROM business.aicm_user_company_worker_placement p",
    "  LEFT JOIN business.vw_aicm_user_company_worker_placement_display v",
    "    ON v.aicm_user_company_worker_placement_id = p.aicm_user_company_worker_placement_id",
    "  WHERE p.owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
    "    AND p.aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
    "    AND p.aicm_user_company_worker_placement_id = " + sqlLiteral(placementId) + "::uuid",
    "    AND p.app_code = 'AICompanyManager'",
    "    AND p.status_code = 'active'",
    "    AND lower(p.role_code) = lower('Worker')",
    "  LIMIT 1",
    ")",
    "SELECT jsonb_build_object(",
    "  'result', CASE WHEN EXISTS (SELECT 1 FROM placement) THEN 'ok' ELSE 'not_found' END,",
    "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
    "  'placement', COALESCE((SELECT to_jsonb(placement) FROM placement), '{}'::jsonb)",
    ")::text;"
  ].join("\\n");

  return runPsqlJson(sql);
}

function aicmWorkerRuntimeBuildIdempotencyKey(body, placement) {
  const provided = aicmWorkerRuntimeText(body.idempotency_key);
  if (provided) return provided;

  const sourceRequestRef = aicmWorkerRuntimeDefault(body.source_request_ref, "manual:" + Date.now());
  const placementId = aicmWorkerRuntimeText(placement.aicm_user_company_worker_placement_id);
  return "aicm:" + sourceRequestRef + ":" + placementId;
}

async function createWorkerRuntimeRequest(body) {
  body = body || {};

  const placementResult = getAicmWorkerRuntimePlacement(body);
  if (!placementResult || placementResult.result !== "ok" || !placementResult.placement) {
    return {
      result: "error",
      api_identifier: SERVER_MARK,
      error_message: "有効なWorker配置が見つかりません。"
    };
  }

  const placement = placementResult.placement;
  const baseUrl = aicmWorkerRuntimeBaseUrl();
  const token = aicmWorkerRuntimeAuthToken();

  const modelCode = aicmWorkerRuntimeDefault(
    body.model_code || body.aiworker_model_code,
    placement.aiworker_model_code
  );

  const appSurfaceCode = aicmWorkerRuntimeDefault(
    body.app_surface_code,
    "ai_company_manager_worker_execution"
  );

  const taskDomainCode = aicmWorkerRuntimeDefault(
    body.task_domain_code,
    "business_operation"
  );

  const taskTitle = requiredText(body.task_title || body.title, "task_title");
  const taskInstruction = requiredText(body.task_instruction_ja || body.task_instruction || body.instruction, "task_instruction_ja");

  const sourceAppRef = aicmWorkerRuntimeDefault(body.source_app_ref, "AICompanyManager");
  const sourceRequestRef = aicmWorkerRuntimeDefault(body.source_request_ref, "manual:" + Date.now());
  const requestedByRef = aicmWorkerRuntimeDefault(body.requested_by_ref, "human");
  const idempotencyKey = aicmWorkerRuntimeBuildIdempotencyKey(body, placement);

  const outboundBody = {
    app_surface_code: appSurfaceCode,
    model_code: modelCode,
    task_domain_code: taskDomainCode,
    task_title: taskTitle,
    task_instruction_ja: taskInstruction,
    source_app_ref: sourceAppRef,
    source_request_ref: sourceRequestRef,
    requested_by_ref: requestedByRef,
    idempotency_key: idempotencyKey
  };

  const url = baseUrl + "/aiworker/v1/runtime-execution/request";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(outboundBody)
  });

  const responseText = await response.text();
  let responseJson = null;

  try {
    responseJson = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    responseJson = {
      raw_response_text: responseText
    };
  }

  if (!response.ok) {
    return {
      result: "error",
      api_identifier: SERVER_MARK,
      http_status_code: response.status,
      error_message: responseJson.error_message || responseJson.message || responseJson.error || "AIWorkerOS runtime request failed",
      aiworker_response: responseJson
    };
  }

  const requestId =
    responseJson.request_id ||
    (responseJson.runtime_request && responseJson.runtime_request.request_id) ||
    (responseJson.request && responseJson.request.request_id) ||
    "";

  const requestStatusCode =
    responseJson.request_status_code ||
    (responseJson.runtime_request && responseJson.runtime_request.request_status_code) ||
    (responseJson.request && responseJson.request.request_status_code) ||
    "";

  return {
    result: "ok",
    api_identifier: SERVER_MARK,
    worker_placement: {
      aicm_user_company_worker_placement_id: placement.aicm_user_company_worker_placement_id,
      display_label: placement.display_label,
      aiworker_model_code: placement.aiworker_model_code,
      role_code: placement.role_code
    },
    runtime_request: {
      request_id: requestId,
      request_status_code: requestStatusCode,
      app_surface_code: appSurfaceCode,
      model_code: modelCode,
      task_domain_code: taskDomainCode,
      task_title: taskTitle,
      source_app_ref: sourceAppRef,
      source_request_ref: sourceRequestRef,
      idempotency_key: idempotencyKey
    },
    aiworker_response: responseJson
  };
}
`;

  insertBeforeNeedle('async function handleApi', functionBlock);
}

if (!src.includes(routeMarker)) {
  const routeBlock = `    // ${routeMarker}
    if (route === "/api/aicm/v2/worker-runtime/request" && req.method === "POST") {
      const payload = await createWorkerRuntimeRequest(await readBody(req));
      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
      return true;
    }

`;

  const anchor = '    if (route.startsWith("/api/aicm/v2/")) {';
  if (!src.includes(anchor)) {
    console.error('route anchor not found');
    process.exit(1);
  }
  src = src.replace(anchor, routeBlock + anchor);
}

fs.writeFileSync(serverFile, src, 'utf8');

console.log("serverChanged=" + String(src !== before));
console.log("markerCount=" + String(countText(marker)));
console.log("routeMarkerCount=" + String(countText(routeMarker)));
console.log("endpointCount=" + String(countText('/api/aicm/v2/worker-runtime/request')));
console.log("functionCount=" + String(countText('async function createWorkerRuntimeRequest')));
console.log("fetchCount=" + String(countText('fetch(url')));
console.log("tokenEnvCount=" + String(countText('PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log("baseUrlEnvCount=" + String(countText('PERSONA_AIWORKEROS_BASE_URL')));
