(function (global) {
  "use strict";

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function files(id) {
    var input = document.getElementById(id);
    if (!input || !input.files) return [];
    return Array.prototype.map.call(input.files, function (file) {
      return {
        file_name: file.name,
        name: file.name,
        file_size_bytes: file.size,
        size: file.size,
        mime_type: file.type || "",
        storage_scope: "metadata_only",
        storage_ref: null,
        note: ""
      };
    });
  }

  function selectedValues(id) {
    var select = document.getElementById(id);
    var values = [];
    var i;
    if (!select) return values;
    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].selected) values.push(select.options[i].value);
    }
    return values;
  }

  function robotAssignments(id, companyId, departmentId, organizationId) {
    return selectedValues(id).map(function (robotId) {
      return {
        company_id: companyId || "",
        department_id: departmentId || "",
        organization_id: organizationId || "",
        aiworker_robot_id: robotId,
        role_name: "Worker",
        display_name: "",
        assignment_status: "active"
      };
    });
  }

  function buildCreateCompanyPayload() {
    return {
      company_name: val("new-company-name"),
      business_domain: val("new-company-domain")
    };
  }

  function buildSaveCompanyPayload() {
    return {
      company_id: val("edit-company-select"),
      company_name: val("edit-company-name"),
      business_domain: val("edit-company-domain"),
      company_status: "active"
    };
  }

  function buildDeleteCompanyPayload() {
    return {
      company_id: val("edit-company-select")
    };
  }

  function buildCompanyRulesPayload(companyId) {
    return {
      company_id: companyId || val("company-select") || val("edit-company-select"),
      files: files("common-rule-files")
    };
  }

  function buildCreateDepartmentPayload(companyId) {
    return {
      company_id: companyId || val("company-select"),
      department_name: val("new-department-name"),
      purpose: val("new-department-purpose"),
      display_order: 100
    };
  }

  function buildSaveDepartmentPayload(companyId, departmentId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      department_name: val("edit-department-name"),
      purpose: val("edit-department-purpose"),
      department_status: "active",
      display_order: 100
    };
  }

  function buildDeleteDepartmentPayload(companyId, departmentId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select")
    };
  }

  function buildCreateOrganizationPayload(companyId) {
    var departmentId = val("org-add-department") || val("department-select");
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId,
      parent_organization_id: "",
      organization_name: val("new-org-name"),
      purpose: val("new-org-purpose"),
      display_order: 100,
      robot_assignments: robotAssignments("new-org-robots", companyId || val("company-select"), departmentId, "")
    };
  }

  function buildSaveOrganizationPayload(companyId, departmentId, organizationId) {
    var cid = companyId || val("company-select");
    var did = departmentId || val("department-select");
    var oid = organizationId || val("organization-select");
    return {
      company_id: cid,
      department_id: did,
      organization_id: oid,
      parent_organization_id: "",
      organization_name: val("edit-org-name"),
      purpose: val("edit-org-purpose"),
      organization_status: "active",
      display_order: 100,
      robot_assignments: robotAssignments("edit-org-robots", cid, did, oid)
    };
  }

  function buildDeleteOrganizationPayload(companyId, departmentId, organizationId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      organization_id: organizationId || val("organization-select")
    };
  }

  function buildSaveLedgerRowPayload(companyId, departmentId) {
    var ledgerId = val("edit-ledger-id");
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      ledger_row: {
        ledger_row_id: ledgerId || null,
        deliverable_name: val(ledgerId ? "edit-deliverable" : "add-deliverable"),
        task_name: val(ledgerId ? "edit-task" : "add-task"),
        work_type: val(ledgerId ? "edit-work-type" : "add-work-type"),
        task_status: val(ledgerId ? "edit-status" : "add-status"),
        priority: val(ledgerId ? "edit-priority" : "add-priority"),
        due_date: val(ledgerId ? "edit-due-date" : "add-due-date"),
        reference_files: val(ledgerId ? "edit-reference" : "add-reference"),
        supplemental_materials: val(ledgerId ? "edit-supplemental" : "add-supplemental"),
        note: val(ledgerId ? "edit-note" : "add-note"),
        source_type: "manual"
      }
    };
  }

  function buildDeleteLedgerRowPayload(companyId, departmentId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      ledger_row_id: val("edit-ledger-id")
    };
  }

  function buildCsvPreviewPayload(companyId, departmentId, csvText, fileName) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      original_file_name: fileName || "",
      csv_text: csvText || ""
    };
  }

  function buildCsvImportPayload(companyId, departmentId, batchId) {
    return {
      company_id: companyId || val("company-select"),
      department_id: departmentId || val("department-select"),
      csv_import_batch_id: batchId || ""
    };
  }

  function buildReviewActionPayload(reviewItemId, comment) {
    return {
      review_item_id: reviewItemId || "",
      comment: comment || ""
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.AicmActionPayloadBuilders = {
    val: val,
    files: files,
    selectedValues: selectedValues,
    buildCreateCompanyPayload: buildCreateCompanyPayload,
    buildSaveCompanyPayload: buildSaveCompanyPayload,
    buildDeleteCompanyPayload: buildDeleteCompanyPayload,
    buildCompanyRulesPayload: buildCompanyRulesPayload,
    buildCreateDepartmentPayload: buildCreateDepartmentPayload,
    buildSaveDepartmentPayload: buildSaveDepartmentPayload,
    buildDeleteDepartmentPayload: buildDeleteDepartmentPayload,
    buildCreateOrganizationPayload: buildCreateOrganizationPayload,
    buildSaveOrganizationPayload: buildSaveOrganizationPayload,
    buildDeleteOrganizationPayload: buildDeleteOrganizationPayload,
    buildSaveLedgerRowPayload: buildSaveLedgerRowPayload,
    buildDeleteLedgerRowPayload: buildDeleteLedgerRowPayload,
    buildCsvPreviewPayload: buildCsvPreviewPayload,
    buildCsvImportPayload: buildCsvImportPayload,
    buildReviewActionPayload: buildReviewActionPayload
  };
})(window);
