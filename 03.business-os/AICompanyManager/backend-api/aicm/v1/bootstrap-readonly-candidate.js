"use strict";

/**
 * AICompanyManager readonly bootstrap backend candidate.
 *
 * Candidate only:
 * - no DB connection
 * - no Supabase client
 * - no service role
 * - no AIWorkerOS call
 * - no network call
 *
 * Future endpoint:
 * - GET /api/aicm/v1/bootstrap
 */

const AICM_BOOTSTRAP_READONLY_CANDIDATE_VERSION = "phase-gg-gj";
const AICM_BOOTSTRAP_READONLY_CANDIDATE_ENABLED = false;

function buildDisabledBootstrapResponse(requestId) {
  return {
    ok: false,
    error_code: "AICM_BACKEND_BOOTSTRAP_CANDIDATE_DISABLED",
    error_message: "Readonly bootstrap backend candidate exists but real API connect is disabled.",
    details: {
      endpoint: "/api/aicm/v1/bootstrap",
      method: "GET",
      candidate_version: AICM_BOOTSTRAP_READONLY_CANDIDATE_VERSION,
      dbConnect: false,
      serviceRole: false,
      realApiConnect: false,
      liveAiworkerosCall: false
    },
    request_id: requestId || "bootstrap_candidate_disabled"
  };
}

function buildEmptyReadonlyBootstrapSuccess(requestId) {
  return {
    ok: true,
    data: {
      companies: [],
      current_company_id: "",
      departments: [],
      organizations: [],
      task_ledger: [],
      review_items: [],
      repository_mode: "api_readonly_candidate"
    },
    warnings: [
      "candidate_only",
      "no_db_connection",
      "no_network_execution"
    ],
    request_id: requestId || "bootstrap_candidate_success_shape"
  };
}

async function handleReadonlyBootstrapCandidate(request) {
  const requestId = "bootstrap_candidate_request";

  if (!AICM_BOOTSTRAP_READONLY_CANDIDATE_ENABLED) {
    return buildDisabledBootstrapResponse(requestId);
  }

  return buildEmptyReadonlyBootstrapSuccess(requestId);
}

module.exports = {
  AICM_BOOTSTRAP_READONLY_CANDIDATE_VERSION,
  AICM_BOOTSTRAP_READONLY_CANDIDATE_ENABLED,
  buildDisabledBootstrapResponse,
  buildEmptyReadonlyBootstrapSuccess,
  handleReadonlyBootstrapCandidate
};
