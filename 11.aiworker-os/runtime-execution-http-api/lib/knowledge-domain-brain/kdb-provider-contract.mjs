export const KNOWLEDGE_PROVIDER_RESULT_STATUS = Object.freeze({
  OK: "ok",
  EMPTY: "empty",
  SKIPPED: "skipped",
  ERROR: "error"
});

export function createEmptyKnowledgeProviderResult(overrides = {}) {
  return {
    ok: true,
    statusCode: KNOWLEDGE_PROVIDER_RESULT_STATUS.EMPTY,
    providerCode: overrides.providerCode ?? "none",
    supportedDomainCodes: overrides.supportedDomainCodes ?? [],
    selectedReferences: overrides.selectedReferences ?? [],
    helpdeskMatches: overrides.helpdeskMatches ?? [],
    guardrailFindings: overrides.guardrailFindings ?? [],
    safetyCautions: overrides.safetyCautions ?? [],
    usageSummary: overrides.usageSummary ?? "",
    requiresHumanReview: Boolean(overrides.requiresHumanReview),
    metadata: overrides.metadata ?? {}
  };
}

export function normalizeKnowledgeProvider(provider) {
  if (!provider || typeof provider !== "object") {
    throw new TypeError("Knowledge provider must be an object.");
  }

  if (!provider.providerCode || typeof provider.providerCode !== "string") {
    throw new TypeError("Knowledge provider requires providerCode.");
  }

  if (!Array.isArray(provider.supportedDomainCodes)) {
    throw new TypeError("Knowledge provider requires supportedDomainCodes array.");
  }

  if (provider.resolveKnowledgeContext && typeof provider.resolveKnowledgeContext !== "function") {
    throw new TypeError("resolveKnowledgeContext must be a function when provided.");
  }

  return Object.freeze({
    providerCode: provider.providerCode,
    supportedDomainCodes: [...provider.supportedDomainCodes],
    resolveKnowledgeContext: provider.resolveKnowledgeContext
  });
}

export function selectProvidersForDomains(providers = [], domainCodes = []) {
  const target = new Set(domainCodes.filter(Boolean));
  return providers
    .map((provider) => normalizeKnowledgeProvider(provider))
    .filter((provider) => provider.supportedDomainCodes.some((domainCode) => target.has(domainCode)));
}
