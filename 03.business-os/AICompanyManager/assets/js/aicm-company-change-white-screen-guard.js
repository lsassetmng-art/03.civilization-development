/* AICM_COMPANY_CHANGE_WHITE_SCREEN_GUARD_V1 */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8796";
  var SAVED_KEY = "aicm.savedCompanies.v1";
  var CURRENT_KEY = "aicm.currentCompany.v1";
  var STATUS_CLASS = "aicm-company-change-guard-status-v1";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  var busy = false;
  var lastActionAt = 0;

  window.AICM_COMPANY_CHANGE_WHITE_SCREEN_GUARD_ACTIVE = true;

  function norm(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function compact(value) {
    return norm(value).replace(/\s+/g, "");
  }

  function nodeText(node) {
    if (!node) return "";
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT") {
      return norm(node.value || node.textContent || "");
    }
    return norm(node.textContent || node.value || node.getAttribute && node.getAttribute("aria-label") || "");
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* ignore */
    }
  }

  function savedCompanies() {
    var rows = readJson(SAVED_KEY, []);
    return Array.isArray(rows) ? rows : [];
  }

  function saveCompanies(rows) {
    writeJson(SAVED_KEY, rows.slice(0, 120));
  }

  function currentCompany() {
    var c = readJson(CURRENT_KEY, null);
    return c && c.company_name ? c : null;
  }

  function writeCurrent(company) {
    if (!company || !company.company_name) return;

    writeJson(CURRENT_KEY, company);

    var rows = savedCompanies().filter(function (row) {
      return row.company_id !== company.company_id && row.company_name !== company.company_name;
    });

    rows.unshift(company);
    saveCompanies(rows);
  }

  function optionIsBogus(option) {
    var label = compact(option.textContent || "");
    var value = compact(option.value || "");

    return (
      label === "company/会社" ||
      label === "company" ||
      label === "会社" ||
      value === "company" ||
      value === "会社"
    );
  }

  function removeBogusOptions() {
    Array.prototype.slice.call(document.querySelectorAll("select")).forEach(function (select) {
      Array.prototype.slice.call(select.options || []).forEach(function (option) {
        if (optionIsBogus(option)) option.remove();
      });
    });
  }

  function blockTextAround(node, depth) {
    var cur = node;
    var out = "";
    var i = 0;

    while (cur && cur !== document.body && i < depth) {
      out += " " + nodeText(cur);
      cur = cur.parentElement;
      i += 1;
    }

    return norm(out);
  }

  function selectLooksCompany(select) {
    var around = blockTextAround(select, 8);
    return (
      around.indexOf("AI企業選択") >= 0 ||
      around.indexOf("AI企業") >= 0 ||
      around.indexOf("会社選択") >= 0
    );
  }

  function topCompanySelect() {
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));
    var i;

    for (i = 0; i < selects.length; i += 1) {
      if (selectLooksCompany(selects[i])) return selects[i];
    }

    return null;
  }

  function selectedCompanyFromTop() {
    var select = topCompanySelect();
    var option;
    var value;
    var label;
    var found;

    if (!select || select.selectedIndex < 0) return currentCompany();

    option = select.options[select.selectedIndex];
    if (!option || optionIsBogus(option)) return currentCompany();

    value = norm(option.value || "");
    label = norm(option.textContent || "");

    found = savedCompanies().find(function (row) {
      return row.company_id === value || row.company_name === label;
    });

    if (found) return found;

    if (!label || label === "選択してください" || label.indexOf("候補") >= 0) return currentCompany();

    return {
      company_id: UUID_RE.test(value) ? value : "",
      company_name: label,
      business_domain: ""
    };
  }

  function companyEditBlock() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("section,article,div,form"));
    var candidates = [];

    blocks.forEach(function (block) {
      var t = nodeText(block);
      if (
        t.indexOf("会社 変更・削除") >= 0 ||
        (t.indexOf("会社を変更") >= 0 && t.indexOf("会社を削除") >= 0 && t.indexOf("会社名") >= 0)
      ) {
        candidates.push(block);
      }
    });

    candidates.sort(function (a, b) {
      return nodeText(a).length - nodeText(b).length;
    });

    return candidates[0] || null;
  }

  function editInputs() {
    var block = companyEditBlock();
    if (!block) return [];

    return Array.prototype.slice.call(block.querySelectorAll("input,textarea")).filter(function (input) {
      var type = String(input.type || "text").toLowerCase();
      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
      return true;
    });
  }

  function editValues() {
    var base = selectedCompanyFromTop() || currentCompany() || {};
    var inputs = editInputs();
    var companyName = inputs[0] ? norm(inputs[0].value || "") : (base.company_name || "");
    var businessDomain = inputs[1] ? norm(inputs[1].value || "") : (base.business_domain || "");

    return {
      company_id: base.company_id || "",
      company_name: companyName,
      business_domain: businessDomain
    };
  }

  function nearestActionElement(start) {
    var node = start;
    var guard = 0;

    while (node && node !== document.body && guard < 10) {
      var t = nodeText(node);
      var c = compact(t);
      var tag = String(node.tagName || "").toLowerCase();
      var role = String(node.getAttribute ? node.getAttribute("role") || "" : "").toLowerCase();

      if (
        c.indexOf("会社を変更") >= 0 ||
        c.indexOf("会社を削除") >= 0
      ) {
        if (
          tag === "button" ||
          tag === "a" ||
          tag === "input" ||
          role === "button" ||
          t.length < 80
        ) {
          return node;
        }
      }

      node = node.parentElement;
      guard += 1;
    }

    return null;
  }

  function actionOfElement(el) {
    var c = compact(nodeText(el));
    if (c.indexOf("会社を変更") >= 0) return "change";
    if (c.indexOf("会社を削除") >= 0) return "delete";
    return "";
  }

  function hardStop(event) {
    if (!event) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }

  function setStatus(message, ok) {
    var block = companyEditBlock() || document.body;
    var status = block.querySelector(":scope > ." + STATUS_CLASS);

    if (!status) {
      status = document.createElement("div");
      status.className = STATUS_CLASS;
      status.style.marginTop = "12px";
      status.style.padding = "12px";
      status.style.borderRadius = "14px";
      status.style.fontWeight = "900";
      status.style.lineHeight = "1.6";
      block.appendChild(status);
    }

    status.textContent = message;
    status.style.background = ok ? "#e8fff1" : "#fff1f1";
    status.style.color = ok ? "#087443" : "#a51616";
  }

  function extractCompanyId(stdout) {
    var match = String(stdout || "").match(/"company_id"\s*:\s*"([0-9a-f-]{36})"/i);
    return match ? match[1] : "";
  }

  function extractCompanyTable(stdout) {
    var match = String(stdout || "").match(/"company_table"\s*:\s*"([^"]+)"/i);
    return match ? match[1] : "";
  }

  function updateTopSelect(company) {
    var select = topCompanySelect();
    var matched = false;

    if (!select || !company || !company.company_name) return;

    removeBogusOptions();

    Array.prototype.slice.call(select.options || []).forEach(function (option) {
      if (
        option.value === company.company_id ||
        norm(option.textContent || "") === company.company_name
      ) {
        select.value = option.value;
        option.selected = true;
        matched = true;
      }
    });

    if (!matched) {
      var option = document.createElement("option");
      option.value = company.company_id || company.company_name;
      option.textContent = company.company_name;
      option.setAttribute("data-aicm-saved-company", "1");
      select.appendChild(option);
      select.value = option.value;
      option.selected = true;
    }
  }

  function hideCompanyDebugCards() {
    Array.prototype.slice.call(document.querySelectorAll("section,article,div")).forEach(function (node) {
      var t = nodeText(node);

      if (
        t.indexOf("BusinessOS DB会社バインド") >= 0 ||
        t.indexOf("BusinessOS DB会社ID") >= 0 ||
        (t.indexOf("table:") >= 0 && t.indexOf("ai_company_manager_company") >= 0)
      ) {
        node.style.display = "none";
        node.setAttribute("data-aicm-hidden-company-debug-by-guard", "1");
      }
    });

    var badge = document.getElementById("aicm-company-save-client-debug-badge");
    if (badge) badge.style.display = "none";
  }

  function disableNativeCompanyForms() {
    var block = companyEditBlock();
    if (!block) return;

    Array.prototype.slice.call(block.querySelectorAll("form")).forEach(function (form) {
      form.setAttribute("action", "javascript:void(0)");
      form.setAttribute("data-aicm-native-submit-blocked", "1");
      form.onsubmit = function (event) {
        hardStop(event);
        return false;
      };
    });

    Array.prototype.slice.call(block.querySelectorAll("button,input[type='submit'],input[type='button'],a,[role='button']")).forEach(function (el) {
      var label = nodeText(el);
      if (label.indexOf("会社を変更") >= 0 || label.indexOf("会社を削除") >= 0) {
        try { el.type = "button"; } catch (error) { /* ignore */ }
        if (el.tagName === "A") {
          el.setAttribute("href", "javascript:void(0)");
        }
        el.setAttribute("data-aicm-company-action-guarded", "1");
      }
    });
  }

  async function runCompanyChange() {
    var now = Date.now();
    var values;
    var response;
    var result;
    var companyId;
    var tableName;

    if (busy || now - lastActionAt < 1000) return;
    busy = true;
    lastActionAt = now;

    values = editValues();

    if (!values.company_name) {
      setStatus("会社変更不可: 会社名を入力してください。", false);
      window.alert("会社名を入力してください。");
      busy = false;
      return;
    }

    if (!values.company_id) {
      setStatus("会社変更不可: company_id が未確定です。AI企業選択で対象会社を選び直してください。", false);
      window.alert("company_id が未確定です。AI企業選択で対象会社を選び直してください。");
      busy = false;
      return;
    }

    if (
      !window.confirm(
        "会社をBusinessOS DBへ変更保存します。\n\n会社名: " +
          values.company_name +
          "\n事業領域: " +
          (values.business_domain || "-") +
          "\n\n続行しますか？"
      )
    ) {
      busy = false;
      return;
    }

    setStatus("保存中: 会社変更をBusinessOS DBへ反映しています。", true);

    try {
      response = await fetch(API_BASE + "/api/aicm/company/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "AICompanyManager company change white screen guard",
          rollback_only: false,
          payload: {
            source: "AICompanyManager company change white screen guard",
            operation: "company.update_or_save",
            save_status: "COMPANY_UPDATE_REQUESTED",
            company_id_input: values.company_id,
            company_id: values.company_id,
            company_name: values.company_name,
            business_domain: values.business_domain,
            db_write: true,
            api_write: true
          }
        })
      });

      result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(String(result.stderr || result.error || "unknown company update error").replace(/\s+/g, " ").trim());
      }

      companyId = extractCompanyId(result.stdout) || values.company_id;
      tableName = extractCompanyTable(result.stdout) || "";

      var company = {
        company_id: companyId,
        company_name: values.company_name,
        business_domain: values.business_domain,
        company_table: tableName
      };

      writeCurrent(company);
      updateTopSelect(company);
      hideCompanyDebugCards();

      setStatus("保存OK: 会社変更をBusinessOS DBへ反映しました。", true);
    } catch (error) {
      setStatus("保存失敗: " + String(error && error.message ? error.message : error), false);
    } finally {
      busy = false;
    }
  }

  function runDeleteSafety() {
    setStatus("会社削除は安全停止中です。次工程で soft delete / inactive 化として実装します。", false);
    window.alert("会社削除はまだ実行しません。次工程で soft delete として実装します。");
  }

  function interceptAction(event) {
    var el = nearestActionElement(event.target);
    var action;

    if (!el) return;

    action = actionOfElement(el);
    if (!action) return;

    hardStop(event);

    if (event.type === "pointerdown" || event.type === "touchstart" || event.type === "mousedown") {
      return;
    }

    if (action === "change") {
      runCompanyChange();
    } else if (action === "delete") {
      runDeleteSafety();
    }
  }

  function interceptSubmit(event) {
    var block = companyEditBlock();
    if (!block) return;

    if (block.contains(event.target)) {
      hardStop(event);
    }
  }

  function installEarlyGuards() {
    ["pointerdown", "touchstart", "mousedown", "pointerup", "touchend", "mouseup", "click"].forEach(function (name) {
      document.addEventListener(name, interceptAction, true);
    });

    document.addEventListener("submit", interceptSubmit, true);
  }

  function maintenance() {
    removeBogusOptions();
    disableNativeCompanyForms();
    hideCompanyDebugCards();

    window.AICM_COMPANY_CHANGE_WHITE_SCREEN_GUARD_STATUS = {
      marker: "AICM_COMPANY_CHANGE_WHITE_SCREEN_GUARD_V1",
      early_capture_guard: true,
      native_submit_blocked: true,
      bogus_company_option_removed: true,
      delete_safety_blocked: true
    };
  }

  installEarlyGuards();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maintenance);
  } else {
    maintenance();
  }

  var timer = null;
  var observer = new MutationObserver(function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(maintenance, 200);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
