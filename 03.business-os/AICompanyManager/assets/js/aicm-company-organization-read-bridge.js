(function () {
  "use strict";

  var MARK = "__AICM_COMPANY_ORGANIZATION_READ_BRIDGE_ADW_ADZ_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var state = {
    companies: [],
    organizations: [],
    selectedCompanyId: "",
    selectedCompanyName: "",
    loaded: false
  };

  function s(value) {
    return String(value == null ? "" : value);
  }

  function esc(value) {
    return s(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function textOf(el) {
    if (!el) return "";
    return s(el.innerText || el.textContent || el.value || (el.getAttribute && el.getAttribute("aria-label")) || "").replace(/\s+/g, " ").trim();
  }

  function log(type, detail) {
    window.__AICM_COMPANY_ORG_READ_BRIDGE_LOG = window.__AICM_COMPANY_ORG_READ_BRIDGE_LOG || [];
    window.__AICM_COMPANY_ORG_READ_BRIDGE_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_COMPANY_ORG_READ_BRIDGE_LOG.length > 160) {
      window.__AICM_COMPANY_ORG_READ_BRIDGE_LOG.shift();
    }
  }

  function isPlaceholder(value) {
    var v = s(value).trim();
    return !v || v === "選択してください" || v === "company" || v === "会社" || v === "BusinessOSなんちゃら";
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
        var safeId = select.id.replace(/'/g, "\\'");
        var label = document.querySelector("label[for='" + safeId + "']");
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
    if (/AI企業/.test(label)) score += 70;
    if (/会社/.test(label)) score += 30;
    if (/company/i.test(label)) score += 10;
    if ((select.options || []).length > 1) score += 20;
    return score;
  }

  function bestCompanySelect() {
    var list = visibleCompanySelects();
    if (!list.length) return null;
    list.sort(function (a, b) { return scoreSelect(b) - scoreSelect(a); });
    return list[0];
  }

  function validCompanies(companies) {
    return (companies || []).filter(function (c) {
      return !isPlaceholder(c.company_id) && !isPlaceholder(c.company_name);
    });
  }

  async function getJson(url) {
    var res = await fetch(url, { cache: "no-store" });
    var text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error("JSON parse failed: " + text.slice(0, 200));
    }
  }

  async function loadCompanies() {
    var data = await getJson("/api/aicm/companies?v=" + Date.now());
    state.companies = validCompanies(data.companies || []);
    state.loaded = true;
    log("companies-loaded", {
      count: state.companies.length,
      table: data.table || "",
      server_mark: data.server_mark || ""
    });
    return state.companies;
  }

  async function loadOrganizations(companyId) {
    if (isPlaceholder(companyId)) {
      state.organizations = [];
      renderOrganizationPanel("invalid-company-id");
      return [];
    }

    var data = await getJson("/api/aicm/company-organizations?company_id=" + encodeURIComponent(companyId) + "&v=" + Date.now());
    state.organizations = data.organizations || [];
    log("organizations-loaded", {
      company_id: companyId,
      count: state.organizations.length,
      tables: data.table_candidates || []
    });
    renderOrganizationPanel("organizations-loaded");
    return state.organizations;
  }

  function removePlaceholderOptions(select) {
    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      var value = s(opt.value).trim();
      var label = textOf(opt);
      if (isPlaceholder(value) || isPlaceholder(label)) {
        opt.remove();
      }
    });
  }

  function populateCompanySelect(select, companies) {
    if (!select || !companies || !companies.length) return;

    var before = select.value;
    if (isPlaceholder(before)) before = "";

    removePlaceholderOptions(select);

    var existingById = {};
    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      existingById[s(opt.value)] = opt;
    });

    companies.forEach(function (c) {
      if (existingById[c.company_id]) {
        existingById[c.company_id].textContent = c.company_name;
        existingById[c.company_id].setAttribute("data-business-domain", c.business_domain || "");
        return;
      }

      var opt = document.createElement("option");
      opt.value = c.company_id;
      opt.textContent = c.company_name;
      opt.setAttribute("data-business-domain", c.business_domain || "");
      select.appendChild(opt);
    });

    var next = before;
    if (!next || !Array.prototype.slice.call(select.options || []).some(function (o) { return o.value === next; })) {
      next = companies[0].company_id;
    }

    select.value = next;
  }

  function companyById(id) {
    return state.companies.filter(function (c) { return s(c.company_id) === s(id); })[0] || null;
  }

  function currentCompanyFromSelect() {
    var select = bestCompanySelect();
    if (select && !isPlaceholder(select.value)) {
      var c = companyById(select.value);
      if (c) return c;

      var opt = select.options[select.selectedIndex];
      return {
        company_id: select.value,
        company_name: textOf(opt) || select.value,
        business_domain: opt ? s(opt.getAttribute("data-business-domain") || "") : ""
      };
    }

    if (state.companies.length) return state.companies[0];

    return null;
  }

  function setGlobalCompany(company, reason) {
    if (!company || isPlaceholder(company.company_id)) return null;

    state.selectedCompanyId = company.company_id;
    state.selectedCompanyName = company.company_name || company.company_id;

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
      localStorage.setItem("aicm.currentCompanyId", company.company_id);
      localStorage.setItem("aicm.currentCompanyName", company.company_name || "");
      localStorage.setItem("aicm.currentCompanyDomain", company.business_domain || "");
      sessionStorage.setItem("aicm.currentCompanyId", company.company_id);
      sessionStorage.setItem("aicm.currentCompanyName", company.company_name || "");
      sessionStorage.setItem("aicm.currentCompanyDomain", company.business_domain || "");
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

    updateBanner(company, reason);
    syncCompatFields(company);

    try {
      window.dispatchEvent(new CustomEvent("aicm:company-context-changed", {
        detail: { company: company, reason: reason || "unknown" }
      }));
      document.dispatchEvent(new CustomEvent("aicm:company-context-changed", {
        detail: { company: company, reason: reason || "unknown" }
      }));
    } catch (_) {}

    log("global-company-set", {
      reason: reason || "",
      company_id: company.company_id,
      company_name: company.company_name
    });

    return company;
  }

  function syncCompatFields(company) {
    if (!company) return;

    Array.prototype.slice.call(document.querySelectorAll("select")).forEach(function (select) {
      if (!isInsideCompatRoot(select)) return;

      var exists = Array.prototype.slice.call(select.options || []).some(function (opt) {
        return opt.value === company.company_id;
      });

      if (!exists) {
        var opt = document.createElement("option");
        opt.value = company.company_id;
        opt.textContent = company.company_name || company.company_id;
        select.appendChild(opt);
      }

      select.value = company.company_id;
    });

    Array.prototype.slice.call(document.querySelectorAll("input, textarea")).forEach(function (input) {
      var key = [input.id, input.name, input.getAttribute("data-aicm-compat-field")].join(" ").toLowerCase();
      if (isInsideCompatRoot(input) || input.type === "hidden") {
        if (/company.*id|company_id|businessos_company_id/.test(key)) input.value = company.company_id;
        if (/company.*name|company_name/.test(key)) input.value = company.company_name || "";
        if (/business.*domain|business_domain|domain/.test(key)) input.value = company.business_domain || "";
      }
    });
  }

  function updateBanner(company, reason) {
    if (!document.body || !company) return;

    var banner = document.getElementById("aicm-selected-company-context-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "aicm-selected-company-context-banner";
      banner.style.cssText = [
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
      if (root.firstChild) root.insertBefore(banner, root.firstChild);
      else root.appendChild(banner);
    }

    banner.textContent =
      "選択中AI企業: " + (company.company_name || company.company_id) +
      " / company_id=" + company.company_id +
      " / 組織=" + state.organizations.length +
      "件 / reason=" + (reason || "unknown");
  }

  function findInsertTarget() {
    var root = document.getElementById("aicm-root") || document.body;
    var headings = Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3"));
    for (var i = 0; i < headings.length; i += 1) {
      var t = textOf(headings[i]);
      if (/会社概要|会社ダッシュボード|AI企業設定|部門|組織/.test(t)) {
        var card = headings[i].closest("section,article,div,main");
        if (card && card.parentElement) return { parent: card.parentElement, after: card };
      }
    }
    return { parent: root, after: null };
  }

  function renderOrganizationPanel(reason) {
    var company = companyById(state.selectedCompanyId) || currentCompanyFromSelect();
    if (!company) return;

    var panel = document.getElementById("aicm-selected-company-organization-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "aicm-selected-company-organization-panel";
      panel.style.cssText = [
        "background:#ffffff",
        "border:1px solid #e2e8f0",
        "border-radius:18px",
        "padding:16px",
        "margin:14px 8px",
        "box-shadow:0 4px 14px rgba(15,23,42,.06)",
        "font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
      ].join(";");

      var pos = findInsertTarget();
      if (pos.after && pos.after.nextSibling) pos.parent.insertBefore(panel, pos.after.nextSibling);
      else pos.parent.appendChild(panel);
    }

    var rows = state.organizations || [];
    var body = "";

    if (!rows.length) {
      body = [
        "<p style='color:#64748b;line-height:1.6;'>",
        "選択中AI企業の部門・課・組織がまだ取得できていません。",
        "</p>",
        "<p style='color:#64748b;font-size:12px;'>company_id=" + esc(company.company_id) + " / reason=" + esc(reason || "") + "</p>"
      ].join("");
    } else {
      body = rows.map(function (r) {
        return [
          "<article style='border-left:4px solid #cbd5e1;padding:10px 0 10px 12px;margin:10px 0;'>",
          "<h3 style='margin:0 0 6px;font-size:18px;color:#0f172a;'>" + esc(r.organization_name || r.name || r.organization_id) + "</h3>",
          r.description ? "<p style='margin:0 0 6px;color:#64748b;line-height:1.6;'>" + esc(r.description) + "</p>" : "",
          "<p style='margin:0;color:#64748b;font-size:12px;'>source=" + esc(r.source_table || "") + " / id=" + esc(r.organization_id || "") + "</p>",
          "</article>"
        ].join("");
      }).join("");
    }

    panel.innerHTML = [
      "<h2 style='margin:0 0 10px;font-size:24px;color:#0f172a;'>選択AI企業の組織</h2>",
      "<p style='margin:0 0 10px;color:#475569;'>会社: <strong>" + esc(company.company_name || company.company_id) + "</strong></p>",
      body
    ].join("");

    updateBanner(company, "render-org-panel-" + (reason || ""));
  }

  async function refreshAll(reason) {
    try {
      await loadCompanies();

      var select = bestCompanySelect();
      if (select) {
        populateCompanySelect(select, state.companies);
      }

      var company = currentCompanyFromSelect();
      if (!company) {
        renderOrganizationPanel("no-company");
        return;
      }

      setGlobalCompany(company, reason || "refresh");
      await loadOrganizations(company.company_id);
      setGlobalCompany(company, reason || "refresh-after-org-load");
    } catch (err) {
      log("refresh-error", { message: s(err && err.message || err) });
      renderOrganizationPanel("refresh-error");
    }
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      var target = ev.target;
      if (target && target.tagName === "SELECT" && isCompanySelect(target) && !isInsideCompatRoot(target)) {
        var company = currentCompanyFromSelect();
        if (company) {
          setGlobalCompany(company, "company-select-change");
          loadOrganizations(company.company_id).then(function () {
            setGlobalCompany(company, "company-select-change-after-org-load");
          });
        }
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var target = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button'], [data-screen]") : null;
      if (!target) return;

      var label = textOf(target);
      var ds = s(target.getAttribute("data-screen") || "");
      var href = s(target.getAttribute("href") || "");

      if (/AI企業を表示|AI企業設定|会社ダッシュボード|会社変更|部門|課|組織/.test(label + " " + ds + " " + href)) {
        setTimeout(function () { refreshAll("after-click-200ms"); }, 200);
        setTimeout(function () { refreshAll("after-click-1000ms"); }, 1000);
      }
    }, true);

    window.addEventListener("aicm:company-context-refresh", function () {
      refreshAll("manual-event");
    });
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      refreshAll("DOMContentLoaded");
      setTimeout(function () { refreshAll("DOMContentLoaded-1200ms"); }, 1200);
    });
  } else {
    refreshAll("ready");
    setTimeout(function () { refreshAll("ready-1200ms"); }, 1200);
  }

  window.AICMCompanyOrganizationReadBridge = {
    refresh: function () { return refreshAll("manual-window-refresh"); },
    state: state,
    companies: function () { return state.companies.slice(); },
    organizations: function () { return state.organizations.slice(); },
    current: function () { return currentCompanyFromSelect(); },
    visibleCompanySelects: visibleCompanySelects,
    log: function () {
      return (window.__AICM_COMPANY_ORG_READ_BRIDGE_LOG || []).slice();
    }
  };
})();
