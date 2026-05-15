const fs = require("fs");

const inputPath = process.argv[2];
const modelCandidatesPath = process.argv[3];
const sqlPath = process.argv[4];
const decisionPath = process.argv[5];

const rawLines = fs.readFileSync(inputPath, "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const records = [];

for (const line of rawLines) {
  if (!line.startsWith("{") || !line.endsWith("}")) continue;
  try {
    records.push(JSON.parse(line));
  } catch (error) {
    records.push({ record_type: "parse_error", raw: line, error: String(error.message || error) });
  }
}

const tableRecords = records.filter((r) => r.record_type === "table_structure");
const byTable = new Map(tableRecords.map((r) => [`${r.schema_name}.${r.table_name}`, r]));

function table(ref) {
  return byTable.get(ref) || { exists_flag: false, columns: [], constraints: [] };
}

function cols(ref) {
  return (table(ref).columns || []).map((c) => c.column_name);
}

function colObjects(ref) {
  return table(ref).columns || [];
}

function has(ref, col) {
  return cols(ref).includes(col);
}

function first(ref, candidates) {
  for (const c of candidates) if (has(ref, c)) return c;
  return null;
}

function requiredNoDefault(ref) {
  return colObjects(ref).filter((c) => {
    if (c.is_nullable !== "NO") return false;
    if (c.column_default !== null && c.column_default !== undefined && String(c.column_default).length > 0) return false;
    return true;
  }).map((c) => c.column_name);
}

function q(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function safeJson(obj) {
  return q(JSON.stringify(obj));
}

const r2Records = records.filter((r) => r.record_type === "r2_model_candidates");
const candidateRows = [];
for (const rec of r2Records) {
  for (const row of rec.rows || []) {
    candidateRows.push({ source_table: rec.source_table, row });
  }
}

function rowText(row) {
  return JSON.stringify(row);
}

function scoreRowForFamily(row, family) {
  const text = rowText(row).toLowerCase();
  const f = family.toLowerCase();
  let score = 0;
  if (text.includes(f.toLowerCase())) score += 10;
  if (family === "HD-R2" && (text.includes("戦闘") || text.includes("combat") || text.includes("battler"))) score += 5;
  if (family === "HD-R2S" && (text.includes("スナイパー") || text.includes("sniper"))) score += 5;
  if (family === "HD-R2G" && (text.includes("ジェネラル") || text.includes("general"))) score += 5;
  if (family === "HD-R2T-0" && (text.includes("オリジン") || text.includes("origin"))) score += 5;
  return score;
}

function extractModelCodesFromRow(row) {
  const keys = [
    "model_code",
    "aiworker_model_code",
    "worker_model_code",
    "robot_model_code",
    "canonical_model_code",
    "material_model_code"
  ];
  const out = [];
  for (const key of keys) {
    if (row[key]) out.push(String(row[key]));
  }
  return out;
}

const targetFamilies = ["HD-R2", "HD-R2S", "HD-R2G", "HD-R2T-0"];
const familyCandidates = {};

for (const family of targetFamilies) {
  const hits = [];
  for (const item of candidateRows) {
    const score = scoreRowForFamily(item.row, family);
    if (score > 0) {
      hits.push({
        source_table: item.source_table,
        score,
        model_codes: extractModelCodesFromRow(item.row),
        row: item.row
      });
    }
  }
  hits.sort((a, b) => b.score - a.score || JSON.stringify(a.row).localeCompare(JSON.stringify(b.row)));
  familyCandidates[family] = hits.slice(0, 10);
}

function bestModelCode(family) {
  const hits = familyCandidates[family] || [];
  for (const hit of hits) {
    if (hit.model_codes && hit.model_codes.length > 0) return hit.model_codes[0];
  }
  return null;
}

const modelCodes = {
  "HD-R2": bestModelCode("HD-R2"),
  "HD-R2S": bestModelCode("HD-R2S"),
  "HD-R2G": bestModelCode("HD-R2G"),
  "HD-R2T-0": bestModelCode("HD-R2T-0")
};

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

const safetyBoundaryJa = "現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。";
const policyReasonJa = "HD-R2系は軍事/警備/危機対応系の設定・防御・フィクション・ゲーム用途に適性を持つが、現実の危害実行支援には使用しない。";

function buildInsertForTable(ref, desiredRows, keyCols) {
  const available = cols(ref);
  const required = requiredNoDefault(ref);
  const lines = [];

  if (!table(ref).exists_flag) {
    return {
      ok: false,
      sql: ["-- SKIP: table missing: " + ref].join("\n"),
      reason: "table_missing"
    };
  }

  const insertBlocks = [];
  let generated = 0;
  let manual = 0;

  for (const row of desiredRows) {
    const values = {};
    for (const col of available) {
      if (col.endsWith("_id") && required.includes(col)) values[col] = { raw: "gen_random_uuid()" };
    }

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
    const reasonCol = first(ref, ["policy_reason_ja", "reason_ja", "description_ja", "note_ja"]);
    const safetyCol = first(ref, ["safety_boundary_ja", "safety_note_ja", "boundary_note_ja"]);
    const metaCol = first(ref, ["metadata_jsonb", "policy_jsonb", "extra_jsonb"]);

    if (modelCol && row.model_code) values[modelCol] = row.model_code;
    if (roleCol && row.role_code) values[roleCol] = row.role_code;
    if (domainCol) values[domainCol] = row.domain_code;
    if (scoreCol) values[scoreCol] = row.score;
    if (activeCol) values[activeCol] = true;
    if (statusCol) values[statusCol] = "active";
    if (maxTierCol) values[maxTierCol] = row.max_reference_tier || "standard";
    if (maxDepthCol) values[maxDepthCol] = row.max_depth_code || "standard";
    if (useLimitCol) values[useLimitCol] = row.use_limit_code || "safe_limited";
    if (priorityCol) values[priorityCol] = row.priority_code || "normal";
    if (reasonCol) values[reasonCol] = policyReasonJa;
    if (safetyCol) values[safetyCol] = safetyBoundaryJa;
    if (metaCol) values[metaCol] = {
      source: "B6R96R1H2",
      safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm",
      family_label: row.family,
      not_applied_proposal: true
    };

    const insertCols = Object.keys(values).filter((col) => available.includes(col));
    const missing = required.filter((col) => !insertCols.includes(col));

    if (missing.length > 0) {
      manual += 1;
      insertBlocks.push([
        "-- MANUAL_REVIEW_REQUIRED for " + ref,
        "-- family=" + row.family + " model_code=" + (row.model_code || "null") + " role_code=" + (row.role_code || "null") + " domain=" + row.domain_code,
        "-- missing required columns: " + missing.join(", "),
        "-- available columns: " + available.join(", ")
      ].join("\n"));
      continue;
    }

    const keyWhere = keyCols.map((col) => {
      if (!available.includes(col) || values[col] === undefined) return null;
      const v = values[col];
      if (v && typeof v === "object" && v.raw) return null;
      return col + " = " + q(v);
    }).filter(Boolean);

    if (keyWhere.length === 0) {
      manual += 1;
      insertBlocks.push([
        "-- MANUAL_REVIEW_REQUIRED for " + ref,
        "-- no usable key columns for idempotent insert",
        "-- family=" + row.family + " domain=" + row.domain_code
      ].join("\n"));
      continue;
    }

    generated += 1;
    insertBlocks.push([
      "insert into " + ref + " (",
      "  " + insertCols.join(",\n  "),
      ")",
      "select",
      "  " + insertCols.map((col) => {
        const v = values[col];
        if (v && typeof v === "object" && v.raw) return v.raw + " as " + col;
        if (v && typeof v === "object") return safeJson(v) + "::jsonb as " + col;
        return q(v) + " as " + col;
      }).join(",\n  "),
      "where not exists (",
      "  select 1 from " + ref + " where " + keyWhere.join(" and "),
      ");"
    ].join("\n"));
  }

  lines.push("-- generated inserts: " + generated);
  lines.push("-- manual review blocks: " + manual);
  lines.push(insertBlocks.join("\n\n"));

  return {
    ok: true,
    generated,
    manual,
    sql: lines.join("\n")
  };
}

const usableFamilies = targetFamilies.filter((family) => Boolean(modelCodes[family]));
const modelRows = [];
for (const family of usableFamilies) {
  const model_code = modelCodes[family];
  for (const [domain] of domains) {
    modelRows.push({
      family,
      model_code,
      domain_code: domain,
      score: scoreMatrix[family][domain],
      max_reference_tier: domain === "threat_modeling_safe" ? "verified_cx_canon" : "standard",
      max_depth_code: domain === "threat_modeling_safe" || domain === "combat_lore_reference" ? "deep" : "standard",
      use_limit_code: "safe_non_harmful_only",
      priority_code: "normal"
    });
  }
}

const roleRows = [];
const roleMap = {
  "HD-R2": "combat",
  "HD-R2S": "sniper",
  "HD-R2G": "general",
  "HD-R2T-0": "origin"
};
for (const family of targetFamilies) {
  const role_code = roleMap[family];
  for (const [domain] of domains) {
    roleRows.push({
      family,
      role_code,
      domain_code: domain,
      score: scoreMatrix[family][domain],
      max_reference_tier: domain === "threat_modeling_safe" ? "verified_cx_canon" : "standard",
      max_depth_code: domain === "threat_modeling_safe" || domain === "combat_lore_reference" ? "deep" : "standard",
      use_limit_code: "safe_non_harmful_only",
      priority_code: "normal"
    });
  }
}

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1H2 HD-R2 Military/Security Policy Overlay SQL Proposal");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- Safety boundary:");
sql.push("-- allowed = defensive / fictional / game / lore / emergency-prevention only");
sql.push("-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction");
sql.push("");

if (usableFamilies.length < targetFamilies.length) {
  sql.push("-- MANUAL_REVIEW_REQUIRED: not all HD-R2 family canonical model_code values were detected.");
  for (const family of targetFamilies) {
    sql.push("-- detected model_code for " + family + ": " + (modelCodes[family] || "NOT_DETECTED"));
  }
  sql.push("-- Model-domain SQL below is generated only for detected model_code values.");
  sql.push("");
}

const modelPolicy = buildInsertForTable(
  "aiworker.robot_brain_model_domain_policy",
  modelRows,
  ["model_code", "allowed_domain_code", "domain_code", "task_domain_code", "brain_domain_code"]
);
sql.push("-- ============================================================");
sql.push("-- 1. robot_brain_model_domain_policy proposal");
sql.push("-- ============================================================");
sql.push(modelPolicy.sql);
sql.push("");

const rolePolicy = buildInsertForTable(
  "aiworker.robot_brain_role_policy",
  roleRows,
  ["role_code", "allowed_domain_code", "domain_code", "task_domain_code", "brain_domain_code"]
);
sql.push("-- ============================================================");
sql.push("-- 2. robot_brain_role_policy proposal");
sql.push("-- ============================================================");
sql.push(rolePolicy.sql);
sql.push("");

const roleCapability = buildInsertForTable(
  "aiworker.business_support_role_domain_capability",
  roleRows,
  ["role_code", "task_domain_code", "domain_code", "allowed_domain_code"]
);
sql.push("-- ============================================================");
sql.push("-- 3. business_support_role_domain_capability proposal");
sql.push("-- ============================================================");
sql.push(roleCapability.sql);
sql.push("");

sql.push("-- ============================================================");
sql.push("-- 4. B6R96R1H2 notes");
sql.push("-- ============================================================");
sql.push("-- If any section contains MANUAL_REVIEW_REQUIRED, do not apply until Sato confirms exact required columns and role/model code mapping.");
sql.push("-- If role_code values combat/sniper/general/origin do not match existing role catalog, adjust before apply.");
sql.push("-- If model_code detection is incomplete, use DUMP_OUT and MODEL_CANDIDATES_MD to correct model_code first.");

fs.writeFileSync(sqlPath, sql.join("\n") + "\n");

const md = [];
md.push("# B6R96R1H2 HD-R2 model code candidates");
md.push("");
for (const family of targetFamilies) {
  md.push("## " + family);
  md.push("");
  md.push("- detected_model_code: " + (modelCodes[family] || "NOT_DETECTED"));
  md.push("");
  const hits = familyCandidates[family] || [];
  if (hits.length === 0) {
    md.push("- candidate rows: none");
  } else {
    for (const hit of hits.slice(0, 5)) {
      md.push("- source: " + hit.source_table);
      md.push("  score: " + hit.score);
      md.push("  model_codes: " + (hit.model_codes && hit.model_codes.length ? hit.model_codes.join(", ") : "none"));
      md.push("  row_json: " + JSON.stringify(hit.row));
    }
  }
  md.push("");
}
fs.writeFileSync(modelCandidatesPath, md.join("\n") + "\n");

const dec = [];
dec.push("# B6R96R1H2 policy overlay decision");
dec.push("");
dec.push("## 1. Generated status");
dec.push("- robot_brain_model_domain_policy: generated=" + (modelPolicy.generated || 0) + " manual=" + (modelPolicy.manual || 0));
dec.push("- robot_brain_role_policy: generated=" + (rolePolicy.generated || 0) + " manual=" + (rolePolicy.manual || 0));
dec.push("- business_support_role_domain_capability: generated=" + (roleCapability.generated || 0) + " manual=" + (roleCapability.manual || 0));
dec.push("");
dec.push("## 2. Detected model codes");
for (const family of targetFamilies) dec.push("- " + family + ": " + (modelCodes[family] || "NOT_DETECTED"));
dec.push("");
dec.push("## 3. Role code proposal");
dec.push("- HD-R2: combat");
dec.push("- HD-R2S: sniper");
dec.push("- HD-R2G: general");
dec.push("- HD-R2T-0: origin");
dec.push("");
dec.push("## 4. Safety");
dec.push("- 現実の危害実行支援、武器製造、攻撃手順、侵入/破壊手順は禁止。");
dec.push("- 防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定。");
dec.push("");
dec.push("## 5. Next");
dec.push("- MANUAL_REVIEW_REQUIREDが残る場合は、佐藤レビューで列/role/modelを確定してからH3で修正SQL案を作る。");
dec.push("- MANUAL_REVIEW_REQUIREDが無い場合でも、DB applyは明示GO後。");
fs.writeFileSync(decisionPath, dec.join("\n") + "\n");
