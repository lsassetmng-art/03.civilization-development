"use strict";

/**
 * AICompanyManager backend API runtime contract candidate.
 *
 * Candidate only:
 * - no server listen
 * - no DB connection
 * - no secret load
 * - no network request
 * - no AIWorkerOS call
 */

const AICM_RUNTIME_CONTRACT_VERSION = "phase-go-gr";
const AICM_RUNTIME_CANDIDATE_ENABLED = false;

function createRuntimeContextCandidate(input) {
  const source = input || {};
  return {
    ok: true,
    data: {
      version: AICM_RUNTIME_CONTRACT_VERSION,
      enabled: AICM_RUNTIME_CANDIDATE_ENABLED,
      method: source.method || "GET",
      path: source.path || "/api/aicm/v1/bootstrap",
      readonly: true,
      realApiConnect: false,
      backendDbConnect: false,
      liveAiworkerosCall: false
    },
    warnings: [
      "candidate_only",
      "no_server_listen",
      "no_db_connection",
      "no_network_execution"
    ],
    request_id: "runtime_contract_candidate"
  };
}

function assertReadonlyMethodCandidate(method) {
  if ((method || "GET").toUpperCase() !== "GET") {
    return {
      ok: false,
      error_code: "AICM_READONLY_METHOD_REQUIRED",
      error_message: "Readonly bootstrap candidate only accepts GET.",
      details: {
        method: method || ""
      },
      request_id: "runtime_contract_method_rejected"
    };
  }

  return {
    ok: true,
    data: {
      method: "GET",
      readonly: true
    },
    request_id: "runtime_contract_method_ok"
  };
}

module.exports = {
  AICM_RUNTIME_CONTRACT_VERSION,
  AICM_RUNTIME_CANDIDATE_ENABLED,
  createRuntimeContextCandidate,
  assertReadonlyMethodCandidate
};
