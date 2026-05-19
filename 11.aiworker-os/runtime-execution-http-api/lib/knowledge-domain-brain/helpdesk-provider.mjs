import {
  KNOWLEDGE_PROVIDER_RESULT_STATUS,
  createEmptyKnowledgeProviderResult,
} from "./kdb-provider-contract.mjs";

export const HELPDESK_PROVIDER_CODE = "helpdesk";

export const HELPDESK_SUPPORTED_DOMAIN_CODES = Object.freeze([
  "helpdesk",
  "app_support",
]);

const PROVIDER_STATUS = Object.freeze({
  ok: KNOWLEDGE_PROVIDER_RESULT_STATUS.OK ?? "ok",
  empty: KNOWLEDGE_PROVIDER_RESULT_STATUS.EMPTY ?? "empty",
  skipped: KNOWLEDGE_PROVIDER_RESULT_STATUS.SKIPPED ?? "skipped",
  error: KNOWLEDGE_PROVIDER_RESULT_STATUS.ERROR ?? "error",
});

const DEFAULT_LOCALE = "ja";
const DEFAULT_LIMIT = 20;
const HARD_LIMIT = 100;

const REQUEST_KIND_DOCUMENT_KIND_MAP = Object.freeze({
  app_support_overview: ["app_profile", "qa"],
  qa_question: ["qa", "screen", "operation_flow"],
  screen_help: ["screen", "operation_flow", "qa"],
  operation_flow: ["operation_flow", "screen", "qa"],
  error_troubleshooting: ["error_pattern", "runbook", "escalation_rule", "qa"],
  escalation_check: ["escalation_rule", "error_pattern", "runbook"],
  template_selection: ["answer_template"],
});

const DOCUMENT_KIND_WEIGHT = Object.freeze({
  app_profile: 25,
  qa: 25,
  screen: 20,
  operation_flow: 20,
  error_pattern: 30,
  runbook: 25,
  escalation_rule: 30,
  answer_template: 15,
});

function normalizeString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSnakeString(value) {
  return normalizeString(value)?.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`) ?? null;
}

function clampInteger(value, fallback = DEFAULT_LIMIT, min = 1, max = HARD_LIMIT) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

function normalizeLocale(value, fallback = DEFAULT_LOCALE) {
  return normalizeString(value) ?? fallback;
}

function normalizeRequestKind(value) {
  const normalized = toSnakeString(value) ?? "qa_question";
  return REQUEST_KIND_DOCUMENT_KIND_MAP[normalized] ? normalized : "qa_question";
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

export function normalizeHelpdeskProviderInput(args = {}) {
  const runtimeContext = args.runtimeContext && typeof args.runtimeContext === "object"
    ? args.runtimeContext
    : {};

  const appCode =
    normalizeString(args.appCode) ??
    normalizeString(args.sourceAppCode) ??
    normalizeString(runtimeContext.sourceAppCode) ??
    normalizeString(runtimeContext.source_app_code);

  const requestKind = normalizeRequestKind(args.requestKind ?? args.request_kind);

  const textTerms = uniqueStrings([
    normalizeString(args.userQuestion),
    normalizeString(args.question),
    normalizeString(args.errorText),
    normalizeString(args.error_text),
    normalizeString(args.instructionText),
    normalizeString(runtimeContext.instructionText),
    normalizeString(runtimeContext.instruction_text),
  ]);

  return {
    appCode,
    sourceAppCode: normalizeString(args.sourceAppCode) ?? normalizeString(runtimeContext.sourceAppCode) ?? appCode,
    locale: normalizeLocale(args.locale ?? runtimeContext.locale),
    requestKind,
    documentKinds: REQUEST_KIND_DOCUMENT_KIND_MAP[requestKind],
    userQuestion: normalizeString(args.userQuestion) ?? normalizeString(args.question),
    screenCode: normalizeString(args.screenCode) ?? normalizeString(args.screen_code),
    flowCode: normalizeString(args.flowCode) ?? normalizeString(args.flow_code),
    errorCode: normalizeString(args.errorCode) ?? normalizeString(args.error_code),
    errorText: normalizeString(args.errorText) ?? normalizeString(args.error_text),
    severityHint: normalizeString(args.severityHint) ?? normalizeString(args.severity_hint),
    maxMatches: clampInteger(args.maxMatches ?? args.limit, DEFAULT_LIMIT, 1, HARD_LIMIT),
    textTerms,
    guardrailResult: args.guardrailResult ?? args.guardrail_result ?? null,
    runtimeContext,
  };
}

export function buildHelpdeskRetrievalQuerySpec(inputArgs = {}) {
  const input = normalizeHelpdeskProviderInput(inputArgs);
  const values = [];
  const where = ["is_active = true"];

  if (input.locale) {
    values.push(input.locale);
    where.push(`locale = $${values.length}`);
  }

  if (input.appCode) {
    values.push(input.appCode);
    where.push(`(app_code = $${values.length} or app_code is null)`);
  }

  if (input.documentKinds.length > 0) {
    values.push(input.documentKinds);
    where.push(`document_kind = any($${values.length}::text[])`);
  }

  if (input.screenCode) {
    values.push(input.screenCode);
    where.push(`(screen_code = $${values.length} or screen_code is null)`);
  }

  if (input.flowCode) {
    values.push(input.flowCode);
    where.push(`(flow_code = $${values.length} or flow_code is null)`);
  }

  if (input.errorCode) {
    values.push(input.errorCode);
    where.push(`(error_code = $${values.length} or error_code is null)`);
  }

  const searchableTerms = uniqueStrings([
    ...input.textTerms,
    input.errorCode,
    input.screenCode,
    input.flowCode,
  ]);

  if (searchableTerms.length > 0) {
    const termClauses = searchableTerms.slice(0, 5).map((term) => {
      values.push(`%${term}%`);
      return `(searchable_text ilike $${values.length} or title ilike $${values.length} or body ilike $${values.length})`;
    });
    where.push(`(${termClauses.join(" or ")})`);
  }

  values.push(input.maxMatches);

  return {
    sql: `
select
  retrieval_document_id,
  source_table,
  source_id,
  app_code,
  locale,
  document_kind,
  title,
  body,
  keywords,
  searchable_text,
  screen_code,
  flow_code,
  error_code,
  runbook_code,
  rule_code,
  template_code,
  confidence_level,
  priority,
  visibility,
  escalation_required,
  blocks_ai_answer,
  updated_at
from aiworker.v_helpdesk_retrieval_document
where ${where.join("\n  and ")}
order by
  case when app_code is null then 1 else 0 end,
  priority asc,
  updated_at desc nulls last
limit $${values.length}
`.trim(),
    values,
    normalizedInput: input,
    readonly: true,
    source: "aiworker.v_helpdesk_retrieval_document",
  };
}

function rowValue(row, snakeName, camelName) {
  if (!row || typeof row !== "object") return null;
  return row[snakeName] ?? row[camelName] ?? null;
}

function asBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function rankHelpdeskRetrievalDocuments(rows = [], inputArgs = {}) {
  const input = normalizeHelpdeskProviderInput(inputArgs);
  const terms = input.textTerms.map((term) => term.toLowerCase());

  return rows.map((row) => {
    const documentKind = rowValue(row, "document_kind", "documentKind");
    const appCode = rowValue(row, "app_code", "appCode");
    const locale = rowValue(row, "locale", "locale");
    const screenCode = rowValue(row, "screen_code", "screenCode");
    const flowCode = rowValue(row, "flow_code", "flowCode");
    const errorCode = rowValue(row, "error_code", "errorCode");
    const confidenceLevel = rowValue(row, "confidence_level", "confidenceLevel");
    const priority = asNumber(rowValue(row, "priority", "priority"), 100);
    const searchable = [
      rowValue(row, "title", "title"),
      rowValue(row, "body", "body"),
      rowValue(row, "searchable_text", "searchableText"),
    ].filter(Boolean).join("\n").toLowerCase();

    let score = 0;
    const reasons = [];

    if (input.appCode && appCode === input.appCode) {
      score += 40;
      reasons.push("app_code");
    }

    if (input.locale && locale === input.locale) {
      score += 20;
      reasons.push("locale");
    }

    if (input.documentKinds.includes(documentKind)) {
      score += DOCUMENT_KIND_WEIGHT[documentKind] ?? 10;
      reasons.push("document_kind");
    }

    if (input.screenCode && screenCode === input.screenCode) {
      score += 20;
      reasons.push("screen_code");
    }

    if (input.flowCode && flowCode === input.flowCode) {
      score += 20;
      reasons.push("flow_code");
    }

    if (input.errorCode && errorCode === input.errorCode) {
      score += 25;
      reasons.push("error_code");
    }

    for (const term of terms) {
      if (term && searchable.includes(term)) {
        score += 10;
        reasons.push("text_match");
        break;
      }
    }

    if (confidenceLevel === "verified") {
      score += 10;
      reasons.push("verified");
    } else if (confidenceLevel === "high") {
      score += 7;
      reasons.push("high_confidence");
    }

    if (asBoolean(rowValue(row, "escalation_required", "escalationRequired"))) {
      if (input.requestKind === "error_troubleshooting" || input.requestKind === "escalation_check") {
        score += 10;
        reasons.push("escalation_relevant");
      }
    }

    score += Math.max(0, 10 - Math.min(priority, 10));

    return {
      row,
      matchScore: score,
      matchReasons: uniqueStrings(reasons),
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function mapHelpdeskRetrievalRowToMatch(row, ranking = {}) {
  return {
    retrievalDocumentId: rowValue(row, "retrieval_document_id", "retrievalDocumentId"),
    sourceTable: rowValue(row, "source_table", "sourceTable"),
    sourceId: rowValue(row, "source_id", "sourceId"),
    appCode: rowValue(row, "app_code", "appCode"),
    locale: rowValue(row, "locale", "locale"),
    documentKind: rowValue(row, "document_kind", "documentKind"),
    title: rowValue(row, "title", "title"),
    body: rowValue(row, "body", "body"),
    keywords: rowValue(row, "keywords", "keywords"),
    screenCode: rowValue(row, "screen_code", "screenCode"),
    flowCode: rowValue(row, "flow_code", "flowCode"),
    errorCode: rowValue(row, "error_code", "errorCode"),
    runbookCode: rowValue(row, "runbook_code", "runbookCode"),
    ruleCode: rowValue(row, "rule_code", "ruleCode"),
    templateCode: rowValue(row, "template_code", "templateCode"),
    confidenceLevel: rowValue(row, "confidence_level", "confidenceLevel"),
    priority: asNumber(rowValue(row, "priority", "priority"), 100),
    visibility: rowValue(row, "visibility", "visibility"),
    escalationRequired: asBoolean(rowValue(row, "escalation_required", "escalationRequired")),
    blocksAiAnswer: asBoolean(rowValue(row, "blocks_ai_answer", "blocksAiAnswer")),
    matchScore: asNumber(ranking.matchScore, 0),
    matchReasons: Array.isArray(ranking.matchReasons) ? ranking.matchReasons : [],
    sourceRef: {
      schema: "aiworker",
      view: "v_helpdesk_retrieval_document",
    },
  };
}

function buildSafetyCautions(matches = []) {
  return matches
    .filter((match) => match.escalationRequired || match.blocksAiAnswer || match.documentKind === "escalation_rule")
    .map((match) => ({
      providerCode: HELPDESK_PROVIDER_CODE,
      cautionCode: match.blocksAiAnswer ? "HELPDESK_BLOCKS_AI_ANSWER" : "HELPDESK_ESCALATION_CANDIDATE",
      severity: match.blocksAiAnswer ? "high" : "medium",
      summary: match.title,
      retrievalDocumentId: match.retrievalDocumentId,
      documentKind: match.documentKind,
      sourceRef: match.sourceRef,
    }));
}

function createProviderResult(statusCode, fields = {}) {
  const base = createEmptyKnowledgeProviderResult({
    providerCode: HELPDESK_PROVIDER_CODE,
    supportedDomainCodes: HELPDESK_SUPPORTED_DOMAIN_CODES,
    statusCode,
  });

  return {
    ...base,
    ...fields,
    providerCode: HELPDESK_PROVIDER_CODE,
    supportedDomainCodes: [...HELPDESK_SUPPORTED_DOMAIN_CODES],
    statusCode,
    status: statusCode,
    selectedReferences: fields.selectedReferences ?? base.selectedReferences ?? [],
    helpdeskMatches: fields.helpdeskMatches ?? base.helpdeskMatches ?? [],
    guardrailFindings: fields.guardrailFindings ?? base.guardrailFindings ?? [],
    safetyCautions: fields.safetyCautions ?? base.safetyCautions ?? [],
    usageSummary: fields.usageSummary ?? base.usageSummary ?? {},
    requiresHumanReview: fields.requiresHumanReview ?? base.requiresHumanReview ?? false,
    metadata: fields.metadata ?? base.metadata ?? {},
  };
}

export async function resolveHelpdeskKnowledgeContext(args = {}, dependencies = {}) {
  const query = dependencies.query;
  const normalizedInput = normalizeHelpdeskProviderInput(args);

  if (typeof query !== "function") {
    return createProviderResult(PROVIDER_STATUS.skipped, {
      ok: true,
      metadata: {
        reason: "QUERY_DEPENDENCY_MISSING",
        readonly: true,
        normalizedInput,
      },
      usageSummary: {
        providerCode: HELPDESK_PROVIDER_CODE,
        attempted: false,
        matchedCount: 0,
      },
    });
  }

  try {
    const querySpec = buildHelpdeskRetrievalQuerySpec(normalizedInput);
    const result = await query(querySpec.sql, querySpec.values);
    const rows = Array.isArray(result) ? result : Array.isArray(result?.rows) ? result.rows : [];
    const ranked = rankHelpdeskRetrievalDocuments(rows, normalizedInput);
    const helpdeskMatches = ranked.map((item) => mapHelpdeskRetrievalRowToMatch(item.row, item));
    const safetyCautions = buildSafetyCautions(helpdeskMatches);
    const statusCode = helpdeskMatches.length > 0 ? PROVIDER_STATUS.ok : PROVIDER_STATUS.empty;

    return createProviderResult(statusCode, {
      ok: true,
      helpdeskMatches,
      safetyCautions,
      requiresHumanReview: safetyCautions.some((item) => item.severity === "high"),
      usageSummary: {
        providerCode: HELPDESK_PROVIDER_CODE,
        attempted: true,
        matchedCount: helpdeskMatches.length,
        source: querySpec.source,
        readonly: true,
      },
      metadata: {
        normalizedInput,
        querySource: querySpec.source,
        readonly: true,
      },
    });
  } catch (error) {
    return createProviderResult(PROVIDER_STATUS.error, {
      ok: false,
      safetyCautions: [{
        providerCode: HELPDESK_PROVIDER_CODE,
        cautionCode: "HELPDESK_PROVIDER_QUERY_ERROR",
        severity: "medium",
        summary: "Helpdesk provider retrieval failed.",
      }],
      requiresHumanReview: false,
      usageSummary: {
        providerCode: HELPDESK_PROVIDER_CODE,
        attempted: true,
        matchedCount: 0,
        failed: true,
      },
      metadata: {
        normalizedInput,
        errorName: error?.name ?? "Error",
        errorMessage: error?.message ?? "Unknown Helpdesk provider error",
        readonly: true,
      },
    });
  }
}

export function createHelpdeskProvider(dependencies = {}) {
  return {
    providerCode: HELPDESK_PROVIDER_CODE,
    supportedDomainCodes: [...HELPDESK_SUPPORTED_DOMAIN_CODES],
    resolveKnowledgeContext: (args = {}) => resolveHelpdeskKnowledgeContext(args, dependencies),
  };
}

export default createHelpdeskProvider;
