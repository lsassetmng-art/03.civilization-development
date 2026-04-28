/* AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_V1 */
(function () {
  "use strict";

  var API_URL = "./api/aicm/business-robot-pool";
  var STYLE_ID = "aicm-robot-placement-payload-preview-style-v1";
  var TIMER = null;

  var STATE = {
    loaded: false,
    loading: false,
    api_ok: false,
    robots: [],
    last_error: ""
  };

  var TARGETS = [
    {
      role: "President",
      scope: "company",
      selectId: "company-president-robot",
      nicknameIds: ["company-president-nickname", "president-robot-nickname", "company-president-robot-nickname"],
      targetIdIds: [],
      titleHints: ["Presidentロボット", "President robot", "社長ロボット"],
      cardTitle: "President配置payload preview"
    },
    {
      role: "Manager",
      scope: "department",
      selectId: "department-manager-robot",
      nicknameIds: ["department-manager-nickname", "manager-robot-nickname", "department-manager-robot-nickname"],
      targetIdIds: ["department-select", "edit-department-select"],
      titleHints: ["Managerロボット設定", "Managerロボット", "部門長ロボット"],
      cardTitle: "Manager配置payload preview"
    },
    {
      role: "Leader",
      scope: "section",
      selectId: "section-leader-robot",
      nicknameIds: ["section-leader-nickname", "leader-robot-nickname", "section-leader-robot-nickname"],
      targetIdIds: ["organization-select", "section-select", "edit-organization-select"],
      titleHints: ["Leaderロボット設定", "Leaderロボット", "課長"],
      cardTitle: "Leader配置payload preview"
    },
    {
      role: "Worker",
      scope: "section",
      selectId: "section-worker-robot-select",
      nicknameIds: ["section-worker-nickname", "worker-robot-nickname", "section-worker-robot-nickname"],
      targetIdIds: ["organization-select", "section-select", "edit-organization-select"],
      titleHints: ["Workerロボット配置", "Worker配置", "配置済みWorker"],
      cardTitle: "Worker配置payload preview"
    }
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
      ".aicm-payload-preview pre{white-space:pre-wrap;word-break:break-word;background:#0f172a;color:#e2e8f0;border-radius:10px;padding:10px;font-size:12px;line-height:1.45;}",
      ".aicm-payload-preview .aicm-preview-note{color:#667085;font-size:13px;margin:6px 0;}",
      ".aicm-payload-preview .aicm-preview-badge{display:inline-block;padding:3px 7px;border-radius:999px;background:#e8fff2;color:#087443;font-weight:700;font-size:11px;margin:2px;}"
    ].join("\n");

    document.head.appendChild(style);
  }

  function textOf(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function firstValue(ids) {
    var i;
    var el;
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

  var MODEL_CODES = [
    "HD-R2T-0", "MG-NORN-001", "MG-NORN-002", "MG-NORN-003",
    "BYD1-001", "BYD1-002", "BYD1-003", "BYD2-001", "BYD2-002", "BYD2-003",
    "HD-R5P", "HD-R2S", "HD-R2G", "HD-R1C", "HD-R1A", "HD-R5", "HD-R4", "HD-R3", "HD-R2", "HD-R1"
  ];

  function detectModelCode(row, optionText) {
    var raw = String(pick(row, [
      "model_code",
      "robot_model_code",
      "aiworker_model_code",
      "model_no",
      "model_number",
      "robot_code",
      "model_id"
    ]) || "");

    var all = raw + " " + asText(row) + " " + String(optionText || "");
    var i;

    for (i = 0; i < MODEL_CODES.length; i += 1) {
      if (all.indexOf(MODEL_CODES[i]) >= 0) return MODEL_CODES[i];
    }

    return raw || "";
  }

  function robotId(row, fallback) {
    return String(pick(row, [
      "business_robot_id",
      "robot_pool_id",
      "pool_robot_id",
      "company_robot_id",
      "robot_id",
      "aiworker_robot_id",
      "id"
    ]) || fallback || "");
  }

  function displayName(row, optionText) {
    return String(pick(row, [
      "display_name",
      "robot_display_name",
      "robot_name",
      "model_name_ja",
      "model_name",
      "name",
      "model_code",
      "id"
    ]) || optionText || "");
  }

  function findRobotBySelect(select) {
    var value = select && select.value ? String(select.value) : "";
    var optionText = selectedText(select);
    var i;
    var row;
    var rid;

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

    return {
      id: value,
      display_name: optionText,
      model_code: detectModelCode({}, optionText)
    };
  }

  function cardForTarget(target) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".aicm-card"));
    var i;
    var text;
    var h;

    for (i = 0; i < cards.length; i += 1) {
      text = textOf(cards[i]);
      for (h = 0; h < target.titleHints.length; h += 1) {
        if (text.indexOf(target.titleHints[h]) >= 0) return cards[i];
      }
    }

    return null;
  }

  function buildPayload(target) {
    var select = byId(target.selectId);
    var selectedRobot = findRobotBySelect(select);
    var optionText = selectedText(select);
    var targetId = firstValue(target.targetIdIds);
    var nickname = firstValue(target.nicknameIds);

    if (!nickname && selectedRobot) {
      nickname = displayName(selectedRobot, optionText);
    }

    return {
      source: "AICompanyManager UI preview",
      operation: "company_robot_placement.preview_only",
      save_status: "NOT_SAVED",
      api_write: false,
      db_write: false,
      company_id: companyId(),
      target_scope: target.scope,
      target_id: target.scope === "company" ? "" : targetId,
      placement_role_code: target.role,
      robot_pool_id: selectedRobot ? robotId(selectedRobot, select ? select.value : "") : "",
      model_code: selectedRobot ? detectModelCode(selectedRobot, optionText) : "",
      robot_display_name: selectedRobot ? displayName(selectedRobot, optionText) : "",
      internal_nickname: nickname || "",
      assignment_policy: "unlimited_system_use",
      quantity_consumption: false,
      selected_option_text: optionText || "",
      preview_warning: select && select.value ? "" : "robot_not_selected"
    };
  }

  function renderPreview(target) {
    var card = cardForTarget(target);
    var payload;
    var existing;
    var html;

    if (!card) return;

    existing = card.querySelector("[data-aicm-placement-payload-preview='" + target.role + "']");
    payload = buildPayload(target);

    html = [
      '<div class="aicm-payload-preview" data-aicm-placement-payload-preview="' + esc(target.role) + '">',
      '<h3>' + esc(target.cardTitle) + '</h3>',
      '<span class="aicm-preview-badge">preview only</span>',
      '<span class="aicm-preview-badge">DB保存なし</span>',
      '<span class="aicm-preview-badge">数量消費なし</span>',
      '<p class="aicm-preview-note">保存前に、BusinessOS _aiworker APIへ渡す予定payloadを確認します。</p>',
      '<pre>' + esc(JSON.stringify(payload, null, 2)) + '</pre>',
      '</div>'
    ].join("");

    if (existing) {
      existing.outerHTML = html;
    } else {
      card.insertAdjacentHTML("beforeend", html);
    }
  }

  function renderAll() {
    try {
      injectStyle();
      TARGETS.forEach(renderPreview);
      window.AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_STATUS = {
        ok: true,
        mode: "preview_only",
        api_ok: STATE.api_ok,
        robot_count: STATE.robots.length,
        db_write: false,
        api_write: false,
        quantity_consumption: false
      };
    } catch (error) {
      window.AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_STATUS = {
        ok: false,
        error: error && error.message ? error.message : String(error)
      };
    }
  }

  function fetchPool() {
    if (STATE.loading || STATE.loaded) return Promise.resolve();
    STATE.loading = true;

    return fetch(API_URL, { cache: "no-store" })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok || !result.body || result.body.result !== "ok") {
          STATE.api_ok = false;
          STATE.last_error = "API failed: " + result.status;
          return;
        }

        STATE.api_ok = true;
        STATE.loaded = true;
        STATE.robots = Array.isArray(result.body.robots) ? result.body.robots : [];
        STATE.last_error = "";
      })
      .catch(function (error) {
        STATE.api_ok = false;
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
      fetchPool().then(renderAll);
    }, 180);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", schedule);
    } else {
      schedule();
    }

    window.addEventListener("load", schedule);
    window.addEventListener("focus", schedule);

    document.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || !target.id) return;
      if (TARGETS.some(function (t) { return t.selectId === target.id || t.nicknameIds.indexOf(target.id) >= 0; })) {
        schedule();
      }
    }, true);

    document.addEventListener("input", function (event) {
      var target = event.target;
      if (!target || !target.id) return;
      if (TARGETS.some(function (t) { return t.nicknameIds.indexOf(target.id) >= 0; })) {
        schedule();
      }
    }, true);

    document.addEventListener("click", function () {
      window.setTimeout(schedule, 250);
    }, true);
  } catch (error) {
    window.AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_STATUS = {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_V1_END */
