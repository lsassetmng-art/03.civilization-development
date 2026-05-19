export {
  classifyKnowledgeDomains,
  getKnowledgeDomainCodes
} from "./domain-classifier.mjs";

export {
  KNOWLEDGE_PROVIDER_RESULT_STATUS,
  createEmptyKnowledgeProviderResult,
  normalizeKnowledgeProvider,
  selectProvidersForDomains
} from "./kdb-provider-contract.mjs";

export {
  buildKnowledgeRuntimeContext
} from "./kdb-runtime-context.mjs";

// KDB_ARCHITECTURE_MEDIA_PROVIDER_REGISTRY_START
// Registry-only addition.
// Scope: provider registration/export only.
// No runtime wiring, no DB connection, no DB write, no API POST.
import architectureProvider from "./providers/architecture-provider.mjs";
import mediaAnalysisProvider from "./providers/media-analysis-provider.mjs";
import * as __kdbArchitectureMediaProviderContract from "./kdb-provider-contract.mjs";

function __normalizeKdbProviderForRegistry(provider) {
  const normalize = __kdbArchitectureMediaProviderContract.normalizeKnowledgeProvider;
  if (typeof normalize !== "function") return provider;

  try {
    return normalize(provider);
  } catch {
    return provider;
  }
}

function __providerSupportsDomain(provider, domainCode) {
  const supportedDomainCodes = Array.isArray(provider?.supportedDomainCodes)
    ? provider.supportedDomainCodes
    : [];
  return supportedDomainCodes.includes(domainCode);
}

export const KNOWLEDGE_DOMAIN_PROVIDERS = Object.freeze([
  __normalizeKdbProviderForRegistry(architectureProvider),
  __normalizeKdbProviderForRegistry(mediaAnalysisProvider),
]);

export function getKnowledgeDomainProviders() {
  return [...KNOWLEDGE_DOMAIN_PROVIDERS];
}

export function selectKnowledgeDomainProviders(domainCodes = []) {
  const normalizedDomainCodes = Array.isArray(domainCodes)
    ? domainCodes.filter(Boolean).map(String)
    : [domainCodes].filter(Boolean).map(String);

  const providers = getKnowledgeDomainProviders();
  const contractSelect = __kdbArchitectureMediaProviderContract.selectProvidersForDomains;

  if (typeof contractSelect === "function") {
    try {
      const selected = contractSelect(providers, normalizedDomainCodes);
      if (Array.isArray(selected)) return selected;
    } catch {
      // Fall back to local deterministic selection below.
    }

    try {
      const selected = contractSelect(normalizedDomainCodes, providers);
      if (Array.isArray(selected)) return selected;
    } catch {
      // Fall back to local deterministic selection below.
    }
  }

  return providers.filter((provider) =>
    normalizedDomainCodes.some((domainCode) => __providerSupportsDomain(provider, domainCode))
  );
}
// KDB_ARCHITECTURE_MEDIA_PROVIDER_REGISTRY_END

export * from "./helpdesk-provider.mjs";
