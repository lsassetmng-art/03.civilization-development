"use strict";

/**
 * AICompanyManager write API adapter disabled candidate.
 *
 * Disabled by design:
 * - no DB write
 * - no DB connection
 * - no credential loading
 * - no SQL execution
 * - no review action
 * - no CSV import
 * - no workflow start
 * - no AIWorkerOS call
 */

const AICM_WRITE_API_ADAPTER_VERSION = "phase-hm-hp";
const AICM_WRITE_API_ADAPTER_ENABLED = false;

const AICM_WRITE_ENDPOINTS = {
  saveCompany: "/api/aicm/v1/companies/save",
  saveCompanyRules: "/api/aicm/v1/companies/rules/save",
  saveDepartment: "/api/aicm/v1/departments/save",
  saveOrganization: "/api/aicm/v1/organizations/save",
  saveLedgerRow: "/api/aicm/v1/ledger/save"
};

function getWriteApiAdapterDisabledStatus() {
  return {
    ok: true,
    data: {
      version: AICM_WRITE_API_ADAPTER_VERSION,
      enabled: AICM_WRITE_API_ADAPTER_ENABLED,
      endpoints: AICM_WRITE_ENDPOINTS,
      dbWrite: false,
      backendDbWrite: false,
      reviewAction: false,
      csvImport: false,
      workflowStart: false,
      liveAiworkerosCall: false
    },
    warnings: [
      "candidate_only",
      "disabled_until_boss_write_ok",
      "no_write_execution"
    ],
    request_id: "write_api_adapter_disabled_status"
  };
}

function disabledWriteResult(action, payload) {
  return {
    ok: false,
    error_code: "AICM_WRITE_API_DISABLED",
    error_message: "Write API adapter is disabled until Boss write API OK.",
    details: {
      action: action,
      payload: payload || {},
      dbWrite: false,
      backendDbWrite: false,
      reviewAction: false,
      csvImport: false,
      workflowStart: false,
      liveAiworkerosCall: false,
      requiredBossOk: [
        "write API OK",
        "書き込みAPI OK",
        "company/department/organization/ledger write OK"
      ]
    },
    request_id: "write_api_disabled"
  };
}

function saveCompanyDisabled(payload) {
  return disabledWriteResult("saveCompany", payload);
}

function saveCompanyRulesDisabled(payload) {
  return disabledWriteResult("saveCompanyRules", payload);
}

function saveDepartmentDisabled(payload) {
  return disabledWriteResult("saveDepartment", payload);
}

function saveOrganizationDisabled(payload) {
  return disabledWriteResult("saveOrganization", payload);
}

function saveLedgerRowDisabled(payload) {
  return disabledWriteResult("saveLedgerRow", payload);
}

module.exports = {
  AICM_WRITE_API_ADAPTER_VERSION,
  AICM_WRITE_API_ADAPTER_ENABLED,
  AICM_WRITE_ENDPOINTS,
  getWriteApiAdapterDisabledStatus,
  saveCompanyDisabled,
  saveCompanyRulesDisabled,
  saveDepartmentDisabled,
  saveOrganizationDisabled,
  saveLedgerRowDisabled
};
