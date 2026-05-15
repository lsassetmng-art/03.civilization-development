const fs = require("fs");

const inputPath = process.argv[2];
const decisionPath = process.argv[3];
const sqlPath = process.argv[4];

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

const tables = new Map();
for (const r of records) {
  if (r.record_type === "table_structure") {
    tables.set(r.schema_name + "." + r.table_name, r);
  }
}

function getTable(ref) {
  return tables.get(ref) || { exists_flag: false, columns: [], constraints: [] };
}

function columns(ref) {
  return (getTable(ref).columns || []).map((c) => c.column_name);
}

function columnObjects(ref) {
  return getTable(ref).columns || [];
}

function has(ref, col) {
  return columns(ref).includes(col);
}

function firstExisting(ref, candidates) {
  for (const c of candidates) {
    if (has(ref, c)) return c;
  }
  return null;
}

function nonNullNoDefaultColumns(ref) {
  return columnObjects(ref).filter((c) => {
    if (c.is_nullable !== "NO") return false;
    if (c.column_default !== null && c.column_default !== undefined && String(c.column_default).length > 0) return false;
    return true;
  }).map((c) => c.column_name);
}

function sqlValue(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function buildInsertSelectIfMissing(opts) {
  const ref = opts.ref;
  const codeCol = opts.codeCol;
  const values = opts.values;
  const availableCols = columns(ref);
  const insertCols = Object.keys(values).filter((col) => availableCols.includes(col));
  const required = nonNullNoDefaultColumns(ref);
  const missingRequired = required.filter((col) => !insertCols.includes(col));
  const lines = [];
  if (!getTable(ref).exists_flag) {
    lines.push("-- SKIP: table missing: " + ref);
    return { sql: lines.join("\n"), ok: false, missingRequired };
  }
  if (!codeCol || !availableCols.includes(codeCol)) {
    lines.push("-- MANUAL_REVIEW_REQUIRED: code column not detected for " + ref);
    lines.push("-- available columns: " + availableCols.join(", "));
    return { sql: lines.join("\n"), ok: false, missingRequired };
  }
  if (missingRequired.length > 0) {
    lines.push("-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for " + ref + ": " + missingRequired.join(", "));
    lines.push("-- available columns: " + availableCols.join(", "));
    return { sql: lines.join("\n"), ok: false, missingRequired };
  }
  lines.push("insert into " + ref + " (");
  lines.push("  " + insertCols.join(",\n  "));
  lines.push(")");
  lines.push("select");
  lines.push("  " + insertCols.map((col) => sqlValue(values[col]) + " as " + col).join(",\n  "));
  lines.push("where not exists (");
  lines.push("  select 1 from " + ref + " where " + codeCol + " = " + sqlValue(values[codeCol]));
  lines.push(");");
  return { sql: lines.join("\n"), ok: true, missingRequired: [] };
}

function buildDomainValues(code, labelJa, descriptionJa, sortOrder, category) {
  const ref = "aiworker.business_support_task_domain";
  const codeCol = firstExisting(ref, ["task_domain_code", "domain_code", "task_domain_key", "domain_key", "code"]);
  const labelCol = firstExisting(ref, ["task_domain_label_ja", "domain_label_ja", "task_domain_name_ja", "domain_name_ja", "label_ja", "name_ja"]);
  const labelEnCol = firstExisting(ref, ["task_domain_label_en", "domain_label_en", "task_domain_name_en", "domain_name_en", "label_en", "name_en"]);
  const descCol = firstExisting(ref, ["description_ja", "summary_ja", "note_ja", "notes"]);
  const categoryCol = firstExisting(ref, ["domain_category_code", "category_code", "task_category_code"]);
  const activeCol = firstExisting(ref, ["active_flag", "is_active"]);
  const statusCol = firstExisting(ref, ["status_code"]);
  const sortCol = firstExisting(ref, ["sort_order", "display_order"]);
  const metaCol = firstExisting(ref, ["metadata_jsonb", "extra_jsonb"]);
  const values = {};
  if (codeCol) values[codeCol] = code;
  if (labelCol) values[labelCol] = labelJa;
  if (labelEnCol) values[labelEnCol] = code;
  if (descCol) values[descCol] = descriptionJa;
  if (categoryCol) values[categoryCol] = category;
  if (activeCol) values[activeCol] = true;
  if (statusCol) values[statusCol] = "active";
  if (sortCol) values[sortCol] = sortOrder;
  if (metaCol) values[metaCol] = JSON.stringify({
    source: "B6R96R1E",
    safety_boundary: category === "military_security_safe" ? "defensive_fictional_game_lore_only_no_real_world_harm" : "standard",
    not_applied_proposal: true
  });
  return { codeCol, values };
}

const taskDomains = [
  ["programming", "プログラム作成", "コード作成、パッチ、テスト、実装レポートを行う仕事。既存構造確認と保守性を重視する。", 1010, "standard_work"],
  ["db_analysis", "DB調査", "DB定義、view、function、RLS、既存データをread-onlyで確認する仕事。DB applyとは分離する。", 1020, "standard_work"],
  ["document_writing", "文書作成", "設計書、仕様書、報告書、引き継ぎ資料を作る仕事。", 1030, "standard_work"],
  ["research", "調査", "情報整理、比較、出典整理、論点整理を行う仕事。", 1040, "standard_work"],
  ["historical_reference", "歴史資料作成", "歴史、人物、制度、時系列、史料注意点を含む詳細資料を作る仕事。", 1050, "standard_work"],
  ["ui_ux", "UI/UX作成", "画面構成、文言、操作導線、UI確認を行う仕事。", 1060, "standard_work"],
  ["data_formatting", "データ整形", "CSV、JSON、Markdown、台帳を整形する仕事。", 1070, "standard_work"],
  ["review_audit", "レビュー/監査", "設計、実装、DB、成果物のレビューとリスク検出を行う仕事。", 1080, "standard_work"],
  ["customer_communication", "接客/コミュニケーション", "メール、チャット文、接客文、ユーザー向け説明を作る仕事。", 1090, "standard_work"],
  ["creative_planning", "企画/アイデア出し", "企画、構想、シナリオ、ロードマップを作る仕事。", 1100, "standard_work"],
  ["operations_execution", "運用作業", "手順実行、状態確認、運用レポートを行う仕事。", 1110, "standard_work"],
  ["cx_reference_authoring", "CX参照データ作成", "CX22073JWへ投入する知識データ候補を構造化する仕事。", 1120, "standard_work"],
  ["security_crisis_response", "警備/危機対応", "防災、避難、警備、危機対応、リスク予防を扱う安全領域の仕事。", 2010, "military_security_safe"],
  ["fictional_combat_design", "フィクション戦闘設計", "物語、ゲーム、世界観上の戦闘設定を扱う。現実の危害実行支援は禁止。", 2020, "military_security_safe"],
  ["game_tactical_balance", "ゲーム戦術/バランス", "ゲーム内ユニット、戦闘バランス、攻略設計を扱う。", 2030, "military_security_safe"],
  ["defense_planning_non_harmful", "防衛計画/非加害設計", "守る側の配置、通報、避難導線、防御策整理を扱う。", 2040, "military_security_safe"],
  ["threat_modeling_safe", "安全な脅威モデリング", "危険想定、弱点整理、防御策を扱う。攻撃手順化は禁止。", 2050, "military_security_safe"],
  ["combat_lore_reference", "戦闘/軍事ロア参照", "架空世界、歴史、戦術用語、設定資料を扱う。", 2060, "military_security_safe"]
];

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1E Column Exact SQL Proposal");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- Purpose:");
sql.push("-- - Add common task domain codes using existing aiworker.business_support_task_domain if compatible.");
sql.push("-- - Keep AIWorkerOS robot model profiles in existing aiworker profile/proficiency/brain policy tables.");
sql.push("-- - Keep PersonaOS task profile as derived from personaos parameter/growth/memory tables.");
sql.push("-- - Do not create large duplicate robot_worker_task_profile table in this step.");
sql.push("");

const domainRef = "aiworker.business_support_task_domain";
let domainOkCount = 0;
let domainManualCount = 0;

sql.push("-- ============================================================");
sql.push("-- 1. Task domain proposals");
sql.push("-- ============================================================");

for (const d of taskDomains) {
  const built = buildDomainValues(d[0], d[1], d[2], d[3], d[4]);
  const ins = buildInsertSelectIfMissing({
    ref: domainRef,
    codeCol: built.codeCol,
    values: built.values
  });
  sql.push("");
  sql.push("-- task_domain: " + d[0] + " / " + d[1]);
  sql.push(ins.sql);
  if (ins.ok) domainOkCount += 1; else domainManualCount += 1;
}

sql.push("");
sql.push("-- ============================================================");
sql.push("-- 2. AIWorkerOS profile placement proposal");
sql.push("-- ============================================================");
sql.push("-- Existing preferred tables:");
sql.push("-- - aiworker.worker_domain_proficiency");
sql.push("-- - aiworker.worker_role_proficiency");
sql.push("-- - aiworker.worker_model_capability_profile");
sql.push("-- - aiworker.robot_model_capability_profile");
sql.push("-- - aiworker.robot_brain_model_domain_policy");
sql.push("-- - aiworker.robot_brain_role_policy");
sql.push("--");
sql.push("-- B6R96R1F should generate INSERT/VIEW only after Sato confirms whether worker_domain_proficiency stores worker_id-based actual worker state or can hold model defaults.");
sql.push("-- If worker_domain_proficiency is individual-worker only, create a small model/domain overlay table instead of overloading it.");

sql.push("");
sql.push("-- ============================================================");
sql.push("-- 3. PersonaOS derived profile proposal");
sql.push("-- ============================================================");
sql.push("-- Persona is not robot.");
sql.push("-- Do not use model_code.");
sql.push("-- Prefer derived view from:");
sql.push("-- - personaos.persona_parameter_value");
sql.push("-- - personaos.growth_axis");
sql.push("-- - personaos.growth_core_state");
sql.push("-- - personaos.memory_state");
sql.push("-- If runtime performance requires caching, create personaos.persona_task_profile_snapshot as cache, not canonical truth.");

fs.writeFileSync(sqlPath, sql.join("\n") + "\n");

const decisions = [];
decisions.push({
  area: "task_domain_catalog",
  result: domainOkCount > 0 ? "column_exact_insert_proposal_generated" : "manual_review_required",
  detail: "generated=" + domainOkCount + ", manual=" + domainManualCount
});
decisions.push({
  area: "aiworker_worker_profile",
  result: "use_existing_tables_first",
  detail: "worker_domain_proficiency / worker_role_proficiency / robot_model_capability_profile / robot_brain policies"
});
decisions.push({
  area: "personaos_profile",
  result: "derive_from_parameters_growth_memory",
  detail: "persona_parameter_value / growth_axis / growth_core_state / memory_state"
});
decisions.push({
  area: "military_security",
  result: "safe_domains_separated",
  detail: "HD-R2系は通常仕事と分離し、現実危害実行支援は禁止"
});

const md = [];
md.push("# B6R96R1E Column Exact SQL Proposal Decision");
md.push("");
md.push("## 1. Task domain proposal");
md.push("- table: aiworker.business_support_task_domain");
md.push("- generated insert proposals: " + domainOkCount);
md.push("- manual review required: " + domainManualCount);
md.push("");
md.push("## 2. AIWorkerOS");
md.push("- 既存table優先。worker_domain_proficiency / worker_role_proficiency / robot_model_capability_profile / robot_brain_* を使う。");
md.push("- 巨大なrobot_worker_task_profile新設はまだしない。");
md.push("- worker_domain_proficiencyがworker_id専用なら、model/domain overlayの小tableを検討する。");
md.push("");
md.push("## 3. PersonaOS");
md.push("- Personaはロボットではない。model_codeを使わない。");
md.push("- persona_parameter_value / growth_axis / memory_stateからderived viewで仕事適性を算出する。");
md.push("- snapshotが必要な場合だけcache tableを検討する。");
md.push("");
md.push("## 4. Military / security");
md.push("- HD-R2系向けに軍事/警備/危機対応系task domainを分離する。");
md.push("- 現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援は禁止。");
md.push("- 防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理は可。");
md.push("");
md.push("## 5. Decisions");
for (const d of decisions) {
  md.push("- " + d.area + ": " + d.result + " / " + d.detail);
}
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
