/**
 * KDB Result Service
 *
 * Scope:
 * - Knowledge provider result orchestration and aggregation.
 * - No DB connection.
 * - No runtime queue execution.
 * - No artifact/zip generation.
 */

// KDB_ARCHITECTURE_MEDIA_RESULT_SERVICE_START
// Provider execution orchestration helper.
// Scope: execute selected provider objects and aggregate results.
// No server/queue runtime wiring, no DB connection, no DB write, no API POST.

function __kdbResultAsArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function __kdbResultAsText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function __kdbResultProviderCode(provider, fallback = "unknown_provider") {
  return __kdbResultAsText(provider?.providerCode || fallback) || fallback;
}

function __kdbResultSafeMetadata(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  return {};
}

function __kdbResultNormalizeSuccess(provider, rawResult) {
  const providerCode = __kdbResultProviderCode(provider, rawResult?.providerCode || "unknown_provider");
  const result = rawResult && typeof rawResult === "object" ? rawResult : {};

  return {
    ok: result.ok !== false,
    statusCode: __kdbResultAsText(result.statusCode || "READY"),
    providerCode,
    supportedDomainCodes: __kdbResultAsArray(
      result.supportedDomainCodes || provider?.supportedDomainCodes || []
    ).map(String),
    selectedReferences: __kdbResultAsArray(result.selectedReferences),
    safetyCautions: __kdbResultAsArray(result.safetyCautions),
    usageSummary: __kdbResultAsText(result.usageSummary),
    requiresHumanReview: result.requiresHumanReview === true,
    metadata: {
      ...__kdbResultSafeMetadata(result.metadata),
      normalizedBy: "kdb-result-service",
    },
  };
}

function __kdbResultNormalizeFailure(provider, error) {
  const providerCode = __kdbResultProviderCode(provider);
  const message = error && error.message ? String(error.message) : "Provider execution failed";

  return {
    ok: false,
    statusCode: "PROVIDER_ERROR",
    providerCode,
    supportedDomainCodes: __kdbResultAsArray(provider?.supportedDomainCodes).map(String),
    selectedReferences: [],
    safetyCautions: [
      {
        cautionCode: `provider.${providerCode}.execution_error`,
        severity: "warn",
        message,
      },
    ],
    usageSummary: `${providerCode} provider failed during knowledge context resolution.`,
    requiresHumanReview: true,
    metadata: {
      normalizedBy: "kdb-result-service",
      errorName: error && error.name ? String(error.name) : "Error",
    },
  };
}

function __kdbResultUniqueText(values) {
  return [...new Set(__kdbResultAsArray(values).filter(Boolean).map(String))];
}

export async function resolveSelectedKnowledgeProviders(runtimeContext = {}) {
  const safeContext = runtimeContext && typeof runtimeContext === "object" ? runtimeContext : {};
  const selectedProviders = __kdbResultAsArray(safeContext.selectedProviders);
  const providerResults = [];

  if (selectedProviders.length === 0) {
    return {
      ok: false,
      statusCode: "NO_SELECTED_PROVIDERS",
      providerResultCount: 0,
      providerCodes: [],
      providerResults: [],
      selectedReferences: [],
      safetyCautions: [
        {
          cautionCode: "provider.no_selected_providers",
          severity: "warn",
          message: "No knowledge providers were selected for the supplied runtime context.",
        },
      ],
      usageSummaries: [],
      requiresHumanReview: true,
      metadata: {
        serviceCode: "kdb-result-service",
        runtimeWiring: false,
        dbConnection: false,
        dbWrite: false,
        apiPost: false,
      },
    };
  }

  for (const provider of selectedProviders) {
    const providerCode = __kdbResultProviderCode(provider);

    try {
      if (typeof provider?.resolveKnowledgeContext !== "function") {
        throw new Error(`Provider ${providerCode} does not expose resolveKnowledgeContext`);
      }

      const rawResult = await provider.resolveKnowledgeContext(safeContext);
      providerResults.push(__kdbResultNormalizeSuccess(provider, rawResult));
    } catch (error) {
      providerResults.push(__kdbResultNormalizeFailure(provider, error));
    }
  }

  const okResults = providerResults.filter((result) => result.ok === true);
  const failedResults = providerResults.filter((result) => result.ok !== true);

  const selectedReferences = providerResults.flatMap((result) =>
    __kdbResultAsArray(result.selectedReferences)
  );

  const safetyCautions = providerResults.flatMap((result) =>
    __kdbResultAsArray(result.safetyCautions)
  );

  const usageSummaries = providerResults.map((result) => ({
    providerCode: result.providerCode,
    ok: result.ok,
    statusCode: result.statusCode,
    usageSummary: result.usageSummary,
  }));

  const providerCodes = __kdbResultUniqueText(providerResults.map((result) => result.providerCode));

  const requiresHumanReview =
    providerResults.some((result) => result.requiresHumanReview === true) ||
    failedResults.length > 0;

  return {
    ok: okResults.length > 0,
    statusCode: okResults.length > 0 ? "READY" : "ALL_PROVIDERS_FAILED",
    providerResultCount: providerResults.length,
    providerCodes,
    providerResults,
    selectedReferences,
    safetyCautions,
    usageSummaries,
    requiresHumanReview,
    metadata: {
      serviceCode: "kdb-result-service",
      runtimeWiring: false,
      dbConnection: false,
      dbWrite: false,
      apiPost: false,
      selectedProviderCount: selectedProviders.length,
      okProviderCount: okResults.length,
      failedProviderCount: failedResults.length,
      domainCodes: __kdbResultAsArray(safeContext.domainCodes).map(String),
      selectedProviderCodes: __kdbResultAsArray(safeContext.selectedProviderCodes).map(String),
    },
  };
}
// KDB_ARCHITECTURE_MEDIA_RESULT_SERVICE_END
