(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AC_STATE";

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
          business_domain: "業務設計・開発支援",
          company_rules: [],
          design_development_rules: [],
          departments: [
            {
              department_id: "dept-dev-001",
              department_name: "開発部",
              department_purpose: "設計・実装・テスト",
              department_rules: [],
              design_ledger: [
                {
                  ledger_item_id: "ledger-001",
                  file_name: "AICompanyManager統合設計.md",
                  target_type: "app",
                  target_category: "03.business-app",
                  target_name: "AICompanyManager",
                  document_role: "統合設計書",
                  canonical_status: "canonical",
                  version_label: "latest"
                }
              ],
              inbox: [],
              manager_rows: [],
              leader_task_rows: [],
              worker_deliverables: []
            },
            {
              department_id: "dept-stream-001",
              department_name: "Streaming開発部",
              department_purpose: "Streamingapp関連の設計・実装",
              department_rules: [],
              design_ledger: [
                {
                  ledger_item_id: "ledger-002",
                  file_name: "StreamWatch統合設計.md",
                  target_type: "app",
                  target_category: "06.streaming-app",
                  target_name: "StreamWatch",
                  document_role: "統合設計書",
                  canonical_status: "canonical",
                  version_label: "latest"
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
        if (!d.design_ledger) d.design_ledger = [];
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

  function ledgerOptions(dept) {
    var html = "";
    var i, item;
    for (i = 0; i < dept.design_ledger.length; i += 1) {
      item = dept.design_ledger[i];
      html += '<label><input type="checkbox" data-ledger-bind="' + esc(item.ledger_item_id) + '"> ' +
        esc(item.file_name + " / " + item.document_role + " / " + item.target_name) + '</label><br>';
    }
    if (!html) html = '<p class="aicm-muted">部門設計書台帳が空です。</p>';
    return html;
  }

  function fileMetaList(files) {
    var result = [];
    var i, f;
    for (i = 0; i < files.length; i += 1) {
      f = files[i];
      result.push({
        file_name: f.name,
        file_size: f.size,
        file_type: f.type || "unknown",
        last_modified: f.lastModified || null
      });
    }
    return result;
  }

  function renderFiles(files) {
    var html = "";
    var i, f;
    if (!files || !files.length) return '<p class="aicm-muted">添付なし</p>';
    for (i = 0; i < files.length; i += 1) {
      f = files[i];
      html += '<div class="aicm-file"><strong>' + esc(f.file_name) + '</strong><p class="aicm-muted">' +
        esc(f.file_size + " bytes / " + f.file_type) + '</p></div>';
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
      html += '<p>設計書台帳: ' + esc(d.design_ledger.length) + '件</p>';
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

  function renderDepartmentLedger(company) {
    var dept = activeDepartment(company);
    var html = "";
    var i, item;

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>部門選択</h2>';
    html += '<div class="aicm-field"><label>部門</label><select id="ledger-dept-select">' + departmentOptions(company, dept.department_id) + '</select></div>';
    html += '<button data-action="switch-ledger-dept">部門を表示</button>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>部門設計書台帳</h2>';
    html += '<p class="aicm-muted">設計書台帳は部門が持ちます。名前推測ではなく対象スコープで管理します。</p>';
    html += '<div class="aicm-field"><label>ファイル名</label><input id="ledger-file-name" value="設計書.md"></div>';
    html += '<div class="aicm-field"><label>対象カテゴリ</label><select id="ledger-target-category"><option>03.business-app</option><option>04.life-app</option><option>05.game-app</option><option>06.streaming-app</option><option>ERP</option><option>その他</option></select></div>';
    html += '<div class="aicm-field"><label>対象名</label><input id="ledger-target-name" value="AICompanyManager"></div>';
    html += '<div class="aicm-field"><label>資料役割</label><select id="ledger-role"><option>統合設計書</option><option>UI設計</option><option>API設計</option><option>DB設計</option><option>テスト結果</option><option>引き継ぎ</option><option>参考資料</option></select></div>';
    html += '<div class="aicm-field"><label>扱い</label><select id="ledger-canonical"><option>canonical</option><option>reference</option><option>evidence</option></select></div>';
    html += '<button class="primary" data-action="add-ledger-item">台帳に追加</button>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>台帳一覧</h2>';
    for (i = 0; i < dept.design_ledger.length; i += 1) {
      item = dept.design_ledger[i];
      html += '<div class="aicm-row"><strong>' + esc(item.file_name) + '</strong><p class="aicm-muted">' +
        esc(item.target_category + " / " + item.target_name + " / " + item.document_role + " / " + item.canonical_status) +
        '</p></div>';
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
    html += '<div class="aicm-field"><label>仕事種別</label><select id="work-type"><option>設計</option><option>実装</option><option>修正</option><option>調査</option><option>レビュー</option><option>資料作成</option><option>納品準備</option><option>引き継ぎ</option></select></div>';
    html += '<div class="aicm-field"><label>対象種別</label><select id="target-type"><option>アプリ</option><option>OS</option><option>モジュール</option><option>社内業務</option><option>その他</option></select></div>';
    html += '<div class="aicm-field"><label>対象カテゴリ</label><select id="target-category"><option>03.business-app</option><option>04.life-app</option><option>05.game-app</option><option>06.streaming-app</option><option>ERP</option><option>その他</option></select></div>';
    html += '<div class="aicm-field"><label>対象名</label><input id="target-name" value="AICompanyManager"></div>';
    html += '<div class="aicm-field"><label>優先度</label><select id="priority"><option>高</option><option>中</option><option>低</option></select></div>';
    html += '<div class="aicm-field"><label>補足メモ</label><textarea id="short-note"></textarea></div>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>配布先</h2>';
    html += '<div class="aicm-field"><label>一括配布先部門</label><select id="target-department">' + departmentOptions(company, dept.department_id) + '</select></div>';
    html += '<div class="aicm-field"><label>配布方法</label><select id="delivery-mode"><option>部門Managerに渡す</option><option>部門Leaderに渡す</option><option>部門全体に通知</option><option>子部門含む</option><option>指定ロールへ配布</option></select></div>';
    html += '<p class="aicm-muted">会社規約・設計開発ルールは自動同梱。部門ルール・部門設計書台帳は配布先部門から参照します。</p>';
    html += '</div>';

    html += '<div class="aicm-card"><h2>コンテキスト選択</h2>';
    html += '<p class="aicm-muted">配布先部門の設計書台帳から明示的に選択します。</p>';
    html += ledgerOptions(dept);
    html += '<div class="aicm-field"><label>読み取り方</label><select id="reading-mode"><option>設計正本として読む</option><option>ルールとして守る</option><option>参考資料として読む</option><option>エラー原因を見る</option><option>差分を見る</option><option>引き継ぎ材料にする</option></select></div>';
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
    html += '<div class="aicm-field"><label>想定成果物群</label><select id="manager-deliverable-group"><option>業務システム一式</option><option>設計書群</option><option>UI群</option><option>実装コード群</option><option>テスト群</option></select></div>';
    html += '<button class="primary" data-action="add-manager-row">Manager行を追加</button>';
    for (i = 0; i < dept.manager_rows.length; i += 1) {
      row = dept.manager_rows[i];
      html += '<div class="aicm-row"><strong>' + esc(row.broad_area) + '</strong><p class="aicm-muted">' +
        esc(row.purpose + " / " + row.expected_deliverable_group) + '</p></div>';
    }
    html += '</div>';

    html += '<div class="aicm-card"><h2>Leader 成果物・タスク分解</h2>';
    html += '<div class="aicm-field"><label>成果物単位</label><input id="leader-deliverable-unit" value="窓口業務システム"></div>';
    html += '<div class="aicm-field"><label>タスク種別</label><select id="leader-task-type"><option>設計書作成</option><option>UI作成</option><option>Java/コード作成</option><option>テスト作成</option><option>レビュー</option><option>引き継ぎ作成</option></select></div>';
    html += '<div class="aicm-field"><label>担当Worker</label><select id="leader-worker">' + workerOptions("aiw-worker-001") + '</select></div>';
    html += '<div class="aicm-field"><label>成果物</label><select id="leader-output"><option>設計書</option><option>UI</option><option>Java/コード</option><option>テスト結果</option><option>引き継ぎワンブロック</option></select></div>';
    html += '<button class="primary" data-action="add-leader-task">Leaderタスク行を追加</button>';
    for (i = 0; i < dept.leader_task_rows.length; i += 1) {
      task = dept.leader_task_rows[i];
      html += '<div class="aicm-row"><strong>' + esc(task.deliverable_unit) + '</strong><p class="aicm-muted">' +
        esc(task.task_type + " / " + task.assigned_worker + " / " + task.expected_output) + '</p></div>';
    }
    html += '</div>';

    html += '<div class="aicm-card"><h2>Worker 成果物</h2>';
    html += '<div class="aicm-field"><label>成果物名</label><input id="worker-deliverable-name" value="窓口業務の設計書"></div>';
    html += '<div class="aicm-field"><label>成果物種別</label><select id="worker-deliverable-type"><option>設計書</option><option>UI</option><option>Java/コード</option><option>テスト</option><option>引き継ぎ</option></select></div>';
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
      '<p class="aicm-sub">Phase AC / 会社統一ルール / 部門設計書台帳 / 仕事パケット / 部門受信箱</p></div>' +
      '<span class="aicm-badge">Phase AC</span></header>' +
      '<nav class="aicm-tabs">' +
      '<button data-screen="dashboard" class="' + (app.screen === "dashboard" ? "primary" : "") + '">会社ダッシュボード</button>' +
      '<button data-screen="company-rules" class="' + (app.screen === "company-rules" ? "primary" : "") + '">会社ルール</button>' +
      '<button data-screen="department-ledger" class="' + (app.screen === "department-ledger" ? "primary" : "") + '">部門設計書台帳</button>' +
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
    else if (app.screen === "department-ledger") body = renderDepartmentLedger(company);
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

  function selectedLedgerIds() {
    var nodes = document.querySelectorAll("[data-ledger-bind]");
    var result = [];
    var i;
    for (i = 0; i < nodes.length; i += 1) {
      if (nodes[i].checked) result.push(nodes[i].getAttribute("data-ledger-bind"));
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
      files = fileMetaList(document.getElementById("company-rule-files").files || []);
      company.company_rules = company.company_rules.concat(files);
      save();
      render();
      return;
    }

    if (action === "add-dev-rules") {
      files = fileMetaList(document.getElementById("dev-rule-files").files || []);
      company.design_development_rules = company.design_development_rules.concat(files);
      save();
      render();
      return;
    }

    if (action === "switch-ledger-dept") {
      app.departmentId = document.getElementById("ledger-dept-select").value;
      render();
      return;
    }

    if (action === "switch-inbox-dept") {
      app.departmentId = document.getElementById("inbox-dept-select").value;
      render();
      return;
    }

    if (action === "add-ledger-item") {
      dept.design_ledger.push({
        ledger_item_id: id("ledger"),
        file_name: document.getElementById("ledger-file-name").value || "設計書.md",
        target_type: "app",
        target_category: document.getElementById("ledger-target-category").value,
        target_name: document.getElementById("ledger-target-name").value || "",
        document_role: document.getElementById("ledger-role").value,
        canonical_status: document.getElementById("ledger-canonical").value,
        version_label: "manual"
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
        target_type: document.getElementById("target-type").value,
        target_category: document.getElementById("target-category").value,
        target_name: document.getElementById("target-name").value || "",
        priority: document.getElementById("priority").value,
        short_note: document.getElementById("short-note").value || "",
        delivery_mode: document.getElementById("delivery-mode").value,
        assigned_department_id: targetDept.department_id,
        bound_ledger_item_ids: selectedLedgerIds(),
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
        bound_ledger_item_ids: packet.bound_ledger_item_ids
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
        deliverable_unit: document.getElementById("leader-deliverable-unit").value || "成果物単位",
        task_type: document.getElementById("leader-task-type").value,
        assigned_worker: document.getElementById("leader-worker").value,
        expected_output: document.getElementById("leader-output").value,
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
      files = fileMetaList(document.getElementById("handoff-files").files || []);
      company.handoffs.push({
        handoff_id: id("handoff"),
        title: "Phase AC 引き継ぎ",
        files: files,
        body:
          "# AICompanyManager 引き継ぎ\n\n" +
          "phase: Phase AC\n" +
          "company_rules: " + company.company_rules.length + "\n" +
          "design_development_rules: " + company.design_development_rules.length + "\n" +
          "departments: " + company.departments.length + "\n" +
          "work_packets: " + company.work_packets.length + "\n" +
          "manager_rows: " + dept.manager_rows.length + "\n" +
          "leader_task_rows: " + dept.leader_task_rows.length + "\n" +
          "worker_deliverables: " + dept.worker_deliverables.length + "\n\n" +
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
