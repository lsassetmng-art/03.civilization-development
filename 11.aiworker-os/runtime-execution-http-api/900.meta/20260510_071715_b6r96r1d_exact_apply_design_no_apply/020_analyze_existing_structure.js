const fs = require("fs");

const inputPath = process.argv[2];
const jsonOutPath = process.argv[3];
const mdOutPath = process.argv[4];

const lines = fs.readFileSync(inputPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
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
const byTable = new Map(tableRecords.map((r) => [`${r.schema_name}.${r.table_name}`, r]));

function table(name) {
  return byTable.get(name) || { exists_flag: false, columns: [], constraints: [], indexes: [] };
}

function cols(name) {
  return (table(name).columns || []).map((c) => c.column_name);
}

function hasCols(name, required) {
  const set = new Set(cols(name));
  return required.every((c) => set.has(c));
}

function anyCols(name, candidates) {
  const set = new Set(cols(name));
  return candidates.filter((c) => set.has(c));
}

function exists(name) {
  return Boolean(table(name).exists_flag);
}

const analysis = {
  aiworker: {
    task_domain_table_exists: exists("aiworker.business_support_task_domain"),
    task_domain_columns: cols("aiworker.business_support_task_domain"),
    worker_domain_proficiency_exists: exists("aiworker.worker_domain_proficiency"),
    worker_domain_proficiency_columns: cols("aiworker.worker_domain_proficiency"),
    worker_role_proficiency_exists: exists("aiworker.worker_role_proficiency"),
    worker_role_proficiency_columns: cols("aiworker.worker_role_proficiency"),
    model_capability_candidates: {
      worker_model_capability_profile: exists("aiworker.worker_model_capability_profile"),
      robot_model_capability_profile: exists("aiworker.robot_model_capability_profile"),
      beyond_model_quality_profile: exists("aiworker.beyond_model_quality_profile"),
      megami_model_profile: exists("aiworker.megami_model_profile")
    },
    brain_policy_candidates: {
      robot_brain_model_domain_policy: exists("aiworker.robot_brain_model_domain_policy"),
      robot_brain_role_policy: exists("aiworker.robot_brain_role_policy"),
      robot_breadth_domain_runtime_policy: exists("aiworker.robot_breadth_domain_runtime_policy")
    }
  },
  personaos: {
    persona_parameter_state_exists: exists("personaos.persona_parameter_state"),
    persona_parameter_state_columns: cols("personaos.persona_parameter_state"),
    persona_parameter_value_exists: exists("personaos.persona_parameter_value"),
    persona_parameter_value_columns: cols("personaos.persona_parameter_value"),
    growth_axis_exists: exists("personaos.growth_axis"),
    growth_axis_columns: cols("personaos.growth_axis"),
    growth_core_state_exists: exists("personaos.growth_core_state"),
    growth_core_state_columns: cols("personaos.growth_core_state"),
    memory_state_exists: exists("personaos.memory_state"),
    memory_state_columns: cols("personaos.memory_state")
  }
};

const decisions = [];

if (analysis.aiworker.task_domain_table_exists) {
  decisions.push({
    area: "common_task_domain",
    decision: "use_existing_aiworker_business_support_task_domain_first",
    reason: "既にaiworker.business_support_task_domainが存在するため、仕事内容カテゴリは新規catalog乱立より既存domainへ追加する案を優先する。"
  });
} else {
  decisions.push({
    area: "common_task_domain",
    decision: "new_catalog_required",
    reason: "既存task/domain catalogが見つからないため、新catalogが必要。"
  });
}

if (analysis.aiworker.worker_domain_proficiency_exists) {
  decisions.push({
    area: "aiworker_worker_task_quality",
    decision: "use_existing_worker_domain_proficiency_first",
    reason: "worker_domain_proficiencyが存在するため、Worker仕事品質はdomain proficiencyとして統合する案を優先する。"
  });
} else {
  decisions.push({
    area: "aiworker_worker_task_quality",
    decision: "create_overlay_table",
    reason: "worker_domain_proficiencyが無いため、overlay tableが必要。"
  });
}

if (analysis.personaos.persona_parameter_value_exists && analysis.personaos.growth_axis_exists) {
  decisions.push({
    area: "personaos_task_profile",
    decision: "derive_from_persona_parameter_and_growth",
    reason: "persona_parameter_valueとgrowth_axisが存在するため、Personaは固定task profileではなく可変パラメータから算出するview/snapshot案を優先する。"
  });
} else {
  decisions.push({
    area: "personaos_task_profile",
    decision: "persona_parameter_support_table_required",
    reason: "Personaパラメータ基盤が不足しているため、追加tableが必要。"
  });
}

if (analysis.aiworker.brain_policy_candidates.robot_brain_model_domain_policy && analysis.aiworker.brain_policy_candidates.robot_brain_role_policy) {
  decisions.push({
    area: "cx_brain_access",
    decision: "use_existing_robot_brain_policy_tables",
    reason: "robot_brain_model_domain_policy / robot_brain_role_policyがあるため、CX参照制御は既存brain policyへ寄せる。"
  });
}

decisions.push({
  area: "military_security_profile",
  decision: "add_separated_safe_task_domains",
  reason: "HD-R2系は通常仕事ではなく、軍事/警備/危機対応/フィクション/ゲーム系の安全境界付きdomainとして分ける。"
});

const result = {
  generated_at: new Date().toISOString(),
  analysis,
  decisions,
  key_column_hits: {
    business_support_task_domain: anyCols("aiworker.business_support_task_domain", ["task_domain_code","domain_code","task_domain_name_ja","domain_label_ja","description_ja","active_flag","sort_order"]),
    worker_domain_proficiency: anyCols("aiworker.worker_domain_proficiency", ["worker_id","model_code","domain_code","task_domain_code","proficiency_score","quality_score","confidence_score","metadata_jsonb"]),
    worker_role_proficiency: anyCols("aiworker.worker_role_proficiency", ["worker_id","role_code","proficiency_score","metadata_jsonb"]),
    persona_parameter_value: anyCols("personaos.persona_parameter_value", ["persona_id","parameter_key","axis_key","value","numeric_value","metadata_jsonb"]),
    growth_axis: anyCols("personaos.growth_axis", ["axis_key","axis_name","min_value","max_value","decay_per_day","is_enabled"])
  }
};

fs.writeFileSync(jsonOutPath, JSON.stringify(result, null, 2));

const md = [];
md.push("# B6R96R1D 既存構造分析");
md.push("");
md.push("## 1. 判定");
for (const d of decisions) {
  md.push("");
  md.push(`### ${d.area}`);
  md.push(`- decision: ${d.decision}`);
  md.push(`- reason: ${d.reason}`);
}
md.push("");
md.push("## 2. AIWorkerOS候補");
md.push(`- business_support_task_domain exists: ${analysis.aiworker.task_domain_table_exists}`);
md.push(`- worker_domain_proficiency exists: ${analysis.aiworker.worker_domain_proficiency_exists}`);
md.push(`- worker_role_proficiency exists: ${analysis.aiworker.worker_role_proficiency_exists}`);
md.push(`- robot_model_capability_profile exists: ${analysis.aiworker.model_capability_candidates.robot_model_capability_profile}`);
md.push(`- worker_model_capability_profile exists: ${analysis.aiworker.model_capability_candidates.worker_model_capability_profile}`);
md.push(`- robot_brain_model_domain_policy exists: ${analysis.aiworker.brain_policy_candidates.robot_brain_model_domain_policy}`);
md.push(`- robot_brain_role_policy exists: ${analysis.aiworker.brain_policy_candidates.robot_brain_role_policy}`);
md.push("");
md.push("## 3. PersonaOS候補");
md.push(`- persona_parameter_state exists: ${analysis.personaos.persona_parameter_state_exists}`);
md.push(`- persona_parameter_value exists: ${analysis.personaos.persona_parameter_value_exists}`);
md.push(`- growth_axis exists: ${analysis.personaos.growth_axis_exists}`);
md.push(`- growth_core_state exists: ${analysis.personaos.growth_core_state_exists}`);
md.push(`- memory_state exists: ${analysis.personaos.memory_state_exists}`);
md.push("");
md.push("## 4. 推奨");
md.push("- AIWorkerOSは既存domain/proficiency/brain policyを優先する。");
md.push("- PersonaOSはpersona_parameter_value/growth_axis/memory_stateから算出する。");
md.push("- 大きな新table追加は避け、必要ならoverlay/snapshotに限定する。");
md.push("- HD-R2軍事/警備系は通常仕事と分け、安全境界付きdomainとして追加する。");
fs.writeFileSync(mdOutPath, md.join("\n") + "\n");
