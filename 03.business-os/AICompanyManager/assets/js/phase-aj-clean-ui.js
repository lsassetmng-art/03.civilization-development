(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AJ_CLEAN_STATE";
  var CSV_ROWS = [];

  var csvPrompt = [
    "以下の条件で、AICompanyManagerにアップロードする部門別タスク台帳CSVを作成してください。",
    "",
    "CSVヘッダー:",
    "deliverable_name,task_name,work_type,responsible_role,status,priority,due_date,responsible_robot,reference_files,supplemental_materials,applicable_rules,note",
    "",
    "入力ルール:",
    "- deliverable_name は成果物名",
    "- task_name は具体的な作業名",
    "- work_type は 設計 / 実装 / デザイン / 修正 / 調査 / レビュー / 資料作成 / 納品準備 / 引き継ぎ のいずれか",
    "- responsible_role は Manager / Leader / Worker のいずれか",
    "- status は 未着手 / 進行中 / レビュー中 / 完了 / 保留 のいずれか",
    "- priority は 高 / 中 / 低 のいずれか",
    "- due_date は YYYY-MM-DD 形式。未定なら空欄",
    "- responsible_robot は未定なら空欄",
    "- reference_files は作業前・作業中に読む資料。複数ある場合は | で区切る",
    "- supplemental_materials は補足資料。複数ある場合は | で区切る",
    "- applicable_rules は適用ルール。複数ある場合は | で区切る",
    "- note は短い補足だけ",
    "",
    "出力条件:",
    "- CSVのみ出力",
    "- 説明文は付けない",
    "- Markdownコードブロックに入れない"
  ].join("\n");

  var app = {
    screen: "dashboard",
    companyId: "company-001",
    departmentId: "dept-dev"
  };

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
        { id: "aiw-manager-001", name: "Manager Alpha", role: "Manager", department_id: "dept-dev" },
        { id: "aiw-leader-001", name: "Leader Alpha", role: "Leader", department_id: "dept-dev" },
        { id: "aiw-worker-001", name: "Worker Alpha", role: "Worker", department_id: "dept-dev" },
        { id: "aiw-worker-002", name: "Worker Beta", role: "Worker", department_id: "dept-dev" },
        { id: "aiw-leader-002", name: "Design Leader", role: "Leader", department_id: "dept-design" },
        { id: "aiw-worker-003", name: "Design Worker", role: "Worker", department_id: "dept-design" }
      ],
      companies: [
        {
          id: "company-001",
          name: "AI Company Alpha",
          domain: "業務設計・制作・開発支援",
          company_common_rules: [],
          departments: [
            {
              id: "dept-dev",
              name: "開発部",
              purpose: "設計・実装・テスト",
              inbox: [],
              task_ledger: [
                {
                  id: "tl-001",
                  deliverable_name: "AICompanyManager",
                  task_name: "AICompanyManager会社共通ルール反映確認",
                  work_type: "レビュー",
                  responsible_role: "Leader",
                  responsible_robot: "aiw-leader-001",
                  status: "未着手",
                  priority: "高",
                  due_date: "",
                  reference_files: "AICompanyManager統合設計.md|会社共通ルール",
                  supplemental_materials: "画面スクリーンショット|操作メモ",
                  applicable_rules: "会社共通ルール",
                  note: "設計開発規約欄を分離しない",
                  handoff_link: ""
                }
              ],
              manager_rows: [],
              leader_rows: [],
              deliverables: []
            },
            {
              id: "dept-design",
              name: "デザイン部",
              purpose: "デザイン制作・資料作成",
              inbox: [],
              task_ledger: [],
              manager_rows: [],
              leader_rows: [],
              deliverables: []
            }
          ],
          work_packets: [],
          handoffs: []
        }
      ]
    };
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function normalize(data) {
    var c;
    var d;
    var i;
    var j;

    if (!data || !data.companies) return baseData();

    for (i = 0; i < data.companies.length; i += 1) {
      c = data.companies[i];
      if (!c.company_common_rules) c.company_common_rules = [];
      if (!c.departments) c.departments = [];
      if (!c.work_packets) c.work_packets = [];
      if (!c.handoffs) c.handoffs = [];
      for (j = 0; j < c.departments.length; j += 1) {
        d = c.departments[j];
        if (!d.inbox) d.inbox = [];
        if (!d.task_ledger) d.task_ledger = [];
        if (!d.manager_rows) d.manager_rows = [];
        if (!d.leader_rows) d.leader_rows = [];
        if (!d.deliverables) d.deliverables = [];
      }
    }
    return data;
  }

  function data() {
    return load();
  }

  function company(dataObj) {
    return dataObj.companies[0];
  }

  function department(companyObj) {
    var i;
    for (i = 0; i < companyObj.departments.length; i += 1) {
      if (companyObj.departments[i].id === app.departmentId) return companyObj.departments[i];
    }
    return companyObj.departments[0];
  }

  function departmentsOptions(companyObj) {
    var html = "";
    companyObj.departments.forEach(function (d) {
      html += '<option value="' + esc(d.id) + '"' + (d.id === app.departmentId ? " selected" : "") + ">" + esc(d.name) + "</option>";
    });
    return html;
  }

  function robotOptions(dataObj, deptId, role, selected) {
    var html = "";
    dataObj.aiworkers.forEach(function (w) {
      if (w.department_id === deptId && w.role === role) {
        html += '<option value="' + esc(w.id) + '"' + (w.id === selected ? " selected" : "") + ">" + esc(w.name + "@" + w.role) + "</option>";
      }
    });
    if (!html) html = '<option value="">候補なし</option>';
    return html;
  }

  function tab(label, screen) {
    return '<button data-screen="' + screen + '"' + (app.screen === screen ? ' class="primary"' : "") + ">" + label + "</button>";
  }

  function shell(body) {
    return [
      '<main class="aicm-shell">',
      '<header class="aicm-header">',
      '<h1 class="aicm-title">AI企業運営アプリ</h1>',
      '<p class="aicm-sub">Phase AJ / 画面スコープ整理 / 会社ダッシュボードは概要専用</p>',
      '<span class="aicm-badge">Phase AJ</span>',
      '</header>',
      '<nav class="aicm-tabs">',
      tab("会社ダッシュボード", "dashboard"),
      tab("会社共通ルール", "company-rules"),
      tab("部門別タスク台帳", "task-ledger"),
      tab("仕事操作", "work-packet"),
      tab("部門受信箱", "inbox"),
      tab("CSV作成テンプレ", "csv-template"),
      tab("引き継ぎ", "handoff"),
      '</nav>',
      body,
      '</main>'
    ].join("");
  }

  function renderDashboard(companyObj) {
    var totalTasks = 0;
    var totalInbox = 0;
    var totalDone = 0;

    companyObj.departments.forEach(function (d) {
      totalTasks += d.task_ledger.length;
      totalInbox += d.inbox.length;
      d.task_ledger.forEach(function (r) {
        if (r.status === "完了") totalDone += 1;
      });
    });

    return shell([
      '<section class="aicm-grid" data-screen-scope="dashboard">',
      '<div class="aicm-card"><h2>会社概要</h2>',
      '<p><strong>' + esc(companyObj.name) + '</strong></p>',
      '<p class="aicm-muted">' + esc(companyObj.domain) + '</p>',
      '<p>会社共通ルール: ' + companyObj.company_common_rules.length + '件</p>',
      '</div>',
      '<div class="aicm-card"><h2>全体状況</h2>',
      '<p>部門数: ' + companyObj.departments.length + '</p>',
      '<p>台帳行: ' + totalTasks + '</p>',
      '<p>受信箱: ' + totalInbox + '</p>',
      '<p>完了: ' + totalDone + '</p>',
      '</div>',
      '<div class="aicm-card"><h2>部門一覧</h2>',
      companyObj.departments.map(function (d) {
        return '<div class="aicm-row"><strong>' + esc(d.name) + '</strong><p class="aicm-muted">' + esc(d.purpose) + '</p><p>台帳: ' + d.task_ledger.length + ' / 受信: ' + d.inbox.length + '</p></div>';
      }).join(""),
      '</div>',
      '<div class="aicm-card"><h2>操作入口</h2>',
      '<p class="aicm-muted">CSVアップロード、配布操作、台帳行の変更はこの画面には表示しません。</p>',
      '<p>必要な操作は上部タブから開いてください。</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderCompanyRules(companyObj) {
    return shell([
      '<section class="aicm-grid" data-screen-scope="company-rules">',
      '<div class="aicm-card"><h2>会社共通ルール</h2>',
      '<p class="aicm-muted">会社規約・設計開発規約・品質基準・禁止事項・納品基準をこの1つに統合します。</p>',
      '<div class="aicm-field"><label>会社共通ルールファイル</label><input id="common-rule-files" type="file" multiple></div>',
      '<button class="primary" data-action="add-common-rules">会社共通ルールを追加</button>',
      '</div>',
      '<div class="aicm-card"><h2>登録済み</h2>',
      companyObj.company_common_rules.length ? companyObj.company_common_rules.map(function (f) {
        return '<div class="aicm-row"><strong>' + esc(f.name) + '</strong><p class="aicm-muted">会社共通ルール</p></div>';
      }).join("") : '<p class="aicm-muted">未登録</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderTaskLedger(dataObj, companyObj, dept) {
    return shell([
      '<section class="aicm-grid" data-screen-scope="task-ledger">',
      '<div class="aicm-card"><h2>部門選択</h2>',
      '<div class="aicm-field"><label>部門</label><select id="department-select">' + departmentsOptions(companyObj) + '</select></div>',
      '<button data-action="switch-department">部門を表示</button>',
      '</div>',
      '<div class="aicm-card"><h2>台帳行追加</h2>',
      field("成果物名", "add-deliverable", "窓口業務システム"),
      field("タスク名", "add-task", "窓口業務システム設計書作成"),
      selectField("仕事種別", "add-work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], "設計"),
      selectField("担当ロール", "add-role", ["Manager", "Leader", "Worker"], "Leader"),
      '<div class="aicm-field"><label>担当ロボット</label><select id="add-robot">' + robotOptions(dataObj, dept.id, "Leader", "") + '</select></div>',
      field("参照ファイル（|区切り）", "add-reference", ""),
      field("補足資料（|区切り）", "add-supplemental", ""),
      selectField("状態", "add-status", ["未着手", "進行中", "レビュー中", "完了", "保留"], "未着手"),
      '<button class="primary" data-action="add-ledger-row">台帳行を追加</button>',
      '</div>',
      '<div class="aicm-card"><h2>CSVアップロード</h2>',
      '<p class="aicm-muted">この操作は部門別タスク台帳画面だけに表示します。</p>',
      '<div class="aicm-field"><label>CSVファイル</label><input id="csv-file" type="file" accept=".csv,text/csv"></div>',
      '<button class="primary" data-action="preview-csv">CSVプレビュー</button> ',
      '<button class="primary" data-action="import-csv">正常行を一括追加</button>',
      '<div id="csv-preview"><p class="aicm-muted">未プレビュー</p></div>',
      '</div>',
      '<div class="aicm-card"><h2>台帳行の変更</h2>',
      '<div class="aicm-field"><label>変更する台帳行</label><select id="edit-row">' + dept.task_ledger.map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.deliverable_name + " / " + r.task_name) + '</option>';
      }).join("") + '</select></div>',
      '<button class="primary" data-action="load-edit-row">選択行を読み込む</button> ',
      '<button class="danger" data-action="delete-row">選択行を削除</button>',
      '<div id="edit-form"><p class="aicm-muted">選択行を読み込んでください。</p></div>',
      '</div>',
      '<div class="aicm-card"><h2>台帳一覧</h2>',
      dept.task_ledger.length ? dept.task_ledger.map(rowHtml).join("") : '<p class="aicm-muted">台帳行なし</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderWorkPacket(companyObj) {
    return shell([
      '<section class="aicm-grid" data-screen-scope="work-packet">',
      '<div class="aicm-card"><h2>仕事パケット作成</h2>',
      field("仕事名", "work-name", "新規仕事パケット"),
      selectField("ルート", "route-type", ["president_policy_route", "user_to_manager_route", "user_to_leader_route"], "president_policy_route"),
      selectField("仕事種別", "work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], "設計"),
      '<div class="aicm-field"><label>一括配布先部門</label><select id="work-dept">' + departmentsOptions(companyObj) + '</select></div>',
      selectField("配布方法", "delivery-mode", ["部門Managerに渡す", "部門Leaderに渡す", "部門全体に通知", "子部門含む", "指定ロールへ配布"], "部門Leaderに渡す"),
      '<button class="primary" data-action="create-work-packet">仕事パケットを作成して部門へ一括配布</button>',
      '</div>',
      '<div class="aicm-card"><h2>作成済み</h2>',
      companyObj.work_packets.length ? companyObj.work_packets.map(function (w) {
        return '<div class="aicm-row"><strong>' + esc(w.name) + '</strong><p class="aicm-muted">' + esc(w.route_type + " / " + w.delivery_mode) + '</p></div>';
      }).join("") : '<p class="aicm-muted">未作成</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderInbox(companyObj, dept) {
    return shell([
      '<section class="aicm-grid" data-screen-scope="inbox">',
      '<div class="aicm-card"><h2>部門受信箱</h2>',
      '<div class="aicm-field"><label>部門</label><select id="department-select">' + departmentsOptions(companyObj) + '</select></div>',
      '<button data-action="switch-department">部門を表示</button>',
      dept.inbox.length ? dept.inbox.map(function (x) {
        return '<div class="aicm-row"><strong>' + esc(x.name) + '</strong><p class="aicm-muted">' + esc(x.route_type + " / " + x.status) + '</p></div>';
      }).join("") : '<p class="aicm-muted">受信仕事なし</p>',
      '</div>',
      '<div class="aicm-card"><h2>配布操作</h2>',
      '<p class="aicm-muted">この操作は部門受信箱だけに表示します。</p>',
      '<button class="primary" data-action="manager-to-leader">ManagerからLeaderへ配布</button> ',
      '<button class="primary" data-action="leader-to-worker">LeaderからWorkerへ配布</button>',
      '<div id="distribution-result"></div>',
      '</div>',
      '<div class="aicm-card"><h2>Manager 粗分解表</h2>',
      field("大分類", "manager-area", "金融業務システム"),
      field("目的", "manager-purpose", "業務全体を整理する"),
      '<button class="primary" data-action="add-manager-row">Manager行を追加</button>',
      dept.manager_rows.map(function (r) {
        return '<div class="aicm-row"><strong>' + esc(r.area) + '</strong><p class="aicm-muted">' + esc(r.purpose) + '</p></div>';
      }).join(""),
      '</div>',
      '<div class="aicm-card"><h2>Leader タスク分解</h2>',
      field("成果物名", "leader-deliverable", "窓口業務システム"),
      field("タスク名", "leader-task", "窓口業務システム設計書作成"),
      '<button class="primary" data-action="add-leader-row">Leaderタスク行を追加</button>',
      dept.leader_rows.map(function (r) {
        return '<div class="aicm-row"><strong>' + esc(r.deliverable_name) + '</strong><p class="aicm-muted">' + esc(r.task_name) + '</p></div>';
      }).join(""),
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderCsvTemplate() {
    var header = "deliverable_name,task_name,work_type,responsible_role,status,priority,due_date,responsible_robot,reference_files,supplemental_materials,applicable_rules,note";
    return shell([
      '<section class="aicm-grid" data-screen-scope="csv-template">',
      '<div class="aicm-card"><h2>CSV作成テンプレ</h2>',
      '<p class="aicm-muted">この画面だけにChatGPT用プロンプトを表示します。</p>',
      '<button class="primary" data-action="copy-prompt">ChatGPT用プロンプトをコピー</button>',
      '<p id="copy-result" class="aicm-muted"></p>',
      '<textarea class="aicm-output" readonly>' + esc(csvPrompt) + '</textarea>',
      '</div>',
      '<div class="aicm-card"><h2>CSVヘッダー</h2>',
      '<textarea class="aicm-output" readonly>' + esc(header) + '</textarea>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function renderHandoff(companyObj) {
    return shell([
      '<section class="aicm-grid" data-screen-scope="handoff">',
      '<div class="aicm-card"><h2>引き継ぎ</h2>',
      selectField("引き継ぎ対象", "handoff-target", ["会社", "部門", "仕事パケット", "Leaderタスク", "Worker成果物"], "会社"),
      '<div class="aicm-field"><label>追加ファイル</label><input id="handoff-files" type="file" multiple></div>',
      '<button class="primary" data-action="create-handoff">引き継ぎを作成</button>',
      '</div>',
      '<div class="aicm-card"><h2>作成済み</h2>',
      companyObj.handoffs.length ? companyObj.handoffs.map(function (h) {
        return '<div class="aicm-row"><strong>' + esc(h.title) + '</strong><p class="aicm-muted">' + esc(h.target) + '</p></div>';
      }).join("") : '<p class="aicm-muted">未作成</p>',
      '</div>',
      '</section>'
    ].join(""));
  }

  function field(label, id, value) {
    return '<div class="aicm-field"><label>' + label + '</label><input id="' + id + '" value="' + esc(value) + '"></div>';
  }

  function selectField(label, id, values, selected) {
    return '<div class="aicm-field"><label>' + label + '</label><select id="' + id + '">' + values.map(function (v) {
      return '<option value="' + esc(v) + '"' + (v === selected ? " selected" : "") + ">" + esc(v) + "</option>";
    }).join("") + '</select></div>';
  }

  function rowHtml(r) {
    return [
      '<div class="aicm-row">',
      '<strong>' + esc(r.deliverable_name) + '</strong>',
      '<p>タスク: ' + esc(r.task_name) + '</p>',
      '<p class="aicm-muted">' + esc(r.work_type + " / " + r.responsible_role + " / " + r.status) + '</p>',
      '<p>参照ファイル: ' + esc(r.reference_files || "") + '</p>',
      '<p>補足資料: ' + esc(r.supplemental_materials || "") + '</p>',
      '</div>'
    ].join("");
  }

  function render() {
    var d = data();
    var c = company(d);
    var dept = department(c);
    var body;

    if (app.screen === "company-rules") body = renderCompanyRules(c);
    else if (app.screen === "task-ledger") body = renderTaskLedger(d, c, dept);
    else if (app.screen === "work-packet") body = renderWorkPacket(c);
    else if (app.screen === "inbox") body = renderInbox(c, dept);
    else if (app.screen === "csv-template") body = renderCsvTemplate();
    else if (app.screen === "handoff") body = renderHandoff(c);
    else body = renderDashboard(c);

    document.getElementById("aicm-root").innerHTML = body;
    bind();
  }

  function bind() {
    document.querySelectorAll("[data-screen]").forEach(function (b) {
      b.onclick = function () {
        app.screen = b.getAttribute("data-screen");
        render();
      };
    });

    document.querySelectorAll("[data-action]").forEach(function (b) {
      b.onclick = function () {
        action(b.getAttribute("data-action"));
      };
    });

    var role = document.getElementById("add-role");
    if (role) {
      role.onchange = function () {
        var d = data();
        var c = company(d);
        var dept = department(c);
        document.getElementById("add-robot").innerHTML = robotOptions(d, dept.id, role.value, "");
      };
    }
  }

  function action(name) {
    var d = data();
    var c = company(d);
    var dept = department(c);
    var row;

    if (name === "switch-department") {
      app.departmentId = document.getElementById("department-select").value;
      render();
      return;
    }

    if (name === "add-common-rules") {
      var files = document.getElementById("common-rule-files").files || [];
      Array.prototype.forEach.call(files, function (f) {
        c.company_common_rules.push({ name: f.name, size: f.size });
      });
      save(d);
      render();
      return;
    }

    if (name === "add-ledger-row") {
      dept.task_ledger.push({
        id: makeId("tl"),
        deliverable_name: val("add-deliverable"),
        task_name: val("add-task"),
        work_type: val("add-work-type"),
        responsible_role: val("add-role"),
        responsible_robot: val("add-robot"),
        status: val("add-status"),
        priority: "中",
        due_date: "",
        reference_files: val("add-reference"),
        supplemental_materials: val("add-supplemental"),
        applicable_rules: "会社共通ルール",
        note: "",
        handoff_link: ""
      });
      save(d);
      render();
      return;
    }

    if (name === "load-edit-row") {
      loadEditForm(dept);
      return;
    }

    if (name === "delete-row") {
      var target = val("edit-row");
      dept.task_ledger = dept.task_ledger.filter(function (r) { return r.id !== target; });
      save(d);
      render();
      return;
    }

    if (name === "save-edit-row") {
      row = dept.task_ledger.filter(function (r) { return r.id === val("edit-id"); })[0];
      if (row) {
        row.deliverable_name = val("edit-deliverable");
        row.task_name = val("edit-task");
        row.work_type = val("edit-work-type");
        row.responsible_role = val("edit-role");
        row.status = val("edit-status");
        row.reference_files = val("edit-reference");
        row.supplemental_materials = val("edit-supplemental");
        row.note = val("edit-note");
      }
      save(d);
      render();
      return;
    }

    if (name === "preview-csv") {
      previewCsv();
      return;
    }

    if (name === "import-csv") {
      CSV_ROWS.forEach(function (r) {
        if (validCsvRow(r).length === 0) {
          dept.task_ledger.push(csvToRow(r));
        }
      });
      save(d);
      render();
      return;
    }

    if (name === "create-work-packet") {
      var targetDept = c.departments.filter(function (x) { return x.id === val("work-dept"); })[0] || dept;
      var packet = {
        id: makeId("wp"),
        name: val("work-name"),
        route_type: val("route-type"),
        work_type: val("work-type"),
        delivery_mode: val("delivery-mode"),
        status: "配布済み"
      };
      c.work_packets.push(packet);
      targetDept.inbox.push({
        id: makeId("inbox"),
        name: packet.name,
        route_type: packet.route_type,
        status: "未着手"
      });
      save(d);
      render();
      return;
    }

    if (name === "manager-to-leader" || name === "leader-to-worker") {
      document.getElementById("distribution-result").innerHTML = '<p class="aicm-ok">配布操作を記録しました: ' + esc(name) + '</p>';
      return;
    }

    if (name === "add-manager-row") {
      dept.manager_rows.push({ id: makeId("mr"), area: val("manager-area"), purpose: val("manager-purpose") });
      save(d);
      render();
      return;
    }

    if (name === "add-leader-row") {
      dept.leader_rows.push({ id: makeId("lr"), deliverable_name: val("leader-deliverable"), task_name: val("leader-task") });
      save(d);
      render();
      return;
    }

    if (name === "copy-prompt") {
      copyText(csvPrompt);
      document.getElementById("copy-result").textContent = "コピーしました。";
      return;
    }

    if (name === "create-handoff") {
      c.handoffs.push({ id: makeId("handoff"), title: "引き継ぎ", target: val("handoff-target") });
      save(d);
      render();
    }
  }

  function val(id) {
    var e = document.getElementById(id);
    return e ? e.value : "";
  }

  function loadEditForm(dept) {
    var row = dept.task_ledger.filter(function (r) { return r.id === val("edit-row"); })[0];
    if (!row) return;

    document.getElementById("edit-form").innerHTML = [
      '<input id="edit-id" type="hidden" value="' + esc(row.id) + '">',
      field("成果物名", "edit-deliverable", row.deliverable_name),
      field("タスク名", "edit-task", row.task_name),
      selectField("仕事種別", "edit-work-type", ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"], row.work_type),
      selectField("担当ロール", "edit-role", ["Manager", "Leader", "Worker"], row.responsible_role),
      selectField("状態", "edit-status", ["未着手", "進行中", "レビュー中", "完了", "保留"], row.status),
      field("参照ファイル", "edit-reference", row.reference_files || ""),
      field("補足資料", "edit-supplemental", row.supplemental_materials || ""),
      '<div class="aicm-field"><label>補足メモ</label><textarea id="edit-note">' + esc(row.note || "") + '</textarea></div>',
      '<button class="primary" data-action="save-edit-row">変更を保存</button>'
    ].join("");
    bind();
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
        var errs = validCsvRow(r);
        return '<div class="aicm-row"><strong>' + esc(r.deliverable_name || "(成果物名なし)") + '</strong><p class="aicm-muted">' + esc(r.task_name || "") + '</p>' + (errs.length ? '<p style="color:#9f1239;">ERROR: ' + esc(errs.join(" / ")) + '</p>' : '<p class="aicm-ok">OK</p>') + '</div>';
      }).join("");
    };
    reader.readAsText(input.files[0]);
  }

  function validCsvRow(r) {
    var errors = [];
    if (!String(r.deliverable_name || "").trim()) errors.push("deliverable_name required");
    if (!String(r.task_name || "").trim()) errors.push("task_name required");
    if (["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"].indexOf(r.work_type) < 0) errors.push("work_type invalid");
    if (["Manager", "Leader", "Worker"].indexOf(r.responsible_role) < 0) errors.push("responsible_role invalid");
    if (["未着手", "進行中", "レビュー中", "完了", "保留"].indexOf(r.status) < 0) errors.push("status invalid");
    return errors;
  }

  function csvToRow(r) {
    return {
      id: makeId("tl"),
      deliverable_name: r.deliverable_name,
      task_name: r.task_name,
      work_type: r.work_type,
      responsible_role: r.responsible_role,
      responsible_robot: r.responsible_robot || "",
      status: r.status,
      priority: r.priority || "",
      due_date: r.due_date || "",
      reference_files: r.reference_files || "",
      supplemental_materials: r.supplemental_materials || "",
      applicable_rules: r.applicable_rules || "会社共通ルール",
      note: r.note || "",
      handoff_link: ""
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
