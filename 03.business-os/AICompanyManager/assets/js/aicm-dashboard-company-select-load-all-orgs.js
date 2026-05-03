(function () {
  "use strict";

  var MARK = "__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_AEI_AEL_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var state = {
    companies: [],
    orgsByCompany: {},
    currentCompany: null,
    lastReason: ""
  };

  function s(v) {
    return String(v == null ? "" : v);
  }

  function esc(v) {
    return s(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function textOf(el) {
    if (!el) return "";
    return s(el.innerText || el.textContent || el.value || (el.getAttribute && el.getAttribute("aria-label")) || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function log(type, detail) {
    window.__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_LOG =
      window.__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_LOG || [];
    window.__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_LOG.length > 200) {
      window.__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_LOG.shift();
    }
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

  function removeBadPanels() {
    [
      "aicm-selected-company-context-banner",
      "aicm-selected-company-organization-panel",
      "aicm-exact-selected-company-organizations",
      "aicm-white-screen-rescue-panel"
    ].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.remove();
    });
  }

  function smallestCardContaining(words) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("section, article, form, div, main"));
    var hits = [];

    nodes.forEach(function (node) {
      if (!isVisible(node)) return;
      var t = textOf(node);
      var ok = words.every(function (w) { return t.indexOf(w) >= 0; });
      if (ok) hits.push({ node: node, len: t.length });
    });

    hits.sort(function (a, b) { return a.len - b.len; });
    return hits.length ? hits[0].node : null;
  }

  function findDashboardCompanyCard() {
    // 正本: AI企業選択カードだけ。
    // Presidentロボット等の「選択してください」は絶対に対象外。
    return smallestCardContaining(["AI企業選択", "AI企業を表示"]);
  }

  function findDashboardCompanySelect() {
    var card = findDashboardCompanyCard();
    if (!card) return null;
    var selects = Array.prototype.slice.call(card.querySelectorAll("select")).filter(isVisible);
    return selects[0] || null;
  }

  function findDashboardShowButton() {
    var card = findDashboardCompanyCard();
    if (!card) return null;
    var buttons = Array.prototype.slice.call(card.querySelectorAll("button, a, [role='button']")).filter(isVisible);
    for (var i = 0; i < buttons.length; i += 1) {
      if (textOf(buttons[i]).indexOf("AI企業を表示") >= 0) return buttons[i];
    }
    return null;
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

  function normalizeCompanies(rows) {
    var out = [];
    var seen = {};

    (rows || []).forEach(function (c) {
      var id = s(c.company_id).trim();
      var name = s(c.company_name).trim();
      if (isPlaceholder(id) || isPlaceholder(name)) return;
      if (seen[id]) return;
      seen[id] = true;
      out.push({
        company_id: id,
        company_name: name,
        business_domain: s(c.business_domain || "")
      });
    });

    return out;
  }

  async function loadCompanies() {
    try {
      var data = await getJson("/api/aicm/companies?v=" + Date.now());
      state.companies = normalizeCompanies(data.companies || []);
      log("companies-loaded", {
        count: state.companies.length,
        table: data.table || "",
        server_mark: data.server_mark || ""
      });
      populateDashboardCompanySelect();
      return state.companies;
    } catch (err) {
      log("companies-load-failed", { message: s(err && err.message || err) });
      return [];
    }
  }

  function companyById(id) {
    for (var i = 0; i < state.companies.length; i += 1) {
      if (state.companies[i].company_id === id) return state.companies[i];
    }
    return null;
  }

  function populateDashboardCompanySelect() {
    var select = findDashboardCompanySelect();
    if (!select || !state.companies.length) {
      log("populate-dashboard-select-skipped", {
        hasSelect: !!select,
        companyCount: state.companies.length
      });
      return;
    }

    var old = select.value;
    if (isPlaceholder(old)) old = "";

    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      var v = s(opt.value).trim();
      var t = textOf(opt);
      if (isPlaceholder(v) || isPlaceholder(t)) opt.remove();
    });

    var exists = {};
    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      exists[opt.value] = opt;
    });

    state.companies.forEach(function (c) {
      if (exists[c.company_id]) {
        exists[c.company_id].textContent = c.company_name;
        exists[c.company_id].setAttribute("data-business-domain", c.business_domain || "");
      } else {
        var opt = document.createElement("option");
        opt.value = c.company_id;
        opt.textContent = c.company_name;
        opt.setAttribute("data-business-domain", c.business_domain || "");
        select.appendChild(opt);
      }
    });

    if (old && companyById(old)) {
      select.value = old;
    } else if (!companyById(select.value) && state.companies[0]) {
      select.value = state.companies[0].company_id;
    }

    log("dashboard-company-select-populated", {
      value: select.value,
      optionCount: select.options.length
    });
  }

  function currentCompanyFromDashboardSelect() {
    var select = findDashboardCompanySelect();
    if (!select) return null;
    if (isPlaceholder(select.value)) return null;

    var c = companyById(select.value);
    if (c) return c;

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

  function setGlobalCompany(c, reason) {
    if (!c || isPlaceholder(c.company_id) || isPlaceholder(c.company_name)) return null;

    state.currentCompany = c;
    state.lastReason = reason || "";

    window.AICM_CURRENT_COMPANY_ID = c.company_id;
    window.AICM_CURRENT_COMPANY_NAME = c.company_name;
    window.AICM_CURRENT_COMPANY_DOMAIN = c.business_domain || "";

    window.aicmCurrentCompany = {
      company_id: c.company_id,
      company_name: c.company_name,
      business_domain: c.business_domain || ""
    };

    window.aicmSelectedCompany = {
      company_id: c.company_id,
      company_name: c.company_name,
      business_domain: c.business_domain || ""
    };

    try {
      localStorage.setItem("aicm.currentCompanyId", c.company_id);
      localStorage.setItem("aicm.currentCompanyName", c.company_name);
      localStorage.setItem("aicm.currentCompanyDomain", c.business_domain || "");
      sessionStorage.setItem("aicm.currentCompanyId", c.company_id);
      sessionStorage.setItem("aicm.currentCompanyName", c.company_name);
      sessionStorage.setItem("aicm.currentCompanyDomain", c.business_domain || "");
    } catch (_) {}

    if (document.body) {
      document.body.setAttribute("data-aicm-current-company-id", c.company_id);
      document.body.setAttribute("data-aicm-current-company-name", c.company_name);
    }

    var root = document.getElementById("aicm-root");
    if (root) {
      root.setAttribute("data-aicm-current-company-id", c.company_id);
      root.setAttribute("data-aicm-current-company-name", c.company_name);
    }

    log("global-company-set", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name
    });

    return c;
  }

  async function loadAllOrganizationsForCompany(c, reason) {
    if (!c || isPlaceholder(c.company_id)) return [];

    try {
      var data = await getJson("/api/aicm/company-organizations?company_id=" + encodeURIComponent(c.company_id) + "&v=" + Date.now());
      var rows = Array.isArray(data.organizations) ? data.organizations : [];
      state.orgsByCompany[c.company_id] = rows;

      log("all-organizations-loaded-for-company", {
        reason: reason || "",
        company_id: c.company_id,
        company_name: c.company_name,
        count: rows.length,
        table_candidates: data.table_candidates || []
      });

      return rows;
    } catch (err) {
      log("all-organizations-load-failed", {
        company_id: c.company_id,
        message: s(err && err.message || err)
      });
      state.orgsByCompany[c.company_id] = [];
      return [];
    }
  }

  function findCompanyOverviewCard() {
    return smallestCardContaining(["会社概要"]);
  }

  function findCompanyEditCard() {
    return smallestCardContaining(["会社", "変更", "会社名", "事業領域"]) ||
      smallestCardContaining(["会社名", "事業領域"]);
  }

  function replaceKnownStaleText(root, c) {
    if (!root || !c) return 0;

    var count = 0;
    var staleNames = [
      "Ai System Integrated Corporation",
      "AI System Integrated Corporation",
      "選択してください"
    ];
    var staleDomains = [
      "AI 機器、アプリの開発、保守、運用あ",
      "AI 機器、アプリの開発、保守、運用"
    ];

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var t = s(node.nodeValue || "");
        if (!t.trim()) return NodeFilter.FILTER_REJECT;

        var hit = false;
        staleNames.concat(staleDomains).forEach(function (x) {
          if (x && t.indexOf(x) >= 0) hit = true;
        });

        return hit ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var before = node.nodeValue;
      var after = before;

      staleNames.forEach(function (x) {
        after = after.split(x).join(c.company_name);
      });

      if (c.business_domain) {
        staleDomains.forEach(function (x) {
          after = after.split(x).join(c.business_domain);
        });
      }

      if (after !== before) {
        node.nodeValue = after;
        count += 1;
      }
    }

    return count;
  }

  function syncCompanyOverview(c) {
    var card = findCompanyOverviewCard();
    if (!card || !c) return 0;

    var count = replaceKnownStaleText(card, c);
    card.setAttribute("data-aicm-selected-company-id", c.company_id);
    card.setAttribute("data-aicm-selected-company-name", c.company_name);

    var exact = card.querySelector("[data-aicm-dashboard-selected-company-summary='true']");
    if (!exact) {
      exact = document.createElement("div");
      exact.setAttribute("data-aicm-dashboard-selected-company-summary", "true");
      exact.style.cssText = "margin-top:10px;padding:10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;";
      card.appendChild(exact);
    }

    exact.innerHTML =
      "<strong>" + esc(c.company_name) + "</strong><br>" +
      "<span style='color:#64748b;'>" + esc(c.business_domain || "") + "</span><br>" +
      "<code style='font-size:11px;color:#64748b;'>" + esc(c.company_id) + "</code>";

    return count + 1;
  }

  function syncCompanyEditForm(c) {
    var card = findCompanyEditCard();
    if (!card || !c) return 0;

    var count = replaceKnownStaleText(card, c);

    Array.prototype.slice.call(card.querySelectorAll("input, textarea")).forEach(function (field) {
      var label = textOf(field.previousElementSibling) + " " + textOf(field.parentElement) + " " + s(field.id) + " " + s(field.name);

      if (/会社名|company_name|companyName/i.test(label)) {
        field.value = c.company_name;
        field.setAttribute("data-aicm-dashboard-company-synced", "company_name");
        count += 1;
      } else if (/事業領域|business_domain|businessDomain|domain|business_area/i.test(label)) {
        field.value = c.business_domain || "";
        field.setAttribute("data-aicm-dashboard-company-synced", "business_domain");
        count += 1;
      } else if (/company_id|companyId/i.test(label)) {
        field.value = c.company_id;
        field.setAttribute("data-aicm-dashboard-company-synced", "company_id");
        count += 1;
      }
    });

    card.setAttribute("data-aicm-selected-company-id", c.company_id);
    card.setAttribute("data-aicm-selected-company-name", c.company_name);

    return count;
  }

  function renderOrganizationPanel(c, orgs, reason) {
    if (!c) return;

    var panel = document.getElementById("aicm-dashboard-selected-company-all-organizations");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "aicm-dashboard-selected-company-all-organizations";
      panel.style.cssText = [
        "background:#ffffff",
        "border:1px solid #e2e8f0",
        "border-radius:18px",
        "padding:16px",
        "margin:14px 8px",
        "box-shadow:0 4px 14px rgba(15,23,42,.06)",
        "font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
      ].join(";");

      var overview = findCompanyOverviewCard();
      if (overview && overview.parentElement) {
        overview.parentElement.insertBefore(panel, overview.nextSibling);
      } else {
        var root = document.getElementById("aicm-root") || document.body;
        root.appendChild(panel);
      }
    }

    var rows = Array.isArray(orgs) ? orgs : [];
    var body = "";

    if (!rows.length) {
      body =
        "<p style='color:#64748b;line-height:1.6;'>選択した会社に紐づく部門・課・組織が取得できていません。</p>" +
        "<p style='color:#64748b;font-size:12px;'>company_id=" + esc(c.company_id) + " / reason=" + esc(reason || "") + "</p>";
    } else {
      body = rows.map(function (r) {
        return [
          "<article style='border-left:4px solid #cbd5e1;padding:10px 0 10px 12px;margin:10px 0;'>",
          "<h3 style='margin:0 0 6px;font-size:18px;color:#0f172a;'>" + esc(r.organization_name || r.name || r.organization_id || "") + "</h3>",
          r.description ? "<p style='margin:0 0 6px;color:#64748b;line-height:1.6;'>" + esc(r.description) + "</p>" : "",
          "<p style='margin:0;color:#64748b;font-size:12px;'>source=" + esc(r.source_table || "") + " / id=" + esc(r.organization_id || "") + "</p>",
          "</article>"
        ].join("");
      }).join("");
    }

    panel.innerHTML = [
      "<h2 style='margin:0 0 10px;font-size:24px;color:#0f172a;'>選択AI企業の組織</h2>",
      "<p style='margin:0 0 10px;color:#475569;'>会社: <strong>" + esc(c.company_name) + "</strong></p>",
      "<p style='margin:0 0 10px;color:#64748b;font-size:12px;'>company_id=" + esc(c.company_id) + " / 組織=" + rows.length + "件 / reason=" + esc(reason || "") + "</p>",
      body
    ].join("");
  }

  async function syncSelectedCompanyAndLoadAllOrgs(reason) {
    removeBadPanels();

    if (!state.companies.length) {
      await loadCompanies();
    } else {
      populateDashboardCompanySelect();
    }

    var c = currentCompanyFromDashboardSelect();

    if (!c) {
      log("sync-skipped-no-dashboard-company", { reason: reason || "" });
      return null;
    }

    setGlobalCompany(c, reason);
    syncCompanyOverview(c);
    syncCompanyEditForm(c);

    var orgs = await loadAllOrganizationsForCompany(c, reason);
    renderOrganizationPanel(c, orgs, reason);

    // 旧UIが後から再描画するので、少し遅らせてもう一度表示同期。
    setTimeout(function () {
      syncCompanyOverview(c);
      syncCompanyEditForm(c);
      renderOrganizationPanel(c, state.orgsByCompany[c.company_id] || [], reason + "-late");
    }, 600);

    setTimeout(function () {
      syncCompanyOverview(c);
      syncCompanyEditForm(c);
      renderOrganizationPanel(c, state.orgsByCompany[c.company_id] || [], reason + "-late2");
    }, 1600);

    return c;
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      if (ev.target && ev.target === findDashboardCompanySelect()) {
        syncSelectedCompanyAndLoadAllOrgs("dashboard-company-select-change");
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button']") : null;
      if (!btn) return;

      if (btn === findDashboardShowButton() || textOf(btn).indexOf("AI企業を表示") >= 0) {
        setTimeout(function () {
          syncSelectedCompanyAndLoadAllOrgs("dashboard-ai-company-show-click");
        }, 0);
      }

      if (/AI企業設定|会社変更|会社を変更|会社ダッシュボード/.test(textOf(btn))) {
        setTimeout(function () { syncSelectedCompanyAndLoadAllOrgs("company-related-click-300ms"); }, 300);
      }
    }, true);
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadCompanies().then(function () {
        syncSelectedCompanyAndLoadAllOrgs("DOMContentLoaded");
      });
    });
  } else {
    loadCompanies().then(function () {
      syncSelectedCompanyAndLoadAllOrgs("ready");
    });
  }

  window.AICMDashboardCompanySelectLoadAllOrgs = {
    refresh: function () { return syncSelectedCompanyAndLoadAllOrgs("manual-window-refresh"); },
    state: state,
    findDashboardCompanySelect: findDashboardCompanySelect,
    findDashboardCompanyCard: findDashboardCompanyCard,
    current: function () { return state.currentCompany || currentCompanyFromDashboardSelect(); },
    companies: function () { return state.companies.slice(); },
    organizations: function () {
      var c = state.currentCompany;
      if (!c) return [];
      return (state.orgsByCompany[c.company_id] || []).slice();
    },
    log: function () {
      return (window.__AICM_DASHBOARD_COMPANY_SELECT_LOAD_ALL_ORGS_LOG || []).slice();
    }
  };
})();
