/* AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V6_FIELD_DEDUP_LIST_SYNC */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8796";
  var STATUS_CLASS = "aicm-company-save-status-v6";
  var COMPANY_ID_STATUS_CLASS = "aicm-company-db-id-status-v6";
  var BADGE_ID = "aicm-company-save-client-debug-badge";
  var STORAGE_KEY = "aicm.savedCompanies.v1";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  var intentLocked = false;
  var intentUnlockTimer = null;
  var lastDebug = "ON";

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

  function compactText(value) {
    return normalizeText(value).replace(/\s+/g, "");
  }

  function visibleText(node) {
    return normalizeText(textOf(node));
  }

  function tagName(node) {
    return String(node && node.tagName ? node.tagName : "").toLowerCase();
  }

  function cleanupGenericDbSaveButtons() {
    Array.prototype.slice.call(document.querySelectorAll("button,input,a,[role='button']")).forEach(function (el) {
      if (normalizeText(textOf(el)) === "DB本保存") {
        el.remove();
      }
    });
  }

  function nearestClickable(start) {
    var node = start;
    var guard = 0;

    while (node && node !== document.body && guard < 8) {
      var tag = tagName(node);
      var role = String(node.getAttribute ? node.getAttribute("role") || "" : "").toLowerCase();
      var onclick = node.getAttribute ? node.getAttribute("onclick") : "";
      var text = visibleText(node);

      if (
        tag === "button" ||
        tag === "a" ||
        role === "button" ||
        onclick ||
        (tag === "input" && ["button", "submit"].indexOf(String(node.type || "").toLowerCase()) >= 0)
      ) {
        return node;
      }

      if (text && text.length <= 40 && guard <= 3) {
        var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
        if (style && style.cursor === "pointer") return node;
      }

      node = node.parentElement;
      guard += 1;
    }

    return start && start.nodeType === 1 ? start : null;
  }

  function editableCompanyInputs(root) {
    return Array.prototype.slice.call(root.querySelectorAll("input,textarea")).filter(function (el) {
      var tag = tagName(el);
      var type = String(el.type || "text").toLowerCase();

      if (tag === "textarea") return true;
      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
      return true;
    });
  }

  function labelTextForInput(input) {
    var id = String(input.id || "");
    var text = "";
    var label;
    var prev;
    var parent;
    var guard;

    if (id) {
      try {
        label = document.querySelector("label[for=\"" + id.replace(/"/g, "\\\"") + "\"]");
        if (label) text += " " + visibleText(label);
      } catch (error) {
        /* ignore */
      }
    }

    if (input.closest) {
      label = input.closest("label");
      if (label) text += " " + visibleText(label);
    }

    prev = input.previousElementSibling;
    guard = 0;
    while (prev && guard < 3) {
      text += " " + visibleText(prev);
      prev = prev.previousElementSibling;
      guard += 1;
    }

    parent = input.parentElement;
    if (parent) {
      prev = parent.previousElementSibling;
      guard = 0;
      while (prev && guard < 3) {
        text += " " + visibleText(prev);
        prev = prev.previousElementSibling;
        guard += 1;
      }
    }

    text += " " + String(input.name || "");
    text += " " + String(input.id || "");
    text += " " + String(input.placeholder || "");
    text += " " + String(input.getAttribute("aria-label") || "");

    return normalizeText(text);
  }

  function isNonCompanyValue(value) {
    var v = normalizeText(value);
    if (!v) return true;
    if (UUID_RE.test(v)) return true;
    if (v.indexOf("候補") >= 0) return true;
    if (v.length > 160) return true;
    return false;
  }

  function companyInputValues(root) {
    var inputs = editableCompanyInputs(root);
    var rows = [];
    var i;

    for (i = 0; i < inputs.length; i += 1) {
      var value = normalizeText(valueOf(inputs[i]));
      var label = labelTextForInput(inputs[i]);

      if (isNonCompanyValue(value)) continue;

      rows.push({
        node: inputs[i],
        value: value,
        label: label
      });
    }

    return rows;
  }

  function findCompanyName(root) {
    var rows = companyInputValues(root);
    var i;

    for (i = 0; i < rows.length; i += 1) {
      var label = rows[i].label;
      if (
        (label.indexOf("会社名") >= 0 || label.indexOf("AI企業名") >= 0 || label.indexOf("company_name") >= 0 || label.indexOf("companyName") >= 0) &&
        label.indexOf("事業") < 0 &&
        label.indexOf("方針") < 0 &&
        label.indexOf("ルール") < 0
      ) {
        return rows[i].value;
      }
    }

    return rows[0] ? rows[0].value : "";
  }

  function findBusinessDomain(root, companyName) {
    var rows = companyInputValues(root);
    var i;

    for (i = 0; i < rows.length; i += 1) {
      var label = rows[i].label;
      if (
        label.indexOf("事業領域") >= 0 ||
        label.indexOf("事業内容") >= 0 ||
        label.indexOf("業務領域") >= 0 ||
        label.indexOf("business_domain") >= 0 ||
        label.indexOf("businessDomain") >= 0 ||
        label.indexOf("business_area") >= 0 ||
        label.indexOf("description") >= 0
      ) {
        return rows[i].value;
      }
    }

    /*
     * Strong fallback:
     * company form layout is company_name first, business_domain second.
     * This prevents business_domain from becoming company_name.
     */
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i].value !== companyName) {
        return rows[i].value;
      }
    }

    return rows[1] ? rows[1].value : "";
  }

  function rootHasCompanyFormSignal(root) {
    var text = visibleText(root);
    var rows = companyInputValues(root);

    if (text.indexOf("会社名") >= 0 && rows.length >= 1) return true;
    if (text.indexOf("AI企業名") >= 0 && rows.length >= 1) return true;
    if (text.indexOf("事業領域") >= 0 && rows.length >= 1) return true;
    if (rows.length >= 2) return true;

    return false;
  }

  function nearestCompanyFormRoot(start) {
    var node = start;
    var best = null;
    var guard = 0;

    while (node && node !== document.body && guard < 16) {
      if (node.querySelector && rootHasCompanyFormSignal(node)) {
        best = node;
        break;
      }

      node = node.parentElement;
      guard += 1;
    }

    if (best) return best;

    var blocks = Array.prototype.slice.call(document.querySelectorAll("form,section,article,div"));
    for (var i = 0; i < blocks.length; i += 1) {
      if (rootHasCompanyFormSignal(blocks[i])) return blocks[i];
    }

    return null;
  }

  function looksLikeNavigation(label) {
    var compact = compactText(label);

    if (!compact) return true;

    return (
      compact.indexOf("新規追加") >= 0 ||
      compact.indexOf("AI企業新規追加") >= 0 ||
      compact.indexOf("追加する会社") >= 0 ||
      compact.indexOf("AI企業を表示") >= 0 ||
      compact === "表示" ||
      compact.indexOf("読み込み") >= 0 ||
      compact.indexOf("読込") >= 0 ||
      compact.indexOf("戻る") >= 0 ||
      compact.indexOf("一覧") >= 0 ||
      compact.indexOf("選択") >= 0 ||
      compact.indexOf("削除") >= 0 ||
      compact.indexOf("ダッシュボード") >= 0 ||
      compact.indexOf("タスク台帳") >= 0 ||
      compact.indexOf("レビュー") >= 0
    );
  }

  function inferActionFromLabel(label, root) {
    var compact = compactText(label);
    var rootOk = !!root && rootHasCompanyFormSignal(root);

    if (looksLikeNavigation(label)) return "";

    if (
      compact === "会社を追加" ||
      compact === "会社追加" ||
      compact === "AI企業を追加" ||
      compact === "AI企業追加" ||
      compact === "この会社を追加"
    ) {
      return "create";
    }

    if (
      compact === "会社を変更" ||
      compact === "会社変更" ||
      compact === "AI企業を変更" ||
      compact === "AI企業変更" ||
      compact === "この会社を変更"
    ) {
      return "update";
    }

    if (rootOk && (compact === "追加" || compact === "登録" || compact === "保存" || compact === "作成")) {
      return "create";
    }

    if (rootOk && (compact === "変更" || compact === "更新" || compact === "保存変更")) {
      return "update";
    }

    return "";
  }

  function inferActionFromSubmit(event, formRoot) {
    var submitter = event.submitter || document.activeElement;
    var label = visibleText(submitter);
    var action = inferActionFromLabel(label, formRoot);

    if (action) return action;

    var text = visibleText(formRoot);
    if (text.indexOf("会社を変更") >= 0 || text.indexOf("変更対象") >= 0) return "update";
    return "create";
  }

  function inferCompanyId(root) {
    var rootMatch = visibleText(root).match(UUID_RE);
    var bodyMatch;

    if (rootMatch) return rootMatch[0];

    bodyMatch = visibleText(document.body).match(UUID_RE);
    return bodyMatch ? bodyMatch[0] : "";
  }

  function buildPayload(root, action) {
    var companyName = findCompanyName(root);
    var businessDomain = findBusinessDomain(root, companyName);
    var companyId = action === "update" ? inferCompanyId(root) : "";

    if (!companyName) {
      return {
        ok: false,
        reason: "company_name_required"
      };
    }

    return {
      ok: true,
      payload: {
        source: "AICompanyManager company UI v6 field dedup list sync",
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

  function createStatus(anchor) {
    var parent = anchor && anchor.parentElement ? anchor.parentElement : document.body;
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

  function setStatus(anchor, message, ok) {
    var status = createStatus(anchor);

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

  function readSavedCompanies() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeSavedCompanies(rows) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 50)));
    } catch (error) {
      /* ignore */
    }
  }

  function rememberSavedCompany(company) {
    if (!company || !company.company_id || !company.company_name) return;

    var rows = readSavedCompanies().filter(function (row) {
      return row.company_id !== company.company_id && row.company_name !== company.company_name;
    });

    rows.unshift({
      company_id: company.company_id,
      company_name: company.company_name,
      business_domain: company.business_domain || "",
      saved_at: new Date().toISOString()
    });

    writeSavedCompanies(rows);
  }

  function selectLooksLikeCompanySelector(select) {
    var text = "";
    var node = select;
    var guard = 0;

    while (node && node !== document.body && guard < 6) {
      text += " " + visibleText(node);
      node = node.parentElement;
      guard += 1;
    }

    return (
      text.indexOf("AI企業選択") >= 0 ||
      text.indexOf("変更対象") >= 0 ||
      text.indexOf("BusinessOS DB会社") >= 0 ||
      text.indexOf("会社選択") >= 0 ||
      text.indexOf("会社") >= 0
    );
  }

  function syncSavedCompaniesToSelects() {
    var rows = readSavedCompanies();
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));

    selects.forEach(function (select) {
      if (!selectLooksLikeCompanySelector(select)) return;

      rows.slice().reverse().forEach(function (company) {
        var exists = Array.prototype.slice.call(select.options).some(function (option) {
          return option.value === company.company_id || visibleText(option) === company.company_name;
        });

        if (exists) return;

        var option = document.createElement("option");
        option.value = company.company_id;
        option.textContent = company.company_name;
        option.setAttribute("data-aicm-local-saved-company", "1");
        select.appendChild(option);
      });
    });
  }

  function originalText(el) {
    return el.getAttribute("data-aicm-original-text") || visibleText(el) || "保存";
  }

  function setBusy(el, busy) {
    if (!el) return;

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

  function lockIntent() {
    intentLocked = true;
    window.clearTimeout(intentUnlockTimer);
    intentUnlockTimer = window.setTimeout(function () {
      intentLocked = false;
    }, 1600);
  }

  function unlockIntentLater() {
    window.clearTimeout(intentUnlockTimer);
    intentUnlockTimer = window.setTimeout(function () {
      intentLocked = false;
    }, 1200);
  }

  function updateBadge() {
    var badge = document.getElementById(BADGE_ID);

    if (!badge) {
      badge = document.createElement("div");
      badge.id = BADGE_ID;
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

    badge.textContent = "company save client v6: " + lastDebug;
  }

  async function runSave(anchor, root, action) {
    var built = buildPayload(root, action);
    var response;
    var result;
    var companyId;
    var companyTable;

    cleanupGenericDbSaveButtons();

    if (!built.ok) {
      setStatus(anchor, "会社保存不可: 会社名を入力してください。", false);
      window.alert("会社名を入力してください。");
      unlockIntentLater();
      return;
    }

    lockIntent();

    if (
      !window.confirm(
        "会社をBusinessOS DBへ保存します。\n\n会社名: " +
          built.payload.company_name +
          "\n事業領域: " +
          (built.payload.business_domain || "-") +
          "\n\n続行しますか？"
      )
    ) {
      lastDebug = "cancelled";
      updateBadge();
      unlockIntentLater();
      return;
    }

    setBusy(anchor, true);
    setStatus(anchor, "保存中: BusinessOS DBへ会社を保存しています。", true);

    try {
      response = await fetch(API_BASE + "/api/aicm/company/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "AICompanyManager company browser UI v6",
          rollback_only: false,
          payload: built.payload
        })
      });

      result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(String(result.stderr || result.error || "unknown company save error").replace(/\s+/g, " ").trim());
      }

      companyId = extractCompanyId(result.stdout);
      companyTable = extractCompanyTable(result.stdout);

      setStatus(anchor, "保存OK: 会社をBusinessOS DBへ保存しました。変更対象にも反映しました。", true);

      if (companyId) {
        displayCompanyId(root, companyId, companyTable);
        rememberSavedCompany({
          company_id: companyId,
          company_name: built.payload.company_name,
          business_domain: built.payload.business_domain
        });
        syncSavedCompaniesToSelects();
      }

      lastDebug = "saved " + built.payload.company_name;
      updateBadge();
    } catch (error) {
      setStatus(anchor, "保存失敗: " + String(error && error.message ? error.message : error), false);
      lastDebug = "save failed";
      updateBadge();
    } finally {
      setBusy(anchor, false);
      unlockIntentLater();
    }
  }

  function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  function handleIntent(eventName, event, anchor, root, action) {
    if (intentLocked) {
      stopEvent(event);
      lastDebug = eventName + " duplicate ignored";
      updateBadge();
      return;
    }

    stopEvent(event);

    lastDebug = eventName + " / " + action;
    updateBadge();

    lockIntent();
    runSave(anchor, root, action);
  }

  function capturePointerLike(eventName, event) {
    var anchor = nearestClickable(event.target);
    var root;
    var action;
    var label;

    if (!anchor) return;

    label = visibleText(anchor);

    if (looksLikeNavigation(label)) {
      lastDebug = eventName + " nav ignored: " + label.slice(0, 14);
      updateBadge();
      return;
    }

    root = nearestCompanyFormRoot(anchor);
    if (!root) {
      lastDebug = eventName + " no company form: " + label.slice(0, 14);
      updateBadge();
      return;
    }

    action = inferActionFromLabel(label, root);
    if (!action) {
      lastDebug = eventName + " no action: " + label.slice(0, 14);
      updateBadge();
      return;
    }

    handleIntent(eventName, event, anchor, root, action);
  }

  function captureSubmit(event) {
    var formRoot = event.target;
    var root = nearestCompanyFormRoot(formRoot);
    var anchor = event.submitter || document.activeElement || formRoot;
    var action;

    if (!root) {
      lastDebug = "submit no company form";
      updateBadge();
      return;
    }

    action = inferActionFromSubmit(event, root);
    if (!action) {
      lastDebug = "submit no action";
      updateBadge();
      return;
    }

    handleIntent("submit", event, anchor, root, action);
  }

  function start() {
    cleanupGenericDbSaveButtons();
    syncSavedCompaniesToSelects();

    document.addEventListener("click", function (event) {
      capturePointerLike("click", event);
    }, true);

    document.addEventListener("pointerup", function (event) {
      capturePointerLike("pointerup", event);
    }, true);

    document.addEventListener("touchend", function (event) {
      capturePointerLike("touchend", event);
    }, true);

    document.addEventListener("submit", captureSubmit, true);

    window.AICM_COMPANY_PERSISTENT_SAVE_CLIENT_STATUS = {
      marker: "AICM_COMPANY_PERSISTENT_SAVE_CLIENT_V6_FIELD_DEDUP_LIST_SYNC",
      api_base: API_BASE,
      loaded: true,
      field_mapping: "company_name_first_business_domain_second",
      duplicate_confirm_lock: true,
      saved_company_selector_sync: true
    };

    lastDebug = "ON";
    updateBadge();

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        cleanupGenericDbSaveButtons();
        syncSavedCompaniesToSelects();
        updateBadge();
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
