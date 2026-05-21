/**
 * R82_CR NOT_EXECUTED design copy.
 *
 * Intended future target:
 *   lib/knowledge-domain-brain/registry-read-adapter.mjs
 *
 * This module is designed as a read-only KDB-layer adapter.
 * It does not create a DB pool and does not import pg.
 * The caller must inject queryFn(sqlText, params).
 */

const DEFAULT_LIMIT = 20;

export function normalizeRegistryReadInput(input = {}) {
  const runtimeRequest = input.runtimeRequest && typeof input.runtimeRequest === "object"
    ? input.runtimeRequest
    : {};

  const sourceFiles = Array.isArray(input.sourceFiles)
    ? input.sourceFiles.filter(Boolean)
    : [];

  const requestedDomains = Array.isArray(input.requestedDomains)
    ? input.requestedDomains.filter(Boolean).map(String)
    : [];

  const taskKind = input.taskKind ? String(input.taskKind) : "";
  const appSurfaceCode = input.appSurfaceCode ? String(input.appSurfaceCode) : "";
  const nowIso = input.nowIso ? String(input.nowIso) : new Date().toISOString();

  return {
    runtimeRequest,
    sourceFiles,
    requestedDomains,
    taskKind,
    appSurfaceCode,
    nowIso,
  };
}

export function createEmptyRuntimeKnowledgeRegistryContext(reason = "registry_unavailable") {
  return {
    ok: false,
    fallbackUsed: true,
    selectedDomains: [],
    selectedAdapters: [],
    selectedProviders: [],
    sourcePolicies: [],
    currentEventPolicy: null,
    warnings: [reason],
    unresolvedIssues: [
      {
        code: "knowledge_registry_fallback",
        message: "Knowledge routing registry was unavailable; static/default routing should be used.",
      },
    ],
    qualityNotes: [
      {
        code: "registry_read_fallback",
        message: "Runtime continued without registry enrichment.",
      },
    ],
  };
}

function assertQueryFn(queryFn) {
  if (typeof queryFn !== "function") {
    throw new TypeError("resolveRuntimeKnowledgeRegistryContext requires deps.queryFn");
  }
}

function asRows(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.rows)) return result.rows;
  return [];
}

async function safeSelect(queryFn, sqlText, params) {
  const result = await queryFn(sqlText, params);
  return asRows(result);
}

function collectDomainCodes(input) {
  const out = new Set(input.requestedDomains || []);

  const maybe = [
    input.runtimeRequest?.domain,
    input.runtimeRequest?.domain_code,
    input.runtimeRequest?.knowledge_domain,
    input.runtimeRequest?.knowledge_domain_code,
    input.taskKind,
    input.appSurfaceCode,
  ];

  for (const value of maybe) {
    if (value) out.add(String(value));
  }

  return [...out].filter(Boolean).slice(0, DEFAULT_LIMIT);
}

export async function resolveRuntimeKnowledgeRegistryContext(input = {}, deps = {}) {
  const normalized = normalizeRegistryReadInput(input);
  const queryFn = deps.queryFn;

  try {
    assertQueryFn(queryFn);

    const requestedDomainCodes = collectDomainCodes(normalized);

    const selectedDomains = await safeSelect(
      queryFn,
      `
        SELECT domain_code, domain_name, domain_kind, active_flag
        FROM aiworker.knowledge_domain_registry
        WHERE active_flag = true
          AND (
            cardinality($1::text[]) = 0
            OR domain_code = ANY($1::text[])
            OR domain_kind = ANY($1::text[])
          )
        ORDER BY priority_rank ASC, domain_code ASC
        LIMIT 20
      `,
      [requestedDomainCodes],
    );

    const selectedAdapters = await safeSelect(
      queryFn,
      `
        SELECT adapter_code, domain_code, adapter_kind, active_flag
        FROM aiworker.knowledge_adapter_registry
        WHERE active_flag = true
          AND (
            cardinality($1::text[]) = 0
            OR domain_code = ANY($1::text[])
          )
        ORDER BY priority_rank ASC, adapter_code ASC
        LIMIT 20
      `,
      [selectedDomains.map((row) => row.domain_code).filter(Boolean)],
    );

    const selectedProviders = await safeSelect(
      queryFn,
      `
        SELECT provider_code, adapter_code, provider_kind, active_flag
        FROM aiworker.knowledge_provider_registry
        WHERE active_flag = true
          AND (
            cardinality($1::text[]) = 0
            OR adapter_code = ANY($1::text[])
          )
        ORDER BY priority_rank ASC, provider_code ASC
        LIMIT 20
      `,
      [selectedAdapters.map((row) => row.adapter_code).filter(Boolean)],
    );

    const sourcePolicies = await safeSelect(
      queryFn,
      `
        SELECT source_code, domain_code, source_kind, freshness_policy_code, active_flag
        FROM aiworker.knowledge_source_registry
        WHERE active_flag = true
          AND (
            cardinality($1::text[]) = 0
            OR domain_code = ANY($1::text[])
          )
        ORDER BY priority_rank ASC, source_code ASC
        LIMIT 20
      `,
      [selectedDomains.map((row) => row.domain_code).filter(Boolean)],
    );

    const currentEventRows = await safeSelect(
      queryFn,
      `
        SELECT snapshot_code, source_code, snapshot_kind, captured_at, expires_at
        FROM aiworker.current_event_snapshot
        WHERE active_flag = true
          AND (expires_at IS NULL OR expires_at > $1::timestamptz)
        ORDER BY captured_at DESC NULLS LAST, snapshot_code ASC
        LIMIT 5
      `,
      [normalized.nowIso],
    );

    return {
      ok: true,
      fallbackUsed: false,
      selectedDomains,
      selectedAdapters,
      selectedProviders,
      sourcePolicies,
      currentEventPolicy: currentEventRows[0] || null,
      warnings: [],
      unresolvedIssues: [],
      qualityNotes: [],
    };
  } catch (error) {
    const reason = error && error.message
      ? `registry_read_failed:${error.message}`
      : "registry_read_failed";

    return createEmptyRuntimeKnowledgeRegistryContext(reason);
  }
}
