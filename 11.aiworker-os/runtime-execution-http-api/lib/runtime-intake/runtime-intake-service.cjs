"use strict";

const path = require("node:path");

const DEFAULT_REQUIRED_FIELDS = Object.freeze([
  "app_surface_code",
  "model_code",
  "task_domain_code",
  "task_title",
  "task_instruction_ja"
]);

function isPlainObject(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function firstText(values) {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) return normalized;
  }

  return "";
}

function detectInstructionSource(
  value,
  prefix = "",
  seen = new Set()
) {
  if (!isPlainObject(value) || seen.has(value)) {
    return "";
  }

  seen.add(value);

  const directKeys = [
    "task_instruction_ja",
    "instruction_text",
    "instructionText",
    "task_instruction",
    "taskInstruction",
    "instruction",
    "prompt_ja",
    "prompt",
    "task_description",
    "taskDescription",
    "text"
  ];

  for (const key of directKeys) {
    if (normalizeText(value[key])) {
      return prefix
        ? `${prefix}.${key}`
        : key;
    }
  }

  const wrapperKeys = [
    "request",
    "payload",
    "body",
    "data",
    "input"
  ];

  for (const key of wrapperKeys) {
    if (!isPlainObject(value[key])) {
      continue;
    }

    const nested = detectInstructionSource(
      value[key],
      prefix ? `${prefix}.${key}` : key,
      seen
    );

    if (nested) {
      return nested;
    }
  }

  return "";
}

function mapSourceFailureReason(reason) {
  const value = normalizeText(reason);

  const map = {
    FILE_OUTSIDE_ALLOWED_ROOT:
      "SOURCE_FILE_OUTSIDE_ALLOWED_ROOT",

    SOURCE_FILE_OUTSIDE_ALLOWED_ROOT:
      "SOURCE_FILE_OUTSIDE_ALLOWED_ROOT",

    FILE_NOT_FOUND:
      "SOURCE_FILE_NOT_FOUND",

    SOURCE_FILE_NOT_FOUND:
      "SOURCE_FILE_NOT_FOUND",

    FILE_TOO_LARGE:
      "SOURCE_FILE_TOO_LARGE",

    SOURCE_FILE_TOO_LARGE:
      "SOURCE_FILE_TOO_LARGE",

    SOURCE_FILE_COUNT_EXCEEDED:
      "SOURCE_FILE_COUNT_EXCEEDED",

    SOURCE_FILE_TOTAL_TEXT_EXCEEDED:
      "SOURCE_FILE_TOTAL_TEXT_EXCEEDED",

    SOURCE_FILES_INVALID_SHAPE:
      "SOURCE_FILES_INVALID_SHAPE",

    FILE_OWNERSHIP_REJECTED:
      "SOURCE_FILE_OWNERSHIP_REJECTED",

    SOURCE_FILE_OWNERSHIP_REJECTED:
      "SOURCE_FILE_OWNERSHIP_REJECTED",

    MISSING_PATH:
      "SOURCE_FILES_INVALID_SHAPE",

    INVALID_PATH:
      "SOURCE_FILES_INVALID_SHAPE",

    PATH_TRAVERSAL_REJECTED:
      "SOURCE_FILES_INVALID_SHAPE",

    NOT_A_FILE:
      "SOURCE_FILES_INVALID_SHAPE",

    FILE_STAT_FAILED:
      "SOURCE_FILES_INVALID_SHAPE",

    FILE_NOT_READABLE:
      "SOURCE_FILES_INVALID_SHAPE"
  };

  return map[value] || "";
}

function resolveSourceFailureCode(sourceResult) {
  const direct = mapSourceFailureReason(
    sourceResult &&
    sourceResult.reason
  );

  if (direct) {
    return direct;
  }

  const errors =
    sourceResult &&
    Array.isArray(sourceResult.validation_errors)
      ? sourceResult.validation_errors
      : [];

  for (const error of errors) {
    const mapped = mapSourceFailureReason(
      error &&
      (
        error.reason ||
        error.code
      )
    );

    if (mapped) {
      return mapped;
    }
  }

  return "SOURCE_FILE_VALIDATION_FAILED";
}

function normalizeInstructionText(value, seen = new Set()) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!isPlainObject(value) || seen.has(value)) {
    return "";
  }

  seen.add(value);

  const directKeys = [
    "task_instruction_ja",
    "instruction_text",
    "instructionText",
    "task_instruction",
    "taskInstruction",
    "instruction",
    "prompt_ja",
    "prompt",
    "task_description",
    "taskDescription",
    "text"
  ];

  for (const key of directKeys) {
    const normalized =
      normalizeInstructionText(value[key], seen);

    if (normalized) {
      return normalized;
    }
  }

  const wrapperKeys = [
    "request",
    "payload",
    "body",
    "data",
    "input"
  ];

  for (const key of wrapperKeys) {
    const normalized =
      normalizeInstructionText(value[key], seen);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeInstructionPayload(input) {
  const payload = isPlainObject(input)
    ? { ...input }
    : {};

  if (!normalizeText(payload.task_instruction_ja)) {
    const instruction =
      normalizeInstructionText(payload);

    if (instruction) {
      payload.task_instruction_ja = instruction;
    }
  }

  return payload;
}

function referenceFilesTextToSourceFiles(value) {
  const raw = normalizeText(value);

  if (!raw) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const filePath = rawLine.trim();

    if (!filePath) {
      continue;
    }

    // reference_files_text is a mixed-use AICM field.
    // Only absolute filesystem paths are source-file candidates.
    if (!path.isAbsolute(filePath)) {
      continue;
    }

    if (seen.has(filePath)) {
      continue;
    }

    seen.add(filePath);
    result.push({ path: filePath });
  }

  return result;
}

function normalizeSourceAliases(input) {
  const payload = isPlainObject(input)
    ? { ...input }
    : {};

  if (
    payload.source_files === undefined &&
    payload.sourceFiles !== undefined
  ) {
    payload.source_files = payload.sourceFiles;
  }

  return payload;
}

function failure(
  statusCode,
  code,
  message,
  options = {}
) {
  return {
    ok: false,
    statusCode,
    error: {
      code,
      message,
      field: options.field || null,
      stage: options.stage || "runtime_intake",
      retryable: Boolean(options.retryable),
      details: Array.isArray(options.details)
        ? options.details
        : []
    },
    safety: {
      external_execution_performed_flag: false,
      pg_apply_performed_flag: false,
      destructive_action_performed_flag: false
    }
  };
}

function resolveRuntimeRequestId(result) {
  if (!isPlainObject(result)) {
    return "";
  }

  return firstText([
    result.request_id,
    result.runtime_request_id,
    result.data && result.data.request_id,
    result.data && result.data.runtime_request_id
  ]);
}

function createRuntimeIntakeService(
  dependencies = {}
) {
  const prepareSourceMaterial =
    dependencies.prepareSourceMaterial;

  const buildKnowledgeContext =
    dependencies.buildKnowledgeContext;

  const runGuardrailPreflight =
    dependencies.runGuardrailPreflight;

  const persistGuardrailResult =
    dependencies.persistGuardrailResult;

  const createRuntimeRequestCore =
    dependencies.createRuntimeRequestCore;

  const requiredFields =
    Array.isArray(dependencies.requiredFields) &&
    dependencies.requiredFields.length > 0
      ? [...dependencies.requiredFields]
      : [...DEFAULT_REQUIRED_FIELDS];

  const logger =
    dependencies.logger || console;

  if (typeof createRuntimeRequestCore !== "function") {
    throw new TypeError(
      "createRuntimeRequestCore dependency is required"
    );
  }

  async function execute(input = {}) {
    const channel =
      normalizeText(input.channel) || "unknown";

    const rawPayload =
      isPlainObject(input.payload)
        ? input.payload
        : {};

    const instructionSource =
      detectInstructionSource(rawPayload);

    let payload =
      normalizeInstructionPayload(rawPayload);

    payload =
      normalizeSourceAliases(payload);

    const idempotencyKey =
      firstText([
        payload.idempotency_key,
        input.idempotencyKey
      ]);

    if (!idempotencyKey) {
      return failure(
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
        "Idempotency-Key is required",
        {
          field: "idempotency_key",
          stage: "intake_validation"
        }
      );
    }

    payload = {
      ...payload,
      idempotency_key: idempotencyKey
    };

    for (const field of requiredFields) {
      if (!normalizeText(payload[field])) {
        return failure(
          400,
          "REQUIRED_FIELD_MISSING",
          `Missing required field: ${field}`,
          {
            field,
            stage: "intake_validation"
          }
        );
      }
    }

    if (
      typeof prepareSourceMaterial === "function"
    ) {
      let sourceResult;

      try {
        sourceResult =
          await prepareSourceMaterial(
            payload,
            {
              channel,
              idempotencyKey
            }
          );
      } catch (error) {
        return failure(
          500,
          "SOURCE_MATERIAL_INTAKE_FAILED",
          error && error.message
            ? error.message
            : "source material intake failed",
          {
            stage: "source_material",
            retryable: true
          }
        );
      }

      if (
        !sourceResult ||
        sourceResult.ok !== true
      ) {
        return failure(
          Number(
            sourceResult &&
            sourceResult.statusCode
          ) || 400,
          resolveSourceFailureCode(sourceResult),
          firstText([
            sourceResult && sourceResult.message,
            "source material validation failed"
          ]),
          {
            stage: "source_material",
            retryable: Boolean(
              sourceResult &&
              sourceResult.retryable
            ),
            details: [
              ...(
                Array.isArray(
                  sourceResult &&
                  sourceResult.validation_errors
                )
                  ? sourceResult.validation_errors
                  : []
              ),
              ...(
                Array.isArray(
                  sourceResult &&
                  sourceResult.warnings
                )
                  ? sourceResult.warnings
                  : []
              )
            ]
          }
        );
      }

      if (isPlainObject(sourceResult.payload)) {
        payload = sourceResult.payload;
      }
    }

    if (
      typeof buildKnowledgeContext === "function"
    ) {
      let knowledgeResult;

      try {
        knowledgeResult =
          await buildKnowledgeContext(
            payload,
            {
              channel,
              idempotencyKey
            }
          );
      } catch (error) {
        return failure(
          500,
          "KNOWLEDGE_CONTEXT_FAILED",
          error && error.message
            ? error.message
            : "knowledge context preparation failed",
          {
            stage: "knowledge_context",
            retryable: true
          }
        );
      }

      if (
        knowledgeResult &&
        knowledgeResult.ok === false
      ) {
        return failure(
          Number(knowledgeResult.statusCode) || 500,
          firstText([
            knowledgeResult.code,
            knowledgeResult.reason,
            "KNOWLEDGE_CONTEXT_FAILED"
          ]),
          firstText([
            knowledgeResult.message,
            "knowledge context preparation failed"
          ]),
          {
            stage: "knowledge_context",
            retryable: Boolean(
              knowledgeResult.retryable
            )
          }
        );
      }

      if (
        knowledgeResult &&
        isPlainObject(knowledgeResult.payload)
      ) {
        payload = knowledgeResult.payload;
      }
    }

    let guardrailDecision = null;

    if (
      typeof runGuardrailPreflight === "function"
    ) {
      try {
        guardrailDecision =
          await runGuardrailPreflight(payload);
      } catch (error) {
        return failure(
          500,
          "GUARDRAIL_PREFLIGHT_FAILED",
          error && error.message
            ? error.message
            : "Guardrail preflight failed",
          {
            stage: "guardrail_preflight",
            retryable: true
          }
        );
      }

      const checkStatus =
        normalizeText(
          guardrailDecision &&
          guardrailDecision.check_status_code
        ).toLowerCase();

      if (
        guardrailDecision &&
        (
          guardrailDecision.blocking_flag === true ||
          checkStatus === "blocked"
        )
      ) {
        return failure(
          403,
          "GUARDRAIL_REJECTED",
          firstText([
            guardrailDecision
              .required_next_action_text,
            guardrailDecision
              .check_summary_text,
            "Guardrail rejected the runtime request"
          ]),
          {
            stage: "guardrail_preflight",
            details: [guardrailDecision]
          }
        );
      }

      if (
        guardrailDecision &&
        (
          guardrailDecision
            .review_required_flag === true ||
          guardrailDecision
            .confirmation_required_flag === true ||
          checkStatus === "review_required" ||
          checkStatus === "confirmation_required"
        )
      ) {
        return failure(
          409,
          "GUARDRAIL_REVIEW_REQUIRED",
          firstText([
            guardrailDecision
              .required_next_action_text,
            guardrailDecision
              .check_summary_text,
            "Guardrail review is required"
          ]),
          {
            stage: "guardrail_preflight",
            details: [guardrailDecision]
          }
        );
      }
    }

    let runtimeResult;

    try {
      runtimeResult =
        await Promise.resolve(
          createRuntimeRequestCore(
            payload,
            idempotencyKey
          )
        );
    } catch (error) {
      const statusCode =
        Number(error && error.httpStatus) ||
        500;

      return failure(
        statusCode,
        firstText([
          error && error.code,
          "RUNTIME_CREATE_FAILED"
        ]),
        error && error.message
          ? error.message
          : "runtime request creation failed",
        {
          stage: "runtime_create",
          retryable: statusCode >= 500
        }
      );
    }

    if (
      runtimeResult &&
      (
        runtimeResult.ok === false ||
        runtimeResult.result === "error"
      )
    ) {
      return failure(
        Number(runtimeResult.statusCode) ||
        Number(runtimeResult.http_status) ||
        400,
        firstText([
          runtimeResult.error_code,
          runtimeResult.code,
          "RUNTIME_CREATE_REJECTED"
        ]),
        firstText([
          runtimeResult.message,
          "runtime request was rejected"
        ]),
        {
          stage: "runtime_create",
          retryable: Boolean(
            runtimeResult.retryable
          )
        }
      );
    }

    let guardrailPersistence = null;

    if (
      guardrailDecision &&
      typeof persistGuardrailResult ===
        "function"
    ) {
      const requestId =
        resolveRuntimeRequestId(runtimeResult);

      if (requestId) {
        try {
          guardrailPersistence =
            await persistGuardrailResult(
              {
                ...payload,
                request_id: requestId
              },
              guardrailDecision
            );
        } catch (error) {
          guardrailPersistence = {
            runtime_check_result_id: null,
            persistence_error_message:
              error && error.message
                ? error.message
                : String(error)
          };

          if (
            logger &&
            typeof logger.error === "function"
          ) {
            logger.error(
              "[R85] Guardrail persistence failed",
              guardrailPersistence
                .persistence_error_message
            );
          }
        }
      }
    }

    const acceptedSourceFiles =
      Array.isArray(payload.source_files)
        ? payload.source_files
        : [];

    const sourceRouteCode =
      firstText([
        payload.source_route_code,
        payload.metadata_jsonb &&
        payload.metadata_jsonb.source_route_code,
        input.sourceContext &&
        input.sourceContext.sourceRouteCode
      ]);

    const guardrailStatus =
      guardrailDecision
        ? (
            normalizeText(
              guardrailDecision.check_status_code
            ).toLowerCase() ||
            "allowed"
          )
        : "not_run";

    return {
      ok: true,
      statusCode: 201,
      result: runtimeResult,
      request: payload,
      intake_audit: {
        channel,
        instruction_source:
          instructionSource ||
          (
            normalizeText(payload.task_instruction_ja)
              ? "task_instruction_ja"
              : ""
          ),
        source_file_count:
          acceptedSourceFiles.length,
        source_material_status:
          acceptedSourceFiles.length > 0
            ? "accepted"
            : "not_provided",
        guardrail_status:
          guardrailStatus,
        source_route_code:
          sourceRouteCode
      },
      guardrail: {
        decision: guardrailDecision,
        persistence: guardrailPersistence
      }
    };
  }

  return Object.freeze({
    execute
  });
}

module.exports = {
  DEFAULT_REQUIRED_FIELDS,
  createRuntimeIntakeService,
  normalizeInstructionPayload,
  referenceFilesTextToSourceFiles
};
