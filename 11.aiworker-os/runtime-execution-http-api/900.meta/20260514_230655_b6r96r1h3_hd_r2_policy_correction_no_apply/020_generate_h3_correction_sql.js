const fs = require("fs");

const inputPath = process.argv[2];
const modelSummaryPath = process.argv[3];
const sqlPath = process.argv[4];
const decisionPath = process.argv[5];

const lines = fs.readFileSync(inputPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"));

const records = [];
for (const line of lines) {
  try {
    records.push(JSON.parse(line));
  } catch (error) {
    records.push({ record_type: "parse_error", raw: line, error: String(error.message || error) });
  }
}

const tableRecords = records.filter((r) => r.record_type === "table_structure");
const byTable = new Map(tableRecords.map((r) => [r.schema_name + "." + r.table_name, r]));

function table(ref) {
  return byTable.get(ref) || { exists_flag: false, columns: [], constraints: [] };
}

function columns(ref) {
  return (table(ref).columns || []).map((c) => c.column_name);
}

function columnObjects(ref) {
  return table(ref).columns || [];
}

function has(ref, col) {
  return columns(ref).includes(col);
}

function first(ref, candidates) {
  for (const c of candidates) {
    if (has(ref, c)) return c;
  }
  return null;
}

function requiredNoDefault(ref) {
  return columnObjects(ref).filter((c) => {
    if (c.is_nullable !== "NO") return false;
    if (c.column_default !== null && c.column_default !== undefined && String(c.column_default).length > 0) return false;
    return true;
  });
}

function q(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function raw(s) {
  return { raw: s };
}

function jsonValue(obj) {
  return { raw: q(JSON.stringify(obj)) + "::jsonb" };
}

function renderValue(v) {
  if (v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "raw")) return v.raw;
  return q(v);
}

const targetFamilies = ["HD-R2", "HD-R2S", "HD-R2G", "HD-R2T-0"];
const domains = [
  ["security_crisis_response", "警備/危機対応"],
  ["fictional_combat_design", "フィクション戦闘設計"],
  ["game_tactical_balance", "ゲーム戦術/バランス"],
  ["defense_planning_non_harmful", "防衛計画/非加害設計"],
  ["threat_modeling_safe", "安全な脅威モデリング"],
  ["combat_lore_reference", "戦闘/軍事ロア参照"]
];

const scoreMatrix = {
  "HD-R2": {
    security_crisis_response: 82,
    fictional_combat_design: 88,
    game_tactical_balance: 80,
    defense_planning_non_harmful: 76,
    threat_modeling_safe: 70,
    combat_lore_reference: 78
  },
  "HD-R2S": {
    security_crisis_response: 78,
    fictional_combat_design: 82,
    game_tactical_balance: 88,
    defense_planning_non_harmful: 90,
    threat_modeling_safe: 94,
    combat_lore_reference: 76
  },
  "HD-R2G": {
    security_crisis_response: 90,
    fictional_combat_design: 86,
    game_tactical_balance: 84,
    defense_planning_non_harmful: 92,
    threat_modeling_safe: 88,
    combat_lore_reference: 86
  },
  "HD-R2T-0": {
    security_crisis_response: 92,
    fictional_combat_design: 88,
    game_tactical_balance: 86,
    defense_planning_non_harmful: 94,
    threat_modeling_safe: 90,
    combat_lore_reference: 92
  }
};

const fallbackModelCodes = {
  "HD-R2": "hd_r2",
  "HD-R2S": "hd_r2s",
  "HD-R2G": "hd_r2g",
  "HD-R2T-0": "hd_r2t_0"
};

const roleMap = {
  "HD-R2": "combat",
  "HD-R2S": "sniper",
  "HD-R2G": "general",
  "HD-R2T-0": "origin"
};

function textOf(row) {
  return JSON.stringify(row || {});
}

function extractModelCodes(row) {
  const keys = [
    "model_code",
    "aiworker_model_code",
    "worker_model_code",
    "robot_model_code",
    "canonical_model_code",
    "material_model_code",
    "public_model_no",
    "model_no"
  ];
  const out = [];
  for (const key of keys) {
    if (row && row[key]) out.push(String(row[key]));
  }
  return out;
}

function scoreCandidate(row, family) {
  const txt = textOf(row).toLowerCase();
  let score = 0;
  const normalized = family.toLowerCase();
  if (txt.includes(normalized)) score += 20;
  if (txt.includes(normalized.replace("-", "_"))) score += 18;
  if (family === "HD-R2" && (txt.includes("戦闘") || txt.includes("combat") || txt.includes("battler"))) score += 7;
  if (family === "HD-R2S" && (txt.includes("スナイパー") || txt.includes("sniper"))) score += 7;
  if (family === "HD-R2G" && (txt.includes("ジェネラル") || txt.includes("general"))) score += 7;
  if (family === "HD-R2T-0" && (txt.includes("オリジン") || txt.includes("origin") || txt.includes("r2t"))) score += 7;
  return score;
}

const candidateRecords = records.filter((r) => r.record_type === "r2_model_candidates");
const candidateRows = [];
for (const rec of candidateRecords) {
  for (const row of rec.rows || []) candidateRows.push({ source_table: rec.source_table, row });
}

const familyCandidates = {};
const detectedModelCodes = {};

for (const family of targetFamilies) {
  const hits = [];
  for (const item of candidateRows) {
    const score = scoreCandidate(item.row, family);
    if (score > 0) {
      hits.push({
        source_table: item.source_table,
        score,
        model_codes: extractModelCodes(item.row),
        row: item.row
      });
    }
  }
  hits.sort((a, b) => b.score - a.score || textOf(a.row).localeCompare(textOf(b.row)));
  familyCandidates[family] = hits.slice(0, 10);

  let detected = null;
  for (const hit of hits) {
    if (hit.model_codes.length > 0) {
      detected = hit.model_codes[0];
      break;
    }
  }
  detectedModelCodes[family] = detected || fallbackModelCodes[family];
}

const safetyBoundaryJa = "現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。";
const policyReasonJa = "HD-R2系は軍事/警備/危機対応系の設定・防御・フィクション・ゲーム用途に適性を持つが、現実の危害実行支援には使用しない。";

function fillGenericRequired(ref, values, row, serialNo) {
  const req = requiredNoDefault(ref);
  const colTypes = new Map(columnObjects(ref).map((c) => [c.column_name, c]));

  for (const c of req) {
    const col = c.column_name;
    if (values[col] !== undefined) continue;

    const dataType = String(c.data_type || "");
    const udt = String(c.udt_name || "");

    if (udt === "uuid" || col.endsWith("_id")) {
      values[col] = raw("gen_random_uuid()");
    } else if (dataType.includes("timestamp")) {
      values[col] = raw("now()");
    } else if (dataType === "boolean") {
      values[col] = true;
    } else if (dataType === "integer" || udt === "int4" || udt === "int8" || dataType === "bigint") {
      if (col.includes("score")) values[col] = row.score || 0;
      else if (col.includes("sort") || col.includes("order")) values[col] = serialNo;
      else values[col] = 0;
    } else if (dataType === "numeric") {
      if (col.includes("score")) values[col] = row.score || 0;
      else values[col] = 0;
    } else if (udt === "jsonb" || dataType === "jsonb") {
      values[col] = jsonValue({
        source: "B6R96R1H3",
        family: row.family,
        model_code: row.model_code || null,
        role_code: row.role_code || null,
        domain_code: row.domain_code,
        safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm",
        generated_for_required_column: col,
        not_applied_proposal: true
      });
    } else {
      values[col] = "b6r96r1h3_" + row.family.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + row.domain_code + "_" + col;
    }
  }
}

function buildRowsForModel() {
  const rows = [];
  for (const family of targetFamilies) {
    const model_code = detectedModelCodes[family];
    for (const d of domains) {
      rows.push({
        family,
        model_code,
        role_code: roleMap[family],
        domain_code: d[0],
        domain_label_ja: d[1],
        score: scoreMatrix[family][d[0]],
        max_reference_tier: d[0] === "threat_modeling_safe" ? "verified_cx_canon" : "standard",
        max_depth_code: d[0] === "threat_modeling_safe" || d[0] === "combat_lore_reference" ? "deep" : "standard",
        use_limit_code: "safe_non_harmful_only",
        priority_code: "normal"
      });
    }
  }
  return rows;
}

function applyCommonValues(ref, values, row, serialNo) {
  const modelCol = first(ref, ["model_code", "aiworker_model_code", "worker_model_code", "robot_model_code"]);
  const roleCol = first(ref, ["role_code", "worker_role_code", "role_class_code"]);
  const domainCol = first(ref, ["task_domain_code", "domain_code", "allowed_domain_code", "brain_domain_code"]);
  const scoreCol = first(ref, ["proficiency_score", "capability_score", "quality_score", "score", "priority_score"]);
  const activeCol = first(ref, ["active_flag", "enabled_flag", "is_active"]);
  const statusCol = first(ref, ["status_code"]);
  const maxTierCol = first(ref, ["max_reference_tier", "reference_tier_code", "access_tier_code", "max_access_tier_code"]);
  const maxDepthCol = first(ref, ["max_depth_code", "depth_code", "reference_depth_code", "max_reference_depth_code"]);
  const useLimitCol = first(ref, ["use_limit_code", "usage_limit_code"]);
  const priorityCol = first(ref, ["priority_code"]);
  const reasonCol = first(ref, ["policy_reason_ja", "reason_ja", "description_ja", "note_ja", "capability_note_ja"]);
  const safetyCol = first(ref, ["safety_boundary_ja", "safety_note_ja", "boundary_note_ja"]);
  const labelCol = first(ref, ["label_ja", "name_ja", "capability_label_ja", "profile_label_ja"]);
  const codeCol = first(ref, ["policy_code", "capability_code", "profile_code", "rule_code"]);
  const packageCol = first(ref, ["package_code"]);
  const metaCol = first(ref, ["metadata_jsonb", "policy_jsonb", "extra_jsonb"]);

  if (modelCol) values[modelCol] = row.model_code;
  if (roleCol) values[roleCol] = row.role_code;
  if (domainCol) values[domainCol] = row.domain_code;
  if (scoreCol) values[scoreCol] = row.score;
  if (activeCol) values[activeCol] = true;
  if (statusCol) values[statusCol] = "active";
  if (maxTierCol) values[maxTierCol] = row.max_reference_tier;
  if (maxDepthCol) values[maxDepthCol] = row.max_depth_code;
  if (useLimitCol) values[useLimitCol] = row.use_limit_code;
  if (priorityCol) values[priorityCol] = row.priority_code;
  if (reasonCol) values[reasonCol] = policyReasonJa;
  if (safetyCol) values[safetyCol] = safetyBoundaryJa;
  if (labelCol) values[labelCol] = row.family + " " + row.domain_label_ja + "安全境界付き適性";
  if (codeCol) values[codeCol] = "b6r96r1h3_" + row.family.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + row.domain_code;
  if (packageCol) values[packageCol] = "aiworker_runtime";
  if (metaCol) values[metaCol] = jsonValue({
    source: "B6R96R1H3",
    family: row.family,
    model_code: row.model_code,
    role_code: row.role_code,
    domain_code: row.domain_code,
    score: row.score,
    safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm",
    not_applied_proposal: true
  });

  fillGenericRequired(ref, values, row, serialNo);
}

function buildInsert(ref, rows, keyPref) {
  if (!table(ref).exists_flag) {
    return {
      generated: 0,
      manual: rows.length,
      sql: "-- SKIP: table missing: " + ref
    };
  }

  const available = columns(ref);
  const blocks = [];
  let generated = 0;
  let manual = 0;
  let serialNo = 1000;

  for (const row of rows) {
    serialNo += 1;
    const values = {};
    applyCommonValues(ref, values, row, serialNo);

    const insertCols = Object.keys(values).filter((col) => available.includes(col));
    const req = requiredNoDefault(ref).map((c) => c.column_name);
    const missing = req.filter((col) => !insertCols.includes(col));

    if (missing.length > 0) {
      manual += 1;
      blocks.push([
        "-- MANUAL_REVIEW_REQUIRED for " + ref,
        "-- family=" + row.family + " model_code=" + row.model_code + " role_code=" + row.role_code + " domain=" + row.domain_code,
        "-- missing required columns: " + missing.join(", "),
        "-- available columns: " + available.join(", ")
      ].join("\n"));
      continue;
    }

    const keyCols = keyPref.filter((col) => available.includes(col) && values[col] !== undefined);
    if (keyCols.length === 0) {
      manual += 1;
      blocks.push([
        "-- MANUAL_REVIEW_REQUIRED for " + ref,
        "-- no idempotent key columns found",
        "-- family=" + row.family + " model_code=" + row.model_code + " role_code=" + row.role_code + " domain=" + row.domain_code
      ].join("\n"));
      continue;
    }

    generated += 1;
    blocks.push([
      "insert into " + ref + " (",
      "  " + insertCols.join(",\n  "),
      ")",
      "select",
      "  " + insertCols.map((col) => renderValue(values[col]) + " as " + col).join(",\n  "),
      "where not exists (",
      "  select 1 from " + ref + " where " + keyCols.map((col) => col + " = " + renderValue(values[col])).join(" and "),
      ");"
    ].join("\n"));
  }

  return {
    generated,
    manual,
    sql: [
      "-- generated inserts: " + generated,
      "-- manual review blocks: " + manual,
      blocks.join("\n\n")
    ].join("\n")
  };
}

const rows = buildRowsForModel();

const modelPolicy = buildInsert(
  "aiworker.robot_brain_model_domain_policy",
  rows,
  ["model_code", "allowed_domain_code", "domain_code", "task_domain_code", "brain_domain_code"]
);

const rolePolicy = buildInsert(
  "aiworker.robot_brain_role_policy",
  rows,
  ["role_code", "allowed_domain_code", "domain_code", "task_domain_code", "brain_domain_code"]
);

const roleCapability = buildInsert(
  "aiworker.business_support_role_domain_capability",
  rows,
  ["role_code", "task_domain_code", "domain_code", "allowed_domain_code"]
);

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1H3 HD-R2 Military/Security Policy Overlay Correction");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- H3 correction policy:");
sql.push("-- - Fill required non-null/no-default columns where safe.");
sql.push("-- - Use detected model_code when available.");
sql.push("-- - Use fallback model_code only as proposal; Sato must confirm before apply.");
sql.push("-- - Keep safety boundary explicit.");
sql.push("");
for (const family of targetFamilies) {
  sql.push("-- model_code proposal " + family + ": " + detectedModelCodes[family]);
}
sql.push("");
sql.push("-- Safety boundary:");
sql.push("-- allowed = defensive / fictional / game / lore / emergency-prevention only");
sql.push("-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction");
sql.push("");
sql.push("-- ============================================================");
sql.push("-- 1. robot_brain_model_domain_policy corrected proposal");
sql.push("-- ============================================================");
sql.push(modelPolicy.sql);
sql.push("");
sql.push("-- ============================================================");
sql.push("-- 2. robot_brain_role_policy corrected proposal");
sql.push("-- ============================================================");
sql.push(rolePolicy.sql);
sql.push("");
sql.push("-- ============================================================");
sql.push("-- 3. business_support_role_domain_capability corrected proposal");
sql.push("-- ============================================================");
sql.push(roleCapability.sql);
sql.push("");
sql.push("-- ============================================================");
sql.push("-- 4. H3 apply warning");
sql.push("-- ============================================================");
sql.push("-- Do not apply until Sato confirms model_code, role_code, target tables, and safety boundary.");
fs.writeFileSync(sqlPath, sql.join("\n") + "\n");

const modelMd = [];
modelMd.push("# B6R96R1H3 model / role summary");
modelMd.push("");
modelMd.push("## Detected or proposed model codes");
for (const family of targetFamilies) {
  modelMd.push("- " + family + ": " + detectedModelCodes[family]);
}
modelMd.push("");
modelMd.push("## Role code proposal");
for (const family of targetFamilies) {
  modelMd.push("- " + family + ": " + roleMap[family]);
}
modelMd.push("");
modelMd.push("## Candidate rows");
for (const family of targetFamilies) {
  modelMd.push("");
  modelMd.push("### " + family);
  const hits = familyCandidates[family] || [];
  if (hits.length === 0) {
    modelMd.push("- no DB candidate detected; fallback used");
  } else {
    for (const hit of hits.slice(0, 5)) {
      modelMd.push("- source: " + hit.source_table);
      modelMd.push("  model_codes: " + (extractModelCodes(hit.row).join(", ") || "none"));
      modelMd.push("  row_json: " + JSON.stringify(hit.row));
    }
  }
}
fs.writeFileSync(modelSummaryPath, modelMd.join("\n") + "\n");

const totalManual = modelPolicy.manual + rolePolicy.manual + roleCapability.manual;
const totalGenerated = modelPolicy.generated + rolePolicy.generated + roleCapability.generated;

const dec = [];
dec.push("# B6R96R1H3 correction decision");
dec.push("");
dec.push("## Generated");
dec.push("- total_generated: " + totalGenerated);
dec.push("- total_manual: " + totalManual);
dec.push("- robot_brain_model_domain_policy generated=" + modelPolicy.generated + " manual=" + modelPolicy.manual);
dec.push("- robot_brain_role_policy generated=" + rolePolicy.generated + " manual=" + rolePolicy.manual);
dec.push("- business_support_role_domain_capability generated=" + roleCapability.generated + " manual=" + roleCapability.manual);
dec.push("");
dec.push("## Decision");
if (totalManual === 0) {
  dec.push("- H3 correction SQL has no MANUAL_REVIEW_REQUIRED.");
  dec.push("- It is apply-ready only after Sato review and explicit GO.");
} else {
  dec.push("- H3 correction SQL still has MANUAL_REVIEW_REQUIRED.");
  dec.push("- Review remaining missing columns before apply.");
}
dec.push("");
dec.push("## Safety");
dec.push("- 現実の危害実行支援、武器製造、攻撃手順、侵入/破壊手順は禁止。");
dec.push("- 防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定。");
fs.writeFileSync(decisionPath, dec.join("\n") + "\n");
