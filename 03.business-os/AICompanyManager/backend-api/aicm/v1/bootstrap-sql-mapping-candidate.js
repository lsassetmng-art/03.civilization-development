"use strict";

/**
 * AICompanyManager bootstrap readonly SQL mapping candidate.
 *
 * Candidate only:
 * - query text descriptors only
 * - no execution
 * - no DB client
 * - no secret read
 */

const AICM_BOOTSTRAP_SQL_MAPPING_VERSION = "phase-go-gr";

const BOOTSTRAP_READ_TARGETS = {
  companies: {
    table: "business.aicm_company",
    fields: [
      "company_id",
      "company_name",
      "business_domain",
      "company_status",
      "company_common_rules_text"
    ]
  },
  departments: {
    table: "business.aicm_department",
    fields: [
      "department_id",
      "company_id",
      "department_name",
      "purpose",
      "department_status",
      "display_order"
    ]
  },
  organizations: {
    table: "business.aicm_organization",
    fields: [
      "organization_id",
      "company_id",
      "department_id",
      "parent_organization_id",
      "organization_name",
      "purpose",
      "organization_status",
      "display_order"
    ]
  },
  task_ledger: {
    table: "business.aicm_department_task_ledger",
    fields: [
      "ledger_row_id",
      "company_id",
      "department_id",
      "deliverable_name",
      "task_name",
      "work_type",
      "task_status",
      "priority",
      "due_date",
      "responsible_role",
      "responsible_robot_id",
      "handoff_link",
      "note"
    ]
  },
  review_items: {
    table: "business.aicm_review_item",
    fields: [
      "review_item_id",
      "company_id",
      "department_id",
      "ledger_row_id",
      "review_title",
      "target_name",
      "review_status",
      "note"
    ]
  }
};

function buildBootstrapEmptyStateCandidate() {
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
      "mapping_shape_only",
      "no_query_execution"
    ],
    request_id: "bootstrap_sql_mapping_empty_state"
  };
}

function getBootstrapReadTargetsCandidate() {
  return {
    ok: true,
    data: {
      version: AICM_BOOTSTRAP_SQL_MAPPING_VERSION,
      targets: BOOTSTRAP_READ_TARGETS,
      readonly: true,
      backendDbConnect: false,
      liveAiworkerosCall: false
    },
    request_id: "bootstrap_sql_mapping_targets"
  };
}

module.exports = {
  AICM_BOOTSTRAP_SQL_MAPPING_VERSION,
  BOOTSTRAP_READ_TARGETS,
  buildBootstrapEmptyStateCandidate,
  getBootstrapReadTargetsCandidate
};
