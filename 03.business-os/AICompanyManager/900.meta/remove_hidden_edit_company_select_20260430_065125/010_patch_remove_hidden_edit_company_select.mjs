import fs from "node:fs";

const targetFile = process.argv[2];
const saveClientFile = process.argv[3];

let src = fs.readFileSync(targetFile, "utf8");
const MARK = "AICM_REMOVE_HIDDEN_EDIT_COMPANY_SELECT_AJP_AJS_V1";

if (!src.includes(MARK)) {
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

      if (ch === "}") {
        depth -= 1;
        if (depth === 0) return { start, end: i + 1 };
      }
    }

    return null;
  }

  function replaceFunction(source, functionName, replacement) {
    const range = findFunctionRange(source, functionName);
    if (!range) return source;
    return source.slice(0, range.start) + replacement + source.slice(range.end);
  }

  const renderSettingsReplacement = `function renderSettings(data, company) {
    /* ${MARK}
     * 会社設定の対象は dashboard-selected company。
     * hidden edit-company-select は使わない。
     * 保存/削除も currentCompany(data) を対象にする。
     */
    var editing = company || null;
    var editingId = editing ? (editing.company_id || editing.id || "") : "";

    try {
      if (editingId) {
        window.AICM_DASHBOARD_SELECTED_COMPANY_ID = editingId;
        sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", editingId);
        sessionStorage.setItem("AICM_PENDING_COMPANY_ID", editingId);
      }
    } catch (error) {}

    aicmEnsureBusinessRobots(data);

    return shell([
      '<section class="aicm-grid" data-screen-scope="settings">',
      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">ダッシュボードで選択したAI企業を設定します。この画面では企業を切り替えません。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>会社 変更・削除</h2>',
      editing ? '<p class="aicm-muted">対象AI企業: <strong>' + esc(editing.company_name || editing.name || "") + '</strong></p>' : '<p class="aicm-muted">対象AI企業なし。ダッシュボードでAI企業を選択してください。</p>',
      field("会社名", "edit-company-name", editing ? (editing.company_name || editing.name || "") : ""),
      field("事業領域", "edit-company-domain", editing ? editing.business_domain : ""),
      '<button class="primary" data-action="save-company">会社を変更</button> ',
      '<button class="danger" data-action="delete-company">会社を削除</button>',
      '</div>',
      '<div class="aicm-card"><h2>Presidentロボット</h2>',
      '<p class="aicm-muted">会社単位のPresidentはAI企業設定で設定します。Business側ロボットプールから選択します。AICompanyManagerはシステム用のため数量消費せず無制限割当です。</p>',
      '<div class="aicm-field"><label>Presidentロボット</label><select id="company-president-robot">' + aicmBusinessRobotOptions(data, editing && editing.president_robot_id ? [editing.president_robot_id] : [], "president") + '</select></div>',
      field("社内通称", "company-president-nickname", editing ? editing.president_robot_nickname : ""),
      '<button class="primary" data-action="save-company-president-v2">Presidentを設定</button>',
      aicmPresidentRobotSummary(data, editing),
      '</div>',
      '<div class="aicm-card"><h2>会社事業方針をPresidentへ指示</h2>',
      '<p class="aicm-muted">会社の事業方針をPresidentロボットへ指示します。local UI状態へ保存します。</p>',
      textArea("事業方針", "company-president-policy", editing ? editing.company_business_policy_instruction_to_president : ""),
      '<button class="primary" data-action="instruct-company-president-policy-v2">Presidentへ指示</button>',
      aicmPresidentPolicySummary(editing),
      '</div>',
      '<div class="aicm-card"><h2>会社共通ルール</h2>',
      '<div class="aicm-field"><label>会社共通ルールファイル</label><input id="common-rule-files" type="file" multiple></div>',
      '<button class="primary" data-action="add-common-rules">会社共通ルールを追加</button>',
      editing && editing.company_common_rules && editing.company_common_rules.length ? editing.company_common_rules.map(function (f) {
        return '<span class="aicm-badge">' + esc(f.name) + '</span>';
      }).join("") : '<p class="aicm-muted">未登録</p>',
      '</div>',
      '</section>'
    ].join(""));
  }`;

  src = replaceFunction(src, "renderSettings", renderSettingsReplacement);

  src = src.replace(
`    if (action === "load-company-edit") {
      app.editCompanyId = val("edit-company-select");
      render();
      return;
    }

`,
""
  );

  src = src.replace(
`    if (action === "save-company") {
      var editCompany = findCompany(data, val("edit-company-select"));
      if (editCompany) {
        editCompany.name = val("edit-company-name");
        editCompany.business_domain = val("edit-company-domain");
      }
      save(data);
      render();
      return;
    }`,
`    if (action === "save-company") {
      /* ${MARK}: save target is dashboard-selected currentCompany(data), not hidden/select */
      var editCompany = currentCompany(data);
      if (editCompany) {
        editCompany.name = val("edit-company-name");
        editCompany.company_name = val("edit-company-name");
        editCompany.business_domain = val("edit-company-domain");
        app.companyId = editCompany.id || editCompany.company_id || app.companyId;
        app.selectedCompanyId = app.companyId;
        app.editCompanyId = "";
        try {
          window.AICM_DASHBOARD_SELECTED_COMPANY_ID = app.companyId;
          sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", app.companyId);
          sessionStorage.setItem("AICM_PENDING_COMPANY_ID", app.companyId);
        } catch (error) {}
      }
      save(data);
      render();
      return;
    }`
  );

  src = src.replace(
`    if (action === "delete-company") {
      if (data.companies.length > 1) {
        data.companies = data.companies.filter(function (c) { return c.id !== val("edit-company-select"); });
        app.companyId = data.companies[0].id;
        app.departmentId = data.companies[0].departments[0] ? data.companies[0].departments[0].id : "";
      }
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }`,
`    if (action === "delete-company") {
      /* ${MARK}: delete target is dashboard-selected currentCompany(data). DB physical delete is not executed here. */
      var deleteCompany = currentCompany(data);
      var deleteCompanyId = deleteCompany ? (deleteCompany.id || deleteCompany.company_id || "") : "";
      if (deleteCompanyId && data.companies.length > 1) {
        data.companies = data.companies.filter(function (c) {
          return c.id !== deleteCompanyId && c.company_id !== deleteCompanyId;
        });
        app.companyId = data.companies[0] ? (data.companies[0].id || data.companies[0].company_id || "") : "";
        app.selectedCompanyId = app.companyId;
        app.editCompanyId = "";
        app.departmentId = data.companies[0] && data.companies[0].departments && data.companies[0].departments[0] ? data.companies[0].departments[0].id : "";
        try {
          window.AICM_DASHBOARD_SELECTED_COMPANY_ID = app.companyId;
          sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", app.companyId);
          sessionStorage.setItem("AICM_PENDING_COMPANY_ID", app.companyId);
        } catch (error) {}
      }
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }`
  );

  src = replaceFunction(src, "buildSaveCompanyPayload", `function buildSaveCompanyPayload() {
    var dashboardCompanyId = "";
    try {
      dashboardCompanyId =
        window.AICM_DASHBOARD_SELECTED_COMPANY_ID ||
        sessionStorage.getItem("AICM_CURRENT_COMPANY_ID") ||
        sessionStorage.getItem("AICM_PENDING_COMPANY_ID") ||
        "";
    } catch (error) {}

    dashboardCompanyId = dashboardCompanyId || val("company-select");

    return {
      company_id: dashboardCompanyId,
      company_name: val("edit-company-name"),
      business_domain: val("edit-company-domain"),
      company_status: "active"
    };
  }`);

  src = replaceFunction(src, "buildDeleteCompanyPayload", `function buildDeleteCompanyPayload() {
    var dashboardCompanyId = "";
    try {
      dashboardCompanyId =
        window.AICM_DASHBOARD_SELECTED_COMPANY_ID ||
        sessionStorage.getItem("AICM_CURRENT_COMPANY_ID") ||
        sessionStorage.getItem("AICM_PENDING_COMPANY_ID") ||
        "";
    } catch (error) {}

    dashboardCompanyId = dashboardCompanyId || val("company-select");

    return {
      company_id: dashboardCompanyId
    };
  }`);

  src = replaceFunction(src, "buildCompanyRulesPayload", `function buildCompanyRulesPayload(companyId) {
    var dashboardCompanyId = "";
    try {
      dashboardCompanyId =
        window.AICM_DASHBOARD_SELECTED_COMPANY_ID ||
        sessionStorage.getItem("AICM_CURRENT_COMPANY_ID") ||
        sessionStorage.getItem("AICM_PENDING_COMPANY_ID") ||
        "";
    } catch (error) {}

    return {
      company_id: companyId || dashboardCompanyId || val("company-select"),
      files: files("common-rule-files")
    };
  }`);

  if (src.includes("edit-company-select")) {
    throw new Error("edit-company-select still remains in target JS");
  }

  if (src.includes('data-action="load-company-edit"')) {
    throw new Error("load-company-edit still remains in target JS");
  }

  fs.writeFileSync(targetFile, src);
  console.log("target JS patched");
} else {
  console.log("target JS already patched");
}

/* Replace company save client with button-only, no hidden dependency */
const saveClient = `/* ============================================================
 * AICompanyManager company persistent save client
 * Phase AJP-AJS button-only / no hidden edit-company-select
 * ============================================================ */

(function (global) {
  "use strict";

  var MARK = "AICM_COMPANY_SAVE_CLIENT_NO_HIDDEN_AJP_AJS_V1";
  var API_URL = global.AICM_COMPANY_WRITE_API_URL || "http://127.0.0.1:8796";
  var BOUND_ATTR = "data-aicm-company-save-bound";

  function byId(id) {
    return document.getElementById(id);
  }

  function value(id) {
    var el = byId(id);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function dashboardCompanyId() {
    var id = "";

    try {
      id =
        global.AICM_DASHBOARD_SELECTED_COMPANY_ID ||
        sessionStorage.getItem("AICM_CURRENT_COMPANY_ID") ||
        sessionStorage.getItem("AICM_PENDING_COMPANY_ID") ||
        "";
    } catch (error) {}

    return id || value("company-select");
  }

  function isCompanySaveAction(action) {
    return action === "add-company" || action === "save-company";
  }

  function buildPayload(action) {
    if (action === "add-company") {
      return {
        action: "add-company",
        company_name: value("new-company-name"),
        business_domain: value("new-company-domain")
      };
    }

    if (action === "save-company") {
      return {
        action: "save-company",
        company_id: dashboardCompanyId(),
        company_name: value("edit-company-name"),
        business_domain: value("edit-company-domain"),
        company_status: "active"
      };
    }

    return { action: action || "" };
  }

  function toast(message) {
    var box = byId("aicm-company-save-client-toast");

    if (!box) {
      box = document.createElement("div");
      box.id = "aicm-company-save-client-toast";
      box.style.position = "fixed";
      box.style.left = "12px";
      box.style.right = "12px";
      box.style.bottom = "18px";
      box.style.zIndex = "9999";
      box.style.padding = "10px 12px";
      box.style.borderRadius = "12px";
      box.style.background = "#eef6ff";
      box.style.color = "#164e63";
      box.style.fontWeight = "700";
      box.style.boxShadow = "0 8px 24px rgba(15,23,42,.18)";
      document.body.appendChild(box);
    }

    box.textContent = message;
    clearTimeout(box.__aicmTimer);
    box.__aicmTimer = setTimeout(function () {
      if (box && box.parentNode) box.parentNode.removeChild(box);
    }, 1800);
  }

  function postCompanySave(action, payload) {
    if (!global.fetch) {
      toast("company save client: fetch unavailable");
      return;
    }

    if (action === "save-company" && !payload.company_id) {
      toast("company save client: selected company id missing");
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "AICompanyManager",
        client_marker: MARK,
        action: action,
        payload: payload
      })
    }).then(function (response) {
      if (!response.ok) {
        toast("company save client: save request failed " + response.status);
        return null;
      }
      return response.json().catch(function () { return null; });
    }).then(function () {
      toast("company save client: save requested");
    }).catch(function (error) {
      toast("company save client: " + String(error && error.message ? error.message : error));
    });
  }

  function onCompanySaveClick(event) {
    var button = this;
    var action = button && button.getAttribute ? button.getAttribute("data-action") : "";

    if (!isCompanySaveAction(action)) return;

    if (event && event.preventDefault) event.preventDefault();

    postCompanySave(action, buildPayload(action));
  }

  function wireCompanySaveButtons(root) {
    var scope = root || document;
    var buttons;
    var i;

    if (!scope.querySelectorAll) return;

    buttons = scope.querySelectorAll('[data-action="add-company"],[data-action="save-company"]');

    for (i = 0; i < buttons.length; i += 1) {
      if (buttons[i].getAttribute(BOUND_ATTR) === "1") continue;
      buttons[i].setAttribute(BOUND_ATTR, "1");
      buttons[i].addEventListener("click", onCompanySaveClick, false);
    }
  }

  function start() {
    wireCompanySaveButtons(document);

    if (global.MutationObserver && document.body) {
      new MutationObserver(function (mutations) {
        var i;
        for (i = 0; i < mutations.length; i += 1) {
          if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
            wireCompanySaveButtons(document);
            return;
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, false);
  } else {
    start();
  }

  global.AICM = global.AICM || {};
  global.AICM.CompanySaveClientButtonOnly = {
    marker: MARK,
    wire: wireCompanySaveButtons,
    dashboardCompanyId: dashboardCompanyId
  };
})(window);
`;

fs.writeFileSync(saveClientFile, saveClient);
console.log("save client replaced");
