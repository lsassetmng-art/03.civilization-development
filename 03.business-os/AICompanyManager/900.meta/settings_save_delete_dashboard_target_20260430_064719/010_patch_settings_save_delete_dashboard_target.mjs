import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_SETTINGS_SAVE_DELETE_DASHBOARD_TARGET_AJL_AJO_V1";

if (src.includes(MARK)) {
  console.log("already patched");
  process.exit(0);
}

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
  if (!range) throw new Error(functionName + " not found");
  return source.slice(0, range.start) + replacement + source.slice(range.end);
}

const renderSettingsReplacement = `function renderSettings(data, company) {
    /* ${MARK}
     * 正本はダッシュボードで選択された company 引数。
     * hiddenは保存/削除 payload 用のミラーであり、正本ではない。
     */
    var editing = company || null;
    var editingId = editing ? (editing.company_id || editing.id || "") : "";

    aicmEnsureBusinessRobots(data);

    return shell([
      '<section class="aicm-grid" data-screen-scope="settings">',
      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">ダッシュボードで選択したAI企業を設定します。この画面では企業を切り替えません。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>会社 変更・削除</h2>',
      editing ? '<p class="aicm-muted">対象AI企業: <strong>' + esc(editing.company_name || editing.name || "") + '</strong></p>' : '<p class="aicm-muted">対象AI企業なし。ダッシュボードでAI企業を選択してください。</p>',
      '<input type="hidden" id="edit-company-select" value="' + esc(editingId) + '">',
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

/*
 * handleAction内の save-company/delete-company をダッシュボード選択 company に固定。
 * 既存の val("edit-company-select") 正本扱いをやめる。
 */
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
      /* ${MARK}: save target is dashboard-selected company, not edit-company-select */
      var editCompany = currentCompany(data);
      if (editCompany) {
        editCompany.name = val("edit-company-name");
        editCompany.company_name = val("edit-company-name");
        editCompany.business_domain = val("edit-company-domain");
        app.companyId = editCompany.id || editCompany.company_id || app.companyId;
        app.editCompanyId = "";
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
      /* ${MARK}: delete target is dashboard-selected company. DB physical delete is not executed here. */
      var deleteCompany = currentCompany(data);
      var deleteCompanyId = deleteCompany ? (deleteCompany.id || deleteCompany.company_id || "") : "";
      if (deleteCompanyId && data.companies.length > 1) {
        data.companies = data.companies.filter(function (c) {
          return c.id !== deleteCompanyId && c.company_id !== deleteCompanyId;
        });
        app.companyId = data.companies[0] ? (data.companies[0].id || data.companies[0].company_id || "") : "";
        app.editCompanyId = "";
        app.departmentId = data.companies[0] && data.companies[0].departments && data.companies[0].departments[0] ? data.companies[0].departments[0].id : "";
      }
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }`
);

if (src.includes('<label>変更対象</label><select id="edit-company-select">')) {
  throw new Error("visible edit-company-select still exists");
}

if (src.includes('data-action="load-company-edit"')) {
  throw new Error("load-company-edit still exists");
}

if (!src.includes(MARK)) {
  throw new Error("patch marker missing");
}

fs.writeFileSync(file, src);
console.log("settings save/delete dashboard target patched");
