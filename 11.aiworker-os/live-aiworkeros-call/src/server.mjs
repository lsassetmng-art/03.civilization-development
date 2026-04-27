import http from "node:http";
import fs from "node:fs";
import crypto from "node:crypto";

const host = process.env.PERSONA_AIWORKEROS_HOST || "127.0.0.1";
const port = Number(process.env.PERSONA_AIWORKEROS_PORT || "8787");
const token = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";
const requestLog = process.env.AIWORKEROS_REQUEST_LOG || "./runtime/request_log.jsonl";
const idempotencyStorePath = process.env.AIWORKEROS_IDEMPOTENCY_STORE || "./runtime/idempotency_store.json";

const endpointPath = "/aicm/v1/workflow-start/live-aiworkeros-call";

function nowIso() {
  return new Date().toISOString();
}

function jsonResponse(res, statusCode, body) {
  const text = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("REQUEST_TOO_LARGE"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function loadStore() {
  try {
    if (!fs.existsSync(idempotencyStorePath)) return {};
    return JSON.parse(fs.readFileSync(idempotencyStorePath, "utf8"));
  } catch {
    return {};
  }
}

function saveStore(store) {
  fs.mkdirSync(new URL(".", `file://${idempotencyStorePath}`).pathname, { recursive: true });
  fs.writeFileSync(idempotencyStorePath, JSON.stringify(store, null, 2));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function stablePayloadHash(payload) {
  return sha256(JSON.stringify(payload));
}

function appendRequestLog(entry) {
  fs.mkdirSync(new URL(".", `file://${requestLog}`).pathname, { recursive: true });
  fs.appendFileSync(requestLog, JSON.stringify(entry) + "\n");
}

function validatePayload(payload) {
  const missing = [];

  for (const field of ["source_app", "phase", "request_type", "workflow_run_id", "requested_worker_scope", "instruction", "execution_flags"]) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") missing.push(field);
  }

  if (missing.length > 0) {
    return { ok: false, status: 400, error_code: "MISSING_REQUIRED_FIELDS", message: `Missing required fields: ${missing.join(", ")}` };
  }

  if (payload.source_app !== "AICompanyManager") {
    return { ok: false, status: 400, error_code: "INVALID_SOURCE_APP", message: "source_app must be AICompanyManager for this route." };
  }

  if (payload.phase !== "live_aiworkeros_call") {
    return { ok: false, status: 400, error_code: "INVALID_PHASE", message: "phase must be live_aiworkeros_call." };
  }

  if (payload.request_type !== "workflow_start") {
    return { ok: false, status: 400, error_code: "INVALID_REQUEST_TYPE", message: "request_type must be workflow_start." };
  }

  if (!payload.requested_worker_scope || payload.requested_worker_scope.worker_type !== "ai_robot") {
    return { ok: false, status: 422, error_code: "INVALID_WORKER_TYPE", message: "Only ai_robot worker execution target is accepted." };
  }

  const flags = payload.execution_flags || {};
  if (flags.rls_apply === true || flags.db_write_by_caller === true) {
    return { ok: false, status: 422, error_code: "FORBIDDEN_EXECUTION_FLAGS", message: "rls_apply and db_write_by_caller must not be true for this endpoint." };
  }

  const forbidden = new Set(payload.instruction?.forbidden_actions || []);
  for (const required of ["apply_rls", "change_schema", "delete_data", "call_external_unapproved_services"]) {
    if (!forbidden.has(required)) {
      return { ok: false, status: 422, error_code: "MISSING_FORBIDDEN_ACTION", message: `forbidden_actions must include ${required}.` };
    }
  }

  return { ok: true };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return jsonResponse(res, 200, {
      result: "ok",
      service: "AIWorkerOS local live call endpoint",
      endpoint: endpointPath,
      timestamp: nowIso()
    });
  }

  if (req.method !== "POST" || url.pathname !== endpointPath) {
    return jsonResponse(res, 404, {
      result: "error",
      status: "rejected",
      error_code: "NOT_FOUND",
      message: "Endpoint not found."
    });
  }

  const auth = req.headers["authorization"] || "";
  if (auth !== `Bearer ${token}`) {
    return jsonResponse(res, 401, {
      result: "error",
      status: "rejected",
      error_code: "UNAUTHORIZED",
      message: "Missing or invalid Authorization bearer token."
    });
  }

  const idempotencyKey = req.headers["idempotency-key"];
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return jsonResponse(res, 400, {
      result: "error",
      status: "rejected",
      error_code: "MISSING_IDEMPOTENCY_KEY",
      message: "Idempotency-Key header is required."
    });
  }

  let rawBody = "";
  let payload;

  try {
    rawBody = await readBody(req);
    payload = JSON.parse(rawBody || "{}");
  } catch (err) {
    return jsonResponse(res, 400, {
      result: "error",
      status: "rejected",
      error_code: "MALFORMED_JSON",
      message: "Request body must be valid JSON."
    });
  }

  const validation = validatePayload(payload);
  if (!validation.ok) {
    appendRequestLog({
      timestamp: nowIso(),
      idempotency_key: idempotencyKey,
      result: "rejected",
      error_code: validation.error_code,
      workflow_run_id: payload.workflow_run_id || null
    });

    return jsonResponse(res, validation.status, {
      result: "error",
      status: "rejected",
      error_code: validation.error_code,
      message: validation.message,
      workflow_run_id: payload.workflow_run_id || null
    });
  }

  const store = loadStore();
  const payloadHash = stablePayloadHash(payload);

  if (store[idempotencyKey]) {
    if (store[idempotencyKey].payload_hash !== payloadHash) {
      return jsonResponse(res, 409, {
        result: "error",
        status: "rejected",
        error_code: "IDEMPOTENCY_CONFLICT",
        message: "Same Idempotency-Key was used with a different payload.",
        workflow_run_id: payload.workflow_run_id
      });
    }

    return jsonResponse(res, 202, {
      ...store[idempotencyKey].response,
      idempotency_reused: true
    });
  }

  const aiworkerosRequestId = crypto.randomUUID();
  const response = {
    result: "accepted",
    status: "queued",
    source_app: payload.source_app,
    workflow_run_id: payload.workflow_run_id,
    aiworkeros_request_id: aiworkerosRequestId,
    assigned_worker: {
      worker_kind: "ai_robot",
      role: payload.requested_worker_scope.role || "Worker",
      worker_id: null
    },
    message: "Workflow start request accepted by AIWorkerOS local endpoint.",
    next_poll_url: `${endpointPath}/${aiworkerosRequestId}`,
    safety: {
      rls_apply: false,
      db_write_by_caller: false,
      pg_apply: false,
      destructive_action: false
    }
  };

  store[idempotencyKey] = {
    created_at: nowIso(),
    payload_hash: payloadHash,
    workflow_run_id: payload.workflow_run_id,
    response
  };
  saveStore(store);

  appendRequestLog({
    timestamp: nowIso(),
    idempotency_key: idempotencyKey,
    result: "accepted",
    workflow_run_id: payload.workflow_run_id,
    aiworkeros_request_id: aiworkerosRequestId
  });

  return jsonResponse(res, 202, response);
});

server.listen(port, host, () => {
  console.log(`[${nowIso()}] AIWorkerOS local endpoint listening on http://${host}:${port}`);
  console.log(`[${nowIso()}] POST ${endpointPath}`);
});
