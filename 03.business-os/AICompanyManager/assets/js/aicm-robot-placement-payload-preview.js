/* AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6 */
(function () {
  "use strict";

  var ROBOT_API_URL = "./api/aicm/business-robot-pool";
  var STRUCTURE_API_URL = "./api/aicm/structure-map";
  var STYLE_ID = "aicm-compact-payload-preview-style-v3";
  var TIMER = null;

  var STATE = {
    robot_loaded: false,
    structure_loaded: false,
    loading: false,
    robot_api_ok: false,
    structure_api_ok: false,
    robots: [],
    companies: [],
    departments: [],
    organizations: [],
    last_error: ""
  };

  var TARGETS = [
    {
      role: "President",
      scope: "company",
      selectId: "company-president-robot",
      nicknameIds: ["company-president-nickname", "president-robot-nickname", "company-president-robot-nickname"],
      targetIdIds: [],
      targetTextIds: [],
      titleHints: ["Presidentロボット", "President robot", "社長ロボット"],
      cardTitle: "President配置payload"
    },
    {
      role: "Manager",
      scope: "department",
      selectId: "department-manager-robot",
      nicknameIds: ["department-manager-nickname", "manager-robot-nickname", "department-manager-robot-nickname"],
      targetIdIds: ["department-select", "edit-department-select"],
      targetTextIds: ["department-name", "edit-department-name"],
      titleHints: ["Managerロボット設定", "Managerロボット", "部門長ロボット"],
      cardTitle: "Manager配置payload"
    },
    {
      role: "Leader",
      scope: "section",
      selectId: "section-leader-robot",
      nicknameIds: ["section-leader-nickname", "leader-robot-nickname", "section-leader-robot-nickname"],
      targetIdIds: ["organization-select", "section-select", "edit-organization-select"],
      targetTextIds: ["organization-name", "section-name", "edit-organization-name"],
      titleHints: ["Leaderロボット設定", "Leaderロボット", "課長"],
      cardTitle: "Leader配置payload"
    },
    {
      role: "Worker",
      scope: "section",
      selectId: "section-worker-robot-select",
      nicknameIds: ["section-worker-nickname", "worker-robot-nickname", "section-worker-robot-nickname"],
      targetIdIds: ["organization-select", "section-select", "edit-organization-select"],
      targetTextIds: ["organization-name", "section-name", "edit-organization-name"],
      titleHints: ["Workerロボット配置", "Worker配置", "配置済みWorker"],
      cardTitle: "Worker配置payload"
    }
  ];

  var MODEL_CODES = [
    "HD-R2T-0", "MG-NORN-001", "MG-NORN-002", "MG-NORN-003",
    "BYD1-001", "BYD1-002", "BYD1-003", "BYD2-001", "BYD2-002", "BYD2-003",
    "HD-R5P", "HD-R2S", "HD-R2G", "HD-R1C", "HD-R1A", "HD-R5", "HD-R4", "HD-R3", "HD-R2", "HD-R1"
  ];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".aicm-payload-preview{border:1px solid #d6e4ff;border-radius:12px;background:#f8fbff;padding:12px;margin-top:12px;}",
      ".aicm-payload-preview h3{font-size:15px;margin:0 0 8px;}",
      ".aicm-preview-grid{display:grid;grid-template-columns:110px 1fr;gap:6px 10px;font-size:13px;line-height:1.45;margin-top:8px;}",
      ".aicm-preview-key{color:#667085;font-weight:700;}",
      ".aicm-preview-value{color:#101828;word-break:break-word;}",
      ".aicm-preview-badge{display:inline-block;padding:3px 7px;border-radius:999px;background:#e8fff2;color:#087443;font-weight:700;font-size:11px;margin:2px;}",
      ".aicm-preview-warn{background:#fff7e8;color:#9a5b00;}",
      ".aicm-preview-danger{background:#ffecec;color:#b42318;}",
      ".aicm-payload-preview details{margin-top:8px;}",
      ".aicm-payload-preview summary{cursor:pointer;color:#175cd3;font-weight:700;font-size:13px;}",
      ".aicm-payload-preview pre{white-space:pre-wrap;word-break:break-word;background:#0f172a;color:#e2e8f0;border-radius:10px;padding:10px;font-size:12px;line-height:1.45;max-height:240px;overflow:auto;}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function removeExistingPreviewNodes(root) {
    Array.prototype.slice.call((root || document).querySelectorAll("[data-aicm-placement-payload-preview]")).forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function textOf(el) {
    if (!el) return "";
    var clone = el.cloneNode(true);
    removeExistingPreviewNodes(clone);
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function normalize(value) {
    return String(value == null ? "" : value).toLowerCase().replace(/[\s　／/・|:：,，。\.\-＿_]+/g, "");
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function firstValue(ids) {
    var i, el;
    for (i = 0; i < ids.length; i += 1) {
      el = byId(ids[i]);
      if (el && el.value) return el.value;
    }
    return "";
  }

  function firstSelectedText(ids) {
    var i, el;
    for (i = 0; i < ids.length; i += 1) {
      el = byId(ids[i]);
      if (el && el.selectedIndex >= 0 && el.options && el.options[el.selectedIndex]) {
        return el.options[el.selectedIndex].textContent || "";
      }
    }
    return "";
  }

  function firstTextInput(ids) {
    var i, el;
    for (i = 0; i < ids.length; i += 1) {
      el = byId(ids[i]);
      if (el && el.value) return el.value;
    }
    return "";
  }

  function companyId() {
    return firstValue(["company-select", "edit-company-select", "aicm-company-id", "company-id"]) ||
      "00000000-0000-4000-8000-1db11893cb24";
  }

  function selectedText(select) {
    if (!select || select.selectedIndex < 0 || !select.options[select.selectedIndex]) return "";
    return select.options[select.selectedIndex].textContent || "";
  }

  function pick(row, keys) {
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (row && row[keys[i]] != null && row[keys[i]] !== "") return row[keys[i]];
    }
    return "";
  }

  function asText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); } catch (error) { return String(value); }
  }

  function rowUuid(row, scope) {
    if (scope === "department") return String(pick(row, ["department_id", "id", "aicm_department_id", "uuid"]));
    if (scope === "section") return String(pick(row, ["organization_id", "section_id", "id", "aicm_organization_id", "uuid"]));
    return String(pick(row, ["company_id", "id", "aicm_company_id", "uuid"]));
  }

  function rowName(row, scope) {
    if (scope === "department") return String(pick(row, ["department_name", "name", "display_name", "title"]));
    if (scope === "section") return String(pick(row, ["organization_name", "section_name", "name", "display_name", "title"]));
    return String(pick(row, ["company_name", "name", "display_name", "title"]));
  }

  function rowCompanyId(row) {
    return String(pick(row, ["company_id", "aicm_company_id"]));
  }

  function companyRowUuid(row) {
    return String(pick(row, ["company_id", "id", "aicm_company_id", "uuid"]));
  }

  function companyRowLocalId(row) {
    return String(pick(row, ["local_company_id", "client_company_id", "ui_company_id", "company_local_id", "slug", "code"]));
  }

  function companyRowName(row) {
    return String(pick(row, ["company_name", "name", "display_name", "title"]));
  }

  function canonicalCompany() {
    var input = companyId();
    var selectedHint = "";
    var companySelect = byId("company-select") || byId("edit-company-select");
    var i;
    var row;
    var uuid;
    var local;
    var name;
    var nInput = normalize(input);

    if (companySelect && companySelect.selectedIndex >= 0 && companySelect.options && companySelect.options[companySelect.selectedIndex]) {
      selectedHint = companySelect.options[companySelect.selectedIndex].textContent || "";
    }

    if (isUuid(input)) {
      return {
        company_id_input: input,
        company_id: input,
        company_id_source: "input_uuid",
        company_id_canonicalization_status: "OK_INPUT_UUID",
        company_display_hint: selectedHint,
        company_save_blocked: false
      };
    }

    for (i = 0; i < STATE.companies.length; i += 1) {
      row = STATE.companies[i];
      uuid = companyRowUuid(row);
      local = companyRowLocalId(row);
      name = companyRowName(row);

      if (uuid && input && uuid === input) {
        return {
          company_id_input: input,
          company_id: uuid,
          company_id_source: "db_uuid_exact",
          company_id_canonicalization_status: "OK_DB_UUID_EXACT",
          company_display_hint: name || selectedHint,
          matched_company_name: name || "",
          company_save_blocked: false
        };
      }

      if (uuid && local && input && local === input) {
        return {
          company_id_input: input,
          company_id: uuid,
          company_id_source: "db_local_id_match",
          company_id_canonicalization_status: "OK_DB_LOCAL_ID_MATCH",
          company_display_hint: name || selectedHint,
          matched_company_name: name || "",
          company_save_blocked: false
        };
      }

      if (uuid && name && nInput && (normalize(name).indexOf(nInput) >= 0 || nInput.indexOf(normalize(name)) >= 0)) {
        return {
          company_id_input: input,
          company_id: uuid,
          company_id_source: "db_company_name_match",
          company_id_canonicalization_status: "OK_DB_COMPANY_NAME_MATCH",
          company_display_hint: name || selectedHint,
          matched_company_name: name || "",
          company_save_blocked: false
        };
      }
    }

    if (STATE.companies.length === 1) {
      row = STATE.companies[0];
      uuid = companyRowUuid(row);
      name = companyRowName(row);
      if (uuid) {
        return {
          company_id_input: input,
          company_id: uuid,
          company_id_source: "single_db_company_fallback",
          company_id_canonicalization_status: "OK_SINGLE_DB_COMPANY_FALLBACK",
          company_display_hint: name || selectedHint,
          matched_company_name: name || "",
          company_save_blocked: false
        };
      }
    }

    return {
      company_id_input: input,
      company_id: "",
      company_id_source: "local_only_unresolved",
      company_id_canonicalization_status: "BLOCKED_LOCAL_ONLY_COMPANY_ID",
      company_display_hint: selectedHint,
      matched_company_name: "",
      company_save_blocked: true
    };
  }


  function detectModelCode(row, optionText) {
    var raw = String(pick(row, ["model_code", "robot_model_code", "aiworker_model_code", "model_no", "model_number", "robot_code", "model_id"]) || "");
    var all = raw + " " + asText(row) + " " + String(optionText || "");
    var i;
    for (i = 0; i < MODEL_CODES.length; i += 1) {
      if (all.indexOf(MODEL_CODES[i]) >= 0) return MODEL_CODES[i];
    }
    return raw || "";
  }

  function robotId(row, fallback) {
    return String(pick(row, ["business_robot_id", "robot_pool_id", "pool_robot_id", "company_robot_id", "robot_id", "aiworker_robot_id", "id"]) || fallback || "");
  }

  function displayName(row, optionText) {
    return String(pick(row, ["display_name", "robot_display_name", "robot_name", "model_name_ja", "model_name", "name", "model_code", "id"]) || optionText || "");
  }

  function findRobotBySelect(select) {
    var value = select && select.value ? String(select.value) : "";
    var optionText = selectedText(select);
    var i, row, rid;

    if (!value) return null;

    for (i = 0; i < STATE.robots.length; i += 1) {
      row = STATE.robots[i];
      rid = robotId(row, "");
      if (rid && rid === value) return row;
    }

    for (i = 0; i < STATE.robots.length; i += 1) {
      row = STATE.robots[i];
      if (asText(row).indexOf(value) >= 0) return row;
    }

    return { id: value, display_name: optionText, model_code: detectModelCode({}, optionText) };
  }

  function cardForTarget(target) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".aicm-card"));
    var i, h, text;
    for (i = 0; i < cards.length; i += 1) {
      text = textOf(cards[i]);
      for (h = 0; h < target.titleHints.length; h += 1) {
        if (text.indexOf(target.titleHints[h]) >= 0) return cards[i];
      }
    }
    return null;
  }

  function compactHint(target, card) {
    var selectedHint = firstSelectedText(target.targetIdIds);
    var typedHint = firstTextInput(target.targetTextIds);
    var cardText = textOf(card);
    var simpleCard = "";

    target.titleHints.forEach(function (hint) {
      if (!simpleCard && cardText.indexOf(hint) >= 0) simpleCard = hint;
    });

    return [selectedHint, typedHint, simpleCard].filter(Boolean).join(" / ").slice(0, 160);
  }

  function canonicalizeTarget(target, card) {
    var currentCompanyId = companyId();
    var input = firstValue(target.targetIdIds);
    var hint = compactHint(target, card);
    var rows = target.scope === "department" ? STATE.departments : STATE.organizations;
    var nHint = normalize(hint);
    var nInput = normalize(input);
    var companyOkRows, i, row, uuid, name;

    if (target.scope === "company") {
      return {
        target_id_input: "",
        target_id: "",
        target_id_source: "company_scope_no_target_id",
        target_id_canonicalization_status: "OK_COMPANY_SCOPE",
        target_display_hint: "company scope",
        matched_db_name: "",
        save_blocked: false
      };
    }

    if (isUuid(input)) {
      return {
        target_id_input: input,
        target_id: input,
        target_id_source: "input_uuid",
        target_id_canonicalization_status: "OK_INPUT_UUID",
        target_display_hint: hint,
        matched_db_name: "",
        save_blocked: false
      };
    }

    companyOkRows = rows.filter(function (r) {
      var rc = rowCompanyId(r);
      return !rc || !currentCompanyId || rc === currentCompanyId || asText(r).indexOf(currentCompanyId) >= 0;
    });

    if (!companyOkRows.length) companyOkRows = rows;

    for (i = 0; i < companyOkRows.length; i += 1) {
      row = companyOkRows[i];
      uuid = rowUuid(row, target.scope);
      if (uuid && input && uuid === input) {
        return {
          target_id_input: input,
          target_id: uuid,
          target_id_source: "db_uuid_exact",
          target_id_canonicalization_status: "OK_DB_UUID_EXACT",
          target_display_hint: hint,
          matched_db_name: rowName(row, target.scope) || "",
          save_blocked: false
        };
      }
    }

    for (i = 0; i < companyOkRows.length; i += 1) {
      row = companyOkRows[i];
      uuid = rowUuid(row, target.scope);
      name = rowName(row, target.scope);
      if (!uuid || !name) continue;

      if (nHint && normalize(name) && (nHint.indexOf(normalize(name)) >= 0 || normalize(name).indexOf(nHint) >= 0)) {
        return {
          target_id_input: input,
          target_id: uuid,
          target_id_source: "db_name_match",
          target_id_canonicalization_status: "OK_DB_NAME_MATCH",
          target_display_hint: hint,
          matched_db_name: name,
          save_blocked: false
        };
      }

      if (nInput && normalize(name) && (nInput.indexOf(normalize(name)) >= 0 || normalize(name).indexOf(nInput) >= 0)) {
        return {
          target_id_input: input,
          target_id: uuid,
          target_id_source: "db_name_match_from_input",
          target_id_canonicalization_status: "OK_DB_NAME_MATCH_FROM_INPUT",
          target_display_hint: hint,
          matched_db_name: name,
          save_blocked: false
        };
      }
    }

    if (companyOkRows.length === 1) {
      row = companyOkRows[0];
      uuid = rowUuid(row, target.scope);
      name = rowName(row, target.scope);
      if (uuid) {
        return {
          target_id_input: input,
          target_id: uuid,
          target_id_source: "single_db_row_fallback",
          target_id_canonicalization_status: "OK_SINGLE_DB_ROW_FALLBACK",
          target_display_hint: hint,
          matched_db_name: name || "",
          save_blocked: false
        };
      }
    }

    return {
      target_id_input: input,
      target_id: "",
      target_id_source: "local_only_unresolved",
      target_id_canonicalization_status: "BLOCKED_LOCAL_ONLY_TARGET_ID",
      target_display_hint: hint,
      matched_db_name: "",
      save_blocked: true
    };
  }


  function isPlaceholderOption(text) {
    var t = String(text || "").trim();
    return !t || t === "選択してください" || t.indexOf("候補を選択") >= 0 || t.indexOf("BusinessOS DB候補を選択") >= 0;
  }

  function validatePayloadForPreview(payload) {
    var errors = [];
    var warnings = [];

    if (!isUuid(payload.company_id)) {
      errors.push("company_id_not_canonical_uuid");
    }

    if (payload.company_id_source === "single_db_company_fallback") {
      warnings.push("company_id_single_db_fallback_confirm_before_save");
    }

    if (payload.company_id_canonicalization_status && payload.company_id_canonicalization_status.indexOf("OK_") !== 0) {
      errors.push("company_id_canonicalization_not_ok");
    }

    if (payload.target_id_canonicalization_status && payload.target_id_canonicalization_status.indexOf("OK_") !== 0) {
      errors.push("target_id_canonicalization_not_ok");
    }

    if (payload.target_scope !== "company" && !isUuid(payload.target_id)) {
      errors.push("target_id_not_canonical_uuid");
    }

    if (!payload.robot_pool_id) {
      errors.push("robot_pool_id_required");
    }

    if (!payload.model_code) {
      errors.push("model_code_required");
    }

    if (!payload.robot_display_name) {
      errors.push("robot_display_name_required");
    }

    if (isPlaceholderOption(payload.selected_option_text)) {
      errors.push("robot_not_selected");
    }

    return {
      validation_errors: errors,
      validation_warnings: warnings,
      robot_selection_status: errors.indexOf("robot_not_selected") >= 0 || errors.indexOf("robot_pool_id_required") >= 0 ? "BLOCKED_ROBOT_NOT_SELECTED" : "OK_ROBOT_SELECTED",
      company_mapping_warning: warnings.indexOf("company_id_single_db_fallback_confirm_before_save") >= 0 ? "CONFIRM_SINGLE_DB_COMPANY_FALLBACK" : "",
      strict_validation_status: errors.length ? "BLOCKED_PREVIEW_VALIDATION_ERRORS" : "OK_STRICT_PREVIEW_VALIDATION",
      strict_save_blocked: errors.length > 0
    };
  }

  function buildPayload(target, card) {
    var select = byId(target.selectId);
    var selectedRobot = findRobotBySelect(select);
    var optionText = selectedText(select);
    var nickname = firstValue(target.nicknameIds);
    var canonical = canonicalizeTarget(target, card);
    var companyCanonical = canonicalCompany();

    if (!nickname && selectedRobot) nickname = displayName(selectedRobot, optionText);

    var payload = {
      source: "AICompanyManager UI preview",
      operation: "company_robot_placement.preview_only",
      save_status: "PREVIEW_VALIDATION_PENDING",
      api_write: false,
      db_write: false,
      company_id_input: companyCanonical.company_id_input,
      company_id: companyCanonical.company_id,
      company_id_source: companyCanonical.company_id_source,
      company_id_canonicalization_status: companyCanonical.company_id_canonicalization_status,
      company_display_hint: companyCanonical.company_display_hint || "",
      matched_company_name: companyCanonical.matched_company_name || "",
      target_scope: target.scope,
      target_id_input: canonical.target_id_input,
      target_id: canonical.target_id,
      target_id_source: canonical.target_id_source,
      target_id_canonicalization_status: canonical.target_id_canonicalization_status,
      target_display_hint: canonical.target_display_hint,
      matched_db_name: canonical.matched_db_name || "",
      save_blocked: !!(companyCanonical.company_save_blocked || canonical.save_blocked),
      placement_role_code: target.role,
      robot_pool_id: selectedRobot ? robotId(selectedRobot, select ? select.value : "") : "",
      model_code: selectedRobot ? detectModelCode(selectedRobot, optionText) : "",
      robot_display_name: selectedRobot ? displayName(selectedRobot, optionText) : "",
      internal_nickname: nickname || "",
      assignment_policy: "unlimited_system_use",
      quantity_consumption: false,
      selected_option_text: optionText || "",
      preview_warning: companyCanonical.company_save_blocked ? "company_id_local_only_save_blocked" : (canonical.save_blocked ? "target_id_local_only_save_blocked" : "")
    };

    var validation = validatePayloadForPreview(payload);

    payload.validation_errors = validation.validation_errors;
    payload.validation_warnings = validation.validation_warnings;
    payload.robot_selection_status = validation.robot_selection_status;
    payload.company_mapping_warning = validation.company_mapping_warning;
    payload.strict_validation_status = validation.strict_validation_status;
    payload.save_blocked = !!(payload.save_blocked || validation.strict_save_blocked);
    payload.save_status = payload.save_blocked ? "PREVIEW_ONLY_SAVE_BLOCKED_VALIDATION" : "PREVIEW_ONLY_CANONICAL_OK";

    if (validation.validation_errors.indexOf("robot_not_selected") >= 0 || validation.validation_errors.indexOf("robot_pool_id_required") >= 0) {
      payload.preview_warning = "robot_not_selected_save_blocked";
    } else if (payload.company_mapping_warning) {
      payload.preview_warning = payload.company_mapping_warning;
    }

    return payload;
  }

  function row(label, value) {
    return '<div class="aicm-preview-key">' + esc(label) + '</div><div class="aicm-preview-value">' + esc(value || "-") + '</div>';
  }

  function renderPreview(target) {
    var card = cardForTarget(target);
    var payload, existing, html, statusClass, detailsWasOpen;

    if (!card) return;

    existing = card.querySelector("[data-aicm-placement-payload-preview='" + target.role + "']");
    payload = buildPayload(target, card);
    detailsWasOpen = !!(existing && existing.querySelector("details") && existing.querySelector("details").open);
    statusClass = payload.save_blocked ? " aicm-preview-danger" : "";

    html = [
      '<div class="aicm-payload-preview" data-aicm-placement-payload-preview="' + esc(target.role) + '">',
      '<h3>' + esc(target.cardTitle) + '</h3>',
      '<span class="aicm-preview-badge">preview only</span>',
      '<span class="aicm-preview-badge">DB保存なし</span>',
      '<span class="aicm-preview-badge">数量消費なし</span>',
      '<span class="aicm-preview-badge' + statusClass + '">' + esc(payload.target_id_canonicalization_status) + '</span>',
      '<div class="aicm-preview-grid">',
      row("role", payload.placement_role_code),
      row("robot", payload.robot_display_name + (payload.model_code ? " / " + payload.model_code : "")),
      row("nickname", payload.internal_nickname),
      row("company", payload.company_id || payload.company_id_source),
      row("scope", payload.target_scope),
      row("target", payload.target_id || payload.target_id_source),
      row("company status", payload.company_id_canonicalization_status),
      row("target status", payload.target_id_canonicalization_status),
      row("robot status", payload.robot_selection_status),
      row("validation", payload.strict_validation_status),
      row("warning", payload.preview_warning || payload.company_mapping_warning || "-"),
      row("status", payload.save_status),
      '</div>',
      '<details data-aicm-json-details="' + esc(target.role) + '"' + (detailsWasOpen ? ' open' : '') + '><summary>詳細JSONを表示</summary><pre>' + esc(JSON.stringify(payload, null, 2)) + '</pre></details>',
      '</div>'
    ].join("");

    if (existing) existing.outerHTML = html;
    else card.insertAdjacentHTML("beforeend", html);
  }

  function renderAll() {
    try {
      injectStyle();
      TARGETS.forEach(renderPreview);
      window.AICM_COMPACT_PAYLOAD_PREVIEW_STATUS = {
        ok: true,
        mode: "compact_payload_preview_repair_v3",
        robot_api_ok: STATE.robot_api_ok,
        structure_api_ok: STATE.structure_api_ok,
        robot_count: STATE.robots.length,
        company_count: STATE.companies.length,
        department_count: STATE.departments.length,
        organization_count: STATE.organizations.length,
        db_write: false,
        api_write: false,
        quantity_consumption: false
      };
    } catch (error) {
      window.AICM_COMPACT_PAYLOAD_PREVIEW_STATUS = {
        ok: false,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      return res.json().then(function (body) {
        return { ok: res.ok, status: res.status, body: body };
      });
    });
  }

  function fetchAll() {
    if (STATE.loading) return Promise.resolve();
    if (STATE.robot_loaded && STATE.structure_loaded) return Promise.resolve();

    STATE.loading = true;

    return Promise.all([fetchJson(ROBOT_API_URL), fetchJson(STRUCTURE_API_URL)])
      .then(function (results) {
        var robot = results[0];
        var structure = results[1];

        if (robot.ok && robot.body && robot.body.result === "ok") {
          STATE.robot_api_ok = true;
          STATE.robot_loaded = true;
          STATE.robots = Array.isArray(robot.body.robots) ? robot.body.robots : [];
        } else {
          STATE.robot_api_ok = false;
          STATE.last_error = "robot API failed: " + robot.status;
        }

        if (structure.ok && structure.body && structure.body.result === "ok") {
          STATE.structure_api_ok = true;
          STATE.structure_loaded = true;
          STATE.companies = Array.isArray(structure.body.companies) ? structure.body.companies : [];
          STATE.departments = Array.isArray(structure.body.departments) ? structure.body.departments : [];
          STATE.organizations = Array.isArray(structure.body.organizations) ? structure.body.organizations : [];
        } else {
          STATE.structure_api_ok = false;
          STATE.last_error = "structure API failed: " + structure.status;
        }
      })
      .catch(function (error) {
        STATE.robot_api_ok = false;
        STATE.structure_api_ok = false;
        STATE.last_error = error && error.message ? error.message : String(error);
      })
      .then(function () {
        STATE.loading = false;
        renderAll();
      });
  }

  function schedule() {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(function () {
      fetchAll().then(renderAll);
    }, 180);
  }

  try {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
    else schedule();

    window.addEventListener("load", schedule);
    window.addEventListener("focus", schedule);

    document.addEventListener("change", function (event) {
      var node = event.target;
      if (!node || !node.id) return;
      if (TARGETS.some(function (t) {
        return t.selectId === node.id || t.nicknameIds.indexOf(node.id) >= 0 || t.targetIdIds.indexOf(node.id) >= 0 || t.targetTextIds.indexOf(node.id) >= 0;
      })) schedule();
    }, true);

    document.addEventListener("input", function (event) {
      var node = event.target;
      if (!node || !node.id) return;
      if (TARGETS.some(function (t) {
        return t.nicknameIds.indexOf(node.id) >= 0 || t.targetTextIds.indexOf(node.id) >= 0;
      })) schedule();
    }, true);

    document.addEventListener("click", function (event) {
      var node = event.target;
      if (node && node.closest && node.closest("[data-aicm-placement-payload-preview]")) return;
      window.setTimeout(schedule, 250);
    }, true);
  } catch (error) {
    window.AICM_COMPACT_PAYLOAD_PREVIEW_STATUS = {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6_END */
