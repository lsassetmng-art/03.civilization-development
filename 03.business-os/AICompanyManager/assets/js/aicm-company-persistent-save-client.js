/* AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V1 */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8796";
  var BOUND_ATTR = "data-aicm-company-save-bound-v1";
  var STATUS_CLASS = "aicm-company-save-status-v1";
  var COMPANY_ID_STATUS_CLASS = "aicm-company-db-id-status-v1";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  function textOf(node) {
    return node ? String(node.textContent || "") : "";
  }

  function valueOf(node) {
    return node ? String(node.value || "") : "";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isCompanyButton(button) {
    var label = normalizeText(button.textContent);
    return label === "会社を追加" || label === "会社を変更";
  }

  function cleanupGenericDbSaveButtons() {
    Array.prototype.slice.call(document.querySelectorAll("button")).forEach(function (button) {
      if (normalizeText(button.textContent) === "DB本保存") {
        button.remove();
      }
    });
  }

  function nearestCompanyRoot(button) {
    var node = button;
    var best = null;
    var guard = 0;

    while (node && node !== document.body && guard < 14) {
      var text = textOf(node);
      if (
        (text.indexOf("会社名") >= 0 || text.indexOf("AI企業") >= 0 || text.indexOf("会社 変更・削除") >= 0) &&
        (text.indexOf("会社を追加") >= 0 || text.indexOf("会社を変更") >= 0)
      ) {
        best = node;
        break;
      }
      node = node.parentElement;
      guard += 1;
    }

    return best || button.parentElement || document.body;
  }

  function collectTextInputs(root) {
    return Array.prototype.slice.call(root.querySelectorAll("input, textarea")).filter(function (input) {
      var type = String(input.type || "text").toLowerCase();
      var value = valueOf(input);

      if (type === "file" || type === "button" || type === "submit" || type === "hidden") return false;
      if (!value) return false;
      return true;
    });
  }

  function inferCompanyName(root) {
    var inputs = collectTextInputs(root);
    var i;

    for (i = 0; i < inputs.length; i += 1) {
      var value = normalizeText(valueOf(inputs[i]));
      if (!value) continue;
      if (UUID_RE.test(value)) continue;
      if (value.indexOf("候補") >= 0) continue;
      if (value.length > 100) continue;
      return value;
    }

    return "";
  }

  function inferBusinessDomain(root, companyName) {
    var inputs = collectTextInputs(root);
    var values = [];
    var i;

    for (i = 0; i < inputs.length; i += 1) {
      var value = normalizeText(valueOf(inputs[i]));
      if (!value) continue;
      if (value === companyName) continue;
      if (UUID_RE.test(value)) continue;
      if (value.indexOf("候補") >= 0) continue;
      values.push(value);
    }

    return values[0] || "";
  }

  function inferCompanyId(root) {
    var text = textOf(root);
    var match = text.match(UUID_RE);
    if (match) return match[0];

    match = textOf(document.body).match(UUID_RE);
    return match ? match[0] : "";
  }

  function buildPayload(button) {
    var root = nearestCompanyRoot(button);
    var companyName = inferCompanyName(root);
    var businessDomain = inferBusinessDomain(root, companyName);
    var companyId = inferCompanyId(root);
    var label = normalizeText(button.textContent);

    if (!companyName) {
      return {
        ok: false,
        reason: "company_name_required"
      };
    }

    return {
      ok: true,
      root: root,
      payload: {
        source: "AICompanyManager company UI",
        operation: label === "会社を追加" ? "company.create_or_save" : "company.update_or_save",
        save_status: "COMPANY_SAVE_REQUESTED",
        company_id_input: companyId,
        company_id: companyId,
        company_name: companyName,
        business_domain: businessDomain,
        db_write: true,
        api_write: true
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

  function displayCompanyId(root, companyId, tableName) {
    var status = root.querySelector(":scope > ." + COMPANY_ID_STATUS_CLASS);

    if (!status) {
      status = document.createElement("div");
      status.className = COMPANY_ID_STATUS_CLASS;
      status.style.marginTop = "12px";
      status.style.padding = "10px";
      status.style.borderRadius = "12px";
      status.style.background = "#eef6ff";
      status.style.color = "#15466f";
      status.style.fontWeight = "800";
      status.style.lineHeight = "1.5";
      root.appendChild(status);
    }

    status.textContent = "BusinessOS DB会社ID: " + companyId + (tableName ? " / table: " + tableName : "");
    root.setAttribute("data-aicm-db-company-id", companyId);
  }

  function extractCompanyId(stdout) {
    var match = String(stdout || "").match(/"company_id"\s*:\s*"([0-9a-f-]{36})"/i);
    return match ? match[1] : "";
  }

  function extractCompanyTable(stdout) {
    var match = String(stdout || "").match(/"company_table"\s*:\s*"([^"]+)"/i);
    return match ? match[1] : "";
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

  async function saveCompany(button) {
    var built = buildPayload(button);
    var response;
    var result;
    var companyId;
    var companyTable;

    cleanupGenericDbSaveButtons();

    if (!built.ok) {
      setStatus(button, "会社保存不可: " + built.reason, false);
      return;
    }

    if (
      !window.confirm(
        "会社をBusinessOS DBへ保存します。\n\n会社名: " +
          built.payload.company_name +
          "\n事業領域: " +
          (built.payload.business_domain || "-") +
          "\n\n続行しますか？"
      )
    ) {
      return;
    }

    setButtonBusy(button, true);
    setStatus(button, "保存中: BusinessOS DBへ会社を保存しています。", true);

    try {
      response = await fetch(API_BASE + "/api/aicm/company/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "AICompanyManager company browser UI",
          rollback_only: false,
          payload: built.payload
        })
      });

      result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(normalizeText(result.stderr || result.error || "unknown company save error"));
      }

      companyId = extractCompanyId(result.stdout);
      companyTable = extractCompanyTable(result.stdout);

      setStatus(button, "保存OK: 会社をBusinessOS DBへ保存しました。company_idを確定しました。", true);

      if (companyId) {
        displayCompanyId(built.root, companyId, companyTable);
      }

      window.setTimeout(function () {
        var base = window.location.href.split("#")[0].split("?")[0];
        window.location.href = base + "?v=" + Date.now();
      }, 900);
    } catch (error) {
      setStatus(button, "保存失敗: " + String(error && error.message ? error.message : error), false);
    } finally {
      setButtonBusy(button, false);
    }
  }

  function bindButton(button) {
    if (!isCompanyButton(button)) return;
    if (button.getAttribute(BOUND_ATTR) === "1") return;

    button.setAttribute(BOUND_ATTR, "1");
    button.addEventListener("click", function () {
      window.setTimeout(function () {
        saveCompany(button);
      }, 200);
    });
  }

  function enhance() {
    cleanupGenericDbSaveButtons();

    Array.prototype.slice.call(document.querySelectorAll("button")).forEach(function (button) {
      bindButton(button);
    });

    window.AICM_COMPANY_PERSISTENT_SAVE_CLIENT_STATUS = {
      marker: "AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V1",
      api_base: API_BASE,
      loaded: true,
      bound_company_button_count: document.querySelectorAll("button[" + BOUND_ATTR + "='1']").length
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
