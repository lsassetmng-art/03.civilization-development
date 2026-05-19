import { classifyKnowledgeDomains } from "./domain-classifier.mjs";
import {
  createEmptyKnowledgeProviderResult,
  selectProvidersForDomains
} from "./kdb-provider-contract.mjs";
import { createHelpdeskProvider } from "./helpdesk-provider.mjs";

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



// KDB_HELPDESK_PROVIDER_WIRING_START
function collectKdbHelpdeskDomainCodes(runtimeArgs = {}) {
  const runtimeContext = runtimeArgs?.runtimeContext && typeof runtimeArgs.runtimeContext === "object"
    ? runtimeArgs.runtimeContext
    : {};

  return [
    runtimeArgs?.primaryDomainCode,
    runtimeArgs?.primary_domain_code,
    runtimeContext?.primaryDomainCode,
    runtimeContext?.primary_domain_code,
    ...(Array.isArray(runtimeArgs?.secondaryDomainCodes) ? runtimeArgs.secondaryDomainCodes : []),
    ...(Array.isArray(runtimeArgs?.secondary_domain_codes) ? runtimeArgs.secondary_domain_codes : []),
    ...(Array.isArray(runtimeArgs?.domainCodes) ? runtimeArgs.domainCodes : []),
    ...(Array.isArray(runtimeArgs?.domain_codes) ? runtimeArgs.domain_codes : []),
    ...(Array.isArray(runtimeContext?.secondaryDomainCodes) ? runtimeContext.secondaryDomainCodes : []),
    ...(Array.isArray(runtimeContext?.secondary_domain_codes) ? runtimeContext.secondary_domain_codes : []),
    ...(Array.isArray(runtimeContext?.domainCodes) ? runtimeContext.domainCodes : []),
    ...(Array.isArray(runtimeContext?.domain_codes) ? runtimeContext.domain_codes : []),
  ].filter((value) => typeof value === "string" && value.length > 0);
}

function shouldResolveKdbHelpdeskProvider(runtimeArgs = {}) {
  const domainCodes = collectKdbHelpdeskDomainCodes(runtimeArgs);
  return domainCodes.includes("helpdesk") || domainCodes.includes("app_support");
}

function normalizeKdbHelpdeskProviderDependencies(runtimeArgs = {}) {
  const dependencyCandidates = [
    runtimeArgs?.dependencies,
    runtimeArgs?.kdbDependencies,
    runtimeArgs?.knowledgeDependencies,
    runtimeArgs?.runtimeDependencies,
    runtimeArgs,
  ].filter((candidate) => candidate && typeof candidate === "object");

  for (const candidate of dependencyCandidates) {
    const query =
      candidate.query ??
      candidate.dbQuery ??
      candidate.readonlyQuery ??
      candidate.readOnlyQuery;

    if (typeof query === "function") {
      return { query };
    }
  }

  return {};
}

async function resolveKdbHelpdeskProviderForRuntimeContext(runtimeArgs = {}) {
  if (!shouldResolveKdbHelpdeskProvider(runtimeArgs)) {
    return {
      ok: true,
      statusCode: "skipped",
      status: "skipped",
      helpdeskMatches: [],
      safetyCautions: [],
      usageSummary: {
        providerCode: "helpdesk",
        attempted: false,
        skippedReason: "DOMAIN_NOT_SELECTED",
      },
      requiresHumanReview: false,
    };
  }

  const provider = createHelpdeskProvider(
    normalizeKdbHelpdeskProviderDependencies(runtimeArgs),
  );

  return provider.resolveKnowledgeContext({
    ...runtimeArgs,
    runtimeContext: runtimeArgs?.runtimeContext ?? runtimeArgs,
    appCode: runtimeArgs?.appCode ?? runtimeArgs?.sourceAppCode ?? runtimeArgs?.source_app_code,
    sourceAppCode: runtimeArgs?.sourceAppCode ?? runtimeArgs?.source_app_code,
    locale: runtimeArgs?.locale ?? runtimeArgs?.languageCode ?? runtimeArgs?.language_code,
    userQuestion: runtimeArgs?.userQuestion ?? runtimeArgs?.instructionText ?? runtimeArgs?.instruction_text,
    requestKind: runtimeArgs?.requestKind ?? runtimeArgs?.request_kind,
    screenCode: runtimeArgs?.screenCode ?? runtimeArgs?.screen_code,
    flowCode: runtimeArgs?.flowCode ?? runtimeArgs?.flow_code,
    errorCode: runtimeArgs?.errorCode ?? runtimeArgs?.error_code,
    errorText: runtimeArgs?.errorText ?? runtimeArgs?.error_text,
  });
}

function mergeKdbHelpdeskArrays(baseValue, providerValue) {
  const base = Array.isArray(baseValue) ? baseValue : [];
  const next = Array.isArray(providerValue) ? providerValue : [];
  return [...base, ...next];
}

function mergeKdbHelpdeskUsageSummary(baseValue, providerValue) {
  const base = baseValue && typeof baseValue === "object" && !Array.isArray(baseValue)
    ? baseValue
    : {};

  return {
    ...base,
    helpdeskProvider: providerValue ?? {
      providerCode: "helpdesk",
      attempted: false,
    },
  };
}
// KDB_HELPDESK_PROVIDER_WIRING_END

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

  const kdbBaseRuntimeContext = {
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

  const kdbHelpdeskProviderResult = await resolveKdbHelpdeskProviderForRuntimeContext({
    ...args,
    runtimeContext: kdbBaseRuntimeContext,
    primaryDomainCode: kdbBaseRuntimeContext.primaryDomainCode ?? args?.primaryDomainCode,
    secondaryDomainCodes: kdbBaseRuntimeContext.secondaryDomainCodes ?? args?.secondaryDomainCodes,
  });

  return {
    ...kdbBaseRuntimeContext,
    helpdeskMatches: mergeKdbHelpdeskArrays(kdbBaseRuntimeContext.helpdeskMatches, kdbHelpdeskProviderResult?.helpdeskMatches),
    safetyCautions: mergeKdbHelpdeskArrays(kdbBaseRuntimeContext.safetyCautions, kdbHelpdeskProviderResult?.safetyCautions),
    usageSummary: mergeKdbHelpdeskUsageSummary(kdbBaseRuntimeContext.usageSummary, kdbHelpdeskProviderResult?.usageSummary),
    requiresHumanReview: Boolean(kdbBaseRuntimeContext.requiresHumanReview || kdbHelpdeskProviderResult?.requiresHumanReview),
  };
}

// KDB_ARCHITECTURE_MEDIA_RUNTIME_CONTEXT_START
// Runtime-context helper only.
// Scope: build provider-ready context for architecture/media_analysis.
// No server/queue runtime wiring, no DB connection, no DB write, no API POST.

function __kdbArchitectureMediaRuntimeAsArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function __kdbArchitectureMediaRuntimeAsText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function __kdbArchitectureMediaRuntimePickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).length > 0) {
      return value;
    }
  }
  return "";
}

function __kdbArchitectureMediaRuntimeNormalizeSourceFiles(sourceFiles) {
  return __kdbArchitectureMediaRuntimeAsArray(sourceFiles).map((file, index) => {
    if (typeof file === "string") {
      return {
        index,
        name: file.split("/").filter(Boolean).pop() || file,
        path: file,
        reference: file,
        mimeType: "",
        kind: "path_reference",
      };
    }

    const safeFile = file && typeof file === "object" ? file : {};
    const name = __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(
        safeFile.name,
        safeFile.filename,
        safeFile.path,
        safeFile.uri,
        safeFile.reference,
        `source_file_${index + 1}`
      )
    );

    return {
      index,
      name,
      path: __kdbArchitectureMediaRuntimeAsText(safeFile.path || ""),
      reference: __kdbArchitectureMediaRuntimeAsText(
        __kdbArchitectureMediaRuntimePickFirst(safeFile.reference, safeFile.uri, safeFile.path)
      ),
      mimeType: __kdbArchitectureMediaRuntimeAsText(
        __kdbArchitectureMediaRuntimePickFirst(safeFile.mimeType, safeFile.mime, safeFile.contentType)
      ),
      kind: __kdbArchitectureMediaRuntimeAsText(
        __kdbArchitectureMediaRuntimePickFirst(safeFile.kind, safeFile.fileKind, "source_file")
      ),
    };
  });
}

function __kdbArchitectureMediaRuntimeBuildInstructionText(input) {
  const safeInput = input && typeof input === "object" ? input : {};
  return [
    safeInput.instructionText,
    safeInput.instruction,
    safeInput.prompt,
    safeInput.userPrompt,
    safeInput.requestText,
    safeInput.title,
    safeInput.description,
    safeInput.taskText,
    safeInput.artifactKind,
    safeInput.artifact_kind,
  ]
    .filter((value) => value !== undefined && value !== null && String(value).length > 0)
    .map(String)
    .join(" ");
}

function __kdbArchitectureMediaRuntimeNormalizeDomainCodes(domainCodes) {
  return [
    ...new Set(
      __kdbArchitectureMediaRuntimeAsArray(domainCodes)
        .filter(Boolean)
        .map(String)
    ),
  ];
}

function __kdbArchitectureMediaRuntimeProviderCodes(providers) {
  return __kdbArchitectureMediaRuntimeAsArray(providers)
    .map((provider) => provider && provider.providerCode)
    .filter(Boolean)
    .map(String);
}

export async function buildArchitectureMediaKnowledgeRuntimeContext(input = {}) {
  const safeInput = input && typeof input === "object" ? input : {};
  const sourceFiles = __kdbArchitectureMediaRuntimeNormalizeSourceFiles(safeInput.sourceFiles);

  const instructionText = __kdbArchitectureMediaRuntimeBuildInstructionText(safeInput);
  const existingDomainCodes = __kdbArchitectureMediaRuntimeNormalizeDomainCodes(
    safeInput.domainCodes || safeInput.domain_codes || []
  );

  const classifierModule = await import("./domain-classifier.mjs");
  const indexModule = await import("./index.mjs");

  const mergeArchitectureMediaDomainCodes = classifierModule.mergeArchitectureMediaDomainCodes;
  const selectKnowledgeDomainProviders = indexModule.selectKnowledgeDomainProviders;

  if (typeof mergeArchitectureMediaDomainCodes !== "function") {
    throw new Error("mergeArchitectureMediaDomainCodes is not available");
  }

  if (typeof selectKnowledgeDomainProviders !== "function") {
    throw new Error("selectKnowledgeDomainProviders is not available");
  }

  const classifierInput = {
    ...safeInput,
    instructionText,
    sourceFiles,
  };

  const domainCodes = mergeArchitectureMediaDomainCodes(existingDomainCodes, classifierInput);
  const selectedProviders = selectKnowledgeDomainProviders(domainCodes);
  const selectedProviderCodes = __kdbArchitectureMediaRuntimeProviderCodes(selectedProviders);

  return {
    requestId: __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(safeInput.requestId, safeInput.request_id)
    ),
    sourceRouteCode: __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(safeInput.sourceRouteCode, safeInput.source_route_code)
    ),
    sourceAppCode: __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(safeInput.sourceAppCode, safeInput.source_app_code)
    ),
    robotModelCode: __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(safeInput.robotModelCode, safeInput.robot_model_code)
    ),
    roleCode: __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(safeInput.roleCode, safeInput.role_code)
    ),
    instructionText,
    sourceFiles,
    artifactKind: __kdbArchitectureMediaRuntimeAsText(
      __kdbArchitectureMediaRuntimePickFirst(safeInput.artifactKind, safeInput.artifact_kind)
    ),
    classification: safeInput.classification || null,
    domainCodes,
    selectedProviderCodes,
    selectedProviders,
    metadata: {
      helperCode: "architecture_media_runtime_context",
      runtimeWiring: false,
      dbConnection: false,
      dbWrite: false,
      apiPost: false,
      sourceFileCount: sourceFiles.length,
    },
  };
}
// KDB_ARCHITECTURE_MEDIA_RUNTIME_CONTEXT_END
