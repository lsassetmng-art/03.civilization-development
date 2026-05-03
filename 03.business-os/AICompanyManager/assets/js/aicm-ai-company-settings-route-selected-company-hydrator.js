(function () {
  "use strict";

  var MARK = "__AICM_AI_COMPANY_SETTINGS_ROUTE_SELECTED_COMPANY_HYDRATOR_AEQ_AET_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var storageKeys = {
    currentId: "aicm.currentCompanyId",
    currentName: "aicm.currentCompanyName",
    currentDomain: "aicm.currentCompanyDomain",
    settingsTargetId: "aicm.settingsTargetCompanyId",
    settingsTargetName: "aicm.settingsTargetCompanyName",
    settingsTargetDomain: "aicm.settingsTargetCompanyDomain"
  };

  var state = {
    companies: [],
    companyById: {},
    selectedCompany: null,
    settingsTargetCompany: null,
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
    window.__AICM_AI_COMPANY_SETTINGS_ROUTE_HYDRATOR_LOG =
      window.__AICM_AI_COMPANY_SETTINGS_ROUTE_HYDRATOR_LOG || [];
    window.__AICM_AI_COMPANY_SETTINGS_ROUTE_HYDRATOR_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_AI_COMPANY_SETTINGS_ROUTE_HYDRATOR_LOG.length > 240) {
      window.__AICM_AI_COMPANY_SETTINGS_ROUTE_HYDRATOR_LOG.shift();
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
    var byId = {};

    (rows || []).forEach(function (c) {
      var id = s(c.company_id).trim();
      var name = s(c.company_name).trim();
      if (isPlaceholder(id) || isPlaceholder(name)) return;

      var row = {
        company_id: id,
        company_name: name,
        business_domain: s(c.business_domain || "")
      };

      if (!byId[id]) {
        byId[id] = row;
        out.push(row);
      }
    });

    state.companies = out;
    state.companyById = byId;
    return out;
  }

  async function loadCompanies() {
    try {
      var data = await getJson("/api/aicm/companies?v=" + Date.now());
      normalizeCompanies(data.companies || []);
      log("companies-loaded", {
        count: state.companies.length,
        table: data.table || "",
        server_mark: data.server_mark || ""
      });
      return state.companies;
    } catch (err) {
      log("companies-load-failed", {
        message: s(err && err.message || err)
      });
      return state.companies;
    }
  }

  function companyById(id) {
    return state.companyById[s(id)] || null;
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
    return smallestCardContaining(["AI企業選択", "AI企業を表示"]);
  }

  function findDashboardCompanySelect() {
    var card = findDashboardCompanyCard();
    if (!card) return null;

    var selects = Array.prototype.slice.call(card.querySelectorAll("select")).filter(isVisible);
    return selects[0] || null;
  }

  function findAICompanySettingsButtons() {
    return Array.prototype.slice.call(document.querySelectorAll("button, a, [role='button']"))
      .filter(isVisible)
      .filter(function (btn) {
        var label = textOf(btn);
        return label === "AI企業設定" || label.indexOf("AI企業設定") >= 0;
      })
      .filter(function (btn) {
        var label = textOf(btn);
        return label.indexOf("AI企業新規追加") < 0;
      });
  }

  function selectedFromDashboard() {
    var select = findDashboardCompanySelect();
    if (select && !isPlaceholder(select.value)) {
      var c = companyById(select.value);
      if (c) return c;

      var opt = select.options[select.selectedIndex];
      var name = textOf(opt);
      var domain = opt ? s(opt.getAttribute("data-business-domain") || "") : "";

      if (!isPlaceholder(name)) {
        return {
          company_id: select.value,
          company_name: name,
          business_domain: domain
        };
      }
    }

    return null;
  }

  function selectedFromStorage(prefix) {
    try {
      var id = localStorage.getItem(prefix + "Id") || sessionStorage.getItem(prefix + "Id") || "";
      var name = localStorage.getItem(prefix + "Name") || sessionStorage.getItem(prefix + "Name") || "";
      var domain = localStorage.getItem(prefix + "Domain") || sessionStorage.getItem(prefix + "Domain") || "";
      if (!isPlaceholder(id) && !isPlaceholder(name)) {
        var c = companyById(id);
        return c || {
          company_id: id,
          company_name: name,
          business_domain: domain
        };
      }
    } catch (_) {}
    return null;
  }

  function currentSelectedCompany() {
    return selectedFromDashboard() ||
      selectedFromStorage("aicm.currentCompany") ||
      state.selectedCompany ||
      state.companies[0] ||
      null;
  }

  function settingsTargetCompany() {
    var c = selectedFromStorage("aicm.settingsTargetCompany");
    if (c) return c;

    c = currentSelectedCompany();
    if (c) return c;

    return null;
  }

  function storeCompany(c, reason) {
    if (!c || isPlaceholder(c.company_id) || isPlaceholder(c.company_name)) return null;

    state.selectedCompany = c;

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
      localStorage.setItem(storageKeys.currentId, c.company_id);
      localStorage.setItem(storageKeys.currentName, c.company_name);
      localStorage.setItem(storageKeys.currentDomain, c.business_domain || "");
      sessionStorage.setItem(storageKeys.currentId, c.company_id);
      sessionStorage.setItem(storageKeys.currentName, c.company_name);
      sessionStorage.setItem(storageKeys.currentDomain, c.business_domain || "");
    } catch (_) {}

    log("current-company-stored", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name
    });

    return c;
  }

  function storeSettingsTarget(c, reason) {
    if (!c || isPlaceholder(c.company_id) || isPlaceholder(c.company_name)) return null;

    state.settingsTargetCompany = c;
    storeCompany(c, reason || "store-settings-target");

    try {
      localStorage.setItem(storageKeys.settingsTargetId, c.company_id);
      localStorage.setItem(storageKeys.settingsTargetName, c.company_name);
      localStorage.setItem(storageKeys.settingsTargetDomain, c.business_domain || "");
      sessionStorage.setItem(storageKeys.settingsTargetId, c.company_id);
      sessionStorage.setItem(storageKeys.settingsTargetName, c.company_name);
      sessionStorage.setItem(storageKeys.settingsTargetDomain, c.business_domain || "");
    } catch (_) {}

    log("settings-target-company-stored", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name
    });

    return c;
  }

  function populateDashboardSelect() {
    var select = findDashboardCompanySelect();
    if (!select || !state.companies.length) return;

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
      var opt = exists[c.company_id];
      if (!opt) {
        opt = document.createElement("option");
        opt.value = c.company_id;
        select.appendChild(opt);
      }
      opt.textContent = c.company_name;
      opt.setAttribute("data-business-domain", c.business_domain || "");
    });

    var stored = "";
    try {
      stored = localStorage.getItem(storageKeys.currentId) || sessionStorage.getItem(storageKeys.currentId) || "";
    } catch (_) {}

    if (old && companyById(old)) select.value = old;
    else if (stored && companyById(stored)) select.value = stored;
    else if (state.companies[0]) select.value = state.companies[0].company_id;

    var c = selectedFromDashboard();
    if (c) storeCompany(c, "populate-dashboard-select");

    log("dashboard-select-populated", {
      value: select.value,
      optionCount: select.options.length
    });
  }

  function isAICompanySettingsScreen() {
    var body = textOf(document.body);
    return (
      body.indexOf("Presidentロボット") >= 0 ||
      body.indexOf("会社 変更・削除") >= 0 ||
      body.indexOf("会社変更") >= 0 ||
      body.indexOf("会社名") >= 0 && body.indexOf("事業領域") >= 0
    );
  }

  function findCompanyEditOrSettingsCards() {
    var cards = [];

    Array.prototype.slice.call(document.querySelectorAll("section, article, form, div")).forEach(function (node) {
      if (!isVisible(node)) return;
      var t = textOf(node);

      var hit =
        t.indexOf("会社 変更") >= 0 ||
        t.indexOf("会社変更") >= 0 ||
        t.indexOf("会社名") >= 0 && t.indexOf("事業領域") >= 0 ||
        t.indexOf("Presidentロボット") >= 0;

      if (hit) cards.push({ node: node, len: t.length });
    });

    cards.sort(function (a, b) { return a.len - b.len; });
    return cards.map(function (x) { return x.node; });
  }

  function ensureSettingsBanner(c, reason) {
    if (!c || !document.body) return;

    var banner = document.getElementById("aicm-settings-target-company-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "aicm-settings-target-company-banner";
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
      "AI企業設定対象: " + c.company_name +
      " / company_id=" + c.company_id +
      " / reason=" + (reason || "");
  }

  function syncInputsInCard(card, c) {
    var count = 0;

    Array.prototype.slice.call(card.querySelectorAll("input, textarea")).forEach(function (field) {
      var label = [
        textOf(field.previousElementSibling),
        textOf(field.parentElement),
        s(field.id),
        s(field.name),
        s(field.getAttribute("aria-label") || "")
      ].join(" ");

      if (/会社名|company_name|companyName/i.test(label)) {
        field.value = c.company_name;
        field.setAttribute("data-aicm-settings-target-synced", "company_name");
        count += 1;
      } else if (/事業領域|business_domain|businessDomain|business_area|domain/i.test(label)) {
        field.value = c.business_domain || "";
        field.setAttribute("data-aicm-settings-target-synced", "business_domain");
        count += 1;
      } else if (/company_id|companyId/i.test(label)) {
        field.value = c.company_id;
        field.setAttribute("data-aicm-settings-target-synced", "company_id");
        count += 1;
      }
    });

    return count;
  }

  function replaceStaleTextInCard(card, c) {
    var staleNames = [
      "Ai System Integrated Corporation",
      "AI System Integrated Corporation",
      "選択してください"
    ];
    var staleDomains = [
      "AI 機器、アプリの開発、保守、運用あ",
      "AI 機器、アプリの開発、保守、運用"
    ];

    var count = 0;

    var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, {
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

  function syncVisibleCompanySelectorsOnSettings(c) {
    var count = 0;

    Array.prototype.slice.call(document.querySelectorAll("select")).forEach(function (select) {
      if (!isVisible(select)) return;

      var scopeText = textOf(select.parentElement);
      var idName = s(select.id) + " " + s(select.name);

      // 会社selectだけ。President/Manager/Leader/Workerは除外。
      var isRobotSelect =
        scopeText.indexOf("Presidentロボット") >= 0 ||
        scopeText.indexOf("Manager") >= 0 ||
        scopeText.indexOf("Leader") >= 0 ||
        scopeText.indexOf("Worker") >= 0 ||
        /president|manager|leader|worker|robot/i.test(idName);

      if (isRobotSelect) return;

      var isCompany =
        scopeText.indexOf("AI企業") >= 0 ||
        scopeText.indexOf("会社") >= 0 ||
        /company/i.test(idName);

      if (!isCompany) return;

      var exists = Array.prototype.slice.call(select.options || []).some(function (opt) {
        return opt.value === c.company_id;
      });

      if (!exists) {
        var opt = document.createElement("option");
        opt.value = c.company_id;
        opt.textContent = c.company_name;
        opt.setAttribute("data-business-domain", c.business_domain || "");
        select.appendChild(opt);
      }

      select.value = c.company_id;
      count += 1;
    });

    return count;
  }

  function hydrateSettingsScreen(reason) {
    var c = settingsTargetCompany();
    if (!c || isPlaceholder(c.company_id) || isPlaceholder(c.company_name)) {
      log("hydrate-skipped-no-target-company", { reason: reason || "" });
      return null;
    }

    storeSettingsTarget(c, reason || "hydrate-settings");
    ensureSettingsBanner(c, reason || "hydrate-settings");

    var cards = findCompanyEditOrSettingsCards();
    var inputCount = 0;
    var textCount = 0;

    cards.forEach(function (card) {
      inputCount += syncInputsInCard(card, c);
      textCount += replaceStaleTextInCard(card, c);
      card.setAttribute("data-aicm-settings-target-company-id", c.company_id);
      card.setAttribute("data-aicm-settings-target-company-name", c.company_name);
    });

    var selectCount = syncVisibleCompanySelectorsOnSettings(c);

    log("settings-screen-hydrated", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name,
      cardCount: cards.length,
      inputCount: inputCount,
      textCount: textCount,
      selectCount: selectCount,
      isSettingsScreen: isAICompanySettingsScreen()
    });

    return c;
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      if (ev.target && ev.target === findDashboardCompanySelect()) {
        var c = selectedFromDashboard();
        if (c) {
          storeCompany(c, "dashboard-select-change");
          storeSettingsTarget(c, "dashboard-select-change");
        }
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button']") : null;
      if (!btn) return;

      var label = textOf(btn);

      if (label.indexOf("AI企業設定") >= 0 && label.indexOf("新規追加") < 0) {
        var c = selectedFromDashboard() || currentSelectedCompany();
        if (c) {
          storeSettingsTarget(c, "before-ai-company-settings-click");
        }

        setTimeout(function () { hydrateSettingsScreen("after-ai-company-settings-click-100ms"); }, 100);
        setTimeout(function () { hydrateSettingsScreen("after-ai-company-settings-click-600ms"); }, 600);
        setTimeout(function () { hydrateSettingsScreen("after-ai-company-settings-click-1600ms"); }, 1600);
      }

      if (label.indexOf("会社を変更") >= 0 || label.indexOf("会社変更") >= 0) {
        setTimeout(function () { hydrateSettingsScreen("after-company-change-click-300ms"); }, 300);
        setTimeout(function () { hydrateSettingsScreen("after-company-change-click-1200ms"); }, 1200);
      }
    }, true);
  }

  async function startup() {
    await loadCompanies();
    populateDashboardSelect();

    var c = selectedFromDashboard() || currentSelectedCompany();
    if (c) {
      storeCompany(c, "startup");
    }

    if (isAICompanySettingsScreen()) {
      hydrateSettingsScreen("startup-settings-screen");
      setTimeout(function () { hydrateSettingsScreen("startup-settings-screen-1000ms"); }, 1000);
      setTimeout(function () { hydrateSettingsScreen("startup-settings-screen-2500ms"); }, 2500);
    }
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startup);
  } else {
    startup();
  }

  window.addEventListener("hashchange", function () {
    setTimeout(function () { hydrateSettingsScreen("hashchange-300ms"); }, 300);
  });

  window.addEventListener("popstate", function () {
    setTimeout(function () { hydrateSettingsScreen("popstate-300ms"); }, 300);
  });

  window.AICMAICompanySettingsRouteHydrator = {
    loadCompanies: loadCompanies,
    hydrate: function () { return hydrateSettingsScreen("manual-window-hydrate"); },
    selected: function () { return currentSelectedCompany(); },
    target: function () { return settingsTargetCompany(); },
    findDashboardCompanySelect: findDashboardCompanySelect,
    log: function () {
      return (window.__AICM_AI_COMPANY_SETTINGS_ROUTE_HYDRATOR_LOG || []).slice();
    }
  };
})();
