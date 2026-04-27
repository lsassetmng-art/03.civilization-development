"use strict";

/**
 * AICompanyManager readonly adapter candidate.
 *
 * Candidate only:
 * - no database connection
 * - no secret read
 * - no service role
 * - no network request
 */

const AICM_READONLY_ADAPTER_VERSION = "phase-go-gr";
const AICM_READONLY_ADAPTER_ENABLED = false;

function buildReadonlyAdapterStatusCandidate() {
  return {
    ok: true,
    data: {
      version: AICM_READONLY_ADAPTER_VERSION,
      enabled: AICM_READONLY_ADAPTER_ENABLED,
      backendDbConnect: false,
      serviceRole: false,
      realApiConnect: false,
      liveAiworkerosCall: false,
      tables: [
        "business.aicm_company",
        "business.aicm_department",
        "business.aicm_organization",
        "business.aicm_department_task_ledger",
        "business.aicm_review_item"
      ]
    },
    warnings: [
      "candidate_only",
      "adapter_not_connected",
      "readonly_shape_only"
    ],
    request_id: "readonly_adapter_candidate_status"
  };
}

function readBootstrapCandidate() {
  return {
    ok: false,
    error_code: "AICM_READONLY_ADAPTER_CANDIDATE_DISABLED",
    error_message: "Readonly adapter candidate exists but backend DB connect is disabled.",
    details: {
      backendDbConnect: false,
      serviceRole: false,
      realApiConnect: false,
      liveAiworkerosCall: false
    },
    request_id: "readonly_adapter_candidate_disabled"
  };
}

module.exports = {
  AICM_READONLY_ADAPTER_VERSION,
  AICM_READONLY_ADAPTER_ENABLED,
  buildReadonlyAdapterStatusCandidate,
  readBootstrapCandidate
};
