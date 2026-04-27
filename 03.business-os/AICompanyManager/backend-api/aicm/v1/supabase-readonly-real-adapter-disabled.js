"use strict";

/**
 * AICompanyManager backend readonly real adapter disabled candidate.
 *
 * This file prepares the shape of the future real adapter.
 *
 * Disabled by design:
 * - no environment secret read
 * - no database client creation
 * - no privileged credential usage
 * - no DB connection
 * - no SQL execution
 * - no AIWorkerOS call
 */

const AICM_BACKEND_READONLY_REAL_ADAPTER_VERSION = "phase-ha-hd-prep-repaired";
const AICM_BACKEND_READONLY_REAL_ADAPTER_ENABLED = false;

const AICM_READONLY_TABLES = [
  "business.aicm_company",
  "business.aicm_department",
  "business.aicm_organization",
  "business.aicm_department_task_ledger",
  "business.aicm_review_item"
];

function getReadonlyRealAdapterDisabledStatus() {
  return {
    ok: true,
    data: {
      version: AICM_BACKEND_READONLY_REAL_ADAPTER_VERSION,
      enabled: AICM_BACKEND_READONLY_REAL_ADAPTER_ENABLED,
      backendDbConnect: false,
      serviceRole: false,
      realApiConnect: false,
      liveAiworkerosCall: false,
      readonlyTables: AICM_READONLY_TABLES
    },
    warnings: [
      "candidate_only",
      "disabled_until_boss_ok",
      "no_db_connection",
      "no_secret_read"
    ],
    request_id: "backend_readonly_real_adapter_disabled_status"
  };
}

function readBootstrapRealAdapterDisabled() {
  return {
    ok: false,
    error_code: "AICM_BACKEND_READONLY_REAL_ADAPTER_DISABLED",
    error_message: "Backend readonly real adapter is disabled until Boss implementation OK.",
    details: {
      backendDbConnect: false,
      serviceRole: false,
      realApiConnect: false,
      liveAiworkerosCall: false,
      requiredBossOk: [
        "implementation OK",
        "API接続 OK",
        "readonly API OK"
      ]
    },
    request_id: "backend_readonly_real_adapter_disabled"
  };
}

module.exports = {
  AICM_BACKEND_READONLY_REAL_ADAPTER_VERSION,
  AICM_BACKEND_READONLY_REAL_ADAPTER_ENABLED,
  AICM_READONLY_TABLES,
  getReadonlyRealAdapterDisabledStatus,
  readBootstrapRealAdapterDisabled
};
