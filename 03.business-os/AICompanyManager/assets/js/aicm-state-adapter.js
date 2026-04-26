(function (global) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value == null ? null : value));
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function fileStringToMetadata(companyId, departmentId, ledgerRowId, value, role) {
    return String(value || "")
      .split("|")
      .map(function (x) { return x.trim(); })
      .filter(Boolean)
      .map(function (name) {
        return {
          company_id: companyId,
          department_id: departmentId,
          ledger_row_id: ledgerRowId,
          file_role: role,
          file_name: name,
          storage_scope: "metadata_only",
          storage_ref: null,
          note: ""
        };
      });
  }

  function metadataToFileString(files, role) {
    return ensureArray(files)
      .filter(function (f) { return f.file_role === role; })
      .map(function (f) { return f.file_name; })
      .join("|");
  }

  function normalizeUiState(state) {
    var next = clone(state || {});
    next.companies = ensureArray(next.companies);
    next.aiworkers = ensureArray(next.aiworkers);

    next.companies.forEach(function (company) {
      company.company_common_rules = ensureArray(company.company_common_rules);
      company.departments = ensureArray(company.departments);
      company.departments.forEach(function (department) {
        department.organizations = ensureArray(department.organizations);
        department.task_ledger = ensureArray(department.task_ledger);
        department.review_items = ensureArray(department.review_items);
        department.organizations.forEach(function (organization) {
          organization.robot_ids = ensureArray(organization.robot_ids);
        });
      });
    });

    return next;
  }

  function bootstrapToUiState(payload) {
    var data = payload && payload.data ? payload.data : payload;
    var state = {
      companies: ensureArray(data && data.companies),
      aiworkers: ensureArray(data && data.aiworkers_reference)
    };
    return normalizeUiState(state);
  }

  function ledgerRowToSavePayload(companyId, departmentId, row) {
    return {
      company_id: companyId,
      department_id: departmentId,
      ledger_row: {
        ledger_row_id: row.ledger_row_id || row.id || null,
        deliverable_name: row.deliverable_name || "",
        task_name: row.task_name || "",
        work_type: row.work_type || "",
        task_status: row.task_status || row.status || "未着手",
        priority: row.priority || "中",
        due_date: row.due_date || null,
        reference_files: fileStringToMetadata(companyId, departmentId, row.ledger_row_id || row.id || null, row.reference_files, "reference_file"),
        supplemental_materials: fileStringToMetadata(companyId, departmentId, row.ledger_row_id || row.id || null, row.supplemental_materials, "supplemental_material"),
        note: row.note || "",
        source_type: row.source_type || "manual"
      }
    };
  }

  function dbLedgerRowToUi(row, files) {
    var metadata = ensureArray(files);
    return {
      id: row.ledger_row_id,
      ledger_row_id: row.ledger_row_id,
      deliverable_name: row.deliverable_name,
      task_name: row.task_name,
      work_type: row.work_type,
      status: row.task_status,
      task_status: row.task_status,
      priority: row.priority,
      due_date: row.due_date || "",
      reference_files: metadataToFileString(metadata, "reference_file"),
      supplemental_materials: metadataToFileString(metadata, "supplemental_material"),
      note: row.note || ""
    };
  }

  global.AICM = global.AICM || {};
  global.AICM.AicmStateAdapter = {
    normalizeUiState: normalizeUiState,
    bootstrapToUiState: bootstrapToUiState,
    ledgerRowToSavePayload: ledgerRowToSavePayload,
    dbLedgerRowToUi: dbLedgerRowToUi,
    fileStringToMetadata: fileStringToMetadata,
    metadataToFileString: metadataToFileString
  };
})(window);
