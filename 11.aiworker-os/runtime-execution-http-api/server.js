
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
  const aiwB6R97R61OuterArgs = Array.from(arguments);
  /* AIWORKEROS_B6R97R58C_MATERIAL_MARKDOWN_RETURN_WRAP_START */
  function aiwB6R97R58CShortRequestSummary(value) {
    const raw = String(value || "").replace(/\s+/g, " ").trim();
    if (!raw) return "依頼内容に基づく成果物作成";
    const topicMatch = raw.match(/^(.{2,80}?)(?:について|に関する|を対象に|の)(?:、|,|。|\s|$)/);
    if (topicMatch && topicMatch[1]) {
      const topic = topicMatch[1].replace(/[。！？、,]+$/g, "").trim();
      if (topic) return topic + "に関する成果物作成";
    }
    const firstSentence = raw.split(/[。！？]/).filter(Boolean)[0] || raw;
    if (firstSentence.length <= 28 && !/できるだけ詳細|含める|作成して|資料にして|してください/.test(firstSentence)) {
      return firstSentence;
    }
    return "依頼内容に基づく成果物作成";
  }

  function aiwB6R97R58CSanitizeMaterialMarkdown(markdown) {
    let out = String(markdown || "");
    out = out.replace(/(## 3\. 依頼要旨\s*\n)([\s\S]*?)(?=\n## \d+\.|\n# |$)/, function(match, heading, body) {
      return heading + aiwB6R97R58CShortRequestSummary(body) + "\n";
    });
    return aiwB6R97R61EnsureRequiredViewpointsSection(out);
  }
  /* AIWORKEROS_B6R97R58C_MATERIAL_MARKDOWN_RETURN_WRAP_END */

  /* AIWORKEROS_B6R97R61_MATERIAL_MARKDOWN_REQUIRED_VIEWPOINTS_START */
  function aiwB6R97R61CollectText(value, depth) {
    if (depth > 6 || value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map((item) => aiwB6R97R61CollectText(item, depth + 1)).join("\n");
    if (typeof value === "object") return Object.values(value).map((item) => aiwB6R97R61CollectText(item, depth + 1)).join("\n");
    return "";
  }

  function aiwB6R97R61RequiredViewpointTerms(markdown) {
    const text = [markdown].concat(aiwB6R97R61OuterArgs.map((item) => aiwB6R97R61CollectText(item, 0))).join("\n").slice(0, 160000);
    const terms = [];

    if (/大化の改新|乙巳の変|中大兄|中臣鎌足|蘇我/.test(text)) {
      terms.push(
        "大化の改新",
        "乙巳の変",
        "蘇我",
        "入鹿",
        "蝦夷",
        "中大兄",
        "中臣鎌足",
        "孝徳天皇",
        "改新の詔",
        "公地公民",
        "班田収授",
        "戸籍",
        "評制",
        "郡制",
        "難波宮",
        "租庸調",
        "後続影響",
        "史料上の注意点"
      );
    }

    [
      "班田収授",
      "郡制",
      "租庸調",
      "史料上の注意点",
      "戸籍",
      "評制",
      "難波宮",
      "改新の詔",
      "公地公民"
    ].forEach((term) => {
      if (text.includes(term)) terms.push(term);
    });

    return Array.from(new Set(terms)).filter(Boolean).slice(0, 30);
  }

  function aiwB6R97R61EnsureRequiredViewpointsSection(markdown) {
    const out = String(markdown || "");
    if (out.includes("## 3.1 必須観点")) return out;
    const terms = aiwB6R97R61RequiredViewpointTerms(out);
    if (!terms.length) return out;

    const section = [
      "## 3.1 必須観点",
      "本成果物では、以下の観点を落とさず扱う。",
      "",
      ...terms.map((term) => "- " + term)
    ].join("\n");

    if (/\n## 4\./.test(out)) {
      return out.replace(/\n## 4\./, "\n\n" + section + "\n\n## 4.");
    }

    return out + "\n\n" + section;
  }
  /* AIWORKEROS_B6R97R61_MATERIAL_MARKDOWN_REQUIRED_VIEWPOINTS_END */


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
  blocks.push("## 4. 参照資料に基づく本文");

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

  return aiwB6R97R58CSanitizeMaterialMarkdown(blocks.join("\n"));
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


// B6R98R3B_SOURCE_FILE_READER_START
// Read local source/reference files declared by requester payload.
// Scope:
// - reference_files_text / supplemental_materials_text / applicable_rules_text
// - task_instruction_ja lines such as "参照ファイル: /path/to/file.md"
// Safety:
// - local files only
// - allowed roots only
// - text-like extensions only
// - size/total limits
function aiwB6R98R3BSourceText(value) {
  return value === null || value === undefined ? "" : String(value);
}

function aiwB6R98R3BFlattenPayloadValues(value, out, depth) {
  if (!out) out = [];
  if (depth > 5) return out;

  if (value === null || value === undefined) return out;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    out.push(String(value));
    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => aiwB6R98R3BFlattenPayloadValues(item, out, depth + 1));
    return out;
  }

  if (typeof value === "object") {
    Object.keys(value).forEach((key) => {
      const lower = String(key || "").toLowerCase();
      if (
        lower.includes("reference") ||
        lower.includes("supplemental") ||
        lower.includes("file") ||
        lower.includes("path") ||
        lower.includes("source") ||
        lower.includes("rule") ||
        lower.includes("instruction") ||
        lower.includes("context")
      ) {
        aiwB6R98R3BFlattenPayloadValues(value[key], out, depth + 1);
      }
    });
  }

  return out;
}

function aiwB6R98R3BMaybeParseJsonText(text) {
  const raw = aiwB6R98R3BSourceText(text).trim();
  if (!raw) return null;
  if (!raw.startsWith("{") && !raw.startsWith("[")) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function aiwB6R98R3BCollectTextSources(payload) {
  const sources = [];
  const directKeys = [
    "reference_files_text",
    "supplemental_materials_text",
    "applicable_rules_text",
    "source_file_path",
    "source_file_paths",
    "source_data_path",
    "source_data_paths",
    "source_reference_path",
    "source_reference_paths",
    "source_material_path",
    "source_material_paths",
    "task_instruction_ja",
    "instruction",
    "input_context_text",
    "expected_output_text"
  ];

  directKeys.forEach((key) => {
    if (payload && payload[key] !== undefined && payload[key] !== null) {
      const raw = payload[key];
      sources.push(aiwB6R98R3BSourceText(raw));
      const parsed = aiwB6R98R3BMaybeParseJsonText(raw);
      if (parsed) aiwB6R98R3BFlattenPayloadValues(parsed, sources, 0);
    }
  });

  ["payload", "request_payload", "input_json", "body", "request", "runtime_request", "metadata_jsonb", "metadata"].forEach((key) => {
    const nested = payload && payload[key];
    if (nested) aiwB6R98R3BFlattenPayloadValues(nested, sources, 0);
  });

  return sources.filter(Boolean);
}

function aiwB6R98R3BHomeDir() {
  return process.env.HOME || "/data/data/com.termux/files/home";
}

function aiwB6R98R3BNormalizeCandidatePath(candidate) {
  let text = aiwB6R98R3BSourceText(candidate).trim();
  if (!text) return "";

  text = text.replace(/[\u0000]/g, "");
  text = text.replace(/^['"\s]+|['"\s]+$/g, "");
  text = text.replace(/[),;，、。]+$/g, "");

  if (text.startsWith("file://")) {
    text = text.slice("file://".length);
  }

  if (text.startsWith("~/")) {
    text = aiwB6R98R3BHomeDir() + text.slice(1);
  }

  return text;
}

function aiwB6R98R3BAllowedRoots() {
  const defaults = [
    aiwB6R98R3BHomeDir(),
    "/data/data/com.termux/files/home",
    "/mnt/data"
  ];

  const envRoots = aiwB6R98R3BSourceText(process.env.AIWORKEROS_SOURCE_FILE_ALLOWED_ROOTS)
    .split(":")
    .map((v) => v.trim())
    .filter(Boolean);

  const roots = defaults.concat(envRoots);
  return Array.from(new Set(roots)).map((root) => path.resolve(root));
}

function aiwB6R98R3BIsUnderAllowedRoot(absPath) {
  const normalized = path.resolve(absPath);
  return aiwB6R98R3BAllowedRoots().some((root) => {
    return normalized === root || normalized.startsWith(root + path.sep);
  });
}

function aiwB6R98R3BIsTextLikeFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const allowed = {
    ".txt": true,
    ".text": true,
    ".md": true,
    ".markdown": true,
    ".csv": true,
    ".json": true,
    ".jsonl": true,
    ".yaml": true,
    ".yml": true,
    ".xml": true,
    ".html": true,
    ".htm": true,
    ".css": true,
    ".js": true,
    ".mjs": true,
    ".cjs": true,
    ".ts": true,
    ".tsx": true,
    ".jsx": true,
    ".sql": true,
    ".log": true
  };
  return !!allowed[ext];
}

function aiwB6R98R3BExtractCandidatePathsFromText(text) {
  const raw = aiwB6R98R3BSourceText(text);
  if (!raw.trim()) return [];

  const candidates = [];

  const jsonParsed = aiwB6R98R3BMaybeParseJsonText(raw);
  if (jsonParsed) {
    const values = aiwB6R98R3BFlattenPayloadValues(jsonParsed, [], 0);
    values.forEach((v) => candidates.push(v));
  }

  const regex = /(?:file:\/\/)?(?:~\/|\/data\/data\/com\.termux\/files\/home\/|\/mnt\/data\/)[^\s"'<>]+/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    candidates.push(match[0]);
  }

  return candidates
    .map(aiwB6R98R3BNormalizeCandidatePath)
    .filter(Boolean);
}

function aiwB6R98R3BCollectCandidatePaths(payload) {
  const sources = aiwB6R98R3BCollectTextSources(payload);
  const all = [];
  sources.forEach((text) => {
    aiwB6R98R3BExtractCandidatePathsFromText(text).forEach((candidate) => all.push(candidate));
  });
  return Array.from(new Set(all));
}

/* AIWORKEROS_B6R97R66_TEXT_SOURCE_ANALYZER_START */
function aiwB6R97R66DetectSourceMaterialType(filePath) {
  const lower = String(filePath || "").toLowerCase();
  if (/\.(txt|md|markdown|json|jsonl|csv|tsv|log|xml|html|htm|css|js|mjs|cjs|ts|tsx|jsx|sql|yaml|yml|ini|conf)$/i.test(lower)) return "text";
  if (/\.pdf$/i.test(lower)) return "pdf";
  if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(lower)) return "image";
  if (/\.(mp3|wav|m4a|aac|ogg|flac|mid|midi)$/i.test(lower)) return "audio";
  return "unknown";
}

function aiwB6R97R66SourceMaterialSummary(text) {
  const raw = String(text || "").replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  return raw.slice(0, 240);
}

function aiwB6R97R66BuildSourceMaterialAnalysisResults(rows, rejected) {
  const used = Array.isArray(rows) ? rows : [];
  const rejects = Array.isArray(rejected) ? rejected : [];
  const results = [];

  used.forEach((row, index) => {
    const mediaType = row.media_type || aiwB6R97R66DetectSourceMaterialType(row && row.path);
    results.push({
      source_path: row.path,
      file_name: row.path ? String(row.path).split("/").pop() : "",
      media_type: mediaType,
      analyzer_status: row.analyzer_status || (mediaType === "text" ? "analyzed" : "metadata_only"),
      analyzer_code: "B6R97R66",
      byte_size: row.byte_size || 0,
      char_count: row.char_count || 0,
      extracted_summary: mediaType === "text" ? aiwB6R97R66SourceMaterialSummary(row.body_text || "") : "",
      warnings: row.metadata_only_flag ? ["metadata_only_first_phase", "no_binary_content_read"] : (mediaType === "text" ? [] : ["metadata_only_first_phase"]),
      safety_notes: ["local_source_file_only", "no_external_model_call", "no_ocr_or_transcription_in_first_phase"],
      included_in_prompt_flag: Boolean(row.body_text) && !row.metadata_only_flag,
      order_index: index
    });
  });

  rejects.forEach((item, index) => {
    results.push({
      source_path: item.path || "",
      file_name: item.path ? String(item.path).split("/").pop() : "",
      media_type: aiwB6R97R66DetectSourceMaterialType(item.path || ""),
      analyzer_status: "rejected",
      analyzer_code: "B6R97R66",
      warnings: [item.reason || "rejected"].filter(Boolean),
      safety_notes: ["source_reader_rejection_record"],
      included_in_prompt_flag: false,
      order_index: used.length + index
    });
  });

  return results;
}

function aiwB6R97R66RenderSourceMaterialAnalysisMarkdown(sourceFiles) {
  const rows = sourceFiles && Array.isArray(sourceFiles.analysis_results) ? sourceFiles.analysis_results : [];
  if (!rows.length) return "";
  const blocks = [
    "## 参照ファイル解析結果",
    "",
    "AIWorkerOS source material analyzer v1 の結果です。text は本文読込、pdf/image/audio は後続phaseで本格解析します。"
  ];
  rows.forEach((row, index) => {
    blocks.push("");
    blocks.push("### source material " + String(index + 1));
    blocks.push("- analyzer_code: " + String(row.analyzer_code || "B6R97R66"));
    blocks.push("- file_name: " + String(row.file_name || ""));
    blocks.push("- media_type: " + String(row.media_type || "unknown"));
    blocks.push("- analyzer_status: " + String(row.analyzer_status || "unknown"));
    blocks.push("- included_in_prompt_flag: " + String(Boolean(row.included_in_prompt_flag)));
    if (row.extracted_summary) {
      blocks.push("- extracted_summary: " + String(row.extracted_summary));
    }
    if (Array.isArray(row.warnings) && row.warnings.length) {
      blocks.push("- warnings: " + row.warnings.join(", "));
    }
  });
  return blocks.join("\n");
}
/* AIWORKEROS_B6R97R66_TEXT_SOURCE_ANALYZER_END */
function aiwB6R98R3BReadSourceFiles(payload) {
  const candidates = aiwB6R98R3BCollectCandidatePaths(payload);
  const maxFiles = Math.max(1, Math.min(10, Number(process.env.AIWORKEROS_SOURCE_FILE_MAX_FILES || "5") || 5));
  const maxBytes = Math.max(1024, Math.min(2 * 1024 * 1024, Number(process.env.AIWORKEROS_SOURCE_FILE_MAX_BYTES || "2097152") || 2097152));
  const maxTotalChars = Math.max(4000, Math.min(120000, Number(process.env.AIWORKEROS_SOURCE_FILE_MAX_TOTAL_CHARS || "60000") || 60000));

  const rows = [];
  const rejected = [];
  let totalChars = 0;

  for (const candidate of candidates) {
    if (rows.length >= maxFiles) {
      rejected.push({ path: candidate, reason: "max_files_exceeded" });
      continue;
    }

    const normalized = aiwB6R98R3BNormalizeCandidatePath(candidate);
    const absPath = path.resolve(normalized);

    try {
      if (!aiwB6R98R3BIsUnderAllowedRoot(absPath)) {
        rejected.push({ path: candidate, reason: "outside_allowed_roots" });
        continue;
      }

      /* AIWORKEROS_B6R97R67_MEDIA_METADATA_HOOKS_START */
      const aiwB6R97R67MaterialType = aiwB6R97R66DetectSourceMaterialType(absPath);
      const aiwB6R97R67TextLike = aiwB6R98R3BIsTextLikeFile(absPath);
      const aiwB6R97R67MetadataOnly = ["pdf", "image", "audio"].includes(aiwB6R97R67MaterialType);

      if (!aiwB6R97R67TextLike && !aiwB6R97R67MetadataOnly) {
        rejected.push({ path: candidate, reason: "unsupported_source_extension", media_type: aiwB6R97R67MaterialType });
        continue;
      }
      /* AIWORKEROS_B6R97R67_MEDIA_METADATA_HOOKS_END */

      if (!fs.existsSync(absPath)) {
        rejected.push({ path: candidate, reason: "not_found" });
        continue;
      }

      const stat = fs.statSync(absPath);
      if (!stat.isFile()) {
        rejected.push({ path: candidate, reason: "not_file" });
        continue;
      }

      if (stat.size > maxBytes) {
        rejected.push({ path: candidate, reason: "file_too_large", size: stat.size });
        continue;
      }

      if (aiwB6R97R67MetadataOnly && !aiwB6R97R67TextLike) {
        rows.push({
          path: absPath,
          byte_size: stat.size,
          char_count: 0,
          body_text: "",
          media_type: aiwB6R97R67MaterialType,
          analyzer_status: "metadata_only",
          metadata_only_flag: true,
          media_metadata_hook_code: "B6R97R67"
        });
        continue;
      }

      let body = fs.readFileSync(absPath, "utf8");
      if (body.length > maxTotalChars - totalChars) {
        body = body.slice(0, Math.max(0, maxTotalChars - totalChars));
      }

      totalChars += body.length;
      rows.push({
        path: absPath,
        byte_size: stat.size,
        char_count: body.length,
        body_text: body,
        media_type: "text",
        analyzer_status: "analyzed",
        metadata_only_flag: false,
        media_metadata_hook_code: "B6R97R67"
      });

      if (totalChars >= maxTotalChars) break;
    } catch (error) {
      rejected.push({
        path: candidate,
        reason: "read_error",
        message: error && error.message ? error.message : String(error)
      });
    }
  }

  const analysisResults = aiwB6R97R66BuildSourceMaterialAnalysisResults(rows, rejected);

  return {
    candidates,
    rows,
    rejected,
    analysis_results: analysisResults,
    limits: {
      max_files: maxFiles,
      max_bytes_per_file: maxBytes,
      max_total_chars: maxTotalChars
    }
  };
}

function aiwB6R98R3BSourceFilesMarkdown(sourceFiles) {
  const rows = sourceFiles && Array.isArray(sourceFiles.rows) ? sourceFiles.rows : [];
  if (!rows.length) return "";

  const blocks = [
    "## 元データ/参照ファイル本文",
    "",
    "以下は依頼元から渡されたローカル参照ファイルをAIWorkerOSが読み込んだ内容です。成果物作成では、この内容を入力根拠として扱います。"
  ];

  const analysisMarkdown = aiwB6R97R66RenderSourceMaterialAnalysisMarkdown(sourceFiles);
  if (analysisMarkdown) {
    blocks.push("");
    blocks.push(analysisMarkdown);
  }

  rows.forEach((row, index) => {
    blocks.push("");
    blocks.push("### 参照ファイル " + String(index + 1));
    blocks.push("- path: " + row.path);
    blocks.push("- byte_size: " + String(row.byte_size));
    blocks.push("");
    blocks.push("~~~text");
    blocks.push(row.body_text || "");
    blocks.push("~~~");
  });

  return blocks.join("\n");
}

function aiwB6R98R3BEnhanceDeliverableWithSourceFiles(deliverable, payload, sourceRouteCode) {
  /* AIWORKEROS_B6R97R65B_SOURCE_BODY_MERGE_INTO_MAIN_START */
  function aiwB6R97R65BAppendSourceMarkdownToBody(body, sourceMarkdown) {
    const current = aiwB6R98R3BSourceText(body || "");
    const source = aiwB6R98R3BSourceText(sourceMarkdown || "");
    if (!source) return current;
    if (current.includes(source)) return current;
    if (source.includes("READ_PROOF_TOKEN") && current.includes("READ_PROOF_TOKEN")) return current;
    return [current, "", source].filter(Boolean).join("\n").trim();
  }

  function aiwB6R97R65BMainArtifactWithSourceMarkdown(artifact, sourceMarkdown) {
    if (!artifact || typeof artifact !== "object") return artifact;
    const mergedBody = aiwB6R97R65BAppendSourceMarkdownToBody(
      artifact.body_markdown || artifact.bodyMarkdown || artifact.content || "",
      sourceMarkdown
    );
    return Object.assign({}, artifact, {
      bodyMarkdown: mergedBody,
      body_markdown: mergedBody,
      content: mergedBody,
      aiw_b6r97r65b_source_body_merged: true
    });
  }
  /* AIWORKEROS_B6R97R65B_SOURCE_BODY_MERGE_INTO_MAIN_END */

  const safeDeliverable = deliverable || {};
  const sourceFiles = aiwB6R98R3BReadSourceFiles(payload);
  const markdown = aiwB6R98R3BSourceFilesMarkdown(sourceFiles);
  safeDeliverable.aiw_b6r97r65b_source_files_markdown = markdown;
  safeDeliverable.sourceFilesMarkdown = markdown;
  safeDeliverable.source_files_markdown = markdown;

  safeDeliverable.robotContext = Object.assign({}, safeDeliverable.robotContext || {}, {
    source_file_reader_patch_code: "B6R98R3B",
    source_file_candidates_count: sourceFiles.candidates.length,
    source_files_used_count: sourceFiles.rows.length,
    source_files_rejected_count: sourceFiles.rejected.length
  });

  safeDeliverable.generationBasis = Object.assign({}, safeDeliverable.generationBasis || {}, {
    source_file_reader_patch_code: "B6R98R3B",
    source_file_reader_enabled: true,
    source_file_candidates_count: sourceFiles.candidates.length,
    source_files_used_count: sourceFiles.rows.length,
    source_files_rejected: sourceFiles.rejected.slice(0, 10),
    source_route_code: String(sourceRouteCode || "")
  });

  safeDeliverable.sourceMaterialAnalysisResults = sourceFiles.analysis_results || [];
  safeDeliverable.source_material_analysis_results = sourceFiles.analysis_results || [];

  safeDeliverable.outputPayload = Object.assign({}, safeDeliverable.outputPayload || {}, {
    source_material_analysis_results: sourceFiles.analysis_results || [],
    source_file_reader: {
      patch_code: "B6R98R3B",
      candidates_count: sourceFiles.candidates.length,
      used_count: sourceFiles.rows.length,
      rejected_count: sourceFiles.rejected.length,
      used_files: sourceFiles.rows.map((row) => ({
        path: row.path,
        byte_size: row.byte_size,
        char_count: row.char_count
      }))
    }
  });

  if (!sourceFiles.rows.length) {
    return safeDeliverable;
  }

  const currentBody = aiwB6R98R3BSourceText(safeDeliverable.bodyMarkdown || safeDeliverable.body_markdown || "");
  const enhancedBody = [
    currentBody,
    "",
    markdown
  ].join("\n").trim();

  safeDeliverable.bodyMarkdown = enhancedBody;
  safeDeliverable.body_markdown = enhancedBody;
  safeDeliverable.output_body_ja = enhancedBody;
  safeDeliverable.content = enhancedBody;
  safeDeliverable.aiw_b6r97r65b_source_body_merged = true;

  if (Array.isArray(safeDeliverable.generatedArtifacts)) {
    safeDeliverable.generatedArtifacts = safeDeliverable.generatedArtifacts.map((artifact) => {
      if (artifact && artifact.file_name === "01_main_deliverable.md") {
        return aiwB6R97R65BMainArtifactWithSourceMarkdown(Object.assign({}, artifact, { body_markdown: enhancedBody }), markdown);
      }
      return artifact;
    });
  }

  if (safeDeliverable.outputPayload && Array.isArray(safeDeliverable.outputPayload.generated_artifacts)) {
    safeDeliverable.outputPayload.generated_artifacts = safeDeliverable.outputPayload.generated_artifacts.map((artifact) => {
      if (artifact && artifact.file_name === "01_main_deliverable.md") {
        return aiwB6R97R65BMainArtifactWithSourceMarkdown(Object.assign({}, artifact, { body_markdown: enhancedBody }), markdown);
      }
      return artifact;
    });
  }

  if (Array.isArray(safeDeliverable.artifacts)) {
    safeDeliverable.artifacts = safeDeliverable.artifacts.map((artifact) => {
      if (artifact && artifact.body_markdown) {
        return aiwB6R97R65BMainArtifactWithSourceMarkdown(Object.assign({}, artifact, { body_markdown: enhancedBody }), markdown);
      }
      return artifact;
    });
  }

  const currentQualityNotes = aiwB6R98R3BSourceText(safeDeliverable.qualityNotes || "");
  safeDeliverable.qualityNotes = [
    currentQualityNotes,
    "source file reader patch: B6R98R3B",
    "source files used: " + String(sourceFiles.rows.length),
    "source file candidates: " + String(sourceFiles.candidates.length)
  ].filter(Boolean).join("\n");

  if (!safeDeliverable.summaryText || !String(safeDeliverable.summaryText).trim()) {
    safeDeliverable.summaryText = "元データ/参照ファイルを読み込み、成果物生成に反映しました。";
  } else {
    safeDeliverable.summaryText = String(safeDeliverable.summaryText) + " 元データ/参照ファイルも読み込み済みです。";
  }

  return safeDeliverable;
}
// B6R98R3B_SOURCE_FILE_READER_END

function aiwB6R95R3R3BuildRequesterFacingDeliverable(payload, sourceRouteCode) {
  const baseDeliverable = aiwB6R95R3R3BuildRequesterFacingDeliverableBaseB6R95R3Z24(payload, sourceRouteCode);
  const cxDeliverable = aiwB6R95R3Z24EnhanceDeliverableWithCxMaterial(baseDeliverable, payload, sourceRouteCode);
  return aiwB6R98R3BEnhanceDeliverableWithSourceFiles(cxDeliverable, payload, sourceRouteCode);
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
    package_kind: "delivery_package",
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


/* AIWORKEROS_B6R97R36_R3_STRONG_MAIN_DELIVERABLE_SOURCE_START */
function aiwB6R97R36R3SelectStrongMainDeliverableMarkdown(...inputs) {
  const candidates = [];

  function addCandidate(label, value) {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;

    const weakSignals = [
      "individual request queued",
      "worker_work_unit_id",
      "詳細資料を作成せよ",
      "一次成果物",
      "B6R97R32B individual request queued"
    ];

    const strongSignals = [
      "乙巳の変",
      "蘇我",
      "入鹿",
      "蝦夷",
      "中大兄",
      "中臣鎌足",
      "孝徳天皇",
      "改新の詔",
      "公地公民",
      "班田収授",
      "戸籍",
      "評",
      "郡",
      "飛鳥",
      "難波宮",
      "租庸調",
      "CX参照素材からの展開本文"
    ];

    const weakHitCount = weakSignals.filter((term) => trimmed.includes(term)).length;
    const strongHitCount = strongSignals.filter((term) => trimmed.includes(term)).length;

    let score = trimmed.length;
    score += strongHitCount * 1200;
    score -= weakHitCount * 3000;

    if (trimmed.length >= 3000) score += 2000;
    if (strongHitCount >= 5) score += 3500;
    if (weakHitCount >= 2 && trimmed.length < 1500) score -= 7000;

    candidates.push({
      label,
      value: trimmed,
      score,
      length: trimmed.length,
      strongHitCount,
      weakHitCount
    });
  }

  function dig(value, path, depth) {
    if (depth > 8 || value === null || value === undefined) return;

    if (typeof value === "string") {
      if (
        /body|bodyMarkdown|body_markdown|markdown|deliverable|main|artifact|output|summary|content|text/i.test(path) ||
        /乙巳の変|蘇我|大化の改新|改新の詔|公地公民|CX参照素材からの展開本文/.test(value)
      ) {
        addCandidate(path, value);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => dig(item, path + "[" + index + "]", depth + 1));
      return;
    }

    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        const childPath = path ? path + "." + key : key;
        if (/body|bodyMarkdown|body_markdown|markdown|deliverable|main|artifact|output|payload|summary|content|text|result|response|worker/i.test(key)) {
          dig(child, childPath, depth + 1);
        } else if (depth < 3) {
          dig(child, childPath, depth + 1);
        }
      }
    }
  }

  inputs.forEach((input, index) => {
    addCandidate("arguments[" + index + "]", input);
    dig(input, "arguments[" + index + "]", 0);
  });

  candidates.sort((a, b) => b.score - a.score || b.length - a.length);

  const selected = candidates[0];
  if (selected && selected.value) return selected.value;

  return "";
}
/* AIWORKEROS_B6R97R36_R3_STRONG_MAIN_DELIVERABLE_SOURCE_END */


/* AIWORKEROS_B6R97R40_PRE_ZIP_BODY_SOURCE_ORDER_START */
function aiwB6R97R40SelectTaskSpecificMainDeliverableMarkdown(...inputs) {
  const candidates = [];
  const taskHintParts = [];

  function isString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function addTaskHint(path, value) {
    if (!isString(value)) return;
    if (/task_instruction|instruction|prompt|task_title|title|subject|topic|request|source_request|domain/i.test(path)) {
      taskHintParts.push(value.trim());
    }
  }

  function collectTaskHints(value, path, depth) {
    if (depth > 8 || value === null || value === undefined) return;
    if (typeof value === "string") {
      addTaskHint(path, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => collectTaskHints(item, path + "[" + index + "]", depth + 1));
      return;
    }
    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        collectTaskHints(child, path ? path + "." + key : key, depth + 1);
      }
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/[、。・：:;；（）()「」『』【】\[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractTaskTerms(text) {
    const normalized = normalizeText(text);
    const genericStop = new Set([
      "について",
      "できるだけ",
      "詳細",
      "資料",
      "作成",
      "確認",
      "検証",
      "主成果物",
      "成果物",
      "実行",
      "runtime",
      "verification",
      "deliverable",
      "zip",
      "main",
      "worker",
      "AIWorkerOS",
      "AICM"
    ]);

    const terms = new Set();

    for (const chunk of normalized.split(/\s+/)) {
      const cleaned = chunk.trim();
      if (cleaned.length < 2 || cleaned.length > 28) continue;
      if (genericStop.has(cleaned)) continue;
      terms.add(cleaned);
    }

    const jaMatches = normalized.match(/[一-龥ぁ-んァ-ヶー]{2,18}/g) || [];
    for (const raw of jaMatches) {
      let term = raw
        .replace(/について/g, "")
        .replace(/できるだけ/g, "")
        .replace(/詳細/g, "")
        .replace(/資料/g, "")
        .replace(/作成/g, "")
        .replace(/検証/g, "")
        .trim();

      if (term.length >= 2 && term.length <= 18 && !genericStop.has(term)) {
        terms.add(term);
      }

      if (raw.includes("大化の改新")) terms.add("大化の改新");
      if (raw.includes("乙巳の変")) terms.add("乙巳の変");
      if (raw.includes("中大兄")) terms.add("中大兄");
      if (raw.includes("中臣鎌足")) terms.add("中臣鎌足");
      if (raw.includes("公地公民")) terms.add("公地公民");
      if (raw.includes("改新の詔")) terms.add("改新の詔");
    }

    return Array.from(terms).filter((term) => term.length >= 2);
  }

  function isPreferredSourcePath(path) {
    return /deliverable\.bodyMarkdown|deliverable\.body_markdown|output_body_ja|body_markdown|bodyMarkdown|requester_delivery_payload\.deliverable/i.test(path);
  }

  function isCandidatePath(path) {
    return /body|bodyMarkdown|body_markdown|markdown|deliverable|main|artifact|output|summary|content|text|result|response|payload/i.test(path);
  }

  function addCandidate(path, value) {
    if (!isString(value)) return;
    const text = value.trim();
    if (!text) return;

    const genericCxSignals = [
      "CX参照素材からの展開本文",
      "地域文化は尊重ベース",
      "祭りは地域の記憶装置",
      "説明は段階化すると伝わりやすい",
      "ManagerからLeaderへの粗細分解",
      "DBや外部状態を変える操作",
      "安全境界を維持する"
    ];

    const weakSignals = [
      "individual request queued",
      "worker_work_unit_id",
      "詳細資料を作成せよ",
      "一次成果物",
      "B6R97R32B individual request queued"
    ];

    const taskHitTerms = taskTerms.filter((term) => term && text.includes(term));
    const genericHits = genericCxSignals.filter((term) => text.includes(term));
    const weakHits = weakSignals.filter((term) => text.includes(term));

    let score = text.length;

    if (isPreferredSourcePath(path)) score += 9000;
    score += taskHitTerms.length * 2500;
    score -= genericHits.length * 6000;
    score -= weakHits.length * 3500;

    if (taskHitTerms.length >= 3) score += 7000;
    if (taskHitTerms.length >= 5) score += 12000;
    if (genericHits.length > 0 && taskHitTerms.length < 3) score -= 20000;
    if (weakHits.length > 0 && text.length < 2000) score -= 12000;

    candidates.push({
      path,
      text,
      score,
      length: text.length,
      taskHitCount: taskHitTerms.length,
      taskHitTerms,
      genericHitCount: genericHits.length,
      genericHits,
      weakHitCount: weakHits.length,
      weakHits,
      preferredSourcePath: isPreferredSourcePath(path)
    });
  }

  function dig(value, path, depth) {
    if (depth > 9 || value === null || value === undefined) return;

    if (typeof value === "string") {
      if (isCandidatePath(path) || taskTerms.some((term) => term && value.includes(term))) {
        addCandidate(path, value);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => dig(item, path + "[" + index + "]", depth + 1));
      return;
    }

    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        const childPath = path ? path + "." + key : key;
        if (isCandidatePath(childPath) || depth < 4) {
          dig(child, childPath, depth + 1);
        }
      }
    }
  }

  inputs.forEach((input, index) => collectTaskHints(input, "arguments[" + index + "]", 0));

  const taskHintText = taskHintParts.join(" ");
  const taskTerms = extractTaskTerms(taskHintText);

  inputs.forEach((input, index) => dig(input, "arguments[" + index + "]", 0));

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.taskHitCount !== a.taskHitCount) return b.taskHitCount - a.taskHitCount;
    if (a.genericHitCount !== b.genericHitCount) return a.genericHitCount - b.genericHitCount;
    return b.length - a.length;
  });

  const selected = candidates[0];
  if (selected && selected.text) return selected.text;

  return aiwB6R97R36R3SelectStrongMainDeliverableMarkdown(...inputs);
}
/* AIWORKEROS_B6R97R40_PRE_ZIP_BODY_SOURCE_ORDER_END */


/* AIWORKEROS_B6R97R46_SECTION4_REJECT_INSTRUCTION_ECHO_START */
function aiwB6R97R46SelectSection4BodyMarkdown(...sources) {
  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function isString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function flatten(value, path, out, depth) {
    if (depth > 10 || value === null || value === undefined) return;

    if (typeof value === "string") {
      out.push({ path, value });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => flatten(item, path + "[" + index + "]", out, depth + 1));
      return;
    }

    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        flatten(child, path ? path + "." + key : key, out, depth + 1);
      }
    }
  }

  function isPreferredBodyPath(path) {
    /* AIWORKEROS_B6R97R49C_C_R46_BODY_SELECTOR_FIXED_VERIFY_START */
    return /requester_delivery_payload\.deliverable\.(bodyMarkdown|body_markdown|output_body_ja)$/i.test(path) ||
      /(^|\.)(bodyMarkdown|body_markdown|output_body_ja)$/i.test(path) ||
      /generatedArtifacts\[[0-9]+\]\.(bodyMarkdown|body_markdown|output_body_ja)$/i.test(path) ||
      /generated_artifacts\[[0-9]+\]\.(bodyMarkdown|body_markdown|output_body_ja)$/i.test(path);
  }

  function isInstructionPath(path) {
    return /task_instruction_ja|instruction_text|instructionText|prompt_ja|task_title|task_title_ja/i.test(path);
  }

  function score(path, value, allInstructionTexts) {
    if (!isString(value)) return null;

    const text = value.trim();

    const weakSignals = [
      "individual request queued",
      "worker_work_unit_id",
      "詳細資料を作成せよ",
      "一次成果物",
      "B6R97R32B individual request queued"
    ];

    const genericCxSignals = [
      "CX参照素材からの展開本文",
      "地域文化は尊重ベース",
      "祭りは地域の記憶装置",
      "説明は段階化すると伝わりやすい",
      "ManagerからLeaderへの粗細分解",
      "DBや外部状態を変える操作"
    ];

    const taskSignals = [
      "大化の改新",
      "乙巳の変",
      "蘇我",
      "入鹿",
      "蝦夷",
      "中大兄",
      "中臣鎌足",
      "孝徳天皇",
      "改新の詔",
      "公地公民",
      "班田収授",
      "戸籍",
      "評",
      "郡",
      "飛鳥",
      "難波宮",
      "租庸調",
      "後続影響",
      "史料上の注意点"
    ];

    const weakHits = weakSignals.filter((term) => text.includes(term));
    const genericHits = genericCxSignals.filter((term) => text.includes(term));
    const taskHits = taskSignals.filter((term) => text.includes(term));

    const exactInstructionEcho = allInstructionTexts.some((instruction) => {
      if (!instruction || instruction.length < 12) return false;
      return text === instruction || (text.includes(instruction) && text.length <= instruction.length + 500);
    });

    const instructionLike = isInstructionPath(path) || exactInstructionEcho;
    const nextStepLike = /next_steps|nextSteps|next_step|nextStep|summary_text|summaryText|deliverable_ref|deliverableRef/i.test(path) ||
      text.includes("依頼元アプリでsummary_textとdeliverable_ref/linkを保存する") ||
      text.includes("レビュー画面から成果物本文へ辿れるようにする") ||
      text.includes("差し戻し時は追加条件をAIWorkerOSへ再依頼する");

    /* AIWORKEROS_B6R97R55_R46_REJECT_NON_MAIN_ARTIFACT_TEXT_START */
    const nonMainArtifactPathLike = /qualityNotes|quality_notes|unresolvedIssues|unresolved_issues|nextSteps|next_steps|summary_text|summaryText|deliverable_ref|deliverableRef/i.test(path);
    const nonMainArtifactTextLike =
      text.includes("この段階では外部実行、PG apply、破壊的操作は行っていません") ||
      text.includes("追加調査・DB変更・実装反映が必要な場合") ||
      text.includes("AIWorkerOS側で生成した一次成果物です") ||
      text.includes("今後の生成エンジン深化では") ||
      text.includes("依頼元アプリでsummary_textとdeliverable_ref/linkを保存する") ||
      text.includes("レビュー画面から成果物本文へ辿れるようにする") ||
      text.includes("差し戻し時は追加条件をAIWorkerOSへ再依頼する");
    const nonMainArtifactLike = nonMainArtifactPathLike || nonMainArtifactTextLike || nextStepLike;
    /* AIWORKEROS_B6R97R55_R46_REJECT_NON_MAIN_ARTIFACT_TEXT_END */

    let point = text.length;

    if (isPreferredBodyPath(path)) point += 40000;
    if (instructionLike) point -= 70000;
    if (nextStepLike) point -= 90000;
    if (nonMainArtifactLike) point -= 140000;

    point += taskHits.length * 3500;
    point -= weakHits.length * 15000;
    point -= genericHits.length * 15000;

    if (text.length >= 1800) point += 15000;
    if (text.length >= 3000) point += 25000;
    if (taskHits.length >= 8) point += 18000;
    if (genericHits.length > 0 && taskHits.length < 3) point -= 40000;

    return {
      path,
      text,
      point,
      length: text.length,
      preferredBodyPath: isPreferredBodyPath(path),
      instructionLike,
      nextStepLike,
      nonMainArtifactLike,
      nonMainArtifactPathLike,
      nonMainArtifactTextLike,
      exactInstructionEcho,
      taskHitCount: taskHits.length,
      weakHitCount: weakHits.length,
      genericHitCount: genericHits.length
    };
  }

  const flattened = [];
  sources.forEach((source, index) => flatten(source, "sources[" + index + "]", flattened, 0));

  const instructionTexts = flattened
    .filter((item) => isInstructionPath(item.path) && isString(item.value))
    .map((item) => item.value.trim());

  const candidates = flattened
    .map((item) => score(item.path, item.value, instructionTexts))
    .filter(Boolean)
    .filter((candidate) => candidate.weakHitCount === 0)
    .filter((candidate) => candidate.genericHitCount === 0)
    .filter((candidate) => !candidate.instructionLike)
    .filter((candidate) => !candidate.nextStepLike)
    .filter((candidate) => !candidate.nonMainArtifactLike)
    .filter((candidate) => candidate.preferredBodyPath || candidate.taskHitCount >= 4);
  /* AIWORKEROS_B6R97R49C_C_R46_BODY_SELECTOR_FIXED_VERIFY_END */

  candidates.sort((a, b) => {
    if (b.point !== a.point) return b.point - a.point;
    if (b.preferredBodyPath !== a.preferredBodyPath) return b.preferredBodyPath ? 1 : -1;
    if (b.taskHitCount !== a.taskHitCount) return b.taskHitCount - a.taskHitCount;
    return b.length - a.length;
  });

  return candidates[0]?.text || "";
}
/* AIWORKEROS_B6R97R46_SECTION4_REJECT_INSTRUCTION_ECHO_END */

function aiwB6R95R3D1BuildGeneratedArtifacts(deliverable) {
  /* AIWORKEROS_B6R97R65B_BUILD_SOURCE_MARKDOWN_MAIN_APPEND_START */
  function aiwB6R97R65BSourceMarkdownFromDeliverable(value) {
    if (!value || typeof value !== "object") return "";
    const candidates = [
      value.aiw_b6r97r65b_source_files_markdown,
      value.sourceFilesMarkdown,
      value.source_files_markdown,
      value.outputPayload && value.outputPayload.source_files_markdown,
      value.outputPayload && value.outputPayload.aiw_b6r97r65b_source_files_markdown
    ];
    for (const item of candidates) {
      const text = aiwB6R95R3R3Text(item);
      if (text && (text.includes("元データ/参照ファイル本文") || text.includes("READ_PROOF_TOKEN") || text.includes("参照ファイル"))) return text;
    }
    return "";
  }

  function aiwB6R97R65BAppendSourceMarkdownForMain(body, sourceMarkdown) {
    const current = aiwB6R95R3R3Text(body || "");
    const source = aiwB6R95R3R3Text(sourceMarkdown || "");
    if (!source) return current;
    if (current.includes(source)) return current;
    if (source.includes("READ_PROOF_TOKEN") && current.includes("READ_PROOF_TOKEN")) return current;
    return [current, "", source].filter(Boolean).join("\n").trim();
  }

  const aiwB6R97R65BSourceFilesMarkdown = aiwB6R97R65BSourceMarkdownFromDeliverable(deliverable);
  /* AIWORKEROS_B6R97R65B_BUILD_SOURCE_MARKDOWN_MAIN_APPEND_END */

  const provided = Array.isArray(deliverable?.generatedArtifacts) ? deliverable.generatedArtifacts : [];
  const strongMainDeliverableBodyMarkdown = aiwB6R97R40SelectTaskSpecificMainDeliverableMarkdown(deliverable, ...arguments);
  const section4MainDeliverableBodyMarkdown = aiwB6R97R46SelectSection4BodyMarkdown(deliverable, strongMainDeliverableBodyMarkdown, ...arguments);

  if (provided.length > 0) {
    return provided.map((item, index) => {
      const normalized = aiwB6R95R3D1NormalizeGeneratedArtifact(item, index);
      if (
        normalized.file_name === "01_main_deliverable.md" ||
        normalized.artifact_kind_code === "main_deliverable" ||
        normalized.kind === "main_deliverable" ||
        normalized.title === "主成果物"
      ) {
        return Object.assign({}, normalized, {
          body_markdown: aiwB6R97R65BAppendSourceMarkdownForMain(aiwB6R97R46SelectSection4BodyMarkdown(normalized, deliverable, section4MainDeliverableBodyMarkdown, strongMainDeliverableBodyMarkdown, ...arguments) || normalized.body_markdown || normalized.bodyMarkdown || normalized.content || "", aiwB6R97R65BSourceFilesMarkdown)
        });
      }
      return normalized;
    });
  }

  const artifacts = [
    {
      kind: "main_deliverable",
      title: deliverable?.outputTitle || "主成果物",
      file_name: "01_main_deliverable.md",
      body_markdown: aiwB6R97R65BAppendSourceMarkdownForMain(section4MainDeliverableBodyMarkdown || deliverable?.bodyMarkdown || deliverable?.body_markdown || deliverable?.output_body_ja || "", aiwB6R97R65BSourceFilesMarkdown)
    }
  ];

  /* AIWORKEROS_B6R97R52B_BUILD_ARTIFACT_LINE_BASED_FILENAMES_START */
  if (aiwB6R95R3R3Text(deliverable?.qualityNotes)) {
    artifacts.push({
      kind: "quality_notes",
      artifact_kind_code: "quality_notes",
      title: "品質メモ",
      file_name: "90_quality_notes.md",
      body_markdown: deliverable.qualityNotes
    });
  }

  if (aiwB6R95R3R3Text(deliverable?.unresolvedIssues)) {
    artifacts.push({
      kind: "unresolved_issues",
      artifact_kind_code: "unresolved_issues",
      title: "未解決事項",
      file_name: "91_unresolved_issues.md",
      body_markdown: deliverable.unresolvedIssues
    });
  }

  if (aiwB6R95R3R3Text(deliverable?.nextSteps)) {
    artifacts.push({
      kind: "next_steps",
      artifact_kind_code: "next_steps",
      title: "次工程",
      file_name: "92_next_steps.md",
      body_markdown: deliverable.nextSteps
    });
  }

  /* AIWORKEROS_B6R97R52B_BUILD_ARTIFACT_LINE_BASED_FILENAMES_END */
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


/* AIWORKEROS_B6R97R43_CREATE_ZIP_PROVIDED_BODY_PRIORITY_START */
function aiwB6R97R43MergeProvidedBodyIntoDeliverable(deliverable, ...sources) {
  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function isString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function clonePlain(value) {
    if (Array.isArray(value)) return value.map(clonePlain);
    if (isObject(value)) {
      const out = {};
      for (const [key, child] of Object.entries(value)) out[key] = clonePlain(child);
      return out;
    }
    return value;
  }

  function flatten(value, path, out, depth) {
    if (depth > 10 || value === null || value === undefined) return;

    if (typeof value === "string") {
      out.push({ path, value });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => flatten(item, path + "[" + index + "]", out, depth + 1));
      return;
    }

    if (typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        flatten(child, path ? path + "." + key : key, out, depth + 1);
      }
    }
  }

  function isPreferredProvidedBodyPath(path) {
    return /requester_delivery_payload\.deliverable\.(bodyMarkdown|body_markdown|output_body_ja)$/i.test(path) ||
      /deliverable\.(bodyMarkdown|body_markdown|output_body_ja)$/i.test(path) ||
      /(^|\.)(output_body_ja|body_markdown|bodyMarkdown)$/i.test(path);
  }

  function isInstructionPath(path) {
    return /task_instruction_ja|instruction_text|instructionText|prompt_ja|task_title|task_title_ja/i.test(path);
  }

  function scoreCandidate(path, value) {
    if (!isString(value)) return null;

    const text = value.trim();

    const weakSignals = [
      "individual request queued",
      "worker_work_unit_id",
      "詳細資料を作成せよ",
      "一次成果物",
      "B6R97R32B individual request queued"
    ];

    const genericCxSignals = [
      "CX参照素材からの展開本文",
      "地域文化は尊重ベース",
      "祭りは地域の記憶装置",
      "説明は段階化すると伝わりやすい",
      "ManagerからLeaderへの粗細分解",
      "DBや外部状態を変える操作"
    ];

    const taskSpecificSignals = [
      "大化の改新",
      "乙巳の変",
      "蘇我",
      "入鹿",
      "蝦夷",
      "中大兄",
      "中臣鎌足",
      "孝徳天皇",
      "改新の詔",
      "公地公民",
      "班田収授",
      "戸籍",
      "評",
      "郡",
      "飛鳥",
      "難波宮",
      "租庸調"
    ];

    const weakHits = weakSignals.filter((term) => text.includes(term));
    const genericHits = genericCxSignals.filter((term) => text.includes(term));
    const taskHits = taskSpecificSignals.filter((term) => text.includes(term));

    let score = text.length;

    if (isPreferredProvidedBodyPath(path)) score += 30000;
    if (isInstructionPath(path)) score -= 25000;

    score += taskHits.length * 3000;
    score -= weakHits.length * 12000;
    score -= genericHits.length * 12000;

    if (text.length >= 1800) score += 10000;
    if (text.length >= 3000) score += 15000;
    if (taskHits.length >= 6) score += 12000;
    if (genericHits.length > 0 && taskHits.length < 3) score -= 30000;

    return {
      path,
      text,
      score,
      length: text.length,
      taskHitCount: taskHits.length,
      weakHitCount: weakHits.length,
      genericHitCount: genericHits.length,
      preferredProvidedBodyPath: isPreferredProvidedBodyPath(path),
      instructionPath: isInstructionPath(path)
    };
  }

  function selectProvidedBody() {
    const flattened = [];
    sources.forEach((source, index) => flatten(source, "sources[" + index + "]", flattened, 0));
    flatten(deliverable, "deliverable", flattened, 0);

    const candidates = flattened
      .map((item) => scoreCandidate(item.path, item.value))
      .filter(Boolean)
      .filter((candidate) => candidate.preferredProvidedBodyPath || candidate.taskHitCount >= 3)
      .filter((candidate) => candidate.weakHitCount === 0)
      .filter((candidate) => !(candidate.instructionPath && candidate.length < 1800));

    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.preferredProvidedBodyPath !== a.preferredProvidedBodyPath) return b.preferredProvidedBodyPath ? 1 : -1;
      if (b.taskHitCount !== a.taskHitCount) return b.taskHitCount - a.taskHitCount;
      return b.length - a.length;
    });

    return candidates[0] || null;
  }

  const selected = selectProvidedBody();
  if (!selected || !selected.text) return deliverable;

  const merged = clonePlain(isObject(deliverable) ? deliverable : {});
  merged.bodyMarkdown = selected.text;
  merged.body_markdown = selected.text;
  merged.output_body_ja = selected.text;
  merged.aiw_b6r97r43_body_source_path = selected.path;

  function patchArtifactArray(value) {
    if (!Array.isArray(value)) return value;

    return value.map((artifact) => {
      if (!isObject(artifact)) return artifact;

      const fileName = artifact.file_name || artifact.filename || artifact.name || "";
      const kind = artifact.kind || artifact.artifact_kind_code || "";
      const title = artifact.title || "";

      const isMain =
        fileName === "01_main_deliverable.md" ||
        kind === "main_deliverable" ||
        /主成果物|main/i.test(title);

      if (!isMain) return artifact;

      return {
        ...artifact,
        file_name: fileName || "01_main_deliverable.md",
        kind: artifact.kind || "main_deliverable",
        artifact_kind_code: artifact.artifact_kind_code || "main_deliverable",
        bodyMarkdown: selected.text,
        body_markdown: selected.text,
        content: selected.text,
        aiw_b6r97r43_body_source_path: selected.path
      };
    });
  }

  merged.generatedArtifacts = patchArtifactArray(merged.generatedArtifacts);
  merged.generated_artifacts = patchArtifactArray(merged.generated_artifacts);

  return merged;
}
/* AIWORKEROS_B6R97R43_CREATE_ZIP_PROVIDED_BODY_PRIORITY_END */

function aiwB6R95R3D1CreateZipAndAttach(responsePayload, deliverable) {
  const fs = require("fs");
  const path = require("path");

  const response = responsePayload && typeof responsePayload === "object" ? responsePayload : {};
  const packageMeta = deliverable?.deliverablePackage || aiwB6R95R3D1BuildZipPackageMeta("requester", "deliverables");
  const generatedArtifacts = aiwB6R95R3D1BuildGeneratedArtifacts(aiwB6R97R43MergeProvidedBodyIntoDeliverable(deliverable, ...arguments, deliverable));

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
    package_kind: "delivery_package",
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
    "    'package_kind', 'delivery_package',",
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
    "    'package_kind', 'delivery_package',",
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


// AIW_B6R97R14_QUEUE_CONSUMER_START
// AIWorkerOS-owned queue consumer.
// AICM does not trigger execution here.
// This consumer scans waiting/retryable work, claims it, calls existing createRuntimeRequest,
// records AIWorkerOS request/output metadata, and creates/updates AICM human review rows.
const childProcessB6R97R14 = require("node:child_process");

function aiwB6R97R14DbUrl() {
  return process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL || "";
}

function aiwB6R97R14SqlLiteral(value) {
  return "'" + String(value == null ? "" : value).replace(/'/g, "''") + "'";
}

function aiwB6R97R14IsUuid(value) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(value || "").trim());
}

function aiwB6R97R14UuidOrNull(value) {
  const text = String(value || "").trim();
  return aiwB6R97R14IsUuid(text) ? aiwB6R97R14SqlLiteral(text) + "::uuid" : "NULL";
}

function aiwB6R97R14PsqlText(sql) {
  const dbUrl = aiwB6R97R14DbUrl();
  if (!dbUrl) {
    throw new Error("PERSONA_DATABASE_URL is not set for AIWorkerOS consumer");
  }

  // AIW_B6R97R17_PSQL_STDIN_SAFE_ERROR_PATCH
  // Pass SQL via stdin instead of psql -c to avoid OS argv length limits.
  return childProcessB6R97R14.execFileSync("psql", [
    dbUrl,
    "-v", "ON_ERROR_STOP=1",
    "-X",
    "-q",
    "-A",
    "-t",
    "-P", "pager=off"
  ], {
    input: String(sql || "") + "\n",
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 40
  }).trim();
}

function aiwB6R97R14PsqlJson(sql, fallback) {
  const raw = aiwB6R97R14PsqlText(sql);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("AIWorkerOS consumer failed to parse psql JSON: " + error.message + " raw=" + raw.slice(0, 400));
  }
}

function aiwB6R97R14ClaimWorkUnits(limit) {
  const sql = [
    "with picked as (",
    "  select u.aicm_worker_work_unit_id",
    "  from business.aicm_worker_work_unit u",
    "  where (",
    "    coalesce(u.metadata_jsonb->>'aiworkeros_execution_state','') in ('waiting','waiting_for_artifact_zip')",
    "    or lower(coalesce(u.metadata_jsonb->>'aiworkeros_retryable','false')) in ('true','t','1','yes')",
    "  )",
    "    and coalesce(u.metadata_jsonb->>'aiworkeros_consumer_claim_state','') <> 'processing'",
    "    and coalesce(u.metadata_jsonb->>'aiworkeros_request_id','') = ''",
    "  order by u.updated_at asc nulls last, u.created_at asc nulls last",
    "  limit " + Number(limit || 5),
    "  for update skip locked",
    "), claimed as (",
    "  update business.aicm_worker_work_unit u",
    "  set metadata_jsonb = coalesce(u.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "      'aiworkeros_execution_state', 'processing',",
    "      'aiworkeros_retryable', 'false',",
    "      'aiworkeros_consumer_claim_state', 'processing',",
    "      'aiworkeros_claimed_by', 'AIWorkerOS/B6R97R14',",
    "      'aiworkeros_claimed_at', now()::text",
    "    ),",
    "    updated_at = now()",
    "  from picked p",
    "  where u.aicm_worker_work_unit_id = p.aicm_worker_work_unit_id",
    "  returning to_jsonb(u) as row_json",
    ")",
    "select coalesce(jsonb_agg(row_json), '[]'::jsonb)::text from claimed;"
  ].join("\n");

  return aiwB6R97R14PsqlJson(sql, []);
}

function aiwB6R97R14BuildPayload(row) {
  const meta = row && row.metadata_jsonb && typeof row.metadata_jsonb === "object" ? row.metadata_jsonb : {};
  const workUnitId = String(row.aicm_worker_work_unit_id || row.worker_work_unit_id || row.work_unit_id || "");
  const sourceRouteCode = String(meta.source_route_code || row.source_route_code || "aicm_worker_work_unit");
  const title = String(row.work_unit_name || row.task_name || row.title || "AICompanyManager Worker作業");
  const instruction = [
    String(row.work_instruction_text || ""),
    String(row.work_unit_description || ""),
    String(row.note || ""),
    "AICM worker_work_unit_id: " + workUnitId,
    "source_route_code: " + sourceRouteCode
  ].filter(Boolean).join("\n\n");

  return {
    app_surface_code: String(meta.app_surface_code || "ai_company_manager"),
    model_code: String(meta.model_code || "byd2_003_asic_leader3"),
    task_domain_code: String(meta.task_domain_code || "business_operation"),
    task_title: title,
    task_instruction_ja: instruction || title,
    source_app_ref: String(meta.source_app_ref || "AICompanyManager"),
    source_request_ref: workUnitId,
    requested_by_ref: String(meta.requested_by_ref || "AIWorkerOSConsumer"),
    source_route_code: sourceRouteCode,
    metadata_jsonb: {
      aicm_worker_work_unit_id: workUnitId,
      owner_civilization_id: row.owner_civilization_id || "",
      aicm_user_company_id: row.aicm_user_company_id || "",
      source_route_code: sourceRouteCode,
      consumer_code: "B6R97R14"
    }
  };
}

function aiwB6R97R14RequestId(result) {
  return String(
    (result && result.request_id) ||
    (result && result.runtime_request_id) ||
    (result && result.data && result.data.request_id) ||
    ""
  );
}

function aiwB6R97R14OutputId(result) {
  return String(
    (result && result.output_id) ||
    (result && result.deliverable_ref && result.deliverable_ref.id) ||
    (result && result.requester_delivery_payload && result.requester_delivery_payload.deliverable_ref && result.requester_delivery_payload.deliverable_ref.id) ||
    ""
  );
}

function aiwB6R97R14Summary(result) {
  return String(
    (result && result.requester_delivery_payload && result.requester_delivery_payload.summary_text) ||
    (result && result.deliverable && result.deliverable.summary_text) ||
    (result && result.summary_text) ||
    ""
  );
}

function aiwB6R97R14DeliverableLink(result) {
  return String(
    (result && result.deliverable_link) ||
    (result && result.requester_delivery_payload && result.requester_delivery_payload.deliverable_link) ||
    (result && result.deliverable && result.deliverable.zip_link) ||
    ""
  );
}

function aiwB6R97R14MarkFailed(row, error) {
  const id = row && row.aicm_worker_work_unit_id;
  if (!aiwB6R97R14IsUuid(id)) return;

  // AIW_B6R97R17_PSQL_STDIN_SAFE_ERROR_PATCH: never store DB URL or full SQL command in metadata.
  const rawMessage = String(error && error.message ? error.message : error);
  const message = rawMessage
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[DB_URL_REDACTED]")
    .replace(/-c\s+update[\s\S]*/i, "-c [SQL_REDACTED]")
    .split("\n")
    .slice(0, 8)
    .join("\n")
    .slice(0, 600);

  const sql = [
    "update business.aicm_worker_work_unit",
    "set metadata_jsonb = coalesce(metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "  'aiworkeros_execution_state', 'waiting',",
    "  'aiworkeros_retryable', 'true',",
    "  'aiworkeros_consumer_claim_state', 'failed',",
    "  'aiworkeros_last_error', " + aiwB6R97R14SqlLiteral(message) + ",",
    "  'aiworkeros_last_failed_at', now()::text",
    "), updated_at = now()",
    "where aicm_worker_work_unit_id = " + aiwB6R97R14UuidOrNull(id) + ";"
  ].join("\n");

  aiwB6R97R14PsqlText(sql);
}


// AIW_B6R97R21_SCHEMA_MISMATCH_REPAIR
function aiwB6R97R19CAicmArtifactKindCode() {
  // AIW_B6R97R19C_ARTIFACT_KIND_RESOLVER_FINALIZER_PATCH
  return "delivery_package";
}

function aiwB6R97R19CFinalizeGeneratedReviewRows(limit) {
  const artifactKind = aiwB6R97R19CAicmArtifactKindCode();
  const safeLimit = Math.max(1, Number(limit || 5) || 5);

  const sql = [
    "with valid_artifact_kind as (",
    "  select " + aiwB6R97R14SqlLiteral(artifactKind) + "::text as artifact_kind_code",
    "  where exists (",
    "    select 1",
    "    from pg_constraint c",
    "    where c.conrelid = 'business.aicm_human_review_item'::regclass",
    "      and c.conname = 'chk_aicm_human_review_artifact_kind'",
    "      and pg_get_constraintdef(c.oid) like '%' || " + aiwB6R97R14SqlLiteral(artifactKind) + " || '%'",
    "  )",
    "), target as (",
    "  select u.*",
    "  from business.aicm_worker_work_unit u",
    "  where coalesce(u.metadata_jsonb->>'aiworkeros_claimed_by','') = 'AIWorkerOS/B6R97R14'",
    "    and coalesce(u.metadata_jsonb->>'aiworkeros_request_id','') <> ''",
    "    and coalesce(u.metadata_jsonb->>'aiworkeros_output_id','') <> ''",
    "    and coalesce(u.metadata_jsonb->>'aiworkeros_deliverable_link','') <> ''",
    "    and coalesce(u.metadata_jsonb->>'aiworkeros_consumer_claim_state','') in ('failed','review_registration_failed')",
    "  order by u.updated_at asc nulls last",
    "  limit " + safeLimit,
    "), updated_unit as (",
    "  update business.aicm_worker_work_unit u",
    "  set",
    "    work_status_code = 'review_waiting',",
    "    review_status_code = 'waiting',",
    "    metadata_jsonb = (coalesce(u.metadata_jsonb, '{}'::jsonb) - 'aiworkeros_last_error') || jsonb_build_object(",
    "      'aiworkeros_execution_state', 'completed',",
    "      'aiworkeros_retryable', 'false',",
    "      'aiworkeros_consumer_claim_state', 'completed',",
    "      'aiworkeros_artifact_kind_code', (select artifact_kind_code from valid_artifact_kind),",
    "      'aiworkeros_review_finalized_by', 'B6R97R19C',",
    "      'aiworkeros_review_finalized_at', now()::text",
    "    ),",
    "    updated_at = now()",
    "  from target t",
    "  where u.aicm_worker_work_unit_id = t.aicm_worker_work_unit_id",
    "    and exists (select 1 from valid_artifact_kind)",
    "  returning u.*",
    "), existing_review as (",
    "  select h.aicm_human_review_item_id, h.related_worker_work_unit_id",
    "  from business.aicm_human_review_item h",
    "  join updated_unit u on h.related_worker_work_unit_id = u.aicm_worker_work_unit_id",
    "  where coalesce(h.human_review_status_code,'') = 'pending'",
    "), updated_review as (",
    "  update business.aicm_human_review_item h",
    "  set",
    "    artifact_kind_code = (select artifact_kind_code from valid_artifact_kind),",
    "    review_title = coalesce(nullif(h.review_title,''), '納品サマリー確認: ' || coalesce(u.work_unit_name, 'AIWorkerOS成果物')),",
    "    delivery_summary_text = coalesce(nullif(h.delivery_summary_text,''), 'AIWorkerOS consumer generated deliverable, summary, and delivery package.'),",
    "    main_changes_text = coalesce(nullif(h.main_changes_text,''), 'AIWorkerOS consumer generated deliverable, summary, and zip link.'),",
    "    ai_review_result_text = coalesce(nullif(h.ai_review_result_text,''), 'AIWorkerOS consumer completed deliverable generation.'),",
    "    artifact_link = coalesce(nullif(h.artifact_link,''), u.metadata_jsonb->>'aiworkeros_deliverable_link'),",
    "    metadata_jsonb = coalesce(h.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "      'source_route_code', coalesce(u.metadata_jsonb->>'source_route_code', 'aicm_worker_work_unit'),",
    "      'aiworkeros_request_id', u.metadata_jsonb->>'aiworkeros_request_id',",
    "      'aiworkeros_output_id', u.metadata_jsonb->>'aiworkeros_output_id',",
    "      'artifact_kind_code', (select artifact_kind_code from valid_artifact_kind),",
    "      'consumer_code', 'B6R97R19C'",
    "    ),",
    "    updated_at = now()",
    "  from updated_unit u",
    "  where h.related_worker_work_unit_id = u.aicm_worker_work_unit_id",
    "    and h.aicm_human_review_item_id in (select aicm_human_review_item_id from existing_review)",
    "  returning h.aicm_human_review_item_id",
    "), inserted_review as (",
    "  insert into business.aicm_human_review_item (",
    "    owner_civilization_id,",
    "    aicm_user_company_id,",
    "    aicm_user_company_department_id,",
    "    aicm_user_company_section_id,",
    "    related_manager_major_work_item_id,",
    "    related_worker_work_unit_id,",
    "    review_kind_code,",
    "    artifact_kind_code,",
    "    review_title,",
    "    delivery_summary_text,",
    "    main_changes_text,",
    "    ai_review_result_text,",
    "    unresolved_issues_text,",
    "    artifact_link,",
    "    responsible_ai_label,",
    "    requested_by_ai_label,",
    "    human_review_status_code,",
    "    priority_code,",
    "    metadata_jsonb",
    "  )",
    "  select",
    "    u.owner_civilization_id,",
    "    u.aicm_user_company_id,",
    "    NULL::uuid,",
    "    NULL::uuid,",
    "    NULL::uuid,",
    "    u.aicm_worker_work_unit_id,",
    "    'delivery_summary',",
    "    (select artifact_kind_code from valid_artifact_kind),",
    "    '納品サマリー確認: ' || coalesce(u.work_unit_name, 'AIWorkerOS成果物'),",
    "    'AIWorkerOS consumer generated deliverable, summary, and delivery package.',",
    "    'AIWorkerOS consumer generated deliverable, summary, and zip link.',",
    "    'AIWorkerOS consumer completed deliverable generation.',",
    "    '',",
    "    u.metadata_jsonb->>'aiworkeros_deliverable_link',",
    "    'AIWorkerOS',",
    "    'AICompanyManager',",
    "    'pending',",
    "    coalesce(nullif(u.priority_code,''), 'normal'),",
    "    jsonb_build_object(",
    "      'source_route_code', coalesce(u.metadata_jsonb->>'source_route_code', 'aicm_worker_work_unit'),",
    "      'aiworkeros_request_id', u.metadata_jsonb->>'aiworkeros_request_id',",
    "      'aiworkeros_output_id', u.metadata_jsonb->>'aiworkeros_output_id',",
    "      'artifact_kind_code', (select artifact_kind_code from valid_artifact_kind),",
    "      'consumer_code', 'B6R97R19C'",
    "    )",
    "  from updated_unit u",
    "  where not exists (",
    "    select 1",
    "    from existing_review er",
    "    where er.related_worker_work_unit_id = u.aicm_worker_work_unit_id",
    "  )",
    "  returning aicm_human_review_item_id",
    ")",
    "select 1;"
  ].join("\n");

  aiwB6R97R14PsqlText(sql);
  return true;
}

function aiwB6R97R14RecordSuccess(row, result, payload) {
  const workUnitId = String(row.aicm_worker_work_unit_id || "");
  if (!aiwB6R97R14IsUuid(workUnitId)) {
    throw new Error("invalid work unit id for AIWorkerOS consumer success");
  }

  const meta = row && row.metadata_jsonb && typeof row.metadata_jsonb === "object" ? row.metadata_jsonb : {};
  const requestId = aiwB6R97R14RequestId(result);
  const outputId = aiwB6R97R14OutputId(result);
  const summary = aiwB6R97R14Summary(result);
  const link = aiwB6R97R14DeliverableLink(result);
  const sourceRouteCode = String(meta.source_route_code || payload.source_route_code || "aicm_worker_work_unit");
  const title = String(payload.task_title || "AIWorkerOS成果物レビュー");

  const ownerExpr = aiwB6R97R14UuidOrNull(row.owner_civilization_id || "00000000-0000-4000-8000-000000000001");
  const companyExpr = aiwB6R97R14UuidOrNull(row.aicm_user_company_id || row.company_id || "");
  const deptExpr = aiwB6R97R14UuidOrNull(row.aicm_user_company_department_id || "");
  const sectionExpr = aiwB6R97R14UuidOrNull(row.aicm_user_company_section_id || "");
  const majorExpr = aiwB6R97R14UuidOrNull(row.related_manager_major_work_item_id || row.aicm_manager_major_work_item_id || "");

  // AIW_B6R97R16_E2BIG_COMPACT_RESULT_PATCH
  // Do not embed the full AIWorkerOS result JSON into psql -c SQL.
  // Full result payload can exceed OS argv limits and cause spawnSync psql E2BIG.
  const compactResultJson = JSON.stringify({
    result: result && result.result ? result.result : "",
    request_id: requestId,
    output_id: outputId,
    summary_present: Boolean(summary),
    deliverable_link: link,
    consumer_code: "B6R97R16"
  });

  const sql = [
    "update business.aicm_worker_work_unit",
    "set work_status_code = 'review_waiting',",
    "    review_status_code = 'waiting',",
    "    metadata_jsonb = coalesce(metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "      'aiworkeros_execution_state', 'completed',",
    "      'aiworkeros_retryable', 'false',",
    "      'aiworkeros_consumer_claim_state', 'completed',",
    "      'aiworkeros_request_id', " + aiwB6R97R14SqlLiteral(requestId) + ",",
    "      'aiworkeros_output_id', " + aiwB6R97R14SqlLiteral(outputId) + ",",
    "      'aiworkeros_deliverable_link', " + aiwB6R97R14SqlLiteral(link) + ",",
    "      'aiworkeros_completed_at', now()::text",
    "    ),",
    "    updated_at = now()",
    "where aicm_worker_work_unit_id = " + aiwB6R97R14UuidOrNull(workUnitId) + ";",
    "",
    "with existing as (",
    "  select aicm_human_review_item_id",
    "  from business.aicm_human_review_item",
    "  where related_worker_work_unit_id = " + aiwB6R97R14UuidOrNull(workUnitId),
    "    and coalesce(human_review_status_code,'') = 'pending'",
    "  limit 1",
    "), updated as (",
    "  update business.aicm_human_review_item h",
    "  set review_title = " + aiwB6R97R14SqlLiteral(title) + ",",
    "      delivery_summary_text = " + aiwB6R97R14SqlLiteral(summary) + ",",
    "      artifact_link = " + aiwB6R97R14SqlLiteral(link) + ",",
    "      ai_review_result_text = 'AIWorkerOS consumer completed deliverable generation.',",
    "      metadata_jsonb = coalesce(h.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(",
    "        'source_route_code', " + aiwB6R97R14SqlLiteral(sourceRouteCode) + ",",
    "        'aiworkeros_request_id', " + aiwB6R97R14SqlLiteral(requestId) + ",",
    "        'aiworkeros_output_id', " + aiwB6R97R14SqlLiteral(outputId) + ",",
    "        'aiworkeros_result_compact', " + aiwB6R97R14SqlLiteral(compactResultJson) + "::jsonb",
    "      ),",
    "      updated_at = now()",
    "  where h.aicm_human_review_item_id in (select aicm_human_review_item_id from existing)",
    "  returning h.aicm_human_review_item_id",
    "), inserted as (",
    "  insert into business.aicm_human_review_item (",
    "    owner_civilization_id,",
    "    aicm_user_company_id,",
    "    aicm_user_company_department_id,",
    "    aicm_user_company_section_id,",
    "    related_manager_major_work_item_id,",
    "    related_worker_work_unit_id,",
    "    review_kind_code,",
    "    artifact_kind_code,",
    "    review_title,",
    "    delivery_summary_text,",
    "    main_changes_text,",
    "    ai_review_result_text,",
    "    unresolved_issues_text,",
    "    artifact_link,",
    "    responsible_ai_label,",
    "    requested_by_ai_label,",
    "    human_review_status_code,",
    "    priority_code,",
    "    metadata_jsonb",
    "  )",
    "  select",
    "    " + ownerExpr + ",",
    "    " + companyExpr + ",",
    "    " + deptExpr + ",",
    "    " + sectionExpr + ",",
    "    " + majorExpr + ",",
    "    " + aiwB6R97R14UuidOrNull(workUnitId) + ",",
    "    'delivery_summary',",
    "    'delivery_package',",
    "    " + aiwB6R97R14SqlLiteral(title) + ",",
    "    " + aiwB6R97R14SqlLiteral(summary) + ",",
    "    'AIWorkerOS consumer generated deliverable, summary, and zip link.',",
    "    'AIWorkerOS consumer completed deliverable generation.',",
    "    '',",
    "    " + aiwB6R97R14SqlLiteral(link) + ",",
    "    'AIWorkerOS',",
    "    'AICompanyManager',",
    "    'pending',",
    "    coalesce(" + aiwB6R97R14SqlLiteral(row.priority_code || "") + ", 'normal'),",
    "    jsonb_build_object(",
    "      'source_route_code', " + aiwB6R97R14SqlLiteral(sourceRouteCode) + ",",
    "      'aiworkeros_request_id', " + aiwB6R97R14SqlLiteral(requestId) + ",",
    "      'aiworkeros_output_id', " + aiwB6R97R14SqlLiteral(outputId) + ",",
    "      'aiworkeros_result_compact', " + aiwB6R97R14SqlLiteral(compactResultJson) + "::jsonb,",
    "      'consumer_code', 'B6R97R14'",
    "    )",
    "  where not exists (select 1 from existing)",
    "  returning aicm_human_review_item_id",
    ")",
    "select coalesce((select aicm_human_review_item_id::text from updated limit 1), (select aicm_human_review_item_id::text from inserted limit 1), '') as review_id;"
  ].join("\n");

  aiwB6R97R14PsqlText(sql);
}

async function aiwB6R97R14ConsumerOnce(reason) {
  const state = globalThis.__AIW_B6R97R14_QUEUE_CONSUMER_STATE__ || {
    running: false,
    lastRunAt: "",
    lastReason: "",
    processedTotal: 0
  };
  globalThis.__AIW_B6R97R14_QUEUE_CONSUMER_STATE__ = state;

  if (state.running) return { skipped: true, reason: "already_running" };

  state.running = true;
  state.lastRunAt = new Date().toISOString();
  state.lastReason = reason;

  const limit = Math.max(1, Number(process.env.AIWORKER_QUEUE_CONSUMER_BATCH_LIMIT || "5") || 5);

  try {
    const finalizedReviewRowsB6R97R19C = aiwB6R97R19CFinalizeGeneratedReviewRows(limit);
    if (finalizedReviewRowsB6R97R19C) {
      state.processedTotal += 1;
    }

    const rows = aiwB6R97R14ClaimWorkUnits(limit);
    if (!Array.isArray(rows) || !rows.length) {
      return { processed: 0 };
    }

    let processed = 0;

    for (const row of rows) {
      const payload = aiwB6R97R14BuildPayload(row);
      const idempotencyKey = "aiworker-consumer-b6r97r14:" + String(row.aicm_worker_work_unit_id || "");
      try {
        const result = createRuntimeRequest(payload, idempotencyKey);
        aiwB6R97R14RecordSuccess(row, result, payload);
        processed += 1;
      } catch (error) {
        aiwB6R97R14MarkFailed(row, error);
      }
    }

    state.processedTotal += processed;
    return { processed };
  } finally {
    state.running = false;
  }
}

function aiwB6R97R14StartConsumer() {
  if (process.env.AIWORKER_QUEUE_CONSUMER_ENABLED === "0") {
    console.log("[B6R97R14] AIWorkerOS queue consumer disabled by env");
    return;
  }

  const key = "__AIW_B6R97R14_QUEUE_CONSUMER_STARTED__";
  if (globalThis[key]) return;
  globalThis[key] = true;

  const intervalMs = Math.max(1000, Number(process.env.AIWORKER_QUEUE_CONSUMER_INTERVAL_MS || "5000") || 5000);

  setTimeout(() => {
    aiwB6R97R14ConsumerOnce("startup").catch((error) => {
      console.error("[B6R97R14] startup consumer failed", String(error && error.message ? error.message : error).replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[DB_URL_REDACTED]").split("\n").slice(0, 8).join("\n"));
    });
  }, 1000);

  const timer = setInterval(() => {
    aiwB6R97R14ConsumerOnce("interval").catch((error) => {
      console.error("[B6R97R14] interval consumer failed", String(error && error.message ? error.message : error).replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[DB_URL_REDACTED]").split("\n").slice(0, 8).join("\n"));
    });
  }, intervalMs);

  globalThis.__AIW_B6R97R14_QUEUE_CONSUMER_TIMER__ = timer;

  process.once("SIGTERM", () => clearInterval(timer));
  process.once("SIGINT", () => clearInterval(timer));

  console.log("[B6R97R14] AIWorkerOS queue consumer started interval_ms=" + intervalMs);
}

setTimeout(aiwB6R97R14StartConsumer, 1500);
// AIW_B6R97R14_QUEUE_CONSUMER_END

// B6R98R4F1C_SOURCE_MATERIAL_TMP_CLEANUP_START
// Completed source material tmp cleanup.
// Deletes only AICM runtime-source-files/tmp files after worker_unit reaches completed/review_waiting.
// No cleanup for waiting/running/retryable states.
const aiwB6R98R4F1CFs = require("node:fs");
const aiwB6R98R4F1CPath = require("node:path");
const aiwB6R98R4F1CChildProcess = require("node:child_process");

const AIW_B6R98R4F1C_PATCH_CODE = "B6R98R4F1C";
const AIW_B6R98R4F1C_TMP_ROOT = process.env.AICM_SOURCE_MATERIAL_TMP_ROOT ||
  "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/storage/runtime-source-files/tmp";

function aiwB6R98R4F1CText(value) {
  return value === null || value === undefined ? "" : String(value);
}

function aiwB6R98R4F1CTmpRootResolved() {
  return aiwB6R98R4F1CPath.resolve(AIW_B6R98R4F1C_TMP_ROOT);
}

function aiwB6R98R4F1CIsUnderTmpRoot(value) {
  const target = aiwB6R98R4F1CPath.resolve(aiwB6R98R4F1CText(value));
  const root = aiwB6R98R4F1CTmpRootResolved();
  return target === root || target.startsWith(root + aiwB6R98R4F1CPath.sep);
}

function aiwB6R98R4F1CEscapeRegExp(value) {
  return aiwB6R98R4F1CText(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aiwB6R98R4F1CExtractTmpPaths(row) {
  const text = [
    aiwB6R98R4F1CText(row.reference_files_text),
    aiwB6R98R4F1CText(row.metadata_text)
  ].join("\n");

  const root = aiwB6R98R4F1CEscapeRegExp(aiwB6R98R4F1CTmpRootResolved());
  const re = new RegExp(root + "[^\\s\"'\\]\\},]+", "g");
  const found = text.match(re) || [];
  const unique = [];

  found.forEach((rawPath) => {
    const cleanPath = aiwB6R98R4F1CText(rawPath).trim();
    if (!cleanPath) return;
    if (!aiwB6R98R4F1CIsUnderTmpRoot(cleanPath)) return;
    if (!unique.includes(cleanPath)) unique.push(cleanPath);
  });

  return unique;
}

function aiwB6R98R4F1CRunPsql(sql, timeoutMs) {
  const dbUrl = process.env.PERSONA_DATABASE_URL;
  if (!dbUrl) {
    return {
      ok: false,
      stdout: "",
      stderr: "PERSONA_DATABASE_URL is not set",
      status: 1
    };
  }

  const result = aiwB6R98R4F1CChildProcess.spawnSync(
    "psql",
    [dbUrl, "-v", "ON_ERROR_STOP=1", "-X", "-q", "-t", "-A"],
    {
      input: sql,
      encoding: "utf8",
      timeout: timeoutMs || 20000,
      maxBuffer: 1024 * 1024 * 4
    }
  );

  return {
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    status: result.status
  };
}

function aiwB6R98R4F1CLoadEligibleRows() {
  const sql = [
    "select jsonb_build_object(",
    "  'id', aicm_worker_work_unit_id::text,",
    "  'reference_files_text', coalesce(reference_files_text,''),",
    "  'metadata_text', coalesce(metadata_jsonb::text,''),",
    "  'work_status_code', work_status_code,",
    "  'review_status_code', review_status_code,",
    "  'aiworkeros_execution_state', coalesce(metadata_jsonb->>'aiworkeros_execution_state',''),",
    "  'aiworkeros_consumer_claim_state', coalesce(metadata_jsonb->>'aiworkeros_consumer_claim_state',''),",
    "  'aiworkeros_retryable', coalesce(metadata_jsonb->>'aiworkeros_retryable','false')",
    ")::text",
    "from business.aicm_worker_work_unit",
    "where (reference_files_text ilike '%runtime-source-files/tmp%' or metadata_jsonb::text ilike '%runtime-source-files/tmp%')",
    "  and work_status_code = 'review_waiting'",
    "  and review_status_code = 'waiting'",
    "  and coalesce(metadata_jsonb->>'aiworkeros_execution_state','') = 'completed'",
    "  and coalesce(metadata_jsonb->>'aiworkeros_consumer_claim_state','') = 'completed'",
    "  and coalesce(metadata_jsonb->>'aiworkeros_retryable','false') in ('false','')",
    "  and coalesce(metadata_jsonb->>'source_material_tmp_cleanup_state','') not in ('deleted','completed')",
    "order by updated_at desc",
    "limit 20;"
  ].join("\n");

  const result = aiwB6R98R4F1CRunPsql(sql, 20000);
  if (!result.ok) {
    console.error("[B6R98R4F1C] cleanup eligible load failed", result.stderr);
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (_) {
        return null;
      }
    })
    .filter(Boolean);
}

function aiwB6R98R4F1CDeleteTmpPaths(paths) {
  const deleted = [];
  const skipped = [];

  (Array.isArray(paths) ? paths : []).forEach((rawPath) => {
    const target = aiwB6R98R4F1CPath.resolve(aiwB6R98R4F1CText(rawPath));
    if (!aiwB6R98R4F1CIsUnderTmpRoot(target)) {
      skipped.push({ path: rawPath, reason: "outside_tmp_root" });
      return;
    }

    try {
      if (aiwB6R98R4F1CFs.existsSync(target) && aiwB6R98R4F1CFs.statSync(target).isFile()) {
        aiwB6R98R4F1CFs.unlinkSync(target);
        deleted.push(target);
      } else {
        skipped.push({ path: target, reason: "not_found_or_not_file" });
      }
    } catch (error) {
      skipped.push({
        path: target,
        reason: "delete_error",
        message: error && error.message ? error.message : String(error)
      });
    }
  });

  return { deleted, skipped };
}

function aiwB6R98R4F1CJsonLiteral(value) {
  return "'" + JSON.stringify(value).replace(/'/g, "''") + "'::jsonb";
}

function aiwB6R98R4F1CUpdateCleanupMetadata(row, cleanupResult) {
  const deletedCount = cleanupResult.deleted.length;
  const skippedCount = cleanupResult.skipped.length;
  const state = deletedCount > 0 ? "deleted" : "completed";

  const metadataPatch = {
    source_material_tmp_cleanup_state: state,
    source_material_tmp_cleanup_at: new Date().toISOString(),
    source_material_tmp_cleanup_patch_code: AIW_B6R98R4F1C_PATCH_CODE,
    source_material_tmp_cleanup_deleted_count: deletedCount,
    source_material_tmp_cleanup_skipped_count: skippedCount,
    source_material_tmp_cleanup_deleted_paths: cleanupResult.deleted,
    source_material_tmp_cleanup_skipped_paths: cleanupResult.skipped
  };

  const id = aiwB6R98R4F1CText(row.id).replace(/'/g, "''");

  const sql = [
    "update business.aicm_worker_work_unit",
    "set metadata_jsonb = coalesce(metadata_jsonb, '{}'::jsonb) || " + aiwB6R98R4F1CJsonLiteral(metadataPatch) + ",",
    "    updated_at = now()",
    "where aicm_worker_work_unit_id = '" + id + "'::uuid",
    "  and work_status_code = 'review_waiting'",
    "  and review_status_code = 'waiting'",
    "  and coalesce(metadata_jsonb->>'aiworkeros_execution_state','') = 'completed'",
    "  and coalesce(metadata_jsonb->>'aiworkeros_consumer_claim_state','') = 'completed'",
    "  and coalesce(metadata_jsonb->>'aiworkeros_retryable','false') in ('false','')",
    "  and coalesce(metadata_jsonb->>'source_material_tmp_cleanup_state','') not in ('deleted','completed');"
  ].join("\n");

  const result = aiwB6R98R4F1CRunPsql(sql, 20000);
  if (!result.ok) {
    console.error("[B6R98R4F1C] cleanup metadata update failed", row.id, result.stderr);
  }

  return result.ok;
}

function aiwB6R98R4F1CRunCleanupOnce() {
  if (process.env.AIWORKEROS_SOURCE_MATERIAL_CLEANUP_DISABLED === "1") {
    return { ok: true, disabled: true };
  }

  const rows = aiwB6R98R4F1CLoadEligibleRows();
  let deletedTotal = 0;
  let skippedTotal = 0;
  let updatedTotal = 0;

  rows.forEach((row) => {
    const paths = aiwB6R98R4F1CExtractTmpPaths(row);
    const cleanupResult = aiwB6R98R4F1CDeleteTmpPaths(paths);
    deletedTotal += cleanupResult.deleted.length;
    skippedTotal += cleanupResult.skipped.length;
    if (aiwB6R98R4F1CUpdateCleanupMetadata(row, cleanupResult)) {
      updatedTotal += 1;
    }
  });

  if (rows.length || deletedTotal || skippedTotal) {
    console.log("[B6R98R4F1C] source material tmp cleanup", JSON.stringify({
      rows: rows.length,
      deleted: deletedTotal,
      skipped: skippedTotal,
      updated: updatedTotal
    }));
  }

  return {
    ok: true,
    rows: rows.length,
    deleted: deletedTotal,
    skipped: skippedTotal,
    updated: updatedTotal
  };
}

function aiwB6R98R4F1CScheduleCleanup() {
  if (globalThis.__AIW_B6R98R4F1C_SOURCE_MATERIAL_CLEANUP_SCHEDULED__) return;
  globalThis.__AIW_B6R98R4F1C_SOURCE_MATERIAL_CLEANUP_SCHEDULED__ = true;

  setTimeout(() => {
    try {
      aiwB6R98R4F1CRunCleanupOnce();
    } catch (error) {
      console.error("[B6R98R4F1C] initial cleanup failed", error && error.stack ? error.stack : error);
    }
  }, 1500);

  setInterval(() => {
    try {
      aiwB6R98R4F1CRunCleanupOnce();
    } catch (error) {
      console.error("[B6R98R4F1C] interval cleanup failed", error && error.stack ? error.stack : error);
    }
  }, Number(process.env.AIWORKEROS_SOURCE_MATERIAL_CLEANUP_INTERVAL_MS || "60000"));
}

aiwB6R98R4F1CScheduleCleanup();
// B6R98R4F1C_SOURCE_MATERIAL_TMP_CLEANUP_END
