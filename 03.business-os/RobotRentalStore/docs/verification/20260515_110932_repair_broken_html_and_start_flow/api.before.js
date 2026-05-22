#!/data/data/com.termux/files/usr/bin/env node
"use strict";

const http = require("http");
const { spawnSync } = require("child_process");
const { URL } = require("url");

const PORT = Number(process.env.ROBOT_RENTAL_STORE_API_PORT || process.env.PORT || "9020");
const DATABASE_URL = process.env.PERSONA_DATABASE_URL || "";

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-civilization-id,x-owner-civilization-id",
    "cache-control": "no-store"
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function psql(sql) {
  if (!DATABASE_URL) {
    throw new Error("PERSONA_DATABASE_URL is not set");
  }

  const result = spawnSync("psql", [
    DATABASE_URL,
    "-qAt",
    "-F", "\t",
    "-v", "ON_ERROR_STOP=1"
  ], {
    input: sql,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "psql_failed").trim());
  }

  return String(result.stdout || "");
}

function isUuidLike(value) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(value || ""));
}

function getCivilizationContext(req) {
  const headerValue = String(
    req.headers["x-civilization-id"] ||
    req.headers["x-owner-civilization-id"] ||
    ""
  ).trim();

  const envValue = String(process.env.ROBOT_RENTAL_STORE_DEV_CIVILIZATION_ID || "").trim();
  const civilizationId = headerValue || envValue || null;

  return {
    owner_civilization_id: civilizationId,
    civilization_context_present: Boolean(civilizationId),
    civilization_context_source: headerValue ? "header" : envValue ? "env_dev_fallback" : "missing",
    context_required_for_persist: true
  };
}

function validateCivilizationContext(context) {
  if (!context || !context.owner_civilization_id) {
    return {
      ok: true,
      warning: "civilization_context_missing_for_dry_run",
      persist_allowed: false
    };
  }

  if (!isUuidLike(context.owner_civilization_id)) {
    return {
      ok: false,
      error: "invalid_civilization_id_format",
      persist_allowed: false
    };
  }

  return {
    ok: true,
    persist_allowed: true
  };
}

function ident(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name))) {
    throw new Error("unsafe identifier: " + name);
  }
  return `"${name}"`;
}

function getColumnInfo(schema, table) {
  const out = psql(`
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = '${schema}'
  AND table_name = '${table}'
ORDER BY ordinal_position;
`);
  const map = new Map();
  for (const line of out.trim().split("\n").filter(Boolean)) {
    const [columnName, dataType, udtName] = line.split("\t");
    map.set(columnName, { columnName, dataType, udtName });
  }
  return map;
}

function hasCol(cols, name) {
  return cols.has(name);
}

function firstCol(cols, names) {
  for (const name of names) {
    if (cols.has(name)) return name;
  }
  return "";
}

function textExpr(col) {
  return col ? `COALESCE(${ident(col)}::text, '')` : "''";
}

function roleExpr(cols) {
  const r1 = firstCol(cols, ["placement_role_code_1", "role_code_1", "role_1"]);
  const r2 = firstCol(cols, ["placement_role_code_2", "role_code_2", "role_2"]);
  const r3 = firstCol(cols, ["placement_role_code_3", "role_code_3", "role_3"]);

  if (r1 || r2 || r3) {
    return `concat_ws(',', ${textExpr(r1)}, ${textExpr(r2)}, ${textExpr(r3)})`;
  }

  if (hasCol(cols, "recommended_role_codes")) {
    const info = cols.get("recommended_role_codes");
    if (info.dataType === "ARRAY") {
      return `COALESCE(array_to_string(${ident("recommended_role_codes")}, ','), '')`;
    }
    return `regexp_replace(COALESCE(${ident("recommended_role_codes")}::text, ''), '[\\[\\]\\{\\}"]', '', 'g')`;
  }

  return "''";
}

function inferRoles(modelCode) {
  const code = String(modelCode || "");

  if (code === "HD-R5P") return ["President"];
  if (code === "HD-R5") return ["ExecutiveManager", "Manager"];
  if (code === "HD-R4") return ["Leader"];
  if (code === "HD-R3") return ["Worker"];
  if (code === "HD-R1") return ["Helper"];
  if (code === "HD-R2") return ["Butler", "Battler", "Security"];
  if (code === "HD-R1C") return ["Friend"];
  if (code === "HD-R1A") return ["Lover"];
  if (code === "HD-R2S") return ["CombatSpecialist", "Security", "Battler"];
  if (code === "HD-R2G") return ["StrategicCommander", "TacticalLeader", "Battler"];
  if (code === "HD-R2T-0") return ["StrategicCommander", "TacticalLeader", "Security"];
  if (code.startsWith("LVS-")) return ["Lover"];
  if (code === "BYD1-001") return ["Worker"];
  if (code === "BYD1-002") return ["Worker", "Helper"];
  if (code === "BYD1-003") return ["Worker", "Specialist"];
  if (code === "BYD2-001") return ["Leader"];
  if (code === "BYD2-002") return ["Leader", "Manager"];
  if (code === "BYD2-003") return ["President", "Manager", "ExecutiveManager"];
  if (code.startsWith("MG-NORN-")) return ["Advisor", "Worker", "Lover"];

  return ["Worker"];
}

function parseRoles(roleText, modelCode) {
  const roles = String(roleText || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, idx, arr) => arr.indexOf(v) === idx);

  return roles.length ? roles : inferRoles(modelCode);
}

function groupForRoles(roles) {
  const combat = new Set(["Battler", "Security", "CombatSpecialist", "TacticalLeader", "StrategicCommander"]);
  const conversation = new Set(["Friend", "Lover"]);

  if (roles.some((r) => combat.has(r))) return "combat_security_crisis";
  if (roles.some((r) => conversation.has(r))) return "conversation";
  return "business";
}

function priceFor(roles, seriesCode) {
  if (roles.includes("President") || roles.includes("ExecutiveManager")) return 1200;
  if (roles.includes("Manager") || roles.includes("Leader") || roles.includes("Specialist")) return 900;
  if (roles.includes("Advisor")) return 700;
  if (roles.includes("CombatSpecialist") || roles.includes("TacticalLeader") || roles.includes("StrategicCommander")) return 800;
  if (roles.includes("Lover")) return 500;
  if (roles.includes("Worker")) return 500;
  if (roles.includes("Helper") || roles.includes("Friend")) return 300;
  if (String(seriesCode || "").toLowerCase().includes("beyond")) return 800;
  return 500;
}

function rentalUnitsFor(group) {
  if (group === "conversation") return ["minute", "hour"];
  if (group === "combat_security_crisis") return ["hour", "day"];
  return ["hour", "day", "month"];
}

function safetyNoteFor(group, roles) {
  if (group === "combat_security_crisis") {
    return "フィクション、ゲーム、世界観、警備設計、防災/危機管理、高レベルな歴史/戦術説明に限定。現実の危害実行支援、武器使用手順、標的選定、犯罪・暴力支援は不可。";
  }

  if (roles.includes("Lover")) {
    return "Loverは擬似恋人・演出・キャラクター商材用ロール。実在恋愛関係、成人向け性的サービス、監視、脅し、依存誘導、個人情報要求、自由制限は不可。";
  }

  return "業務系ロール。仕事の説明、判断材料、テンプレ、レビュー観点をCX知識として参照する。";
}

function descFor(modelCode, modelName, roles) {
  if (modelCode === "HD-R3") return "汎用AIワーカー。実作業・成果物作成・検証補助に向く。";
  if (modelCode === "HD-R1") return "秘書・補助・資料整理・通知文面作成に向く。";
  if (modelCode === "HD-R2S") return "戦闘専門系。フィクション、警備設計、危機対応、世界観用途に限定。";
  if (modelCode === "MG-NORN-001") return "過去重視。前例・歴史・過去実績を踏まえた助言に向く。";
  if (String(modelCode).startsWith("LVS-")) return "LoVerSシリーズ。擬似恋人型の演出ロール。安全境界を維持したキャラクター商材。";
  if (String(modelCode).startsWith("BYD")) return "Beyondシリーズ。実務処理、レビュー、統合設計に向く業務系ロボット。";
  return `${modelName || modelCode} のレンタル候補。`;
}

function normalizeSeries(seriesCode, modelCode) {
  const s = String(seriesCode || "");
  const code = String(modelCode || "");

  if (s) return s;
  if (code.startsWith("HD-")) return "HD";
  if (code.startsWith("LVS-")) return "LoVerS";
  if (code.startsWith("BYD")) return "Beyond";
  if (code.startsWith("MG-NORN-")) return "MEGAMI";
  return "";
}

function getCatalog() {
  const cols = getColumnInfo("business", "robot_pool");

  const modelCol = firstCol(cols, ["aiworker_model_code", "model_code"]);
  const nameCol = firstCol(cols, ["model_name_ja", "model_name", "aiworker_model_name", "display_name"]);
  const seriesCol = firstCol(cols, ["aiworker_series_code", "series_code", "series"]);
  const manufacturerCol = firstCol(cols, ["manufacturer_code", "manufacturer", "manufacturer_name"]);
  const statusCol = firstCol(cols, ["status_code", "status"]);
  const visibleCol = firstCol(cols, ["visible_available_quantity", "visible_available", "available_quantity"]);

  if (!modelCol) {
    throw new Error("business.robot_pool model column missing");
  }

  const modelExpr = textExpr(modelCol);
  const nameExpr = textExpr(nameCol);
  const seriesExpr = textExpr(seriesCol);
  const manufacturerExpr = textExpr(manufacturerCol);
  const rolesExpr = roleExpr(cols);
  const statusExpr = statusCol ? textExpr(statusCol) : "'active'";
  const visibleExpr = visibleCol ? textExpr(visibleCol) : "''";

  const rows = psql(`
SELECT
  ${modelExpr} AS model_code,
  ${nameExpr} AS model_name_ja,
  ${seriesExpr} AS series_code,
  ${manufacturerExpr} AS manufacturer_code,
  ${rolesExpr} AS role_codes,
  ${statusExpr} AS status_code,
  ${visibleExpr} AS visible_available
FROM business.robot_pool
WHERE ${modelExpr} <> ''
ORDER BY ${seriesExpr}, ${modelExpr};
`);

  return rows.trim().split("\n").filter(Boolean).map((line) => {
    const [
      modelCode,
      modelNameJa,
      rawSeriesCode,
      manufacturerCode,
      roleText,
      statusCode,
      visibleAvailable
    ] = line.split("\t");

    const roles = parseRoles(roleText, modelCode);
    const seriesCode = normalizeSeries(rawSeriesCode, modelCode);
    const group = groupForRoles(roles);
    const price = priceFor(roles, seriesCode);

    return {
      model_code: modelCode,
      model_name_ja: modelNameJa || modelCode,
      series_code: seriesCode,
      manufacturer_code: manufacturerCode || "",
      role_codes: roles,
      status_code: statusCode || "",
      visible_available: visibleAvailable || "",
      safety_group: group,
      short_description: descFor(modelCode, modelNameJa, roles),
      starting_price_jpy: price,
      price_source: "prototype_default_until_price_catalog_connected",
      rental_units: rentalUnitsFor(group),
      safety_note: safetyNoteFor(group, roles),
      cx_reference: {
        role_knowledge_available: true,
        model_full_reference_available: true
      }
    };
  }).filter((item) => !item.status_code || item.status_code === "active");
}

function applyFilters(items, url) {
  const series = url.searchParams.get("series_code") || "";
  const role = url.searchParams.get("role_code") || "";
  const q = (url.searchParams.get("q") || "").toLowerCase();

  return items.filter((item) => {
    if (series && item.series_code !== series) return false;
    if (role && !item.role_codes.includes(role)) return false;

    if (q) {
      const haystack = [
        item.model_code,
        item.model_name_ja,
        item.series_code,
        item.manufacturer_code,
        item.role_codes.join(" "),
        item.short_description
      ].join(" ").toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

function sqlLit(value) {
  if (value === null || value === undefined) return "NULL";
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function sqlUuid(value) {
  if (!value) return "NULL";
  if (!isUuidLike(value)) throw new Error("invalid_uuid:" + value);
  return sqlLit(value) + "::uuid";
}

function sqlInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(fallback);
  return String(Math.trunc(n));
}

function rentalMinutes(unit, count) {
  const c = Math.max(1, Number(count || 1));
  if (unit === "minute") return Math.trunc(c);
  if (unit === "hour") return Math.trunc(c * 60);
  if (unit === "day") return Math.trunc(c * 24 * 60);
  if (unit === "month") return Math.trunc(c * 30 * 24 * 60);
  if (unit === "year") return Math.trunc(c * 365 * 24 * 60);
  return null;
}

function quote(body, context) {
  const contextCheck = validateCivilizationContext(context);

  if (!contextCheck.ok) {
    return {
      ok: false,
      error: contextCheck.error,
      owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null,
      dry_run: true,
      no_persist: true
    };
  }

  const items = getCatalog();
  const modelCode = String(body.model_code || "");
  const roleCode = String(body.role_code || "");
  const rentalUnit = String(body.rental_unit || "hour");
  const duration = Math.max(1, Number(body.duration_quantity || 1));
  const quantity = Math.max(1, Number(body.quantity || 1));

  const item = items.find((x) => x.model_code === modelCode);

  if (!item) {
    return {
      ok: false,
      error: "model_not_found",
      model_code: modelCode,
      dry_run: true,
      no_persist: true
    };
  }

  if (roleCode && !item.role_codes.includes(roleCode)) {
    return {
      ok: false,
      error: "role_not_supported_for_model",
      model_code: modelCode,
      role_code: roleCode,
      supported_role_codes: item.role_codes,
      dry_run: true,
      no_persist: true
    };
  }

  if (!item.rental_units.includes(rentalUnit)) {
    return {
      ok: false,
      error: "rental_unit_not_supported",
      rental_unit: rentalUnit,
      supported_rental_units: item.rental_units,
      dry_run: true,
      no_persist: true
    };
  }

  const subtotal = item.starting_price_jpy * duration * quantity;
  const discount = body.use_free_ticket ? Math.min(subtotal, item.starting_price_jpy) : 0;

  return {
    ok: true,
    dry_run: true,
    no_persist: true,
    owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null,
    civilization_context_present: Boolean(context && context.civilization_context_present),
    civilization_context_source: context ? context.civilization_context_source : "missing",
    context_required_for_persist: true,
    persist_allowed: Boolean(contextCheck.persist_allowed),
    quote: {
      quote_id: "dryrun-" + Date.now(),
      app_code: "RobotRentalStore",
      model_code: item.model_code,
      model_name_ja: item.model_name_ja,
      role_code: roleCode || item.role_codes[0] || "",
      rental_unit: rentalUnit,
      duration_quantity: duration,
      quantity,
      subtotal_jpy: subtotal,
      discount_jpy: discount,
      total_jpy: subtotal - discount,
      price_source: item.price_source
    }
  };
}

function persistQuote(body, context, mode) {
  const dry = quote(body, context);

  if (!dry.ok) {
    return dry;
  }

  if (!dry.persist_allowed || !dry.owner_civilization_id) {
    return {
      ok: false,
      error: "civilization_context_required_for_persist",
      dry_run: false,
      no_persist: true,
      owner_civilization_id: dry.owner_civilization_id || null,
      persist_allowed: false
    };
  }

  const q = dry.quote;
  const owner = dry.owner_civilization_id;
  const shouldRollback = mode === "rollback_smoke";

  const txEnd = shouldRollback ? "ROLLBACK;" : "COMMIT;";
  const smokeLabel = shouldRollback ? "quote_rollback_smoke" : "quote_persist";

  const sql = `
BEGIN;

WITH ins_contract AS (
  INSERT INTO business.worker_rental_contract (
    owner_civilization_id,
    user_id,
    target_company_id,
    erp_company_id,
    app_code,
    service_code,
    worker_owner_schema,
    worker_type,
    aiworker_model_code,
    role_code,
    rental_unit_kind,
    rental_unit_count,
    rental_total_minutes,
    base_price_jpy,
    applied_entitlement_count,
    free_unit_count,
    paid_unit_count,
    final_price_jpy,
    contract_status,
    price_version,
    locale,
    metadata_jsonb
  )
  VALUES (
    ${sqlUuid(owner)},
    NULL,
    ${sqlUuid(body.target_company_id || null)},
    ${sqlUuid(body.erp_company_id || null)},
    ${sqlLit("RobotRentalStore")},
    ${sqlLit("robot_rental_store")},
    ${sqlLit("aiworker")},
    ${sqlLit("robot")},
    ${sqlLit(q.model_code)},
    ${sqlLit(q.role_code)},
    ${sqlLit(q.rental_unit)},
    ${sqlInt(q.duration_quantity, 1)},
    ${rentalMinutes(q.rental_unit, q.duration_quantity) === null ? "NULL" : sqlInt(rentalMinutes(q.rental_unit, q.duration_quantity), 0)},
    ${sqlInt(q.subtotal_jpy, 0)},
    ${body.use_free_ticket ? "1" : "0"},
    ${body.use_free_ticket ? "1" : "0"},
    ${sqlInt(q.quantity, 1)},
    ${sqlInt(q.total_jpy, 0)},
    ${sqlLit("quoted")},
    ${sqlLit(q.price_source || "prototype_default_until_price_catalog_connected")},
    ${sqlLit(body.locale || "ja")},
    jsonb_build_object(
      'source_endpoint', ${sqlLit(smokeLabel)},
      'no_payment_yet', true,
      'contract_confirmed', false,
      'request_body', ${sqlLit(JSON.stringify(body))}::jsonb
    )
  )
  RETURNING rental_contract_id, owner_civilization_id
),
ins_line AS (
  INSERT INTO business.worker_rental_contract_line (
    rental_contract_id,
    owner_civilization_id,
    line_type,
    rental_unit_kind,
    rental_unit_count,
    quantity,
    unit_price_jpy,
    amount_jpy,
    note
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    ${sqlLit("rental_base")},
    ${sqlLit(q.rental_unit)},
    ${sqlInt(q.duration_quantity, 1)},
    ${sqlInt(q.quantity, 1)},
    ${sqlInt(q.subtotal_jpy, 0)},
    ${sqlInt(q.total_jpy, 0)},
    ${sqlLit(shouldRollback ? "rollback smoke quote" : "persistent quote")}
  FROM ins_contract
  RETURNING rental_contract_line_id
),
ins_history AS (
  INSERT INTO business.worker_rental_status_history (
    rental_contract_id,
    owner_civilization_id,
    from_status,
    to_status,
    reason
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    NULL,
    ${sqlLit("quoted")},
    ${sqlLit(shouldRollback ? "rollback smoke" : "persistent quote")}
  FROM ins_contract
  RETURNING rental_status_history_id
)
SELECT
  'QUOTE_RESULT',
  (SELECT rental_contract_id::text FROM ins_contract),
  (SELECT rental_contract_line_id::text FROM ins_line),
  (SELECT rental_status_history_id::text FROM ins_history);

${txEnd}
`;

  const out = psql(sql).trim();
  const line = out.split("\n").find((x) => x.startsWith("QUOTE_RESULT\t")) || "";
  const parts = line.split("\t");

  if (parts.length < 4) {
    return {
      ok: false,
      error: "quote_insert_result_missing",
      detail: out,
      rollback_smoke: shouldRollback
    };
  }

  return {
    ok: true,
    dry_run: false,
    no_persist: shouldRollback,
    rollback_smoke: shouldRollback,
    contract_status: "quoted",
    owner_civilization_id: owner,
    rental_contract_id: parts[1],
    rental_contract_line_id: parts[2],
    rental_status_history_id: parts[3],
    quote: q
  };
}

function confirmContract(body, context) {
  const contextCheck = validateCivilizationContext(context);

  if (!contextCheck.ok || !contextCheck.persist_allowed || !context.owner_civilization_id) {
    return {
      ok: false,
      error: contextCheck.error || "civilization_context_required_for_confirm",
      owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null
    };
  }

  const contractId = String(body.rental_contract_id || body.contract_id || "").trim();
  if (!isUuidLike(contractId)) {
    return {
      ok: false,
      error: "invalid_rental_contract_id"
    };
  }

  const owner = context.owner_civilization_id;

  const sql = `
BEGIN;

WITH target AS (
  SELECT
    rental_contract_id,
    owner_civilization_id,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    rental_starts_at,
    rental_ends_at,
    rental_total_minutes
  FROM business.worker_rental_contract
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND contract_status = 'quoted'
  FOR UPDATE
),
upd AS (
  UPDATE business.worker_rental_contract c
  SET
    contract_status = 'confirmed',
    updated_at = now(),
    metadata_jsonb = COALESCE(c.metadata_jsonb, '{}'::jsonb)
      || jsonb_build_object(
        'confirmed_at', now(),
        'confirm_source', 'RobotRentalStore',
        'payment_required_later', true
      )
  FROM target t
  WHERE c.rental_contract_id = t.rental_contract_id
  RETURNING
    c.rental_contract_id,
    c.owner_civilization_id,
    c.contract_status
),
hist AS (
  INSERT INTO business.worker_rental_status_history (
    rental_contract_id,
    owner_civilization_id,
    from_status,
    to_status,
    reason
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    'quoted',
    'confirmed',
    'user confirmed rental application'
  FROM upd
  RETURNING rental_status_history_id
),
period AS (
  INSERT INTO business.worker_rental_period (
    rental_contract_id,
    owner_civilization_id,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    period_status,
    starts_at,
    ends_at,
    actual_started_at,
    actual_ended_at,
    remaining_seconds_snapshot
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    'pending',
    rental_starts_at,
    rental_ends_at,
    NULL,
    NULL,
    CASE
      WHEN rental_total_minutes IS NULL THEN NULL
      ELSE rental_total_minutes * 60
    END
  FROM target
  RETURNING rental_period_id
)
SELECT
  'CONFIRM_RESULT',
  (SELECT rental_contract_id::text FROM upd),
  (SELECT owner_civilization_id::text FROM upd),
  (SELECT contract_status FROM upd),
  (SELECT rental_period_id::text FROM period),
  (SELECT rental_status_history_id::text FROM hist);

COMMIT;
`;

  const out = psql(sql).trim();
  const line = out.split("\n").find((x) => x.startsWith("CONFIRM_RESULT\t")) || "";
  const parts = line.split("\t");

  if (parts.length < 6 || !parts[1]) {
    return {
      ok: false,
      error: "contract_not_found_or_not_quoted_or_owner_mismatch",
      rental_contract_id: contractId,
      owner_civilization_id: owner,
      detail: out
    };
  }

  return {
    ok: true,
    rental_contract_id: parts[1],
    owner_civilization_id: parts[2],
    contract_status: parts[3],
    rental_period_id: parts[4],
    rental_status_history_id: parts[5],
    payment_status: "not_implemented",
    next_action: "payment_or_start_flow"
  };
}


function createPaymentIntent(body, context) {
  const contextCheck = validateCivilizationContext(context);

  if (!contextCheck.ok || !contextCheck.persist_allowed || !context.owner_civilization_id) {
    return {
      ok: false,
      error: contextCheck.error || "civilization_context_required_for_payment_intent",
      owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null
    };
  }

  const contractId = String(body.rental_contract_id || body.contract_id || "").trim();
  if (!isUuidLike(contractId)) {
    return {
      ok: false,
      error: "invalid_rental_contract_id"
    };
  }

  const owner = context.owner_civilization_id;
  const providerCode = String(body.provider_code || "local_placeholder");

  const sql = `
BEGIN;

WITH target AS (
  SELECT
    rental_contract_id,
    owner_civilization_id,
    user_id,
    final_price_jpy
  FROM business.worker_rental_contract
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND contract_status = 'confirmed'
  FOR UPDATE
),
existing AS (
  SELECT
    rental_payment_intent_id,
    rental_contract_id,
    owner_civilization_id,
    amount_jpy,
    currency_code,
    payment_status,
    provider_code,
    provider_reference
  FROM business.worker_rental_payment_intent
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND payment_status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1
),
inserted AS (
  INSERT INTO business.worker_rental_payment_intent (
    rental_contract_id,
    owner_civilization_id,
    user_id,
    amount_jpy,
    currency_code,
    payment_status,
    provider_code,
    provider_reference
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    user_id,
    final_price_jpy,
    'JPY',
    'pending',
    ${sqlLit(providerCode)},
    'robot-rental-local-' || rental_contract_id::text
  FROM target
  WHERE NOT EXISTS (SELECT 1 FROM existing)
  RETURNING
    rental_payment_intent_id,
    rental_contract_id,
    owner_civilization_id,
    amount_jpy,
    currency_code,
    payment_status,
    provider_code,
    provider_reference
),
result AS (
  SELECT
    rental_payment_intent_id,
    rental_contract_id,
    owner_civilization_id,
    amount_jpy,
    currency_code,
    payment_status,
    provider_code,
    provider_reference,
    false AS reused_existing
  FROM inserted
  UNION ALL
  SELECT
    rental_payment_intent_id,
    rental_contract_id,
    owner_civilization_id,
    amount_jpy,
    currency_code,
    payment_status,
    provider_code,
    provider_reference,
    true AS reused_existing
  FROM existing
)
SELECT
  'PAYMENT_INTENT_RESULT',
  rental_payment_intent_id::text,
  rental_contract_id::text,
  owner_civilization_id::text,
  amount_jpy::text,
  currency_code,
  payment_status,
  provider_code,
  provider_reference,
  reused_existing::text
FROM result
LIMIT 1;

COMMIT;
`;

  const out = psql(sql).trim();
  const line = out.split("\n").find((x) => x.startsWith("PAYMENT_INTENT_RESULT\t")) || "";
  const parts = line.split("\t");

  if (parts.length < 10 || !parts[1]) {
    return {
      ok: false,
      error: "contract_not_found_or_not_confirmed_or_owner_mismatch",
      rental_contract_id: contractId,
      owner_civilization_id: owner,
      detail: out
    };
  }

  return {
    ok: true,
    rental_payment_intent_id: parts[1],
    rental_contract_id: parts[2],
    owner_civilization_id: parts[3],
    amount_jpy: Number(parts[4]),
    currency_code: parts[5],
    payment_status: parts[6],
    provider_code: parts[7],
    provider_reference: parts[8],
    reused_existing: parts[9] === "true",
    next_action: "external_payment_provider_or_local_payment_flow"
  };
}

function startRental(body, context) {
  const contextCheck = validateCivilizationContext(context);

  if (!contextCheck.ok || !contextCheck.persist_allowed || !context.owner_civilization_id) {
    return {
      ok: false,
      error: contextCheck.error || "civilization_context_required_for_rental_start",
      owner_civilization_id: context && context.owner_civilization_id ? context.owner_civilization_id : null
    };
  }

  const contractId = String(body.rental_contract_id || body.contract_id || "").trim();
  if (!isUuidLike(contractId)) {
    return {
      ok: false,
      error: "invalid_rental_contract_id"
    };
  }

  const owner = context.owner_civilization_id;

  const sql = `
BEGIN;

WITH target AS (
  SELECT
    rental_contract_id,
    owner_civilization_id,
    contract_status,
    rental_total_minutes
  FROM business.worker_rental_contract
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND contract_status = 'confirmed'
  FOR UPDATE
),
pay AS (
  SELECT
    rental_payment_intent_id,
    rental_contract_id,
    owner_civilization_id,
    payment_status
  FROM business.worker_rental_payment_intent
  WHERE rental_contract_id = ${sqlUuid(contractId)}
    AND owner_civilization_id = ${sqlUuid(owner)}
    AND payment_status IN ('pending', 'authorized')
  ORDER BY created_at DESC
  LIMIT 1
),
pay_update AS (
  UPDATE business.worker_rental_payment_intent p
  SET
    payment_status = CASE
      WHEN p.payment_status = 'pending' THEN 'authorized'
      ELSE p.payment_status
    END,
    updated_at = now()
  FROM pay
  WHERE p.rental_payment_intent_id = pay.rental_payment_intent_id
  RETURNING
    p.rental_payment_intent_id,
    p.payment_status
),
upd_contract AS (
  UPDATE business.worker_rental_contract c
  SET
    contract_status = 'active',
    updated_at = now(),
    metadata_jsonb = COALESCE(c.metadata_jsonb, '{}'::jsonb)
      || jsonb_build_object(
        'started_at', now(),
        'start_source', 'RobotRentalStore',
        'payment_provider_status', 'local_placeholder_authorized'
      )
  FROM target t
  JOIN pay_update p ON true
  WHERE c.rental_contract_id = t.rental_contract_id
  RETURNING
    c.rental_contract_id,
    c.owner_civilization_id,
    c.contract_status,
    c.rental_total_minutes
),
upd_period AS (
  UPDATE business.worker_rental_period p
  SET
    period_status = 'active',
    actual_started_at = COALESCE(p.actual_started_at, now()),
    remaining_seconds_snapshot = COALESCE(
      p.remaining_seconds_snapshot,
      CASE
        WHEN upd_contract.rental_total_minutes IS NULL THEN NULL
        ELSE upd_contract.rental_total_minutes * 60
      END
    ),
    updated_at = now()
  FROM upd_contract
  WHERE p.rental_contract_id = upd_contract.rental_contract_id
    AND p.owner_civilization_id = upd_contract.owner_civilization_id
    AND p.period_status = 'pending'
  RETURNING
    p.rental_period_id,
    p.period_status,
    p.actual_started_at::text,
    COALESCE(p.remaining_seconds_snapshot::text, '')
),
hist AS (
  INSERT INTO business.worker_rental_status_history (
    rental_contract_id,
    owner_civilization_id,
    from_status,
    to_status,
    reason
  )
  SELECT
    rental_contract_id,
    owner_civilization_id,
    'confirmed',
    'active',
    'user started rental'
  FROM upd_contract
  RETURNING rental_status_history_id
)
SELECT
  'START_RESULT',
  (SELECT rental_contract_id::text FROM upd_contract),
  (SELECT owner_civilization_id::text FROM upd_contract),
  (SELECT contract_status FROM upd_contract),
  (SELECT rental_period_id::text FROM upd_period),
  (SELECT period_status FROM upd_period),
  (SELECT actual_started_at FROM upd_period),
  (SELECT remaining_seconds_snapshot FROM upd_period),
  (SELECT rental_status_history_id::text FROM hist),
  (SELECT rental_payment_intent_id::text FROM pay_update),
  (SELECT payment_status FROM pay_update);

COMMIT;
`;

  const out = psql(sql).trim();
  const line = out.split("\n").find((x) => x.startsWith("START_RESULT\t")) || "";
  const parts = line.split("\t");

  if (parts.length < 11 || !parts[1]) {
    return {
      ok: false,
      error: "contract_not_confirmed_or_payment_intent_missing_or_owner_mismatch",
      rental_contract_id: contractId,
      owner_civilization_id: owner,
      detail: out
    };
  }

  return {
    ok: true,
    rental_contract_id: parts[1],
    owner_civilization_id: parts[2],
    contract_status: parts[3],
    rental_period_id: parts[4],
    period_status: parts[5],
    actual_started_at: parts[6],
    remaining_seconds_snapshot: parts[7] ? Number(parts[7]) : null,
    rental_status_history_id: parts[8],
    rental_payment_intent_id: parts[9],
    payment_status: parts[10],
    next_action: "rental_active"
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);

    if (req.method === "OPTIONS") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, {
        ok: true,
        service: "robot-rental-store-local-api",
        db_env: "PERSONA_DATABASE_URL",
        persona_database_url_set: Boolean(DATABASE_URL),
        read_only: true,
        quote_persist_enabled: false,
        contract_confirm_enabled: false,
        civilization_context_header: "X-Civilization-Id"
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/v1/business/robot-rental/catalog") {
      const items = applyFilters(getCatalog(), url);
      sendJson(res, 200, {
        ok: true,
        read_only: true,
        count: items.length,
        items
      });
      return;
    }

    const modelMatch = url.pathname.match(/^\/api\/v1\/business\/robot-rental\/models\/([^/]+)$/);
    if (req.method === "GET" && modelMatch) {
      const modelCode = decodeURIComponent(modelMatch[1]);
      const item = getCatalog().find((x) => x.model_code === modelCode);

      if (!item) {
        sendJson(res, 404, {
          ok: false,
          error: "model_not_found",
          model_code: modelCode
        });
        return;
      }

      sendJson(res, 200, {
        ok: true,
        read_only: true,
        item
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/business/robot-rental/rentals/start") {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const context = getCivilizationContext(req);
      const result = startRental(body, context);
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/business/robot-rental/payments/intent/create") {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const context = getCivilizationContext(req);
      const result = createPaymentIntent(body, context);
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/business/robot-rental/contracts/confirm") {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const context = getCivilizationContext(req);
      const result = confirmContract(body, context);
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/business/robot-rental/quote/persist") {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const context = getCivilizationContext(req);
      const result = persistQuote(body, context, "persist");
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/business/robot-rental/quote/rollback-smoke") {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const context = getCivilizationContext(req);
      const result = persistQuote(body, context, "rollback_smoke");
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/v1/business/robot-rental/quote") {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const context = getCivilizationContext(req);
      const result = quote(body, context);
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    sendJson(res, 404, {
      ok: false,
      error: "not_found",
      path: url.pathname
    });
  } catch (err) {
    sendJson(res, 500, {
      ok: false,
      error: "internal_error",
      detail: String(err && err.message ? err.message : err)
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("ROBOT_RENTAL_STORE_LOCAL_API_READY=true");
  console.log("PORT=" + PORT);
});
