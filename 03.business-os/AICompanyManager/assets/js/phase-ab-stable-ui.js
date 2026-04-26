(function () {
  "use strict";

  var STORAGE_KEY = "AICM_PHASE_AB_STATE";

  var app = {
    screen: "dashboard",
    companyId: "",
    data: null,
    pendingHandoffFiles: []
  };

  window.onerror = function (message, source, lineno, colno) {
    var root = document.getElementById("aicm-root") || document.body;
    root.innerHTML = '<div class="aicm-error">JavaScript error\n' +
      String(message) + "\n" +
      String(source) + ":" + String(lineno) + ":" + String(colno) +
      "</div>";
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

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function defaultData() {
    return {
      aiworkers: [
        { aiworker_id: "aiw-president-001", display_name: "President Alpha", role_family: "President", series: "HD" },
        { aiworker_id: "aiw-manager-001", display_name: "Manager Alpha", role_family: "Manager", series: "HD" },
        { aiworker_id: "aiw-leader-001", display_name: "Leader Alpha", role_family: "Leader", series: "HD" },
        { aiworker_id: "aiw-worker-001", display_name: "Worker Alpha", role_family: "Worker", series: "HD" },
        { aiworker_id: "aiw-worker-002", display_name: "Worker Beta", role_family: "Worker", series: "MEGAMI" }
      ],
      companies: [
        {
          company_id: "company-acm-001",
          company_name: "AI Company Alpha",
          business_domain: "業務設計・開発支援",
          company_policy: "AI組織が自動で進行し、納品時のみ人間が確認する。",
          delivery_policy: "納品時のみ人間確認",
          rule_files: [],
          organization_trees: [
            {
              tree_id: "tree-alpha-main",
              tree_name: "経営・開発ツリー",
              tree_purpose: "設計と開発を進める主組織",
              rule_files: [],
              units: [
                {
                  unit_id: "unit-001",
                  parent_unit_id: "",
                  unit_name: "経営室",
                  purpose: "方針と事業判断",
                  ai_role: "President",
                  robot_name: "アルファ社長",
                  aiworker_id: "aiw-president-001",
                  deliverable: "事業方針",
                  rule_files: []
                },
                {
                  unit_id: "unit-002",
                  parent_unit_id: "unit-001",
                  unit_name: "運営管理部",
                  purpose: "タスク分解と進行管理",
                  ai_role: "Manager",
                  robot_name: "進行管理一号",
                  aiworker_id: "aiw-manager-001",
                  deliverable: "実行計画",
                  rule_files: []
                },
                {
                  unit_id: "unit-003",
                  parent_unit_id: "unit-002",
                  unit_name: "実制作部",
                  purpose: "実作業",
                  ai_role: "Worker",
                  robot_name: "実制作一号",
                  aiworker_id: "aiw-worker-001",
                  deliverable: "設計・コード・資料",
                  rule_files: []
                }
              ]
            }
          ],
          role_progress: [
            { role: "President", status: "完了", detail: "会社方針を確認済み" },
            { role: "Manager", status: "進行中", detail: "タスク分解中" },
            { role: "Leader", status: "待機", detail: "成果物統合待ち" },
            { role: "Worker", status: "待機", detail: "実作業待ち" }
          ],
          current_task: {
            task_title: "白画面復旧と操作画面整理",
            task_state: "mock確認中",
            task_owner_role: "Manager",
            selected_aiworker_id: "aiw-manager-001",
            input_materials: "レビュー結果",
            output_expectation: "安定表示"
          },
          delivery: { delivery_title: "Phase AB 復旧版", delivery_status: "納品準備中" },
          handoffs: []
        }
      ]
    };
  }

  function normalize(data) {
    if (!data.aiworkers) data.aiworkers = [];
    if (!data.companies) data.companies = [];

    var i, j, k, c, t, u;
    for (i = 0; i < data.companies.length; i += 1) {
      c = data.companies[i];
      if (!c.company_id) c.company_id = id("company");
      if (!c.company_name) c.company_name = "未命名会社";
      if (!c.business_domain) c.business_domain = "未設定";
      if (!c.rule_files) c.rule_files = [];
      if (!c.organization_trees) c.organization_trees = [];
      if (!c.handoffs) c.handoffs = [];
      if (!c.role_progress) c.role_progress = [];
      if (!c.current_task) {
        c.current_task = {
          task_title: "初期設定",
          task_state: "設定中",
          task_owner_role: "President",
          selected_aiworker_id: "aiw-president-001",
          input_materials: "会社設定",
          output_expectation: "運営開始"
        };
      }
      if (!c.delivery) c.delivery = { delivery_title: "未作成", delivery_status: "未納品" };

      for (j = 0; j < c.organization_trees.length; j += 1) {
        t = c.organization_trees[j];
        if (!t.tree_id) t.tree_id = id("tree");
        if (!t.tree_name) t.tree_name = "未命名ツリー";
        if (!t.rule_files) t.rule_files = [];
        if (!t.units) t.units = [];
        for (k = 0; k < t.units.length; k += 1) {
          u = t.units[k];
          if (!u.unit_id) u.unit_id = id("unit");
          if (!u.parent_unit_id) u.parent_unit_id = "";
          if (!u.unit_name) u.unit_name = "未命名組織";
          if (!u.ai_role) u.ai_role = "Worker";
          if (!u.robot_name) u.robot_name = u.unit_name;
          if (!u.aiworker_id) u.aiworker_id = "aiw-worker-001";
          if (!u.rule_files) u.rule_files = [];
        }
      }
    }
  }

  function load() {
    var raw, data;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        data = JSON.parse(raw);
        normalize(data);
        return data;
      }
    } catch (e) {
      return defaultData();
    }
    return defaultData();
  }

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(app.data));
  }

  function activeCompany() {
    var list = app.data.companies;
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].company_id === app.companyId) return list[i];
    }
    return list[0];
  }

  function workerName(workerId) {
    var i;
    for (i = 0; i < app.data.aiworkers.length; i += 1) {
      if (app.data.aiworkers[i].aiworker_id === workerId) return app.data.aiworkers[i].display_name;
    }
    return "未選択";
  }

  function robotLabel(unit) {
    return (unit.robot_name || "未命名") + "@" + (unit.ai_role || "Role");
  }

  function fileMetas(fileList) {
    var list = [];
    var i, f;
    for (i = 0; i < fileList.length; i += 1) {
      f = fileList[i];
      list.push({
        file_name: f.name,
        file_size: f.size,
        file_type: f.type || "unknown",
        last_modified: f.lastModified || null
      });
    }
    return list;
  }

  function roleOptions(selected) {
    var roles = ["President", "Manager", "Leader", "Worker"];
    var html = "";
    var i, r;
    for (i = 0; i < roles.length; i += 1) {
      r = roles[i];
      html += '<option value="' + esc(r) + '"' + (r === selected ? " selected" : "") + ">" + esc(r) + "</option>";
    }
    return html;
  }

  function aiworkerOptions(selected) {
    var html = "";
    var i, w;
    for (i = 0; i < app.data.aiworkers.length; i += 1) {
      w = app.data.aiworkers[i];
      html += '<option value="' + esc(w.aiworker_id) + '"' + (w.aiworker_id === selected ? " selected" : "") + ">" +
        esc(w.display_name + " / " + w.role_family + " / " + w.series) + "</option>";
    }
    return html;
  }

  function treeOptions(company, selected) {
    var html = "";
    var i, t;
    for (i = 0; i < company.organization_trees.length; i += 1) {
      t = company.organization_trees[i];
      html += '<option value="' + esc(t.tree_id) + '"' + (t.tree_id === selected ? " selected" : "") + ">" + esc(t.tree_name) + "</option>";
    }
    return html;
  }

  function findTree(company, treeId) {
    var i;
    for (i = 0; i < company.organization_trees.length; i += 1) {
      if (company.organization_trees[i].tree_id === treeId) return company.organization_trees[i];
    }
    return company.organization_trees[0];
  }

  function parentOptions(tree, selected) {
    var html = '<option value="">ルート</option>';
    var i, u;
    if (!tree) return html;
    for (i = 0; i < tree.units.length; i += 1) {
      u = tree.units[i];
      html += '<option value="' + esc(u.unit_id) + '"' + (u.unit_id === selected ? " selected" : "") + ">" +
        esc(u.unit_name + " / " + robotLabel(u)) + "</option>";
    }
    return html;
  }

  function renderFiles(files, attr) {
    var html = "";
    var i, f;
    if (!files || !files.length) return '<p class="aicm-muted">添付ファイルなし</p>';
    for (i = 0; i < files.length; i += 1) {
      f = files[i];
      html += '<div class="aicm-file"><strong>' + esc(f.file_name) + '</strong>' +
        '<p class="aicm-muted">' + esc(f.file_size + " bytes / " + (f.file_type || "unknown")) + '</p>' +
        '<button class="danger" ' + attr + '="' + i + '">削除</button></div>';
    }
    return html;
  }

  function companyButtons(company) {
    var html = "";
    var i, c, active;
    for (i = 0; i < app.data.companies.length; i += 1) {
      c = app.data.companies[i];
      active = c.company_id === company.company_id ? " active" : "";
      html += '<button class="aicm-company' + active + '" data-company="' + esc(c.company_id) + '">' +
        '<strong>' + esc(c.company_name) + '</strong><br><span class="aicm-muted">' + esc(c.business_domain) + '</span></button>';
    }
    return html;
  }

  function childUnits(tree, parentId) {
    var result = [];
    var i;
    for (i = 0; i < tree.units.length; i += 1) {
      if ((tree.units[i].parent_unit_id || "") === (parentId || "")) result.push(tree.units[i]);
    }
    return result;
  }

  function treeUnits(tree, parentId, depth) {
    var children = childUnits(tree, parentId);
    var html = "";
    var i, u, d;
    for (i = 0; i < children.length; i += 1) {
      u = children[i];
      d = depth > 2 ? 2 : depth;
      html += '<div class="aicm-unit depth-' + d + '">' +
        '<strong>' + esc(u.unit_name) + '</strong>' +
        '<span class="aicm-robot">' + esc(robotLabel(u)) + '</span>' +
        '<span class="aicm-badge">AIWorker: ' + esc(workerName(u.aiworker_id)) + '</span>' +
        '<p class="aicm-muted">' + esc(u.purpose || "") + '</p>' +
        '<p><strong>成果物:</strong> ' + esc(u.deliverable || "") + '</p>' +
        treeUnits(tree, u.unit_id, depth + 1) +
        '</div>';
    }
    return html;
  }

  function orgOverview(company) {
    var html = "";
    var i, t;
    for (i = 0; i < company.organization_trees.length; i += 1) {
      t = company.organization_trees[i];
      html += '<details open><summary>' + esc(t.tree_name) + ' / ' + esc(t.tree_purpose || "") + '</summary>' +
        treeUnits(t, "", 0) + '</details>';
    }
    return html || '<p class="aicm-muted">組織ツリーなし</p>';
  }

  function renderDashboard(company) {
    var html = "";
    var i, step;

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>1. 会社</h2>';
    html += '<details open><summary>会社一覧</summary>' + companyButtons(company) + '</details>';
    html += '<details open><summary>会社概要</summary>';
    html += '<p><strong>会社名:</strong> ' + esc(company.company_name) + '</p>';
    html += '<p><strong>事業領域:</strong> ' + esc(company.business_domain) + '</p>';
    html += '<p><strong>社内規則ファイル:</strong> ' + esc((company.rule_files || []).length) + '件</p>';
    html += '</details>';
    html += '<details open><summary>操作画面</summary><div class="aicm-actions">';
    html += '<button class="primary" data-screen="company-operation">会社操作へ</button>';
    html += '<button class="primary" data-screen="organization-operation">組織操作へ</button>';
    html += '</div></details></div>';

    html += '<div class="aicm-card"><h2>2. 進行</h2>';
    html += '<details open><summary>ロール進行</summary>';
    for (i = 0; i < company.role_progress.length; i += 1) {
      step = company.role_progress[i];
      html += '<div class="aicm-unit"><strong>' + esc(step.role) + '</strong> <span class="aicm-badge">' +
        esc(step.status) + '</span><p class="aicm-muted">' + esc(step.detail) + '</p></div>';
    }
    html += '</details>';
    html += '<details open><summary>現在タスク</summary><p>' + esc(company.current_task.task_title) + '</p><p class="aicm-muted">' +
      esc(company.current_task.task_state) + '</p></details></div>';

    html += '<div class="aicm-card"><h2>3. 組織</h2>' + orgOverview(company) + '</div>';

    html += '<div class="aicm-card"><h2>4. 納品</h2>';
    html += '<details open><summary>人間確認ゲート</summary>';
    html += '<p><strong>納品:</strong> ' + esc(company.delivery.delivery_title) + '</p>';
    html += '<p><strong>状態:</strong> ' + esc(company.delivery.delivery_status) + '</p>';
    html += '<div class="aicm-actions"><button class="primary" data-action="accept-delivery">納品を受領</button>';
    html += '<button data-action="revise-delivery">納品前差し戻し</button></div>';
    html += '</details></div></section>';

    return html;
  }

  function renderCompanyOperation(company) {
    var html = "";
    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>対象会社</h2>' + companyButtons(company) + '<button data-screen="dashboard">戻る</button></div>';

    html += '<div class="aicm-card"><h2>会社追加</h2>';
    html += '<div class="aicm-field"><label>会社名</label><input id="new-company-name" value="新会社"></div>';
    html += '<div class="aicm-field"><label>事業領域</label><input id="new-company-domain" value="新規事業"></div>';
    html += '<div class="aicm-field"><label>会社方針</label><textarea id="new-company-policy">新会社の方針</textarea></div>';
    html += '<button class="primary" data-action="add-company">会社を追加</button></div>';

    html += '<div class="aicm-card"><h2>会社変更・削除</h2>';
    html += '<div class="aicm-field"><label>会社名</label><input id="edit-company-name" value="' + esc(company.company_name) + '"></div>';
    html += '<div class="aicm-field"><label>事業領域</label><input id="edit-company-domain" value="' + esc(company.business_domain) + '"></div>';
    html += '<div class="aicm-field"><label>会社方針</label><textarea id="edit-company-policy">' + esc(company.company_policy || "") + '</textarea></div>';
    html += '<button class="primary" data-action="save-company">会社変更を保存</button> ';
    html += '<button class="danger" data-action="delete-company">会社を削除</button>';
    html += '<p id="company-message" class="aicm-muted"></p></div>';

    html += '<div class="aicm-card"><h2>会社ルール添付</h2>';
    html += '<p class="aicm-muted">社内規則・会社ルールを会社ごとに添付します。</p>';
    html += '<div class="aicm-field"><label>社内規則ファイル</label><input id="company-rule-files" type="file" multiple></div>';
    html += '<button class="primary" data-action="add-company-rule-files">会社ルールファイルを追加</button>';
    html += renderFiles(company.rule_files || [], "data-delete-company-file");
    html += '</div></section>';
    return html;
  }

  function renderOrganizationOperation(company) {
    var html = "";
    var firstTree = company.organization_trees[0];
    var i, j, t, u;

    html += '<section class="aicm-grid">';
    html += '<div class="aicm-card"><h2>対象会社</h2>' + companyButtons(company) + '<button data-screen="dashboard">戻る</button></div>';

    html += '<div class="aicm-card"><h2>組織ツリー追加</h2>';
    html += '<div class="aicm-field"><label>ツリー名</label><input id="new-tree-name" value="新しい組織ツリー"></div>';
    html += '<div class="aicm-field"><label>ツリー目的</label><input id="new-tree-purpose" value="目的"></div>';
    html += '<button class="primary" data-action="add-tree">組織ツリーを追加</button></div>';

    html += '<div class="aicm-card"><h2>組織要員追加</h2>';
    html += '<div class="aicm-field"><label>追加先ツリー</label><select id="new-unit-tree">' + treeOptions(company, firstTree ? firstTree.tree_id : "") + '</select></div>';
    html += '<div class="aicm-field"><label>親組織</label><select id="new-unit-parent">' + parentOptions(firstTree, "") + '</select></div>';
    html += '<div class="aicm-field"><label>組織名</label><input id="new-unit-name" value="新しい組織要員"></div>';
    html += '<div class="aicm-field"><label>AIロール</label><select id="new-unit-role">' + roleOptions("Worker") + '</select></div>';
    html += '<div class="aicm-field"><label>ロボット名</label><input id="new-unit-robot-name" value="新ロボット"></div>';
    html += '<div class="aicm-field"><label>AIWorker</label><select id="new-unit-aiworker">' + aiworkerOptions("aiw-worker-001") + '</select></div>';
    html += '<button class="primary" data-action="add-unit">組織要員を追加</button></div>';

    html += '<div class="aicm-card"><h2>組織変更・削除・ルール添付</h2>';
    for (i = 0; i < company.organization_trees.length; i += 1) {
      t = company.organization_trees[i];
      html += '<details open><summary>' + esc(t.tree_name) + '</summary>';
      html += '<div class="aicm-field"><label>ツリー名</label><input data-tree="' + i + '" data-tree-field="tree_name" value="' + esc(t.tree_name) + '"></div>';
      html += '<div class="aicm-field"><label>ツリー目的</label><input data-tree="' + i + '" data-tree-field="tree_purpose" value="' + esc(t.tree_purpose || "") + '"></div>';
      html += '<div class="aicm-field"><label>組織ツリールールファイル</label><input data-tree-rule="' + i + '" type="file" multiple></div>';
      html += '<button data-add-tree-rule="' + i + '">ツリールール添付</button>';
      html += renderFiles(t.rule_files || [], "data-delete-tree-file-" + i);
      for (j = 0; j < t.units.length; j += 1) {
        u = t.units[j];
        html += '<div class="aicm-unit">';
        html += '<span class="aicm-robot">' + esc(robotLabel(u)) + '</span>';
        html += '<div class="aicm-field"><label>親組織</label><select data-tree="' + i + '" data-unit="' + j + '" data-unit-field="parent_unit_id">' + parentOptions(t, u.parent_unit_id) + '</select></div>';
        html += '<div class="aicm-field"><label>組織名</label><input data-tree="' + i + '" data-unit="' + j + '" data-unit-field="unit_name" value="' + esc(u.unit_name) + '"></div>';
        html += '<div class="aicm-field"><label>ロボット名</label><input data-tree="' + i + '" data-unit="' + j + '" data-unit-field="robot_name" value="' + esc(u.robot_name) + '"></div>';
        html += '<div class="aicm-field"><label>AIロール</label><select data-tree="' + i + '" data-unit="' + j + '" data-unit-field="ai_role">' + roleOptions(u.ai_role) + '</select></div>';
        html += '<div class="aicm-field"><label>AIWorker</label><select data-tree="' + i + '" data-unit="' + j + '" data-unit-field="aiworker_id">' + aiworkerOptions(u.aiworker_id) + '</select></div>';
        html += '<div class="aicm-field"><label>組織ルールファイル</label><input data-unit-rule="' + i + ':' + j + '" type="file" multiple></div>';
        html += '<button data-add-unit-rule="' + i + ':' + j + '">組織ルール添付</button>';
        html += renderFiles(u.rule_files || [], "data-delete-unit-file-" + i + "-" + j);
        html += '<button class="danger" data-delete-unit="' + i + ':' + j + '">組織要員を削除</button>';
        html += '</div>';
      }
      html += '<button class="danger" data-delete-tree="' + i + '">組織ツリーを削除</button>';
      html += '</details>';
    }
    html += '<button class="primary" data-action="save-organization">組織変更を保存</button></div></section>';
    return html;
  }

  function handoffBody(company, type, files) {
    var lines = [];
    var i, t, j, u;

    lines.push("# ============================================================");
    lines.push("# AICompanyManager 引き継ぎワンブロック");
    lines.push("# ============================================================");
    lines.push("");
    lines.push("handoff_type: " + type);
    lines.push("company_name: " + company.company_name);
    lines.push("business_domain: " + company.business_domain);
    lines.push("");
    lines.push("organization_trees:");
    for (i = 0; i < company.organization_trees.length; i += 1) {
      t = company.organization_trees[i];
      lines.push("- tree: " + t.tree_name);
      for (j = 0; j < t.units.length; j += 1) {
        u = t.units[j];
        lines.push("  - " + u.unit_name + " / " + robotLabel(u) + " / AIWorker=" + workerName(u.aiworker_id));
      }
    }
    lines.push("");
    lines.push("attachments:");
    if (!files.length) {
      lines.push("- none");
    } else {
      for (i = 0; i < files.length; i += 1) {
        lines.push("- " + files[i].file_name + " / " + files[i].file_size + " bytes / " + files[i].file_type);
      }
    }
    lines.push("");
    lines.push("safety:");
    lines.push("- DB WRITE: NOT EXECUTED");
    lines.push("- RLS APPLY: NOT EXECUTED");
    lines.push("- LIVE AIWORKEROS CALL: NOT EXECUTED");
    return lines.join("\n");
  }

  function renderHandoff(company) {
    var html = "";
    var i, h;

    html += '<section class="aicm-grid"><div class="aicm-card"><h2>引き継ぎ作成</h2>';
    html += '<div class="aicm-field"><label>種別</label><select id="handoff-type"><option value="task">タスク</option><option value="design_in_progress">設計途中</option><option value="development_in_progress">開発途中</option><option value="delivery_preparation">納品前</option></select></div>';
    html += '<div class="aicm-field"><label>タイトル</label><input id="handoff-title" value="' + esc(company.current_task.task_title) + '"></div>';
    html += '<div class="aicm-field"><label>追加ファイル</label><input id="handoff-files" type="file" multiple></div>';
    html += '<button class="primary" data-action="create-handoff">引き継ぎを追加</button></div>';

    html += '<div class="aicm-card"><h2>作成済み</h2>';
    for (i = 0; i < company.handoffs.length; i += 1) {
      h = company.handoffs[i];
      html += '<details><summary>' + esc(h.title) + ' / files=' + esc((h.attachments || []).length) + '</summary>';
      html += '<textarea class="aicm-output" readonly>' + esc(h.body) + '</textarea>';
      html += '<button class="danger" data-delete-handoff="' + i + '">削除</button></details>';
    }
    html += '</div></section>';
    return html;
  }

  function layout(body, company) {
    return '<main class="aicm-shell">' +
      '<header class="aicm-header"><div><h1 class="aicm-title">AI企業運営アプリ</h1>' +
      '<p class="aicm-sub">Phase AB 安定版 / 会社操作・組織操作・ルール添付・引き継ぎ添付</p></div>' +
      '<span class="aicm-badge">Phase AB</span></header>' +
      '<nav class="aicm-tabs">' +
      '<button class="' + (app.screen === "dashboard" ? "primary" : "") + '" data-screen="dashboard">会社ダッシュボード</button>' +
      '<button class="' + (app.screen === "handoff" ? "primary" : "") + '" data-screen="handoff">引き継ぎ</button>' +
      '</nav>' +
      body +
      '</main>';
  }

  function render() {
    var root = document.getElementById("aicm-root");
    var company = activeCompany();
    if (!root) return;
    if (!company) {
      root.innerHTML = '<div class="aicm-error">会社データがありません</div>';
      return;
    }

    if (app.screen === "company-operation") root.innerHTML = layout(renderCompanyOperation(company), company);
    else if (app.screen === "organization-operation") root.innerHTML = layout(renderOrganizationOperation(company), company);
    else if (app.screen === "handoff") root.innerHTML = layout(renderHandoff(company), company);
    else root.innerHTML = layout(renderDashboard(company), company);

    bind();
  }

  function bind() {
    var buttons, i;

    buttons = document.querySelectorAll("[data-screen]");
    for (i = 0; i < buttons.length; i += 1) {
      buttons[i].onclick = function () {
        app.screen = this.getAttribute("data-screen");
        render();
      };
    }

    buttons = document.querySelectorAll("[data-company]");
    for (i = 0; i < buttons.length; i += 1) {
      buttons[i].onclick = function () {
        app.companyId = this.getAttribute("data-company");
        render();
      };
    }

    bindActions();
  }

  function bindActions() {
    var nodeList, i;

    nodeList = document.querySelectorAll("[data-action]");
    for (i = 0; i < nodeList.length; i += 1) {
      nodeList[i].onclick = handleAction;
    }

    nodeList = document.querySelectorAll("[data-delete-tree]");
    for (i = 0; i < nodeList.length; i += 1) {
      nodeList[i].onclick = function () {
        var c = activeCompany();
        c.organization_trees.splice(Number(this.getAttribute("data-delete-tree")), 1);
        save();
        render();
      };
    }

    nodeList = document.querySelectorAll("[data-delete-unit]");
    for (i = 0; i < nodeList.length; i += 1) {
      nodeList[i].onclick = function () {
        var c = activeCompany();
        var parts = this.getAttribute("data-delete-unit").split(":");
        var t = c.organization_trees[Number(parts[0])];
        var removed = t.units[Number(parts[1])];
        t.units.splice(Number(parts[1]), 1);
        for (var k = 0; k < t.units.length; k += 1) {
          if (t.units[k].parent_unit_id === removed.unit_id) t.units[k].parent_unit_id = "";
        }
        save();
        render();
      };
    }

    nodeList = document.querySelectorAll("[data-add-tree-rule]");
    for (i = 0; i < nodeList.length; i += 1) {
      nodeList[i].onclick = function () {
        var c = activeCompany();
        var idx = Number(this.getAttribute("data-add-tree-rule"));
        var input = document.querySelector('[data-tree-rule="' + idx + '"]');
        c.organization_trees[idx].rule_files = c.organization_trees[idx].rule_files.concat(fileMetas(input.files || []));
        save();
        render();
      };
    }

    nodeList = document.querySelectorAll("[data-add-unit-rule]");
    for (i = 0; i < nodeList.length; i += 1) {
      nodeList[i].onclick = function () {
        var c = activeCompany();
        var parts = this.getAttribute("data-add-unit-rule").split(":");
        var input = document.querySelector('[data-unit-rule="' + parts[0] + ':' + parts[1] + '"]');
        var unit = c.organization_trees[Number(parts[0])].units[Number(parts[1])];
        unit.rule_files = unit.rule_files.concat(fileMetas(input.files || []));
        save();
        render();
      };
    }

    nodeList = document.querySelectorAll("[data-delete-handoff]");
    for (i = 0; i < nodeList.length; i += 1) {
      nodeList[i].onclick = function () {
        activeCompany().handoffs.splice(Number(this.getAttribute("data-delete-handoff")), 1);
        save();
        render();
      };
    }
  }

  function handleAction() {
    var action = this.getAttribute("data-action");
    var c = activeCompany();
    var tree, files, newCompany;

    if (action === "add-company") {
      newCompany = {
        company_id: id("company"),
        company_name: document.getElementById("new-company-name").value || "新会社",
        business_domain: document.getElementById("new-company-domain").value || "新規事業",
        company_policy: document.getElementById("new-company-policy").value || "",
        delivery_policy: "納品時のみ人間確認",
        rule_files: [],
        organization_trees: [],
        role_progress: [
          { role: "President", status: "未着手", detail: "方針待ち" },
          { role: "Manager", status: "未着手", detail: "分解待ち" },
          { role: "Leader", status: "未着手", detail: "統合待ち" },
          { role: "Worker", status: "未着手", detail: "作業待ち" }
        ],
        current_task: { task_title: "初期設定", task_state: "設定中", task_owner_role: "President", selected_aiworker_id: "aiw-president-001", input_materials: "会社設定", output_expectation: "運営開始" },
        delivery: { delivery_title: "未作成", delivery_status: "未納品" },
        handoffs: []
      };
      app.data.companies.push(newCompany);
      app.companyId = newCompany.company_id;
      save();
      render();
      return;
    }

    if (action === "save-company") {
      c.company_name = document.getElementById("edit-company-name").value;
      c.business_domain = document.getElementById("edit-company-domain").value;
      c.company_policy = document.getElementById("edit-company-policy").value;
      save();
      render();
      return;
    }

    if (action === "delete-company") {
      if (app.data.companies.length <= 1) {
        document.getElementById("company-message").textContent = "最後の1社は削除できません。";
        return;
      }
      app.data.companies = app.data.companies.filter(function (x) { return x.company_id !== c.company_id; });
      app.companyId = app.data.companies[0].company_id;
      save();
      render();
      return;
    }

    if (action === "add-company-rule-files") {
      files = fileMetas(document.getElementById("company-rule-files").files || []);
      c.rule_files = c.rule_files.concat(files);
      save();
      render();
      return;
    }

    if (action === "add-tree") {
      c.organization_trees.push({ tree_id: id("tree"), tree_name: document.getElementById("new-tree-name").value || "新しい組織ツリー", tree_purpose: document.getElementById("new-tree-purpose").value || "", rule_files: [], units: [] });
      save();
      render();
      return;
    }

    if (action === "add-unit") {
      tree = findTree(c, document.getElementById("new-unit-tree").value);
      if (!tree) return;
      tree.units.push({
        unit_id: id("unit"),
        parent_unit_id: document.getElementById("new-unit-parent").value || "",
        unit_name: document.getElementById("new-unit-name").value || "新しい組織要員",
        purpose: "",
        ai_role: document.getElementById("new-unit-role").value || "Worker",
        robot_name: document.getElementById("new-unit-robot-name").value || "新ロボット",
        aiworker_id: document.getElementById("new-unit-aiworker").value || "aiw-worker-001",
        deliverable: "",
        rule_files: []
      });
      save();
      render();
      return;
    }

    if (action === "save-organization") {
      saveOrganizationForms(c);
      save();
      render();
      return;
    }

    if (action === "create-handoff") {
      files = fileMetas(document.getElementById("handoff-files").files || []);
      c.handoffs.push({
        title: document.getElementById("handoff-title").value || "引き継ぎ",
        type: document.getElementById("handoff-type").value,
        attachments: files,
        body: handoffBody(c, document.getElementById("handoff-type").value, files)
      });
      save();
      render();
      return;
    }

    if (action === "accept-delivery") {
      c.delivery.delivery_status = "受領済み mock";
      save();
      render();
      return;
    }

    if (action === "revise-delivery") {
      c.delivery.delivery_status = "納品前差し戻し mock";
      save();
      render();
    }
  }

  function saveOrganizationForms(c) {
    var fields = document.querySelectorAll("[data-tree-field]");
    var i, t, u, key;
    for (i = 0; i < fields.length; i += 1) {
      t = Number(fields[i].getAttribute("data-tree"));
      key = fields[i].getAttribute("data-tree-field");
      c.organization_trees[t][key] = fields[i].value;
    }

    fields = document.querySelectorAll("[data-unit-field]");
    for (i = 0; i < fields.length; i += 1) {
      t = Number(fields[i].getAttribute("data-tree"));
      u = Number(fields[i].getAttribute("data-unit"));
      key = fields[i].getAttribute("data-unit-field");
      c.organization_trees[t].units[u][key] = fields[i].value;
    }
  }

  function start() {
    app.data = load();
    if (!app.data.companies.length) app.data = defaultData();
    app.companyId = app.data.companies[0].company_id;
    render();
  }

  document.addEventListener("DOMContentLoaded", start);
})();
