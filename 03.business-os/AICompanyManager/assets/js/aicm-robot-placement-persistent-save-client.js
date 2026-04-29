/* AICM_ROBOT_PLACEMENT_PERSISTENT_SAVE_CLIENT_V1 */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8795";
  var BUTTON_CLASS = "aicm-db-save-button-v1";
  var STATUS_CLASS = "aicm-db-save-status-v1";

  function textOf(node) {
    return node ? String(node.textContent || "") : "";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function parseJsonFromCard(card) {
    var candidates = [];
    var preLike = card.querySelectorAll("pre, code, textarea");

    preLike.forEach(function (node) {
      var text = textOf(node);
      if (text.indexOf("{") >= 0 && text.indexOf("operation") >= 0) {
        candidates.push(text);
      }
    });

    if (candidates.length === 0) {
      var all = textOf(card);
      var first = all.indexOf("{");
      var last = all.lastIndexOf("}");
      if (first >= 0 && last > first) candidates.push(all.slice(first, last + 1));
    }

    for (var i = 0; i < candidates.length; i += 1) {
      try {
        return JSON.parse(candidates[i]);
      } catch (error) {
        try {
          return JSON.parse(candidates[i].replace(/\u00a0/g, " "));
        } catch (ignored) {}
      }
    }

    return null;
  }

  function isPayloadCard(card) {
    var text = textOf(card);
    return text.indexOf("配置payload") >= 0 || text.indexOf("placement.preview_only") >= 0 || text.indexOf("company_robot_placement.preview_only") >= 0;
  }

  function findPayloadCards() {
    var all = Array.prototype.slice.call(document.querySelectorAll("section, article, div, form"));
    return all.filter(function (node) {
      if (!isPayloadCard(node)) return false;
      if (node.querySelector("." + BUTTON_CLASS)) return false;
      return true;
    });
  }

  function payloadIsSavable(payload) {
    if (!payload) return false;
    if (payload.save_blocked === true) return false;
    if (String(payload.strict_validation_status || "").indexOf("OK") !== 0) return false;
    if (!payload.company_id || !payload.placement_role_code || !payload.robot_pool_id) return false;
    if (!payload.model_code && !payload.aiworker_model_code) return false;
    if (String(payload.robot_selection_status || "").indexOf("BLOCKED") >= 0) return false;
    return true;
  }

  function setStatus(card, message, ok) {
    var status = card.querySelector("." + STATUS_CLASS);
    if (!status) {
      status = document.createElement("div");
      status.className = STATUS_CLASS;
      status.style.marginTop = "12px";
      status.style.padding = "10px";
      status.style.borderRadius = "12px";
      status.style.fontWeight = "700";
      card.appendChild(status);
    }
    status.textContent = message;
    status.style.background = ok ? "#e8fff1" : "#fff1f1";
    status.style.color = ok ? "#087443" : "#a51616";
  }

  function createSaveButton(card) {
    var payload = parseJsonFromCard(card);

    if (!payloadIsSavable(payload)) {
      return;
    }

    var button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.textContent = "DB本保存";
    button.style.marginTop = "12px";
    button.style.marginRight = "8px";
    button.style.padding = "10px 14px";
    button.style.borderRadius = "12px";
    button.style.border = "0";
    button.style.background = "#16803c";
    button.style.color = "#fff";
    button.style.fontWeight = "800";

    button.addEventListener("click", async function () {
      var freshPayload = parseJsonFromCard(card) || payload;
      var role = freshPayload.placement_role_code || freshPayload.role_code || "";
      var robot = freshPayload.robot_display_name || freshPayload.model_code || freshPayload.aiworker_model_code || "";
      var target = freshPayload.target_scope || freshPayload.target_level_code || "";

      if (!payloadIsSavable(freshPayload)) {
        setStatus(card, "保存不可: payload validation がOKではありません。", false);
        return;
      }

      var confirmed = window.confirm(
        "BusinessOS DBへ本保存します。\n\nrole: " +
          role +
          "\nrobot: " +
          robot +
          "\ntarget: " +
          target +
          "\n\n続行しますか？"
      );

      if (!confirmed) return;

      button.disabled = true;
      button.textContent = "保存中...";
      setStatus(card, "保存中: BusinessOS DBへ送信しています。", true);

      try {
        var response = await fetch(API_BASE + "/api/aicm/company-robot-placement/save", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            source: "AICompanyManager browser UI",
            rollback_only: false,
            payload: freshPayload
          })
        });

        var result = await response.json();

        if (!response.ok || !result.ok) {
          setStatus(card, "保存失敗: " + normalizeText(result.stderr || result.error || "unknown error"), false);
          button.disabled = false;
          button.textContent = "DB本保存";
          return;
        }

        setStatus(card, "保存OK: BusinessOS DB company_robot_placement に反映しました。画面を更新して確認してください。", true);
        button.textContent = "保存OK";
      } catch (error) {
        setStatus(card, "保存失敗: " + String(error && error.message ? error.message : error), false);
        button.disabled = false;
        button.textContent = "DB本保存";
      }
    });

    var note = document.createElement("p");
    note.textContent = "このボタンは BusinessOS DB の company_robot_placement へ保存します。数量消費なし。";
    note.style.fontSize = "13px";
    note.style.opacity = "0.75";

    card.appendChild(button);
    card.appendChild(note);
  }

  function enhance() {
    findPayloadCards().forEach(createSaveButton);
  }

  function start() {
    enhance();
    var observer = new MutationObserver(function () {
      window.clearTimeout(observer._timer);
      observer._timer = window.setTimeout(enhance, 150);
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.AICM_ROBOT_PLACEMENT_PERSISTENT_SAVE_CLIENT_STATUS = {
      marker: "AICM_ROBOT_PLACEMENT_PERSISTENT_SAVE_CLIENT_V1",
      api_base: API_BASE,
      loaded: true
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
