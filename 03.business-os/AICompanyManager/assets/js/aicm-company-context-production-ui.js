/* AICM_COMPANY_CONTEXT_PRODUCTION_UI_V1 */
(function () {
  "use strict";

  var STORAGE_KEY = "aicm.savedCompanies.v1";
  var CURRENT_KEY = "aicm.currentCompany.v1";
  var UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function visibleText(node) {
    if (!node) return "";
    if (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT") return normalizeText(node.value || "");
    return normalizeText(node.textContent || node.value || "");
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 80)));
    } catch (error) {
      /* ignore */
    }
  }

  function readCurrentCompany() {
    try {
      var raw = localStorage.getItem(CURRENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeCurrentCompany(company) {
    try {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(company || {}));
    } catch (error) {
      /* ignore */
    }
  }

  function optionCompany(option) {
    if (!option) return null;

    var id = String(option.value || "").trim();
    var name = normalizeText(option.textContent || "");
    var rows = readSavedCompanies();
    var matched = rows.find(function (row) {
      return row.company_id === id || row.company_name === name;
    });

    if (matched) return matched;

    return {
      company_id: UUID_RE.test(id) ? id : "",
      company_name: name,
      business_domain: ""
    };
  }

  function selectLooksLikeCompanySelector(select) {
    var node = select;
    var text = "";
    var guard = 0;

    while (node && node !== document.body && guard < 7) {
      text += " " + visibleText(node);
      node = node.parentElement;
      guard += 1;
    }

    return (
      text.indexOf("AI企業選択") >= 0 ||
      text.indexOf("AI企業") >= 0 ||
      text.indexOf("会社選択") >= 0 ||
      text.indexOf("変更対象") >= 0
    );
  }

  function isTopCompanySelect(select) {
    var node = select;
    var text = "";
    var guard = 0;

    while (node && node !== document.body && guard < 7) {
      text += " " + visibleText(node);
      node = node.parentElement;
      guard += 1;
    }

    return text.indexOf("AI企業選択") >= 0 || text.indexOf("AI企業を表示") >= 0;
  }

  function ensureSavedCompaniesInSelects() {
    var rows = readSavedCompanies();
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));

    selects.forEach(function (select) {
      if (!selectLooksLikeCompanySelector(select)) return;

      rows.slice().reverse().forEach(function (company) {
        if (!company.company_name) return;

        var exists = Array.prototype.slice.call(select.options).some(function (option) {
          return option.value === company.company_id || normalizeText(option.textContent) === company.company_name;
        });

        if (exists) return;

        var option = document.createElement("option");
        option.value = company.company_id || company.company_name;
        option.textContent = company.company_name;
        option.setAttribute("data-aicm-local-saved-company", "1");
        select.appendChild(option);
      });
    });
  }

  function getTopCompanySelect() {
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));
    var i;

    for (i = 0; i < selects.length; i += 1) {
      if (isTopCompanySelect(selects[i])) return selects[i];
    }

    for (i = 0; i < selects.length; i += 1) {
      if (selectLooksLikeCompanySelector(selects[i])) return selects[i];
    }

    return null;
  }

  function currentCompanyFromTopSelect() {
    var select = getTopCompanySelect();
    var company;

    if (select && select.selectedIndex >= 0) {
      company = optionCompany(select.options[select.selectedIndex]);
      if (company && company.company_name) return company;
    }

    company = readCurrentCompany();
    if (company && company.company_name) return company;

    return null;
  }

  function rememberFromVisibleCurrentSelection() {
    var company = currentCompanyFromTopSelect();
    if (!company || !company.company_name) return;

    writeCurrentCompany(company);

    var rows = readSavedCompanies().filter(function (row) {
      return row.company_name !== company.company_name && row.company_id !== company.company_id;
    });

    if (company.company_id || company.business_domain) {
      rows.unshift(company);
      writeSavedCompanies(rows);
    }
  }

  function findCompanyEditSection() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("section,article,div"));
    var candidates = [];

    blocks.forEach(function (block) {
      var text = visibleText(block);
      if (
        text.indexOf("会社 変更・削除") >= 0 ||
        (
          text.indexOf("会社を変更") >= 0 &&
          text.indexOf("会社を削除") >= 0 &&
          text.indexOf("会社名") >= 0
        )
      ) {
        candidates.push(block);
      }
    });

    candidates.sort(function (a, b) {
      return visibleText(a).length - visibleText(b).length;
    });

    return candidates[0] || null;
  }

  function hideDuplicateEditSelector() {
    var section = findCompanyEditSection();
    if (!section) return;

    var selects = Array.prototype.slice.call(section.querySelectorAll("select"));
    selects.forEach(function (select) {
      var wrapper = select.parentElement || select;
      var parentText = visibleText(wrapper);

      if (parentText.indexOf("変更対象") >= 0 || selectLooksLikeCompanySelector(select)) {
        wrapper.style.display = "none";
        wrapper.setAttribute("data-aicm-hidden-duplicate-company-selector", "1");

        var prev = wrapper.previousElementSibling;
        if (prev && visibleText(prev).indexOf("変更対象") >= 0) {
          prev.style.display = "none";
          prev.setAttribute("data-aicm-hidden-duplicate-company-selector-label", "1");
        }
      }
    });

    Array.prototype.slice.call(section.querySelectorAll("button,input,a,[role='button']")).forEach(function (button) {
      var label = visibleText(button);
      if (label.indexOf("読み込み") >= 0 || label.indexOf("読込") >= 0) {
        button.style.display = "none";
        button.setAttribute("data-aicm-hidden-company-load-button", "1");
      }
    });
  }

  function findTextInputsInEditSection() {
    var section = findCompanyEditSection();
    if (!section) return [];

    return Array.prototype.slice.call(section.querySelectorAll("input,textarea")).filter(function (input) {
      var type = String(input.type || "text").toLowerCase();
      if (["button", "submit", "file", "hidden", "checkbox", "radio", "password"].indexOf(type) >= 0) return false;
      return true;
    });
  }

  function populateEditFormFromCurrentCompany() {
    var company = currentCompanyFromTopSelect();
    var inputs = findTextInputsInEditSection();

    if (!company || inputs.length < 1) return;

    if (inputs[0] && company.company_name && normalizeText(inputs[0].value) !== company.company_name) {
      inputs[0].value = company.company_name;
      inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (inputs[1] && company.business_domain && normalizeText(inputs[1].value) !== company.business_domain) {
      inputs[1].value = company.business_domain;
      inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    }

    var section = findCompanyEditSection();
    if (section) {
      section.setAttribute("data-aicm-current-company-id", company.company_id || "");
      section.setAttribute("data-aicm-current-company-name", company.company_name || "");
      section.setAttribute("data-aicm-current-company-domain", company.business_domain || "");
    }
  }

  function hideBusinessOsCompanyDebugCards() {
    Array.prototype.slice.call(document.querySelectorAll("section,article,div")).forEach(function (block) {
      var text = visibleText(block);

      if (
        text.indexOf("BusinessOS DB会社バインド") >= 0 ||
        text.indexOf("BusinessOS DB会社ID") >= 0 ||
        text.indexOf("table:") >= 0 && text.indexOf("company") >= 0 && text.indexOf("BusinessOS DB") >= 0
      ) {
        block.style.display = "none";
        block.setAttribute("data-aicm-hidden-businessos-company-debug", "1");
      }
    });

    var badge = document.getElementById("aicm-company-save-client-debug-badge");
    if (badge) {
      badge.style.display = "none";
      badge.setAttribute("data-aicm-hidden-debug-badge", "1");
    }
  }

  function hideCompanyIdBlueCards() {
    Array.prototype.slice.call(document.querySelectorAll("div")).forEach(function (div) {
      var text = visibleText(div);
      if (text.indexOf("BusinessOS DB会社ID:") >= 0) {
        div.style.display = "none";
        div.setAttribute("data-aicm-hidden-company-id-debug", "1");
      }
    });
  }

  function addCurrentCompanyHint() {
    var section = findCompanyEditSection();
    var company = currentCompanyFromTopSelect();
    var existing;

    if (!section || !company || !company.company_name) return;

    existing = section.querySelector(":scope > .aicm-current-company-hint-v1");
    if (!existing) {
      existing = document.createElement("div");
      existing.className = "aicm-current-company-hint-v1";
      existing.style.margin = "8px 0 12px 0";
      existing.style.padding = "10px";
      existing.style.borderRadius = "12px";
      existing.style.background = "#eef6ff";
      existing.style.color = "#15466f";
      existing.style.fontWeight = "800";
      section.insertBefore(existing, section.firstChild ? section.firstChild.nextSibling : null);
    }

    existing.textContent = "現在会社: " + company.company_name;
  }

  function onTopCompanyChanged() {
    rememberFromVisibleCurrentSelection();
    populateEditFormFromCurrentCompany();
    addCurrentCompanyHint();
  }

  function bindTopCompanySelect() {
    var select = getTopCompanySelect();

    if (!select || select.getAttribute("data-aicm-current-company-bound") === "1") return;

    select.setAttribute("data-aicm-current-company-bound", "1");
    select.addEventListener("change", onTopCompanyChanged);
  }

  function simplify() {
    ensureSavedCompaniesInSelects();
    bindTopCompanySelect();
    rememberFromVisibleCurrentSelection();
    hideDuplicateEditSelector();
    hideBusinessOsCompanyDebugCards();
    hideCompanyIdBlueCards();
    populateEditFormFromCurrentCompany();
    addCurrentCompanyHint();

    window.AICM_COMPANY_CONTEXT_PRODUCTION_UI_STATUS = {
      marker: "AICM_COMPANY_CONTEXT_PRODUCTION_UI_V1",
      duplicate_edit_selector_hidden: true,
      businessos_company_debug_hidden: true,
      current_company_from_top_select: true,
      current_company: currentCompanyFromTopSelect()
    };
  }

  function start() {
    simplify();

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(simplify, 250);
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
