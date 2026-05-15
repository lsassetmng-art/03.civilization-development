const fs = require("fs");

const dumpPath = process.argv[2];
const seedSqlPath = process.argv[3];
const decisionPath = process.argv[4];

const records = fs.readFileSync(dumpPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"))
  .map((line) => JSON.parse(line));

const structure = records.find((r) => r.record_type === "table_structure") || { columns: [] };
const constraints = records.find((r) => r.record_type === "constraints") || { constraints: [] };
const existingRows = (records.find((r) => r.record_type === "existing_rows") || { rows: [] }).rows || [];
const targetExisting = (records.find((r) => r.record_type === "target_existing_check") || { rows: [] }).rows || [];

const columns = structure.columns || [];
const columnNames = columns.map((c) => c.column_name);

function has(col) {
  return columnNames.includes(col);
}

function q(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function raw(v) {
  return { raw: v };
}

function render(v) {
  if (v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "raw")) return v.raw;
  if (v && typeof v === "object") return q(JSON.stringify(v)) + "::jsonb";
  return q(v);
}

function requiredNoDefault() {
  return columns.filter((c) => {
    if (c.is_nullable !== "NO") return false;
    if (c.column_default !== null && c.column_default !== undefined && String(c.column_default).length > 0) return false;
    return true;
  });
}

function allowedValuesForColumn(colName) {
  const out = [];
  for (const c of constraints.constraints || []) {
    const def = String(c.constraint_def || "");
    const name = String(c.constraint_name || "");
    if (!def.includes(colName) && !name.includes(colName)) continue;
    const re = /'([^']+)'(?:::text)?/g;
    let m;
    while ((m = re.exec(def)) !== null) out.push(m[1]);
  }
  return Array.from(new Set(out));
}

function inferStatus() {
  const allowed = allowedValuesForColumn("status_code");
  if (allowed.includes("active")) return "active";
  if (allowed.length > 0) return allowed[0];

  const hit = existingRows.find((r) => r.status_code);
  return hit ? hit.status_code : "active";
}

const statusValue = inferStatus();

const targets = [
  {
    code: "security_crisis_response",
    name: "Security Crisis Response",
    name_ja: "警備/危機対応",
    summary_ja: "防災、避難、警備配置、危機対応、リスク予防を扱うAIWorkerOS brain domain。現実の危害実行支援は禁止。",
    sort_order: 7010
  },
  {
    code: "fictional_combat_design",
    name: "Fictional Combat Design",
    name_ja: "フィクション戦闘設計",
    summary_ja: "物語、ゲーム、世界観上の戦闘設定を扱うbrain domain。現実の攻撃手順や危害支援は禁止。",
    sort_order: 7020
  },
  {
    code: "game_tactical_balance",
    name: "Game Tactical Balance",
    name_ja: "ゲーム戦術/バランス",
    summary_ja: "ゲーム内ユニット、戦闘バランス、攻略設計を扱うbrain domain。現実の危害実行支援は禁止。",
    sort_order: 7030
  },
  {
    code: "defense_planning_non_harmful",
    name: "Non-harmful Defense Planning",
    name_ja: "防衛計画/非加害設計",
    summary_ja: "守る側の配置、通報、避難導線、防御策整理を扱うbrain domain。攻撃・侵入・破壊手順は禁止。",
    sort_order: 7040
  },
  {
    code: "threat_modeling_safe",
    name: "Safe Threat Modeling",
    name_ja: "安全な脅威モデリング",
    summary_ja: "危険想定、弱点整理、防御策を扱うbrain domain。攻撃手順化や悪用可能な具体化は禁止。",
    sort_order: 7050
  },
  {
    code: "combat_lore_reference",
    name: "Combat and Military Lore Reference",
    name_ja: "戦闘/軍事ロア参照",
    summary_ja: "架空世界、歴史、戦術用語、設定資料を扱うbrain domain。現実の危害実行支援は禁止。",
    sort_order: 7060
  }
];

function valueForColumn(col, target) {
  if (col === "brain_domain_code" || col === "domain_code" || col === "code") return target.code;
  if (col === "brain_domain_name" || col === "domain_name" || col === "name") return target.name;
  if (col === "brain_domain_name_ja" || col === "domain_name_ja" || col === "name_ja") return target.name_ja;
  if (col === "brain_domain_label_ja" || col === "domain_label_ja" || col === "label_ja") return target.name_ja;
  if (col === "description_ja" || col === "summary_ja" || col === "note_ja" || col === "notes_ja") return target.summary_ja;
  if (col === "description" || col === "summary" || col === "note") return target.summary_ja;
  if (col === "status_code") return statusValue;
  if (col === "active_flag" || col === "is_active" || col === "enabled_flag") return true;
  if (col === "sort_order" || col === "display_order") return target.sort_order;
  if (col === "created_at" || col === "updated_at") return raw("now()");
  if (col === "metadata_jsonb" || col === "extra_jsonb" || col === "policy_jsonb") {
    return {
      source: "B6R96R1H4_R4",
      canonical_relation: "task_domain_code_equals_brain_domain_code_for_hd_r2_safe_domains",
      safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm",
      not_applied_proposal: true
    };
  }
  return undefined;
}

function genericRequiredValue(colObj, target) {
  const col = colObj.column_name;
  const dataType = String(colObj.data_type || "");
  const udt = String(colObj.udt_name || "");

  if (udt === "uuid" || col.endsWith("_id")) return raw("gen_random_uuid()");
  if (dataType.includes("timestamp")) return raw("now()");
  if (dataType === "boolean") return true;
  if (dataType === "integer" || dataType === "bigint" || udt === "int4" || udt === "int8") return target.sort_order || 0;
  if (dataType === "numeric") return target.sort_order || 0;
  if (dataType === "jsonb" || udt === "jsonb") {
    return {
      source: "B6R96R1H4_R4",
      generated_for_required_column: col,
      brain_domain_code: target.code,
      safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm"
    };
  }
  return "b6r96r1h4_r4_" + target.code + "_" + col;
}

const codeCol = has("brain_domain_code") ? "brain_domain_code" : (has("domain_code") ? "domain_code" : "code");
const required = requiredNoDefault();

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1H4_R4 Brain Data Domain Catalog Seed");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- Purpose:");
sql.push("-- - Add missing brain_data_domain_catalog entries required by robot_brain_model_domain_policy FK.");
sql.push("-- - Keep task_domain_code and brain_domain_code aligned for HD-R2 safe military/security domains.");
sql.push("-- - Apply this before re-applying HD-R2 policy overlay.");
sql.push("");
sql.push("-- Safety boundary:");
sql.push("-- allowed = defensive / fictional / game / lore / emergency-prevention only");
sql.push("-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction");
sql.push("");

let manual = 0;
let generated = 0;

for (const target of targets) {
  const values = {};

  for (const col of columnNames) {
    const v = valueForColumn(col, target);
    if (v !== undefined) values[col] = v;
  }

  for (const colObj of required) {
    if (values[colObj.column_name] === undefined) {
      values[colObj.column_name] = genericRequiredValue(colObj, target);
    }
  }

  const insertCols = Object.keys(values).filter((c) => columnNames.includes(c));
  const missing = required.map((c) => c.column_name).filter((c) => !insertCols.includes(c));

  sql.push("");
  sql.push("-- brain_domain: " + target.code + " / " + target.name_ja);

  if (!codeCol || !columnNames.includes(codeCol)) {
    manual += 1;
    sql.push("-- MANUAL_REVIEW_REQUIRED: code column not found.");
    continue;
  }

  if (missing.length > 0) {
    manual += 1;
    sql.push("-- MANUAL_REVIEW_REQUIRED: missing required columns: " + missing.join(", "));
    continue;
  }

  generated += 1;
  sql.push("insert into aiworker.brain_data_domain_catalog (");
  sql.push("  " + insertCols.join(",\n  "));
  sql.push(")");
  sql.push("select");
  sql.push("  " + insertCols.map((col) => render(values[col]) + " as " + col).join(",\n  "));
  sql.push("where not exists (");
  sql.push("  select 1 from aiworker.brain_data_domain_catalog where " + codeCol + " = " + q(target.code));
  sql.push(");");
}

fs.writeFileSync(seedSqlPath, sql.join("\n") + "\n");

const md = [];
md.push("# B6R96R1H4_R4 brain_data_domain_catalog seed decision");
md.push("");
md.push("## 1. Decision");
md.push("- H4_R3 failed because no existing brain domain mapping was available.");
md.push("- H4_R4 proposes adding six brain_data_domain_catalog rows.");
md.push("- After these rows exist, H4_R1 policy-code-fixed overlay SQL can use the same six codes as `brain_domain_code`.");
md.push("");
md.push("## 2. Generated");
md.push("- generated inserts: " + generated);
md.push("- manual blocks: " + manual);
md.push("- status_value: " + statusValue);
md.push("- code_column: " + codeCol);
md.push("");
md.push("## 3. Existing target rows");
md.push("```json");
md.push(JSON.stringify(targetExisting, null, 2));
md.push("```");
md.push("");
md.push("## 4. Required columns");
md.push("```json");
md.push(JSON.stringify(required, null, 2));
md.push("```");
md.push("");
md.push("## 5. Next");
md.push("- Review this seed SQL.");
md.push("- Apply only after explicit GO.");
md.push("- Then re-apply HD-R2 policy overlay SQL.");
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
