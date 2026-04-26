(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AF_STATE";

  var app = {
    screen: "dashboard",
    companyId: "",
    departmentId: "",
    data: null
  };

  window.onerror = function (message, source, lineno, colno) {
    var root = document.getElementById("aicm-root") || document.body;
    root.innerHTML = '<div style="background:#fff1f2;color:#9f1239;padding:12px;white-space:pre-wrap;">JavaScript error\n' +
      String(message) + "\n" + String(source) + ":" + String(lineno) + ":" + String(colno) + "</div>";
  };

  function id(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function defaultData() {
    return {
      aiworkers: [
        { aiworker_id: "aiw-president-001", display_name: "President Alpha", role_family: "President" },
        { aiworker_id: "aiw-manager-001", display_name: "Manager Alpha", role_family: "Manager" },
        { aiworker_id: "aiw-leader-001", display_name: "Leader Alpha", role_family: "Leader" },
        { aiworker_id: "aiw-worker-001", display_name: "Worker Alpha", role_family: "Worker" },
        { aiworker_id: "aiw-worker-002", display_name: "Worker Beta", role_family: "Worker" }
      ],
      companies: [
        {
          company_id: "company-acm-001",
          company_name: "AI Company Alpha",
          business_domain: "業務設計・制作・開発支援",
          company_rules: [],
          design_development_rules: [],
          departments: [
            {
              department_id: "dept-dev-001",
              department_name: "開発部",
              department_purpose: "設計・実装・テスト",
              department_rules: [],
              department_task_ledger: [
                {
                  ledger_row_id: "task-ledger-001",
                  deliverable_name: "AICompanyManager",
                  task_name: "AICompanyManager",
                  work_type: "設計",
                  responsible_role: "Manager",
                  responsible_robot: "aiw-manager-001",
                  reference_files: [
                    { file_name: "AICompanyManager統合設計.md", file_type: "設計書", handling: "正本" }
                  ],
                  supplemental_materials: [],
                  applicable_rules: ["会社規約", "設計開発ルール"],
                  status: "仮置き",
                  handoff_link: ""
                }
              ],
              inbox: [],
              manager_rows: [],
              leader_task_rows: [],
              worker_deliverables: []
            },
            {
              department_id: "dept-design-001",
              department_name: "デザイン部",
              department_purpose: "デザイン制作・資料作成",
              department_rules: [],
              department_task_ledger: [
                {
                  ledger_row_id: "task-ledger-002",
                  deliverable_name: "新商品LPデザイン",
                  task_name: "ラフ案作成",
                  work_type: "デザイン",
                  responsible_role: "Worker",
                  responsible_robot: "aiw-worker-002",
                  reference_files: [
                    { file_name: "ブランドガイドライン.pdf", file_type: "参考資料", handling: "参考" }
                  ],
                  supplemental_materials: [],
                  applicable_rules: ["会社規約"],
                  status: "未着手",
                  handoff_link: ""
                }
              ],
              inbox: [],
              manager_rows: [],
              leader_task_rows: [],
              worker_deliverables: []
            }
          ],
          work_packets: [],
          handoffs: []
        }
      ]
    };
  }

  function normalize(data) {
    var i, j, c, d;
    if (!data.aiworkers) data.aiworkers = [];
    if (!data.companies) data.companies = [];
    for (i = 0; i < data.companies.length; i += 1) {
      c = data.companies[i];
      if (!c.company_rules) c.company_rules = [];
      if (!c.design_development_rules) c.design_development_rules = [];
      if (!c.departments) c.departments = [];
      if (!c.work_packets) c.work_packets = [];
      if (!c.handoffs) c.handoffs = [];
      for (j = 0; j < c.departments.length; j += 1) {
        d = c.departments[j];
        if (!d.department_rules) d.department_rules = [];
        if (!d.department_task_ledger) d.department_task_ledger = [];
        if (!d.inbox) d.inbox = [];
        if (!d.manager_rows) d.manager_rows = [];
        if (!d.leader_task_rows) d.leader_task_rows = [];
        if (!d.worker_deliverables) d.worker_deliverables = [];
      }
    }
  }

  function load() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        normalize(data);
        return data;
      }
    } catch (e) {
      return defaultData();
    }
    return defaultData();
  }

  function save() {
    normalize(app.data);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(app.data));
  }

  function activeCompany() {
    var i;
    for (i = 0; i < app.data.companies.length; i += 1) {
      if (app.data.companies[i].company_id === app.companyId) return app.data.companies[i];
    }
    return app.data.companies[0];
  }

  function activeDepartment(company) {
    var i;
    for (i = 0; i < company.departments.length; i += 1) {
      if (company.departments[i].department_id === app.departmentId) return company.departments[i];
    }
    return company.departments[0];
  }

  function workerOptions(selected) {
    var html = "";
    var i, w;
    for (i = 0; i < app.data.aiworkers.length; i += 1) {
      w = app.data.aiworkers[i];
      html += '<option value="' + esc(w.aiworker_id) + '"' + (w.aiworker_id === selected ? " selected" : "") + ">" +
        esc(w.display_name + "@" + w.role_family) + "</option>";
    }
    return html;
  }

  function departmentOptions(company, selected) {
    var html = "";
    var i, d;
    for (i = 0; i < company.departments.length; i += 1) {
      d = company.departments[i];
      html += '<option value="' + esc(d.department_id) + '"' + (d.department_id === selected ? " selected" : "") + ">" +
        esc(d.department_name) + "</option>";
    }
    return html;
  }

  function taskLedgerOptions(dept) {
    var html = "";
    var i, row;
    for (i = 0; i < dept.department_task_ledger.length; i += 1) {
      row = dept.department_task_ledger[i];
      html += '<label><input type="checkbox" data-task-ledger-bind="' + esc(row.ledger_row_id) + '"> ' +
        esc(row.deliverable_name + " / " + row.task_name + " / " + row.work_type) + '</label><br>';
    }
    if (!html) html = '<p class="aicm-muted">部門別タスク台帳が空です。</p>';
    return html;
  }

  function fileMetaList(files, defaultType) {
    var result = [];
    var i, f;
    for (i = 0; i < files.length; i += 1) {
      f = files[i];
      result.push({
        file_name: f.name,
        file_size: f.size,
        file_type: defaultType || f.type || "unknown",
        last_modified: f.lastModified || null,
        handling: "参照"
      });
    }
    return result;
  }

  function renderFiles(files) {
    var html = "";
    var i, f;
    if (!files || !files.length) return '<p class="aicm-muted">補足資料なし</p>';
    for (i = 0; i < files.length; i += 1) {
      f = files[i];
      html += '<div class="aicm-file"><strong>' + esc(f.file_name) + '</strong><p class="aicm-muted">' +
        esc((f.file_type || "unknown") + " / " + (f.handling || "参照")) + '</p></div>';
    }
    return html;
  }

  function renderDashboard(company) {
    var d, html = "", i;

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>会社</h2>';
    html += '<p><strong>' + esc(company.company_name) + '</strong></p>';
    html += '<p class="aicm-muted">' + esc(company.business_domain) + '</p>';
    html += '<p>会社規約: ' + esc(company.company_rules.length) + '件</p>';
    html += '<p>設計開発ルール: ' + esc(company.design_development_rules.length) + '件</p>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>部門</h2>';
    for (i = 0; i < company.departments.length; i += 1) {
      d = company.departments[i];
      html += '<div class="aicm-row"><strong>' + esc(d.department_name) + '</strong>';
      html += '<p class="aicm-muted">' + esc(d.department_purpose) + '</p>';
      html += '<p>部門別タスク台帳: ' + esc(d.department_task_ledger.length) + '件</p>';
      html += '<p>受信箱: ' + esc(d.inbox.length) + '件</p></div>';
    }
    html += '</div>';

    html += '<div class="aicm-card"><h2>仕事パケット</h2>';
    if (!company.work_packets.length) {
      html += '<p class="aicm-muted">未作成</p>';
    }
    for (i = 0; i < company.work_packets.length; i += 1) {
      html += '<div class="aicm-row"><strong>' + esc(company.work_packets[i].work_name) + '</strong>' +
        '<p class="aicm-muted">' + esc(company.work_packets[i].work_type + " / " + company.work_packets[i].target_name) + '</p></div>';
    }
    html += '</div>';

    html += '<div class="aicm-card"><h2>分解フロー</h2>';
    html += '<p>President → Manager → Leader → Worker</p>';
    html += '<p class="aicm-muted">Managerが粗表を作成し、Leaderが成果物・タスク行へ追記分解します。</p>';
    html += '</div>';
    html += '</section>';

    return html;
  }

  function renderCompanyRules(company) {
    return '<section class="aicm-grid">' +
      '<div class="aicm-card"><h2>会社統一ルール</h2>' +
      '<p class="aicm-muted">会社規約・設計開発ルールは会社レベルで統一します。</p>' +
      '<div class="aicm-field"><label>会社規約ファイル</label><input id="company-rule-files" type="file" multiple></div>' +
      '<button class="primary" data-action="add-company-rules">会社規約を追加</button>' +
      renderFiles(company.company_rules) +
      '</div>' +
      '<div class="aicm-card"><h2>設計開発ルール</h2>' +
      '<div class="aicm-field"><label>設計開発ルールファイル</label><input id="dev-rule-files" type="file" multiple></div>' +
      '<button class="primary" data-action="add-dev-rules">設計開発ルールを追加</button>' +
      renderFiles(company.design_development_rules) +
      '</div></section>';
  }

  function renderDepartmentTaskLedger(company) {
    var dept = activeDepartment(company);
    var html = "";
    var i, row;

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>部門選択</h2>';
    html += '<div class="aicm-field"><label>部門</label><select id="task-ledger-dept-select">' + departmentOptions(company, dept.department_id) + '</select></div>';
    html += '<button data-action="switch-task-ledger-dept">部門を表示</button>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>部門別タスク台帳 追加</h2>';
    html += '<p class="aicm-muted">成果物名を主キーに近い扱いで持ち、設計書は参照ファイルの一種として紐付けます。</p>';
    html += '<div class="aicm-field"><label>成果物名</label><input id="ledger-deliverable-name" value="窓口業務システム"></div>';
    html += '<div class="aicm-field"><label>タスク名</label><input id="ledger-task-name" value="窓口業務システム設計書作成"></div>';
    html += '<div class="aicm-field"><label>仕事種別</label><select id="ledger-work-type"><option>設計</option><option>実装</option><option>デザイン</option><option>調査</option><option>レビュー</option><option>資料作成</option><option>納品準備</option><option>引き継ぎ</option></select></div>';
    html += '<div class="aicm-field"><label>担当ロール</label><select id="ledger-role"><option>Manager</option><option>Leader</option><option>Worker</option></select></div>';
    html += '<div class="aicm-field"><label>担当ロボット</label><select id="ledger-robot">' + workerOptions("aiw-worker-001") + '</select></div>';
    html += '<div class="aicm-field"><label>参照ファイル</label><input id="ledger-reference-files" type="file" multiple></div>';
    html += '<div class="aicm-field"><label>補足資料</label><input id="ledger-supplemental-materials" type="file" multiple></div>';
    html += '<button class="primary" data-action="add-task-ledger-row">台帳行を追加</button>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>台帳一覧</h2>';
    for (i = 0; i < dept.department_task_ledger.length; i += 1) {
      row = dept.department_task_ledger[i];
      html += '<details open><summary>' + esc(row.deliverable_name) + '</summary>';
      html += '<p><strong>タスク:</strong> ' + esc(row.task_name) + '</p>';
      html += '<p class="aicm-muted">' + esc(row.work_type + " / " + row.responsible_role + " / " + row.status) + '</p>';
      html += '<p><strong>参照ファイル</strong></p>' + renderFiles(row.reference_files);
      html += '<p><strong>補足資料</strong></p>' + renderFiles(row.supplemental_materials);
      html += '</details>';
    }
    html += '</div></section>';

    return html;
  }

  function renderWorkPacket(company) {
    var dept = activeDepartment(company);
    var html = "";

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>構造化仕事パケット</h2>';
    html += '<p class="aicm-muted">フリーテキストは仕事名と補足メモだけに制限します。</p>';
    html += '<div class="aicm-field"><label>仕事名</label><input id="work-name" value="新規仕事パケット"></div>';
    html += '<div class="aicm-field"><label>仕事種別</label><select id="work-type"><option>設計</option><option>実装</option><option>デザイン</option><option>修正</option><option>調査</option><option>レビュー</option><option>資料作成</option><option>納品準備</option><option>引き継ぎ</option></select></div>';
    html += '<div class="aicm-field"><label>対象カテゴリ</label><select id="target-category"><option>03.business-app</option><option>04.life-app</option><option>05.game-app</option><option>06.streaming-app</option><option>デザイン案件</option><option>社内業務</option><option>その他</option></select></div>';
    html += '<div class="aicm-field"><label>対象名</label><input id="target-name" value="AICompanyManager"></div>';
    html += '<div class="aicm-field"><label>補足メモ</label><textarea id="short-note"></textarea></div>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>配布先</h2>';
    html += '<div class="aicm-field"><label>一括配布先部門</label><select id="target-department">' + departmentOptions(company, dept.department_id) + '</select></div>';
    html += '<div class="aicm-field"><label>配布方法</label><select id="delivery-mode"><option>部門Managerに渡す</option><option>部門Leaderに渡す</option><option>部門全体に通知</option><option>子部門含む</option><option>指定ロールへ配布</option></select></div>';
    html += '<p class="aicm-muted">会社規約・設計開発ルールは自動同梱。部門別タスク台帳は配布先部門から参照します。</p>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>台帳行選択</h2>';
    html += '<p class="aicm-muted">部門別タスク台帳から、成果物名/タスク行を明示的に選択します。</p>';
    html += taskLedgerOptions(dept);
    html += '<div class="aicm-field"><label>読み取り方</label><select id="reading-mode"><option>正本として読む</option><option>ルールとして守る</option><option>参考資料として読む</option><option>エラー原因を見る</option><option>差分を見る</option><option>引き継ぎ材料にする</option></select></div>';
    html += '<div class="aicm-field"><label>必須/任意</label><select id="required-flag"><option>必須</option><option>任意</option></select></div>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>作成</h2>';
    html += '<button class="primary" data-action="create-work-packet">仕事パケットを作成して部門へ一括配布</button>';
    html += '<p class="aicm-muted">部門受信箱に assignment を作成します。</p>';
    html += '</div></section>';

    return html;
  }

  function renderDepartmentInbox(company) {
    var dept = activeDepartment(company);
    var html = "";
    var i, row, task, del;

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>部門受信箱</h2>';
    html += '<div class="aicm-field"><label>部門</label><select id="inbox-dept-select">' + departmentOptions(company, dept.department_id) + '</select></div>';
    html += '<button data-action="switch-inbox-dept">部門を表示</button>';
    for (i = 0; i < dept.inbox.length; i += 1) {
      row = dept.inbox[i];
      html += '<div class="aicm-row"><strong>' + esc(row.work_name) + '</strong><p class="aicm-muted">' +
        esc(row.work_type + " / " + row.target_name + " / " + row.status) + '</p></div>';
    }
    if (!dept.inbox.length) html += '<p class="aicm-muted">受信仕事なし</p>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>Manager 粗分解表</h2>';
    html += '<div class="aicm-field"><label>大分類</label><input id="manager-area" value="金融業務システム"></div>';
    html += '<div class="aicm-field"><label>目的</label><input id="manager-purpose" value="業務全体を整理する"></div>';
    html += '<div class="aicm-field"><label>想定成果物群</label><select id="manager-deliverable-group"><option>業務システム一式</option><option>デザイン一式</option><option>設計書群</option><option>UI群</option><option>実装コード群</option><option>テスト群</option></select></div>';
    html += '<button class="primary" data-action="add-manager-row">Manager行を追加</button>';
    for (i = 0; i < dept.manager_rows.length; i += 1) {
      row = dept.manager_rows[i];
      html += '<div class="aicm-row"><strong>' + esc(row.broad_area) + '</strong><p class="aicm-muted">' +
        esc(row.purpose + " / " + row.expected_deliverable_group) + '</p></div>';
    }
    html += '</div>';

    html += '<div class="aicm-card"><h2>Leader 成果物・タスク分解</h2>';
    html += '<div class="aicm-field"><label>成果物名</label><input id="leader-deliverable-name" value="窓口業務システム"></div>';
    html += '<div class="aicm-field"><label>タスク名</label><input id="leader-task-name" value="窓口業務システム設計書作成"></div>';
    html += '<div class="aicm-field"><label>タスク種別</label><select id="leader-task-type"><option>設計書作成</option><option>UI作成</option><option>Java/コード作成</option><option>デザイン作成</option><option>テスト作成</option><option>レビュー</option><option>引き継ぎ作成</option></select></div>';
    html += '<div class="aicm-field"><label>担当Worker</label><select id="leader-worker">' + workerOptions("aiw-worker-001") + '</select></div>';
    html += '<button class="primary" data-action="add-leader-task">Leaderタスク行を追加</button>';
    for (i = 0; i < dept.leader_task_rows.length; i += 1) {
      task = dept.leader_task_rows[i];
      html += '<div class="aicm-row"><strong>' + esc(task.deliverable_name) + '</strong><p class="aicm-muted">' +
        esc(task.task_name + " / " + task.task_type + " / " + task.assigned_worker) + '</p></div>';
    }
    html += '</div>';

    html += '<div class="aicm-card"><h2>Worker 成果物</h2>';
    html += '<div class="aicm-field"><label>成果物名</label><input id="worker-deliverable-name" value="窓口業務の設計書"></div>';
    html += '<div class="aicm-field"><label>成果物種別</label><select id="worker-deliverable-type"><option>設計書</option><option>UI</option><option>Java/コード</option><option>デザイン</option><option>テスト</option><option>引き継ぎ</option><option>納品物</option></select></div>';
    html += '<button class="primary" data-action="add-worker-deliverable">Worker成果物を登録</button>';
    for (i = 0; i < dept.worker_deliverables.length; i += 1) {
      del = dept.worker_deliverables[i];
      html += '<div class="aicm-row"><strong>' + esc(del.deliverable_name) + '</strong><p class="aicm-muted">' +
        esc(del.deliverable_type + " / " + del.status) + '</p></div>';
    }
    html += '</div></section>';

    return html;
  }

  function renderHandoff(company) {
    var html = "";
    var i, h;

    html += '<section class="aicm-grid"><div class="aicm-card"><h2>引き継ぎ</h2>';
    html += '<div class="aicm-field"><label>引き継ぎ対象</label><select id="handoff-target"><option>会社</option><option>部門</option><option>仕事パケット</option><option>Leaderタスク</option><option>Worker成果物</option></select></div>';
    html += '<div class="aicm-field"><label>追加ファイル</label><input id="handoff-files" type="file" multiple></div>';
    html += '<button class="primary" data-action="create-handoff">引き継ぎを作成</button></div>';

    html += '<div class="aicm-card"><h2>作成済み</h2>';
    for (i = 0; i < company.handoffs.length; i += 1) {
      h = company.handoffs[i];
      html += '<details><summary>' + esc(h.title) + '</summary><textarea class="aicm-output" readonly>' + esc(h.body) + '</textarea></details>';
    }
    html += '</div></section>';

    return html;
  }

  function layout(body) {
    return '<main class="aicm-shell">' +
      '<header class="aicm-header"><div><h1 class="aicm-title">AI企業運営アプリ</h1>' +
      '<p class="aicm-sub">Phase AF / 部門別タスク台帳 / 成果物名 / 参照ファイル</p></div>' +
      '<span class="aicm-badge">Phase AF</span></header>' +
      '<nav class="aicm-tabs">' +
      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
      '<button data-screen="department-task-ledger" class="' + (app.screen === "department-task-ledger" ? "primary" : "") + '">部門別タスク台帳</button>' +
      '<button data-screen="work-packet" class="' + (app.screen === "work-packet" ? "primary" : "") + '">仕事操作</button>' +
      '<button data-screen="department-inbox" class="' + (app.screen === "department-inbox" ? "primary" : "") + '">部門受信箱</button>' +
      '<button data-screen="handoff" class="' + (app.screen === "handoff" ? "primary" : "") + '">引き継ぎ</button>' +
      '</nav>' + body + '</main>';
  }

  function render() {
    var root = document.getElementById("aicm-root");
    var company = activeCompany();
    var body = "";

    if (!root || !company) return;

    if (app.screen === "company-rules") body = renderCompanyRules(company);
    else if (app.screen === "department-task-ledger") body = renderDepartmentTaskLedger(company);
    else if (app.screen === "work-packet") body = renderWorkPacket(company);
    else if (app.screen === "department-inbox") body = renderDepartmentInbox(company);
    else if (app.screen === "handoff") body = renderHandoff(company);
    else body = renderDashboard(company);

    root.innerHTML = layout(body);
    bind();
  }

  function bind() {
    var nodes = document.querySelectorAll("[data-screen]");
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      nodes[i].onclick = function () {
        app.screen = this.getAttribute("data-screen");
        render();
      };
    }

    nodes = document.querySelectorAll("[data-action]");
    for (i = 0; i < nodes.length; i += 1) {
      nodes[i].onclick = handleAction;
    }
  }

  function selectedTaskLedgerIds() {
    var nodes = document.querySelectorAll("[data-task-ledger-bind]");
    var result = [];
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].checked) result.push(nodes[i].getAttribute("data-task-ledger-bind"));
    }
    return result;
  }

  function handleAction() {
    var action = this.getAttribute("data-action");
    var company = activeCompany();
    var dept = activeDepartment(company);
    var files;
    var packet;
    var targetDept;
    var i;
    var targetDeptId;

    if (action === "add-company-rules") {
      files = fileMetaList(document.getElementById("company-rule-files").files || [], "会社規約");
      company.company_rules = company.company_rules.concat(files);
      save();
      render();
      return;
    }

    if (action === "add-dev-rules") {
      files = fileMetaList(document.getElementById("dev-rule-files").files || [], "設計開発ルール");
      company.design_development_rules = company.design_development_rules.concat(files);
      save();
      render();
      return;
    }

    if (action === "switch-task-ledger-dept") {
      app.departmentId = document.getElementById("task-ledger-dept-select").value;
      render();
      return;
    }

    if (action === "switch-inbox-dept") {
      app.departmentId = document.getElementById("inbox-dept-select").value;
      render();
      return;
    }

    if (action === "add-task-ledger-row") {
      dept.department_task_ledger.push({
        ledger_row_id: id("task-ledger"),
        deliverable_name: document.getElementById("ledger-deliverable-name").value || "成果物名",
        task_name: document.getElementById("ledger-task-name").value || "タスク名",
        work_type: document.getElementById("ledger-work-type").value,
        responsible_role: document.getElementById("ledger-role").value,
        responsible_robot: document.getElementById("ledger-robot").value,
        reference_files: fileMetaList(document.getElementById("ledger-reference-files").files || [], "参照ファイル"),
        supplemental_materials: fileMetaList(document.getElementById("ledger-supplemental-materials").files || [], "補足資料"),
        applicable_rules: ["会社規約", "設計開発ルール"],
        status: "未着手",
        handoff_link: ""
      });
      save();
      render();
      return;
    }

    if (action === "create-work-packet") {
      targetDept = null;
      targetDeptId = document.getElementById("target-department").value;
      for (i = 0; i < company.departments.length; i += 1) {
        if (company.departments[i].department_id === targetDeptId) targetDept = company.departments[i];
      }
      if (!targetDept) return;

      packet = {
        work_packet_id: id("work"),
        work_name: document.getElementById("work-name").value || "仕事パケット",
        work_type: document.getElementById("work-type").value,
        target_category: document.getElementById("target-category").value,
        target_name: document.getElementById("target-name").value || "",
        short_note: document.getElementById("short-note").value || "",
        delivery_mode: document.getElementById("delivery-mode").value,
        assigned_department_id: targetDept.department_id,
        bound_task_ledger_row_ids: selectedTaskLedgerIds(),
        reading_mode: document.getElementById("reading-mode").value,
        required_flag: document.getElementById("required-flag").value,
        status: "distributed-to-department"
      };

      company.work_packets.push(packet);
      targetDept.inbox.push({
        inbox_item_id: id("inbox"),
        work_packet_id: packet.work_packet_id,
        work_name: packet.work_name,
        work_type: packet.work_type,
        target_name: packet.target_name,
        status: "未着手",
        delivery_mode: packet.delivery_mode,
        inherited_company_rules_count: company.company_rules.length,
        inherited_design_rules_count: company.design_development_rules.length,
        bound_task_ledger_row_ids: packet.bound_task_ledger_row_ids
      });
      app.departmentId = targetDept.department_id;
      app.screen = "department-inbox";
      save();
      render();
      return;
    }

    if (action === "add-manager-row") {
      dept.manager_rows.push({
        manager_row_id: id("manager-row"),
        broad_area: document.getElementById("manager-area").value || "大分類",
        purpose: document.getElementById("manager-purpose").value || "",
        expected_deliverable_group: document.getElementById("manager-deliverable-group").value,
        status: "manager-broad-breakdown-created"
      });
      save();
      render();
      return;
    }

    if (action === "add-leader-task") {
      dept.leader_task_rows.push({
        leader_task_id: id("leader-task"),
        deliverable_name: document.getElementById("leader-deliverable-name").value || "成果物名",
        task_name: document.getElementById("leader-task-name").value || "タスク名",
        task_type: document.getElementById("leader-task-type").value,
        assigned_worker: document.getElementById("leader-worker").value,
        status: "leader-task-created"
      });
      save();
      render();
      return;
    }

    if (action === "add-worker-deliverable") {
      dept.worker_deliverables.push({
        worker_deliverable_id: id("worker-deliverable"),
        deliverable_name: document.getElementById("worker-deliverable-name").value || "成果物",
        deliverable_type: document.getElementById("worker-deliverable-type").value,
        status: "created"
      });
      save();
      render();
      return;
    }

    if (action === "create-handoff") {
      files = fileMetaList(document.getElementById("handoff-files").files || [], "引き継ぎ添付");
      company.handoffs.push({
        handoff_id: id("handoff"),
        title: "Phase AF 引き継ぎ",
        files: files,
        body:
          "# AICompanyManager 引き継ぎ\n\n" +
          "phase: Phase AF\n" +
          "department_task_ledger: true\n" +
          "company_rules: " + company.company_rules.length + "\n" +
          "design_development_rules: " + company.design_development_rules.length + "\n" +
          "departments: " + company.departments.length + "\n" +
          "work_packets: " + company.work_packets.length + "\n" +
          "DB WRITE: NOT EXECUTED\nRLS APPLY: NOT EXECUTED\nLIVE AIWORKEROS CALL: NOT EXECUTED\n"
      });
      save();
      render();
    }
  }

  function start() {
    app.data = load();
    normalize(app.data);
    if (!app.data.companies.length) app.data = defaultData();
    app.companyId = app.data.companies[0].company_id;
    app.departmentId = app.data.companies[0].departments[0] ? app.data.companies[0].departments[0].department_id : "";
    render();
  }

  document.addEventListener("DOMContentLoaded", start);
})();

(function () {
  "use strict";

  var ROLE_CANDIDATES = {
    Manager: [
      { id: "aiw-manager-001", label: "Manager Alpha@Manager" }
    ],
    Leader: [
      { id: "aiw-leader-001", label: "Leader Alpha@Leader" }
    ],
    Worker: [
      { id: "aiw-worker-001", label: "Worker Alpha@Worker" },
      { id: "aiw-worker-002", label: "Worker Beta@Worker" }
    ]
  };

  function replaceSelectOptions(select, options) {
    if (!select || !options || !options.length) {
      return;
    }

    var current = select.value;
    var html = "";
    var i;

    for (i = 0; i < options.length; i += 1) {
      html += '<option value="' + options[i].id + '">' + options[i].label + '</option>';
    }

    select.innerHTML = html;

    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === current) {
        select.value = current;
        return;
      }
    }

    select.selectedIndex = 0;
  }

  function applyDepartmentRoleRobotFilter() {
    var roleSelect = document.getElementById("ledger-role");
    var robotSelect = document.getElementById("ledger-robot");

    if (!roleSelect || !robotSelect) {
      return;
    }

    var role = roleSelect.value || "Worker";
    replaceSelectOptions(robotSelect, ROLE_CANDIDATES[role] || ROLE_CANDIDATES.Worker);

    if (roleSelect.getAttribute("data-ae-filter-bound") !== "true") {
      roleSelect.setAttribute("data-ae-filter-bound", "true");
      roleSelect.addEventListener("change", function () {
        applyDepartmentRoleRobotFilter();
      });
    }
  }

  function applySupplementalHelpText() {
    var labels = document.querySelectorAll("label");
    var i;
    for (i = 0; i < labels.length; i += 1) {
      if (labels[i].textContent === "参照ファイル") {
        labels[i].textContent = "参照ファイル（作業前・作業中に読む資料）";
      }
      if (labels[i].textContent === "補足資料") {
        labels[i].textContent = "補足資料（メモ・スクショ・例・追加説明）";
      }
    }
  }

  function applyPhaseAEEnhancements() {
    applyDepartmentRoleRobotFilter();
    applySupplementalHelpText();
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyPhaseAEEnhancements();

    var observer = new MutationObserver(function () {
      applyPhaseAEEnhancements();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.AICM_PHASE_AF_ROLE_FILTER = {
    applyDepartmentRoleRobotFilter: applyDepartmentRoleRobotFilter,
    roleCandidates: ROLE_CANDIDATES
  };
})();

(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AF_STATE";

  var CSV_TEMPLATE_PROMPT = [
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

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState(data) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function firstCompany(data) {
    return data && data.companies && data.companies[0] ? data.companies[0] : null;
  }

  function selectedDepartmentId(company) {
    var selectors = [
      document.getElementById("task-ledger-dept-select"),
      document.getElementById("inbox-dept-select"),
      document.getElementById("target-department")
    ];

    var i;
    for (i = 0; i < selectors.length; i += 1) {
      if (selectors[i] && selectors[i].value) {
        return selectors[i].value;
      }
    }

    return company && company.departments && company.departments[0] ? company.departments[0].department_id : "";
  }

  function findDepartment(company, departmentId) {
    var i;
    if (!company || !company.departments) {
      return null;
    }

    for (i = 0; i < company.departments.length; i += 1) {
      if (company.departments[i].department_id === departmentId) {
        return company.departments[i];
      }
    }

    return company.departments[0] || null;
  }

  function splitFiles(value, fileType, handling) {
    var text = String(value || "").trim();
    var rows;
    var result = [];
    var i;
    var name;

    if (!text) {
      return result;
    }

    rows = text.split(/[|;]/);

    for (i = 0; i < rows.length; i += 1) {
      name = rows[i].trim();
      if (name) {
        result.push({
          file_name: name,
          file_type: fileType,
          handling: handling
        });
      }
    }

    return result;
  }

  function parseDepartmentTaskLedgerCsv(text) {
    var rows = [];
    var current = [];
    var field = "";
    var inQuotes = false;
    var i;
    var ch;
    var next;
    var header;
    var result = [];

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
        if (ch === "\r" && next === "\n") {
          i += 1;
        }
        current.push(field);
        field = "";
        if (current.join("").trim()) {
          rows.push(current);
        }
        current = [];
      } else {
        field += ch;
      }
    }

    current.push(field);
    if (current.join("").trim()) {
      rows.push(current);
    }

    if (!rows.length) {
      return [];
    }

    header = rows[0].map(function (x) { return String(x || "").trim(); });

    for (i = 1; i < rows.length; i += 1) {
      var obj = {};
      var j;
      for (j = 0; j < header.length; j += 1) {
        obj[header[j]] = rows[i][j] || "";
      }
      result.push(obj);
    }

    return result;
  }

  function validateCsvRow(row) {
    var workTypes = ["設計", "実装", "デザイン", "修正", "調査", "レビュー", "資料作成", "納品準備", "引き継ぎ"];
    var roles = ["Manager", "Leader", "Worker"];
    var statuses = ["未着手", "進行中", "レビュー中", "完了", "保留"];
    var errors = [];

    if (!String(row.deliverable_name || "").trim()) {
      errors.push("deliverable_name is required");
    }
    if (!String(row.task_name || "").trim()) {
      errors.push("task_name is required");
    }
    if (workTypes.indexOf(String(row.work_type || "").trim()) < 0) {
      errors.push("work_type is invalid");
    }
    if (roles.indexOf(String(row.responsible_role || "").trim()) < 0) {
      errors.push("responsible_role is invalid");
    }
    if (statuses.indexOf(String(row.status || "").trim()) < 0) {
      errors.push("status is invalid");
    }

    return errors;
  }

  function csvRowToTaskLedgerRow(row) {
    return {
      ledger_row_id: makeId("task-ledger"),
      deliverable_name: String(row.deliverable_name || "").trim(),
      task_name: String(row.task_name || "").trim(),
      work_type: String(row.work_type || "").trim(),
      responsible_role: String(row.responsible_role || "").trim(),
      responsible_robot: String(row.responsible_robot || "").trim(),
      reference_files: splitFiles(row.reference_files, "参照ファイル", "参照"),
      supplemental_materials: splitFiles(row.supplemental_materials, "補足資料", "補足"),
      applicable_rules: String(row.applicable_rules || "").split(/[|;]/).map(function (x) { return x.trim(); }).filter(Boolean),
      status: String(row.status || "未着手").trim(),
      priority: String(row.priority || "").trim(),
      due_date: String(row.due_date || "").trim(),
      note: String(row.note || "").trim(),
      handoff_link: ""
    };
  }

  function previewCsvRows(rows) {
    var html = "";
    var i;
    var errors;

    if (!rows.length) {
      return '<p class="aicm-muted">CSV行がありません。</p>';
    }

    for (i = 0; i < rows.length; i += 1) {
      errors = validateCsvRow(rows[i]);
      html += '<div class="aicm-row">' +
        '<strong>' + esc(rows[i].deliverable_name || "(成果物名なし)") + '</strong>' +
        '<p class="aicm-muted">' + esc((rows[i].task_name || "") + " / " + (rows[i].work_type || "") + " / " + (rows[i].responsible_role || "")) + '</p>';

      if (errors.length) {
        html += '<p style="color:#9f1239;">ERROR: ' + esc(errors.join(" / ")) + '</p>';
      } else {
        html += '<p class="aicm-muted">OK</p>';
      }

      html += '</div>';
    }

    return html;
  }

  function importDepartmentTaskLedgerRows(rows) {
    var data = loadState();
    var company = firstCompany(data);
    var dept = findDepartment(company, selectedDepartmentId(company));
    var imported = 0;
    var i;
    var errors;

    if (!dept) {
      return { imported: 0, error: "department not found" };
    }

    if (!dept.department_task_ledger) {
      dept.department_task_ledger = [];
    }

    for (i = 0; i < rows.length; i += 1) {
      errors = validateCsvRow(rows[i]);
      if (!errors.length) {
        dept.department_task_ledger.push(csvRowToTaskLedgerRow(rows[i]));
        imported += 1;
      }
    }

    saveState(data);
    return { imported: imported, error: "" };
  }

  function injectRoutePanel() {
    var sections;
    var panel;

    if (document.getElementById("aicm-af-route-panel")) {
      return;
    }

    if (document.body.textContent.indexOf("構造化仕事パケット") < 0) {
      return;
    }

    sections = document.querySelectorAll(".aicm-grid");
    if (!sections.length) {
      return;
    }

    panel = document.createElement("div");
    panel.className = "aicm-card";
    panel.id = "aicm-af-route-panel";
    panel.innerHTML = [
      '<h2>配布ルート</h2>',
      '<div class="aicm-field"><label>route_type</label>',
      '<select id="af-route-type">',
      '<option value="president_policy_route">president_policy_route / President方針から開始</option>',
      '<option value="user_to_manager_route">user_to_manager_route / ユーザーからManagerへ</option>',
      '<option value="user_to_leader_route">user_to_leader_route / ユーザーからLeaderへ</option>',
      '</select></div>',
      '<p class="aicm-muted">3ルートを明示し、Manager配布またはLeader配布の入口を固定します。</p>'
    ].join("");

    sections[0].appendChild(panel);
  }

  function injectCsvImportPanel() {
    var sections;
    var panel;

    if (document.getElementById("aicm-af-csv-import-panel")) {
      return;
    }

    if (document.body.textContent.indexOf("部門別タスク台帳") < 0) {
      return;
    }

    sections = document.querySelectorAll(".aicm-grid");
    if (!sections.length) {
      return;
    }

    panel = document.createElement("div");
    panel.className = "aicm-card";
    panel.id = "aicm-af-csv-import-panel";
    panel.innerHTML = [
      '<h2>CSVアップロード</h2>',
      '<p class="aicm-muted">ChatGPTなどで作成した部門別タスク台帳CSVをプレビューして取り込みます。</p>',
      '<div class="aicm-field"><label>CSVファイル</label><input id="af-csv-file" type="file" accept=".csv,text/csv"></div>',
      '<div class="aicm-actions">',
      '<button class="primary" data-af-action="preview-csv">CSVプレビュー</button>',
      '<button class="primary" data-af-action="import-csv">正常行を一括追加</button>',
      '</div>',
      '<div id="af-csv-preview"><p class="aicm-muted">未プレビュー</p></div>'
    ].join("");

    sections[0].appendChild(panel);
  }

  function injectDepartmentDistributionPanel() {
    var sections;
    var panel;

    if (document.getElementById("aicm-af-distribution-panel")) {
      return;
    }

    if (document.body.textContent.indexOf("部門受信箱") < 0) {
      return;
    }

    sections = document.querySelectorAll(".aicm-grid");
    if (!sections.length) {
      return;
    }

    panel = document.createElement("div");
    panel.className = "aicm-card";
    panel.id = "aicm-af-distribution-panel";
    panel.innerHTML = [
      '<h2>配布操作</h2>',
      '<details open><summary>ManagerからLeaderへ配布</summary>',
      '<p class="aicm-muted">user_to_manager_route では、Managerが粗分解行をLeaderへ配布します。</p>',
      '<button class="primary" data-af-action="manager-to-leader">ManagerからLeaderへ配布</button>',
      '</details>',
      '<details open><summary>LeaderからWorkerへ配布</summary>',
      '<p class="aicm-muted">user_to_leader_route では、Leaderがタスク行をWorkerへ配布します。</p>',
      '<button class="primary" data-af-action="leader-to-worker">LeaderからWorkerへ配布</button>',
      '</details>'
    ].join("");

    sections[0].appendChild(panel);
  }

  function injectCsvTemplateTab() {
    var nav = document.querySelector(".aicm-tabs");

    if (!nav || document.getElementById("aicm-af-csv-template-tab")) {
      return;
    }

    var button = document.createElement("button");
    button.id = "aicm-af-csv-template-tab";
    button.setAttribute("data-af-screen", "csv-template");
    button.textContent = "CSV作成テンプレ";
    nav.appendChild(button);
  }

  function renderCsvTemplateScreen() {
    var root = document.getElementById("aicm-root");
    var header = "deliverable_name,task_name,work_type,responsible_role,status,priority,due_date,responsible_robot,reference_files,supplemental_materials,applicable_rules,note";
    var sample = [
      header,
      '窓口業務システム,窓口業務システム設計書作成,設計,Leader,未着手,高,,,"窓口業務資料.md|会社設計開発ルール.md","業務メモ.txt","会社規約|設計開発ルール","最初の設計"',
      '窓口業務システム,窓口業務UI作成,デザイン,Worker,未着手,中,,,"窓口業務システム設計書.md","参考画像.png","会社規約",""',
      '入金管理,入金管理DB設計,設計,Leader,未着手,高,,,"入金業務資料.md","","会社設計開発ルール",""'
    ].join("\n");

    if (!root) {
      return;
    }

    root.innerHTML = [
      '<main class="aicm-shell">',
      '<header class="aicm-header"><div><h1 class="aicm-title">CSV作成テンプレ</h1>',
      '<p class="aicm-sub">部門別タスク台帳CSVをChatGPTで作成するための別画面</p></div>',
      '<span class="aicm-badge">Phase AF</span></header>',
      '<nav class="aicm-tabs"><button data-af-action="back-to-app">戻る</button></nav>',
      '<section class="aicm-grid">',
      '<div class="aicm-card"><h2>必須項目</h2>',
      '<ul><li>deliverable_name / 成果物名</li><li>task_name / タスク名</li><li>work_type / 仕事種別</li><li>responsible_role / 担当ロール</li><li>status / 状態</li></ul>',
      '</div>',
      '<div class="aicm-card"><h2>任意項目</h2>',
      '<ul><li>priority</li><li>due_date</li><li>responsible_robot</li><li>reference_files</li><li>supplemental_materials</li><li>applicable_rules</li><li>note</li></ul>',
      '</div>',
      '<div class="aicm-card"><h2>CSVヘッダー</h2><textarea class="aicm-output" readonly>' + esc(header) + '</textarea></div>',
      '<div class="aicm-card"><h2>ChatGPT用プロンプト</h2>',
      '<button class="primary" data-af-action="copy-csv-prompt">ChatGPT用プロンプトをコピー</button>',
      '<p id="af-copy-message" class="aicm-muted"></p>',
      '<textarea id="af-csv-template-prompt" class="aicm-output" readonly>' + esc(CSV_TEMPLATE_PROMPT) + '</textarea>',
      '</div>',
      '<div class="aicm-card"><h2>サンプルCSV</h2><textarea class="aicm-output" readonly>' + esc(sample) + '</textarea></div>',
      '</section>',
      '</main>'
    ].join("");

    bindAfActions();
  }

  function copyCsvPrompt() {
    var text = CSV_TEMPLATE_PROMPT;
    var msg = document.getElementById("af-copy-message");

    function ok() {
      if (msg) {
        msg.textContent = "コピーしました。ChatGPTへ貼り付けてCSVを作成してください。";
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        fallbackCopy(text);
        ok();
      });
    } else {
      fallbackCopy(text);
      ok();
    }
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch (error) {
      /* noop */
    }
    document.body.removeChild(area);
  }

  function readCsvFile(callback) {
    var input = document.getElementById("af-csv-file");
    var file;
    var reader;

    if (!input || !input.files || !input.files[0]) {
      callback("", "CSVファイルが選択されていません。");
      return;
    }

    file = input.files[0];
    reader = new FileReader();
    reader.onload = function () {
      callback(String(reader.result || ""), "");
    };
    reader.onerror = function () {
      callback("", "CSVを読めませんでした。");
    };
    reader.readAsText(file);
  }

  function handleCsvPreview() {
    readCsvFile(function (text, error) {
      var preview = document.getElementById("af-csv-preview");
      var rows;

      if (!preview) {
        return;
      }

      if (error) {
        preview.innerHTML = '<p style="color:#9f1239;">' + esc(error) + '</p>';
        return;
      }

      rows = parseDepartmentTaskLedgerCsv(text);
      window.AICM_PHASE_AF_LAST_CSV_ROWS = rows;
      preview.innerHTML = previewCsvRows(rows);
    });
  }

  function handleCsvImport() {
    var preview = document.getElementById("af-csv-preview");
    var rows = window.AICM_PHASE_AF_LAST_CSV_ROWS || [];
    var result;

    if (!rows.length) {
      if (preview) {
        preview.innerHTML = '<p style="color:#9f1239;">先にCSVプレビューを実行してください。</p>';
      }
      return;
    }

    result = importDepartmentTaskLedgerRows(rows);

    if (preview) {
      preview.innerHTML = '<p class="aicm-muted">IMPORT_DONE: ' + esc(result.imported) + ' rows</p>';
    }

    window.setTimeout(function () {
      window.location.reload();
    }, 800);
  }

  function bindAfActions() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      var action;

      if (!target) {
        return;
      }

      if (target.getAttribute("data-af-screen") === "csv-template") {
        renderCsvTemplateScreen();
        return;
      }

      action = target.getAttribute("data-af-action");

      if (action === "copy-csv-prompt") {
        copyCsvPrompt();
      }

      if (action === "back-to-app") {
        window.location.reload();
      }

      if (action === "preview-csv") {
        handleCsvPreview();
      }

      if (action === "import-csv") {
        handleCsvImport();
      }

      if (action === "manager-to-leader") {
        target.textContent = "ManagerからLeaderへ配布済み mock";
      }

      if (action === "leader-to-worker") {
        target.textContent = "LeaderからWorkerへ配布済み mock";
      }
    });
  }

  function applyPhaseAFEnhancements() {
    injectCsvTemplateTab();
    injectRoutePanel();
    injectCsvImportPanel();
    injectDepartmentDistributionPanel();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindAfActions();
    applyPhaseAFEnhancements();

    var observer = new MutationObserver(function () {
      applyPhaseAFEnhancements();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.AICM_PHASE_AF_CSV_TEMPLATE = {
    prompt: CSV_TEMPLATE_PROMPT,
    parseDepartmentTaskLedgerCsv: parseDepartmentTaskLedgerCsv,
    importDepartmentTaskLedgerRows: importDepartmentTaskLedgerRows
  };
})();
