const http = require("http");
const { buildRuntimeBrainContext, renderPromptBrainContext } = require("./brain-context-bridge.js");
const { URL } = require("url");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const appRoot = __dirname;
const envFile = path.join(appRoot, ".env.local");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(envFile);

const port = Number(process.env.PERSONA_AIWORKEROS_PORT || "8787");
const authToken = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "local-aiworkeros-smoke-token";
const databaseUrl = process.env.PERSONA_DATABASE_URL;

if (!databaseUrl) {
  console.error("ERROR: PERSONA_DATABASE_URL is not set");
  process.exit(1);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function requireAuth(req) {
  const auth = req.headers["authorization"] || "";
  return auth === `Bearer ${authToken}`;
}

function normalizeLimit(value) {
  const n = Number(value || "20");
  if (!Number.isFinite(n)) return 20;
  return Math.max(1, Math.min(100, Math.floor(n)));
}

/**
 * IMPORTANT:
 * Do not pass SQL using `psql -c` here.
 * In the previous version, psql variables like :'app_surface_code'
 * were not substituted and were sent to PostgreSQL as-is.
 *
 * This fixed version passes SQL via stdin.
 */
function psqlJson(sql, vars = {}) {
  const args = [
    databaseUrl,
    "-X",
    "-A",
    "-t",
    "-v",
    "ON_ERROR_STOP=1"
  ];

  for (const [key, value] of Object.entries(vars)) {
    args.push("-v", `${key}=${value === null || value === undefined ? "" : String(value)}`);
  }

  const result = spawnSync("psql", args, {
    input: sql,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
  });

  if (result.status !== 0) {
    const message = result.stderr || result.stdout || "psql failed";
    const err = new Error(message.trim());
    err.stderr = result.stderr;
    err.stdout = result.stdout;
    err.status = result.status;
    throw err;
  }

  const text = (result.stdout || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse DB JSON: ${text}`);
  }
}

function endpointReady() {
  return psqlJson(`
    select coalesce(to_jsonb(t), '{}'::jsonb)::text
    from (
      select *
      from aiworker.vw_app_aiworker_runtime_execution_endpoint_ready_v1
    ) t;
  `);
}

function apiContracts() {
  return psqlJson(`
    select coalesce(jsonb_agg(to_jsonb(t) order by sort_order), '[]'::jsonb)::text
    from (
      select *
      from aiworker.vw_app_aiworker_runtime_execution_api_contract_v1
    ) t;
  `);
}

function persistentSmoke() {
  return psqlJson(`
    select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text
    from (
      select *
      from aiworker.vw_app_aiworker_runtime_execution_persistent_smoke_board_v1
    ) t;
  `);
}

function pipelineBoard(query) {
  return psqlJson(`
    select coalesce(jsonb_agg(to_jsonb(t) order by request_created_at desc), '[]'::jsonb)::text
    from (
      select *
      from aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1
      where (nullif(:'request_id','') is null or request_id::text = :'request_id')
        and (nullif(:'request_code','') is null or request_code = :'request_code')
        and (nullif(:'app_surface_code','') is null or app_surface_code = :'app_surface_code')
      order by request_created_at desc
      limit :'limit'
    ) t;
  `, {
    request_id: query.get("request_id") || "",
    request_code: query.get("request_code") || "",
    app_surface_code: query.get("app_surface_code") || "",
    limit: normalizeLimit(query.get("limit"))
  });
}

function appReadPayload(query) {
  return psqlJson(`
    select coalesce(jsonb_agg(to_jsonb(t) order by request_created_at desc), '[]'::jsonb)::text
    from (
      select *
      from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1
      where (nullif(:'request_id','') is null or request_id::text = :'request_id')
        and (nullif(:'request_code','') is null or request_code = :'request_code')
        and (nullif(:'app_surface_code','') is null or app_surface_code = :'app_surface_code')
      order by request_created_at desc
      limit :'limit'
    ) t;
  `, {
    request_id: query.get("request_id") || "",
    request_code: query.get("request_code") || "",
    app_surface_code: query.get("app_surface_code") || "",
    limit: normalizeLimit(query.get("limit"))
  });
}

function deliveryBoard(query) {
  return psqlJson(`
    select coalesce(jsonb_agg(to_jsonb(t) order by created_at desc), '[]'::jsonb)::text
    from (
      select *
      from aiworker.vw_app_aiworker_runtime_delivery_board_v1
      where (nullif(:'request_id','') is null or request_id::text = :'request_id')
        and (nullif(:'request_code','') is null or request_code = :'request_code')
      order by created_at desc
      limit :'limit'
    ) t;
  `, {
    request_id: query.get("request_id") || "",
    request_code: query.get("request_code") || "",
    limit: normalizeLimit(query.get("limit"))
  });
}

function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
  const idempotencyKey = payload.idempotency_key || idempotencyKeyFromHeader || "";
  if (!idempotencyKey) {
    const e = new Error("Idempotency-Key is required");
    e.httpStatus = 400;
    throw e;
  }

  const required = ["app_surface_code", "model_code", "task_domain_code", "task_title", "task_instruction_ja"];
  for (const key of required) {
    if (!payload[key] || String(payload[key]).trim() === "") {
      const e = new Error(`Missing required field: ${key}`);
      e.httpStatus = 400;
      throw e;
    }
  }

  return psqlJson(`
    with created as (
      select aiworker.fn_runtime_execution_create_request(
        :'app_surface_code',
        :'model_code',
        :'task_domain_code',
        :'task_title',
        :'task_instruction_ja',
        :'source_app_ref',
        :'source_request_ref',
        :'requested_by_ref',
        :'idempotency_key'
      ) as request_id
    ),
    board as (
      select p.*
      from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
      join created c
        on c.request_id = p.request_id
    )
    select jsonb_build_object(
      'result', 'accepted',
      'status', 'REQUESTED_INTERNAL_ONLY',
      'request_id', (select request_id from created),
      'idempotency_key', :'idempotency_key',
      'payload', coalesce((select app_read_payload_jsonb from board limit 1), '{}'::jsonb),
      'safety', jsonb_build_object(
        'external_execution_performed_flag', false,
        'pg_apply_performed_flag', false,
        'destructive_action_performed_flag', false
      )
    )::text;
  `, {
    app_surface_code: payload.app_surface_code,
    model_code: payload.model_code,
    task_domain_code: payload.task_domain_code,
    task_title: payload.task_title,
    task_instruction_ja: payload.task_instruction_ja,
    source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
    source_request_ref: payload.source_request_ref || "",
    requested_by_ref: payload.requested_by_ref || "human",
    idempotency_key: idempotencyKey
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);

  try {
    if (req.method === "GET" && url.pathname === "/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "aiworker-runtime-execution-http-api",
        db: "PERSONA_DATABASE_URL",
        external_execution: false,
        pg_apply: false,
        destructive_action: false
      });
    }

    if (!requireAuth(req)) {
      return sendJson(res, 401, {
        result: "error",
        error_code: "UNAUTHORIZED",
        message: "Missing or invalid Authorization bearer token."
      });
    }

    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/endpoint-ready") {
      return sendJson(res, 200, { result: "ok", data: endpointReady() });
    }

    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/api-contract") {
      return sendJson(res, 200, { result: "ok", data: apiContracts() });
    }

    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/persistent-smoke") {
      return sendJson(res, 200, { result: "ok", data: persistentSmoke() });
    }

    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/pipeline-board") {
      return sendJson(res, 200, { result: "ok", data: pipelineBoard(url.searchParams) });
    }

    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/app-read-payload") {
      return sendJson(res, 200, { result: "ok", data: appReadPayload(url.searchParams) });
    }

    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/delivery") {
      return sendJson(res, 200, { result: "ok", data: deliveryBoard(url.searchParams) });
    }


    // BRAIN_CONTEXT_BRIDGE_ROUTE_V1
    if (req.method === "GET" && url.pathname === "/aiworker/v1/runtime-execution/brain-context") {
      const modelCode = url.searchParams.get("model_code") || url.searchParams.get("modelCode") || "";
      const usePurposeCode =
        url.searchParams.get("use_purpose_code") ||
        url.searchParams.get("purpose_code") ||
        url.searchParams.get("task_domain_code") ||
        "reference";
      const domainsRaw = url.searchParams.get("domains") || "";
      const domainCodes = domainsRaw
        ? domainsRaw.split(",").map((value) => value.trim()).filter(Boolean)
        : [];
      const includeMissingSources =
        url.searchParams.get("include_missing_sources") === "true" ||
        url.searchParams.get("includeMissingSources") === "true";

      const brainContext = buildRuntimeBrainContext({
        modelCode,
        usePurposeCode,
        domainCodes,
        includeMissingSources
      });

      return sendJson(res, 200, {
        result: "ok",
        external_execution_performed_flag: false,
        data: {
          model_code: modelCode,
          use_purpose_code: brainContext.purposeCode,
          brain_context: brainContext,
          prompt_brain_context: renderPromptBrainContext(brainContext)
        }
      });
    }

    if (req.method === "POST" && url.pathname === "/aiworker/v1/runtime-execution/request") {
      const bodyText = await readBody(req);
      let payload;
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch (e) {
        return sendJson(res, 400, {
          result: "error",
          error_code: "INVALID_JSON",
          message: "Request body must be valid JSON."
        });
      }

      const idempotencyKey = req.headers["idempotency-key"] || "";
      const result = createRuntimeRequest(payload, idempotencyKey);
      return sendJson(res, 201, result);
    }

    return sendJson(res, 404, {
      result: "error",
      error_code: "NOT_FOUND",
      path: url.pathname
    });
  } catch (err) {
    const status = err.httpStatus || 500;
    return sendJson(res, status, {
      result: "error",
      error_code: status === 400 ? "BAD_REQUEST" : "INTERNAL_ERROR",
      message: err.message,
      safety: {
        external_execution_performed_flag: false,
        pg_apply_performed_flag: false,
        destructive_action_performed_flag: false
      }
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AIWorkerOS runtime execution HTTP API listening on http://127.0.0.1:${port}`);
});
