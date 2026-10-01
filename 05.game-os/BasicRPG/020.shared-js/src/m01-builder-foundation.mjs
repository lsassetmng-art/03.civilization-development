const REQUIRED_CREATE_FIELDS = Object.freeze([
  "payloadVersion",
  "commandId",
  "idempotencyKey",
  "workspaceCode",
  "projectCode",
  "projectName",
  "runtimeFamilyCode",
  "runtimeProfileCode",
  "defaultLanguageCode"
]);

function cleanText(value) {
  return typeof value === "string" ? value.trim() : value;
}

function optionalText(value) {
  const cleaned = cleanText(value);
  return cleaned === "" || cleaned === undefined ? null : cleaned;
}

export function normalizeCreateProjectRequest(input = {}) {
  return Object.freeze({
    payloadVersion: Number(input.payloadVersion),
    commandId: cleanText(input.commandId),
    idempotencyKey: cleanText(input.idempotencyKey),
    workspaceCode: cleanText(input.workspaceCode),
    projectCode: cleanText(input.projectCode),
    projectName: cleanText(input.projectName),
    runtimeFamilyCode: cleanText(input.runtimeFamilyCode),
    runtimeProfileCode: cleanText(input.runtimeProfileCode),
    templateFamilyCode: optionalText(input.templateFamilyCode),
    templateProfileCode: optionalText(input.templateProfileCode),
    defaultLanguageCode: cleanText(input.defaultLanguageCode)
  });
}

export function createIntentSignature(input) {
  const value = normalizeCreateProjectRequest(input);

  return JSON.stringify([
    value.payloadVersion,
    value.commandId,
    value.idempotencyKey,
    value.workspaceCode,
    value.projectCode,
    value.projectName,
    value.runtimeFamilyCode,
    value.runtimeProfileCode,
    value.templateFamilyCode,
    value.templateProfileCode,
    value.defaultLanguageCode
  ]);
}

export function compareIdempotentReplay(existingInput, replayInput) {
  return createIntentSignature(existingInput) === createIntentSignature(replayInput)
    ? "same_intent"
    : "conflict";
}

export function validateCreateProjectRequest(input, basis = {}) {
  const request = normalizeCreateProjectRequest(input);
  const errors = [];

  for (const field of REQUIRED_CREATE_FIELDS) {
    const value = request[field];

    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (field === "payloadVersion" && !Number.isFinite(value))
    ) {
      errors.push({
        field,
        code: "required"
      });
    }
  }

  if (request.payloadVersion !== 1) {
    errors.push({
      field: "payloadVersion",
      code: "unsupported_payload_version"
    });
  }

  if (!basis.workspace) {
    errors.push({
      field: "workspaceCode",
      code: "workspace_not_found"
    });
  }

  if (!basis.runtimeProfile) {
    errors.push({
      field: "runtimeProfileCode",
      code: "runtime_profile_not_found"
    });
  } else {
    if (
      basis.runtimeProfile.runtimeProfileCode !== request.runtimeProfileCode
    ) {
      errors.push({
        field: "runtimeProfileCode",
        code: "runtime_profile_identity_mismatch"
      });
    }

    if (
      basis.runtimeProfile.runtimeFamilyCode !== request.runtimeFamilyCode
    ) {
      errors.push({
        field: "runtimeFamilyCode",
        code: "runtime_family_incompatible"
      });
    }
  }

  if (request.templateProfileCode) {
    if (!basis.templateProfile) {
      errors.push({
        field: "templateProfileCode",
        code: "template_profile_not_found"
      });
    } else {
      if (
        basis.templateProfile.templateProfileCode !==
        request.templateProfileCode
      ) {
        errors.push({
          field: "templateProfileCode",
          code: "template_profile_identity_mismatch"
        });
      }

      if (
        basis.templateProfile.runtimeFamilyCode !== request.runtimeFamilyCode
      ) {
        errors.push({
          field: "templateProfileCode",
          code: "template_runtime_incompatible"
        });
      }

      if (
        request.templateFamilyCode &&
        basis.templateProfile.templateFamilyCode !== request.templateFamilyCode
      ) {
        errors.push({
          field: "templateFamilyCode",
          code: "template_family_incompatible"
        });
      }
    }
  }

  return Object.freeze({
    ok: errors.length === 0,
    request,
    errors: Object.freeze(errors)
  });
}

export function buildInitialProjectState({
  projectCode,
  workspaceCode,
  projectName,
  runtimeFamilyCode,
  runtimeProfileCode,
  templateProfileCode = null,
  latestRevisionRef
}) {
  if (!latestRevisionRef) {
    throw new Error("latestRevisionRef is required for M01 initial state");
  }

  return Object.freeze({
    projectCode,
    workspaceCode,
    projectName,
    runtimeFamilyCode,
    runtimeProfileCode,
    templateProfileCode,
    latestRevisionRef,
    latestAutosaveSnapshotRef: null,
    revisionNo: 1,
    saveState: "draft",
    inlineValidationState: "not_run",
    exportReadinessState: "not_ready",
    publishReadinessState: "not_ready",
    collaborationLockState: "unlocked"
  });
}

export function createFailure({
  errorCode = "GAME_PROJECT_CREATE_BASIS_INVALID",
  errorMessage,
  errorState = "failed",
  details = {},
  retryAllowed = false
}) {
  return Object.freeze({
    errorCode,
    errorMessage,
    errorState,
    details,
    retryAllowed
  });
}

export function mapProjectSummary(project) {
  if (!project || !project.projectCode) {
    throw new Error("project summary requires projectCode");
  }

  return Object.freeze({
    projectCode: project.projectCode,
    workspaceCode: project.workspaceCode,
    projectName: project.projectName,
    runtimeFamilyCode: project.runtimeFamilyCode,
    runtimeProfileCode: project.runtimeProfileCode,
    templateProfileCode: project.templateProfileCode ?? null,
    latestRevisionRef: project.latestRevisionRef,
    latestAutosaveSnapshotRef: project.latestAutosaveSnapshotRef ?? null,
    saveState: project.saveState,
    inlineValidationState: project.inlineValidationState,
    exportReadinessState: project.exportReadinessState,
    publishReadinessState: project.publishReadinessState,
    collaborationLockState: project.collaborationLockState
  });
}
