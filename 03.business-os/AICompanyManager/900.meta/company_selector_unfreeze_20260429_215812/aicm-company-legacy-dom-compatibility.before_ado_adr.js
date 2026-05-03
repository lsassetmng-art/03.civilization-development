(function () {
  "use strict";

  var MARK = "__AICM_COMPANY_LEGACY_DOM_COMPAT_ADK_ADN_V1__";
  if (window[MARK]) return;
  window[MARK] = true;

  var DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-1db11893cb24";
  var DEFAULT_COMPANY_NAME = "ウルフ";
  var DEFAULT_DOMAIN = "業務システムの開発、保守、運用";

  function log(type, detail) {
    window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG = window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG || [];
    window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG.push({
      at: new Date().toISOString(),
      type: type,
      detail: detail || {}
    });
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

  function existingById(id) {
    return document.getElementById(id);
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
        "data-aicm-compat": "legacy-company-dom"
      });

      root.appendChild(el("h2", {}, "BusinessOS DB会社バインド"));
      root.appendChild(el("p", {}, "BusinessOS DB会社ID"));
      root.appendChild(el("p", {}, "名称変更前の会社選択欄 互換保持"));
      document.body.appendChild(root);
      log("compat-root-created", {});
    }

    return root;
  }

  function optionWolf(select) {
    if (!select.querySelector("option[value='" + DEFAULT_COMPANY_ID + "']")) {
      var opt = el("option", { value: DEFAULT_COMPANY_ID }, DEFAULT_COMPANY_NAME);
      opt.selected = true;
      select.appendChild(opt);
    }
    select.value = DEFAULT_COMPANY_ID;
  }

  function ensureSelect(root, id, name) {
    var n = existingById(id);
    if (!n) {
      var label = el("label", { for: id }, name || id);
      n = el("select", {
        id: id,
        name: name || id,
        "data-aicm-compat-field": "company-select",
        "data-company-id": DEFAULT_COMPANY_ID
      });
      optionWolf(n);
      root.appendChild(label);
      root.appendChild(n);
      log("compat-select-created", { id: id });
    } else if (n.tagName === "SELECT") {
      optionWolf(n);
    }
    return n;
  }

  function ensureInput(root, id, name, value) {
    var n = existingById(id);
    if (!n) {
      n = el("input", {
        id: id,
        name: name || id,
        value: value || "",
        "data-aicm-compat-field": name || id
      });
      root.appendChild(n);
      log("compat-input-created", { id: id });
    } else if ("value" in n && !n.value) {
      n.value = value || "";
    }
    return n;
  }

  function ensureButton(root, id, text) {
    var n = existingById(id);
    if (!n) {
      n = el("button", {
        id: id,
        type: "button",
        "data-aicm-compat-field": "company-load-button"
      }, text || "読込");
      n.addEventListener("click", function (ev) {
        ev.preventDefault();
        log("compat-load-click", { id: id });
      });
      root.appendChild(n);
      log("compat-button-created", { id: id });
    }
    return n;
  }

  function syncWindowState() {
    window.AICM_CURRENT_COMPANY_ID = window.AICM_CURRENT_COMPANY_ID || DEFAULT_COMPANY_ID;
    window.AICM_CURRENT_COMPANY_NAME = window.AICM_CURRENT_COMPANY_NAME || DEFAULT_COMPANY_NAME;
    window.AICM_CURRENT_COMPANY_DOMAIN = window.AICM_CURRENT_COMPANY_DOMAIN || DEFAULT_DOMAIN;

    window.aicmCurrentCompany = window.aicmCurrentCompany || {
      company_id: DEFAULT_COMPANY_ID,
      company_name: DEFAULT_COMPANY_NAME,
      business_domain: DEFAULT_DOMAIN
    };

    window.aicmSelectedCompany = window.aicmSelectedCompany || {
      company_id: DEFAULT_COMPANY_ID,
      company_name: DEFAULT_COMPANY_NAME,
      business_domain: DEFAULT_DOMAIN
    };
  }

  function ensureCompatDom() {
    if (!document.body) return;

    syncWindowState();

    var root = ensureRoot();

    // Old / possible selectors retained as compatibility anchors.
    ensureSelect(root, "aicm-businessos-db-company-select", "businessos_company_id");
    ensureSelect(root, "aicm-businessos-company-select", "businessos_company_id");
    ensureSelect(root, "aicm-company-bind-company-select", "company_id");
    ensureSelect(root, "aicm-company-select", "company_id");
    ensureSelect(root, "aicm-current-company-select", "company_id");
    ensureSelect(root, "company-select", "company_id");
    ensureSelect(root, "companyIdSelect", "company_id");
    ensureSelect(root, "businessos-company-select", "businessos_company_id");

    ensureInput(root, "aicm-businessos-company-id", "company_id", DEFAULT_COMPANY_ID);
    ensureInput(root, "aicm-current-company-id", "company_id", DEFAULT_COMPANY_ID);
    ensureInput(root, "company_id", "company_id", DEFAULT_COMPANY_ID);
    ensureInput(root, "companyId", "company_id", DEFAULT_COMPANY_ID);
    ensureInput(root, "aicm-company-name", "company_name", DEFAULT_COMPANY_NAME);
    ensureInput(root, "aicm-business-domain", "business_domain", DEFAULT_DOMAIN);

    ensureButton(root, "aicm-company-load-button", "読込");
    ensureButton(root, "aicm-businessos-company-load-button", "読込");
    ensureButton(root, "company-load-button", "読込");

    log("compat-dom-ensured", {
      company_id: DEFAULT_COMPANY_ID,
      company_name: DEFAULT_COMPANY_NAME
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
    setTimeout(ensureCompatDom, 100);
    setTimeout(ensureCompatDom, 500);
    setTimeout(ensureCompatDom, 1500);
  });

  document.addEventListener("click", function () {
    setTimeout(function () {
      avoidBlankBody();
      ensureCompatDom();
    }, 0);
    setTimeout(function () {
      avoidBlankBody();
      ensureCompatDom();
    }, 300);
  }, true);

  if (document.readyState === "interactive" || document.readyState === "complete") {
    avoidBlankBody();
    ensureCompatDom();
  }

  window.AICMCompanyLegacyDomCompat = {
    ensure: ensureCompatDom,
    log: function () {
      return (window.__AICM_COMPANY_LEGACY_DOM_COMPAT_LOG || []).slice();
    }
  };
})();
