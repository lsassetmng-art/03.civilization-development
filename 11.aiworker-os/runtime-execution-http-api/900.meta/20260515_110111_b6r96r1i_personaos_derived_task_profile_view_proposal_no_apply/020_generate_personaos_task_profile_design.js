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

const personaTables = (rec("personaos_tables").rows || []);
const personaColumns = (rec("personaos_columns").rows || []);
const taskDomains = (rec("aiworker_task_domain_rows").rows || []);
const existingViews = (rec("persona_existing_task_profile_views").rows || []);

function hasTable(tableName) {
  return personaTables.some((t) => t.table_name === tableName) || personaColumns.some((c) => c.table_name === tableName);
}

function columnsOf(tableName) {
  return personaColumns.filter((c) => c.table_name === tableName).map((c) => c.column_name);
}

function hasCol(tableName, col) {
  return columnsOf(tableName).includes(col);
}

function qi(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}

function q(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

const preferredPersonaSource =
  hasTable("persona_parameter_value") ? "persona_parameter_value" :
  hasTable("persona_parameter_state") ? "persona_parameter_state" :
  hasTable("persona_growth_state") ? "persona_growth_state" :
  hasTable("growth_core_state") ? "growth_core_state" :
  hasTable("personas") ? "personas" :
  null;

const personaIdCol =
  preferredPersonaSource && hasCol(preferredPersonaSource, "persona_id") ? "persona_id" :
  preferredPersonaSource && hasCol(preferredPersonaSource, "id") ? "id" :
  null;

const userIdCol =
  preferredPersonaSource && hasCol(preferredPersonaSource, "user_id") ? "user_id" :
  null;

const valueCandidateCols = ["value", "parameter_value", "current_value", "score", "numeric_value", "state_value"];
const valueCol = preferredPersonaSource
  ? valueCandidateCols.find((c) => hasCol(preferredPersonaSource, c))
  : null;

const axisCandidateCols = ["parameter_code", "parameter_key", "axis_key", "axis_code", "dimension_code", "trait_code"];
const axisCol = preferredPersonaSource
  ? axisCandidateCols.find((c) => hasCol(preferredPersonaSource, c))
  : null;

const taskDomainCodes = taskDomains
  .map((d) => d.task_domain_code || d.domain_code || d.code)
  .filter(Boolean)
  .sort();

const normalDomains = [
  "programming",
  "db_analysis",
  "document_writing",
  "research",
  "historical_reference",
  "ui_ux",
  "data_formatting",
  "review_audit",
  "customer_communication",
  "creative_planning",
  "operations_execution",
  "cx_reference_authoring"
];

const restrictedDomains = [
  "security_crisis_response",
  "fictional_combat_design",
  "game_tactical_balance",
  "defense_planning_non_harmful",
  "threat_modeling_safe",
  "combat_lore_reference"
];

const parameterMappings = [
  ["programming", "logic", "論理性・手順化・実装継続力"],
  ["programming", "precision", "構文・実装ミス抑制"],
  ["db_analysis", "analysis", "構造把握・関係整理"],
  ["document_writing", "language", "文章化・説明力"],
  ["research", "curiosity", "調査継続・比較"],
  ["historical_reference", "memory", "時系列・背景保持"],
  ["ui_ux", "sense", "見た目・使いやすさ判断"],
  ["data_formatting", "orderliness", "整理・正規化"],
  ["review_audit", "critical_thinking", "レビュー・矛盾検出"],
  ["customer_communication", "empathy", "対話・相手理解"],
  ["creative_planning", "creativity", "企画・発想"],
  ["operations_execution", "stability", "安定実行"],
  ["cx_reference_authoring", "knowledge_structuring", "参照データ構造化"],
  ["security_crisis_response", "risk_awareness", "危機察知・安全優先"],
  ["fictional_combat_design", "fictional_strategy", "フィクション戦闘構成"],
  ["game_tactical_balance", "game_balance", "ゲーム上の戦術均衡"],
  ["defense_planning_non_harmful", "protective_planning", "防御・非加害設計"],
  ["threat_modeling_safe", "risk_modeling", "安全な脅威整理"],
  ["combat_lore_reference", "lore_memory", "戦闘/軍事ロア記憶"]
];

const canCreateValueBasedView = Boolean(preferredPersonaSource && personaIdCol && valueCol && axisCol);

const sql = [];
sql.push("-- ============================================================");
sql.push("-- B6R96R1I PersonaOS Derived Task Profile View Proposal");
sql.push("-- STATUS: NOT APPLIED");
sql.push("-- DB_WRITE_PERFORMED=NO");
sql.push("-- SQL_APPLY_PERFORMED=NO");
sql.push("-- Reviewer: 佐藤(DB担当)");
sql.push("-- ============================================================");
sql.push("");
sql.push("-- Purpose:");
sql.push("-- - Reuse AIWorkerOS task_domain as shared task categories.");
sql.push("-- - PersonaOS does NOT become robot/AIWorker.");
sql.push("-- - PersonaOS derives task tendency as parameter-only profile from Persona parameters/growth/memory.");
sql.push("-- - No robot contract, robot role, worker_master, or aiworker employee table is created.");
sql.push("");
sql.push("-- Safety:");
sql.push("-- - Restricted military/security domains are parameter tendencies only.");
sql.push("-- - They do not permit real-world harm execution support.");
sql.push("-- - Runtime execution/robot capability remains AIWorkerOS responsibility.");
sql.push("");

sql.push("-- ------------------------------------------------------------");
sql.push("-- 1. Persona task domain mapping catalog view");
sql.push("-- ------------------------------------------------------------");
sql.push("create or replace view personaos.vw_persona_task_domain_mapping_proposal_v1 as");
sql.push("select * from (");
sql.push(parameterMappings.map(([domain, param, note]) => {
  const safety = restrictedDomains.includes(domain)
    ? "restricted_safe_fiction_defense_lore_only"
    : "normal_work_profile";
  return [
    "  select",
    `    ${q(domain)}::text as task_domain_code,`,
    `    ${q(param)}::text as persona_parameter_key,`,
    `    ${q(note)}::text as parameter_meaning_ja,`,
    `    ${q(safety)}::text as safety_profile_code`
  ].join("\n");
}).join("\n  union all\n"));
sql.push(") m;");
sql.push("");

if (canCreateValueBasedView) {
  const tableRef = `personaos.${qi(preferredPersonaSource)}`;
  const selectUser = userIdCol ? `p.${qi(userIdCol)} as user_id,` : `null::uuid as user_id,`;

  sql.push("-- ------------------------------------------------------------");
  sql.push("-- 2. Persona derived task profile view");
  sql.push("-- ------------------------------------------------------------");
  sql.push("create or replace view personaos.vw_persona_derived_task_profile_v1 as");
  sql.push("with mapped as (");
  sql.push("  select");
  sql.push(`    p.${qi(personaIdCol)} as persona_id,`);
  sql.push(`    ${selectUser}`);
  sql.push("    m.task_domain_code,");
  sql.push("    m.persona_parameter_key,");
  sql.push(`    p.${qi(valueCol)}::numeric as raw_parameter_value,`);
  sql.push("    greatest(0, least(100, coalesce(p." + qi(valueCol) + "::numeric, 0))) as normalized_task_affinity_score,");
  sql.push("    m.safety_profile_code,");
  sql.push("    m.parameter_meaning_ja");
  sql.push(`  from ${tableRef} p`);
  sql.push("  join personaos.vw_persona_task_domain_mapping_proposal_v1 m");
  sql.push(`    on p.${qi(axisCol)}::text = m.persona_parameter_key`);
  sql.push(")");
  sql.push("select");
  sql.push("  persona_id,");
  sql.push("  user_id,");
  sql.push("  task_domain_code,");
  sql.push("  round(avg(normalized_task_affinity_score), 2) as task_affinity_score,");
  sql.push("  case");
  sql.push("    when avg(normalized_task_affinity_score) >= 80 then 'high'");
  sql.push("    when avg(normalized_task_affinity_score) >= 50 then 'medium'");
  sql.push("    else 'low'");
  sql.push("  end as task_affinity_level_code,");
  sql.push("  safety_profile_code,");
  sql.push("  jsonb_agg(jsonb_build_object(");
  sql.push("    'persona_parameter_key', persona_parameter_key,");
  sql.push("    'raw_parameter_value', raw_parameter_value,");
  sql.push("    'parameter_meaning_ja', parameter_meaning_ja");
  sql.push("  ) order by persona_parameter_key) as basis_jsonb,");
  sql.push("  now() as generated_at");
  sql.push("from mapped");
  sql.push("group by persona_id, user_id, task_domain_code, safety_profile_code;");
  sql.push("");
} else {
  sql.push("-- ------------------------------------------------------------");
  sql.push("-- 2. Persona derived task profile view");
  sql.push("-- ------------------------------------------------------------");
  sql.push("-- MANUAL_REVIEW_REQUIRED:");
  sql.push("-- Could not generate value-based view because required columns were not all found.");
  sql.push("-- Required: persona_id column, parameter/axis column, numeric value column.");
  sql.push(`-- selected_source_table=${preferredPersonaSource || "none"}`);
  sql.push(`-- persona_id_col=${personaIdCol || "none"}`);
  sql.push(`-- axis_col=${axisCol || "none"}`);
  sql.push(`-- value_col=${valueCol || "none"}`);
  sql.push("");
}

sql.push("-- ------------------------------------------------------------");
sql.push("-- 3. Responsibility note view");
sql.push("-- ------------------------------------------------------------");
sql.push("create or replace view personaos.vw_persona_task_profile_responsibility_note_v1 as");
sql.push("select");
sql.push("  'personaos_parameter_only'::text as responsibility_code,");
sql.push("  'PersonaOSはPersonaの性格・成長・記憶・状態から仕事傾向を派生表示するだけで、AIWorkerOSのロボット性能計算や契約判定は持たない。'::text as responsibility_note_ja,");
sql.push("  'AIWorkerOS remains owner of robot execution, robot entitlement, model capability, CX brain access, and deliverable generation.'::text as aiworker_boundary_note;");
sql.push("");

fs.writeFileSync(viewSqlPath, sql.join("\n") + "\n");

const design = [];
design.push("# B6R96R1I PersonaOS Derived Task Profile Design");
design.push("");
design.push("## 1. 結論");
design.push("");
design.push("AIWorkerOSで追加した `task_domain` は、PersonaOSでも共通カテゴリとして参照してよい。");
design.push("ただしPersonaはロボットではないため、PersonaOS側では「性能」ではなく「パラメータから派生した得意傾向」として扱う。");
design.push("");
design.push("## 2. 責務分離");
design.push("");
design.push("| 領域 | 責務 |");
design.push("|---|---|");
design.push("| AIWorkerOS | ロボット契約、ロボット性能計算、role/model/series、CX参照、成果物生成 |");
design.push("| PersonaOS | Personaの性格、状態、成長、記憶、パラメータからの傾向表示 |");
design.push("| AICM/AIOperationDesk | 依頼入口、作業分類、権限/実行文脈 |");
design.push("| CX22073JW | brain/reference data。実行主体ではない |");
design.push("");
design.push("## 3. PersonaOS側で持つもの");
design.push("");
design.push("| 項目 | 内容 |");
design.push("|---|---|");
design.push("| task_domain_code | AIWorkerOSと共通の仕事内容カテゴリ |");
design.push("| persona_parameter_key | PersonaOS側のパラメータキー |");
design.push("| task_affinity_score | Personaの現在値から派生した得意傾向スコア |");
design.push("| task_affinity_level_code | high / medium / low |");
design.push("| basis_jsonb | どのパラメータが根拠になったか |");
design.push("");
design.push("## 4. 禁止する混同");
design.push("");
design.push("- PersonaOSにロボット契約判定を持たせない");
design.push("- PersonaOSにAIWorkerOSのworker実行権限を持たせない");
design.push("- Personaをrobot/worker_master/employee扱いしない");
design.push("- 軍事/警備domainの傾向表示を現実の危害支援許可にしない");
design.push("");
design.push("## 5. 既存構造からの生成判断");
design.push("");
design.push(`- selected_persona_source_table: ${preferredPersonaSource || "none"}`);
design.push(`- persona_id_col: ${personaIdCol || "none"}`);
design.push(`- user_id_col: ${userIdCol || "none"}`);
design.push(`- axis_col: ${axisCol || "none"}`);
design.push(`- value_col: ${valueCol || "none"}`);
design.push(`- can_create_value_based_view: ${canCreateValueBasedView}`);
design.push("");
design.push("## 6. task_domain count");
design.push("");
design.push(`- task_domain rows from AIWorkerOS: ${taskDomainCodes.length}`);
design.push("");
design.push("## 7. existing PersonaOS task/profile-like views");
design.push("");
design.push("```json");
design.push(JSON.stringify(existingViews, null, 2));
design.push("```");
design.push("");
design.push("## 8. 次工程");
design.push("");
design.push("1. 佐藤レビュー");
design.push("2. SQL案の column exact 確認");
design.push("3. 明示GO後に view apply");
design.push("4. AIOperationDesk開発時に API制御/契約判定と接続");
fs.writeFileSync(designPath, design.join("\n") + "\n");

const sato = [];
sato.push("# B6R96R1I 佐藤レビュー依頼");
sato.push("");
sato.push("## レビュー対象");
sato.push("");
sato.push("- PersonaOS derived task profile view proposal");
sato.push("- SQLは未適用");
sato.push("");
sato.push("## 佐藤確認事項");
sato.push("");
sato.push("1. PersonaOSでAIWorkerOSの `task_domain_code` を参照カテゴリとして使ってよいか");
sato.push("2. PersonaOS側はロボット性能ではなく、パラメータ由来の `task_affinity_score` として扱う設計でよいか");
sato.push("3. 選ばれたPersonaOS既存table/columnが正しいか");
sato.push("4. view名 `vw_persona_task_domain_mapping_proposal_v1` / `vw_persona_derived_task_profile_v1` でよいか");
sato.push("5. 軍事/警備系domainは safety_profile_code 付きの傾向表示に限定する方針でよいか");
sato.push("");
sato.push("## まだ実行しないこと");
sato.push("");
sato.push("- DB apply");
sato.push("- create view");
sato.push("- insert/update/delete");
sato.push("- API POST");
sato.push("- git push");
fs.writeFileSync(satoPath, sato.join("\n") + "\n");
