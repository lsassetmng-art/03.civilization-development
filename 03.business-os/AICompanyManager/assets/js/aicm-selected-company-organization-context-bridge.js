(function () {
  "use strict";

  var MARK = "__AICM_SELECTED_COMPANY_ORGANIZATION_CONTEXT_BRIDGE_ADS_ADV_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var STORAGE_KEYS = {
    id: "aicm.currentCompanyId",
    name: "aicm.currentCompanyName",
    domain: "aicm.currentCompanyDomain"
  };

  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";
  var DEFAULT_COMPANY_NAME = "ウルフ";

  function s(value) {
    return String(value == null ? "" : value);
  }

  function textOf(el) {
    if (!el) return "";
    return s(el.innerText || el.textContent || el.value || (el.getAttribute && el.getAttribute("aria-label")) || "").replace(/\s+/g, " ").trim();
  }

  function log(type, detail) {
    window.__AICM_SELECTED_COMPANY_ORG_BRIDGE_LOG = window.__AICM_SELECTED_COMPANY_ORG_BRIDGE_LOG || [];
    window.__AICM_SELECTED_COMPANY_ORG_BRIDGE_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_SELECTED_COMPANY_ORG_BRIDGE_LOG.length > 160) {
      window.__AICM_SELECTED_COMPANY_ORG_BRIDGE_LOG.shift();
    }
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

  function labelForSelect(select) {
    var out = "";
    try {
      if (select.id) {
        var label = document.querySelector("label[for='" + select.id.replace(/'/g, "\\'") + "']");
        out += " " + textOf(label);
      }
    } catch (_) {}
    out += " " + textOf(select.parentElement);
    out += " " + s(select.id) + " " + s(select.name) + " " + s(select.className);
    return out.replace(/\s+/g, " ").trim();
  }

  function isCompanySelect(select) {
    if (!select || select.tagName !== "SELECT") return false;
    var label = labelForSelect(select);
    return /AI企業|会社|company|Company|BusinessOS|businessos/i.test(label);
  }

  function visibleCompanySelects() {
    return Array.prototype.slice.call(document.querySelectorAll("select")).filter(function (select) {
      return isVisibleElement(select) && isCompanySelect(select);
    });
  }

  function scoreSelect(select) {
    var label = labelForSelect(select);
    var score = 0;
    if (/AI企業選択/.test(label)) score += 100;
    if (/AI企業/.test(label)) score += 60;
    if (/会社/.test(label)) score += 30;
    if (/company/i.test(label)) score += 10;
    if ((select.options || []).length > 1) score += 20;
    if (select.value) score += 10;
    return score;
  }

  function bestVisibleCompanySelect(preferred) {
    if (preferred && preferred.tagName === "SELECT" && isCompanySelect(preferred)) return preferred;

    var list = visibleCompanySelects();
    if (!list.length) return null;

    list.sort(function (a, b) {
      return scoreSelect(b) - scoreSelect(a);
    });

    return list[0];
  }

  function optionInfo(select) {
    if (!select || !select.options || !select.options.length) return null;

    var opt = select.options[select.selectedIndex >= 0 ? select.selectedIndex : 0];
    if (!opt) return null;

    var id = s(opt.value || opt.getAttribute("data-company-id") || opt.getAttribute("data-id") || "").trim();
    var name = textOf(opt).trim();

    if (!id && name) id = name;
    if (!name && id) name = id;

    if (!id && !name) return null;

    return {
      company_id: id || DEFAULT_COMPANY_ID,
      company_name: name || DEFAULT_COMPANY_NAME,
      business_domain: s(opt.getAttribute("data-business-domain") || opt.getAttribute("data-domain") || ""),
      source: "visible-select",
      select_id: s(select.id || ""),
      select_name: s(select.name || "")
    };
  }

  function storedCompany() {
    try {
      var id = localStorage.getItem(STORAGE_KEYS.id) || sessionStorage.getItem(STORAGE_KEYS.id) || "";
      var name = localStorage.getItem(STORAGE_KEYS.name) || sessionStorage.getItem(STORAGE_KEYS.name) || "";
      var domain = localStorage.getItem(STORAGE_KEYS.domain) || sessionStorage.getItem(STORAGE_KEYS.domain) || "";
      if (id || name) {
        return {
          company_id: id || DEFAULT_COMPANY_ID,
          company_name: name || DEFAULT_COMPANY_NAME,
          business_domain: domain || "",
          source: "storage"
        };
      }
    } catch (_) {}
    return null;
  }

  function currentCompany(preferredSelect) {
    var select = bestVisibleCompanySelect(preferredSelect);
    var fromSelect = optionInfo(select);
    if (fromSelect) return fromSelect;

    if (window.aicmSelectedCompany && window.aicmSelectedCompany.company_id) {
      return {
        company_id: s(window.aicmSelectedCompany.company_id),
        company_name: s(window.aicmSelectedCompany.company_name || window.aicmSelectedCompany.name || DEFAULT_COMPANY_NAME),
        business_domain: s(window.aicmSelectedCompany.business_domain || ""),
        source: "window.aicmSelectedCompany"
      };
    }

    if (window.aicmCurrentCompany && window.aicmCurrentCompany.company_id) {
      return {
        company_id: s(window.aicmCurrentCompany.company_id),
        company_name: s(window.aicmCurrentCompany.company_name || window.aicmCurrentCompany.name || DEFAULT_COMPANY_NAME),
        business_domain: s(window.aicmCurrentCompany.business_domain || ""),
        source: "window.aicmCurrentCompany"
      };
    }

    return storedCompany() || {
      company_id: DEFAULT_COMPANY_ID,
      company_name: DEFAULT_COMPANY_NAME,
      business_domain: "",
      source: "fallback"
    };
  }

  function ensureOption(select, company) {
    if (!select || !company || !company.company_id) return;

    var opts = Array.prototype.slice.call(select.options || []);
    var exists = opts.some(function (o) {
      return s(o.value) === s(company.company_id);
    });

    if (!exists) {
      var opt = document.createElement("option");
      opt.value = company.company_id;
      opt.textContent = company.company_name || company.company_id;
      select.appendChild(opt);
    }
  }

  function syncHiddenLegacyFields(company) {
    if (!company || !company.company_id) return;

    var selectors = Array.prototype.slice.call(document.querySelectorAll("select"));
    selectors.forEach(function (select) {
      if (!isInsideCompatRoot(select)) return;
      ensureOption(select, company);
      try { select.value = company.company_id; } catch (_) {}
      select.setAttribute("data-company-id", company.company_id);
    });

    var inputs = Array.prototype.slice.call(document.querySelectorAll("input, textarea"));
    inputs.forEach(function (input) {
      var idName = [input.id, input.name, input.getAttribute("data-aicm-compat-field")].join(" ");
      var lower = idName.toLowerCase();

      if (isInsideCompatRoot(input) || input.type === "hidden") {
        if (/company.*id|company_id|businessos_company_id/.test(lower)) {
          input.value = company.company_id;
        }
        if (/company.*name|company_name/.test(lower)) {
          input.value = company.company_name || "";
        }
        if (/business.*domain|business_domain|domain/.test(lower)) {
          input.value = company.business_domain || "";
        }
      }
    });
  }

  function syncWindowAndStorage(company) {
    if (!company || !company.company_id) return company;

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

    try {
      localStorage.setItem(STORAGE_KEYS.id, company.company_id);
      localStorage.setItem(STORAGE_KEYS.name, company.company_name || "");
      localStorage.setItem(STORAGE_KEYS.domain, company.business_domain || "");
      sessionStorage.setItem(STORAGE_KEYS.id, company.company_id);
      sessionStorage.setItem(STORAGE_KEYS.name, company.company_name || "");
      sessionStorage.setItem(STORAGE_KEYS.domain, company.business_domain || "");
    } catch (_) {}

    if (document.body) {
      document.body.setAttribute("data-aicm-current-company-id", company.company_id);
      document.body.setAttribute("data-aicm-current-company-name", company.company_name || "");
    }

    var root = document.getElementById("aicm-root");
    if (root) {
      root.setAttribute("data-aicm-current-company-id", company.company_id);
      root.setAttribute("data-aicm-current-company-name", company.company_name || "");
    }

    return company;
  }

  function dispatchCompanyChanged(company, reason) {
    try {
      window.dispatchEvent(new CustomEvent("aicm:company-context-changed", {
        detail: {
          company: company,
          reason: reason || "unknown"
        }
      }));
      document.dispatchEvent(new CustomEvent("aicm:company-context-changed", {
        detail: {
          company: company,
          reason: reason || "unknown"
        }
      }));
    } catch (_) {}
  }

  function syncCompanyContext(reason, preferredSelect) {
    var company = currentCompany(preferredSelect);
    syncWindowAndStorage(company);
    syncHiddenLegacyFields(company);
    syncOrganizationContext(company, reason);
    dispatchCompanyChanged(company, reason);
    log("company-context-synced", {
      reason: reason || "unknown",
      company_id: company.company_id,
      company_name: company.company_name,
      source: company.source || ""
    });
    return company;
  }

  function looksOrgRelated(el) {
    var t = textOf(el);
    return /組織|部門|課|Department|department|Organization|organization|Manager|Leader|Worker/.test(t);
  }

  function syncOrganizationContext(company, reason) {
    if (!company || !company.company_id) return;

    var orgRoots = Array.prototype.slice.call(document.querySelectorAll("[data-company-id], [data-aicm-company-id], [data-businessos-company-id], section, article, form, div"))
      .filter(function (node) {
        if (!isVisibleElement(node)) return false;
        if (isInsideCompatRoot(node)) return false;
        return looksOrgRelated(node);
      });

    var touched = 0;
    orgRoots.forEach(function (node) {
      var nodeCompanyId = s(
        node.getAttribute("data-company-id") ||
        node.getAttribute("data-aicm-company-id") ||
        node.getAttribute("data-businessos-company-id") ||
        ""
      ).trim();

      if (nodeCompanyId) {
        if (nodeCompanyId === company.company_id) {
          node.style.display = "";
          node.removeAttribute("hidden");
          node.setAttribute("data-aicm-company-context-match", "true");
        } else {
          // Only hide when the element explicitly declares a different company_id.
          // Do not hide generic department cards without company_id.
          node.setAttribute("data-aicm-company-context-match", "false");
        }
        touched += 1;
      }

      // Ensure forms opened after company selection post the selected company id.
      Array.prototype.slice.call(node.querySelectorAll("input[name='company_id'], input[name='businessos_company_id'], input[data-company-id-field='true']")).forEach(function (input) {
        input.value = company.company_id;
        touched += 1;
      });
    });

    updateCompanyContextBanner(company, reason, touched);

    log("organization-context-synced", {
      reason: reason || "unknown",
      touched: touched,
      company_id: company.company_id,
      company_name: company.company_name
    });
  }

  function updateCompanyContextBanner(company, reason, touched) {
    if (!document.body || !company) return;

    var existing = document.getElementById("aicm-selected-company-context-banner");
    var shouldShow = /組織|部門|課|会社ダッシュボード|AI企業設定|会社変更/.test(textOf(document.body));

    if (!shouldShow) {
      if (existing) existing.remove();
      return;
    }

    if (!existing) {
      existing = document.createElement("div");
      existing.id = "aicm-selected-company-context-banner";
      existing.style.cssText = [
        "position:sticky",
        "top:0",
        "z-index:999",
        "margin:8px",
        "padding:8px 10px",
        "border-radius:10px",
        "background:#ecfeff",
        "border:1px solid #67e8f9",
        "color:#164e63",
        "font-size:12px",
        "font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
        "box-shadow:0 4px 12px rgba(15,23,42,.08)"
      ].join(";");

      var root = document.getElementById("aicm-root") || document.body;
      if (root.firstChild) root.insertBefore(existing, root.firstChild);
      else root.appendChild(existing);
    }

    existing.textContent = "選択中AI企業: " + (company.company_name || company.company_id) +
      " / company_id=" + company.company_id +
      " / 組織コンテキスト同期=" + touched +
      " / reason=" + (reason || "unknown");
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      var target = ev.target;
      if (target && target.tagName === "SELECT" && isCompanySelect(target) && !isInsideCompatRoot(target)) {
        syncCompanyContext("visible-company-select-change", target);
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button'], [data-screen]") : null;
      if (!target) return;

      var label = textOf(target);
      var ds = s(target.getAttribute("data-screen") || "");
      var href = s(target.getAttribute("href") || "");

      if (/AI企業を表示|AI企業設定|会社ダッシュボード|会社変更|部門詳細|課詳細|組織|部門|課/.test(label + " " + ds + " " + href)) {
        var company = syncCompanyContext("before-company-or-org-click", bestVisibleCompanySelect());
        log("company-org-click", {
          label: label,
          dataScreen: ds,
          href: href,
          company_id: company.company_id,
          company_name: company.company_name
        });

        setTimeout(function () { syncCompanyContext("after-company-or-org-click-100ms"); }, 100);
        setTimeout(function () { syncCompanyContext("after-company-or-org-click-700ms"); }, 700);
        setTimeout(function () { syncCompanyContext("after-company-or-org-click-1600ms"); }, 1600);
      }
    }, true);

    window.addEventListener("aicm:company-context-refresh", function () {
      syncCompanyContext("manual-refresh-event");
    });
  }

  function startup() {
    syncCompanyContext("startup");
    setTimeout(function () { syncCompanyContext("startup-250ms"); }, 250);
    setTimeout(function () { syncCompanyContext("startup-1000ms"); }, 1000);
    setTimeout(function () { syncCompanyContext("startup-2500ms"); }, 2500);
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startup);
  } else {
    startup();
  }

  window.AICMSelectedCompanyOrganizationBridge = {
    sync: function () { return syncCompanyContext("manual-window-sync"); },
    current: function () { return currentCompany(bestVisibleCompanySelect()); },
    visibleCompanySelects: visibleCompanySelects,
    visibleCompanyOptions: function () {
      var select = bestVisibleCompanySelect();
      if (!select) return [];
      return Array.prototype.slice.call(select.options || []).map(function (opt) {
        return {
          value: opt.value,
          label: textOf(opt),
          selected: opt.selected
        };
      });
    },
    log: function () {
      return (window.__AICM_SELECTED_COMPANY_ORG_BRIDGE_LOG || []).slice();
    }
  };
})();
