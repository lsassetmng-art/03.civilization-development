const { execFileSync } = require("node:child_process");

const PROVIDER_VERSION = "lane10-selector-v2";
const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v2";

function valueOf(input, keys, fallback = undefined) {
  if (!input) return fallback;

  if (typeof input.get === "function") {
    for (const key of keys) {
      const value = input.get(key);
      if (value !== null && value !== undefined && String(value).trim() !== "") return value;
    }
  }

  if (typeof input === "object") {
    for (const key of keys) {
      const value = input[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") return value;
    }
  }

  return fallback;
}

function toInt(value, fallback, min = 1, max = 500) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function sqlText(value) {
  return `'${String(value ?? "").replaceAll("'", "''")}'`;
}

function normalizeDomainCodes(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

function sqlTextArrayOrNull(values) {
  const list = normalizeDomainCodes(values);
  if (list.length === 0) return "NULL::text[]";
  return `ARRAY[${list.map(sqlText).join(",")} ]::text[]`;
}

function normalizeOptions(input = {}) {
  const modelCode =
    valueOf(input, ["modelCode", "model_code", "model"], process.env.AIWORKER_MODEL_CODE || "HD-R5P");

  const purposeCode =
    valueOf(
      input,
      ["purposeCode", "usePurposeCode", "use_purpose_code", "purpose_code", "purpose"],
      process.env.AIWORKER_USE_PURPOSE_CODE || "reference"
    );

  const domainCodes = normalizeDomainCodes(
    valueOf(input, ["domainCodes", "domain_codes", "domains", "brain_domains"], process.env.AIWORKER_BRAIN_DOMAINS || "")
  );

  const limitPerDomain = toInt(
    valueOf(input, ["limitPerDomain", "limit_per_domain"], process.env.AIWORKER_BRAIN_LIMIT_PER_DOMAIN || "20"),
    20,
    1,
    100
  );

  const totalLimit = toInt(
    valueOf(input, ["totalLimit", "total_limit", "materialLimit", "material_limit"], process.env.AIWORKER_BRAIN_TOTAL_LIMIT || "80"),
    80,
    1,
    300
  );

  return {
    modelCode: String(modelCode),
    purposeCode: String(purposeCode),
    domainCodes,
    limitPerDomain,
    totalLimit,
  };
}

function runPsqlJson(sql) {
  const databaseUrl = process.env.PERSONA_DATABASE_URL;
  if (!databaseUrl) throw new Error("PERSONA_DATABASE_URL is not set");

  const output = execFileSync(
    "psql",
    [
      databaseUrl,
      "-X",
      "-q",
      "-t",
      "-A",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 32,
      env: process.env,
    }
  ).trim();

  if (!output) throw new Error("psql returned empty JSON output");

  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse brain-context JSON: ${error.message}\nOUTPUT=${output.slice(0, 2000)}`);
  }
}

function buildBrainContext(input = {}) {
  const o = normalizeOptions(input);

  const sql = `
WITH selected AS (
  SELECT *
  FROM ${SELECTOR_FUNCTION}(
    ${sqlText(o.modelCode)},
    ${sqlText(o.purposeCode)},
    ${sqlTextArrayOrNull(o.domainCodes)},
    ${o.limitPerDomain},
    ${o.totalLimit}
  )
),
domain_rows AS (
  SELECT
    s.brain_domain_code,
    max(s.brain_domain_label_ja) AS brain_domain_label_ja,
    count(*) AS material_count,
    jsonb_agg(
      jsonb_build_object(
        'brainDataCode', s.brain_data_code,
        'unitCode', s.unit_code,
        'unitTitleJa', s.unit_title_ja,
        'unitSummaryJa', s.unit_summary_ja,
        'unitDetailJa', s.unit_detail_ja,
        'practicalUseJa', s.practical_use_ja,
        'examplePromptJa', s.example_prompt_ja,
        'safetyBoundaryJa', s.safety_boundary_ja,
        'materialSourceKind', s.material_source_kind,
        'depthCode', s.depth_code,
        'dataDepthLevel', s.data_depth_level,
        'riskClassCode', s.risk_class_code,
        'domainRank', s.domain_rank,
        'overallRank', s.overall_rank,
        'selectionScore', s.selection_score,
        'selectionReasonJa', s.selection_reason_ja,
        'effectiveUsePurposeCodes', COALESCE(to_jsonb(s.effective_use_purpose_codes), '[]'::jsonb),
        'tags', COALESCE(to_jsonb(s.tags), '[]'::jsonb)
      )
      ORDER BY s.overall_rank
    ) AS material_summaries
  FROM selected s
  GROUP BY s.brain_domain_code
),
summary AS (
  SELECT
    count(*)::int AS source_count,
    count(*)::int AS material_count,
    count(DISTINCT brain_domain_code)::int AS domain_count,
    count(*) FILTER (WHERE unit_code LIKE 'srcmat_%')::int AS srcmat_count,
    count(*) FILTER (WHERE unit_code LIKE 'lane05_%')::int AS lane05_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack05_%')::int AS pack05_count,
    count(*) FILTER (WHERE risk_class_code = 'high')::int AS high_risk_count
  FROM selected
)
SELECT jsonb_build_object(
  'provider', 'aiworker-brain-context-provider',
  'providerVersion', ${sqlText(PROVIDER_VERSION)},
  'selectorFunction', ${sqlText(SELECTOR_FUNCTION)},
  'selectorMode', 'two_stage_domain_then_overall_rank',
  'modelCode', ${sqlText(o.modelCode)},
  'purposeCode', ${sqlText(o.purposeCode)},
  'domainFilter', ${sqlText(JSON.stringify(o.domainCodes))}::jsonb,
  'limitPerDomain', ${o.limitPerDomain},
  'totalLimit', ${o.totalLimit},
  'sourceCount', COALESCE(summary.source_count, 0),
  'materialCount', COALESCE(summary.material_count, 0),
  'domainCount', COALESCE(summary.domain_count, 0),
  'srcmatCount', COALESCE(summary.srcmat_count, 0),
  'lane05Count', COALESCE(summary.lane05_count, 0),
  'pack05Count', COALESCE(summary.pack05_count, 0),
  'highRiskCount', COALESCE(summary.high_risk_count, 0),
  'domains', COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'brainDomainCode', d.brain_domain_code,
        'brainDomainLabelJa', d.brain_domain_label_ja,
        'materialCount', d.material_count,
        'materialSummaries', d.material_summaries
      )
      ORDER BY d.brain_domain_code
    )
    FROM domain_rows d
  ), '[]'::jsonb),
  'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOS selectorで選抜済み。読取は実行権限ではない。'
)::text
FROM summary;
`;

  return runPsqlJson(sql);
}

function renderPromptContext(context) {
  const lines = [];
  lines.push("[AIWORKER_BRAIN_CONTEXT]");
  lines.push(`provider=${context.provider || "aiworker-brain-context-provider"}`);
  lines.push(`provider_version=${context.providerVersion || PROVIDER_VERSION}`);
  lines.push(`selector_function=${context.selectorFunction || SELECTOR_FUNCTION}`);
  lines.push(`selector_mode=${context.selectorMode || "two_stage_domain_then_overall_rank"}`);
  lines.push(`model_code=${context.modelCode || ""}`);
  lines.push(`purpose_code=${context.purposeCode || ""}`);
  lines.push(`source_count=${context.sourceCount ?? 0}`);
  lines.push(`material_count=${context.materialCount ?? 0}`);
  lines.push(`domain_count=${context.domainCount ?? 0}`);
  lines.push(`srcmat_count=${context.srcmatCount ?? 0}`);
  lines.push(`lane05_count=${context.lane05Count ?? 0}`);
  lines.push(`pack05_count=${context.pack05Count ?? 0}`);
  lines.push("rule=読取は実行権限ではない。安全境界と用途制限を超えない。");

  for (const domain of context.domains || []) {
    lines.push("");
    lines.push(`[DOMAIN ${domain.brainDomainCode}] ${domain.brainDomainLabelJa || ""}`);
    for (const material of domain.materialSummaries || []) {
      lines.push(
        `- ${material.unitCode} | source=${material.materialSourceKind || ""} | depth=${material.depthCode || ""} | risk=${material.riskClassCode || ""} | rank=${material.overallRank ?? ""}`
      );
      if (material.unitTitleJa) lines.push(`  title=${material.unitTitleJa}`);
      if (material.unitSummaryJa) lines.push(`  summary=${material.unitSummaryJa}`);
      if (material.safetyBoundaryJa) lines.push(`  safety=${material.safetyBoundaryJa}`);
    }
  }

  lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  return lines.join("\n");
}

function buildBrainContextPayload(input = {}) {
  return {
    ok: true,
    brain_context: buildBrainContext(input),
  };
}

function createBrainContextPayload(input = {}) {
  return buildBrainContextPayload(input);
}

function getBrainContext(input = {}) {
  return buildBrainContext(input);
}

function getRuntimeBrainContext(input = {}) {
  return buildBrainContext(input);
}

function buildRuntimeBrainContext(input = {}) {
  return buildBrainContext(input);
}

function resolveBrainContext(input = {}) {
  return buildBrainContext(input);
}

function bridge(input = {}) {
  return buildBrainContext(input);
}

bridge.buildBrainContext = buildBrainContext;
bridge.getBrainContext = getBrainContext;
bridge.getRuntimeBrainContext = getRuntimeBrainContext;
bridge.buildRuntimeBrainContext = buildRuntimeBrainContext;
bridge.resolveBrainContext = resolveBrainContext;
bridge.buildBrainContextPayload = buildBrainContextPayload;
bridge.createBrainContextPayload = createBrainContextPayload;
bridge.renderPromptContext = renderPromptContext;
bridge.renderPromptBrainContext = renderPromptContext;
bridge.PROVIDER_VERSION = PROVIDER_VERSION;
bridge.SELECTOR_FUNCTION = SELECTOR_FUNCTION;

module.exports = bridge;
