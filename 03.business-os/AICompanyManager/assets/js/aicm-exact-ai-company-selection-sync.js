(function () {
  "use strict";

  var MARK = "__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_AEE_AEH_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var companyMap = {};
  var selected = null;

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
    window.__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_LOG =
      window.__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_LOG || [];
    window.__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_LOG.length > 160) {
      window.__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_LOG.shift();
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

  function removeBadInjectedPanels() {
    [
      "aicm-selected-company-context-banner",
      "aicm-selected-company-organization-panel",
      "aicm-white-screen-rescue-panel"
    ].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) {
        n.remove();
        log("removed-bad-injected-panel", { id: id });
      }
    });
  }

  function findCardByTexts(requiredTexts) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("section, article, form, div"));
    var candidates = [];

    nodes.forEach(function (node) {
      if (!isVisible(node)) return;
      var t = textOf(node);
      var ok = requiredTexts.every(function (word) {
        return t.indexOf(word) >= 0;
      });
      if (!ok) return;

      candidates.push({
        node: node,
        len: t.length
      });
    });

    candidates.sort(function (a, b) {
      return a.len - b.len;
    });

    return candidates.length ? candidates[0].node : null;
  }

  function findAiCompanySelectCard() {
    // 本命: 「AI企業選択」と「AI企業を表示」を同じカード内に持つものだけ。
    return findCardByTexts(["AI企業選択", "AI企業を表示"]);
  }

  function findAiCompanySelect() {
    var card = findAiCompanySelectCard();
    if (!card) return null;

    var selects = Array.prototype.slice.call(card.querySelectorAll("select")).filter(isVisible);
    if (!selects.length) return null;

    // AI企業選択カード内のselectだけを会社selectとする。
    return selects[0];
  }

  function findAiCompanyShowButton() {
    var card = findAiCompanySelectCard();
    if (!card) return null;

    var buttons = Array.prototype.slice.call(card.querySelectorAll("button, a, [role='button']"));
    for (var i = 0; i < buttons.length; i += 1) {
      if (textOf(buttons[i]).indexOf("AI企業を表示") >= 0) return buttons[i];
    }
    return null;
  }

  async function loadCompanies() {
    try {
      var res = await fetch("/api/aicm/companies?v=" + Date.now(), { cache: "no-store" });
      var data = await res.json();
      var rows = Array.isArray(data.companies) ? data.companies : [];

      companyMap = {};
      rows.forEach(function (c) {
        if (isPlaceholder(c.company_id) || isPlaceholder(c.company_name)) return;
        companyMap[c.company_id] = {
          company_id: c.company_id,
          company_name: c.company_name,
          business_domain: c.business_domain || ""
        };
      });

      log("companies-loaded", {
        count: Object.keys(companyMap).length,
        table: data.table || ""
      });

      populateAiCompanySelect();
    } catch (err) {
      log("companies-load-failed", { message: s(err && err.message || err) });
    }
  }

  function populateAiCompanySelect() {
    var select = findAiCompanySelect();
    if (!select) {
      log("populate-skipped-no-ai-company-select", {});
      return;
    }

    var keys = Object.keys(companyMap);
    if (!keys.length) {
      log("populate-skipped-no-company-map", {});
      return;
    }

    var currentValue = select.value;
    if (isPlaceholder(currentValue)) currentValue = "";

    // AI企業選択カード内だけ、placeholder option を消す。
    Array.prototype.slice.call(select.options || []).forEach(function (opt) {
      if (isPlaceholder(opt.value) || isPlaceholder(textOf(opt))) {
        opt.remove();
      }
    });

    keys.forEach(function (id) {
      var c = companyMap[id];
      var found = Array.prototype.slice.call(select.options || []).filter(function (opt) {
        return opt.value === id;
      })[0];

      if (!found) {
        var opt = document.createElement("option");
        opt.value = c.company_id;
        opt.textContent = c.company_name;
        opt.setAttribute("data-business-domain", c.business_domain || "");
        select.appendChild(opt);
      } else {
        found.textContent = c.company_name;
        found.setAttribute("data-business-domain", c.business_domain || "");
      }
    });

    if (currentValue && companyMap[currentValue]) {
      select.value = currentValue;
    } else if (!companyMap[select.value]) {
      select.value = keys[0];
    }

    log("ai-company-select-populated", {
      value: select.value,
      optionCount: select.options.length
    });
  }

  function companyFromAiSelect() {
    var select = findAiCompanySelect();
    if (!select) return null;
    if (isPlaceholder(select.value)) return null;

    var opt = select.options[select.selectedIndex];
    var id = select.value;
    var name = textOf(opt);
    var domain = opt ? s(opt.getAttribute("data-business-domain") || "") : "";

    if (companyMap[id]) return companyMap[id];

    if (!isPlaceholder(id) && !isPlaceholder(name)) {
      return {
        company_id: id,
        company_name: name,
        business_domain: domain
      };
    }

    return null;
  }

  function setGlobalCompany(c, reason) {
    if (!c || isPlaceholder(c.company_id) || isPlaceholder(c.company_name)) return null;

    selected = c;

    window.AICM_CURRENT_COMPANY_ID = c.company_id;
    window.AICM_CURRENT_COMPANY_NAME = c.company_name || "";
    window.AICM_CURRENT_COMPANY_DOMAIN = c.business_domain || "";

    window.aicmCurrentCompany = {
      company_id: c.company_id,
      company_name: c.company_name || "",
      business_domain: c.business_domain || ""
    };

    window.aicmSelectedCompany = {
      company_id: c.company_id,
      company_name: c.company_name || "",
      business_domain: c.business_domain || ""
    };

    try {
      localStorage.setItem("aicm.currentCompanyId", c.company_id);
      localStorage.setItem("aicm.currentCompanyName", c.company_name || "");
      localStorage.setItem("aicm.currentCompanyDomain", c.business_domain || "");
      sessionStorage.setItem("aicm.currentCompanyId", c.company_id);
      sessionStorage.setItem("aicm.currentCompanyName", c.company_name || "");
      sessionStorage.setItem("aicm.currentCompanyDomain", c.business_domain || "");
    } catch (_) {}

    document.body.setAttribute("data-aicm-current-company-id", c.company_id);
    document.body.setAttribute("data-aicm-current-company-name", c.company_name || "");

    var root = document.getElementById("aicm-root");
    if (root) {
      root.setAttribute("data-aicm-current-company-id", c.company_id);
      root.setAttribute("data-aicm-current-company-name", c.company_name || "");
    }

    log("global-company-set", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name
    });

    return c;
  }

  function syncCompanyOverview(c) {
    if (!c) return 0;

    var card = findCardByTexts(["会社概要"]);
    if (!card) return 0;

    var count = 0;
    var text = textOf(card);

    // 会社概要カード内の stale 表示をピンポイントで置換。
    var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var t = s(node.nodeValue || "");
        if (!t.trim()) return NodeFilter.FILTER_REJECT;
        if (
          t.indexOf("Ai System Integrated Corporation") >= 0 ||
          t.indexOf("AI System Integrated Corporation") >= 0 ||
          t.indexOf("選択してください") >= 0 ||
          t.indexOf("AI 機器、アプリの開発、保守、運用あ") >= 0 ||
          t.indexOf("AI 機器、アプリの開発、保守、運用") >= 0
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var before = node.nodeValue;
      var after = before
        .split("Ai System Integrated Corporation").join(c.company_name)
        .split("AI System Integrated Corporation").join(c.company_name)
        .split("選択してください").join(c.company_name);

      if (c.business_domain) {
        after = after
          .split("AI 機器、アプリの開発、保守、運用あ").join(c.business_domain)
          .split("AI 機器、アプリの開発、保守、運用").join(c.business_domain);
      }

      if (after !== before) {
        node.nodeValue = after;
        count += 1;
      }
    }

    // 会社概要カードに明示データを付与。
    card.setAttribute("data-aicm-current-company-id", c.company_id);
    card.setAttribute("data-aicm-current-company-name", c.company_name || "");

    if (text.indexOf(c.company_name) < 0) {
      var info = document.createElement("div");
      info.setAttribute("data-aicm-exact-company-summary", "true");
      info.style.cssText = "margin-top:10px;padding:10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;";
      info.innerHTML =
        "<strong>" + esc(c.company_name) + "</strong><br>" +
        "<span style='color:#64748b;'>" + esc(c.business_domain || "") + "</span>";
      card.appendChild(info);
      count += 1;
    }

    return count;
  }

  function syncCompanyEditForm(c) {
    if (!c) return 0;

    var card = findCardByTexts(["会社", "変更"]);
    if (!card) card = findCardByTexts(["会社名", "事業領域"]);
    if (!card) return 0;

    var count = 0;

    Array.prototype.slice.call(card.querySelectorAll("input, textarea")).forEach(function (field) {
      var label = textOf(field.previousElementSibling) + " " + textOf(field.parentElement) + " " + s(field.id) + " " + s(field.name);

      if (/会社名|company_name|companyName/i.test(label)) {
        field.value = c.company_name || "";
        field.setAttribute("data-aicm-exact-synced", "company_name");
        count += 1;
      } else if (/事業領域|business_domain|businessDomain|domain|business_area/i.test(label)) {
        field.value = c.business_domain || "";
        field.setAttribute("data-aicm-exact-synced", "business_domain");
        count += 1;
      } else if (/company_id|companyId/i.test(label)) {
        field.value = c.company_id || "";
        field.setAttribute("data-aicm-exact-synced", "company_id");
        count += 1;
      }
    });

    card.setAttribute("data-aicm-current-company-id", c.company_id);
    card.setAttribute("data-aicm-current-company-name", c.company_name || "");

    return count;
  }

  async function loadOrganizationsForSelected(c) {
    if (!c || isPlaceholder(c.company_id)) return [];

    try {
      var res = await fetch("/api/aicm/company-organizations?company_id=" + encodeURIComponent(c.company_id) + "&v=" + Date.now(), { cache: "no-store" });
      var data = await res.json();
      var rows = Array.isArray(data.organizations) ? data.organizations : [];
      renderSelectedCompanyOrganizations(c, rows);
      log("organizations-loaded", {
        company_id: c.company_id,
        count: rows.length
      });
      return rows;
    } catch (err) {
      log("organizations-load-failed", {
        company_id: c.company_id,
        message: s(err && err.message || err)
      });
      return [];
    }
  }

  function renderSelectedCompanyOrganizations(c, rows) {
    var existing = document.getElementById("aicm-exact-selected-company-organizations");
    if (!existing) {
      existing = document.createElement("section");
      existing.id = "aicm-exact-selected-company-organizations";
      existing.style.cssText = [
        "background:#fff",
        "border:1px solid #e2e8f0",
        "border-radius:18px",
        "padding:16px",
        "margin:14px 8px",
        "box-shadow:0 4px 14px rgba(15,23,42,.06)",
        "font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"
      ].join(";");

      var overview = findCardByTexts(["会社概要"]);
      if (overview && overview.parentElement) {
        overview.parentElement.insertBefore(existing, overview.nextSibling);
      } else {
        var root = document.getElementById("aicm-root") || document.body;
        root.appendChild(existing);
      }
    }

    var body = "";
    if (!rows || !rows.length) {
      body =
        "<p style='color:#64748b;line-height:1.6;'>この会社に紐づく部門・課・組織が取得できていません。</p>" +
        "<p style='color:#64748b;font-size:12px;'>company_id=" + esc(c.company_id) + "</p>";
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

    existing.innerHTML = [
      "<h2 style='margin:0 0 10px;font-size:24px;color:#0f172a;'>選択AI企業の組織</h2>",
      "<p style='margin:0 0 10px;color:#475569;'>会社: <strong>" + esc(c.company_name || c.company_id) + "</strong></p>",
      body
    ].join("");
  }

  function sync(reason) {
    removeBadInjectedPanels();

    var c = companyFromAiSelect();
    if (!c) {
      log("sync-skipped-no-valid-ai-company-selection", { reason: reason || "" });
      return null;
    }

    setGlobalCompany(c, reason || "sync");
    var overviewCount = syncCompanyOverview(c);
    var formCount = syncCompanyEditForm(c);

    log("exact-visible-sync-done", {
      reason: reason || "",
      company_id: c.company_id,
      company_name: c.company_name,
      overviewCount: overviewCount,
      formCount: formCount
    });

    return c;
  }

  function syncAndLoadOrgs(reason) {
    var c = sync(reason);
    if (c) loadOrganizationsForSelected(c);
    return c;
  }

  function bind() {
    document.addEventListener("change", function (ev) {
      if (ev.target && ev.target === findAiCompanySelect()) {
        syncAndLoadOrgs("ai-company-select-change");
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button']") : null;
      if (!btn) return;

      var label = textOf(btn);

      if (label.indexOf("AI企業を表示") >= 0) {
        setTimeout(function () { syncAndLoadOrgs("after-ai-company-show-100ms"); }, 100);
        setTimeout(function () { syncAndLoadOrgs("after-ai-company-show-800ms"); }, 800);
        setTimeout(function () { syncAndLoadOrgs("after-ai-company-show-1800ms"); }, 1800);
      }

      if (label.indexOf("AI企業設定") >= 0 || label.indexOf("会社を変更") >= 0 || label.indexOf("会社変更") >= 0) {
        setTimeout(function () { sync("after-company-ui-click-200ms"); }, 200);
        setTimeout(function () { sync("after-company-ui-click-1000ms"); }, 1000);
      }
    }, true);
  }

  bind();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadCompanies();
      setTimeout(function () { syncAndLoadOrgs("DOMContentLoaded-1000ms"); }, 1000);
      setTimeout(function () { syncAndLoadOrgs("DOMContentLoaded-2500ms"); }, 2500);
    });
  } else {
    loadCompanies();
    setTimeout(function () { syncAndLoadOrgs("ready-1000ms"); }, 1000);
    setTimeout(function () { syncAndLoadOrgs("ready-2500ms"); }, 2500);
  }

  window.AICMExactAICompanySelectionSync = {
    loadCompanies: loadCompanies,
    sync: function () { return syncAndLoadOrgs("manual-window-sync"); },
    current: function () { return selected || companyFromAiSelect(); },
    findAiCompanySelect: findAiCompanySelect,
    companyMap: function () { return companyMap; },
    log: function () {
      return (window.__AICM_EXACT_AI_COMPANY_SELECTION_SYNC_LOG || []).slice();
    }
  };
})();
