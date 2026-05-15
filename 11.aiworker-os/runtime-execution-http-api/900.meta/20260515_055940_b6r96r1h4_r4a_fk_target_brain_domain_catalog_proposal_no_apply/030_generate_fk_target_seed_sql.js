const fs = require("fs");

const dynamicPath = process.argv[2];
const seedSqlPath = process.argv[3];
const decisionPath = process.argv[4];

const records = fs.readFileSync(dynamicPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"))
  .map((line) => JSON.parse(line));

const target = records.find((r) => r.record_type === "resolved_fk_target");
const structure = records.find((r) => r.record_type === "target_table_structure") || { columns: [] };
const constraints = records.find((r) => r.record_type === "target_constraints") || { constraints: [] };
const existingSix = (records.find((r) => r.record_type === "target_existing_six_check") || { rows: [] }).rows || [];

const columns = structure.columns || [];
const columnNames = columns.map((c) => c.column_name);

function q(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function qi(v) {
  return '"' + String(v).replace(/"/g, '""') + '"';
}

function raw(v) {
  return { raw: v };
}

function render(v) {
  if (v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "raw")) return v.raw;
  if (v && typeof v === "object") return q(JSON.stringify(v)) + "::jsonb";
  return q(v);
}

function has(col) {
  return columnNames.includes(col);
}

function first(candidates) {
  for (const c of candidates) if (has(c)) return c;
  return null;
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
  const statusCol = first(["status_code", "status"]);
  if (!statusCol) return null;
  const allowed = allowedValuesForColumn(statusCol);
  if (allowed.includes("active")) return "active";
  if (allowed.length > 0) return allowed[0];
  return "active";
}

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

if (!target || !target.referenced_schema || !target.referenced_table || !target.referenced_column) {
  fs.writeFileSync(seedSqlPath, [
    "-- B6R96R1H4_R4A seed SQL generation failed",
    "-- STATUS: NOT APPLIED",
    "-- MANUAL_REVIEW_REQUIRED: FK target for brain_domain_code was not resolved."
  ].join("\n") + "\n");

  fs.writeFileSync(decisionPath, [
    "# B6R96R1H4_R4A decision",
    "",
    "- MANUAL_REVIEW_REQUIRED: FK target unresolved."
  ].join("\n") + "\n");
  process.exit(0);
}

const schema = target.referenced_schema;
const table = target.referenced_table;
const refCol = target.referenced_column;
const tableRef = qi(schema) + "." + qi(table);
const statusValue = inferStatus();

function setIf(values, col, value) {
  if (col && has(col)) values[col] = value;
}

function valueForColumn(col, targetRow) {
  if (col === refCol) return targetRow.code;
  if (col === "brain_domain_code" || col === "domain_code" || col === "code") return targetRow.code;
  if (col === "brain_domain_name" || col === "domain_name" || col === "name") return targetRow.name;
  if (col === "brain_domain_name_ja" || col === "domain_name_ja" || col === "name_ja") return targetRow.name_ja;
  if (col === "brain_domain_label_ja" || col === "domain_label_ja" || col === "label_ja") return targetRow.name_ja;
  if (col === "description_ja" || col === "summary_ja" || col === "note_ja" || col === "notes_ja") return targetRow.summary_ja;
  if (col === "description" || col === "summary" || col === "note") return targetRow.summary_ja;
  if (col === "status_code" && statusValue) return statusValue;
  if (col === "active_flag" || col === "is_active" || col === "enabled_flag") return true;
  if (col === "sort_order" || col === "display_order") return targetRow.sort_order;
  if (col === "created_at" || col === "updated_at") return raw("now()");
  if (col === "metadata_jsonb" || col === "extra_jsonb" || col === "policy_jsonb") {
    return {
      source: "B6R96R1H4_R4A",
      fk_target_schema: schema,
      fk_target_table: table,
      fk_target_column: refCol,
      canonical_relation: "hd_r2_safe_task_domain_enabled_as_brain_domain",
      safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm",
      not_applied_proposal: true
    };
  }
  return undefined;
}

function genericRequiredValue(colObj, targetRow) {
  const col = colObj.column_name;
  const dataType = String(colObj.data_type || "");
  const udt = String(colObj.udt_name || "");

  if (udt === "uuid" || col.endsWith("_id")) return raw("gen_random_uuid()");
  if (dataType.includes("timestamp")) return raw("now()");
  if (dataType === "boolean") return true;
  if (dataType === "integer" || dataType === "bigint" || udt === "int4" || udt === "int8") return targetRow.sort_order || 0;
  if (dataType === "numeric") return targetRow.sort_order || 0;
  if (dataType === "jsonb" || udt === "jsonb") {
    return {
      source: "B6R96R1H4_R4A",
      generated_for_required_column: col,
      brain_domain_code: targetRow.code,
      safety_boundary_code: "defensive_fictional_game_lore_only_no_real_world_harm"
    };
  }
  return "b6r96r1h4_r4a_" + targetRow.code + "_" + col;
}

const required = requiredNoDefault();
let generated = 0;
let manual = 0;

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1H4_R4A FK-target Brain Domain Catalog Seed");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- FK target:");
sql.push("-- - source: aiworker.robot_brain_model_domain_policy.brain_domain_code");
sql.push(`-- - referenced: ${schema}.${table}.${refCol}`);
sql.push("");
sql.push("-- Purpose:");
sql.push("-- - Add missing brain domain entries required by robot_brain_model_domain_policy FK.");
sql.push("-- - Apply this before re-applying HD-R2 policy overlay.");
sql.push("");
sql.push("-- Safety boundary:");
sql.push("-- allowed = defensive / fictional / game / lore / emergency-prevention only");
sql.push("-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction");
sql.push("");

for (const targetRow of targets) {
  const values = {};

  for (const col of columnNames) {
    const v = valueForColumn(col, targetRow);
    if (v !== undefined) values[col] = v;
  }

  for (const colObj of required) {
    if (values[colObj.column_name] === undefined) {
      values[colObj.column_name] = genericRequiredValue(colObj, targetRow);
    }
  }

  const insertCols = Object.keys(values).filter((c) => has(c));
  const missing = required.map((c) => c.column_name).filter((c) => !insertCols.includes(c));

  sql.push("");
  sql.push("-- brain_domain: " + targetRow.code + " / " + targetRow.name_ja);

  if (!has(refCol)) {
    manual += 1;
    sql.push("-- MANUAL_REVIEW_REQUIRED: FK referenced column not found in target table columns.");
    continue;
  }

  if (missing.length > 0) {
    manual += 1;
    sql.push("-- MANUAL_REVIEW_REQUIRED: missing required columns: " + missing.join(", "));
    continue;
  }

  generated += 1;
  sql.push("insert into " + tableRef + " (");
  sql.push("  " + insertCols.map(qi).join(",\n  "));
  sql.push(")");
  sql.push("select");
  sql.push("  " + insertCols.map((col) => render(values[col]) + " as " + qi(col)).join(",\n  "));
  sql.push("where not exists (");
  sql.push("  select 1 from " + tableRef + " where " + qi(refCol) + " = " + q(targetRow.code));
  sql.push(");");
}

fs.writeFileSync(seedSqlPath, sql.join("\n") + "\n");

const md = [];
md.push("# B6R96R1H4_R4A FK-target brain domain seed decision");
md.push("");
md.push("## 1. FK target");
md.push(`- source: aiworker.robot_brain_model_domain_policy.brain_domain_code`);
md.push(`- referenced: ${schema}.${table}.${refCol}`);
md.push("");
md.push("## 2. Why R4 failed");
md.push("- R4 assumed `aiworker.brain_data_domain_catalog`.");
md.push("- Actual FK target must be read from pg_constraint, not hard-coded.");
md.push("");
md.push("## 3. Generated");
md.push(`- generated inserts: ${generated}`);
md.push(`- manual blocks: ${manual}`);
md.push(`- status_value: ${statusValue || "none"}`);
md.push("");
md.push("## 4. Existing six rows");
md.push("```json");
md.push(JSON.stringify(existingSix, null, 2));
md.push("```");
md.push("");
md.push("## 5. Required columns");
md.push("```json");
md.push(JSON.stringify(required, null, 2));
md.push("```");
md.push("");
md.push("## 6. Next");
md.push("- Apply this seed SQL only after explicit GO.");
md.push("- Then retry HD-R2 policy overlay apply.");
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
