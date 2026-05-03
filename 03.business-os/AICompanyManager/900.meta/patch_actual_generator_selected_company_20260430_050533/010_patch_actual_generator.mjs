import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_PHASE_DE_DH_SELECTED_COMPANY_SOURCE_AEY_AFB_V1";

function findFunctionRange(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) return null;

  const open = source.indexOf("{", start);
  if (open < 0) return null;

  let i = open + 1;
  let depth = 1;
  let quote = "";
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        quote = "";
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1 };
    }
  }

  return null;
}

function insertBeforeFunction(source, functionName, insertText) {
  if (source.includes(marker)) return source;
  const needle = "function " + functionName + "(";
  const idx = source.indexOf(needle);
  if (idx < 0) throw new Error("Cannot find function " + functionName);
  return source.slice(0, idx) + insertText + "\n\n  " + source.slice(idx);
}

function replaceFunction(source, functionName, replacement) {
  const range = findFunctionRange(source, functionName);
  if (!range) throw new Error("Cannot find function range for " + functionName);
  return source.slice(0, range.start) + replacement + source.slice(range.end);
}

const helper = `
  /* ============================================================
   * ${marker}
   * Canonical selected-company source for this generator.
   * - Dashboard AI企業選択 is the only user-facing company selector.
   * - AI企業設定 / 会社変更 uses selected company, not first company.
   * - President/Manager/Leader/Worker selects are never company selectors.
   * ============================================================ */

  function aicmAeyAfbTextOf(el) {
    if (!el) return "";
    return String(el.innerText || el.textContent || el.value || (el.getAttribute && el.getAttribute("aria-label")) || "")
      .replace(/\\s+/g, " ")
      .trim();
  }

  function aicmAeyAfbIsPlaceholder(value) {
    var v = String(value == null ? "" : value).trim();
    return !v || v === "選択してください" || v === "company" || v === "会社" || v === "BusinessOSなんちゃら";
  }

  function aicmAeyAfbCompanyIdOf(company) {
    return String(company && (company.id || company.company_id) || "").trim();
  }

  function aicmAeyAfbCompanyNameOf(company) {
    return String(company && (company.name || company.company_name || company.display_name) || "").trim();
  }

  function aicmAeyAfbCompanyDomainOf(company) {
    return String(company && (company.business_domain || company.business_area || company.domain || "") || "").trim();
  }

  function aicmAeyAfbCompanies(data) {
    if (data && Array.isArray(data.companies)) return data.companies;
    if (typeof state !== "undefined" && state && Array.isArray(state.companies)) return state.companies;
    return [];
  }

  function aicmAeyAfbFindCompany(data, companyId) {
    if (aicmAeyAfbIsPlaceholder(companyId)) return null;

    var list = aicmAeyAfbCompanies(data);
    for (var i = 0; i < list.length; i += 1) {
      var c = list[i];
      if (aicmAeyAfbCompanyIdOf(c) === companyId || String(c && c.company_id || "") === companyId) {
        return c;
      }
    }

    return null;
  }

  function aicmAeyAfbNormalizeCompany(company) {
    if (!company) return null;

    var id = aicmAeyAfbCompanyIdOf(company);
    var name = aicmAeyAfbCompanyNameOf(company);

    if (aicmAeyAfbIsPlaceholder(id) || aicmAeyAfbIsPlaceholder(name)) return null;

    var normalized = {};
    Object.keys(company).forEach(function (key) {
      normalized[key] = company[key];
    });

    normalized.id = id;
    normalized.company_id = id;
    normalized.name = name;
    normalized.company_name = name;
    normalized.business_domain = aicmAeyAfbCompanyDomainOf(company);

    if (!Array.isArray(normalized.company_common_rules)) normalized.company_common_rules = [];
    if (!Array.isArray(normalized.departments)) normalized.departments = [];
    if (!Array.isArray(normalized.organizations)) normalized.organizations = [];

    return normalized;
  }

  function aicmAeyAfbSafeStorageGet(key) {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
    } catch (_) {
      return "";
    }
  }

  function aicmAeyAfbSafeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value || "");
      sessionStorage.setItem(key, value || "");
    } catch (_) {}
  }

  function aicmAeyAfbDashboardCompanySelect() {
    if (typeof document === "undefined") return null;

    var direct = document.getElementById("company-select");
    if (direct && direct.tagName === "SELECT") return direct;

    var nodes = Array.prototype.slice.call(document.querySelectorAll("section, article, form, div"));
    var candidates = [];

    nodes.forEach(function (node) {
      var t = aicmAeyAfbTextOf(node);
      if (t.indexOf("AI企業選択") >= 0 && t.indexOf("AI企業を表示") >= 0) {
        candidates.push({ node: node, len: t.length });
      }
    });

    candidates.sort(function (a, b) { return a.len - b.len; });

    if (!candidates.length) return null;

    var selects = Array.prototype.slice.call(candidates[0].node.querySelectorAll("select"));
    return selects[0] || null;
  }

  function aicmAeyAfbDomSelectedCompanyId() {
    var select = aicmAeyAfbDashboardCompanySelect();
    if (!select) return "";

    var id = String(select.value || "").trim();
    if (aicmAeyAfbIsPlaceholder(id)) return "";

    return id;
  }

  function aicmAeyAfbResolveSelectedCompanyId(data) {
    var candidates = [];

    candidates.push(aicmAeyAfbDomSelectedCompanyId());

    if (typeof app !== "undefined" && app) {
      candidates.push(app.current_company_id);
      candidates.push(app.currentCompanyId);
      candidates.push(app.selected_company_id);
      candidates.push(app.selectedCompanyId);
      candidates.push(app.company_id);
      candidates.push(app.companyId);
    }

    if (data) {
      candidates.push(data.current_company_id);
      candidates.push(data.currentCompanyId);
      candidates.push(data.selected_company_id);
      candidates.push(data.selectedCompanyId);
      candidates.push(data.company_id);
      candidates.push(data.companyId);
    }

    if (typeof window !== "undefined") {
      candidates.push(window.AICM_CURRENT_COMPANY_ID);
      candidates.push(window.aicmCurrentCompany && window.aicmCurrentCompany.company_id);
      candidates.push(window.aicmSelectedCompany && window.aicmSelectedCompany.company_id);
    }

    candidates.push(aicmAeyAfbSafeStorageGet("aicm.currentCompanyId"));
    candidates.push(aicmAeyAfbSafeStorageGet("aicm.selectedCompanyId"));
    candidates.push(aicmAeyAfbSafeStorageGet("aicm.settingsTargetCompanyId"));

    for (var i = 0; i < candidates.length; i += 1) {
      var id = String(candidates[i] == null ? "" : candidates[i]).trim();
      if (!aicmAeyAfbIsPlaceholder(id)) return id;
    }

    return "";
  }

  function aicmAeyAfbSetSelectedCompany(company, reason) {
    var normalized = aicmAeyAfbNormalizeCompany(company);
    if (!normalized) return null;

    if (typeof app !== "undefined" && app) {
      app.current_company_id = normalized.company_id;
      app.currentCompanyId = normalized.company_id;
      app.selected_company_id = normalized.company_id;
      app.selectedCompanyId = normalized.company_id;
      app.company_id = normalized.company_id;
      app.companyId = normalized.company_id;
    }

    if (typeof window !== "undefined") {
      window.AICM_CURRENT_COMPANY_ID = normalized.company_id;
      window.AICM_CURRENT_COMPANY_NAME = normalized.company_name;
      window.AICM_CURRENT_COMPANY_DOMAIN = normalized.business_domain || "";

      window.aicmCurrentCompany = {
        company_id: normalized.company_id,
        company_name: normalized.company_name,
        business_domain: normalized.business_domain || ""
      };

      window.aicmSelectedCompany = {
        company_id: normalized.company_id,
        company_name: normalized.company_name,
        business_domain: normalized.business_domain || ""
      };
    }

    aicmAeyAfbSafeStorageSet("aicm.currentCompanyId", normalized.company_id);
    aicmAeyAfbSafeStorageSet("aicm.currentCompanyName", normalized.company_name);
    aicmAeyAfbSafeStorageSet("aicm.currentCompanyDomain", normalized.business_domain || "");
    aicmAeyAfbSafeStorageSet("aicm.settingsTargetCompanyId", normalized.company_id);
    aicmAeyAfbSafeStorageSet("aicm.settingsTargetCompanyName", normalized.company_name);
    aicmAeyAfbSafeStorageSet("aicm.settingsTargetCompanyDomain", normalized.business_domain || "");

    if (typeof document !== "undefined" && document.body) {
      document.body.setAttribute("data-aicm-current-company-id", normalized.company_id);
      document.body.setAttribute("data-aicm-current-company-name", normalized.company_name);
      document.body.setAttribute("data-aicm-current-company-reason", reason || "");
    }

    return normalized;
  }

  function aicmAeyAfbCurrentCompany(data) {
    var list = aicmAeyAfbCompanies(data);
    var selectedId = aicmAeyAfbResolveSelectedCompanyId(data);
    var found = aicmAeyAfbFindCompany(data, selectedId);

    if (found) {
      return aicmAeyAfbSetSelectedCompany(found, "currentCompany-selected-id");
    }

    if (!aicmAeyAfbIsPlaceholder(selectedId)) {
      var selectedName =
        aicmAeyAfbSafeStorageGet("aicm.currentCompanyName") ||
        aicmAeyAfbSafeStorageGet("aicm.settingsTargetCompanyName") ||
        selectedId;

      var selectedDomain =
        aicmAeyAfbSafeStorageGet("aicm.currentCompanyDomain") ||
        aicmAeyAfbSafeStorageGet("aicm.settingsTargetCompanyDomain") ||
        "";

      return aicmAeyAfbSetSelectedCompany({
        id: selectedId,
        company_id: selectedId,
        name: selectedName,
        company_name: selectedName,
        business_domain: selectedDomain,
        company_common_rules: [],
        departments: [],
        organizations: []
      }, "currentCompany-storage-fallback");
    }

    for (var i = 0; i < list.length; i += 1) {
      var normalized = aicmAeyAfbNormalizeCompany(list[i]);
      if (normalized) {
        return aicmAeyAfbSetSelectedCompany(normalized, "currentCompany-first-valid");
      }
    }

    return null;
  }
`;

const replacementCurrentCompany = `function currentCompany(data) {
    return aicmAeyAfbCurrentCompany(data);
  }`;

src = insertBeforeFunction(src, "currentCompany", helper);
src = replaceFunction(src, "currentCompany", replacementCurrentCompany);

const bridgeMarker = "AICM_PHASE_DE_DH_SELECTED_COMPANY_EVENT_BRIDGE_AEY_AFB_V1";
const bridge = `
  /* ============================================================
   * ${bridgeMarker}
   * Keep selected company before screen transition.
   * ============================================================ */
  function aicmAeyAfbBindSelectedCompanyEvents() {
    if (typeof document === "undefined") return;
    if (window.__${bridgeMarker}__) return;
    window.__${bridgeMarker}__ = true;

    document.addEventListener("change", function (ev) {
      var target = ev.target;
      if (!target || target.tagName !== "SELECT") return;

      var dashboardSelect = aicmAeyAfbDashboardCompanySelect();
      if (target !== dashboardSelect) return;

      var id = String(target.value || "").trim();
      var company = aicmAeyAfbFindCompany((typeof state !== "undefined" ? state : null), id);
      if (company) {
        aicmAeyAfbSetSelectedCompany(company, "dashboard-company-select-change");
      }
    }, true);

    document.addEventListener("click", function (ev) {
      var button = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button'], [data-screen]") : null;
      if (!button) return;

      var label = aicmAeyAfbTextOf(button);
      var screen = button.getAttribute ? String(button.getAttribute("data-screen") || "") : "";

      if (
        label.indexOf("AI企業設定") >= 0 ||
        label.indexOf("AI企業を表示") >= 0 ||
        screen === "settings" ||
        screen === "dashboard"
      ) {
        var id = aicmAeyAfbDomSelectedCompanyId();
        var company = aicmAeyAfbFindCompany((typeof state !== "undefined" ? state : null), id);

        if (company) {
          aicmAeyAfbSetSelectedCompany(company, "before-company-screen-click");
        }
      }
    }, true);
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", aicmAeyAfbBindSelectedCompanyEvents);
    } else {
      aicmAeyAfbBindSelectedCompanyEvents();
    }
  }
`;

if (!src.includes(bridgeMarker)) {
  const lastIifeClose = src.lastIndexOf("\n})();");
  if (lastIifeClose >= 0) {
    src = src.slice(0, lastIifeClose) + "\n" + bridge + "\n" + src.slice(lastIifeClose);
  } else {
    src += "\n" + bridge + "\n";
  }
}

fs.writeFileSync(file, src);
