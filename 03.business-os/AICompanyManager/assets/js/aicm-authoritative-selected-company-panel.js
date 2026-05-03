(function () {
  "use strict";

  var MARK = "__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_AEM_AEP_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var state = {
    companies: [],
    currentCompany: null,
    organizations: [],
    editOpen: false,
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
    window.__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_LOG =
      window.__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_LOG || [];
    window.__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_LOG.length > 240) {
      window.__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_LOG.shift();
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
        table: data.table || ""
      });
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

  function smallestCardContaining(words) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("section, article, form, div, main"));
    var hits = [];

    nodes.forEach(function (node) {
      if (!isVisible(node)) return;
      if (node.id === "aicm-authoritative-selected-company-panel") return;
      var t = textOf(node);
      var ok = words.every(function (w) { return t.indexOf(w) >= 0; });
      if (ok) hits.push({ node: node, len: t.length });
    });

    hits.sort(function (a, b) { return a.len - b.len; });
    return hits.length ? hits[0].node : null;
  }

  function findDashboardCompanyCard() {
    return smallestCardContaining(["AI企業選択", "AI企業を表示"]);
  }

  function findDashboardCompanySelect() {
    var card = findDashboardCompanyCard();
    if (!card) return null;
    var selects = Array.prototype.slice.call(card.querySelectorAll("select")).filter(isVisible);
    return selects[0] || null;
  }

  function populateDashboardCompanySelect() {
    var select = findDashboardCompanySelect();
    if (!select || !state.companies.length) {
      log("populate-select-skipped", {
        hasSelect: !!select,
        companyCount: state.companies.length
      });
      return;
    }

    var old = select.value;
    if (isPlaceholder(old)) old = "";

    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      if (isPlaceholder(opt.value) || isPlaceholder(textOf(opt))) opt.remove();
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

    var storedId = "";
    try {
      storedId = localStorage.getItem("aicm.currentCompanyId") || sessionStorage.getItem("aicm.currentCompanyId") || "";
    } catch (_) {}

    if (old && companyById(old)) {
      select.value = old;
    } else if (storedId && companyById(storedId)) {
      select.value = storedId;
    } else if (!companyById(select.value) && state.companies[0]) {
      select.value = state.companies[0].company_id;
    }

    log("dashboard-select-populated", {
      value: select.value,
      optionCount: select.options.length
    });
  }

  function selectedCompanyFromDashboard() {
    var select = findDashboardCompanySelect();

    if (select && !isPlaceholder(select.value)) {
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
    }

    if (state.currentCompany && !isPlaceholder(state.currentCompany.company_id)) {
      return state.currentCompany;
    }

    if (state.companies[0]) return state.companies[0];

    return null;
  }

  function setCurrentCompany(c, reason) {
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

    log("current-company-set", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name
    });

    return c;
  }

  async function loadOrganizations(c) {
    if (!c || isPlaceholder(c.company_id)) {
      state.organizations = [];
      return [];
    }

    try {
      var data = await getJson("/api/aicm/company-organizations?company_id=" + encodeURIComponent(c.company_id) + "&v=" + Date.now());
      state.organizations = Array.isArray(data.organizations) ? data.organizations : [];
      log("organizations-loaded", {
        company_id: c.company_id,
        count: state.organizations.length
      });
      return state.organizations;
    } catch (err) {
      state.organizations = [];
      log("organizations-load-failed", {
        company_id: c.company_id,
        message: s(err && err.message || err)
      });
      return [];
    }
  }

  function removeBadInjectedPanels() {
    [
      "aicm-selected-company-context-banner",
      "aicm-selected-company-organization-panel",
      "aicm-exact-selected-company-organizations",
      "aicm-dashboard-selected-company-all-organizations",
      "aicm-white-screen-rescue-panel"
    ].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.remove();
    });
  }

  function hideStaleCompanyCards(c) {
    if (!c) return 0;

    var count = 0;
    var nodes = Array.prototype.slice.call(document.querySelectorAll("section, article, form, div"));

    nodes.forEach(function (node) {
      if (!isVisible(node)) return;
      if (node.id === "aicm-authoritative-selected-company-panel") return;
      if (node.closest && node.closest("#aicm-authoritative-selected-company-panel")) return;

      var t = textOf(node);
      var isDashboardSelect = t.indexOf("AI企業選択") >= 0 && t.indexOf("AI企業を表示") >= 0;
      if (isDashboardSelect) return;

      var stale =
        t.indexOf("Ai System Integrated Corporation") >= 0 ||
        t.indexOf("AI System Integrated Corporation") >= 0;

      var companyEditStale =
        t.indexOf("会社 変更") >= 0 &&
        t.indexOf(c.company_name) < 0 &&
        stale;

      var companyOverviewStale =
        t.indexOf("会社概要") >= 0 &&
        t.indexOf(c.company_name) < 0 &&
        stale;

      if (companyEditStale || companyOverviewStale) {
        node.style.display = "none";
        node.setAttribute("data-aicm-hidden-stale-company-card", "true");
        count += 1;
      }
    });

    return count;
  }

  function insertAfterDashboardCard(panel) {
    var dashboardCard = findDashboardCompanyCard();
    if (dashboardCard && dashboardCard.parentElement) {
      dashboardCard.parentElement.insertBefore(panel, dashboardCard.nextSibling);
      return;
    }

    var root = document.getElementById("aicm-root") || document.body;
    if (root.firstChild) root.insertBefore(panel, root.firstChild.nextSibling);
    else root.appendChild(panel);
  }

  function renderPanel(reason) {
    var c = state.currentCompany;
    if (!c) return;

    removeBadInjectedPanels();
    hideStaleCompanyCards(c);

    var panel = document.getElementById("aicm-authoritative-selected-company-panel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "aicm-authoritative-selected-company-panel";
      panel.style.cssText = [
        "background:#ffffff",
        "border:2px solid #38bdf8",
        "border-radius:18px",
        "padding:16px",
        "margin:14px 8px",
        "box-shadow:0 6px 20px rgba(15,23,42,.10)",
        "font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
      ].join(";");
      insertAfterDashboardCard(panel);
    }

    var orgs = state.organizations || [];
    var orgHtml = "";

    if (!orgs.length) {
      orgHtml =
        "<p style='color:#64748b;line-height:1.6;margin:8px 0;'>この会社に紐づく部門・課・組織は0件、または未取得です。</p>" +
        "<p style='color:#64748b;font-size:12px;margin:0;'>組織が0件でも、会社変更・削除ボタンは表示します。</p>";
    } else {
      orgHtml = orgs.map(function (r) {
        return [
          "<article style='border-left:4px solid #cbd5e1;padding:10px 0 10px 12px;margin:10px 0;'>",
          "<h3 style='margin:0 0 6px;font-size:18px;color:#0f172a;'>" + esc(r.organization_name || r.name || r.organization_id || "") + "</h3>",
          r.description ? "<p style='margin:0 0 6px;color:#64748b;line-height:1.6;'>" + esc(r.description) + "</p>" : "",
          "<p style='margin:0;color:#64748b;font-size:12px;'>source=" + esc(r.source_table || "") + " / id=" + esc(r.organization_id || "") + "</p>",
          "</article>"
        ].join("");
      }).join("");
    }

    var editHtml = "";
    if (state.editOpen) {
      editHtml = [
        "<div style='margin-top:14px;padding:12px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;'>",
        "<h3 style='margin:0 0 10px;font-size:18px;color:#0f172a;'>会社変更</h3>",
        "<label style='display:block;font-weight:700;margin:8px 0 4px;'>会社名</label>",
        "<input id='aicm-auth-company-name' value='" + esc(c.company_name) + "' style='width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:10px;font-size:16px;'>",
        "<label style='display:block;font-weight:700;margin:8px 0 4px;'>事業領域</label>",
        "<textarea id='aicm-auth-company-domain' style='width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:10px;font-size:16px;min-height:82px;'>" + esc(c.business_domain || "") + "</textarea>",
        "<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;'>",
        "<button id='aicm-auth-preview-company-change' type='button' style='border:1px solid #cbd5e1;background:#eef2ff;border-radius:12px;padding:10px 12px;font-weight:700;'>画面上で反映</button>",
        "<button id='aicm-auth-close-edit' type='button' style='border:1px solid #cbd5e1;background:white;border-radius:12px;padding:10px 12px;font-weight:700;'>閉じる</button>",
        "</div>",
        "<p style='color:#64748b;font-size:12px;margin:8px 0 0;'>DB保存は未実行です。保存API接続は次工程。</p>",
        "</div>"
      ].join("");
    }

    panel.innerHTML = [
      "<h2 style='margin:0 0 10px;font-size:24px;color:#0f172a;'>選択中AI企業</h2>",
      "<div style='padding:12px;border-radius:14px;background:#ecfeff;border:1px solid #67e8f9;color:#164e63;'>",
      "<strong style='font-size:20px;'>" + esc(c.company_name) + "</strong>",
      "<p style='margin:6px 0 0;line-height:1.6;'>" + esc(c.business_domain || "事業領域なし") + "</p>",
      "<p style='margin:6px 0 0;font-size:12px;'>company_id=" + esc(c.company_id) + " / 組織=" + orgs.length + "件 / reason=" + esc(reason || state.lastReason || "") + "</p>",
      "</div>",
      "<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;'>",
      "<button id='aicm-auth-open-edit' type='button' style='border:1px solid #cbd5e1;background:#eef2ff;border-radius:12px;padding:10px 12px;font-weight:700;'>会社を変更</button>",
      "<button id='aicm-auth-delete-company' type='button' style='border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;border-radius:12px;padding:10px 12px;font-weight:700;'>会社を削除</button>",
      "<button id='aicm-auth-reload-orgs' type='button' style='border:1px solid #cbd5e1;background:white;border-radius:12px;padding:10px 12px;font-weight:700;'>組織を再読込</button>",
      "</div>",
      editHtml,
      "<section style='margin-top:16px;'>",
      "<h3 style='margin:0 0 8px;font-size:20px;color:#0f172a;'>選択AI企業の組織</h3>",
      orgHtml,
      "</section>"
    ].join("");

    bindPanelButtons();
  }

  function bindPanelButtons() {
    var open = document.getElementById("aicm-auth-open-edit");
    if (open) {
      open.onclick = function () {
        state.editOpen = true;
        renderPanel("open-edit");
      };
    }

    var close = document.getElementById("aicm-auth-close-edit");
    if (close) {
      close.onclick = function () {
        state.editOpen = false;
        renderPanel("close-edit");
      };
    }

    var preview = document.getElementById("aicm-auth-preview-company-change");
    if (preview) {
      preview.onclick = function () {
        var name = document.getElementById("aicm-auth-company-name");
        var domain = document.getElementById("aicm-auth-company-domain");
        if (name && name.value.trim()) state.currentCompany.company_name = name.value.trim();
        if (domain) state.currentCompany.business_domain = domain.value.trim();
        setCurrentCompany(state.currentCompany, "preview-company-change");
        renderPanel("preview-company-change");
      };
    }

    var del = document.getElementById("aicm-auth-delete-company");
    if (del) {
      del.onclick = function () {
        alert("会社削除は安全停止中です。次工程で soft delete / inactive 化として実装します。物理削除はしません。");
      };
    }

    var reload = document.getElementById("aicm-auth-reload-orgs");
    if (reload) {
      reload.onclick = function () {
        refresh("manual-reload-orgs");
      };
    }
  }

  async function refresh(reason) {
    removeBadInjectedPanels();

    if (!state.companies.length) {
      await loadCompanies();
    }

    populateDashboardCompanySelect();

    var c = selectedCompanyFromDashboard();
    if (!c) {
      log("refresh-skipped-no-selected-company", { reason: reason || "" });
      return null;
    }

    setCurrentCompany(c, reason || "refresh");

    await loadOrganizations(c);

    renderPanel(reason || "refresh");

    // 旧UIが後からDOMを書き換えるので再描画を遅延実行
    setTimeout(function () { renderPanel((reason || "refresh") + "-late600"); }, 600);
    setTimeout(function () { renderPanel((reason || "refresh") + "-late1600"); }, 1600);

    return c;
  }

  function bindDashboard() {
    document.addEventListener("change", function (ev) {
      if (ev.target && ev.target === findDashboardCompanySelect()) {
        refresh("dashboard-company-select-change");
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button']") : null;
      if (!btn) return;

      var label = textOf(btn);
      if (label.indexOf("AI企業を表示") >= 0) {
        setTimeout(function () { refresh("ai-company-show-click"); }, 0);
      }

      if (/AI企業設定|会社ダッシュボード/.test(label)) {
        setTimeout(function () { refresh("company-screen-click"); }, 400);
      }
    }, true);
  }

  bindDashboard();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadCompanies().then(function () { refresh("DOMContentLoaded"); });
    });
  } else {
    loadCompanies().then(function () { refresh("ready"); });
  }

  window.AICMAuthoritativeSelectedCompanyPanel = {
    refresh: function () { return refresh("manual-window-refresh"); },
    state: state,
    current: function () { return state.currentCompany; },
    companies: function () { return state.companies.slice(); },
    organizations: function () { return state.organizations.slice(); },
    findDashboardCompanySelect: findDashboardCompanySelect,
    log: function () {
      return (window.__AICM_AUTHORITATIVE_SELECTED_COMPANY_PANEL_LOG || []).slice();
    }
  };
})();
