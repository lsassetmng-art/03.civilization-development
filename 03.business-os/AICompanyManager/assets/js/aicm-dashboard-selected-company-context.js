(function () {
  "use strict";

  var MARK = "__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_AFC_AFJ_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var STORAGE_KEY = "AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_V1";

  var context = {
    loaded: false,
    source: "",
    selected_company_id: "",
    company: null,
    departments: [],
    organizations: [],
    loaded_at: "",
    last_reason: ""
  };

  function s(v) {
    return String(v == null ? "" : v);
  }

  function textOf(el) {
    if (!el) return "";
    return s(el.innerText || el.textContent || el.value || (el.getAttribute && el.getAttribute("aria-label")) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isPlaceholder(v) {
    var x = s(v).trim();
    return !x || x === "選択してください" || x === "company" || x === "会社" || x === "BusinessOSなんちゃら";
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    try {
      var st = window.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return false;
      var r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return false;
    } catch (_) {}
    return true;
  }

  function log(type, detail) {
    window.__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_LOG =
      window.__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_LOG || [];
    window.__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_LOG.length > 200) {
      window.__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_LOG.shift();
    }
  }

  function normalizeCompany(c) {
    if (!c) return null;

    var id = s(c.company_id || c.id).trim();
    var name = s(c.company_name || c.name || c.display_name).trim();

    if (isPlaceholder(id) || isPlaceholder(name)) return null;

    return {
      company_id: id,
      id: id,
      company_name: name,
      name: name,
      business_domain: s(c.business_domain || c.business_area || c.domain || ""),
      company_common_rules: Array.isArray(c.company_common_rules) ? c.company_common_rules : [],
      president_robot_id: c.president_robot_id || "",
      president_internal_name: c.president_internal_name || ""
    };
  }

  function saveContext(reason) {
    context.loaded = true;
    context.loaded_at = new Date().toISOString();
    context.last_reason = reason || "";

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
      localStorage.setItem("aicm.currentCompanyId", context.selected_company_id || "");
      localStorage.setItem("aicm.currentCompanyName", context.company ? context.company.company_name : "");
      localStorage.setItem("aicm.currentCompanyDomain", context.company ? context.company.business_domain : "");
      sessionStorage.setItem("aicm.currentCompanyId", context.selected_company_id || "");
      sessionStorage.setItem("aicm.currentCompanyName", context.company ? context.company.company_name : "");
      sessionStorage.setItem("aicm.currentCompanyDomain", context.company ? context.company.business_domain : "");
    } catch (_) {}

    window.AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT = context;
    window.AICM_CURRENT_COMPANY_ID = context.selected_company_id || "";
    window.AICM_CURRENT_COMPANY_NAME = context.company ? context.company.company_name : "";
    window.AICM_CURRENT_COMPANY_DOMAIN = context.company ? context.company.business_domain : "";

    window.aicmCurrentCompany = context.company;
    window.aicmSelectedCompany = context.company;

    if (document.body) {
      document.body.setAttribute("data-aicm-current-company-id", context.selected_company_id || "");
      document.body.setAttribute("data-aicm-current-company-name", context.company ? context.company.company_name : "");
    }

    log("context-saved", {
      reason: reason || "",
      company_id: context.selected_company_id,
      company_name: context.company ? context.company.company_name : "",
      departments: context.departments.length,
      organizations: context.organizations.length
    });
  }

  function loadStoredContext() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY) || "";
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.company || isPlaceholder(parsed.selected_company_id)) return null;

      context = {
        loaded: true,
        source: parsed.source || "storage",
        selected_company_id: parsed.selected_company_id,
        company: parsed.company,
        departments: Array.isArray(parsed.departments) ? parsed.departments : [],
        organizations: Array.isArray(parsed.organizations) ? parsed.organizations : [],
        loaded_at: parsed.loaded_at || "",
        last_reason: parsed.last_reason || "storage"
      };

      window.AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT = context;
      window.AICM_CURRENT_COMPANY_ID = context.selected_company_id || "";
      window.AICM_CURRENT_COMPANY_NAME = context.company ? context.company.company_name : "";
      window.AICM_CURRENT_COMPANY_DOMAIN = context.company ? context.company.business_domain : "";
      window.aicmCurrentCompany = context.company;
      window.aicmSelectedCompany = context.company;

      log("context-loaded-from-storage", {
        company_id: context.selected_company_id,
        company_name: context.company ? context.company.company_name : ""
      });

      return context;
    } catch (err) {
      log("context-storage-load-failed", { message: s(err && err.message || err) });
      return null;
    }
  }

  function findDashboardCompanyCard() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("section, article, form, div"));
    var hits = [];

    nodes.forEach(function (node) {
      if (!isVisible(node)) return;
      var t = textOf(node);
      if (t.indexOf("AI企業選択") >= 0 && t.indexOf("AI企業を表示") >= 0) {
        hits.push({ node: node, len: t.length });
      }
    });

    hits.sort(function (a, b) { return a.len - b.len; });
    return hits.length ? hits[0].node : null;
  }

  function findDashboardCompanySelect() {
    var card = findDashboardCompanyCard();
    if (!card) return null;
    var selects = Array.prototype.slice.call(card.querySelectorAll("select")).filter(isVisible);
    return selects[0] || null;
  }

  async function getJson(url) {
    var res = await fetch(url, { cache: "no-store" });
    var txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch (err) {
      throw new Error("JSON parse failed: " + txt.slice(0, 300));
    }
  }

  async function loadCompanyList() {
    var data = await getJson("/api/aicm/companies?v=" + Date.now());
    return (data.companies || []).map(normalizeCompany).filter(Boolean);
  }

  async function loadOrganizations(companyId) {
    if (isPlaceholder(companyId)) return [];
    var data = await getJson("/api/aicm/company-organizations?company_id=" + encodeURIComponent(companyId) + "&v=" + Date.now());
    return Array.isArray(data.organizations) ? data.organizations : [];
  }

  function populateDashboardSelect(companies) {
    var select = findDashboardCompanySelect();
    if (!select || !companies || !companies.length) return;

    var old = select.value;
    if (isPlaceholder(old)) old = "";

    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      if (isPlaceholder(opt.value) || isPlaceholder(textOf(opt))) opt.remove();
    });

    var exists = {};
    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      exists[opt.value] = opt;
    });

    companies.forEach(function (c) {
      var opt = exists[c.company_id];
      if (!opt) {
        opt = document.createElement("option");
        opt.value = c.company_id;
        select.appendChild(opt);
      }
      opt.textContent = c.company_name;
      opt.setAttribute("data-business-domain", c.business_domain || "");
    });

    var storedId = context && context.selected_company_id ? context.selected_company_id : "";

    if (old && companies.some(function (c) { return c.company_id === old; })) {
      select.value = old;
    } else if (storedId && companies.some(function (c) { return c.company_id === storedId; })) {
      select.value = storedId;
    } else {
      select.value = companies[0].company_id;
    }
  }

  async function dashboardReadAndHold(reason) {
    var companies = await loadCompanyList();
    populateDashboardSelect(companies);

    var select = findDashboardCompanySelect();
    var selectedId = select ? select.value : "";

    if (isPlaceholder(selectedId) && companies[0]) {
      selectedId = companies[0].company_id;
    }

    var company = companies.filter(function (c) { return c.company_id === selectedId; })[0] || companies[0] || null;
    company = normalizeCompany(company);

    if (!company) {
      log("dashboard-read-skipped-no-company", { reason: reason || "" });
      return null;
    }

    var orgs = await loadOrganizations(company.company_id);

    context = {
      loaded: true,
      source: "dashboard-db-read",
      selected_company_id: company.company_id,
      company: company,
      departments: orgs.filter(function (o) {
        return /department/i.test(s(o.source_table || "")) || s(o.organization_name || "").indexOf("部") >= 0;
      }),
      organizations: orgs,
      loaded_at: new Date().toISOString(),
      last_reason: reason || ""
    };

    saveContext(reason || "dashboard-read-and-hold");
    renderDashboardHeldContextPanel(reason || "dashboard-read-and-hold");

    return context;
  }

  function renderDashboardHeldContextPanel(reason) {
    var card = findDashboardCompanyCard();
    if (!card || !context.company) return;

    var panel = document.getElementById("aicm-dashboard-held-company-context-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "aicm-dashboard-held-company-context-panel";
      panel.style.cssText = "margin-top:12px;padding:12px;border-radius:14px;background:#ecfeff;border:1px solid #67e8f9;color:#164e63;";
      card.appendChild(panel);
    }

    panel.innerHTML =
      "<strong>保持中AI企業: " + context.company.company_name + "</strong><br>" +
      "<span>" + (context.company.business_domain || "事業領域なし") + "</span><br>" +
      "<span style='font-size:12px;'>company_id=" + context.company.company_id +
      " / 組織=" + context.organizations.length +
      "件 / reason=" + (reason || "") + "</span>";
  }

  function applyHeldContextToCurrentScreen(reason) {
    var held = context && context.company ? context : loadStoredContext();
    if (!held || !held.company) return null;

    window.AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT = held;
    window.AICM_CURRENT_COMPANY_ID = held.selected_company_id;
    window.AICM_CURRENT_COMPANY_NAME = held.company.company_name;
    window.AICM_CURRENT_COMPANY_DOMAIN = held.company.business_domain || "";
    window.aicmCurrentCompany = held.company;
    window.aicmSelectedCompany = held.company;

    log("held-context-applied-to-screen", {
      reason: reason || "",
      company_id: held.selected_company_id,
      company_name: held.company.company_name
    });

    return held;
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      if (ev.target && ev.target === findDashboardCompanySelect()) {
        dashboardReadAndHold("dashboard-company-select-change");
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button'], [data-screen]") : null;
      if (!btn) return;

      var label = textOf(btn);
      var screen = btn.getAttribute ? s(btn.getAttribute("data-screen") || "") : "";

      if (label.indexOf("AI企業を表示") >= 0) {
        dashboardReadAndHold("ai-company-show-click");
      }

      if (
        label.indexOf("AI企業設定") >= 0 ||
        label.indexOf("会社変更") >= 0 ||
        label.indexOf("会社を変更") >= 0 ||
        screen === "settings" ||
        screen === "department-detail" ||
        screen === "organization-detail"
      ) {
        applyHeldContextToCurrentScreen("before-screen-transition-" + (screen || label));
        setTimeout(function () { applyHeldContextToCurrentScreen("after-screen-transition-300ms"); }, 300);
        setTimeout(function () { applyHeldContextToCurrentScreen("after-screen-transition-1200ms"); }, 1200);
      }
    }, true);
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadStoredContext();
      setTimeout(function () {
        dashboardReadAndHold("DOMContentLoaded-initial-dashboard-read");
      }, 500);
    });
  } else {
    loadStoredContext();
    setTimeout(function () {
      dashboardReadAndHold("ready-initial-dashboard-read");
    }, 500);
  }

  window.AICMDashboardSelectedCompanyContext = {
    readAndHold: function () { return dashboardReadAndHold("manual-read-and-hold"); },
    apply: function () { return applyHeldContextToCurrentScreen("manual-apply"); },
    get: function () { return context; },
    log: function () {
      return (window.__AICM_DASHBOARD_SELECTED_COMPANY_CONTEXT_LOG || []).slice();
    }
  };
})();
