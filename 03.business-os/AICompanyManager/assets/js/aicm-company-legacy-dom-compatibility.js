(function () {
  "use strict";

  var MARK = "__AICM_COMPANY_LEGACY_DOM_COMPAT_ADO_ADR_V2__";
  if (window[MARK]) return;
  window[MARK] = true;

  var FALLBACK_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";
  var FALLBACK_COMPANY_NAME = "ウルフ";
  var FALLBACK_DOMAIN = "業務システムの開発、保守、運用";

  function log(type, detail) {
    window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG = window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG || [];
    window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
    if (window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG.length > 120) {
      window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG.shift();
    }
  }

  function s(value) {
    return String(value == null ? "" : value);
  }

  function textOf(el) {
    if (!el) return "";
    return s(el.innerText || el.textContent || el.value || el.getAttribute && el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
  }

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "className") n.className = attrs[k];
      else if (k === "style") n.style.cssText = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (text !== undefined) n.textContent = String(text);
    return n;
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

  function ensureStyle() {
    if (document.getElementById("aicm-company-legacy-dom-compat-style")) return;

    var style = el("style", { id: "aicm-company-legacy-dom-compat-style" });
    style.textContent = [
      ".aicm-legacy-company-compat-root{",
      "position:absolute!important;",
      "left:-10000px!important;",
      "top:auto!important;",
      "width:1px!important;",
      "height:1px!important;",
      "overflow:hidden!important;",
      "clip-path:inset(50%)!important;",
      "white-space:nowrap!important;",
      "border:0!important;",
      "padding:0!important;",
      "margin:0!important;",
      "}",
      ".aicm-legacy-company-compat-root *{",
      "font-size:1px!important;",
      "line-height:1px!important;",
      "}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureRoot() {
    ensureStyle();

    var root = document.getElementById("aicm-legacy-company-compat-root");
    if (!root) {
      root = el("div", {
        id: "aicm-legacy-company-compat-root",
        className: "aicm-legacy-company-compat-root",
        "data-aicm-compat": "legacy-company-dom",
        "aria-hidden": "true"
      });
      root.appendChild(el("h2", {}, "BusinessOS DB会社バインド 互換DOM"));
      root.appendChild(el("p", {}, "旧会社選択欄 互換保持"));
      document.body.appendChild(root);
      log("compat-root-created", {});
    }

    return root;
  }

  function optionExists(select, value) {
    var opts = Array.prototype.slice.call(select.options || []);
    return opts.some(function (o) { return s(o.value) === s(value); });
  }

  function addFallbackOption(select) {
    if (!optionExists(select, FALLBACK_COMPANY_ID)) {
      var opt = el("option", { value: FALLBACK_COMPANY_ID }, FALLBACK_COMPANY_NAME);
      select.appendChild(opt);
    }
  }

  function visibleCompanySelects() {
    var all = Array.prototype.slice.call(document.querySelectorAll("select"));
    return all.filter(function (select) {
      if (!isVisibleElement(select)) return false;
      var labelText = "";
      try {
        if (select.id) {
          var label = document.querySelector("label[for='" + select.id.replace(/'/g, "\\'") + "']");
          labelText = textOf(label);
        }
      } catch (_) {}
      var near = textOf(select.parentElement);
      var idName = s(select.id) + " " + s(select.name) + " " + s(select.className);
      var joined = [labelText, near, idName].join(" ");
      return /AI企業|会社|company|Company|businessos|BusinessOS/i.test(joined);
    });
  }

  function collectVisibleCompanyOptions() {
    var map = {};
    visibleCompanySelects().forEach(function (select) {
      Array.prototype.slice.call(select.options || []).forEach(function (opt) {
        var value = s(opt.value).trim();
        var label = textOf(opt).trim();
        if (!value && !label) return;
        if (label === "company" || label === "会社" || label === "BusinessOSなんちゃら") return;
        map[value || label] = {
          value: value || label,
          label: label || value
        };
      });
    });

    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function ensureHiddenSelect(root, id, name, options) {
    var n = document.getElementById(id);

    // If an existing element with this id is visible, do NOT touch it.
    if (n && !isInsideCompatRoot(n)) {
      log("skip-visible-existing-select", { id: id, optionCount: n.options ? n.options.length : null });
      return n;
    }

    if (!n) {
      n = el("select", {
        id: id,
        name: name || id,
        "data-aicm-compat-field": "company-select",
        "data-company-id": FALLBACK_COMPANY_ID
      });
      root.appendChild(n);
      log("hidden-compat-select-created", { id: id });
    }

    // Hidden compat select mirrors visible options if they exist.
    n.innerHTML = "";
    if (options && options.length) {
      options.forEach(function (o) {
        n.appendChild(el("option", { value: o.value }, o.label));
      });
    } else {
      addFallbackOption(n);
    }

    if (!n.value && n.options.length) n.selectedIndex = 0;
    return n;
  }

  function ensureHiddenInput(root, id, name, value) {
    var n = document.getElementById(id);

    // If an existing element with this id is visible, do NOT touch it.
    if (n && !isInsideCompatRoot(n)) {
      log("skip-visible-existing-input", { id: id });
      return n;
    }

    if (!n) {
      n = el("input", {
        id: id,
        name: name || id,
        value: value || "",
        "data-aicm-compat-field": name || id
      });
      root.appendChild(n);
      log("hidden-compat-input-created", { id: id });
    } else if ("value" in n && !n.value) {
      n.value = value || "";
    }

    return n;
  }

  function ensureHiddenButton(root, id, text) {
    var n = document.getElementById(id);

    // If visible old button exists, do not touch it.
    if (n && !isInsideCompatRoot(n)) {
      log("skip-visible-existing-button", { id: id });
      return n;
    }

    if (!n) {
      n = el("button", {
        id: id,
        type: "button",
        "data-aicm-compat-field": "company-load-button"
      }, text || "読込");
      n.addEventListener("click", function (ev) {
        ev.preventDefault();
        log("hidden-compat-load-click", { id: id });
      });
      root.appendChild(n);
      log("hidden-compat-button-created", { id: id });
    }

    return n;
  }

  function removeGarbageOptionsOnlyInsideCompatRoot(root) {
    Array.prototype.slice.call(root.querySelectorAll("option")).forEach(function (opt) {
      var t = textOf(opt);
      var v = s(opt.value).trim();
      if ((t === "company" || t === "会社" || t === "BusinessOSなんちゃら") && !v) {
        opt.remove();
      }
    });
  }

  function syncWindowStateFromVisibleSelects(options) {
    window.AICM_CURRENT_COMPANY_ID = window.AICM_CURRENT_COMPANY_ID || FALLBACK_COMPANY_ID;
    window.AICM_CURRENT_COMPANY_NAME = window.AICM_CURRENT_COMPANY_NAME || FALLBACK_COMPANY_NAME;
    window.AICM_CURRENT_COMPANY_DOMAIN = window.AICM_CURRENT_COMPANY_DOMAIN || FALLBACK_DOMAIN;

    if (options && options.length) {
      var first = options[0];
      if (!window.AICM_CURRENT_COMPANY_ID) window.AICM_CURRENT_COMPANY_ID = first.value;
      if (!window.AICM_CURRENT_COMPANY_NAME) window.AICM_CURRENT_COMPANY_NAME = first.label;
    }

    window.aicmCurrentCompany = window.aicmCurrentCompany || {
      company_id: window.AICM_CURRENT_COMPANY_ID,
      company_name: window.AICM_CURRENT_COMPANY_NAME,
      business_domain: window.AICM_CURRENT_COMPANY_DOMAIN
    };

    window.aicmSelectedCompany = window.aicmSelectedCompany || {
      company_id: window.AICM_CURRENT_COMPANY_ID,
      company_name: window.AICM_CURRENT_COMPANY_NAME,
      business_domain: window.AICM_CURRENT_COMPANY_DOMAIN
    };
  }

  function ensureCompatDom() {
    if (!document.body) return;

    var root = ensureRoot();
    var options = collectVisibleCompanyOptions();

    syncWindowStateFromVisibleSelects(options);

    // Important:
    // These are hidden compatibility anchors only.
    // Visible AI企業選択 must not be overwritten or forced to Wolf.
    ensureHiddenSelect(root, "aicm-businessos-db-company-select", "businessos_company_id", options);
    ensureHiddenSelect(root, "aicm-businessos-company-select", "businessos_company_id", options);
    ensureHiddenSelect(root, "aicm-company-bind-company-select", "company_id", options);
    ensureHiddenSelect(root, "aicm-company-select", "company_id", options);
    ensureHiddenSelect(root, "aicm-current-company-select", "company_id", options);
    ensureHiddenSelect(root, "company-select", "company_id", options);
    ensureHiddenSelect(root, "companyIdSelect", "company_id", options);
    ensureHiddenSelect(root, "businessos-company-select", "businessos_company_id", options);

    ensureHiddenInput(root, "aicm-businessos-company-id", "company_id", FALLBACK_COMPANY_ID);
    ensureHiddenInput(root, "aicm-current-company-id", "company_id", FALLBACK_COMPANY_ID);
    ensureHiddenInput(root, "company_id", "company_id", FALLBACK_COMPANY_ID);
    ensureHiddenInput(root, "companyId", "company_id", FALLBACK_COMPANY_ID);
    ensureHiddenInput(root, "aicm-company-name", "company_name", FALLBACK_COMPANY_NAME);
    ensureHiddenInput(root, "aicm-business-domain", "business_domain", FALLBACK_DOMAIN);

    ensureHiddenButton(root, "aicm-company-load-button", "読込");
    ensureHiddenButton(root, "aicm-businessos-company-load-button", "読込");
    ensureHiddenButton(root, "company-load-button", "読込");

    removeGarbageOptionsOnlyInsideCompatRoot(root);

    log("compat-dom-ensured-v2", {
      visibleCompanySelectCount: visibleCompanySelects().length,
      visibleOptionCount: options.length
    });
  }

  function avoidBlankBody() {
    if (!document.body) return;
    document.documentElement.style.display = "";
    document.documentElement.style.visibility = "";
    document.body.style.display = "";
    document.body.style.visibility = "";
    document.body.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    avoidBlankBody();
    ensureCompatDom();
    setTimeout(ensureCompatDom, 250);
    setTimeout(ensureCompatDom, 1000);
    setTimeout(ensureCompatDom, 2500);
  });

  document.addEventListener("click", function () {
    setTimeout(function () {
      avoidBlankBody();
      ensureCompatDom();
    }, 200);
    setTimeout(function () {
      avoidBlankBody();
      ensureCompatDom();
    }, 1000);
  }, true);

  if (document.readyState === "interactive" || document.readyState === "complete") {
    avoidBlankBody();
    ensureCompatDom();
  }

  window.AICMCompanyLegacyDomCompat = {
    ensure: ensureCompatDom,
    visibleCompanySelects: visibleCompanySelects,
    visibleCompanyOptions: collectVisibleCompanyOptions,
    log: function () {
      return (window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG || []).slice();
    }
  };
})();
