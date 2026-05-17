import { classifyKnowledgeDomains } from "./domain-classifier.mjs";
import {
  createEmptyKnowledgeProviderResult,
  selectProvidersForDomains
} from "./kdb-provider-contract.mjs";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mergeProviderResults(results) {
  const selectedReferences = [];
  const helpdeskMatches = [];
  const guardrailFindings = [];
  const safetyCautions = [];
  const usageParts = [];
  let requiresHumanReview = false;

  for (const result of results) {
    if (!result || typeof result !== "object") continue;
    selectedReferences.push(...(result.selectedReferences ?? []));
    helpdeskMatches.push(...(result.helpdeskMatches ?? []));
    guardrailFindings.push(...(result.guardrailFindings ?? []));
    safetyCautions.push(...(result.safetyCautions ?? []));
    if (result.usageSummary) usageParts.push(result.usageSummary);
    if (result.requiresHumanReview) requiresHumanReview = true;
  }

  return {
    selectedReferences,
    helpdeskMatches,
    guardrailFindings,
    safetyCautions,
    usageSummary: usageParts.join("\n").trim(),
    requiresHumanReview
  };
}

export async function buildKnowledgeRuntimeContext(args = {}) {
  const classification = classifyKnowledgeDomains(args);
  const domainCodes = unique([
    classification.primaryDomainCode,
    ...(classification.secondaryDomainCodes ?? []),
    ...(classification.safetyDomainCodes ?? [])
  ]);

  const providers = args.providers ?? [];
  const matchedProviders = selectProvidersForDomains(providers, domainCodes);

  const providerResults = [];
  for (const provider of matchedProviders) {
    if (provider.resolveKnowledgeContext) {
      const result = await provider.resolveKnowledgeContext({
        ...args,
        classification,
        domainCodes
      });
      providerResults.push(result ?? createEmptyKnowledgeProviderResult({
        providerCode: provider.providerCode,
        supportedDomainCodes: provider.supportedDomainCodes
      }));
    }
  }

  const merged = mergeProviderResults(providerResults);

  return {
    ok: true,
    primaryDomainCode: classification.primaryDomainCode,
    secondaryDomainCodes: classification.secondaryDomainCodes,
    safetyDomainCodes: classification.safetyDomainCodes,
    allowedReferenceDepthCode: args.allowedReferenceDepthCode ?? "unresolved",
    selectedReferences: merged.selectedReferences,
    helpdeskMatches: merged.helpdeskMatches,
    guardrailFindings: merged.guardrailFindings,
    safetyCautions: merged.safetyCautions,
    usageSummary: merged.usageSummary || classification.classificationSummary,
    requiresHumanReview: Boolean(classification.requiresHumanReview || merged.requiresHumanReview),
    providerCount: matchedProviders.length,
    providerCodes: matchedProviders.map((provider) => provider.providerCode),
    classification
  };
}
