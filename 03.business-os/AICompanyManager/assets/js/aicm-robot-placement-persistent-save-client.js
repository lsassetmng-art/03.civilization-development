/* AICM_PRODUCTION_ROLE_BUTTON_SAVE_ROUTE_V1 */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8795";
  var STATUS_CLASS = "aicm-role-save-status-v1";
  var BOUND_ATTR = "data-aicm-role-save-bound";
  var OLD_SAVE_SELECTOR =
    ".aicm-db-save-button-v1,.aicm-db-save-status-v1,.aicm-db-save-button-v2,.aicm-db-save-status-v2,.aicm-db-save-button-v3,.aicm-db-save-status-v3";

  var ROLE_BUTTONS = [
    { label: "Presidentを設定", role: "President" },
    { label: "Managerを設定", role: "Manager" },
    { label: "Leaderを設定", role: "Leader" },
    { label: "Workerを追加", role: "Worker" },
    { label: "この配置を変更", role: "Worker" }
  ];

  function textOf(node) {
    return node ? String(node.textContent || "") : "";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
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

  function tryParseJson(text) {
    var raw = String(text || "");
    var first = raw.indexOf("{");
    var last = raw.lastIndexOf("}");
    var sliced;

    if (first < 0 || last <= first) return null;

    sliced = raw.slice(first, last + 1);

    try {
      return JSON.parse(sliced);
    } catch (error) {
      try {
        return JSON.parse(sliced.replace(/\u00a0/g, " "));
      } catch (ignored) {
        return null;
      }
    }
  }

  function isPlacementPayload(payload) {
    if (!payload) return false;

    return (
      String(payload.operation || "").indexOf("company_robot_placement.preview_only") >= 0 &&
      !!payload.company_id &&
      !!payload.placement_role_code &&
      !!payload.robot_pool_id &&
      (!!payload.model_code || !!payload.aiworker_model_code)
    );
  }

  function payloadIsSavable(payload, role) {
    if (!isPlacementPayload(payload)) return false;
    if (role && String(payload.placement_role_code || "") !== role) return false;
    if (payload.save_blocked === true) return false;
    if (String(payload.strict_validation_status || "").indexOf("OK") !== 0) return false;
    if (String(payload.robot_selection_status || "").indexOf("BLOCKED") >= 0) return false;
    return true;
  }

  function parsePayloadFromNode(node) {
    var parsed = tryParseJson(textOf(node));
    if (isPlacementPayload(parsed)) return parsed;
    return null;
  }

  function allPayloadCandidates(role) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("details,pre,code,textarea,section,article,div"));
    var payloads = [];

    nodes.forEach(function (node) {
      var payload = parsePayloadFromNode(node);
      if (!payloadIsSavable(payload, role)) return;

      payloads.push({
        node: node,
        payload: payload
      });
    });

    return payloads;
  }

  function distanceBetween(a, b) {
    var ar;
    var br;
    var ay;
    var by;

    try {
      ar = a.getBoundingClientRect();
      br = b.getBoundingClientRect();
      ay = ar.top + window.scrollY;
      by = br.top + window.scrollY;
      return Math.abs(ay - by);
    } catch (error) {
      return 999999;
    }
  }

  function findNearestPayload(button, role) {
    var candidates = allPayloadCandidates(role);
    var best = null;

    candidates.forEach(function (entry) {
      var score = distanceBetween(button, entry.node);

      if (!best || score < best.score) {
        best = {
          score: score,
          payload: entry.payload,
          node: entry.node
        };
      }
    });

    return best ? best.payload : null;
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

  function roleFromButton(button) {
    var label = normalizeText(button.textContent);
    var i;

    for (i = 0; i < ROLE_BUTTONS.length; i += 1) {
      if (label === ROLE_BUTTONS[i].label) return ROLE_BUTTONS[i].role;
    }

    return "";
  }

  async function savePayload(button, role, payload) {
    var response;
    var result;

    if (!payloadIsSavable(payload, role)) {
      setStatus(button, "保存不可: ロボット配置payloadが未作成、またはvalidationがOKではありません。", false);
      return;
    }

    response = await fetch(API_BASE + "/api/aicm/company-robot-placement/save", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        source: "AICompanyManager role button save",
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
      "保存OK: " + role + "配置を BusinessOS DB company_robot_placement に保存しました。画面更新で確認できます。",
      true
    );
  }

  function bindRoleButton(button) {
    var role;

    if (button.getAttribute(BOUND_ATTR) === "1") return;

    role = roleFromButton(button);
    if (!role) return;

    button.setAttribute(BOUND_ATTR, "1");
    button.setAttribute("data-aicm-placement-role", role);

    button.addEventListener("click", function () {
      var currentRole = role;

      window.setTimeout(async function () {
        var payload;

        cleanupGenericDbSaveButtons();

        payload = findNearestPayload(button, currentRole);

        if (!payloadIsSavable(payload, currentRole)) {
          setStatus(
            button,
            currentRole + "配置payloadがまだ保存可能状態ではありません。候補選択後、もう一度このボタンを押してください。",
            false
          );
          return;
        }

        if (
          !window.confirm(
            currentRole +
              "配置をBusinessOS DBへ保存します。\n\nrobot: " +
              (payload.robot_display_name || payload.model_code || payload.aiworker_model_code || "-") +
              "\ntarget: " +
              (payload.target_scope || payload.target_level_code || "-") +
              "\n\n続行しますか？"
          )
        ) {
          return;
        }

        try {
          setButtonBusy(button, true);
          setStatus(button, "保存中: BusinessOS DBへ送信しています。", true);
          await savePayload(button, currentRole, payload);
        } catch (error) {
          setStatus(button, "保存失敗: " + String(error && error.message ? error.message : error), false);
        } finally {
          setButtonBusy(button, false);
        }
      }, 450);
    });
  }

  function enhance() {
    cleanupGenericDbSaveButtons();

    Array.prototype.slice.call(document.querySelectorAll("button")).forEach(function (button) {
      bindRoleButton(button);
    });

    window.AICM_PRODUCTION_ROLE_BUTTON_SAVE_ROUTE_STATUS = {
      marker: "AICM_PRODUCTION_ROLE_BUTTON_SAVE_ROUTE_V1",
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
