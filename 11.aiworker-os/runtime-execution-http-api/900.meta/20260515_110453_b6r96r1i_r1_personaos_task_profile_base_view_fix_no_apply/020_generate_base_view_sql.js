const fs = require("fs");

const dumpPath = process.argv[2];
const designPath = process.argv[3];
const viewSqlPath = process.argv[4];
const satoPath = process.argv[5];

const records = fs.readFileSync(dumpPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"))
  .map((line) => JSON.parse(line));

function rec(type) {
  return records.find((r) => r.record_type === type) || {};
}

const schemaCheck = rec("schema_check");
const taskDomains = rec("task_domains").rows || [];
const personaTables = rec("personaos_parameter_tables").rows || [];
const personaColumns = rec("personaos_parameter_columns").rows || [];
const existingObjects = rec("existing_personaos_task_profile_objects").rows || [];

function q(v) {
  return "'" + String(v).replace(/'/g, "''") + "'";
}

const defaultTaskRows = [
  ["programming", "プログラム作成", "logic", "precision", "implementation_focus", "normal_work_profile", 1010],
  ["db_analysis", "DB調査", "analysis", "precision", "schema_focus", "normal_work_profile", 1020],
  ["document_writing", "文書作成", "language", "orderliness", "explanation_focus", "normal_work_profile", 1030],
  ["research", "調査", "curiosity", "analysis", "source_comparison_focus", "normal_work_profile", 1040],
  ["historical_reference", "歴史資料作成", "memory", "contextualization", "timeline_focus", "normal_work_profile", 1050],
  ["ui_ux", "UI/UX作成", "sense", "empathy", "usability_focus", "normal_work_profile", 1060],
  ["data_formatting", "データ整形", "orderliness", "precision", "normalization_focus", "normal_work_profile", 1070],
  ["review_audit", "レビュー/監査", "critical_thinking", "precision", "risk_detection_focus", "normal_work_profile", 1080],
  ["customer_communication", "接客/コミュニケーション", "empathy", "language", "dialog_focus", "normal_work_profile", 1090],
  ["creative_planning", "企画/提案", "creativity", "curiosity", "idea_focus", "normal_work_profile", 1100],
  ["operations_execution", "運用作業", "stability", "orderliness", "execution_focus", "normal_work_profile", 1110],
  ["cx_reference_authoring", "CX参照データ作成", "knowledge_structuring", "precision", "reference_authoring_focus", "normal_work_profile", 1120],
  ["security_crisis_response", "警備/危機対応", "risk_awareness", "stability", "safety_response_focus", "restricted_safe_fiction_defense_lore_only", 2010],
  ["fictional_combat_design", "フィクション戦闘設計", "fictional_strategy", "creativity", "fictional_combat_focus", "restricted_safe_fiction_defense_lore_only", 2020],
  ["game_tactical_balance", "ゲーム戦術/バランス", "game_balance", "analysis", "game_balance_focus", "restricted_safe_fiction_defense_lore_only", 2030],
  ["defense_planning_non_harmful", "防衛計画/非加害設計", "protective_planning", "risk_awareness", "protective_design_focus", "restricted_safe_fiction_defense_lore_only", 2040],
  ["threat_modeling_safe", "安全な脅威モデリング", "risk_modeling", "critical_thinking", "safe_threat_modeling_focus", "restricted_safe_fiction_defense_lore_only", 2050],
  ["combat_lore_reference", "戦闘/軍事ロア参照", "lore_memory", "memory", "lore_reference_focus", "restricted_safe_fiction_defense_lore_only", 2060]
];

const activeCodes = new Set(
  taskDomains
    .map((r) => r.task_domain_code || r.domain_code || r.code)
    .filter(Boolean)
);

const rows = defaultTaskRows.filter(([code]) => activeCodes.has(code) || activeCodes.size === 0);

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1I_R1 PersonaOS Task Profile Base Views");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- Scope:");
sql.push("-- - Create base views only.");
sql.push("-- - Do not join Persona value tables yet.");
sql.push("-- - This avoids pretending an exact persona parameter source exists.");
sql.push("-- - PersonaOS remains parameter-only; AIWorkerOS remains owner of robot execution/performance.");
sql.push("");

sql.push("create or replace view personaos.vw_persona_task_domain_mapping_v1 as");
sql.push("select * from (");
sql.push(rows.map(([code, label, primary, secondary, profile, safety, sort]) => {
  return [
    "  select",
    `    ${q(code)}::text as task_domain_code,`,
    `    ${q(label)}::text as task_domain_label_ja,`,
    `    ${q(primary)}::text as primary_persona_parameter_key,`,
    `    ${q(secondary)}::text as secondary_persona_parameter_key,`,
    `    ${q(profile)}::text as persona_task_profile_code,`,
    `    ${q(safety)}::text as safety_profile_code,`,
    `    ${sort}::integer as sort_order`
  ].join("\n");
}).join("\n  union all\n"));
sql.push(") m;");
sql.push("");

sql.push("create or replace view personaos.vw_persona_task_profile_required_parameter_v1 as");
sql.push("select * from (");
const paramSet = new Map();
for (const [, , primary, secondary, , safety] of rows) {
  paramSet.set(primary, safety);
  paramSet.set(secondary, safety);
}
const paramRows = Array.from(paramSet.entries()).sort((a, b) => a[0].localeCompare(b[0]));
sql.push(paramRows.map(([key, safety], idx) => {
  return [
    "  select",
    `    ${q(key)}::text as persona_parameter_key,`,
    `    ${q(labelForParameter(key))}::text as parameter_label_ja,`,
    "    'numeric_0_100'::text as expected_value_type_code,",
    `    ${q(safety)}::text as related_safety_profile_code,`,
    `    ${(idx + 1) * 10}::integer as sort_order`
  ].join("\n");
}).join("\n  union all\n"));
sql.push(") p;");
sql.push("");

sql.push("create or replace view personaos.vw_persona_task_profile_responsibility_note_v1 as");
sql.push("select");
sql.push("  'personaos_parameter_only'::text as responsibility_code,");
sql.push("  'PersonaOSはPersonaの性格・状態・成長・記憶・パラメータから仕事傾向を派生表示する。ロボット性能計算、契約判定、CX参照権限、成果物生成はAIWorkerOS側の責務。'::text as responsibility_note_ja,");
sql.push("  'Military/security-like task domains in PersonaOS are only tendency labels and do not authorize real-world harm execution support.'::text as safety_boundary_note;");
sql.push("");

function labelForParameter(key) {
  const map = {
    logic: "論理性",
    precision: "精密性",
    implementation_focus: "実装集中",
    analysis: "分析力",
    schema_focus: "構造把握",
    language: "言語化",
    orderliness: "整理力",
    explanation_focus: "説明志向",
    curiosity: "探究心",
    source_comparison_focus: "資料比較",
    memory: "記憶/文脈保持",
    contextualization: "背景理解",
    timeline_focus: "時系列整理",
    sense: "感性",
    empathy: "共感性",
    usability_focus: "使いやすさ志向",
    normalization_focus: "正規化志向",
    critical_thinking: "批判的確認",
    risk_detection_focus: "リスク検出",
    dialog_focus: "対話志向",
    creativity: "創造性",
    idea_focus: "企画発想",
    stability: "安定性",
    execution_focus: "実行志向",
    knowledge_structuring: "知識構造化",
    reference_authoring_focus: "参照資料化",
    risk_awareness: "危機察知",
    safety_response_focus: "安全対応",
    fictional_strategy: "架空戦略構成",
    fictional_combat_focus: "フィクション戦闘構成",
    game_balance: "ゲームバランス感覚",
    game_balance_focus: "ゲーム均衡志向",
    protective_planning: "保護設計",
    protective_design_focus: "非加害防御設計",
    risk_modeling: "脅威整理",
    safe_threat_modeling_focus: "安全な脅威モデリング",
    lore_memory: "ロア記憶",
    lore_reference_focus: "ロア参照"
  };
  return map[key] || key;
}

fs.writeFileSync(viewSqlPath, sql.join("\n"));

const design = [];
design.push("# B6R96R1I_R1 PersonaOS Task Profile Base View Design");
design.push("");
design.push("## 1. 結論");
design.push("");
design.push("前回のWARNは、既存PersonaOS tableから `persona_id / parameter_key / numeric value` を安全に一意特定できなかったことが原因。");
design.push("そのため、R1では実データjoinを作らず、まずapply可能な基盤ビューだけに分ける。");
design.push("");
design.push("## 2. 今回作る基盤");
design.push("");
design.push("| view | 目的 |");
design.push("|---|---|");
design.push("| personaos.vw_persona_task_domain_mapping_v1 | task_domain と Persona parameter key の対応表 |");
design.push("| personaos.vw_persona_task_profile_required_parameter_v1 | PersonaOS側で必要になるparameter一覧 |");
design.push("| personaos.vw_persona_task_profile_responsibility_note_v1 | PersonaOSとAIWorkerOSの責務境界 |");
design.push("");
design.push("## 3. 作らないもの");
design.push("");
design.push("- Persona実データとのjoin view");
design.push("- ロボット性能計算");
design.push("- ロボット契約判定");
design.push("- AIWorkerOSのworker/robot table");
design.push("- CX参照権限制御");
design.push("");
design.push("## 4. 理由");
design.push("");
design.push("Personaはロボットではないため、AIWorkerOSのworker profileをそのまま移植しない。");
design.push("PersonaOSでは、性格・状態・記憶・成長・パラメータから、仕事傾向を派生表示するだけにする。");
design.push("");
design.push("## 5. 軍事/警備系domain");
design.push("");
design.push("以下はPersonaOSでは安全境界付きの傾向表示だけ。現実の危害実行支援を許可しない。");
design.push("");
design.push("- security_crisis_response");
design.push("- fictional_combat_design");
design.push("- game_tactical_balance");
design.push("- defense_planning_non_harmful");
design.push("- threat_modeling_safe");
design.push("- combat_lore_reference");
design.push("");
design.push("## 6. Existing evidence");
design.push("");
design.push("### PersonaOS tables");
design.push("```json");
design.push(JSON.stringify(personaTables, null, 2));
design.push("```");
design.push("");
design.push("### Existing task/profile-like objects");
design.push("```json");
design.push(JSON.stringify(existingObjects, null, 2));
design.push("```");
design.push("");
design.push("## 7. Next");
design.push("");
design.push("1. R1 SQL案レビュー");
design.push("2. 明示GO後に base views apply");
design.push("3. PersonaOSの正本parameter table/columnを決める");
design.push("4. その後、実データjoin版 `vw_persona_derived_task_profile_v1` を別工程で作る");
fs.writeFileSync(designPath, design.join("\n"));

const sato = [];
sato.push("# B6R96R1I_R1 佐藤レビュー依頼");
sato.push("");
sato.push("## レビュー対象");
sato.push("");
sato.push("- PersonaOS task profile base views");
sato.push("- SQLは未適用");
sato.push("");
sato.push("## 今回の判断");
sato.push("");
sato.push("前回の `MANUAL_REVIEW_REQUIRED` は、Persona実データjoinに必要な列を安全に特定できなかったため。");
sato.push("R1では実データjoinを削り、mapping / required parameter / responsibility note のみをapply候補とする。");
sato.push("");
sato.push("## 佐藤確認事項");
sato.push("");
sato.push("1. PersonaOSに base view 3本を作ってよいか");
sato.push("2. `task_domain_code` をAIWorkerOSと共通カテゴリとして使ってよいか");
sato.push("3. PersonaOSでは性能ではなく `task tendency / affinity` に限定する方針でよいか");
sato.push("4. 軍事/警備系domainを安全境界付き傾向表示に限定する方針でよいか");
sato.push("5. 実データjoin版は別工程に分ける方針でよいか");
sato.push("");
sato.push("## まだ実行しないこと");
sato.push("");
sato.push("- DB apply");
sato.push("- create view");
sato.push("- insert/update/delete");
sato.push("- API POST");
sato.push("- git push");
fs.writeFileSync(satoPath, sato.join("\n"));
