(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var CSV_ROWS = [];

  var app = {
    screen: "dashboard",
    companyId: "company-001",
    departmentId: "dept-dev",
    organizationId: "org-dev",
    editCompanyId: "",
    editLedgerId: ""
  };

  var csvPrompt = [
    "以下の条件で、AICompanyManagerにアップロードする部門別タスク台帳CSVを作成してください。",
    "",
    "CSVヘッダー:",
    "deliverable_name,task_name,work_type,status,priority,due_date,reference_files,supplemental_materials,note",
    "",
    "入力ルール:",
    "- deliverable_name は成果物名",
    "- task_name は具体的な作業名",
    "- work_type は 設計 / 実装 / デザイン / 修正 / 調査 / レビュー / 資料作成 / 納品準備 / 引き継ぎ のいずれか",
    "- status は 未着手 / 進行中 / レビュー中 / 完了 / 保留 のいずれか",
    "- priority は 高 / 中 / 低 のいずれか",
    "- due_date は YYYY-MM-DD 形式。未定なら空欄",
    "- reference_files は作業前・作業中に読む資料。複数ある場合は | で区切る",
    "- supplemental_materials は補足資料。複数ある場合は | で区切る",
    "- note は短い補足だけ",
    "",
    "出力条件:",
    "- CSVのみ出力",
    "- 説明文は付けない",
    "- Markdownコードブロックに入れない"
  ].join("\n");

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function baseData() {
    return {
      aiworkers: [
        { id: "aiw-manager-001", name: "Manager Alpha", role: "Manager", organization_id: "org-dev" },
        { id: "aiw-leader-001", name: "Leader Alpha", role: "Leader", organization_id: "org-dev" },
        { id: "aiw-worker-001", name: "Worker Alpha", role: "Worker", organization_id: "org-dev" },
        { id: "aiw-worker-002", name: "Worker Beta", role: "Worker", organization_id: "org-dev" },
        { id: "aiw-leader-002", name: "Design Leader", role: "Leader", organization_id: "org-design" },
        { id: "aiw-worker-003", name: "Design Worker", role: "Worker", organization_id: "org-design" }
      ],
      companies: [
        {
          id: "company-001",
          name: "AI Company Alpha",
          business_domain: "業務設計・制作・開発支援",
          company_common_rules: [],
          departments: [
            {
              id: "dept-dev",
              name: "開発部",
              purpose: "設計・実装・テスト",
              organizations: [
                { id: "org-dev", name: "開発第1組織", parent_id: "", purpose: "BusinessOS開発", robot_ids: ["aiw-manager-001", "aiw-leader-001", "aiw-worker-001", "aiw-worker-002"] }
              ],
              task_ledger: [
                {
                  id: "tl-001",
                  deliverable_name: "AICompanyManager",
                  task_name: "AICompanyManager画面構成整理",
                  work_type: "設計",
                  status: "未着手",
                  priority: "高",
                  due_date: "",
                  reference_files: "AICompanyManager統合設計.md|会社共通ルール",
                  supplemental_materials: "画面レビュー結果",
                  note: "設定/追加/詳細/編集を別画面化"
                }
              ],
              review_items: [
                { id: "rev-001", title: "AICompanyManager画面構成整理レビュー", status: "承認待ち", target: "AICompanyManager", note: "Phase AN確認" }
              ]
            },
            {
              id: "dept-design",
              name: "デザイン部",
              purpose: "デザイン制作・資料作成",
              organizations: [
                { id: "org-design", name: "デザイン第1組織", parent_id: "", purpose: "デザイン制作", robot_ids: ["aiw-leader-002", "aiw-worker-003"] }
              ],
              task_ledger: [],
              review_items: []
            }
          ]
        }
      ]
    };
  }

  function normalize(data) {
    var i;
    var j;
    var c;
    var d;

    if (!data || !data.companies) return baseData();
    if (!data.aiworkers) data.aiworkers = [];

    for (i = 0; i < data.companies.length; i += 1) {
      c = data.companies[i];
      if (!c.company_common_rules) c.company_common_rules = [];
      if (!c.departments) c.departments = [];
      for (j = 0; j < c.departments.length; j += 1) {
        d = c.departments[j];
        if (!d.organizations) d.organizations = [];
        if (!d.task_ledger) d.task_ledger = [];
        if (!d.review_items) d.review_items = [];
      }
    }

    return data;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (error) {
      return baseData();
    }
    return baseData();
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(data)));
  }

  function currentCompany(data) {
    var i;
    for (i = 0; i < data.companies.length; i += 1) {
      if (data.companies[i].id === app.companyId) return data.companies[i];
    }
    return data.companies[0] || null;
  }

  function currentDepartment(company) {
    var i;
    if (!company || !company.departments || !company.departments.length) return null;
    for (i = 0; i < company.departments.length; i += 1) {
      if (company.departments[i].id === app.departmentId) return company.departments[i];
    }
    return company.departments[0];
  }

  function currentOrganization(company) {
    var all = allOrganizations(company);
    var i;
    for (i = 0; i < all.length; i += 1) {
      if (all[i].org.id === app.organizationId) return all[i];
    }
    return all[0] || null;
  }

  function findCompany(data, id) {
    var i;
    for (i = 0; i < data.companies.length; i += 1) {
      if (data.companies[i].id === id) return data.companies[i];
    }
    return null;
  }

  function findDepartment(company, id) {
    var i;
    if (!company) return null;
    for (i = 0; i < company.departments.length; i += 1) {
      if (company.departments[i].id === id) return company.departments[i];
    }
    return null;
  }

  function findOrgInCompany(company, orgId) {
    var i;
    var j;
    if (!company) return null;
    for (i = 0; i < company.departments.length; i += 1) {
      for (j = 0; j < company.departments[i].organizations.length; j += 1) {
        if (company.departments[i].organizations[j].id === orgId) {
          return { dept: company.departments[i], org: company.departments[i].organizations[j] };
        }
      }
    }
    return null;
  }

  function findLedgerRow(dept, id) {
    var i;
    if (!dept) return null;
    for (i = 0; i < dept.task_ledger.length; i += 1) {
      if (dept.task_ledger[i].id === id) return dept.task_ledger[i];
    }
    return null;
  }

  function allOrganizations(company) {
    var rows = [];
    if (!company) return rows;
    company.departments.forEach(function (d) {
      d.organizations.forEach(function (o) {
        rows.push({ dept: d, org: o });
      });
    });
    return rows;
  }

  function robotLabels(data, ids) {
    var labels = [];
    data.aiworkers.forEach(function (w) {
      if (ids.indexOf(w.id) >= 0) labels.push(w.name + "@" + w.role);
    });
    return labels;
  }

  function selectedValues(id) {
    var select = document.getElementById(id);
    var values = [];
    var i;
    if (!select) return values;
    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].selected) values.push(select.options[i].value);
    }
    return values;
  }

  function companyOptions(data) {
    return data.companies.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (c.id === app.companyId ? " selected" : "") + '>' + esc(c.name) + '</option>';
    }).join("");
  }

  function departmentOptions(company, selected) {
    var selectedId = selected || app.departmentId;
    if (!company || !company.departments.length) return '<option value="">部門なし</option>';
    return company.departments.map(function (d) {
      return '<option value="' + esc(d.id) + '"' + (d.id === selectedId ? " selected" : "") + '>' + esc(d.name) + '</option>';
    }).join("");
  }

  function organizationOptions(company, selected) {
    var rows = allOrganizations(company);
    var selectedId = selected || app.organizationId;
    if (!rows.length) return '<option value="">組織なし</option>';
    return rows.map(function (r) {
      return '<option value="' + esc(r.org.id) + '"' + (r.org.id === selectedId ? " selected" : "") + '>' + esc(r.dept.name + " / " + r.org.name) + '</option>';
    }).join("");
  }

  function aiworkerOptions(data, selectedIds) {
    return data.aiworkers.map(function (w) {
      return '<option value="' + esc(w.id) + '"' + (selectedIds.indexOf(w.id) >= 0 ? " selected" : "") + '>' + esc(w.name + "@" + w.role) + '</option>';
    }).join("");
  }

  function tab(label, screen) {
    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : '') + '>' + label + '</button>';
  }

  function shell(body) {
    return [
      '<main class="aicm-shell">',
      '<header>',
      '<h1 class="aicm-title">AI企業運営アプリ</h1>',
      '<p class="aicm-sub">Phase AN / 設定・新規追加・詳細・編集削除を別画面化</p>',
      '<span class="aicm-badge">Phase AN</span>',
      '</header>',
      '<nav class="aicm-tabs">',
      tab("AI企業ダッシュボード", "dashboard"),
      tab("部門別タスク台帳", "task-ledger"),
      tab("レビュー・承認待ち一覧", "review"),
      '</nav>',
      body,
      '</main>'
    ].join("");
  }

  function field(label, id, value) {
    return '<div class="aicm-field"><label>' + esc(label) + '</label><input id="' + esc(id) + '" value="' + esc(value || "") + '"></div>';
  }

  function textArea(label, id, value) {
    return '<div class="aicm-field"><label>' + esc(label) + '</label><textarea id="' + esc(id) + '">' + esc(value || "") + '</textarea></div>';
  }

  function selectField(label, id, values, selected) {
    return '<div class="aicm-field"><label>' + esc(label) + '</label><select id="' + esc(id) + '">' + values.map(function (v) {
      return '<option value="' + esc(v) + '"' + (v === selected ? " selected" : "") + '>' + esc(v) + '</option>';
    }).join("") + '</select></div>';
  }

  function renderDashboard(data, company) {
    var totalTasks = 0;
    var totalReview = 0;
    var totalDone = 0;
    var orgRows = allOrganizations(company);

    if (company) {
      company.departments.forEach(function (d) {
        totalTasks += d.task_ledger.length;
        totalReview += d.review_items.length;
        d.task_ledger.forEach(function (r) {
          if (r.status === "完了") totalDone += 1;
        });
      });
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="dashboard">',
      '<div class="aicm-card"><h2>AI企業選択</h2>',
      '<div class="aicm-field"><label>AI企業</label><select id="company-select">' + companyOptions(data) + '</select></div>',
      '<button class="primary" data-action="switch-company">AI企業を表示</button>',
      '</div>',
      '<div class="aicm-card"><h2>会社概要</h2>',
      company ? '<p><strong>' + esc(company.name) + '</strong></p><p class="aicm-muted">' + esc(company.business_domain) + '</p><p>会社共通ルール: ' + company.company_common_rules.length + '件</p>' : '<p class="aicm-muted">会社なし</p>',
      '<div class="aicm-card-footer">',
      '<button class="primary" data-screen="settings">AI企業設定</button>',
      '<button class="primary" data-screen="company-add">AI企業新規追加</button>',
      '</div>',
      '</div>',
      '<div class="aicm-card"><h2>全体状況</h2>',
      '<p>部門数: ' + (company ? company.departments.length : 0) + '</p>',
      '<p>組織数: ' + orgRows.length + '</p>',
      '<p>台帳行: ' + totalTasks + '</p>',
      '<p>完了: ' + totalDone + '</p>',
      '<p>レビュー・承認待ち: ' + totalReview + '</p>',
      '</div>',
      '<div class="aicm-card"><h2>部門一覧</h2>',
      company && company.departments.length ? company.departments.map(function (d) {
        return '<div class="aicm-row"><strong>' + esc(d.name) + '</strong><p class="aicm-muted">' + esc(d.purpose) + '</p><p>組織: ' + d.organizations.length + ' / 台帳: ' + d.task_ledger.length + '</p></div>';
      }).join("") : '<p class="aicm-muted">部門なし。新規追加から作成してください。</p>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="department-detail">部門詳細</button><button class="primary" data-screen="department-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card"><h2>組織一覧</h2>',
      orgRows.length ? orgRows.map(function (r) {
        return '<div class="aicm-row"><strong>' + esc(r.org.name) + '</strong><p class="aicm-muted">' + esc(r.dept.name + " / " + r.org.purpose) + '</p><p>ロボット: ' + esc(robotLabels(data, r.org.robot_ids).join(" / ")) + '</p></div>';
      }).join("") : '<p class="aicm-muted">組織なし。先に部門を作成し、その後に組織を追加してください。</p>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-detail">組織詳細</button><button class="primary" data-screen="organization-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card"><h2>操作入口</h2>',
      '<p class="aicm-muted">台帳投入・進捗確認・承認のみをユーザー操作にします。</p>',
      '<button data-screen="task-ledger">部門別タスク台帳へ</button> ',
      '<button data-screen="review">レビュー・承認待ち一覧へ</button>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderCompanyAdd() {
    return shell([
      '<section class="aicm-grid" data-screen-scope="company-add">',
      '<div class="aicm-card aicm-wide"><h2>AI企業新規追加</h2><p class="aicm-muted">AI企業設定とは分けた新規追加専用画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card">',
      field("会社名", "new-company-name", "新規AI企業"),
      field("事業領域", "new-company-domain", "業務支援"),
      '<button class="primary" data-action="add-company">AI企業を追加</button>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderSettings(data, company) {
    var editing = app.editCompanyId ? findCompany(data, app.editCompanyId) : company;

    return shell([
      '<section class="aicm-grid" data-screen-scope="settings">',
      '<div class="aicm-card aicm-wide"><h2>AI企業設定</h2><p class="aicm-muted">会社変更・削除・会社共通ルール管理を行います。新規追加は別画面です。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>会社 変更・削除</h2>',
      '<div class="aicm-field"><label>変更対象</label><select id="edit-company-select">' + companyOptions(data) + '</select></div>',
      '<button data-action="load-company-edit">読み込み</button>',
      field("会社名", "edit-company-name", editing ? editing.name : ""),
      field("事業領域", "edit-company-domain", editing ? editing.business_domain : ""),
      '<button class="primary" data-action="save-company">会社を変更</button> ',
      '<button class="danger" data-action="delete-company">会社を削除</button>',
      '</div>',
      '<div class="aicm-card"><h2>会社共通ルール</h2>',
      '<div class="aicm-field"><label>会社共通ルールファイル</label><input id="common-rule-files" type="file" multiple></div>',
      '<button class="primary" data-action="add-common-rules">会社共通ルールを追加</button>',
      company && company.company_common_rules.length ? company.company_common_rules.map(function (f) {
        return '<span class="aicm-badge">' + esc(f.name) + '</span>';
      }).join("") : '<p class="aicm-muted">未登録</p>',
      '</div>',
      '<div class="aicm-card"><h2>新規追加</h2>',
      '<p class="aicm-muted">新規AI企業追加は別画面に分離しました。</p>',
      '<button class="primary" data-screen="company-add">AI企業新規追加へ</button>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderDepartmentDetail(company) {
    var dept = currentDepartment(company);

    return shell([
      '<section class="aicm-grid" data-screen-scope="department-detail">',
      '<div class="aicm-card aicm-wide"><h2>部門詳細</h2><p class="aicm-muted">部門を選択し、この画面内で変更・削除します。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>部門選択</h2>',
      '<div class="aicm-field"><label>部門</label><select id="department-select">' + departmentOptions(company) + '</select></div>',
      '<button class="primary" data-action="switch-department">部門を表示</button>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="department-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card aicm-wide"><h2>現在の部門</h2>',
      dept ? '<p><strong>' + esc(dept.name) + '</strong></p><p class="aicm-muted">' + esc(dept.purpose) + '</p><p>組織数: ' + dept.organizations.length + '</p><p>台帳行: ' + dept.task_ledger.length + '</p>' : '<p class="aicm-muted">部門がありません。新規追加を押して作成してください。</p>',
      '</div>',
      dept ? '<div class="aicm-card"><h2>部門変更・削除</h2>' +
        field("部門名", "edit-department-name", dept.name) +
        field("目的", "edit-department-purpose", dept.purpose) +
        '<div class="aicm-card-footer"><button class="primary" data-action="save-department">部門を変更</button><button class="danger" data-action="delete-department">部門を削除</button></div>' +
        '</div>' : '',
      '</section>'
    ].join(""));
  }
  function renderDepartmentAdd() {
    return shell([
      '<section class="aicm-grid" data-screen-scope="department-add">',
      '<div class="aicm-card aicm-wide"><h2>部門追加</h2><p class="aicm-muted">部門詳細とは分けた追加専用画面です。新規会社でもここから部門を作成できます。</p><button data-screen="department-detail">部門詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      field("部門名", "new-department-name", "新規部門"),
      field("目的", "new-department-purpose", "部門目的"),
      '<button class="primary" data-action="add-department">部門を追加</button>',
      '</div></section>'
    ].join(""));
  }

  function renderDepartmentEdit(company) {
    var dept = currentDepartment(company);
    if (!dept) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門変更</h2><p class="aicm-muted">変更できる部門がありません。</p><button data-screen="department-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="department-edit">',
      '<div class="aicm-card aicm-wide"><h2>部門変更</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      '<div class="aicm-field"><label>変更対象部門</label><select id="department-select">' + departmentOptions(company) + '</select></div>',
      '<button data-action="switch-department">読み込み</button>',
      field("部門名", "edit-department-name", dept.name),
      field("目的", "edit-department-purpose", dept.purpose),
      '<button class="primary" data-action="save-department">部門を変更</button>',
      '</div></section>'
    ].join(""));
  }

  function renderDepartmentDelete(company) {
    var dept = currentDepartment(company);
    return shell([
      '<section class="aicm-grid" data-screen-scope="department-delete">',
      '<div class="aicm-card aicm-wide"><h2>部門削除</h2><button data-screen="department-detail">部門詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      dept ? '<p>削除対象: <strong>' + esc(dept.name) + '</strong></p><button class="danger" data-action="delete-department">部門を削除</button>' : '<p class="aicm-muted">削除できる部門がありません。</p>',
      '</div></section>'
    ].join(""));
  }

  function renderOrganizationDetail(data, company) {
    var current = currentOrganization(company);
    var org = current ? current.org : null;

    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-detail">',
      '<div class="aicm-card aicm-wide"><h2>組織詳細</h2><p class="aicm-muted">組織を選択し、この画面内で変更・削除・ロボット配置変更を行います。分離するのは新規追加画面だけです。</p><button data-screen="dashboard">AI企業ダッシュボードへ戻る</button></div>',
      '<div class="aicm-card"><h2>組織選択</h2>',
      '<div class="aicm-field"><label>組織</label><select id="organization-select">' + organizationOptions(company) + '</select></div>',
      '<button class="primary" data-action="switch-organization">組織を表示</button>',
      '<div class="aicm-card-footer"><button class="primary" data-screen="organization-add">新規追加</button></div>',
      '</div>',
      '<div class="aicm-card aicm-wide"><h2>現在の組織</h2>',
      current ? '<p><strong>' + esc(org.name) + '</strong></p><p class="aicm-muted">' + esc(current.dept.name + " / " + org.purpose) + '</p><p>ロボット: ' + esc(robotLabels(data, org.robot_ids).join(" / ")) + '</p>' : '<p class="aicm-muted">組織がありません。先に部門を作成し、その後に新規追加を押してください。</p>',
      '</div>',
      current ? '<div class="aicm-card"><h2>組織変更・削除</h2>' +
        field("組織名", "edit-org-name", org.name) +
        field("目的", "edit-org-purpose", org.purpose) +
        '<div class="aicm-field"><label>ロボット配置</label><select id="edit-org-robots" multiple>' + aiworkerOptions(data, org.robot_ids) + '</select></div>' +
        '<div class="aicm-card-footer"><button class="primary" data-action="save-organization">組織を変更</button><button class="danger" data-action="delete-organization">組織を削除</button></div>' +
        '</div>' : '',
      '</section>'
    ].join(""));
  }
  function renderOrganizationAdd(data, company) {
    if (!company || !company.departments.length) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織追加</h2><p class="aicm-muted">組織を追加するには先に部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-add">',
      '<div class="aicm-card aicm-wide"><h2>組織追加</h2><p class="aicm-muted">組織詳細とは分けた追加専用画面です。</p><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      '<div class="aicm-field"><label>所属部門</label><select id="org-add-department">' + departmentOptions(company) + '</select></div>',
      field("組織名", "new-org-name", "新規組織"),
      field("目的", "new-org-purpose", "組織目的"),
      '<div class="aicm-field"><label>ロボット配置</label><select id="new-org-robots" multiple>' + aiworkerOptions(data, []) + '</select></div>',
      '<button class="primary" data-action="add-organization">組織を追加</button>',
      '</div></section>'
    ].join(""));
  }

  function renderOrganizationEdit(data, company) {
    var current = currentOrganization(company);
    var org = current ? current.org : null;

    if (!org) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>組織変更</h2><p class="aicm-muted">変更できる組織がありません。</p><button data-screen="organization-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-edit">',
      '<div class="aicm-card aicm-wide"><h2>組織変更</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      '<div class="aicm-field"><label>変更対象組織</label><select id="organization-select">' + organizationOptions(company) + '</select></div>',
      '<button data-action="switch-organization">読み込み</button>',
      field("組織名", "edit-org-name", org.name),
      field("目的", "edit-org-purpose", org.purpose),
      '<div class="aicm-field"><label>ロボット配置</label><select id="edit-org-robots" multiple>' + aiworkerOptions(data, org.robot_ids) + '</select></div>',
      '<button class="primary" data-action="save-organization">組織を変更</button>',
      '</div></section>'
    ].join(""));
  }

  function renderOrganizationDelete(company) {
    var current = currentOrganization(company);
    return shell([
      '<section class="aicm-grid" data-screen-scope="organization-delete">',
      '<div class="aicm-card aicm-wide"><h2>組織削除</h2><button data-screen="organization-detail">組織詳細へ戻る</button></div>',
      '<div class="aicm-card">',
      current ? '<p>削除対象: <strong>' + esc(current.org.name) + '</strong></p><p class="aicm-muted">' + esc(current.dept.name) + '</p><button class="danger" data-action="delete-organization">組織を削除</button>' : '<p class="aicm-muted">削除できる組織がありません。</p>',
      '</div></section>'
    ].join(""));
  }

  function renderTaskLedger(company) {
    var dept = currentDepartment(company);

    if (!dept) {
      return shell('<section class="aicm-grid"><div class="aicm-card"><h2>部門別タスク台帳</h2><p class="aicm-muted">台帳を使うには部門が必要です。</p><button class="primary" data-screen="department-add">新規追加へ</button></div></section>');
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="task-ledger">',
      '<div class="aicm-card"><h2>部門選択</h2>',
      '<div class="aicm-field"><label>部門</label><select id="department-select">' + departmentOptions(company) + '</select></div>',
      '<button data-action="switch-department">部門を表示</button>',
      '</div>',
      '<div class="aicm-card"><h2>台帳 追加</h2>',
      field("成果物名", "add-deliverable", "窓口業務システム"),
      field("タスク名", "add-task", "窓口業務システム設計"),
      selectField("仕事種別", "add-work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], "設計"),
      selectField("状態", "add-status", ["未着手", "進行中", "レビュー中", "完了", "保留"], "未着手"),
      selectField("優先度", "add-priority", ["高", "中", "低"], "中"),
      field("期限", "add-due-date", ""),
      field("参照ファイル", "add-reference", ""),
      field("補足資料", "add-supplemental", ""),
      textArea("補足メモ", "add-note", ""),
      '<button class="primary" data-action="add-ledger-row">台帳行を追加</button>',
      '</div>',
      '<div class="aicm-card"><h2>台帳 変更・削除</h2>',
      '<div class="aicm-field"><label>台帳行</label><select id="edit-ledger-select">' + ledgerOptions(dept) + '</select></div>',
      '<button data-action="load-ledger-edit">読み込み</button>',
      '<div id="ledger-edit-form">' + renderLedgerEditForm(dept) + '</div>',
      '</div>',
      '<div class="aicm-card aicm-wide"><h2>台帳一覧</h2>',
      renderLedgerTable(dept),
      '</div>',
      '<div class="aicm-card"><h2>CSV操作</h2>',
      '<div class="aicm-field"><label>CSVファイル</label><input id="csv-file" type="file" accept=".csv,text/csv"></div>',
      '<button class="primary" data-action="preview-csv">プレビュー</button> ',
      '<button class="primary" data-action="import-csv">取り込み</button>',
      '<div id="csv-preview"><p class="aicm-muted">未プレビュー</p></div>',
      '</div>',
      '<div class="aicm-card"><h2>作成テンプレ</h2>',
      '<button class="primary" data-action="copy-csv-prompt">CSV作成プロンプトをコピー</button>',
      '<p id="copy-result" class="aicm-muted"></p>',
      '<textarea class="aicm-output" readonly>' + esc(csvPrompt) + '</textarea>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function ledgerOptions(dept) {
    if (!dept || !dept.task_ledger.length) return '<option value="">台帳行なし</option>';
    return dept.task_ledger.map(function (r) {
      return '<option value="' + esc(r.id) + '"' + (r.id === app.editLedgerId ? " selected" : "") + '>' + esc(r.deliverable_name + " / " + r.task_name) + '</option>';
    }).join("");
  }

  function renderLedgerEditForm(dept) {
    var row = app.editLedgerId ? findLedgerRow(dept, app.editLedgerId) : dept.task_ledger[0];
    if (!row) return '<p class="aicm-muted">変更する台帳行を選んでください。</p>';

    return [
      '<input id="edit-ledger-id" type="hidden" value="' + esc(row.id) + '">',
      field("成果物名", "edit-deliverable", row.deliverable_name),
      field("タスク名", "edit-task", row.task_name),
      selectField("仕事種別", "edit-work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], row.work_type),
      selectField("状態", "edit-status", ["未着手", "進行中", "レビュー中", "完了", "保留"], row.status),
      selectField("優先度", "edit-priority", ["高", "中", "低"], row.priority),
      field("期限", "edit-due-date", row.due_date),
      field("参照ファイル", "edit-reference", row.reference_files),
      field("補足資料", "edit-supplemental", row.supplemental_materials),
      textArea("補足メモ", "edit-note", row.note),
      '<button class="primary" data-action="save-ledger-row">台帳を変更</button> ',
      '<button class="danger" data-action="delete-ledger-row">台帳を削除</button>'
    ].join("");
  }

  function renderLedgerTable(dept) {
    if (!dept || !dept.task_ledger.length) return '<p class="aicm-muted">台帳行なし</p>';
    return [
      '<table class="aicm-table">',
      '<thead><tr><th>成果物名</th><th>タスク名</th><th>仕事種別</th><th>状態</th><th>優先度</th><th>参照ファイル</th><th>補足資料</th></tr></thead>',
      '<tbody>',
      dept.task_ledger.map(function (r) {
        return '<tr><td>' + esc(r.deliverable_name) + '</td><td>' + esc(r.task_name) + '</td><td>' + esc(r.work_type) + '</td><td>' + esc(r.status) + '</td><td>' + esc(r.priority) + '</td><td>' + esc(r.reference_files) + '</td><td>' + esc(r.supplemental_materials) + '</td></tr>';
      }).join(""),
      '</tbody></table>'
    ].join("");
  }

  function renderReview(company) {
    var items = [];
    if (company) {
      company.departments.forEach(function (d) {
        d.review_items.forEach(function (r) {
          items.push({ department: d.name, item: r });
        });
      });
    }

    return shell([
      '<section class="aicm-grid" data-screen-scope="review">',
      '<div class="aicm-card"><h2>レビュー・承認待ち一覧</h2>',
      '<p class="aicm-muted">AI自動レビュー後の納品候補を人間が最終確認します。</p>',
      items.length ? items.map(function (x) {
        return '<div class="aicm-row warn"><strong>' + esc(x.item.title) + '</strong><p class="aicm-muted">' + esc(x.department + " / " + x.item.status + " / " + x.item.target) + '</p><p>' + esc(x.item.note) + '</p><button class="ok" data-action="approve-review" data-review-id="' + esc(x.item.id) + '">承認</button> <button class="danger" data-action="reject-review" data-review-id="' + esc(x.item.id) + '">差し戻し</button></div>';
      }).join("") : '<p class="aicm-muted">承認待ちはありません。</p>',
      '</div>',
      '<div class="aicm-card"><h2>自動処理ステータス</h2>',
      '<p>Manager分解: 自動</p>',
      '<p>Leader割当: 自動</p>',
      '<p>Worker成果物作成: 自動</p>',
      '<p>AI自動レビュー: 自動</p>',
      '<p>人間操作: 最終承認のみ</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function render() {
    var data = load();
    var company = currentCompany(data);
    var html;

    if (app.screen === "dashboard") html = renderDashboard(data, company);
    else if (app.screen === "company-add") html = renderCompanyAdd();
    else if (app.screen === "settings") html = renderSettings(data, company);
    else if (app.screen === "department-detail") html = renderDepartmentDetail(company);
    else if (app.screen === "department-add") html = renderDepartmentAdd();
    else if (app.screen === "department-edit") html = renderDepartmentEdit(company);
    else if (app.screen === "department-delete") html = renderDepartmentDelete(company);
    else if (app.screen === "organization-detail") html = renderOrganizationDetail(data, company);
    else if (app.screen === "organization-add") html = renderOrganizationAdd(data, company);
    else if (app.screen === "organization-edit") html = renderOrganizationEdit(data, company);
    else if (app.screen === "organization-delete") html = renderOrganizationDelete(company);
    else if (app.screen === "task-ledger") html = renderTaskLedger(company);
    else if (app.screen === "review") html = renderReview(company);
    else html = renderDashboard(data, company);

    document.getElementById("aicm-root").innerHTML = html;
    bind();
  }

  function bind() {
    document.querySelectorAll("[data-screen]").forEach(function (button) {
      button.onclick = function () {
        app.screen = button.getAttribute("data-screen");
        render();
      };
    });

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.onclick = function () {
        handleAction(button.getAttribute("data-action"), button);
      };
    });
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function handleAction(action, button) {
    var data = load();
    var company = currentCompany(data);
    var dept = currentDepartment(company);
    var orgInfo;

    if (action === "switch-company") {
      app.companyId = val("company-select");
      company = currentCompany(data);
      app.departmentId = company && company.departments[0] ? company.departments[0].id : "";
      app.organizationId = company && company.departments[0] && company.departments[0].organizations[0] ? company.departments[0].organizations[0].id : "";
      render();
      return;
    }

    if (action === "add-company") {
      var newCompany = {
        id: makeId("company"),
        name: val("new-company-name"),
        business_domain: val("new-company-domain"),
        company_common_rules: [],
        departments: []
      };
      data.companies.push(newCompany);
      app.companyId = newCompany.id;
      app.departmentId = "";
      app.organizationId = "";
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }

    if (action === "load-company-edit") {
      app.editCompanyId = val("edit-company-select");
      render();
      return;
    }

    if (action === "save-company") {
      var editCompany = findCompany(data, val("edit-company-select"));
      if (editCompany) {
        editCompany.name = val("edit-company-name");
        editCompany.business_domain = val("edit-company-domain");
      }
      save(data);
      render();
      return;
    }

    if (action === "delete-company") {
      if (data.companies.length > 1) {
        data.companies = data.companies.filter(function (c) { return c.id !== val("edit-company-select"); });
        app.companyId = data.companies[0].id;
        app.departmentId = data.companies[0].departments[0] ? data.companies[0].departments[0].id : "";
      }
      save(data);
      app.screen = "dashboard";
      render();
      return;
    }

    if (action === "add-common-rules") {
      var files = document.getElementById("common-rule-files").files || [];
      Array.prototype.forEach.call(files, function (f) {
        company.company_common_rules.push({ name: f.name, size: f.size });
      });
      save(data);
      render();
      return;
    }

    if (action === "switch-department") {
      app.departmentId = val("department-select");
      render();
      return;
    }

    if (action === "add-department") {
      var newDept = {
        id: makeId("dept"),
        name: val("new-department-name"),
        purpose: val("new-department-purpose"),
        organizations: [],
        task_ledger: [],
        review_items: []
      };
      company.departments.push(newDept);
      app.departmentId = newDept.id;
      save(data);
      app.screen = "department-detail";
      render();
      return;
    }

    if (action === "save-department") {
      dept = currentDepartment(company);
      if (dept) {
        dept.name = val("edit-department-name");
        dept.purpose = val("edit-department-purpose");
      }
      save(data);
      app.screen = "department-detail";
      render();
      return;
    }

    if (action === "delete-department") {
      if (dept) {
        company.departments = company.departments.filter(function (d) { return d.id !== app.departmentId; });
        app.departmentId = company.departments[0] ? company.departments[0].id : "";
        app.organizationId = company.departments[0] && company.departments[0].organizations[0] ? company.departments[0].organizations[0].id : "";
      }
      save(data);
      app.screen = "department-detail";
      render();
      return;
    }

    if (action === "switch-organization") {
      app.organizationId = val("organization-select");
      orgInfo = findOrgInCompany(company, app.organizationId);
      if (orgInfo) app.departmentId = orgInfo.dept.id;
      render();
      return;
    }

    if (action === "add-organization") {
      var targetDept = findDepartment(company, val("org-add-department")) || dept;
      if (!targetDept) {
        app.screen = "department-add";
        render();
        return;
      }
      var newOrg = {
        id: makeId("org"),
        name: val("new-org-name"),
        parent_id: "",
        purpose: val("new-org-purpose"),
        robot_ids: selectedValues("new-org-robots")
      };
      targetDept.organizations.push(newOrg);
      app.departmentId = targetDept.id;
      app.organizationId = newOrg.id;
      save(data);
      app.screen = "organization-detail";
      render();
      return;
    }

    if (action === "save-organization") {
      orgInfo = findOrgInCompany(company, app.organizationId);
      if (orgInfo) {
        orgInfo.org.name = val("edit-org-name");
        orgInfo.org.purpose = val("edit-org-purpose");
        orgInfo.org.robot_ids = selectedValues("edit-org-robots");
      }
      save(data);
      app.screen = "organization-detail";
      render();
      return;
    }

    if (action === "delete-organization") {
      orgInfo = findOrgInCompany(company, app.organizationId);
      if (orgInfo) {
        orgInfo.dept.organizations = orgInfo.dept.organizations.filter(function (o) { return o.id !== app.organizationId; });
        app.organizationId = orgInfo.dept.organizations[0] ? orgInfo.dept.organizations[0].id : "";
      }
      save(data);
      app.screen = "organization-detail";
      render();
      return;
    }

    if (action === "add-ledger-row") {
      if (!dept) return;
      dept.task_ledger.push({
        id: makeId("tl"),
        deliverable_name: val("add-deliverable"),
        task_name: val("add-task"),
        work_type: val("add-work-type"),
        status: val("add-status"),
        priority: val("add-priority"),
        due_date: val("add-due-date"),
        reference_files: val("add-reference"),
        supplemental_materials: val("add-supplemental"),
        note: val("add-note")
      });
      save(data);
      render();
      return;
    }

    if (action === "load-ledger-edit") {
      app.editLedgerId = val("edit-ledger-select");
      render();
      return;
    }

    if (action === "save-ledger-row") {
      var row = findLedgerRow(dept, val("edit-ledger-id"));
      if (row) {
        row.deliverable_name = val("edit-deliverable");
        row.task_name = val("edit-task");
        row.work_type = val("edit-work-type");
        row.status = val("edit-status");
        row.priority = val("edit-priority");
        row.due_date = val("edit-due-date");
        row.reference_files = val("edit-reference");
        row.supplemental_materials = val("edit-supplemental");
        row.note = val("edit-note");
      }
      save(data);
      render();
      return;
    }

    if (action === "delete-ledger-row") {
      if (dept) {
        dept.task_ledger = dept.task_ledger.filter(function (r) { return r.id !== val("edit-ledger-id"); });
      }
      app.editLedgerId = "";
      save(data);
      render();
      return;
    }

    if (action === "preview-csv") {
      previewCsv();
      return;
    }

    if (action === "import-csv") {
      if (!dept) return;
      CSV_ROWS.forEach(function (r) {
        if (validCsvRow(r).length === 0) {
          dept.task_ledger.push(csvToRow(r));
        }
      });
      save(data);
      render();
      return;
    }

    if (action === "copy-csv-prompt") {
      copyText(csvPrompt);
      document.getElementById("copy-result").textContent = "コピーしました。";
      return;
    }

    if (action === "approve-review" || action === "reject-review") {
      updateReview(data, button.getAttribute("data-review-id"), action === "approve-review" ? "承認済み" : "差し戻し");
      save(data);
      render();
    }
  }

  function updateReview(data, id, status) {
    data.companies.forEach(function (c) {
      c.departments.forEach(function (d) {
        d.review_items.forEach(function (r) {
          if (r.id === id) r.status = status;
        });
      });
    });
  }

  function parseCsv(text) {
    var rows = [];
    var current = [];
    var field = "";
    var inQuotes = false;
    var i;
    var ch;
    var next;

    for (i = 0; i < text.length; i += 1) {
      ch = text[i];
      next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        current.push(field);
        field = "";
      } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (ch === "\r" && next === "\n") i += 1;
        current.push(field);
        if (current.join("").trim()) rows.push(current);
        current = [];
        field = "";
      } else {
        field += ch;
      }
    }

    current.push(field);
    if (current.join("").trim()) rows.push(current);

    if (!rows.length) return [];

    var header = rows[0].map(function (x) { return x.trim(); });
    return rows.slice(1).map(function (r) {
      var obj = {};
      header.forEach(function (h, idx) { obj[h] = r[idx] || ""; });
      return obj;
    });
  }

  function previewCsv() {
    var input = document.getElementById("csv-file");
    var preview = document.getElementById("csv-preview");

    if (!input.files || !input.files[0]) {
      preview.innerHTML = '<p style="color:#9f1239;">CSVファイルが未選択です。</p>';
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      CSV_ROWS = parseCsv(String(reader.result || ""));
      preview.innerHTML = CSV_ROWS.map(function (r) {
        var errors = validCsvRow(r);
        return '<div class="aicm-row"><strong>' + esc(r.deliverable_name || "(成果物名なし)") + '</strong><p class="aicm-muted">' + esc(r.task_name || "") + '</p>' + (errors.length ? '<p style="color:#9f1239;">ERROR: ' + esc(errors.join(" / ")) + '</p>' : '<p class="aicm-row ok">OK</p>') + '</div>';
      }).join("");
    };
    reader.readAsText(input.files[0]);
  }

  function validCsvRow(r) {
    var errors = [];
    if (!String(r.deliverable_name || "").trim()) errors.push("deliverable_name required");
    if (!String(r.task_name || "").trim()) errors.push("task_name required");
    if (["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"].indexOf(r.work_type) < 0) errors.push("work_type invalid");
    if (["未着手", "進行中", "レビュー中", "完了", "保留"].indexOf(r.status) < 0) errors.push("status invalid");
    return errors;
  }

  function csvToRow(r) {
    return {
      id: makeId("tl"),
      deliverable_name: r.deliverable_name || "",
      task_name: r.task_name || "",
      work_type: r.work_type || "",
      status: r.status || "未着手",
      priority: r.priority || "",
      due_date: r.due_date || "",
      reference_files: r.reference_files || "",
      supplemental_materials: r.supplemental_materials || "",
      note: r.note || ""
    };
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }

  document.addEventListener("DOMContentLoaded", render);
})();
