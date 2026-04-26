(function (global) {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var PREVIEW_KEY = "AICM_CSV_PREVIEW_ROWS";
  var IMPORT_RESULT_KEY = "AICM_CSV_IMPORT_RESULT";

  var CSV_ACTIONS = {
    "preview-csv": true,
    "import-csv": true
  };

  var REQUIRED_HEADER = [
    "deliverable_name",
    "task_name",
    "work_type",
    "status",
    "priority",
    "due_date",
    "reference_files",
    "supplemental_materials",
    "note"
  ];

  var WORK_TYPES = ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"];
  var STATUSES = ["未着手", "進行中", "レビュー中", "完了", "保留"];
  var PRIORITIES = ["高", "中", "低"];

  function byId(id) {
    return document.getElementById(id);
  }

  function getState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { aiworkers: [], companies: [] };
    } catch (error) {
      return { aiworkers: [], companies: [] };
    }
  }

  function setCurrentCompany(companyId) {
    if (companyId) {
      sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", companyId);
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", companyId);
    }
  }

  function setPendingDepartment(departmentId) {
    if (departmentId) {
      sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", departmentId);
    }
  }

  function getCurrentCompanyId() {
    var select = byId("company-select");
    var state;

    if (select && select.value) return select.value;

    if (sessionStorage.getItem("AICM_CURRENT_COMPANY_ID")) {
      return sessionStorage.getItem("AICM_CURRENT_COMPANY_ID");
    }

    if (sessionStorage.getItem("AICM_PENDING_COMPANY_ID")) {
      return sessionStorage.getItem("AICM_PENDING_COMPANY_ID");
    }

    state = getState();
    if (state.companies && state.companies[0]) {
      return state.companies[0].id || state.companies[0].company_id || "";
    }

    return "";
  }

  function getCurrentCompany() {
    var state = getState();
    var companyId = getCurrentCompanyId();

    return (state.companies || []).find(function (company) {
      return company.id === companyId || company.company_id === companyId;
    }) || null;
  }

  function getCurrentDepartmentId() {
    var departmentSelect = byId("department-select");
    var company;

    if (departmentSelect && departmentSelect.value) return departmentSelect.value;

    if (sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID")) {
      return sessionStorage.getItem("AICM_PENDING_DEPARTMENT_ID");
    }

    company = getCurrentCompany();

    if (company && company.departments && company.departments[0]) {
      return company.departments[0].id || company.departments[0].department_id || "";
    }

    return "";
  }

  function createRepository() {
    if (!global.AICM || !global.AICM.AicmLocalRepository) {
      return null;
    }

    return new global.AICM.AicmLocalRepository({
      storageKey: STORAGE_KEY
    });
  }

  function readCsvTextFromDom() {
    var ids = [
      "csv-text",
      "csv-input",
      "csv-import-text",
      "task-ledger-csv",
      "ledger-csv-text",
      "csv-preview-text"
    ];
    var i;
    var el;

    for (i = 0; i < ids.length; i += 1) {
      el = byId(ids[i]);
      if (el && typeof el.value === "string" && el.value.trim().length > 0) {
        return el.value;
      }
    }

    return "";
  }

  function parseCsvLine(line) {
    var cells = [];
    var current = "";
    var inQuotes = false;
    var i;
    var ch;
    var next;

    for (i = 0; i < line.length; i += 1) {
      ch = line.charAt(i);
      next = line.charAt(i + 1);

      if (ch === '"' && inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }

    cells.push(current);
    return cells.map(function (cell) {
      return cell.trim();
    });
  }

  function parseCsv(text) {
    var lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter(function (line) {
        return line.trim().length > 0;
      });

    var header;
    var rows = [];

    if (lines.length === 0) {
      return {
        header: [],
        rows: [],
        errors: ["CSVが空です。"]
      };
    }

    header = parseCsvLine(lines[0]);

    lines.slice(1).forEach(function (line, index) {
      var cells = parseCsvLine(line);
      var raw = {};
      var i;

      for (i = 0; i < header.length; i += 1) {
        raw[header[i]] = cells[i] || "";
      }

      rows.push({
        row_number: index + 2,
        raw: raw,
        cells: cells
      });
    });

    return {
      header: header,
      rows: rows,
      errors: []
    };
  }

  function sameHeader(header) {
    if (!header || header.length !== REQUIRED_HEADER.length) return false;

    return REQUIRED_HEADER.every(function (name, index) {
      return header[index] === name;
    });
  }

  function validateRow(raw) {
    var errors = [];
    var dueDate = raw.due_date || "";

    if (!raw.deliverable_name) errors.push("deliverable_name is required");
    if (!raw.task_name) errors.push("task_name is required");
    if (WORK_TYPES.indexOf(raw.work_type) === -1) errors.push("work_type is invalid");
    if (STATUSES.indexOf(raw.status) === -1) errors.push("status is invalid");
    if (PRIORITIES.indexOf(raw.priority) === -1) errors.push("priority is invalid");

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errors.push("due_date must be YYYY-MM-DD");
    }

    return errors;
  }

  function previewCsv() {
    var text = readCsvTextFromDom();
    var parsed = parseCsv(text);
    var result;

    if (parsed.errors.length > 0) {
      result = {
        ok: false,
        errors: parsed.errors,
        rows: []
      };
      sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(result));
      return Promise.resolve(result);
    }

    if (!sameHeader(parsed.header)) {
      result = {
        ok: false,
        errors: ["CSVヘッダーが正本と一致しません。"],
        expected_header: REQUIRED_HEADER,
        actual_header: parsed.header,
        rows: []
      };
      sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(result));
      return Promise.resolve(result);
    }

    result = {
      ok: true,
      errors: [],
      row_count: parsed.rows.length,
      rows: parsed.rows.map(function (row) {
        var validationErrors = validateRow(row.raw);
        return {
          row_number: row.row_number,
          parsed_row: row.raw,
          validation_status: validationErrors.length === 0 ? "valid" : "invalid",
          validation_errors: validationErrors
        };
      })
    };

    sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(result));
    return Promise.resolve(result);
  }

  function importCsv() {
    var repository = createRepository();
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();
    var previewRaw = sessionStorage.getItem(PREVIEW_KEY);
    var preview;
    var validRows;
    var chain;
    var imported = [];

    if (!repository) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_WIRING_NOT_READY",
        error_message: "CSV wiring is not ready.",
        details: {},
        request_id: "csv_wiring_not_ready"
      });
    }

    if (!companyId || !departmentId) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_IMPORT_REQUIRES_COMPANY_AND_DEPARTMENT",
        error_message: "CSV import requires company_id and department_id.",
        details: {
          company_id: companyId,
          department_id: departmentId
        },
        request_id: "csv_import_guard"
      });
    }

    if (!previewRaw) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_PREVIEW_REQUIRED",
        error_message: "CSV preview is required before import.",
        details: {},
        request_id: "csv_preview_required"
      });
    }

    try {
      preview = JSON.parse(previewRaw);
    } catch (error) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_PREVIEW_PARSE_FAILED",
        error_message: "CSV preview result could not be parsed.",
        details: {},
        request_id: "csv_preview_parse_failed"
      });
    }

    if (!preview.ok) {
      return Promise.resolve({
        ok: false,
        error_code: "CSV_PREVIEW_INVALID",
        error_message: "CSV preview is invalid.",
        details: preview,
        request_id: "csv_preview_invalid"
      });
    }

    validRows = (preview.rows || []).filter(function (row) {
      return row.validation_status === "valid";
    });

    chain = Promise.resolve();

    validRows.forEach(function (row) {
      chain = chain.then(function () {
        return repository.saveLedgerRow({
          company_id: companyId,
          department_id: departmentId,
          ledger_row: {
            ledger_row_id: null,
            deliverable_name: row.parsed_row.deliverable_name,
            task_name: row.parsed_row.task_name,
            work_type: row.parsed_row.work_type,
            task_status: row.parsed_row.status,
            priority: row.parsed_row.priority,
            due_date: row.parsed_row.due_date,
            reference_files: row.parsed_row.reference_files,
            supplemental_materials: row.parsed_row.supplemental_materials,
            note: row.parsed_row.note,
            source_type: "csv"
          }
        }).then(function (result) {
          imported.push(result);
        });
      });
    });

    return chain.then(function () {
      var result = {
        ok: true,
        imported_count: imported.length,
        invalid_count: (preview.rows || []).length - validRows.length,
        imported: imported
      };

      sessionStorage.setItem(IMPORT_RESULT_KEY, JSON.stringify(result));
      setCurrentCompany(companyId);
      setPendingDepartment(departmentId);

      return result;
    });
  }

  function isCsvAction(action) {
    return !!CSV_ACTIONS[action];
  }

  function handleCsvAction(action) {
    if (action === "preview-csv") return previewCsv();
    if (action === "import-csv") return importCsv();

    return Promise.resolve({
      ok: false,
      error_code: "CSV_ACTION_NOT_SUPPORTED",
      error_message: "CSV action is not supported: " + action,
      details: { action: action },
      request_id: "csv_action_not_supported"
    });
  }

  function installMemoryHandlers() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;
      var companySelect;
      var departmentSelect;

      if (!button) return;

      action = button.getAttribute("data-action");

      if (action === "switch-company") {
        companySelect = byId("company-select");
        if (companySelect && companySelect.value) setCurrentCompany(companySelect.value);
      }

      if (action === "switch-department") {
        departmentSelect = byId("department-select");
        if (departmentSelect && departmentSelect.value) setPendingDepartment(departmentSelect.value);
      }
    }, true);

    document.addEventListener("change", function (event) {
      if (!event.target) return;

      if (event.target.id === "company-select" && event.target.value) {
        setCurrentCompany(event.target.value);
      }

      if (event.target.id === "department-select" && event.target.value) {
        setPendingDepartment(event.target.value);
      }
    }, true);
  }

  function installCaptureHandler() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("[data-action]") : null;
      var action;

      if (!button) return;

      action = button.getAttribute("data-action");
      if (!isCsvAction(action)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      handleCsvAction(action).then(function (result) {
        if (result && result.ok === false) {
          alert(result.error_message || (result.errors ? result.errors.join("\n") : "CSV操作に失敗しました。"));
          return;
        }

        if (action === "preview-csv") {
          alert("CSVプレビュー完了: " + String(result.row_count || 0) + "行");
          return;
        }

        location.reload();
      });
    }, true);
  }

  function init() {
    var companyId = getCurrentCompanyId();
    var departmentId = getCurrentDepartmentId();

    if (companyId) setCurrentCompany(companyId);
    if (departmentId) setPendingDepartment(departmentId);

    global.AICM = global.AICM || {};
    global.AICM.csvLocalActionWiring = {
      storageKey: STORAGE_KEY,
      csvActionsOnly: true,
      realApiConnect: false,
      dbApply: false,
      rlsApply: false,
      requiredHeader: REQUIRED_HEADER,
      isCsvAction: isCsvAction,
      handleCsvAction: handleCsvAction,
      previewCsv: previewCsv,
      importCsv: importCsv
    };

    installMemoryHandlers();
    installCaptureHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
