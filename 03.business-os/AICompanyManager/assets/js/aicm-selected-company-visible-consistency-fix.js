(function () {
  "use strict";

  var MARK = "__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_AEA_AED_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var staleNames = [
    "Ai System Integrated Corporation",
    "AI System Integrated Corporation",
    "選択してください"
  ];

  var staleDomains = [
    "AI 機器、アプリの開発、保守、運用あ",
    "AI 機器、アプリの開発、保守、運用",
    "選択してください"
  ];

  function s(v) {
    return String(v == null ? "" : v);
  }

  function log(type, detail) {
    window.__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_LOG =
      window.__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_LOG || [];
    window.__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_LOG.length > 160) {
      window.__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_LOG.shift();
    }
  }

  function textOf(el) {
    if (!el) return "";
    return s(el.innerText || el.textContent || el.value || (el.getAttribute && el.getAttribute("aria-label")) || "").replace(/\s+/g, " ").trim();
  }

  function isPlaceholder(v) {
    var x = s(v).trim();
    return !x || x === "選択してください" || x === "company" || x === "会社" || x === "BusinessOSなんちゃら";
  }

  function isInsideCompatRoot(node) {
    var root = document.getElementById("aicm-legacy-company-compat-root");
    return !!(root && node && root.contains(node));
  }

  function isVisibleElement(node) {
    if (!node || node.nodeType !== 1) return false;
    if (isInsideCompatRoot(node)) return false;
    try {
      var st = window.getComputedStyle(node);
      if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return false;
      var rect = node.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return false;
    } catch (_) {}
    return true;
  }

  function getFromReadBridge() {
    try {
      if (window.AICMCompanyOrganizationReadBridge && typeof window.AICMCompanyOrganizationReadBridge.current === "function") {
        var c = window.AICMCompanyOrganizationReadBridge.current();
        if (c && !isPlaceholder(c.company_id) && !isPlaceholder(c.company_name)) return c;
      }
    } catch (_) {}
    return null;
  }

  function getFromWindowState() {
    var id = s(window.AICM_CURRENT_COMPANY_ID || window.aicmCurrentCompany && window.aicmCurrentCompany.company_id || window.aicmSelectedCompany && window.aicmSelectedCompany.company_id || "");
    var name = s(window.AICM_CURRENT_COMPANY_NAME || window.aicmCurrentCompany && window.aicmCurrentCompany.company_name || window.aicmSelectedCompany && window.aicmSelectedCompany.company_name || "");
    var domain = s(window.AICM_CURRENT_COMPANY_DOMAIN || window.aicmCurrentCompany && window.aicmCurrentCompany.business_domain || window.aicmSelectedCompany && window.aicmSelectedCompany.business_domain || "");

    if (!isPlaceholder(id) && !isPlaceholder(name)) {
      return {
        company_id: id,
        company_name: name,
        business_domain: domain
      };
    }

    return null;
  }

  function getFromStorage() {
    try {
      var id = localStorage.getItem("aicm.currentCompanyId") || sessionStorage.getItem("aicm.currentCompanyId") || "";
      var name = localStorage.getItem("aicm.currentCompanyName") || sessionStorage.getItem("aicm.currentCompanyName") || "";
      var domain = localStorage.getItem("aicm.currentCompanyDomain") || sessionStorage.getItem("aicm.currentCompanyDomain") || "";

      if (!isPlaceholder(id) && !isPlaceholder(name)) {
        return {
          company_id: id,
          company_name: name,
          business_domain: domain
        };
      }
    } catch (_) {}
    return null;
  }

  function getFromVisibleSelect() {
    var selects = Array.prototype.slice.call(document.querySelectorAll("select")).filter(function (select) {
      if (!isVisibleElement(select)) return false;
      var label = textOf(select.parentElement) + " " + s(select.id) + " " + s(select.name);
      return /AI企業|会社|company|Company/i.test(label);
    });

    selects.sort(function (a, b) {
      var at = textOf(a.parentElement) + " " + s(a.id) + " " + s(a.name);
      var bt = textOf(b.parentElement) + " " + s(b.id) + " " + s(b.name);
      var ascore = /AI企業選択/.test(at) ? 100 : /AI企業/.test(at) ? 70 : /会社/.test(at) ? 30 : 0;
      var bscore = /AI企業選択/.test(bt) ? 100 : /AI企業/.test(bt) ? 70 : /会社/.test(bt) ? 30 : 0;
      return bscore - ascore;
    });

    var select = selects[0];
    if (!select || isPlaceholder(select.value)) return null;

    var opt = select.options[select.selectedIndex];
    var name = textOf(opt);
    var domain = opt ? s(opt.getAttribute("data-business-domain") || "") : "";

    if (!isPlaceholder(select.value) && !isPlaceholder(name)) {
      return {
        company_id: select.value,
        company_name: name,
        business_domain: domain
      };
    }

    return null;
  }

  function currentCompany() {
    return getFromReadBridge() || getFromWindowState() || getFromStorage() || getFromVisibleSelect();
  }

  function setInputValue(input, value) {
    if (!input || value == null) return;
    if (isInsideCompatRoot(input)) return;

    try {
      input.value = value;
      input.setAttribute("data-aicm-selected-company-synced", "true");
    } catch (_) {}
  }

  function syncForms(company) {
    if (!company) return 0;

    var count = 0;

    Array.prototype.slice.call(document.querySelectorAll("input, textarea")).forEach(function (input) {
      if (!isVisibleElement(input)) return;
      if (isInsideCompatRoot(input)) return;

      var key = [input.id, input.name, input.getAttribute("aria-label"), textOf(input.previousElementSibling), textOf(input.parentElement)].join(" ");

      if (/会社名|company_name|companyName|Company Name/i.test(key)) {
        setInputValue(input, company.company_name || "");
        count += 1;
        return;
      }

      if (/事業領域|business_domain|businessDomain|business_area|domain/i.test(key)) {
        setInputValue(input, company.business_domain || "");
        count += 1;
        return;
      }

      if (/company_id|companyId/i.test(key) && input.type === "hidden") {
        setInputValue(input, company.company_id || "");
        count += 1;
      }
    });

    return count;
  }

  function replaceTextNode(node, company) {
    if (!node || !node.nodeValue) return 0;
    var before = node.nodeValue;
    var after = before;

    staleNames.forEach(function (name) {
      if (name && company.company_name && company.company_name !== name) {
        after = after.split(name).join(company.company_name);
      }
    });

    staleDomains.forEach(function (domain) {
      if (domain && company.business_domain && company.business_domain !== domain) {
        after = after.split(domain).join(company.business_domain);
      }
    });

    if (after !== before) {
      node.nodeValue = after;
      return 1;
    }

    return 0;
  }

  function syncVisibleText(company) {
    if (!company) return 0;

    var count = 0;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node || !node.parentElement) return NodeFilter.FILTER_REJECT;
        if (isInsideCompatRoot(node.parentElement)) return NodeFilter.FILTER_REJECT;
        if (!isVisibleElement(node.parentElement)) return NodeFilter.FILTER_REJECT;

        var txt = s(node.nodeValue || "");
        if (!txt.trim()) return NodeFilter.FILTER_REJECT;

        var hit = false;
        staleNames.concat(staleDomains).forEach(function (x) {
          if (x && txt.indexOf(x) >= 0) hit = true;
        });

        return hit ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      count += replaceTextNode(node, company);
    }

    return count;
  }

  function syncSelects(company) {
    if (!company) return 0;

    var count = 0;
    Array.prototype.slice.call(document.querySelectorAll("select")).forEach(function (select) {
      if (!isVisibleElement(select)) return;
      if (isInsideCompatRoot(select)) return;

      var label = textOf(select.parentElement) + " " + s(select.id) + " " + s(select.name);
      if (!/AI企業|会社|company|Company/i.test(label)) return;

      var exists = Array.prototype.slice.call(select.options || []).some(function (opt) {
        return opt.value === company.company_id;
      });

      if (exists && select.value !== company.company_id) {
        select.value = company.company_id;
        count += 1;
      }

      Array.prototype.slice.call(select.options || []).forEach(function (opt) {
        if (opt.value === company.company_id && textOf(opt) !== company.company_name) {
          opt.textContent = company.company_name || company.company_id;
          count += 1;
        }
      });
    });

    return count;
  }

  function ensureBanner(company, reason) {
    if (!company || !document.body) return;

    var banner = document.getElementById("aicm-selected-company-context-banner");
    if (!banner) return;

    var orgCount = 0;
    try {
      if (window.AICMCompanyOrganizationReadBridge && window.AICMCompanyOrganizationReadBridge.state) {
        orgCount = window.AICMCompanyOrganizationReadBridge.state.organizations.length || 0;
      }
    } catch (_) {}

    banner.textContent =
      "選択中AI企業: " + (company.company_name || company.company_id) +
      " / company_id=" + company.company_id +
      " / 組織=" + orgCount +
      "件 / reason=" + (reason || "visible-consistency");
  }

  function sync(reason) {
    var company = currentCompany();

    if (!company || isPlaceholder(company.company_id) || isPlaceholder(company.company_name)) {
      log("sync-skipped-no-valid-company", { reason: reason || "" });
      return null;
    }

    window.AICM_CURRENT_COMPANY_ID = company.company_id;
    window.AICM_CURRENT_COMPANY_NAME = company.company_name || "";
    window.AICM_CURRENT_COMPANY_DOMAIN = company.business_domain || "";

    window.aicmCurrentCompany = {
      company_id: company.company_id,
      company_name: company.company_name || "",
      business_domain: company.business_domain || ""
    };

    window.aicmSelectedCompany = {
      company_id: company.company_id,
      company_name: company.company_name || "",
      business_domain: company.business_domain || ""
    };

    var formCount = syncForms(company);
    var textCount = syncVisibleText(company);
    var selectCount = syncSelects(company);
    ensureBanner(company, reason);

    log("visible-consistency-synced", {
      reason: reason || "",
      company_id: company.company_id,
      company_name: company.company_name,
      business_domain: company.business_domain || "",
      formCount: formCount,
      textCount: textCount,
      selectCount: selectCount
    });

    return company;
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      if (ev.target && ev.target.tagName === "SELECT") {
        setTimeout(function () { sync("after-select-change-100ms"); }, 100);
        setTimeout(function () { sync("after-select-change-800ms"); }, 800);
      }
    }, true);

    document.addEventListener("click", function () {
      setTimeout(function () { sync("after-click-100ms"); }, 100);
      setTimeout(function () { sync("after-click-800ms"); }, 800);
      setTimeout(function () { sync("after-click-1800ms"); }, 1800);
    }, true);

    window.addEventListener("aicm:company-context-changed", function () {
      setTimeout(function () { sync("company-context-changed"); }, 0);
    });

    window.addEventListener("aicm:visible-company-consistency-refresh", function () {
      sync("manual-event");
    });
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(function () { sync("DOMContentLoaded-400ms"); }, 400);
      setTimeout(function () { sync("DOMContentLoaded-1500ms"); }, 1500);
      setTimeout(function () { sync("DOMContentLoaded-3000ms"); }, 3000);
    });
  } else {
    setTimeout(function () { sync("ready-200ms"); }, 200);
    setTimeout(function () { sync("ready-1200ms"); }, 1200);
    setTimeout(function () { sync("ready-3000ms"); }, 3000);
  }

  window.AICMSelectedCompanyVisibleConsistencyFix = {
    sync: function () { return sync("manual-window-sync"); },
    current: currentCompany,
    log: function () {
      return (window.__AICM_SELECTED_COMPANY_VISIBLE_CONSISTENCY_LOG || []).slice();
    }
  };
})();
