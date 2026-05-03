/* AICM_PAYLOAD_PREVIEW_STRICT_VALIDATION_V6 */
/* AICM_FINAL_PAYLOAD_ROLE_MODEL_NORMALIZER_V13 */
/* AICM_FINAL_PREVIEW_READINESS_ALIGNMENT_V8 */
/* AICM_PREVIEW_EXISTING_ASSIGNMENT_RESOLVER_V9 */
/* AICM_PREVIEW_ROLE_CANONICAL_ROBOT_RESOLVER_V10 */
/* AICM_STRICT_ROLE_COMPATIBLE_ROBOT_RESOLVER_V11 */
/* AICM_ROLE_ELIGIBILITY_SEGMENT_STRICT_RESOLVER_V12 */
/* AICM_BUSINESSOS_DB_COMPANY_BINDING_PREVIEW_V7 */

/* AICM_MANAGER_PAYLOAD_ROBOT_ROLE_GUARD_V12 */
function aicmV12NormalizeRoleCode(input) {
  var s = String(input || "").trim().toLowerCase();
  s = s.replace(/[＿_\s\-]+/g, "_");
  s = s.replace(/配置/g, "");
  s = s.replace(/役割/g, "");
  s = s.replace(/ロール/g, "");
  if (s === "president" || s === "hd_r5p" || s === "社長" || s === "プレジデント") return "president";
  if (s === "manager" || s === "hd_r5" || s === "マネージャー" || s === "manager_role") return "manager";
  if (s === "leader" || s === "hd_r4" || s === "リーダー" || s === "leader_role") return "leader";
  if (s === "worker" || s === "hd_r3" || s === "ワーカー" || s === "worker_role") return "worker";
  if (s.indexOf("president") >= 0 || s.indexOf("プレジデント") >= 0) return "president";
  if (s.indexOf("manager") >= 0 || s.indexOf("マネージャー") >= 0) return "manager";
  if (s.indexOf("leader") >= 0 || s.indexOf("リーダー") >= 0) return "leader";
  if (s.indexOf("worker") >= 0 || s.indexOf("ワーカー") >= 0) return "worker";
  return s;
}

function aicmV12NormalizeText(input) {
  return String(input || "")
    .replace(/[－ー–—]/g, "-")
    .replace(/[：]/g, ":")
    .replace(/[／]/g, "/")
    .replace(/[　]/g, " ")
    .toLowerCase();
}

function aicmV12ContainsAny(source, list) {
  for (var i = 0; i < list.length; i++) {
    if (source.indexOf(list[i]) >= 0) return true;
  }
  return false;
}

function aicmV12HasExplicitRoleCode(source, roleCode) {
  var role = aicmV12NormalizeRoleCode(roleCode);
  var s = aicmV12NormalizeText(source).replace(/["'{}\[\],]/g, " ");
  var needles = [
    "role_code:" + role,
    "rolecode:" + role,
    "placement_role_code:" + role,
    "assignment_role_code:" + role,
    "target_role_code:" + role,
    "selected_role_code:" + role,
    "compatible_role_code:" + role,
    "role_code " + role,
    "rolecode " + role,
    "placement_role_code " + role,
    "assignment_role_code " + role,
    "target_role_code " + role,
    "selected_role_code " + role,
    "compatible_role_code " + role
  ];
  return aicmV12ContainsAny(s, needles);
}

function aicmV12HasRoleLabel(source, roleCode) {
  var role = aicmV12NormalizeRoleCode(roleCode);
  var s = aicmV12NormalizeText(source);
  if (role === "president") {
    return aicmV12ContainsAny(s, ["president", "プレジデント", "社長", "hd-r5p", "hdr5p"]);
  }
  if (role === "manager") {
    return aicmV12ContainsAny(s, ["manager", "マネージャー", "hd-r5", "hdr5"]);
  }
  if (role === "leader") {
    return aicmV12ContainsAny(s, ["leader", "リーダー", "hd-r4", "hdr4"]);
  }
  if (role === "worker") {
    return aicmV12ContainsAny(s, ["worker", "ワーカー", "hd-r3", "hdr3"]);
  }
  return false;
}

function aicmV12HasContradictingRobotLabel(source, expectedRole) {
  var role = aicmV12NormalizeRoleCode(expectedRole);
  var s = aicmV12NormalizeText(source);

  var isPayloadLike =
    s.indexOf("payload") >= 0 ||
    s.indexOf("配置payload") >= 0 ||
    s.indexOf("robot") >= 0 ||
    s.indexOf("selectedrobot") >= 0 ||
    s.indexOf("selected robot") >= 0;

  if (!isPayloadLike) return false;

  if (role === "manager") {
    return aicmV12ContainsAny(s, [
      "robot leader",
      "robot: leader",
      "robot leader / hd-r4",
      "robot: leader / hd-r4",
      "leader / hd-r4",
      "leader/hd-r4",
      "リーダー / hd-r4",
      "リーダー/hd-r4"
    ]);
  }

  if (role === "leader") {
    return aicmV12ContainsAny(s, [
      "robot manager",
      "robot: manager",
      "robot manager / hd-r5",
      "robot: manager / hd-r5",
      "manager / hd-r5",
      "manager/hd-r5",
      "マネージャー / hd-r5",
      "マネージャー/hd-r5"
    ]);
  }

  if (role === "worker") {
    return aicmV12ContainsAny(s, [
      "robot manager / hd-r5",
      "robot leader / hd-r4",
      "manager / hd-r5",
      "leader / hd-r4"
    ]);
  }

  return false;
}

function aicmV12TextSupportsExactRoleForTarget(text, targetRole) {
  var expected = aicmV12NormalizeRoleCode(targetRole);
  var source = aicmV12NormalizeText(text);

  if (!expected) return false;

  if (aicmV12HasContradictingRobotLabel(source, expected)) {
    return false;
  }

  if (aicmV12HasExplicitRoleCode(source, expected)) {
    return true;
  }

  return aicmV12HasRoleLabel(source, expected);
}

function aicmV12ResolveTargetRole(target) {
  if (target == null) return "";
  if (typeof target === "string") return aicmV12NormalizeRoleCode(target);
  return aicmV12NormalizeRoleCode(
    target.role_code ||
    target.roleCode ||
    target.placement_role_code ||
    target.placementRoleCode ||
    target.assignment_role_code ||
    target.assignmentRoleCode ||
    target.target_role_code ||
    target.targetRoleCode ||
    target.role ||
    target.roleName ||
    target.role_name ||
    ""
  );
}

function aicmV12IsRobotCompatibleWithTargetRole(robot, targetRole) {
  var expected = aicmV12NormalizeRoleCode(targetRole);
  if (!expected) return false;
  if (!robot) return false;

  var roleFields = [
    robot.role_code,
    robot.roleCode,
    robot.placement_role_code,
    robot.placementRoleCode,
    robot.assignment_role_code,
    robot.assignmentRoleCode,
    robot.compatible_role_code,
    robot.compatibleRoleCode,
    robot.target_role_code,
    robot.targetRoleCode,
    robot.role,
    robot.roleName,
    robot.role_name
  ];

  for (var i = 0; i < roleFields.length; i++) {
    if (aicmV12NormalizeRoleCode(roleFields[i]) === expected) return true;
  }

  var text = [
    robot.display_label,
    robot.displayLabel,
    robot.label,
    robot.name,
    robot.model_name,
    robot.modelName,
    robot.model_no,
    robot.modelNo,
    robot.model_code,
    robot.modelCode,
    robot.series_name,
    robot.seriesName
  ].filter(Boolean).join(" / ");

  return aicmV12TextSupportsExactRoleForTarget(text, expected);
}

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
    var binding = document.getElementById("aicm-db-company-binding-select");
    var stored = "";

    if (binding && binding.value) return binding.value;

    try {
      stored = localStorage.getItem("aicm_businessos_db_company_binding_id") || "";
    } catch (error) {
      stored = "";
    }

    if (stored) return stored;

    return firstValue(["aicm-db-company-binding-select", "company-select", "edit-company-select", "aicm-company-id", "company-id"]) ||
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
    } else if (!isUuid(payload.robot_pool_id)) {
      errors.push("robot_pool_id_not_canonical_uuid");
    }

    if (!payload.model_code) {
      errors.push("model_code_required");
    }

    if (!payload.robot_display_name) {
      errors.push("robot_display_name_required");
    }

    if (isPlaceholderOption(payload.selected_option_text)) {
      errors.push("robot_not_selected");
    } else if (String(payload.selected_option_text || "").indexOf("BusinessOS DB") < 0 && String(payload.robot_resolve_source || "") !== "existing_assignment_visible") {
      errors.push("robot_selection_not_businessos_db");
    }

    return {
      validation_errors: errors,
      validation_warnings: warnings,
      robot_selection_status: (
        errors.indexOf("robot_not_selected") >= 0 ||
        errors.indexOf("robot_pool_id_required") >= 0 ||
        errors.indexOf("robot_pool_id_not_canonical_uuid") >= 0 ||
        errors.indexOf("robot_selection_not_businessos_db") >= 0
      ) ? "BLOCKED_ROBOT_NOT_SELECTED" : "OK_ROBOT_SELECTED",
      company_mapping_warning: warnings.indexOf("company_id_single_db_fallback_confirm_before_save") >= 0 ? "CONFIRM_SINGLE_DB_COMPANY_FALLBACK" : "",
      strict_validation_status: errors.length ? "BLOCKED_PREVIEW_VALIDATION_ERRORS" : "OK_STRICT_PREVIEW_VALIDATION",
      strict_save_blocked: errors.length > 0
    };
  }


  function existingAssignmentRegionText(target, card) {
    var texts = [];
    var body = "";
    var roleMarker = "@" + target.role;
    var pos;

    if (card) texts.push(textOf(card));
    if (card && card.parentElement) texts.push(textOf(card.parentElement));

    body = textOf(document.body);
    pos = body.indexOf(roleMarker);
    if (pos >= 0) {
      texts.push(body.slice(Math.max(0, pos - 420), Math.min(body.length, pos + 760)));
    }

    if (target.role === "President") {
      pos = body.indexOf("Presidentロボット");
      if (pos >= 0) texts.push(body.slice(pos, Math.min(body.length, pos + 1200)));
    }

    if (target.role === "Manager") {
      pos = body.indexOf("Managerロボット");
      if (pos >= 0) texts.push(body.slice(pos, Math.min(body.length, pos + 1200)));
    }

    if (target.role === "Leader") {
      pos = body.indexOf("Leaderロボット");
      if (pos >= 0) texts.push(body.slice(pos, Math.min(body.length, pos + 1200)));
    }

    if (target.role === "Worker") {
      pos = body.indexOf("Workerロボット");
      if (pos >= 0) texts.push(body.slice(pos, Math.min(body.length, pos + 1200)));
    }

    return texts.join("\n---\n");
  }

  function existingAssignmentRobotPoolId(target, card) {
    var text = existingAssignmentRegionText(target, card);
    var match;

    match = text.match(/Business側ロボットプール[:：]\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (match && match[1]) return match[1];

    match = text.match(/robot_pool_id["\s:：]*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (match && match[1]) return match[1];

    return "";
  }

  function findRobotById(robotPoolId) {
    var i;
    var row;
    var rid;

    if (!robotPoolId) return null;

    for (i = 0; i < STATE.robots.length; i += 1) {
      row = STATE.robots[i];
      rid = robotId(row, "");
      if (rid === robotPoolId) return row;
    }

    return null;
  }

  function roleWordsForTarget(target) {
    var role = String(target && target.role ? target.role : "");

    if (role === "President") return ["President"];
    if (role === "Manager") return ["Manager", "ExecutiveManager"];
    if (role === "Leader") return ["Leader"];
    if (role === "Worker") return ["Worker"];

    return [role];
  }

  function roleTokenMatch(text, word) {
  return aicmV12TextSupportsExactRoleForTarget(text, word);
}

  function businessOsTextSupportsTargetRole(text, target) {
  var expected = aicmV12ResolveTargetRole(target);
  return aicmV12TextSupportsExactRoleForTarget(text, expected);
}

  function robotRowText(row) {
    var text = "";
    var keys = [
      "role_code",
      "role_codes",
      "supported_role_codes",
      "eligible_role_codes",
      "placement_role_code",
      "placement_role_codes",
      "role_slot_1",
      "role_slot_2",
      "role_slot_3",
      "role_name",
      "role_name_en",
      "roles",
      "role_labels",
      "role_label"
    ];
    var i;
    var v;

    for (i = 0; i < keys.length; i += 1) {
      v = row && row[keys[i]];
      if (v == null) continue;

      if (Array.isArray(v)) {
        text += " " + v.join(" ");
      } else if (typeof v === "object") {
        try {
          text += " " + JSON.stringify(v);
        } catch (error) {}
      } else {
        text += " " + String(v);
      }
    }

    if (!text) {
      try {
        text = JSON.stringify(row || {});
      } catch (error) {
        text = "";
      }
    }

    text = text.replace(/AICompanyManager/g, "AICM");

    return text;
  }

  function robotSupportsTargetRole(row, target) {
    var words = roleWordsForTarget(target);
    var text = robotRowText(row);
    var i;

    for (i = 0; i < words.length; i += 1) {
      if (roleTokenMatch(text, words[i])) return true;
    }

    return false;
  }

  function businessOsRobotOptionText(target, row) {
    var roleText = "";
    var text = robotRowText(row);
    var words = roleWordsForTarget(target);
    var i;

    for (i = 0; i < words.length; i += 1) {
      if (roleTokenMatch(text, words[i])) {
        roleText = roleText ? roleText + "・" + words[i] : words[i];
      }
    }

    if (!roleText) roleText = target.role;

    return target.role + "配置: " + displayName(row, "") + " / " + detectModelCode(row, "") + " / 対応: " + roleText + " / BusinessOS DB";
  }

  function selectedRobotIsCanonicalBusinessOs(row, select, optionText, target) {
    var rid = row ? robotId(row, select ? select.value : "") : "";
    var text = String(optionText || "");

    if (!row) return false;
    if (!isUuid(rid)) return false;
    if (text.indexOf("BusinessOS DB") < 0) return false;
    if (!businessOsTextSupportsTargetRole(text, target)) return false;

    return true;
  }

  function buildRobotFromOption(option) {
    var text = option ? option.textContent || "" : "";
    var value = option ? option.value || "" : "";
    var match;
    var name = "";
    var model = "";

    match = text.match(/配置:\s*([^/]+)\s*\/\s*([^/]+)\s*\//);
    if (match) {
      name = String(match[1] || "").trim();
      model = String(match[2] || "").trim();
    }

    return {
      id: value,
      robot_pool_id: value,
      business_robot_pool_id: value,
      model_code: model,
      robot_display_name: name,
      display_name: name,
      name: name,
      option_text: text
    };
  }

  function firstBusinessOsOptionForTarget(select, target) {
    var i;
    var option;
    var row;

    if (!select || !select.options) return null;

    for (i = 0; i < select.options.length; i += 1) {
      option = select.options[i];

      if (!option || !isUuid(option.value)) continue;
      if (!businessOsTextSupportsTargetRole(option.textContent || "", target)) continue;

      row = findRobotById(option.value) || buildRobotFromOption(option);

      return {
        robot: row,
        option_text: option.textContent || "",
        source: "select_role_businessos_db_option"
      };
    }

    return null;
  }

  function firstBusinessOsRobotForTarget(target) {
    var i;
    var row;
    var rid;

    if (!STATE || !STATE.robots || !STATE.robots.length) return null;

    for (i = 0; i < STATE.robots.length; i += 1) {
      row = STATE.robots[i];
      rid = robotId(row, "");

      if (!isUuid(rid)) continue;
      if (!robotSupportsTargetRole(row, target)) continue;

      return row;
    }

    return null;
  }

  function resolveRobotForPayload(target, card, select) {
    var optionText = selectedText(select);
    var selectedRobot = findRobotBySelect(select);
    var optionSelection;
    var existingRobotPoolId;
    var existingRobot;
    var roleRobot;

    if (selectedRobotIsCanonicalBusinessOs(selectedRobot, select, optionText, target)) {
      return {
        robot: selectedRobot,
        option_text: optionText,
        source: "select_businessos_db"
      };
    }

    optionSelection = firstBusinessOsOptionForTarget(select, target);

    if (optionSelection && optionSelection.robot) {
      return optionSelection;
    }

    existingRobotPoolId = existingAssignmentRobotPoolId(target, card);
    existingRobot = findRobotById(existingRobotPoolId);

    if (existingRobot && isUuid(robotId(existingRobot, "")) && robotSupportsTargetRole(existingRobot, target)) {
      return {
        robot: existingRobot,
        option_text: businessOsRobotOptionText(target, existingRobot),
        source: "existing_assignment_visible"
      };
    }

    roleRobot = firstBusinessOsRobotForTarget(target);

    if (roleRobot) {
      return {
        robot: roleRobot,
        option_text: businessOsRobotOptionText(target, roleRobot),
        source: "role_businessos_db_fallback"
      };
    }

    return {
      robot: null,
      option_text: optionText,
      source: "none"
    };
  }

  function aicmAllowedModelCodesForRole(role) {
    if (role === "President") return ["HD-R5P", "BYD2-003"];
    if (role === "Manager") return ["HD-R5", "BYD2-002", "BYD2-003"];
    if (role === "Leader") return ["HD-R4", "BYD2-001", "BYD2-002"];
    if (role === "Worker") return ["HD-R3", "BYD1-001", "BYD1-002", "BYD1-003", "MG-NORN-001", "MG-NORN-002", "MG-NORN-003"];
    return [];
  }

  function aicmTextHasModelCode(text, modelCode) {
    return String(text || "").indexOf(String(modelCode || "")) >= 0;
  }

  function aicmModelAllowedForRole(role, modelCode) {
    var allowed = aicmAllowedModelCodesForRole(role);
    var i;

    for (i = 0; i < allowed.length; i += 1) {
      if (String(modelCode || "") === allowed[i]) return true;
    }

    return false;
  }

  function aicmOptionTextAllowedForRole(role, text) {
    var allowed = aicmAllowedModelCodesForRole(role);
    var source = String(text || "");
    var i;

    if (source.indexOf("BusinessOS DB") < 0) return false;

    for (i = 0; i < allowed.length; i += 1) {
      if (aicmTextHasModelCode(source, allowed[i])) return true;
    }

    return false;
  }

  function aicmBuildRobotFromOption(option) {
    var text = option ? option.textContent || "" : "";
    var value = option ? option.value || "" : "";
    var match;
    var name = "";
    var model = "";

    match = text.match(/配置:\s*([^/]+)\s*\/\s*([^/]+)\s*\//);
    if (!match) match = text.match(/^\s*([^/]+)\s*\/\s*([^/]+)\s*\//);

    if (match) {
      name = String(match[1] || "").trim();
      model = String(match[2] || "").trim();
    }

    return {
      id: value,
      robot_pool_id: value,
      business_robot_pool_id: value,
      model_code: model,
      robot_display_name: name,
      display_name: name,
      name: name,
      option_text: text
    };
  }

  function aicmFindRoleCompatibleOptionRobot(target, select) {
    var i;
    var option;
    var row;

    if (!select || !select.options) return null;

    for (i = 0; i < select.options.length; i += 1) {
      option = select.options[i];

      if (!option || !isUuid(option.value)) continue;
      if (!aicmOptionTextAllowedForRole(target.role, option.textContent || "")) continue;

      row = findRobotById(option.value) || aicmBuildRobotFromOption(option);

      return {
        robot: row,
        option_text: option.textContent || "",
        source: "final_payload_role_model_option"
      };
    }

    return null;
  }

  function aicmFindRoleCompatibleStateRobot(target) {
    var i;
    var row;
    var rid;
    var model;

    if (!STATE || !STATE.robots || !STATE.robots.length) return null;

    for (i = 0; i < STATE.robots.length; i += 1) {
      row = STATE.robots[i];
      rid = robotId(row, "");
      model = detectModelCode(row, "");

      if (!isUuid(rid)) continue;
      if (!aicmModelAllowedForRole(target.role, model)) continue;

      return {
        robot: row,
        option_text: target.role + "配置: " + displayName(row, "") + " / " + model + " / BusinessOS DB",
        source: "final_payload_role_model_state"
      };
    }

    return null;
  }

  function aicmNormalizeRobotForFinalPayload(target, card, select, resolvedRobot, optionText, robotResolveSource) {
    var currentModel = resolvedRobot ? detectModelCode(resolvedRobot, optionText || "") : "";
    var currentRobotId = resolvedRobot ? robotId(resolvedRobot, "") : "";
    var optionMatch;
    var stateMatch;

    if (
      resolvedRobot &&
      isUuid(currentRobotId) &&
      aicmModelAllowedForRole(target.role, currentModel) &&
      aicmOptionTextAllowedForRole(target.role, optionText || "")
    ) {
      return {
        robot: resolvedRobot,
        option_text: optionText || "",
        source: robotResolveSource || "final_payload_already_role_model_ok"
      };
    }

    optionMatch = aicmFindRoleCompatibleOptionRobot(target, select);
    if (optionMatch && optionMatch.robot) return optionMatch;

    stateMatch = aicmFindRoleCompatibleStateRobot(target);
    if (stateMatch && stateMatch.robot) return stateMatch;

    return {
      robot: resolvedRobot || null,
      option_text: optionText || "",
      source: robotResolveSource || "final_payload_no_role_model_replacement"
    };
  }


  function buildPayload(target, card) {
    var select = byId(target.selectId);
    var resolvedRobot = resolveRobotForPayload(target, card, select);
    var selectedRobot = resolvedRobot.robot;
    var optionText = resolvedRobot.option_text;
    var robotResolveSource = resolvedRobot.source;
    var finalRobotResolution = aicmNormalizeRobotForFinalPayload(target, card, select, selectedRobot, optionText, robotResolveSource);
    selectedRobot = finalRobotResolution.robot;
    optionText = finalRobotResolution.option_text;
    robotResolveSource = finalRobotResolution.source;
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
      robot_resolve_source: robotResolveSource || "",
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

    if (
      validation.validation_errors.indexOf("robot_not_selected") >= 0 ||
      validation.validation_errors.indexOf("robot_pool_id_required") >= 0
    ) {
      payload.preview_warning = "robot_not_selected_save_blocked";
    } else if (validation.validation_errors.indexOf("robot_pool_id_not_canonical_uuid") >= 0) {
      payload.preview_warning = "robot_pool_id_not_canonical_uuid_save_blocked";
    } else if (validation.validation_errors.indexOf("robot_selection_not_businessos_db") >= 0) {
      payload.preview_warning = "robot_selection_not_businessos_db_save_blocked";
    } else if (payload.company_mapping_warning) {
      payload.preview_warning = payload.company_mapping_warning;
    }

    return payload;
  }

  function row(label, value) {
    return '<div class="aicm-preview-key">' + esc(label) + '</div><div class="aicm-preview-value">' + esc(value || "-") + '</div>';
  }

  function renderPreview(target) {
    /* AICM_GATE_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_AKR_AKU_V1
     * 本番UIではロボット配置 payload preview / debug panel を描画しない。
     * payload build / validation / normalizer は残す。
     * デバッグ表示が必要な時だけ console 等で:
     * window.AICM_DEV_DEBUG_SURFACE_ENABLED = true
     */
    if (!window.AICM_DEV_DEBUG_SURFACE_ENABLED) {
      return;
    }

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
    /* AICM_GATE_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_AKR_AKU_V1
     * 本番UIではロボット配置 payload preview / debug panel を描画しない。
     * payload build / validation / normalizer は残す。
     * デバッグ表示が必要な時だけ console 等で:
     * window.AICM_DEV_DEBUG_SURFACE_ENABLED = true
     */
    if (!window.AICM_DEV_DEBUG_SURFACE_ENABLED) {
      return;
    }

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
