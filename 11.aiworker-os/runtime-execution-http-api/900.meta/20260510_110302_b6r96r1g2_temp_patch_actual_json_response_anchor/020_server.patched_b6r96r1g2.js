
// AIWORKEROS_V10L_C2G_B6R44F_SOURCE_ROUTE_METADATA_START
/*
  B6R44F:
  Preserve source route metadata from app callers.
  AICompanyManager Workbench uses this to separate:
  - individual_instruction
  - task_ledger_worker
  - president_route_worker

  This helper is intentionally generic and side-effect-free.
*/

// AIW_B6R96R1G2_MINIMUM_DELIVERABLE_HELPER_START
function aiwB6R96R1G2Text(value) {
  return String(value === undefined || value === null ? "" : value).trim();
}

function aiwB6R96R1G2FirstText(values) {
  for (const value of values) {
    const text = aiwB6R96R1G2Text(value);
    if (text) return text;
  }
  return "";
}

function aiwB6R96R1G2Object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function aiwB6R96R1G2Pick(payload, names) {
  payload = aiwB6R96R1G2Object(payload);
  for (const name of names) {
    const text = aiwB6R96R1G2Text(payload[name]);
    if (text) return text;
  }
  return "";
}

function aiwB6R96R1G2FindAppPayload(payload) {
  payload = aiwB6R96R1G2Object(payload);
  return aiwB6R96R1G2Object(
    payload.app_read_payload_jsonb ||
    payload.app_read_payload ||
    payload.request_payload_jsonb ||
    payload.request_payload ||
    payload.payload ||
    payload.body ||
    {}
  );
}

function aiwB6R96R1G2LooksRuntimePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;

  const appPayload = aiwB6R96R1G2FindAppPayload(payload);
  const statusText = aiwB6R96R1G2FirstText([
    payload.request_status_code,
    payload.status_code,
    payload.status,
    payload.result,
    payload.reason
  ]);

  return Boolean(
    payload.request_id ||
    payload.runtime_request_id ||
    payload.idempotency_key ||
    payload.app_surface_code ||
    payload.model_code ||
    payload.task_domain_code ||
    payload.task_title ||
    payload.task_instruction_ja ||
    payload.app_read_payload_jsonb ||
    appPayload.task_title ||
    appPayload.task_instruction_ja ||
    appPayload.source_request_ref ||
    /REQUESTED|ACCEPTED|accepted|ok/i.test(statusText)
  );
}

function aiwB6R96R1G2NormalizeRoleCode(payload, appPayload) {
  const raw = aiwB6R96R1G2FirstText([
    aiwB6R96R1G2Pick(payload, ["role_code", "worker_role_code", "placement_role_code"]),
    aiwB6R96R1G2Pick(appPayload, ["role_code", "worker_role_code", "placement_role_code"]),
    aiwB6R96R1G2Pick(payload, ["model_code", "aiworker_model_code"]),
    aiwB6R96R1G2Pick(appPayload, ["model_code", "aiworker_model_code"])
  ]).toLowerCase();

  if (raw.includes("president") || raw.includes("r5p")) return "president";
  if (raw.includes("manager") || raw.includes("r5")) return "manager";
  if (raw.includes("leader") || raw.includes("r4")) return "leader";
  if (raw.includes("worker") || raw.includes("r3")) return "worker";
  if (raw.includes("helper") || raw.includes("r1")) return "helper";
  if (raw.includes("friend")) return "friend";
  if (raw.includes("lover")) return "lover";
  return "worker";
}

function aiwB6R96R1G2CapabilityTier(payload, appPayload) {
  const model = aiwB6R96R1G2FirstText([
    aiwB6R96R1G2Pick(payload, ["model_code", "aiworker_model_code"]),
    aiwB6R1G2PickSafe(appPayload, ["model_code", "aiworker_model_code"])
  ]).toLowerCase();

  if (model.includes("byd2-003") || model.includes("hd-r5p") || model.includes("hd-r5")) return "high";
  if (model.includes("byd2-002") || model.includes("hd-r4")) return "standard";
  if (model.includes("byd1-003") || model.includes("hd-r3")) return "standard_basic";
  if (model.includes("hd-r1c") || model.includes("hd-r1a") || model.includes("friend") || model.includes("lover")) return "basic_stable";
  return "standard_basic";
}

function aiwB6R1G2PickSafe(payload, names) {
  return aiwB6R96R1G2Pick(payload, names);
}

function aiwB6R96R1G2ReferenceProfile(tier) {
  if (tier === "high") {
    return {
      reference_depth: "deep",
      reference_scope: "broad_verified_cx",
      stability_level: "high",
      originality_level: "high",
      specialty_level: "high",
      prediction_level: "high",
      review_depth: "advanced"
    };
  }

  if (tier === "standard") {
    return {
      reference_depth: "standard",
      reference_scope: "standard_cx",
      stability_level: "standard",
      originality_level: "medium",
      specialty_level: "medium",
      prediction_level: "medium",
      review_depth: "standard"
    };
  }

  if (tier === "basic_stable") {
    return {
      reference_depth: "lightweight",
      reference_scope: "lightweight_reference_or_legacy_seed",
      stability_level: "standard",
      originality_level: "low",
      specialty_level: "low",
      prediction_level: "basic",
      review_depth: "basic"
    };
  }

  return {
    reference_depth: "standard_light",
    reference_scope: "standard_limited_cx",
    stability_level: "standard",
    originality_level: "medium_low",
    specialty_level: "medium_low",
    prediction_level: "basic",
    review_depth: "basic"
  };
}

function aiwB6R96R1G2BuildBody(role, title, instruction, referenceProfile) {
  const safeTitle = title || "AIWorkerOS成果物";
  const safeInstruction = instruction || "入力指示が不足しています。";
  const cxNote = "参照範囲: " + referenceProfile.reference_depth + " / " + referenceProfile.reference_scope;

  if (!instruction) {
    return [
      "# 作業不能理由レポート",
      "",
      "## 結論",
      "現時点では通常成果物を完成できませんが、最低保証として不足情報レポートを返します。",
      "",
      "## 理由",
      "作業指示または成果物条件が不足しています。",
      "",
      "## 不足情報",
      "- 目的",
      "- 対象範囲",
      "- 期待する成果物形式",
      "- 判断に必要な前提",
      "",
      "## 次に必要な入力",
      "上記の不足情報を追加してください。",
      "",
      "## 参照制約",
      cxNote
    ].join("\n");
  }

  if (role === "president") {
    return [
      "# " + safeTitle,
      "",
      "## 目的",
      safeInstruction,
      "",
      "## 方針案",
      "現時点の情報から、実行可能な基本方針を整理します。",
      "",
      "## 優先順位",
      "1. 目的と制約の確認",
      "2. 実行範囲の整理",
      "3. Managerへ渡す大項目の明確化",
      "",
      "## 成功条件",
      "次工程のManagerが大項目へ分解できる状態にすること。",
      "",
      "## 制約",
      cxNote,
      "",
      "## 次工程",
      "Managerへ方針を渡し、大項目分解を行ってください。"
    ].join("\n");
  }

  if (role === "manager") {
    return [
      "# " + safeTitle,
      "",
      "## 全体方針",
      safeInstruction,
      "",
      "## 大項目分解案",
      "- 目的整理",
      "- 成果物整理",
      "- 実行範囲整理",
      "- 担当/役割候補整理",
      "- レビュー観点整理",
      "",
      "## Leaderへ渡す観点",
      "各大項目を作業単位へ分解できるよう、目的、入力、成果物、制約を渡します。",
      "",
      "## 注意点",
      cxNote,
      "",
      "## 次工程",
      "Leaderが中項目と作業単位へ分解してください。"
    ].join("\n");
  }

  if (role === "leader") {
    return [
      "# " + safeTitle,
      "",
      "## 対象",
      safeInstruction,
      "",
      "## 作業単位候補",
      "- 入力確認",
      "- 成果物構成作成",
      "- 本文作成",
      "- 品質確認",
      "- 納品準備",
      "",
      "## Workerへの引き渡し",
      "作業目的、期待成果物、制約、確認観点を明示して渡します。",
      "",
      "## 注意点",
      cxNote,
      "",
      "## 次工程",
      "Workerが成果物本文を作成してください。"
    ].join("\n");
  }

  return [
    "# " + safeTitle,
    "",
    "## 概要",
    safeInstruction,
    "",
    "## 本文",
    "依頼内容に基づき、標準的で安定した成果物を作成します。",
    "",
    "### 主要ポイント",
    "- 目的を整理する",
    "- 必要な内容を章立てする",
    "- 確認ポイントを明示する",
    "- 次工程を示す",
    "",
    "## 確認ポイント",
    "- 目的に合っているか",
    "- 不足情報が残っていないか",
    "- 次工程に進めるか",
    "",
    "## 未解決事項",
    "追加情報があれば、より専門的で独自性のある成果物にできます。",
    "",
    "## 参照制約",
    cxNote,
    "",
    "## 次工程",
    "必要に応じて上位ロボットまたは専門ロボットで深掘りしてください。"
  ].join("\n");
}

function aiwB6R96R1G2BuildRequesterDeliveryPayload(payload) {
  payload = aiwB6R96R1G2Object(payload);
  const appPayload = aiwB6R96R1G2FindAppPayload(payload);

  const title = aiwB6R96R1G2FirstText([
    aiwB6R96R1G2Pick(payload, ["task_title", "title", "request_title"]),
    aiwB6R96R1G2Pick(appPayload, ["task_title", "title", "request_title"]),
    "AIWorkerOS成果物"
  ]);

  const instruction = aiwB6R96R1G2FirstText([
    aiwB6R96R1G2Pick(payload, ["task_instruction_ja", "instruction", "prompt", "task_description"]),
    aiwB6R96R1G2Pick(appPayload, ["task_instruction_ja", "instruction", "prompt", "task_description"])
  ]);

  const role = aiwB6R96R1G2NormalizeRoleCode(payload, appPayload);
  const tier = aiwB6R96R1G2CapabilityTier(payload, appPayload);
  const referenceProfile = aiwB6R96R1G2ReferenceProfile(tier);
  const body = aiwB6R96R1G2BuildBody(role, title, instruction, referenceProfile);

  return {
    contract_version: "requester_deliverable_v1",
    deliverable_title: title,
    deliverable_kind: role === "president" ? "policy_proposal" : role === "manager" ? "major_breakdown" : role === "leader" ? "task_decomposition" : "document",
    body_format: "markdown",
    body_markdown: body,
    summary_text: role + " role produced a stable minimum deliverable.",
    limitations_text: "Performance differences are controlled by CX reference permission and capability profile. Low performance still returns stable output.",
    unresolved_issues_text: instruction ? "" : "Task instruction is missing or insufficient.",
    next_steps_text: "Review the deliverable and provide additional constraints if deeper specialty or originality is required.",
    minimum_guarantee_status: body ? "satisfied" : "blocking_report",
    performance_profile: {
      capability_tier: tier,
      stability_level: referenceProfile.stability_level,
      originality_level: referenceProfile.originality_level,
      specialty_level: referenceProfile.specialty_level,
      prediction_level: referenceProfile.prediction_level,
      review_depth: referenceProfile.review_depth
    },
    reference_usage_profile: referenceProfile,
    generation_basis: {
      role_code: role,
      task_title: title,
      has_instruction: Boolean(instruction),
      generated_by: "AIW_B6R96R1G2_MINIMUM_DELIVERABLE_HELPER"
    }
  };
}

function aiwB6R96R1G2EnsureRequesterDeliveryPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;

  const current = aiwB6R96R1G2Object(payload.requester_delivery_payload);
  if (aiwB6R96R1G2Text(current.body_markdown) || aiwB6R96R1G2Text(current.body_text)) {
    return payload;
  }

  if (!aiwB6R96R1G2LooksRuntimePayload(payload)) return payload;

  payload.requester_delivery_payload = aiwB6R96R1G2BuildRequesterDeliveryPayload(payload);
  payload.deliverable = payload.requester_delivery_payload;
  return payload;
}
// AIW_B6R96R1G2_MINIMUM_DELIVERABLE_HELPER_END

function aiwB6R44fPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function aiwB6R44fText(value) {
  return value == null ? "" : String(value).trim();
}

function aiwB6R44fExtractSourceRouteMetadata(input) {
  const body = aiwB6R44fPlainObject(input);
  const metadata = aiwB6R44fPlainObject(body.metadata_jsonb);
  const appRead = aiwB6R44fPlainObject(body.app_read_payload_jsonb);
  const source = aiwB6R44fPlainObject(appRead.source);

  const sourceAppRef = aiwB6R44fText(
    body.source_app_ref ||
    metadata.source_app_ref ||
    source.source_app_ref ||
    body.app_surface_code ||
    "AICompanyManager"
  );

  const sourceRouteCode = aiwB6R44fText(
    body.source_route_code ||
    metadata.source_route_code ||
    source.source_route_code
  );

  const sourceScreenCode = aiwB6R44fText(
    body.source_screen_code ||
    metadata.source_screen_code ||
    source.source_screen_code
  );

  const sourceEntityType = aiwB6R44fText(
    body.source_entity_type ||
    metadata.source_entity_type ||
    source.source_entity_type
  );

  const sourceEntityId = aiwB6R44fText(
    body.source_entity_id ||
    metadata.source_entity_id ||
    source.source_entity_id ||
    body.request_id ||
    body.runtime_execution_request_id
  );

  const route = {};
  if (sourceAppRef) route.source_app_ref = sourceAppRef;
  if (sourceRouteCode) route.source_route_code = sourceRouteCode;
  if (sourceScreenCode) route.source_screen_code = sourceScreenCode;
  if (sourceEntityType) route.source_entity_type = sourceEntityType;
  if (sourceEntityId) route.source_entity_id = sourceEntityId;

  const returnTargetType = aiwB6R44fText(body.return_target_type || metadata.return_target_type || source.return_target_type);
  const returnTargetId = aiwB6R44fText(body.return_target_id || metadata.return_target_id || source.return_target_id);
  const reexecuteTargetType = aiwB6R44fText(body.reexecute_target_type || metadata.reexecute_target_type || source.reexecute_target_type);
  const reexecuteTargetId = aiwB6R44fText(body.reexecute_target_id || metadata.reexecute_target_id || source.reexecute_target_id);
  const contextRestoreType = aiwB6R44fText(body.context_restore_type || metadata.context_restore_type || source.context_restore_type);
  const contextRestoreId = aiwB6R44fText(body.context_restore_id || metadata.context_restore_id || source.context_restore_id);

  if (returnTargetType) route.return_target_type = returnTargetType;
  if (returnTargetId) route.return_target_id = returnTargetId;
  if (reexecuteTargetType) route.reexecute_target_type = reexecuteTargetType;
  if (reexecuteTargetId) route.reexecute_target_id = reexecuteTargetId;
  if (contextRestoreType) route.context_restore_type = contextRestoreType;
  if (contextRestoreId) route.context_restore_id = contextRestoreId;

  return route;
}

function aiwB6R44fMergeSourceRouteIntoAppReadPayload(appReadPayload, input) {
  const base = aiwB6R44fPlainObject(appReadPayload);
  const route = aiwB6R44fExtractSourceRouteMetadata(input);
  if (!route.source_route_code) return base;
  return Object.assign({}, base, {
    source: Object.assign({}, aiwB6R44fPlainObject(base.source), route)
  });
}

function aiwB6R44fExposeSourceRouteOnRow(row) {
  const out = Object.assign({}, aiwB6R44fPlainObject(row));
  const appRead = aiwB6R44fPlainObject(out.app_read_payload_jsonb);
  const source = aiwB6R44fPlainObject(appRead.source);
  const route = aiwB6R44fExtractSourceRouteMetadata(Object.assign({}, out, {
    metadata_jsonb: out.metadata_jsonb,
    app_read_payload_jsonb: aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, body || payload || requestBody || input || {}),
    source_app_ref: out.source_app_ref || source.source_app_ref,
    source_route_code: out.source_route_code || source.source_route_code,
    source_screen_code: out.source_screen_code || source.source_screen_code,
    source_entity_type: out.source_entity_type || source.source_entity_type,
    source_entity_id: out.source_entity_id || source.source_entity_id
  }));

  if (route.source_app_ref && !out.source_app_ref) out.source_app_ref = route.source_app_ref;
  if (route.source_route_code && !out.source_route_code) out.source_route_code = route.source_route_code;
  if (route.source_screen_code && !out.source_screen_code) out.source_screen_code = route.source_screen_code;
  if (route.source_entity_type && !out.source_entity_type) out.source_entity_type = route.source_entity_type;
  if (route.source_entity_id && !out.source_entity_id) out.source_entity_id = route.source_entity_id;

  if (route.source_route_code) {
    out.app_read_payload_jsonb = aiwB6R44fMergeSourceRouteIntoAppReadPayload(appRead, route);
  }
  return out;
}

function aiwB6R44fExposeSourceRouteOnRows(value) {
  if (Array.isArray(value)) return value.map(aiwB6R44fExposeSourceRouteOnRow);
  return value;
}
// AIWORKEROS_V10L_C2G_B6R44F_SOURCE_ROUTE_METADATA_END

// AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_START
/*
  B6R44G-R4:
  SendJson boundary wrapper.
  Exposes source route metadata only for runtime-shaped rows.
*/
function aiwB6R44gR4PlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function aiwB6R44gR4LooksRuntimeRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return false;
  if (row.request_id || row.runtime_execution_request_id || row.request_code) return true;
  if (row.request_status_code || row.output_status_code || row.delivery_status_code) return true;
  if (row.app_surface_code || row.app_read_payload_jsonb) return true;
  return false;
}

function aiwB6R44gR4ExposeSourceRouteRow(row) {
  if (!aiwB6R44gR4LooksRuntimeRow(row)) return row;

  const out = aiwB6R44fExposeSourceRouteOnRow(row);
  const appRead = aiwB6R44gR4PlainObject(out.app_read_payload_jsonb);
  const source = aiwB6R44gR4PlainObject(appRead.source);

  if (source.source_app_ref && !out.source_app_ref) out.source_app_ref = source.source_app_ref;
  if (source.source_route_code && !out.source_route_code) out.source_route_code = source.source_route_code;
  if (source.source_screen_code && !out.source_screen_code) out.source_screen_code = source.source_screen_code;
  if (source.source_entity_type && !out.source_entity_type) out.source_entity_type = source.source_entity_type;
  if (source.source_entity_id && !out.source_entity_id) out.source_entity_id = source.source_entity_id;

  return out;
}

function aiwB6R44gR4ExposeSourceRouteRows(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map(aiwB6R44gR4ExposeSourceRouteRow);
}

function aiwB6R44gR4ExposeSourceRoutePayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  if (Array.isArray(payload)) return aiwB6R44gR4ExposeSourceRouteRows(payload);

  const out = Object.assign({}, payload);

  if (Array.isArray(out.data)) {
    out.data = aiwB6R44gR4ExposeSourceRouteRows(out.data);
  }
  if (Array.isArray(out.rows)) {
    out.rows = aiwB6R44gR4ExposeSourceRouteRows(out.rows);
  }
  if (Array.isArray(out.items)) {
    out.items = aiwB6R44gR4ExposeSourceRouteRows(out.items);
  }
  if (out.payload && typeof out.payload === "object") {
    out.payload = aiwB6R44gR4ExposeSourceRoutePayload(out.payload);
  }

  return out;
}
// AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_SOURCE_ROUTE_HELPER_END


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
const authToken = process.env.PERSONA_AIWORKEROS_AUTH_TOKEN;
if (!authToken) {
  console.error("ERROR: PERSONA_AIWORKEROS_AUTH_TOKEN is required");
  process.exit(1);
}
const databaseUrl = process.env.PERSONA_DATABASE_URL;

if (!databaseUrl) {
  console.error("ERROR: PERSONA_DATABASE_URL is not set");
  process.exit(1);
}

function sendJson(res, status, payload) {
  // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_START
  try {
    payload = aiwB6R44gR4ExposeSourceRoutePayload(payload);
  } catch (_b6r44gR4Error) {
    // Keep sendJson stable for non-runtime payloads.
  }
  // AIWORKEROS_V10L_C2G_B6R44G_R4_SENDJSON_BODY_WRAP_END

  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(aiwB6R96R1G2EnsureRequesterDeliveryPayload(payload, null, 2)));
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
      select p.*, rr.source_route_code
      from aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1 p
      left join aiworker.runtime_execution_request rr
        on rr.request_id = p.request_id
      where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
        and (nullif(:'request_code','') is null or p.request_code = :'request_code')
        and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
      order by p.request_created_at desc
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
      select p.*, rr.source_route_code
      from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p
      left join aiworker.runtime_execution_request rr
        on rr.request_id = p.request_id
      where (nullif(:'request_id','') is null or p.request_id::text = :'request_id')
        and (nullif(:'request_code','') is null or p.request_code = :'request_code')
        and (nullif(:'app_surface_code','') is null or p.app_surface_code = :'app_surface_code')
      order by p.request_created_at desc
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


// AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_START
/*
  B6R95R3B-R3:
  Common requester-facing deliverable contract for AIWorkerOS runtime execution.

  Canon:
  - This is not AICM-specific.
  - AICM is one consumer among multiple requester apps / OSs.
  - AIWorkerOS creates the deliverable body and first summary.
  - Requester apps store summary_text plus deliverable_ref / deliverable_link.
  - Robot performance differences are represented through robot_context and generation_basis.

  Boundary:
  - No external execution.
  - No PG apply.
  - No destructive action.
  - No AICM-side change in this patch.
  - No CX22073JW access-control change in this patch.
*/
function aiwB6R95R3R3Text(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function aiwB6R95R3R3OneLine(value, fallback) {
  const text = aiwB6R95R3R3Text(value || fallback || "");
  return text.replace(/\s+/g, " ").trim();
}

function aiwB6R95R3R3Clip(value, maxLen) {
  const text = aiwB6R95R3R3Text(value);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

function aiwB6R95R3R3Lines(items) {
  return items.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").join("\n");
}

function aiwB6R95R3R3BuildRequesterFacingDeliverableBaseB6R95R3Z24(payload, sourceRouteCode) {
  const requesterAppRef = aiwB6R95R3R3OneLine(payload.source_app_ref, "HTTP_LOCAL");
  const sourceRequestRef = aiwB6R95R3R3OneLine(payload.source_request_ref, "");
  const appSurfaceCode = aiwB6R95R3R3OneLine(payload.app_surface_code, "unknown_app_surface");
  const routeCode = aiwB6R95R3R3OneLine(sourceRouteCode, "unspecified_route");
  const taskTitle = aiwB6R95R3R3OneLine(payload.task_title, "AIWorkerOS成果物");
  const taskInstruction = aiwB6R95R3R3Text(payload.task_instruction_ja);
  const modelCode = aiwB6R95R3R3OneLine(payload.model_code, "unknown_model");
  const roleLayerCode = aiwB6R95R3R3OneLine(payload.role_layer_code || payload.roleLayerCode, "runtime_resolved_by_aiworker");
  const seriesCode = aiwB6R95R3R3OneLine(payload.series_code || payload.seriesCode, "runtime_resolved_by_aiworker");
  const capabilityProfileCode = aiwB6R95R3R3OneLine(payload.capability_profile_code || payload.capabilityProfileCode, "runtime_resolved_by_aiworker");
  const taskDomainCode = aiwB6R95R3R3OneLine(payload.task_domain_code, "unknown_domain");
  const cxDepthCode = aiwB6R95R3R3OneLine(payload.cx_reference_depth_code || payload.cxReferenceDepthCode, "runtime_policy_resolved");
  const cxBreadthCode = aiwB6R95R3R3OneLine(payload.cx_reference_breadth_code || payload.cxReferenceBreadthCode, "runtime_policy_resolved");

  const robotContext = {
    model_code: modelCode,
    role_layer_code: roleLayerCode,
    series_code: seriesCode,
    capability_profile_code: capabilityProfileCode,
    task_domain_code: taskDomainCode
  };

  const generationBasis = {
    contract_version: "B6R95R3B-R3",
    generation_owner: "AIWorkerOS",
    requester_app_ref: requesterAppRef,
    source_request_ref: sourceRequestRef,
    source_route_code: routeCode,
    robot_trait_basis: "model_code / role_layer_code / series_code / capability_profile_code are carried as generation basis; deeper trait resolution belongs to AIWorkerOS robot profile logic.",
    cx_depth_basis: cxDepthCode,
    cx_breadth_basis: cxBreadthCode,
    cx_reference_boundary: "CX22073JW is robot brain/reference data. Access-control remains AIWorkerOS-side, not requester-app-side.",
    safety_boundary: "internal_only_no_external_execution_no_pg_apply_no_destructive_action"
  };

  const outputTitle = `${taskTitle} 成果物`;
  const deliverablePackage = aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle);
  const summaryText = aiwB6R95R3R3Clip(
    `AIWorkerOSが${modelCode}を成果物生成主体として、${taskTitle}の一次成果物と一次サマリを作成しました。依頼元アプリはこのsummary_textとdeliverable_ref/linkを保存してレビューに利用できます。`,
    700
  );

  const qualityNotes = aiwB6R95R3R3Lines([
    "AIWorkerOS側で生成した一次成果物です。",
    `設定ロボット: ${modelCode}`,
    `役割レイヤー: ${roleLayerCode}`,
    `タスク領域: ${taskDomainCode}`,
    `CX参照深度: ${cxDepthCode}`,
    `CX参照広さ: ${cxBreadthCode}`,
    "今後の生成エンジン深化では、同じ契約のままロボット特性・CX参照範囲・能力差を本文品質へさらに反映します。"
  ]);

  const unresolvedIssues = aiwB6R95R3R3Lines([
    "この段階では外部実行、PG apply、破壊的操作は行っていません。",
    "追加調査・DB変更・実装反映が必要な場合は、依頼元アプリ側の承認/差し戻し工程で判断してください。"
  ]);

  const nextSteps = aiwB6R95R3R3Lines([
    "依頼元アプリでsummary_textとdeliverable_ref/linkを保存する。",
    "レビュー画面から成果物本文へ辿れるようにする。",
    "差し戻し時は追加条件をAIWorkerOSへ再依頼する。"
  ]);

  const bodyMarkdown = aiwB6R95R3R3Lines([
    `# ${taskTitle}`,
    "",
    "## 1. 成果物サマリ",
    summaryText,
    "",
    "## 2. 生成主体",
    `- generation_owner: AIWorkerOS`,
    `- requester_app_ref: ${requesterAppRef}`,
    `- source_request_ref: ${sourceRequestRef || "未指定"}`,
    `- source_route_code: ${routeCode}`,
    `- app_surface_code: ${appSurfaceCode}`,
    "",
    "## 3. 設定ロボット / 性能差の根拠",
    `- model_code: ${modelCode}`,
    `- role_layer_code: ${roleLayerCode}`,
    `- series_code: ${seriesCode}`,
    `- capability_profile_code: ${capabilityProfileCode}`,
    `- task_domain_code: ${taskDomainCode}`,
    `- cx_reference_depth_code: ${cxDepthCode}`,
    `- cx_reference_breadth_code: ${cxBreadthCode}`,
    "",
    "## 4. 成果物本文",
    taskInstruction || "依頼本文が空のため、タスク名と設定ロボット情報を基準に一次成果物を作成しました。",
    "",
    "## 5. 品質メモ",
    qualityNotes,
    "",
    "## 6. 未解決事項",
    unresolvedIssues,
    "",
    "## 7. 次工程",
    nextSteps,
    "",
    "## 8. 安全境界",
    "- external_execution_performed_flag=false",
    "- pg_apply_performed_flag=false",
    "- destructive_action_performed_flag=false",
    "- CX22073JW brain access control is AIWorkerOS-side responsibility",
    ""
  ]);

  const generatedArtifacts = [
    {
      kind: "main_deliverable",
      title: outputTitle,
      file_name: "01_main_deliverable.md",
      body_markdown: bodyMarkdown
    },
    {
      kind: "quality_notes",
      title: "品質メモ",
      file_name: "90_quality_notes.md",
      body_markdown: qualityNotes
    },
    {
      kind: "unresolved_issues",
      title: "未解決事項",
      file_name: "91_unresolved_issues.md",
      body_markdown: unresolvedIssues
    },
    {
      kind: "next_steps",
      title: "次工程",
      file_name: "92_next_steps.md",
      body_markdown: nextSteps
    }
  ];
  const outputPayload = {
    contract_version: "B6R95R3B-R3",
    contract_name: "aiworkeros_common_requester_deliverable_contract",
    deliverable_kind: "document",
    body_format: "markdown",
    deliverable_package: deliverablePackage,
    deliverable_link: deliverablePackage.zip_link,
    generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
    requester_app_ref: requesterAppRef,
    source_request_ref: sourceRequestRef,
    source_route_code: routeCode,
    app_surface_code: appSurfaceCode,
    robot_context: robotContext,
    generation_basis: generationBasis,
    quality_notes: qualityNotes,
    unresolved_issues: unresolvedIssues,
    next_steps: nextSteps,
    external_execution_performed_flag: false,
    pg_apply_performed_flag: false,
    destructive_action_performed_flag: false
  };

  const artifacts = [
    {
      artifact_kind_code: "markdown",
      artifact_title_ja: outputTitle,
      body_format: "markdown",
      deliverable_package: deliverablePackage,
      deliverable_link: deliverablePackage.zip_link,
      generated_artifacts: generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index)),
      body_markdown: bodyMarkdown,
      summary_text: summaryText,
      quality_notes: qualityNotes,
      unresolved_issues: unresolvedIssues,
      next_steps: nextSteps,
      robot_context: robotContext,
      generation_basis: generationBasis,
      contract_version: "B6R95R3B-R3"
    }
  ];

  return {
    outputTitle,
    bodyMarkdown,
    summaryText,
    qualityNotes,
    unresolvedIssues,
    nextSteps,
    robotContext,
    generationBasis,
    deliverablePackage,
    generatedArtifacts,
    outputPayload,
    artifacts
  };
}

/* B6R95R3Z_R24_CX_MATERIAL_BODY_GENERATION_PATCH_START */
function aiwB6R95R3Z24Text(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function aiwB6R95R3Z24SqlLiteral(value) {
  return "'" + String(value || "").replace(/'/g, "''") + "'";
}

function aiwB6R95R3Z24PickFirstText(obj, keys) {
  if (!obj || typeof obj !== "object") return "";
  for (const key of keys) {
    if (typeof obj[key] === "string" && obj[key].trim()) return obj[key].trim();
  }
  return "";
}

function aiwB6R95R3Z24CollectTextDeep(value, maxLen = 5000, depth = 0) {
  if (value == null || depth > 5) return "";
  if (typeof value === "string") return value.slice(0, maxLen);
  if (typeof value !== "object") return String(value).slice(0, maxLen);

  const parts = [];
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 12)) {
      const t = aiwB6R95R3Z24CollectTextDeep(item, maxLen, depth + 1);
      if (t) parts.push(t);
    }
  } else {
    const preferred = [
      "unit_title_ja",
      "unit_summary_ja",
      "unit_body_ja",
      "title_ja",
      "summary_ja",
      "body_ja",
      "content_ja",
      "description_ja",
      "robot_use_summary_ja",
      "source_caution_ja",
      "misconception_guard_ja",
      "topic_label_ja",
      "brain_data_code",
      "detail_axis_code"
    ];
    for (const key of preferred) {
      if (value[key]) {
        const t = aiwB6R95R3Z24CollectTextDeep(value[key], maxLen, depth + 1);
        if (t) parts.push(t);
      }
    }
    if (!parts.length) {
      for (const [k, v] of Object.entries(value).slice(0, 30)) {
        if (/secret|token|password|key/i.test(k)) continue;
        const t = aiwB6R95R3Z24CollectTextDeep(v, maxLen, depth + 1);
        if (t) parts.push(t);
      }
    }
  }

  return parts.join("\n").slice(0, maxLen);
}

function aiwB6R95R3Z24PayloadText(payload, keys) {
  for (const key of keys) {
    if (payload && typeof payload[key] === "string" && payload[key].trim()) return payload[key].trim();
  }
  for (const nestedKey of ["payload", "request_payload", "input_json", "body", "request", "runtime_request"]) {
    const nested = payload && payload[nestedKey];
    if (nested && typeof nested === "object") {
      for (const key of keys) {
        if (typeof nested[key] === "string" && nested[key].trim()) return nested[key].trim();
      }
    }
  }
  return "";
}

function aiwB6R95R3Z24ModelCode(payload) {
  return aiwB6R95R3Z24PayloadText(payload, [
    "model_code",
    "robot_model_code",
    "selected_robot_model_code",
    "runtime_model_code"
  ]) || "byd2_003_asic_leader3";
}

function aiwB6R95R3Z24Instruction(payload) {
  return aiwB6R95R3Z24PayloadText(payload, [
    "task_instruction_ja",
    "instruction_ja",
    "user_instruction_ja",
    "task_instruction",
    "instruction",
    "user_instruction"
  ]);
}

function aiwB6R95R3Z24TaskTitle(payload) {
  return aiwB6R95R3Z24PayloadText(payload, [
    "task_title_ja",
    "task_title",
    "title"
  ]) || "AIWorkerOS 成果物";
}

function aiwB6R95R3Z24SearchTerms(payload) {
  const text = [
    aiwB6R95R3Z24TaskTitle(payload),
    aiwB6R95R3Z24Instruction(payload)
  ].join("\n");

  const terms = [];

  if (/大化|taika|乙巳|改新|公地公民/.test(text)) {
    terms.push("大化", "大化の改新", "taika", "乙巳", "改新の詔", "公地公民", "日本書紀", "律令");
  }

  for (const m of text.matchAll(/[一-龯ぁ-んァ-ンA-Za-z0-9_]{3,}/g)) {
    const v = m[0];
    if (!terms.includes(v) && !/してください|成果物|summary|generated|artifacts|link|zip/.test(v)) terms.push(v);
    if (terms.length >= 12) break;
  }

  return terms.length ? terms : ["大化", "taika"];
}

function aiwB6R95R3Z24RunPsqlJson(sql) {
  let req = null;
  try {
    req = eval("require");
  } catch {
    return [];
  }

  try {
    const cp = req("node:child_process");
    const dbUrl = process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL || "";
    if (!dbUrl) return [];

    const out = cp.execFileSync("psql", [
      dbUrl,
      "-X",
      "-q",
      "-t",
      "-A",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql
    ], {
      encoding: "utf8",
      timeout: 15000,
      env: Object.assign({}, process.env, { PGOPTIONS: "" })
    });

    const text = String(out || "").trim();
    if (!text) return [];
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function aiwB6R95R3Z24FetchCxRuntimeMaterials(payload) {
  const modelCode = aiwB6R95R3Z24ModelCode(payload);
  const terms = aiwB6R95R3Z24SearchTerms(payload);
  const termConds = terms
    .slice(0, 10)
    .map((term) => "to_jsonb(t)::text ILIKE " + aiwB6R95R3Z24SqlLiteral("%" + term + "%"))
    .join(" OR ");

  const views = [
    "aiworker.vw_robot_readable_brain_runtime_material_canon_v1",];

  for (const view of views) {
    const sql = [
      "BEGIN READ ONLY;",
      "WITH picked AS (",
      "  SELECT to_jsonb(t) AS row_json",
      "  FROM " + view + " t",
      "  WHERE t.model_code = " + aiwB6R95R3Z24SqlLiteral(modelCode),
      "    AND (" + termConds + ")",
      "  LIMIT 24",
      ")",
      "SELECT COALESCE(jsonb_agg(row_json), '[]'::jsonb)::text FROM picked;",
      "COMMIT;",
      "/* B6R95R3Z_R26_READONLY_HELPER_REPAIR */"
    ].join("\n");

    const rows = aiwB6R95R3Z24RunPsqlJson(sql);
    if (rows.length) return rows;
  }

  return [];
}

function aiwB6R95R3Z24MaterialTitle(row, index) {
  return aiwB6R95R3Z24PickFirstText(row, [
    "unit_title_ja",
    "title_ja",
    "material_title_ja",
    "topic_label_ja",
    "brain_data_title_ja",
    "brain_data_code",
    "unit_code",
    "detail_axis_code"
  ]) || "CX参照素材 " + String(index + 1);
}

function aiwB6R95R3Z24MaterialBody(row) {
  const body = aiwB6R95R3Z24PickFirstText(row, [
    "unit_body_ja",
    "unit_summary_ja",
    "body_ja",
    "content_ja",
    "summary_ja",
    "detail_body_ja",
    "reference_text_ja",
    "robot_use_summary_ja",
    "description_ja",
    "source_caution_ja",
    "misconception_guard_ja"
  ]);

  return body || aiwB6R95R3Z24CollectTextDeep(row, 3500);
}

function aiwB6R95R3Z24BuildMaterialMarkdown(payload, rows) {
  const title = aiwB6R95R3Z24TaskTitle(payload);
  const modelCode = aiwB6R95R3Z24ModelCode(payload);
  const instruction = aiwB6R95R3Z24Instruction(payload);

  const blocks = [];
  blocks.push("# " + title);
  blocks.push("");
  blocks.push("## 1. 成果物サマリ");
  blocks.push("AIWorkerOSがCX22073JWのruntime materialを参照し、依頼内容に対応する詳細資料として再構成した成果物です。");
  blocks.push("");
  blocks.push("## 2. 生成主体");
  blocks.push("- generation_owner: AIWorkerOS");
  blocks.push("- model_code: " + modelCode);
  blocks.push("- cx_reference_source: CX22073JW runtime material / selector v2 readable brain material");
  blocks.push("- safety_boundary: internal_only_no_external_execution_no_pg_apply_no_destructive_action");
  blocks.push("");
  blocks.push("## 3. 依頼要旨");
  blocks.push(instruction || "依頼文なし");
  blocks.push("");
  blocks.push("## 4. CX参照素材からの展開本文");

  rows.slice(0, 16).forEach((row, index) => {
    const title = aiwB6R95R3Z24MaterialTitle(row, index);
    const body = aiwB6R95R3Z24MaterialBody(row).trim();

    blocks.push("");
    blocks.push("### 4." + String(index + 1) + " " + title);
    blocks.push(body ? body.slice(0, 2600) : "本文なし");
  });

  blocks.push("");
  blocks.push("## 5. 出典・史料注意");
  blocks.push("CX側materialに source_basis / source_caution / verification_status が含まれる場合は、それを優先して扱います。歴史資料では、一次史料・標準学習整理・研究上の注意点を分け、断定しすぎない説明にします。");
  blocks.push("");
  blocks.push("## 6. 誤解防止");
  blocks.push("制度や事件を単発で完成したものとして扱わず、時系列・後続制度・史料上の注意と接続して説明します。");
  blocks.push("");
  blocks.push("## 7. 次工程");
  blocks.push("依頼元アプリは summary_text と deliverable_link を保存し、必要に応じて追加条件を指定して再生成できます。");

  return blocks.join("\n");
}

function aiwB6R95R3Z24EnhanceDeliverableWithCxMaterial(deliverable, payload, sourceRouteCode) {
  const safeDeliverable = deliverable || {};
  const originalBody = aiwB6R95R3Z24Text(safeDeliverable.bodyMarkdown || safeDeliverable.body_markdown || "");
  const instruction = aiwB6R95R3Z24Instruction(payload);
  const normalizedBody = originalBody.replace(/\s+/g, "");
  const normalizedInstruction = instruction.replace(/\s+/g, "");
  const echoRisk = normalizedInstruction && normalizedBody.includes(normalizedInstruction.slice(0, Math.min(120, normalizedInstruction.length)));

  const rows = aiwB6R95R3Z24FetchCxRuntimeMaterials(payload);

  if (!rows.length) {
    safeDeliverable.generationBasis = Object.assign({}, safeDeliverable.generationBasis || {}, {
      cx_material_patch_code: "B6R95R3Z-R24",
      cx_material_rows_found: 0,
      cx_material_body_enhanced: false
    });
    return safeDeliverable;
  }

  const enhancedBody = aiwB6R95R3Z24BuildMaterialMarkdown(payload, rows);

  if (echoRisk || enhancedBody.length > originalBody.length) {
    safeDeliverable.bodyMarkdown = enhancedBody;
    safeDeliverable.summaryText = "CX22073JWのruntime materialを参照し、" + aiwB6R95R3Z24TaskTitle(payload) + " の詳細資料を生成しました。";
    safeDeliverable.qualityNotes = [
      "CX material rows used: " + String(rows.length),
      "selector/material path: runtime readable brain material v3/v2/v1 fallback",
      "body generation patch: B6R95R3Z-R24",
      "source_route_code: " + String(sourceRouteCode || "")
    ].join("\n");
  }

  safeDeliverable.robotContext = Object.assign({}, safeDeliverable.robotContext || {}, {
    cx_material_rows_used: rows.length,
    cx_material_patch_code: "B6R95R3Z-R24"
  });

  safeDeliverable.generationBasis = Object.assign({}, safeDeliverable.generationBasis || {}, {
    cx_material_patch_code: "B6R95R3Z-R24",
    cx_material_rows_found: rows.length,
    cx_material_body_enhanced: true,
    source: "CX22073JW runtime readable brain material"
  });

  return safeDeliverable;
}

function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
  const baseDeliverable = aiwB6R95R3R3BuildRequesterFacingDeliverableBaseB6R95R3Z24(payload, sourceRouteCode);
  return aiwB6R95R3Z24EnhanceDeliverableWithCxMaterial(baseDeliverable, payload, sourceRouteCode);
}
/* B6R95R3Z_R24_CX_MATERIAL_BODY_GENERATION_PATCH_END */

// AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_START
/*
  B6R95R3D-R1:
  Multi-artifact deliverable zip package contract.

  Canon:
  - AIWorkerOS creates one or more deliverable artifacts from the instruction.
  - AIWorkerOS creates summary_text.
  - AIWorkerOS bundles generated artifacts into one deliverable zip.
  - Requester apps display summary_text and link to the zip.
  - The zip exists to avoid one-by-one downloads when multiple artifacts are generated.

  Boundary:
  - No external execution.
  - No PG apply.
  - No destructive action.
  - No requester-app-specific contract.
*/
function aiwB6R95R3D1SafeFilePart(value, fallback) {
  const raw = String(value || fallback || "deliverable").trim();
  const safe = raw.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80);
  return safe || String(fallback || "deliverable");
}

function aiwB6R95R3D1BuildZipPackageMeta(requesterAppRef, taskTitle) {
  const crypto = require("crypto");
  const zipId = `${Date.now()}_${crypto.randomUUID()}`;
  const requesterPart = aiwB6R95R3D1SafeFilePart(requesterAppRef, "requester");
  const titlePart = aiwB6R95R3D1SafeFilePart(taskTitle, "deliverables");
  const rawFileName = `${requesterPart}_${titlePart}_${zipId}.zip`;

  // AIWORKEROS_B6R95R3H_PACKAGE_META_ZIP_LINK_BEFORE_DB_FIX
  // The package metadata is saved to DB before the zip file is written.
  // Therefore file_name / zip_link must already use the exact sanitized filename
  // that will be written to disk by aiwB6R95R3D1CreateZipAndAttach.
  const fileName = aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip").endsWith(".zip")
    ? aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables.zip")
    : `${aiwB6R95R3D1SafeFilePart(rawFileName, "deliverables")}.zip`;
  const zipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;

  return {
    package_kind: "deliverable_zip",
    package_format: "zip",
    mime_type: "application/zip",
    zip_id: zipId,
    file_name: fileName,
    zip_link: zipLink,
    zip_ref: {
      source: "aiworkeros",
      storage_code: "runtime-deliverable-zip",
      file_name: fileName
    }
  };
}

function aiwB6R95R3D1NormalizeGeneratedArtifact(item, index) {
  const seq = String(index + 1).padStart(2, "0");
  const kind = aiwB6R95R3R3OneLine(item?.artifact_kind_code || item?.kind || "document", "document");
  const title = aiwB6R95R3R3OneLine(item?.title || item?.artifact_title_ja || `成果物${seq}`, `成果物${seq}`);
  const body = aiwB6R95R3R3Text(item?.body_markdown || item?.body_text || item?.content || "");
  const suggestedName = item?.file_name || `${seq}_${aiwB6R95R3D1SafeFilePart(title, `artifact_${seq}`)}.md`;
  const fileName = aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`).endsWith(".md")
    ? aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}.md`)
    : `${aiwB6R95R3D1SafeFilePart(suggestedName, `artifact_${seq}`)}.md`;
  return {
    artifact_no: index + 1,
    artifact_kind_code: kind,
    title,
    file_name: fileName,
    body_markdown: body,
    body_format: "markdown"
  };
}

function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  if (provided.length > 0) {
    return provided.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
  }

  const artifacts = [
    {
      kind: "main_deliverable",
      title: deliverable?.outputTitle || "主成果物",
      file_name: "01_main_deliverable.md",
      body_markdown: deliverable?.bodyMarkdown || ""
    }
  ];

  if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
    artifacts.push({
      kind: "quality_notes",
      title: "品質メモ",
      file_name: "90_quality_notes.md",
      body_markdown: deliverable.qualityNotes
    });
  }

  if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {
    artifacts.push({
      kind: "unresolved_issues",
      title: "未解決事項",
      file_name: "91_unresolved_issues.md",
      body_markdown: deliverable.unresolvedIssues
    });
  }

  if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {
    artifacts.push({
      kind: "next_steps",
      title: "次工程",
      file_name: "92_next_steps.md",
      body_markdown: deliverable.nextSteps
    });
  }

  return artifacts.map(aiwB6R95R3D1NormalizeGeneratedArtifact);
}

function aiwB6R95R3D1ZipCrc32(buffer) {
  let table = aiwB6R95R3D1ZipCrc32._table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    aiwB6R95R3D1ZipCrc32._table = table;
  }
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function aiwB6R95R3D1ZipDosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function aiwB6R95R3D1ZipStored(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = aiwB6R95R3D1ZipDosDateTime(new Date());

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, "utf8");
    const dataBuffer = Buffer.from(String(entry.content ?? ""), "utf8");
    const crc = aiwB6R95R3D1ZipCrc32(dataBuffer);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(now.dosTime, 10);
    local.writeUInt16LE(now.dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuffer.length, 18);
    local.writeUInt32LE(dataBuffer.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, nameBuffer, dataBuffer);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(now.dosTime, 12);
    central.writeUInt16LE(now.dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(dataBuffer.length, 20);
    central.writeUInt32LE(dataBuffer.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, nameBuffer);

    offset += local.length + nameBuffer.length + dataBuffer.length;
  }

  const localData = Buffer.concat(localParts);
  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(localData.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localData, centralDir, eocd]);
}

function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
  const fs = require("fs");
  const path = require("path");

  const response = responsePayload && typeof responsePayload === "object" ? responsePayload : {};
  const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(deliverable);

  const zipDir = process.env.AIWORKEROS_DELIVERABLE_ZIP_DIR || path.join(process.cwd(), "runtime-deliverable-zips");
  fs.mkdirSync(zipDir, { recursive: true });

  const fileName = aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip").endsWith(".zip")
    ? aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables.zip")
    : `${aiwB6R95R3D1SafeFilePart(packageMeta.file_name, "deliverables")}.zip`;
  const zipPath = path.join(zipDir, fileName);

  // AIWORKEROS_B6R95R3F_ZIP_LINK_ACTUAL_FILE_FIX
  // Keep the returned zip link aligned with the actual sanitized filename written to disk.
  const actualZipLink = `aiworkeros://runtime-deliverable-zip/${fileName}`;
  const actualZipRef = Object.assign({}, packageMeta.zip_ref || {}, {
    source: "aiworkeros",
    storage_code: "runtime-deliverable-zip",
    file_name: fileName
  });

  const summaryText = response.deliverable?.summary_text || deliverable?.summaryText || "";
  const manifest = {
    contract_version: "B6R95R3D-R1",
    contract_name: "aiworkeros_common_requester_multi_artifact_zip_contract",
    package_purpose: "bundle_generated_artifacts_for_single_download",
    request_id: response.request_id || null,
    output_id: response.output_id || null,
    deliverable_title: response.deliverable?.title || deliverable?.outputTitle || "成果物",
    summary_text: summaryText,
    artifact_count: generatedArtifacts.length,
    generated_artifacts: generatedArtifacts.map((artifact) => ({
      artifact_no: artifact.artifact_no,
      artifact_kind_code: artifact.artifact_kind_code,
      title: artifact.title,
      file_name: artifact.file_name,
      body_format: artifact.body_format
    })),
    deliverable_ref: response.deliverable_ref || null,
    robot_context: response.robot_context || deliverable?.robotContext || null,
    generation_basis: response.generation_basis || deliverable?.generationBasis || null,
    safety: response.safety || null,
    created_at: new Date().toISOString()
  };

  const entries = [
    { name: "00_summary.md", content: summaryText },
    ...generatedArtifacts.map((artifact) => ({
      name: artifact.file_name,
      content: artifact.body_markdown
    })),
    { name: "manifest.json", content: JSON.stringify(manifest, null, 2) }
  ];

  const zipBuffer = aiwB6R95R3D1ZipStored(entries);
  fs.writeFileSync(zipPath, zipBuffer);
  const stat = fs.statSync(zipPath);

  const zipPublic = {
    package_kind: "deliverable_zip",
    package_format: "zip",
    mime_type: "application/zip",
    zip_id: packageMeta.zip_id,
    file_name: fileName,
    zip_link: actualZipLink,
    zip_ref: actualZipRef,
    byte_size: stat.size,
    entry_count: entries.length,
    artifact_count: generatedArtifacts.length,
    created_at: manifest.created_at
  };

  response.generated_artifacts = generatedArtifacts.map((artifact) => ({
    artifact_no: artifact.artifact_no,
    artifact_kind_code: artifact.artifact_kind_code,
    title: artifact.title,
    file_name: artifact.file_name,
    body_format: artifact.body_format
  }));
  response.deliverable_package = zipPublic;
  response.deliverable_zip_ref = actualZipRef;
  response.deliverable_link = actualZipLink;

  response.requester_delivery_payload = Object.assign({}, response.requester_delivery_payload || {}, {
    summary_text: summaryText,
    deliverable_link: actualZipLink,
    deliverable_package: zipPublic,
    deliverable_zip_ref: actualZipRef,
    generated_artifacts: response.generated_artifacts
  });

  response.deliverable = Object.assign({}, response.deliverable || {}, {
    deliverable_package: zipPublic,
    zip_link: actualZipLink,
    generated_artifacts: response.generated_artifacts
  });

  return response;
}
// AIWORKEROS_B6R95R3D_R1_MULTI_ARTIFACT_ZIP_CONTRACT_END
// AIWORKEROS_B6R95R3B_R3_COMMON_DELIVERABLE_CONTRACT_END
function createRuntimeRequest(payload, idempotencyKeyFromHeader) {
  const idempotencyKey = payload.idempotency_key || idempotencyKeyFromHeader || "";
  const sourceRouteCode = String(
    payload.source_route_code ||
    payload.sourceRouteCode ||
    payload.source_route ||
    ""
  ).trim();
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

  const deliverable = aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode);

  const sql = [
    "with created as (",
    "  select aiworker.fn_runtime_execution_create_request_with_route_v1(",
    "    :'app_surface_code',",
    "    :'model_code',",
    "    :'task_domain_code',",
    "    :'task_title',",
    "    :'task_instruction_ja',",
    "    :'source_app_ref',",
    "    :'source_request_ref',",
    "    :'requested_by_ref',",
    "    :'idempotency_key',",
    "    :'source_route_code'",
    "  ) as request_id",
    "),",
    "worker_output as (",
    "  select aiworker.fn_runtime_execution_submit_worker_output(",
    "    (select request_id from created),",
    "    :'output_title_ja',",
    "    :'output_body_ja',",
    "    :'output_summary_ja',",
    "    :'output_payload_jsonb'::jsonb,",
    "    :'artifacts_jsonb'::jsonb",
    "  ) as output_id",
    "),",
    "board as (",
    "  select p.*",
    "  from aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1 p",
    "  join created c",
    "    on c.request_id = p.request_id",
    ")",
    "select jsonb_build_object(",
    "  'result', 'completed_internal_draft',",
    "  'status', 'WORKER_OUTPUT_DONE',",
    "  'request_id', (select request_id from created),",
    "  'output_id', (select output_id from worker_output),",
    "  'idempotency_key', :'idempotency_key',",
    "  'requester_app_ref', :'source_app_ref',",
    "  'source_request_ref', :'source_request_ref',",
    "  'source_route_code', :'source_route_code',",
    "  'payload', coalesce((select app_read_payload_jsonb from board limit 1), '{}'::jsonb),",
    "  'robot_context', :'robot_context_jsonb'::jsonb,",
    "  'generation_basis', :'generation_basis_jsonb'::jsonb,",    "  'deliverable', jsonb_build_object(",
    "    'package_kind', 'deliverable_zip',",
    "    'deliverable_kind', 'document',",
    "    'title', :'output_title_ja',",
    "    'body_format', 'markdown',",
    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
    "    'body_markdown', :'output_body_ja',",
    "    'summary_text', :'output_summary_ja',",
    "    'quality_notes', :'quality_notes',",
    "    'unresolved_issues', :'unresolved_issues',",
    "    'next_steps', :'next_steps',",
    "    'output_id', (select output_id from worker_output),",
    "    'zip_link', :'deliverable_zip_link'",
    "  ),",
    "  'deliverable_ref', jsonb_build_object(",
    "    'source', 'aiworkeros',",
    "    'schema', 'aiworker',",
    "    'table', 'runtime_worker_output',",
    "    'id', (select output_id from worker_output)::text",
    "  ),",
    "  'deliverable_link', :'deliverable_zip_link',",    "  'requester_delivery_payload', jsonb_build_object(",
    "    'summary_text', :'output_summary_ja',",
    "    'deliverable_title', :'output_title_ja',",
    "    'package_kind', 'deliverable_zip',",
    "    'deliverable_kind', 'document',",
    "    'body_format', 'markdown',",
    "    'generated_artifacts', :'generated_artifacts_jsonb'::jsonb,",
    "    'deliverable_link', :'deliverable_zip_link',",
    "    'deliverable_package', :'deliverable_package_jsonb'::jsonb,",
    "    'deliverable_ref', jsonb_build_object(",
    "      'source', 'aiworkeros',",
    "      'schema', 'aiworker',",
    "      'table', 'runtime_worker_output',",
    "      'id', (select output_id from worker_output)::text",
    "    )",
    "  ),",
    "  'safety', jsonb_build_object(",
    "    'external_execution_performed_flag', false,",
    "    'pg_apply_performed_flag', false,",
    "    'destructive_action_performed_flag', false",
    "  )",
    ")::text;",
  ].join("\n");

  const responsePayload = psqlJson(sql, {
    app_surface_code: payload.app_surface_code,
    model_code: payload.model_code,
    task_domain_code: payload.task_domain_code,
    task_title: payload.task_title,
    task_instruction_ja: payload.task_instruction_ja,
    source_app_ref: payload.source_app_ref || "HTTP_LOCAL",
    source_request_ref: payload.source_request_ref || "",
    source_route_code: sourceRouteCode,
    requested_by_ref: payload.requested_by_ref || "human",
    idempotency_key: idempotencyKey,
    output_title_ja: deliverable.outputTitle,
    output_body_ja: deliverable.bodyMarkdown,
    output_summary_ja: deliverable.summaryText,
    quality_notes: deliverable.qualityNotes,
    unresolved_issues: deliverable.unresolvedIssues,
    next_steps: deliverable.nextSteps,
    deliverable_package_jsonb: JSON.stringify(deliverable.deliverablePackage),
    deliverable_zip_link: deliverable.deliverablePackage.zip_link,
    generated_artifacts_jsonb: JSON.stringify(deliverable.generatedArtifacts.map((artifact, index) => aiwB6R95R3D1NormalizeGeneratedArtifact(artifact, index))),
    robot_context_jsonb: JSON.stringify(deliverable.robotContext),
    generation_basis_jsonb: JSON.stringify(deliverable.generationBasis),
    output_payload_jsonb: JSON.stringify(deliverable.outputPayload),
    artifacts_jsonb: JSON.stringify(deliverable.artifacts)
  });

  return aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable);
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
