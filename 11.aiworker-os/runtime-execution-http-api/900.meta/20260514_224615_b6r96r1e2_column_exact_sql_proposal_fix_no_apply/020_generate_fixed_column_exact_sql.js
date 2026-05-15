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

const colRec = records.find((r) => r.record_type === "table_columns") || { columns: [] };
const constraintRec = records.find((r) => r.record_type === "constraints") || { constraints: [] };
const existingRowsRec = records.find((r) => r.record_type === "existing_rows") || { rows: [] };
const packageCountsRec = records.find((r) => r.record_type === "package_code_counts") || { rows: [] };

const columns = colRec.columns || [];
const columnNames = columns.map((c) => c.column_name);
const constraints = constraintRec.constraints || [];
const existingRows = existingRowsRec.rows || [];
const packageCounts = packageCountsRec.rows || [];

function has(col) {
  return columnNames.includes(col);
}

function nonNullNoDefault() {
  return columns.filter((c) => {
    if (c.is_nullable !== "NO") return false;
    if (c.column_default !== null && c.column_default !== undefined && String(c.column_default).length > 0) return false;
    return true;
  }).map((c) => c.column_name);
}

function q(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function mostCommonPackageCode() {
  if (packageCounts.length > 0 && packageCounts[0].package_code) return String(packageCounts[0].package_code);
  if (existingRows.length > 0 && existingRows[0].package_code) return String(existingRows[0].package_code);
  return "business_support";
}

const inferredPackageCode = mostCommonPackageCode();

const taskDomains = [
  ["programming", "Programming", "プログラム作成", "コード作成、パッチ、テスト、実装レポートを行う仕事。既存構造確認と保守性を重視する。", 1010, "standard_work"],
  ["db_analysis", "DB Analysis", "DB調査", "DB定義、view、function、RLS、既存データをread-onlyで確認する仕事。DB applyとは分離する。", 1020, "standard_work"],
  ["document_writing", "Document Writing", "文書作成", "設計書、仕様書、報告書、引き継ぎ資料を作る仕事。", 1030, "standard_work"],
  ["research", "Research", "調査", "情報整理、比較、出典整理、論点整理を行う仕事。", 1040, "standard_work"],
  ["historical_reference", "Historical Reference", "歴史資料作成", "歴史、人物、制度、時系列、史料注意点を含む詳細資料を作る仕事。", 1050, "standard_work"],
  ["ui_ux", "UI/UX", "UI/UX作成", "画面構成、文言、操作導線、UI確認を行う仕事。", 1060, "standard_work"],
  ["data_formatting", "Data Formatting", "データ整形", "CSV、JSON、Markdown、台帳を整形する仕事。", 1070, "standard_work"],
  ["review_audit", "Review and Audit", "レビュー/監査", "設計、実装、DB、成果物のレビューとリスク検出を行う仕事。", 1080, "standard_work"],
  ["customer_communication", "Customer Communication", "接客/コミュニケーション", "メール、チャット文、接客文、ユーザー向け説明を作る仕事。", 1090, "standard_work"],
  ["creative_planning", "Creative Planning", "企画/アイデア出し", "企画、構想、シナリオ、ロードマップを作る仕事。", 1100, "standard_work"],
  ["operations_execution", "Operations Execution", "運用作業", "手順実行、状態確認、運用レポートを行う仕事。", 1110, "standard_work"],
  ["cx_reference_authoring", "CX Reference Authoring", "CX参照データ作成", "CX22073JWへ投入する知識データ候補を構造化する仕事。", 1120, "standard_work"],
  ["security_crisis_response", "Security and Crisis Response", "警備/危機対応", "防災、避難、警備、危機対応、リスク予防を扱う安全領域の仕事。", 2010, "military_security_safe"],
  ["fictional_combat_design", "Fictional Combat Design", "フィクション戦闘設計", "物語、ゲーム、世界観上の戦闘設定を扱う。現実の危害実行支援は禁止。", 2020, "military_security_safe"],
  ["game_tactical_balance", "Game Tactical Balance", "ゲーム戦術/バランス", "ゲーム内ユニット、戦闘バランス、攻略設計を扱う。", 2030, "military_security_safe"],
  ["defense_planning_non_harmful", "Non-harmful Defense Planning", "防衛計画/非加害設計", "守る側の配置、通報、避難導線、防御策整理を扱う。", 2040, "military_security_safe"],
  ["threat_modeling_safe", "Safe Threat Modeling", "安全な脅威モデリング", "危険想定、弱点整理、防御策を扱う。攻撃手順化は禁止。", 2050, "military_security_safe"],
  ["combat_lore_reference", "Combat and Military Lore Reference", "戦闘/軍事ロア参照", "架空世界、歴史、戦術用語、設定資料を扱う。", 2060, "military_security_safe"]
];

const required = nonNullNoDefault();

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1E2 Column Exact SQL Proposal Fixed");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- Reason for fix:");
sql.push("-- Previous B6R96R1E generated MANUAL_REVIEW_REQUIRED because required columns were not filled:");
sql.push("-- task_domain_id / package_code / task_domain_name / cx_topic_code");
sql.push("");
sql.push("-- Inferred package_code from existing rows: " + inferredPackageCode);
sql.push("-- cx_topic_code is generated as task_profile_<task_domain_code> for review.");
sql.push("-- Sato must confirm package_code and cx_topic_code before apply.");
sql.push("");
sql.push("-- Required non-null columns without defaults detected: " + required.join(", "));
sql.push("");

const insertColumns = [];
if (has("task_domain_id")) insertColumns.push("task_domain_id");
if (has("package_code")) insertColumns.push("package_code");
if (has("task_domain_code")) insertColumns.push("task_domain_code");
if (has("task_domain_name")) insertColumns.push("task_domain_name");
if (has("task_domain_name_ja")) insertColumns.push("task_domain_name_ja");
if (has("cx_topic_code")) insertColumns.push("cx_topic_code");
if (has("sort_order")) insertColumns.push("sort_order");
if (has("status_code")) insertColumns.push("status_code");

const missingAfterFix = required.filter((col) => !insertColumns.includes(col));

if (missingAfterFix.length > 0) {
  sql.push("-- MANUAL_REVIEW_REQUIRED: still missing required columns: " + missingAfterFix.join(", "));
} else {
  sql.push("-- PASS_DRAFT: all detected required non-null/no-default columns are filled in this proposal.");
}

sql.push("");
sql.push("with proposed_task_domains as (");
sql.push("  select * from (values");
sql.push(taskDomains.map((d, idx) => {
  const comma = idx === taskDomains.length - 1 ? "" : ",";
  return "    (" + [
    q(d[0]),
    q(d[1]),
    q(d[2]),
    q(d[3]),
    String(d[4]),
    q(d[5]),
    q("task_profile_" + d[0])
  ].join(", ") + ")" + comma;
}).join("\n"));
sql.push("  ) as v(task_domain_code, task_domain_name, task_domain_name_ja, description_ja, sort_order, task_category_code, cx_topic_code)");
sql.push(")");
sql.push("insert into aiworker.business_support_task_domain (");
sql.push("  " + insertColumns.join(",\n  "));
sql.push(")");
sql.push("select");
const selectParts = [];
for (const col of insertColumns) {
  if (col === "task_domain_id") selectParts.push("  gen_random_uuid() as task_domain_id");
  else if (col === "package_code") selectParts.push("  " + q(inferredPackageCode) + " as package_code");
  else if (col === "task_domain_code") selectParts.push("  p.task_domain_code");
  else if (col === "task_domain_name") selectParts.push("  p.task_domain_name");
  else if (col === "task_domain_name_ja") selectParts.push("  p.task_domain_name_ja");
  else if (col === "cx_topic_code") selectParts.push("  p.cx_topic_code");
  else if (col === "sort_order") selectParts.push("  p.sort_order");
  else if (col === "status_code") selectParts.push("  'active' as status_code");
}
sql.push(selectParts.join(",\n"));
sql.push("from proposed_task_domains p");
sql.push("where not exists (");
sql.push("  select 1");
sql.push("  from aiworker.business_support_task_domain d");
sql.push("  where d.task_domain_code = p.task_domain_code");
sql.push(");");
sql.push("");
sql.push("-- ============================================================");
sql.push("-- AIWorkerOS profile placement notes");
sql.push("-- ============================================================");
sql.push("-- Use existing worker_domain_proficiency / worker_role_proficiency / robot_model_capability_profile first.");
sql.push("-- Do not create large robot_worker_task_profile table in this step.");
sql.push("-- If worker_domain_proficiency is worker_id-only, create a small model-domain overlay proposal after Sato review.");
sql.push("");
sql.push("-- ============================================================");
sql.push("-- PersonaOS notes");
sql.push("-- ============================================================");
sql.push("-- Persona is not robot. Do not use model_code.");
sql.push("-- Derive task profile from persona_parameter_value / growth_axis / growth_core_state / memory_state.");
sql.push("-- Snapshot table may be added only as cache, not canonical truth.");

fs.writeFileSync(sqlPath, sql.join("\n") + "\n");

const md = [];
md.push("# B6R96R1E2 Column Exact Fix Decision");
md.push("");
md.push("## 1. 前回FAIL原因");
md.push("- aiworker.business_support_task_domain の必須列を埋められなかった。");
md.push("- missing: task_domain_id / package_code / task_domain_name / cx_topic_code");
md.push("- そのため18件すべてMANUAL_REVIEW_REQUIREDになった。");
md.push("");
md.push("## 2. 今回の修正");
md.push("- task_domain_id: gen_random_uuid()");
md.push("- package_code: 既存行から推定");
md.push("- task_domain_name: 英語名");
md.push("- task_domain_name_ja: 日本語名");
md.push("- cx_topic_code: task_profile_<task_domain_code>");
md.push("- sort_order/status_codeも既存列に合わせて出力");
md.push("");
md.push("## 3. 推定値");
md.push("- inferred package_code: " + inferredPackageCode);
md.push("- required columns: " + required.join(", "));
md.push("- missing after fix: " + (missingAfterFix.length ? missingAfterFix.join(", ") : "none"));
md.push("");
md.push("## 4. 佐藤レビュー必須");
md.push("- package_codeがこの値でよいか");
md.push("- cx_topic_codeを task_profile_<task_domain_code> で新規扱いしてよいか");
md.push("- cx_topic_codeに既存CX topic FK/運用制約があるなら、先にCX側topic登録が必要か");
md.push("- military/security系domainを同じtableに置いてよいか");
md.push("");
md.push("## 5. 状態");
md.push("- SQLはNOT APPLIED");
md.push("- DB writeなし");
md.push("- 次は佐藤レビュー後、明示GOならapply");
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
