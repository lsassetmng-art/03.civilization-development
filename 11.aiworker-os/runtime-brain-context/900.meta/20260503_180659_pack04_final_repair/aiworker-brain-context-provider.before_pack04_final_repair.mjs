import { spawnSync } from "node:child_process";

const SAFE_CODE_RE = /^[A-Za-z0-9:_-]+$/;

function assertSafeCode(label, value) {
  if (typeof value !== "string" || value.length === 0 || !SAFE_CODE_RE.test(value)) {
    throw new Error(`${label} must match ${SAFE_CODE_RE.toString()}: ${String(value)}`);
  }
}

function sqlLiteral(value) {
  assertSafeCode("sql literal", value);
  return `'${value.replaceAll("'", "''")}'`;
}

function sqlTextArray(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "ARRAY[]::text[]";
  }
  for (const value of values) {
    assertSafeCode("array value", value);
  }
  return `ARRAY[${values.map(sqlLiteral).join(", ")}]::text[]`;
}

function runPsqlJson(sql) {
  const dbUrl = process.env.PERSONA_DATABASE_URL;
  if (!dbUrl) {
    throw new Error("PERSONA_DATABASE_URL is not set");
  }

  const result = spawnSync(
    "psql",
    [dbUrl, "-X", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", sql],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 32,
      env: process.env,
    }
  );

  if (result.status !== 0) {
    const stderr = result.stderr || "";
    const stdout = result.stdout || "";
    throw new Error(`psql failed\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
  }

  const raw = (result.stdout || "").trim();
  if (!raw) {
    throw new Error("psql returned empty JSON output");
  }

  return JSON.parse(raw);
}

export function buildBrainContext(options = {}) {
  const modelCode = options.modelCode || process.env.AIWORKER_MODEL_CODE;
  const purposeCode = options.purposeCode || process.env.AIWORKER_USE_PURPOSE_CODE || "reference";
  const domainCodes = Array.isArray(options.domainCodes) ? options.domainCodes : [];
  const includeMissingSources = options.includeMissingSources === true;
  const includeMaterials = options.includeMaterials !== false;
  const materialLimit = Number.isFinite(Number(options.materialLimit)) ? Math.max(0, Math.min(Number(options.materialLimit), 80)) : 40;

  assertSafeCode("modelCode", modelCode);
  assertSafeCode("purposeCode", purposeCode);
  for (const domainCode of domainCodes) {
    assertSafeCode("domainCode", domainCode);
  }

  const domainFilter = domainCodes.length > 0
    ? `AND brain_domain_code = ANY(${sqlTextArray(domainCodes)})`
    : "";

  const sourceFilter = includeMissingSources
    ? ""
    : "AND source_exists_flag = true";

  const modelLiteral = sqlLiteral(modelCode);
  const purposeLiteral = sqlLiteral(purposeCode);

  const sql = `
WITH filtered AS (
  SELECT
    model_code,
    series_code,
    role_code,
    brain_data_code,
    brain_domain_code,
    brain_domain_label_ja,
    source_schema_name,
    source_object_name,
    source_record_code,
    source_title_ja,
    depth_code,
    data_depth_level,
    risk_class_code,
    granularity_code,
    effective_use_purpose_codes,
    source_exists_flag,
    registry_safety_boundary_ja,
    profile_safety_note_ja,
    model_policy_safety_note_ja,
    role_policy_safety_note_ja,
    access_decision_code
  FROM aiworker.vw_robot_readable_brain_source_registry_v1
  WHERE model_code = ${modelLiteral}
    AND effective_use_purpose_codes && ARRAY[${purposeLiteral}]::text[]
    ${domainFilter}
    ${sourceFilter}
),
materials AS (
  SELECT
    model_code,
    series_code,
    role_code,
    brain_data_code,
    brain_domain_code,
    brain_domain_label_ja,
    depth_code,
    data_depth_level,
    risk_class_code,
    granularity_code,
    effective_use_purpose_codes,
    access_decision_code,
    source_exists_flag,
    unit_code,
    unit_title_ja,
    unit_summary_ja,
    unit_detail_ja,
    practical_use_ja,
    example_prompt_ja,
    safety_boundary_ja,
    tags
  FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
  WHERE model_code = ${modelLiteral}
    AND effective_use_purpose_codes && ARRAY[${purposeLiteral}]::text[]
    ${domainFilter}
  ORDER BY brain_domain_code, data_depth_level, unit_code
  LIMIT ${materialLimit}
),
domain_summary AS (
  SELECT
    f.model_code,
    f.series_code,
    f.role_code,
    f.brain_domain_code,
    f.brain_domain_label_ja,
    max(f.data_depth_level) AS max_data_depth_level,
    array_agg(DISTINCT f.depth_code ORDER BY f.depth_code) AS depth_codes,
    array_agg(DISTINCT f.risk_class_code ORDER BY f.risk_class_code) AS risk_class_codes,
    count(*) AS readable_source_count,
    count(*) FILTER (WHERE f.source_exists_flag = true) AS existing_source_count,
    string_agg(
      f.source_schema_name || '.' || f.source_object_name || ':' || f.brain_data_code,
      E'\\n'
      ORDER BY f.source_schema_name, f.source_object_name, f.brain_data_code
    ) AS compact_brain_sources,
    string_agg(
      DISTINCT f.registry_safety_boundary_ja,
      E'\\n---\\n'
    ) AS safety_boundaries_ja,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'unitCode', m.unit_code,
            'unitTitleJa', m.unit_title_ja,
            'unitSummaryJa', m.unit_summary_ja,
            'practicalUseJa', m.practical_use_ja,
            'examplePromptJa', m.example_prompt_ja,
            'safetyBoundaryJa', m.safety_boundary_ja,
            'tags', m.tags
          )
          ORDER BY m.unit_code
        )
        FROM materials m
        WHERE m.brain_domain_code = f.brain_domain_code
      ),
      '[]'::jsonb
    ) AS material_summaries
  FROM filtered f
  GROUP BY
    f.model_code,
    f.series_code,
    f.role_code,
    f.brain_domain_code,
    f.brain_domain_label_ja
),
payload AS (
  SELECT
    jsonb_build_object(
      'provider', 'aiworker-brain-context-provider',
      'providerVersion', 2,
      'modelCode', ${modelLiteral},
      'purposeCode', ${purposeLiteral},
      'includeMissingSources', ${includeMissingSources ? "true" : "false"},
      'includeMaterials', ${includeMaterials ? "true" : "false"},
      'sourceCount', COALESCE((SELECT count(*) FROM filtered), 0),
      'domainCount', COALESCE((SELECT count(*) FROM domain_summary), 0),
      'materialCount', CASE WHEN ${includeMaterials ? "true" : "false"} THEN COALESCE((SELECT count(*) FROM materials), 0) ELSE 0 END,
      'domains',
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'modelCode', model_code,
                'seriesCode', series_code,
                'roleCode', role_code,
                'brainDomainCode', brain_domain_code,
                'brainDomainLabelJa', brain_domain_label_ja,
                'maxDataDepthLevel', max_data_depth_level,
                'depthCodes', depth_codes,
                'riskClassCodes', risk_class_codes,
                'readableSourceCount', readable_source_count,
                'existingSourceCount', existing_source_count,
                'compactBrainSources', compact_brain_sources,
                'safetyBoundariesJa', safety_boundaries_ja,
                'materialSummaries', CASE WHEN ${includeMaterials ? "true" : "false"} THEN material_summaries ELSE '[]'::jsonb END
              )
              ORDER BY brain_domain_code
            )
            FROM domain_summary
          ),
          '[]'::jsonb
        )
    ) AS body
)
SELECT body::text FROM payload;
`;

  return runPsqlJson(sql);
}

export function renderPromptContext(context) {
  const lines = [];
  lines.push("[AIWORKER_BRAIN_CONTEXT]");
  lines.push(`model_code=${context.modelCode}`);
  lines.push(`purpose_code=${context.purposeCode}`);
  lines.push(`source_count=${context.sourceCount}`);
  lines.push(`domain_count=${context.domainCount}`);
  lines.push(`material_count=${context.materialCount || 0}`);

  for (const domain of context.domains || []) {
    lines.push("");
    lines.push(`domain=${domain.brainDomainCode}`);
    lines.push(`label_ja=${domain.brainDomainLabelJa}`);
    lines.push(`depth_codes=${(domain.depthCodes || []).join(",")}`);
    lines.push(`risk_class_codes=${(domain.riskClassCodes || []).join(",")}`);
    lines.push(`sources=${domain.compactBrainSources || ""}`);
    lines.push(`safety=${domain.safetyBoundariesJa || ""}`);

    const materials = Array.isArray(domain.materialSummaries) ? domain.materialSummaries : [];
    for (const material of materials.slice(0, 20)) {
      lines.push(`material=${material.unitCode}`);
      lines.push(`material_title=${material.unitTitleJa}`);
      lines.push(`material_summary=${material.unitSummaryJa}`);
      lines.push(`material_use=${material.practicalUseJa}`);
      lines.push(`material_safety=${material.safetyBoundaryJa}`);
    }
  }

  lines.push("[/AIWORKER_BRAIN_CONTEXT]");
  return lines.join("\n");
}

function parseCliArgs(argv) {
  const args = [...argv];
  const modelCode = args.shift() || process.env.AIWORKER_MODEL_CODE;
  const purposeCode = args.shift() || process.env.AIWORKER_USE_PURPOSE_CODE || "reference";

  const domainsArg = args.find((arg) => arg.startsWith("--domains="));
  const domainCodes = domainsArg
    ? domainsArg.slice("--domains=".length).split(",").map((x) => x.trim()).filter(Boolean)
    : [];

  const includeMissingSources = args.includes("--include-missing-sources");
  const includeMaterials = !args.includes("--no-materials");
  const asPrompt = args.includes("--prompt");

  return { modelCode, purposeCode, domainCodes, includeMissingSources, includeMaterials, asPrompt };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseCliArgs(process.argv.slice(2));
  const context = buildBrainContext(options);
  if (options.asPrompt) {
    console.log(renderPromptContext(context));
  } else {
    console.log(JSON.stringify(context, null, 2));
  }
}
