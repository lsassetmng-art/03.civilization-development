import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PROVIDER_VERSION = "lane07-selector-v1";
const SELECTOR_FUNCTION = "aiworker.fn_robot_brain_runtime_material_select_v1";

function toInt(value, fallback, min = 1, max = 500) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function sqlText(value) {
  return `'${String(value ?? "").replaceAll("'", "''")}'`;
}

function normalizeDomainCodes(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function sqlTextArrayOrNull(values) {
  const list = normalizeDomainCodes(values);
  if (list.length === 0) return "NULL::text[]";
  return `ARRAY[${list.map(sqlText).join(",")} ]::text[]`;
}

function jsonDomainFilter(values) {
  return JSON.stringify(normalizeDomainCodes(values));
}

function normalizeOptions(options = {}) {
  const modelCode =
    options.modelCode ||
    options.model_code ||
    options.model ||
    process.env.AIWORKER_MODEL_CODE ||
    "HD-R5P";

  const purposeCode =
    options.purposeCode ||
    options.usePurposeCode ||
    options.use_purpose_code ||
    options.purpose_code ||
    options.purpose ||
    process.env.AIWORKER_USE_PURPOSE_CODE ||
    "reference";

  const domainCodes =
    options.domainCodes ??
    options.domain_codes ??
    options.domains ??
    process.env.AIWORKER_BRAIN_DOMAINS ??
    "";

  const limitPerDomain = toInt(
    options.limitPerDomain ?? options.limit_per_domain ?? process.env.AIWORKER_BRAIN_LIMIT_PER_DOMAIN,
    20,
    1,
    100
  );

  const totalLimit = toInt(
    options.totalLimit ?? options.total_limit ?? options.materialLimit ?? options.material_limit ?? process.env.AIWORKER_BRAIN_TOTAL_LIMIT,
    80,
    1,
    300
  );

  return {
    modelCode: String(modelCode),
    purposeCode: String(purposeCode),
    domainCodes: normalizeDomainCodes(domainCodes),
    limitPerDomain,
    totalLimit,
  };
}

function runPsqlJson(sql) {
  const databaseUrl = process.env.PERSONA_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("PERSONA_DATABASE_URL is not set");
  }

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

  if (!output) {
    throw new Error("psql returned empty JSON output");
  }

  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse provider JSON: ${error.message}\nOUTPUT=${output.slice(0, 2000)}`);
  }
}

export function buildBrainContext(options = {}) {
  const normalized = normalizeOptions(options);

  const modelLiteral = sqlText(normalized.modelCode);
  const purposeLiteral = sqlText(normalized.purposeCode);
  const domainArrayLiteral = sqlTextArrayOrNull(normalized.domainCodes);
  const domainFilterJson = sqlText(jsonDomainFilter(normalized.domainCodes));
  const limitPerDomain = normalized.limitPerDomain;
  const totalLimit = normalized.totalLimit;

  const sql = `
WITH selected AS (
  SELECT *
  FROM ${SELECTOR_FUNCTION}(
    ${modelLiteral},
    ${purposeLiteral},
    ${domainArrayLiteral},
    ${limitPerDomain},
    ${totalLimit}
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
  'modelCode', ${modelLiteral},
  'purposeCode', ${purposeLiteral},
  'domainFilter', ${domainFilterJson}::jsonb,
  'limitPerDomain', ${limitPerDomain},
  'totalLimit', ${totalLimit},
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
  'safetyNoteJa', 'CX22073JWの頭脳データはAIWorkerOSのselectorでmodel/purpose/domain/depth/riskごとに選抜済み。読取は実行権限ではない。'
)::text
FROM summary;
`;

  return runPsqlJson(sql);
}

export function renderPromptContext(context) {
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
    lines.push(`material_count=${domain.materialCount ?? 0}`);

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

export default {
  buildBrainContext,
  renderPromptContext,
};

function parseCliArgs(argv) {
  const args = [...argv];
  const options = {};
  const positional = [];

  while (args.length > 0) {
    const arg = args.shift();

    if (arg === "--prompt") {
      options.asPrompt = true;
    } else if (arg === "--json") {
      options.asPrompt = false;
    } else if (arg === "--model" || arg === "--model-code") {
      options.modelCode = args.shift();
    } else if (arg === "--purpose" || arg === "--use-purpose") {
      options.purposeCode = args.shift();
    } else if (arg === "--domains") {
      options.domainCodes = args.shift();
    } else if (arg === "--limit-per-domain") {
      options.limitPerDomain = args.shift();
    } else if (arg === "--total-limit" || arg === "--material-limit") {
      options.totalLimit = args.shift();
    } else {
      positional.push(arg);
    }
  }

  if (!options.modelCode && positional[0]) options.modelCode = positional[0];
  if (!options.purposeCode && positional[1]) options.purposeCode = positional[1];
  if (!options.domainCodes && positional[2]) options.domainCodes = positional[2];

  return options;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (invokedFile && path.resolve(currentFile) === invokedFile) {
  const options = parseCliArgs(process.argv.slice(2));
  const context = buildBrainContext(options);
  if (options.asPrompt) {
    console.log(renderPromptContext(context));
  } else {
    console.log(JSON.stringify(context, null, 2));
  }
}
