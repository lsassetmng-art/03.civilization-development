/* AICM_COMPANY_EDIT_ACTION_STABLE_UI_V1 */
(function () {
  "use strict";

  var API_BASE = "http://127.0.0.1:8796";
  var SAVED_KEY = "aicm.savedCompanies.v1";
  var CURRENT_KEY = "aicm.currentCompany.v1";
  var STATUS_CLASS = "aicm-company-edit-action-status-v1";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  var saveBusy = false;

  function norm(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function compact(value) {
    return norm(value).replace(/\s+/g, "");
  }

  function text(node) {
    if (!node) return "";
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT") return norm(node.value || "");
    return norm(node.textContent || node.value || "");
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
    writeJson(SAVED_KEY, rows.slice(0, 100));
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

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function removeBogusCompanyOptions() {
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
      out += " " + text(cur);
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

  function companyFromSelectedTop() {
    var select = topCompanySelect();
    var opt;
    var value;
    var label;
    var found;

    if (!select || select.selectedIndex < 0) return currentCompany();

    opt = select.options[select.selectedIndex];
    if (!opt || optionIsBogus(opt)) return currentCompany();

    value = norm(opt.value || "");
    label = norm(opt.textContent || "");

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
    var blocks = Array.prototype.slice.call(document.querySelectorAll("section,article,div"));
    var candidates = [];

    blocks.forEach(function (block) {
      var t = text(block);
      if (
        t.indexOf("会社 変更・削除") >= 0 ||
        (t.indexOf("会社を変更") >= 0 && t.indexOf("会社を削除") >= 0 && t.indexOf("会社名") >= 0)
      ) {
        candidates.push(block);
      }
    });

    candidates.sort(function (a, b) {
      return text(a).length - text(b).length;
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

  function currentEditValues() {
    var inputs = editInputs();
    var base = companyFromSelectedTop() || currentCompany() || {};

    return {
      company_id: base.company_id || "",
      company_name: inputs[0] ? norm(inputs[0].value || "") : (base.company_name || ""),
      business_domain: inputs[1] ? norm(inputs[1].value || "") : (base.business_domain || "")
    };
  }

  function extractCompanyId(stdout) {
    var match = String(stdout || "").match(/"company_id"\s*:\s*"([0-9a-f-]{36})"/i);
    return match ? match[1] : "";
  }

  function extractCompanyTable(stdout) {
    var match = String(stdout || "").match(/"company_table"\s*:\s*"([^"]+)"/i);
    return match ? match[1] : "";
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

  function updateTopSelect(company) {
    var select = topCompanySelect();
    var matched = false;

    if (!select || !company || !company.company_name) return;

    removeBogusCompanyOptions();

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

  function hideCompanyIdCards() {
    Array.prototype.slice.call(document.querySelectorAll("section,article,div")).forEach(function (node) {
      var t = text(node);

      if (
        t.indexOf("BusinessOS DB会社バインド") >= 0 ||
        t.indexOf("BusinessOS DB会社ID") >= 0 ||
        (t.indexOf("table:") >= 0 && t.indexOf("ai_company_manager_company") >= 0)
      ) {
        node.style.display = "none";
        node.setAttribute("data-aicm-hidden-company-debug", "1");
      }
    });
  }

  function hardenButtons() {
    var block = companyEditBlock();
    if (!block) return;

    Array.prototype.slice.call(block.querySelectorAll("button,input[type='submit'],input[type='button']")).forEach(function (btn) {
      var label = text(btn);
      if (label.indexOf("会社を変更") >= 0 || label.indexOf("会社を削除") >= 0) {
        try { btn.type = "button"; } catch (error) { /* ignore */ }
      }
    });
  }

  function findChangeButton() {
    var block = companyEditBlock();
    if (!block) return null;

    return Array.prototype.slice.call(block.querySelectorAll("button,input,a,[role='button']")).find(function (btn) {
      return text(btn).indexOf("会社を変更") >= 0;
    }) || null;
  }

  function findDeleteButton() {
    var block = companyEditBlock();
    if (!block) return null;

    return Array.prototype.slice.call(block.querySelectorAll("button,input,a,[role='button']")).find(function (btn) {
      return text(btn).indexOf("会社を削除") >= 0;
    }) || null;
  }

  async function saveCompanyChange(event) {
    var values;
    var response;
    var result;
    var nextCompanyId;
    var companyTable;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }

    if (saveBusy) return;
    saveBusy = true;

    values = currentEditValues();

    if (!values.company_name) {
      setStatus("会社変更不可: 会社名を入力してください。", false);
      window.alert("会社名を入力してください。");
      saveBusy = false;
      return;
    }

    if (!values.company_id) {
      setStatus("会社変更不可: company_id が未確定です。AI企業選択で対象会社を選び直してください。", false);
      window.alert("company_id が未確定です。AI企業選択で対象会社を選び直してください。");
      saveBusy = false;
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
      saveBusy = false;
      return;
    }

    setStatus("保存中: 会社変更をBusinessOS DBへ反映しています。", true);

    try {
      response = await fetch(API_BASE + "/api/aicm/company/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "AICompanyManager company edit stable UI",
          rollback_only: false,
          payload: {
            source: "AICompanyManager company edit stable UI",
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

      nextCompanyId = extractCompanyId(result.stdout) || values.company_id;
      companyTable = extractCompanyTable(result.stdout);

      var company = {
        company_id: nextCompanyId,
        company_name: values.company_name,
        business_domain: values.business_domain,
        company_table: companyTable || ""
      };

      writeCurrent(company);
      updateTopSelect(company);

      setStatus("保存OK: 会社変更をBusinessOS DBへ反映しました。", true);
      hideCompanyIdCards();
    } catch (error) {
      setStatus("保存失敗: " + String(error && error.message ? error.message : error), false);
    } finally {
      saveBusy = false;
    }
  }

  function blockDelete(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }

    setStatus("会社削除はまだ安全停止中です。次工程で soft delete / inactive 化として実装します。", false);
    window.alert("会社削除はまだ実行しません。次工程で soft delete として実装します。");
  }

  function bindActions() {
    var changeButton = findChangeButton();
    var deleteButton = findDeleteButton();

    hardenButtons();

    if (changeButton && changeButton.getAttribute("data-aicm-stable-change-bound") !== "1") {
      changeButton.setAttribute("data-aicm-stable-change-bound", "1");
      changeButton.addEventListener("click", saveCompanyChange, true);
      changeButton.addEventListener("submit", saveCompanyChange, true);
    }

    if (deleteButton && deleteButton.getAttribute("data-aicm-safe-delete-bound") !== "1") {
      deleteButton.setAttribute("data-aicm-safe-delete-bound", "1");
      deleteButton.addEventListener("click", blockDelete, true);
      deleteButton.addEventListener("submit", blockDelete, true);
    }
  }

  function run() {
    removeBogusCompanyOptions();
    hardenButtons();
    bindActions();
    hideCompanyIdCards();

    window.AICM_COMPANY_EDIT_ACTION_STABLE_UI_STATUS = {
      marker: "AICM_COMPANY_EDIT_ACTION_STABLE_UI_V1",
      bogus_company_option_removed: true,
      native_submit_blocked: true,
      delete_safety_blocked: true,
      current_company: companyFromSelectedTop() || currentCompany() || null
    };
  }

  function start() {
    run();

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 200);
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
