/* AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V2_CAPTURE */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8796";
  var STATUS_CLASS = "aicm-company-save-status-v2";
  var COMPANY_ID_STATUS_CLASS = "aicm-company-db-id-status-v2";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  function textOf(node) {
    if (!node) return "";
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") return String(node.value || "");
    return String(node.textContent || node.value || node.getAttribute("aria-label") || "");
  }

  function valueOf(node) {
    return node ? String(node.value || "") : "";
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function visibleText(node) {
    return normalizeText(textOf(node));
  }

  function cleanupGenericDbSaveButtons() {
    Array.prototype.slice.call(document.querySelectorAll("button,input,a,[role='button']")).forEach(function (el) {
      if (normalizeText(textOf(el)) === "DB本保存") {
        el.remove();
      }
    });
  }

  function clickableFromEvent(event) {
    var node = event.target;

    while (node && node !== document.body) {
      var tag = String(node.tagName || "").toLowerCase();
      var role = String(node.getAttribute ? node.getAttribute("role") || "" : "").toLowerCase();

      if (
        tag === "button" ||
        tag === "a" ||
        role === "button" ||
        (tag === "input" && ["button", "submit"].indexOf(String(node.type || "").toLowerCase()) >= 0)
      ) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  function areaTextAround(el) {
    var node = el;
    var texts = [];
    var guard = 0;

    while (node && node !== document.body && guard < 8) {
      texts.push(visibleText(node));
      node = node.parentElement;
      guard += 1;
    }

    return normalizeText(texts.join(" "));
  }

  function isCompanyArea(text) {
    return (
      text.indexOf("AI企業") >= 0 ||
      text.indexOf("会社") >= 0 ||
      text.indexOf("会社名") >= 0 ||
      text.indexOf("事業領域") >= 0 ||
      text.indexOf("会社 変更・削除") >= 0 ||
      text.indexOf("AI企業新規追加") >= 0
    );
  }

  function detectCompanyAction(el) {
    var label = visibleText(el);
    var area = areaTextAround(el);

    if (!label) return "";

    if (label.indexOf("会社を追加") >= 0 || label.indexOf("会社追加") >= 0 || label.indexOf("AI企業を追加") >= 0) {
      return "create";
    }

    if (label.indexOf("会社を変更") >= 0 || label.indexOf("会社変更") >= 0 || label.indexOf("AI企業を変更") >= 0) {
      return "update";
    }

    if ((label === "追加" || label.indexOf("追加") >= 0) && isCompanyArea(area)) {
      return "create";
    }

    if ((label === "変更" || label.indexOf("変更") >= 0) && isCompanyArea(area)) {
      return "update";
    }

    return "";
  }

  function nearestCompanyRoot(el) {
    var node = el;
    var best = null;
    var guard = 0;

    while (node && node !== document.body && guard < 14) {
      var text = visibleText(node);
      var hasCompany = isCompanyArea(text);
      var hasFields = text.indexOf("会社名") >= 0 || text.indexOf("事業領域") >= 0 || text.indexOf("会社を追加") >= 0 || text.indexOf("会社を変更") >= 0;

      if (hasCompany && hasFields) {
        best = node;
        break;
      }

      node = node.parentElement;
      guard += 1;
    }

    return best || el.parentElement || document.body;
  }

  function allInputs(root) {
    return Array.prototype.slice.call(root.querySelectorAll("input,textarea,select")).filter(function (el) {
      var tag = String(el.tagName || "").toLowerCase();
      var type = String(el.type || "").toLowerCase();

      if (tag === "select") return true;
      if (["button", "submit", "file", "hidden", "checkbox", "radio"].indexOf(type) >= 0) return false;
      return true;
    });
  }

  function labelTextForInput(input) {
    var id = String(input.id || "");
    var label;
    var text = "";

    if (id) {
      label = document.querySelector("label[for='" + id.replace(/'/g, "\\'") + "']");
      if (label) text += " " + visibleText(label);
    }

    if (input.parentElement) text += " " + visibleText(input.parentElement);
    text += " " + String(input.name || "");
    text += " " + String(input.id || "");
    text += " " + String(input.placeholder || "");
    text += " " + String(input.getAttribute("aria-label") || "");

    return normalizeText(text);
  }

  function fieldByKeywords(root, keywords) {
    var inputs = allInputs(root);
    var i;
    var j;

    for (i = 0; i < inputs.length; i += 1) {
      var label = labelTextForInput(inputs[i]);
      var value = normalizeText(valueOf(inputs[i]));

      if (!value) continue;

      for (j = 0; j < keywords.length; j += 1) {
        if (label.indexOf(keywords[j]) >= 0) {
          return inputs[i];
        }
      }
    }

    return null;
  }

  function inferCompanyName(root) {
    var field = fieldByKeywords(root, ["会社名", "AI企業名", "company_name", "companyName", "name"]);
    var inputs;
    var i;

    if (field && normalizeText(valueOf(field))) {
      return normalizeText(valueOf(field));
    }

    inputs = allInputs(root);

    for (i = 0; i < inputs.length; i += 1) {
      var value = normalizeText(valueOf(inputs[i]));
      var label = labelTextForInput(inputs[i]);

      if (!value) continue;
      if (UUID_RE.test(value)) continue;
      if (value.indexOf("候補") >= 0) continue;
      if (value.length > 120) continue;
      if (label.indexOf("事業") >= 0 || label.indexOf("方針") >= 0 || label.indexOf("ルール") >= 0) continue;

      return value;
    }

    return "";
  }

  function inferBusinessDomain(root, companyName) {
    var field = fieldByKeywords(root, ["事業領域", "事業内容", "business_domain", "businessDomain", "business_area", "description"]);
    var inputs;
    var i;

    if (field && normalizeText(valueOf(field))) {
      return normalizeText(valueOf(field));
    }

    inputs = allInputs(root);

    for (i = 0; i < inputs.length; i += 1) {
      var value = normalizeText(valueOf(inputs[i]));
      if (!value) continue;
      if (value === companyName) continue;
      if (UUID_RE.test(value)) continue;
      if (value.indexOf("候補") >= 0) continue;
      return value;
    }

    return "";
  }

  function inferCompanyId(root) {
    var rootMatch = visibleText(root).match(UUID_RE);
    var bodyMatch;

    if (rootMatch) return rootMatch[0];

    bodyMatch = visibleText(document.body).match(UUID_RE);
    return bodyMatch ? bodyMatch[0] : "";
  }

  function buildPayload(el, action) {
    var root = nearestCompanyRoot(el);
    var companyName = inferCompanyName(root);
    var businessDomain = inferBusinessDomain(root, companyName);
    var companyId = action === "update" ? inferCompanyId(root) : "";

    if (!companyName) {
      return {
        ok: false,
        reason: "company_name_required",
        root: root
      };
    }

    return {
      ok: true,
      root: root,
      payload: {
        source: "AICompanyManager company UI capture client",
        operation: action === "create" ? "company.create_or_save" : "company.update_or_save",
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

  function createStatus(el) {
    var parent = el.parentElement || document.body;
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

  function setStatus(el, message, ok) {
    var status = createStatus(el);

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
    document.documentElement.setAttribute("data-aicm-current-company-id", companyId);
  }

  function extractCompanyId(stdout) {
    var match = String(stdout || "").match(/"company_id"\s*:\s*"([0-9a-f-]{36})"/i);
    return match ? match[1] : "";
  }

  function extractCompanyTable(stdout) {
    var match = String(stdout || "").match(/"company_table"\s*:\s*"([^"]+)"/i);
    return match ? match[1] : "";
  }

  function originalText(el) {
    return el.getAttribute("data-aicm-original-text") || visibleText(el) || "保存";
  }

  function setBusy(el, busy) {
    if (busy) {
      el.setAttribute("data-aicm-original-text", originalText(el));
      if ("disabled" in el) el.disabled = true;
      if (el.tagName === "INPUT") el.value = "保存中...";
      else el.textContent = "保存中...";
    } else {
      if ("disabled" in el) el.disabled = false;
      if (el.tagName === "INPUT") el.value = originalText(el);
      else el.textContent = originalText(el);
    }
  }

  async function saveCompany(el, action) {
    var built = buildPayload(el, action);
    var response;
    var result;
    var companyId;
    var companyTable;

    cleanupGenericDbSaveButtons();

    if (!built.ok) {
      setStatus(el, "会社保存不可: 会社名を入力してください。", false);
      window.alert("会社名を入力してください。");
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

    setBusy(el, true);
    setStatus(el, "保存中: BusinessOS DBへ会社を保存しています。", true);

    try {
      response = await fetch(API_BASE + "/api/aicm/company/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "AICompanyManager company browser UI capture",
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

      setStatus(el, "保存OK: 会社をBusinessOS DBへ保存しました。company_idを確定しました。", true);

      if (companyId) {
        displayCompanyId(built.root, companyId, companyTable);
      }

      window.setTimeout(function () {
        var base = window.location.href.split("#")[0].split("?")[0];
        window.location.href = base + "?v=" + Date.now();
      }, 900);
    } catch (error) {
      setStatus(el, "保存失敗: " + String(error && error.message ? error.message : error), false);
    } finally {
      setBusy(el, false);
    }
  }

  function captureClick(event) {
    var clickable = clickableFromEvent(event);
    var action;

    if (!clickable) return;

    action = detectCompanyAction(clickable);
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    saveCompany(clickable, action);
  }

  function addDebugBadge() {
    var id = "aicm-company-save-client-debug-badge";
    var old = document.getElementById(id);
    var badge;

    if (old) return;

    badge = document.createElement("div");
    badge.id = id;
    badge.textContent = "company save client: ON";
    badge.style.position = "fixed";
    badge.style.right = "8px";
    badge.style.bottom = "8px";
    badge.style.zIndex = "99999";
    badge.style.fontSize = "11px";
    badge.style.padding = "6px 8px";
    badge.style.borderRadius = "999px";
    badge.style.background = "#eef6ff";
    badge.style.color = "#15466f";
    badge.style.fontWeight = "800";
    document.body.appendChild(badge);
  }

  function start() {
    cleanupGenericDbSaveButtons();
    document.addEventListener("click", captureClick, true);

    window.AICM_COMPANY_PERSISTENT_SAVE_CLIENT_STATUS = {
      marker: "AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V2_CAPTURE",
      api_base: API_BASE,
      loaded: true,
      capture_click: true
    };

    addDebugBadge();

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        cleanupGenericDbSaveButtons();
        addDebugBadge();
      }, 250);
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
