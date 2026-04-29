/* AICM_CURRENT_COMPANY_SINGLE_SELECTOR_UI_V1 */
(function () {
  "use strict";

  var SAVED_KEY = "aicm.savedCompanies.v1";
  var CURRENT_KEY = "aicm.currentCompany.v1";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  function norm(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function text(node) {
    if (!node) return "";
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT") return norm(node.value || "");
    return norm(node.textContent || node.value || "");
  }

  function compact(value) {
    return norm(value).replace(/\s+/g, "");
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

  function selectOptions(select) {
    return Array.prototype.slice.call(select.options || []);
  }

  function companyFromOption(option) {
    if (!option) return null;

    var value = norm(option.value || "");
    var name = norm(option.textContent || "");
    var rows = savedCompanies();
    var found = rows.find(function (row) {
      return row.company_id === value || row.company_name === name;
    });

    if (found) return found;

    if (!name || name === "選択してください" || name.indexOf("候補") >= 0) return null;

    return {
      company_id: UUID_RE.test(value) ? value : "",
      company_name: name,
      business_domain: ""
    };
  }

  function selectLooksCompany(select) {
    var around = blockTextAround(select, 8);
    return (
      around.indexOf("AI企業選択") >= 0 ||
      around.indexOf("AI企業") >= 0 ||
      around.indexOf("会社選択") >= 0 ||
      around.indexOf("変更対象") >= 0 ||
      around.indexOf("BusinessOS DB会社") >= 0
    );
  }

  function selectIsEditDuplicate(select) {
    var around = blockTextAround(select, 8);
    return around.indexOf("会社 変更・削除") >= 0 || around.indexOf("変更対象") >= 0;
  }

  function selectIsTopCompany(select) {
    var around = blockTextAround(select, 8);
    return (
      around.indexOf("AI企業選択") >= 0 ||
      around.indexOf("AI企業を表示") >= 0
    ) && !selectIsEditDuplicate(select);
  }

  function topCompanySelect() {
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));
    var i;

    for (i = 0; i < selects.length; i += 1) {
      if (selectIsTopCompany(selects[i])) return selects[i];
    }

    for (i = 0; i < selects.length; i += 1) {
      if (selectLooksCompany(selects[i]) && !selectIsEditDuplicate(selects[i])) return selects[i];
    }

    return null;
  }

  function ensureSavedCompaniesInTopSelect() {
    var select = topCompanySelect();
    var rows = savedCompanies();

    if (!select) return;

    rows.slice().reverse().forEach(function (company) {
      if (!company.company_name) return;

      var exists = selectOptions(select).some(function (option) {
        return option.value === company.company_id || norm(option.textContent) === company.company_name;
      });

      if (exists) return;

      var option = document.createElement("option");
      option.value = company.company_id || company.company_name;
      option.textContent = company.company_name;
      option.setAttribute("data-aicm-saved-company", "1");
      select.appendChild(option);
    });
  }

  function selectedTopCompany() {
    var select = topCompanySelect();
    var c;

    if (select && select.selectedIndex >= 0) {
      c = companyFromOption(select.options[select.selectedIndex]);
      if (c && c.company_name) return c;
    }

    c = currentCompany();
    if (c) return c;

    return null;
  }

  function setTopSelectToCompany(company) {
    var select = topCompanySelect();
    var matched = false;

    if (!select || !company || !company.company_name) return;

    selectOptions(select).forEach(function (option) {
      var c = companyFromOption(option);
      if (!c) return;

      if (
        (company.company_id && c.company_id === company.company_id) ||
        c.company_name === company.company_name
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

  function rememberTopSelection() {
    var c = selectedTopCompany();
    if (c) writeCurrent(c);
    return c;
  }

  function smallestBlockContaining(needle) {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("section,article,main,div"));
    var candidates = [];

    blocks.forEach(function (block) {
      if (text(block).indexOf(needle) >= 0) candidates.push(block);
    });

    candidates.sort(function (a, b) {
      return text(a).length - text(b).length;
    });

    return candidates[0] || null;
  }

  function companyOverviewBlock() {
    return smallestBlockContaining("会社概要");
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

  function directChildren(node) {
    return Array.prototype.slice.call(node ? node.children || [] : []);
  }

  function containsButton(node) {
    return !!(node && node.querySelector && node.querySelector("button,input[type='button'],input[type='submit'],a,[role='button']"));
  }

  function renderOverview(company) {
    var block = companyOverviewBlock();
    var summary;

    if (!block || !company || !company.company_name) return;

    directChildren(block).forEach(function (child) {
      var t = text(child);
      if (child.className && String(child.className).indexOf("aicm-current-company-overview-v1") >= 0) return;
      if (t.indexOf("会社概要") >= 0 && t.length < 20) return;
      if (containsButton(child)) return;
      if (t.indexOf("BusinessOS DB") >= 0) return;

      if (
        t === company.company_name ||
        t.indexOf("会社共通ルール") >= 0 ||
        t.indexOf("AI 機器") >= 0 ||
        t.indexOf("アプリ") >= 0 ||
        t.indexOf("開発") >= 0 ||
        t.indexOf("保守") >= 0 ||
        t.indexOf("運用") >= 0
      ) {
        child.style.display = "none";
        child.setAttribute("data-aicm-hidden-old-company-overview", "1");
      }
    });

    summary = block.querySelector(":scope > .aicm-current-company-overview-v1");
    if (!summary) {
      summary = document.createElement("div");
      summary.className = "aicm-current-company-overview-v1";
      summary.style.margin = "12px 0";
      summary.style.padding = "12px";
      summary.style.borderRadius = "14px";
      summary.style.background = "#f8fafc";
      summary.style.border = "1px solid #e2e8f0";
      summary.style.lineHeight = "1.6";

      var heading = directChildren(block).find(function (child) {
        return text(child).indexOf("会社概要") >= 0;
      });

      if (heading && heading.nextSibling) {
        block.insertBefore(summary, heading.nextSibling);
      } else {
        block.insertBefore(summary, block.firstChild);
      }
    }

    summary.innerHTML =
      "<div style=\"font-weight:900;font-size:1.1em;\">" + escapeHtml(company.company_name) + "</div>" +
      "<div style=\"color:#64748b;margin-top:6px;\">" + escapeHtml(company.business_domain || "-") + "</div>" +
      "<div style=\"margin-top:10px;\">会社共通ルール: 1件</div>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function populateEditForm(company) {
    var block = companyEditBlock();
    var inputs = editInputs();

    if (!block || !company || !company.company_name) return;

    if (inputs[0]) {
      inputs[0].value = company.company_name;
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (inputs[1] && company.business_domain) {
      inputs[1].value = company.business_domain;
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    }

    block.setAttribute("data-aicm-current-company-id", company.company_id || "");
    block.setAttribute("data-aicm-current-company-name", company.company_name || "");
    block.setAttribute("data-aicm-current-company-domain", company.business_domain || "");
  }

  function hideDuplicateEditSelectorAndReadButton() {
    var block = companyEditBlock();
    if (!block) return;

    Array.prototype.slice.call(block.querySelectorAll("select")).forEach(function (select) {
      var wrapper = select.parentElement || select;
      select.style.display = "none";
      select.setAttribute("data-aicm-hidden-duplicate-edit-select", "1");

      if (wrapper) {
        wrapper.style.display = "none";
        wrapper.setAttribute("data-aicm-hidden-duplicate-edit-select-wrapper", "1");
      }
    });

    Array.prototype.slice.call(block.querySelectorAll("button,input,a,[role='button']")).forEach(function (btn) {
      var label = text(btn);
      if (label.indexOf("読み込み") >= 0 || label.indexOf("読込") >= 0) {
        btn.style.display = "none";
        btn.setAttribute("data-aicm-hidden-read-button", "1");

        if (btn.parentElement && text(btn.parentElement).length < 80) {
          btn.parentElement.style.display = "none";
          btn.parentElement.setAttribute("data-aicm-hidden-read-button-wrapper", "1");
        }
      }
    });

    Array.prototype.slice.call(block.querySelectorAll("*")).forEach(function (node) {
      var t = text(node);
      if (t === "変更対象" || compact(t) === "変更対象") {
        node.style.display = "none";
        node.setAttribute("data-aicm-hidden-edit-target-label", "1");
      }
    });
  }

  function hideBusinessOsDebugCards() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("section,article,div"));
    var candidates = [];

    blocks.forEach(function (block) {
      var t = text(block);

      if (
        t.indexOf("BusinessOS DB会社バインド") >= 0 ||
        t.indexOf("BusinessOS DB会社ID") >= 0 ||
        (t.indexOf("永続保存前") >= 0 && t.indexOf("BusinessOS DB") >= 0) ||
        (t.indexOf("DB会社候補") >= 0 && t.indexOf("DB保存なし") >= 0)
      ) {
        candidates.push(block);
      }
    });

    candidates.sort(function (a, b) {
      return text(a).length - text(b).length;
    });

    candidates.forEach(function (block) {
      block.style.display = "none";
      block.setAttribute("data-aicm-hidden-businessos-debug-card", "1");
    });

    var badge = document.getElementById("aicm-company-save-client-debug-badge");
    if (badge) {
      badge.style.display = "none";
      badge.setAttribute("data-aicm-hidden-save-debug-badge", "1");
    }
  }

  function bindTopSelect() {
    var select = topCompanySelect();

    if (!select || select.getAttribute("data-aicm-single-selector-bound") === "1") return;

    select.setAttribute("data-aicm-single-selector-bound", "1");

    select.addEventListener("change", function () {
      var company = rememberTopSelection();
      setTopSelectToCompany(company);
      renderOverview(company);
      populateEditForm(company);
    });
  }

  function bindDisplayButton() {
    Array.prototype.slice.call(document.querySelectorAll("button,input,a,[role='button']")).forEach(function (btn) {
      var label = text(btn);

      if (label.indexOf("AI企業を表示") < 0) return;
      if (btn.getAttribute("data-aicm-display-company-bound") === "1") return;

      btn.setAttribute("data-aicm-display-company-bound", "1");

      btn.addEventListener("click", function () {
        var company = rememberTopSelection();

        window.setTimeout(function () {
          ensureSavedCompaniesInTopSelect();
          setTopSelectToCompany(company);
          renderOverview(company);
          populateEditForm(company);
          hideBusinessOsDebugCards();
          hideDuplicateEditSelectorAndReadButton();
        }, 80);

        window.setTimeout(function () {
          setTopSelectToCompany(company);
          renderOverview(company);
          populateEditForm(company);
        }, 300);
      }, true);
    });
  }

  function run() {
    ensureSavedCompaniesInTopSelect();
    bindTopSelect();
    bindDisplayButton();

    var company = selectedTopCompany() || currentCompany();
    if (company) {
      writeCurrent(company);
      setTopSelectToCompany(company);
      renderOverview(company);
      populateEditForm(company);
    }

    hideDuplicateEditSelectorAndReadButton();
    hideBusinessOsDebugCards();

    window.AICM_CURRENT_COMPANY_SINGLE_SELECTOR_UI_STATUS = {
      marker: "AICM_CURRENT_COMPANY_SINGLE_SELECTOR_UI_V1",
      top_selector_is_current_company_source: true,
      duplicate_edit_selector_hidden: true,
      businessos_debug_card_hidden: true,
      current_company: company || null
    };
  }

  function start() {
    run();

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 180);
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
