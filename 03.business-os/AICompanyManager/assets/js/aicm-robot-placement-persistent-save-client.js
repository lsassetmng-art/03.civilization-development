/* AICM_PRODUCTION_ROLE_BUTTON_DIRECT_SELECT_SAVE_ROUTE_V2 */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8795";
  var STATUS_CLASS = "aicm-role-save-status-v2";
  var BOUND_ATTR = "data-aicm-role-save-bound-v2";
  var EXISTING_OPTION_ATTR = "data-aicm-existing-display-only";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  var MODEL_RE = /(BYD[12]-[0-9]{3}|HD-R[0-9A-Z-]+|MG-NORN-[0-9]{3}|LVS-[0-9]{2}[FM]v[0-9]{3})/i;

  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";
  var DEFAULT_DEPARTMENT_ID = "00000000-0000-4000-8000-f6d6b5b3d38c";
  var DEFAULT_SECTION_ID = "00000000-0000-4000-8000-4da5c1a6977e";

  var ROLE_SPECS = [
    {
      role: "President",
      labels: ["Presidentを設定"],
      heading: "Presidentロボット",
      scope: "company",
      fallbackTargetId: ""
    },
    {
      role: "Manager",
      labels: ["Managerを設定"],
      heading: "Managerロボット設定",
      scope: "department",
      fallbackTargetId: DEFAULT_DEPARTMENT_ID
    },
    {
      role: "Leader",
      labels: ["Leaderを設定"],
      heading: "Leaderロボット設定",
      scope: "section",
      fallbackTargetId: DEFAULT_SECTION_ID
    },
    {
      role: "Worker",
      labels: ["Workerを追加", "この配置を変更"],
      heading: "Workerロボット",
      scope: "section",
      fallbackTargetId: DEFAULT_SECTION_ID
    }
  ];

  var OLD_SAVE_SELECTOR =
    ".aicm-db-save-button-v1,.aicm-db-save-status-v1,.aicm-db-save-button-v2,.aicm-db-save-status-v2,.aicm-db-save-button-v3,.aicm-db-save-status-v3";

  function textOf(node) {
    return node ? String(node.textContent || "") : "";
  }

  function valueOf(node) {
    return node ? String(node.value || "") : "";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function cleanCandidateLabel(text) {
    return normalizeText(text)
      .replace(/^保存済み:\s*/g, "")
      .replace(/^BusinessOS DB候補を選択$/g, "")
      .replace(/^選択してください$/g, "");
  }

  function cleanupGenericDbSaveButtons() {
    document.querySelectorAll(OLD_SAVE_SELECTOR).forEach(function (node) {
      node.remove();
    });

    Array.prototype.slice.call(document.querySelectorAll("button")).forEach(function (button) {
      if (normalizeText(button.textContent) === "DB本保存") {
        button.remove();
      }
    });
  }

  function roleSpecByButton(button) {
    var label = normalizeText(button.textContent);
    var i;
    var j;

    for (i = 0; i < ROLE_SPECS.length; i += 1) {
      for (j = 0; j < ROLE_SPECS[i].labels.length; j += 1) {
        if (label === ROLE_SPECS[i].labels[j]) return ROLE_SPECS[i];
      }
    }

    return null;
  }

  function roleRoot(button, spec) {
    var node = button;
    var best = null;
    var guard = 0;

    while (node && node !== document.body && guard < 14) {
      var text = textOf(node);
      var hasHeading = text.indexOf(spec.heading) >= 0 || text.indexOf(spec.role + "ロボット") >= 0;
      var hasButton = spec.labels.some(function (label) {
        return text.indexOf(label) >= 0;
      });

      if (hasHeading && hasButton) {
        best = node;
        break;
      }

      node = node.parentElement;
      guard += 1;
    }

    return best || button.parentElement || document.body;
  }

  function findRoleSelect(root, spec) {
    var selects = Array.prototype.slice.call(root.querySelectorAll("select"));
    var best = null;
    var i;

    for (i = 0; i < selects.length; i += 1) {
      var select = selects[i];
      var text = textOf(select);
      var id = String(select.id || "");
      var name = String(select.name || "");
      var labelled = text.indexOf("BusinessOS DB") >= 0 || id.indexOf(spec.role) >= 0 || name.indexOf(spec.role) >= 0;

      if (labelled) {
        best = select;
        break;
      }
    }

    if (!best && selects.length === 1) best = selects[0];

    return best;
  }

  function findNickname(root, spec) {
    var inputs = Array.prototype.slice.call(root.querySelectorAll("input"));
    var best = "";
    var i;

    for (i = 0; i < inputs.length; i += 1) {
      var input = inputs[i];
      var type = String(input.type || "text").toLowerCase();
      var value = valueOf(input);

      if (type !== "text" && type !== "search" && type !== "") continue;
      if (!value) continue;
      if (UUID_RE.test(value)) continue;
      if (value.indexOf("候補") >= 0) continue;

      best = value;
    }

    return best;
  }

  function findCompanyId() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("input"));
    var i;

    for (i = 0; i < inputs.length; i += 1) {
      var value = valueOf(inputs[i]);
      if (UUID_RE.test(value)) {
        return value.match(UUID_RE)[0];
      }
    }

    var text = textOf(document.body);
    var matched = text.match(UUID_RE);
    return matched ? matched[0] : DEFAULT_COMPANY_ID;
  }

  function findTargetId(root, spec) {
    var text;
    var matched;

    if (spec.scope === "company") return "";

    text = textOf(root);
    matched = text.match(UUID_RE);
    if (matched) return matched[0];

    if (spec.role === "Manager") return DEFAULT_DEPARTMENT_ID;
    return DEFAULT_SECTION_ID;
  }

  function optionIsSaveCandidate(option) {
    var text;
    var value;

    if (!option) return false;
    if (option.getAttribute(EXISTING_OPTION_ATTR) === "1") return false;

    text = normalizeText(option.textContent);
    value = normalizeText(option.value);

    if (!text) return false;
    if (text === "選択してください") return false;
    if (text.indexOf("候補を選択") >= 0) return false;
    if (value.indexOf("existing:") === 0) return false;

    return text.indexOf("BusinessOS DB") >= 0 || UUID_RE.test(value);
  }

  function selectedCandidate(select) {
    var option;

    if (!select) {
      return {
        ok: false,
        reason: "select_not_found"
      };
    }

    option = select.options[select.selectedIndex];

    if (!optionIsSaveCandidate(option)) {
      return {
        ok: false,
        reason: "candidate_not_selected"
      };
    }

    return parseCandidateOption(option, select);
  }

  function parseCandidateOption(option, select) {
    var text = normalizeText(option.textContent);
    var value = normalizeText(option.value);
    var uuidMatch = value.match(UUID_RE) || text.match(UUID_RE);
    var modelMatch = value.match(MODEL_RE) || text.match(MODEL_RE);
    var robotPoolId = uuidMatch ? uuidMatch[0] : "";
    var modelCode = modelMatch ? modelMatch[0] : "";
    var label = cleanCandidateLabel(text);
    var displayName = label;
    var afterPrefix;
    var parts;

    if (label.indexOf("配置:") >= 0) {
      afterPrefix = label.split("配置:").slice(1).join("配置:");
      parts = afterPrefix.split("/").map(cleanCandidateLabel).filter(Boolean);
      displayName = parts[0] || displayName;
      if (!modelCode && parts[1] && MODEL_RE.test(parts[1])) modelCode = parts[1].match(MODEL_RE)[0];
    } else {
      parts = label.split("/").map(cleanCandidateLabel).filter(Boolean);
      displayName = parts[0] || displayName;
      if (!modelCode && parts[1] && MODEL_RE.test(parts[1])) modelCode = parts[1].match(MODEL_RE)[0];
    }

    if (!robotPoolId && UUID_RE.test(select.value || "")) robotPoolId = String(select.value).match(UUID_RE)[0];

    return {
      ok: !!(robotPoolId && modelCode && displayName),
      reason: robotPoolId && modelCode && displayName ? "" : "candidate_parse_failed",
      robot_pool_id: robotPoolId,
      model_code: modelCode,
      aiworker_model_code: modelCode,
      robot_display_name: displayName,
      selected_option_text: text
    };
  }

  function buildPayload(button, spec) {
    var root = roleRoot(button, spec);
    var select = findRoleSelect(root, spec);
    var candidate = selectedCandidate(select);
    var nickname = findNickname(root, spec);
    var companyId = findCompanyId();
    var targetId = findTargetId(root, spec);

    if (!candidate.ok) {
      return {
        ok: false,
        reason: candidate.reason,
        role: spec.role
      };
    }

    return {
      ok: true,
      payload: {
        source: "AICompanyManager role button direct select save",
        operation: "company_robot_placement.preview_only",
        save_status: "PREVIEW_ONLY_CANONICAL_OK",
        api_write: false,
        db_write: false,
        company_id: companyId,
        target_scope: spec.scope,
        target_id: targetId,
        target_id_source: spec.scope === "company" ? "company_scope_no_target_id" : "direct_ui_target",
        target_id_canonicalization_status: spec.scope === "company" ? "OK_COMPANY_SCOPE" : "OK_INPUT_UUID",
        placement_role_code: spec.role,
        robot_pool_id: candidate.robot_pool_id,
        model_code: candidate.model_code,
        aiworker_model_code: candidate.aiworker_model_code,
        robot_display_name: candidate.robot_display_name,
        internal_nickname: nickname || candidate.robot_display_name,
        assignment_policy: "unlimited_system_use",
        quantity_consumption: false,
        selected_option_text: candidate.selected_option_text,
        preview_warning: "",
        validation_errors: [],
        validation_warnings: [],
        robot_selection_status: "OK_ROBOT_SELECTED",
        strict_validation_status: "OK_STRICT_PREVIEW_VALIDATION"
      }
    };
  }

  function createStatus(button) {
    var parent = button.parentElement || document.body;
    var status = parent.querySelector(":scope > ." + STATUS_CLASS);

    if (!status) {
      status = document.createElement("div");
      status.className = STATUS_CLASS;
      status.style.marginTop = "10px";
      status.style.padding = "10px";
      status.style.borderRadius = "12px";
      status.style.fontWeight = "800";
      status.style.lineHeight = "1.5";
      parent.appendChild(status);
    }

    return status;
  }

  function setStatus(button, message, ok) {
    var status = createStatus(button);

    status.textContent = message;
    status.style.background = ok ? "#e8fff1" : "#fff1f1";
    status.style.color = ok ? "#087443" : "#a51616";
  }

  function originalButtonText(button) {
    return button.getAttribute("data-aicm-original-text") || normalizeText(button.textContent);
  }

  function setButtonBusy(button, busy) {
    if (busy) {
      button.setAttribute("data-aicm-original-text", originalButtonText(button));
      button.disabled = true;
      button.textContent = "保存中...";
    } else {
      button.disabled = false;
      button.textContent = originalButtonText(button);
    }
  }

  async function savePayload(button, spec, payload) {
    var response;
    var result;

    response = await fetch(API_BASE + "/api/aicm/company-robot-placement/save", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        source: "AICompanyManager role button direct select save",
        rollback_only: false,
        payload: payload
      })
    });

    result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(normalizeText(result.stderr || result.error || "unknown save error"));
    }

    setStatus(
      button,
      "保存OK: " + spec.role + "配置を BusinessOS DB company_robot_placement に保存しました。画面を更新して確認します。",
      true
    );

    window.setTimeout(function () {
      var base = window.location.href.split("#")[0].split("?")[0];
      window.location.href = base + "?v=" + Date.now();
    }, 900);
  }

  function bindRoleButton(button) {
    var spec = roleSpecByButton(button);

    if (!spec) return;
    if (button.getAttribute(BOUND_ATTR) === "1") return;

    button.setAttribute(BOUND_ATTR, "1");
    button.setAttribute("data-aicm-placement-role", spec.role);

    button.addEventListener("click", function (event) {
      window.setTimeout(async function () {
        var built = buildPayload(button, spec);
        var payload;

        cleanupGenericDbSaveButtons();

        if (!built.ok) {
          if (built.reason === "candidate_not_selected") {
            setStatus(
              button,
              spec.role + "候補を選択してください。保存済み表示や『候補を選択』のままではDB保存しません。",
              false
            );
          } else {
            setStatus(button, spec.role + "保存不可: " + built.reason, false);
          }
          return;
        }

        payload = built.payload;

        if (
          !window.confirm(
            spec.role +
              "配置をBusinessOS DBへ保存します。\n\nrobot: " +
              payload.robot_display_name +
              " / " +
              payload.model_code +
              "\ntarget: " +
              payload.target_scope +
              "\n\n続行しますか？"
          )
        ) {
          return;
        }

        try {
          setButtonBusy(button, true);
          setStatus(button, "保存中: BusinessOS DBへ送信しています。", true);
          await savePayload(button, spec, payload);
        } catch (error) {
          setStatus(button, "保存失敗: " + String(error && error.message ? error.message : error), false);
        } finally {
          setButtonBusy(button, false);
        }
      }, 250);
    });
  }

  function findRoleRoots() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("section,article,div,form"));
    var roots = [];

    ROLE_SPECS.forEach(function (spec) {
      var best = null;
      var i;

      for (i = 0; i < blocks.length; i += 1) {
        var text = textOf(blocks[i]);
        if (text.indexOf(spec.heading) >= 0 || text.indexOf(spec.role + "ロボット") >= 0) {
          if (text.indexOf("Business側ロボットプール") >= 0 || text.indexOf("BusinessOS DB robot_pool") >= 0) {
            best = blocks[i];
            break;
          }
        }
      }

      if (best) roots.push({ spec: spec, root: best });
    });

    return roots;
  }

  function syncExistingValuesToSelects() {
    findRoleRoots().forEach(function (entry) {
      var spec = entry.spec;
      var root = entry.root;
      var select = findRoleSelect(root, spec);
      var text = textOf(root);
      var poolMatch = text.match(/Business側ロボットプール:\s*([0-9a-f-]{36})/i) || text.match(UUID_RE);
      var nicknameMatch = text.match(new RegExp("([^\\n\\r]+)@" + spec.role));
      var existingPoolId;
      var existingName;
      var option;

      if (!select || !poolMatch) return;

      if (select.options[select.selectedIndex] && optionIsSaveCandidate(select.options[select.selectedIndex])) {
        return;
      }

      existingPoolId = poolMatch[1] || poolMatch[0];
      existingName = nicknameMatch ? normalizeText(nicknameMatch[1]) + "@" + spec.role : spec.role + "保存済み";

      option = Array.prototype.slice.call(select.options).find(function (opt) {
        return opt.getAttribute(EXISTING_OPTION_ATTR) === "1";
      });

      if (!option) {
        option = document.createElement("option");
        option.setAttribute(EXISTING_OPTION_ATTR, "1");
        select.insertBefore(option, select.options[1] || null);
      }

      option.value = "existing:" + existingPoolId;
      option.textContent = "保存済み: " + existingName;
      option.selected = true;
    });
  }

  function enhance() {
    cleanupGenericDbSaveButtons();

    Array.prototype.slice.call(document.querySelectorAll("button")).forEach(function (button) {
      bindRoleButton(button);
    });

    syncExistingValuesToSelects();

    window.AICM_PRODUCTION_ROLE_BUTTON_DIRECT_SELECT_SAVE_ROUTE_STATUS = {
      marker: "AICM_PRODUCTION_ROLE_BUTTON_DIRECT_SELECT_SAVE_ROUTE_V2",
      api_base: API_BASE,
      loaded: true,
      bound_button_count: document.querySelectorAll("button[" + BOUND_ATTR + "='1']").length,
      generic_db_save_button_count: Array.prototype.slice
        .call(document.querySelectorAll("button"))
        .filter(function (button) {
          return normalizeText(button.textContent) === "DB本保存";
        }).length
    };
  }

  function start() {
    enhance();

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(enhance, 250);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
