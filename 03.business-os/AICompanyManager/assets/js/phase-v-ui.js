(function () {
  "use strict";

  const STORAGE_KEY = "AICM_PHASE_Y_STATE";

  const state = {
    tab: "dashboard",
    companyId: "company-acm-001",
    data: null,
    pendingAttachments: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function defaultData() {
    const base = window.AICM_PHASE_V_DATA || { aiworkers: [], companies: [] };
    const data = clone(base);
    normalizeData(data);
    return data;
  }

  function normalizeData(data) {
    data.aiworkers = data.aiworkers || [];
    data.companies = data.companies || [];

    data.companies.forEach(function (company) {
      if (!company.organization_trees && company.organization_units) {
        company.organization_trees = [{
          tree_id: makeId("tree"),
          tree_name: "主組織ツリー",
          tree_purpose: "旧組織から移行",
          units: company.organization_units
        }];
        delete company.organization_units;
      }

      company.organization_trees = company.organization_trees || [];
      company.handoffs = company.handoffs || [];
      company.role_progress = company.role_progress || [
        { role: "President", status: "未着手", detail: "方針待ち" },
        { role: "Manager", status: "未着手", detail: "分解待ち" },
        { role: "Leader", status: "未着手", detail: "統合待ち" },
        { role: "Worker", status: "未着手", detail: "作業待ち" }
      ];
      company.current_task = company.current_task || {
        task_title: "初期設定",
        task_state: "設定中",
        task_owner_role: "President",
        selected_aiworker_id: "aiw-president-001",
        input_materials: "会社設定",
        output_expectation: "運営開始可能な会社設定"
      };
      company.delivery = company.delivery || {
        delivery_title: "未作成",
        delivery_status: "未納品"
      };

      company.organization_trees.forEach(function (tree) {
        tree.units = tree.units || [];
        tree.units.forEach(function (unit) {
          unit.robot_name = unit.robot_name || unit.unit_name || "未命名";
          unit.ai_role = unit.ai_role || "Worker";
          unit.parent_unit_id = unit.parent_unit_id || "";
        });
      });
    });
  }

  function initialData() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.companies && parsed.aiworkers) {
          normalizeData(parsed);
          return parsed;
        }
      }
    } catch (error) {
      return defaultData();
    }
    return defaultData();
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch (error) {
      return;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function companies() {
    return state.data.companies || [];
  }

  function company() {
    const list = companies();
    return list.find(function (item) { return item.company_id === state.companyId; }) || list[0];
  }

  function aiworkerName(id) {
    const worker = state.data.aiworkers.find(function (item) { return item.aiworker_id === id; });
    return worker ? worker.display_name : "未選択";
  }

  function robotLabel(unit) {
    return (unit.robot_name || "未命名") + "@" + (unit.ai_role || "Role");
  }

  function roleOptions(selected) {
    return ["President", "Manager", "Leader", "Worker"].map(function (role) {
      return "<option value=\"" + role + "\"" + (role === selected ? " selected" : "") + ">" + role + "</option>";
    }).join("");
  }

  function aiworkerOptions(selectedId, roleFamily) {
    return state.data.aiworkers
      .filter(function (worker) {
        return !roleFamily || worker.role_family === roleFamily || worker.role_family === "Worker";
      })
      .map(function (worker) {
        const selected = worker.aiworker_id === selectedId ? " selected" : "";
        return "<option value=\"" + escapeHtml(worker.aiworker_id) + "\"" + selected + ">" +
          escapeHtml(worker.display_name + " / " + worker.role_family + " / " + worker.series) +
          "</option>";
      })
      .join("");
  }

  function treeOptions(active, selectedTreeId) {
    return (active.organization_trees || []).map(function (tree) {
      return "<option value=\"" + escapeHtml(tree.tree_id) + "\"" + (tree.tree_id === selectedTreeId ? " selected" : "") + ">" + escapeHtml(tree.tree_name) + "</option>";
    }).join("");
  }

  function findTree(active, treeId) {
    return (active.organization_trees || []).find(function (tree) { return tree.tree_id === treeId; }) || (active.organization_trees || [])[0];
  }

  function parentUnitOptions(tree, selected) {
    const rows = ["<option value=\"\">ルート</option>"];
    (tree ? tree.units : []).forEach(function (unit) {
      rows.push("<option value=\"" + escapeHtml(unit.unit_id) + "\"" + (unit.unit_id === selected ? " selected" : "") + ">" + escapeHtml(unit.unit_name + " / " + robotLabel(unit)) + "</option>");
    });
    return rows.join("");
  }

  function renderCompanyList(active) {
    return companies().map(function (item) {
      const cls = item.company_id === active.company_id ? " active" : "";
      return "<button class=\"aicm-company-button" + cls + "\" data-company-id=\"" + escapeHtml(item.company_id) + "\">" +
        "<strong>" + escapeHtml(item.company_name) + "</strong><br>" +
        "<span class=\"aicm-muted\">" + escapeHtml(item.business_domain) + "</span>" +
        "</button>";
    }).join("");
  }

  function renderRoleProgress(active) {
    return active.role_progress.map(function (step) {
      return "<div class=\"aicm-role-step\">" +
        "<strong>" + escapeHtml(step.role) + "</strong>" +
        "<span class=\"aicm-badge\">" + escapeHtml(step.status) + "</span>" +
        "<p class=\"aicm-muted\">" + escapeHtml(step.detail) + "</p>" +
        "</div>";
    }).join("");
  }

  function childrenOf(tree, parentId) {
    return tree.units.filter(function (unit) {
      return (unit.parent_unit_id || "") === (parentId || "");
    });
  }

  function renderTreeUnits(tree, parentId, depth) {
    const children = childrenOf(tree, parentId);
    if (!children.length) {
      return "";
    }

    return children.map(function (unit) {
      const safeDepth = Math.min(depth, 3);
      return "<div class=\"aicm-tree-unit depth-" + safeDepth + "\">" +
        "<strong>" + escapeHtml(unit.unit_name) + "</strong>" +
        "<span class=\"aicm-robot-label\">" + escapeHtml(robotLabel(unit)) + "</span>" +
        "<span class=\"aicm-badge\">AIWorker: " + escapeHtml(aiworkerName(unit.aiworker_id)) + "</span>" +
        "<p class=\"aicm-muted\">" + escapeHtml(unit.purpose) + "</p>" +
        "<p><strong>成果物:</strong> " + escapeHtml(unit.deliverable) + "</p>" +
        renderTreeUnits(tree, unit.unit_id, depth + 1) +
        "</div>";
    }).join("");
  }

  function renderOrgTrees(active) {
    if (!active.organization_trees || !active.organization_trees.length) {
      return "<p class=\"aicm-muted\">組織ツリーは未作成です。</p>";
    }

    return active.organization_trees.map(function (tree) {
      return "<details class=\"aicm-collapse\" open>" +
        "<summary>" + escapeHtml(tree.tree_name) + " / " + escapeHtml(tree.tree_purpose) + "</summary>" +
        renderTreeUnits(tree, "", 0) +
      "</details>";
    }).join("");
  }

  function renderCompanyAddPanel() {
    return "<details class=\"aicm-collapse\"><summary>会社追加</summary>" +
      "<div class=\"aicm-grid-2\">" +
        "<div class=\"aicm-field\"><label>会社名</label><input id=\"new-company-name\" value=\"新会社\"></div>" +
        "<div class=\"aicm-field\"><label>事業領域</label><input id=\"new-company-domain\" value=\"新規事業\"></div>" +
      "</div>" +
      "<div class=\"aicm-field\"><label>会社方針</label><textarea id=\"new-company-policy\">新会社の方針を設定してください。</textarea></div>" +
      "<div class=\"aicm-field\"><label>納品ルール</label><input id=\"new-company-delivery-policy\" value=\"納品時のみ人間確認\"></div>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-action=\"add-company\">会社を追加</button></div>" +
    "</details>";
  }

  function renderCompanyEditPanel(active) {
    return "<details class=\"aicm-collapse\"><summary>会社変更</summary>" +
      "<div class=\"aicm-grid-2\">" +
        "<div class=\"aicm-field\"><label>会社名</label><input id=\"set-company-name\" value=\"" + escapeHtml(active.company_name) + "\"></div>" +
        "<div class=\"aicm-field\"><label>事業領域</label><input id=\"set-business-domain\" value=\"" + escapeHtml(active.business_domain) + "\"></div>" +
      "</div>" +
      "<div class=\"aicm-field\"><label>会社方針</label><textarea id=\"set-company-policy\">" + escapeHtml(active.company_policy) + "</textarea></div>" +
      "<div class=\"aicm-field\"><label>納品ルール</label><input id=\"set-delivery-policy\" value=\"" + escapeHtml(active.delivery_policy) + "\"></div>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-action=\"save-company-edit\">会社変更を保存</button></div>" +
    "</details>";
  }

  function renderOrgTreeAddPanel() {
    return "<details class=\"aicm-collapse\"><summary>組織ツリー追加</summary>" +
      "<div class=\"aicm-grid-2\">" +
        "<div class=\"aicm-field\"><label>ツリー名</label><input id=\"new-tree-name\" value=\"新しい組織ツリー\"></div>" +
        "<div class=\"aicm-field\"><label>ツリー目的</label><input id=\"new-tree-purpose\" value=\"目的を設定してください\"></div>" +
      "</div>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-action=\"add-org-tree\">組織ツリーを追加</button></div>" +
    "</details>";
  }

  function renderOrgUnitAddPanel(active) {
    const trees = active.organization_trees || [];
    const selectedTreeId = trees[0] ? trees[0].tree_id : "";
    const selectedTree = findTree(active, selectedTreeId);

    return "<details class=\"aicm-collapse\"><summary>組織要員追加</summary>" +
      "<div class=\"aicm-grid-3\">" +
        "<div class=\"aicm-field\"><label>追加先ツリー</label><select id=\"new-unit-tree-id\">" + treeOptions(active, selectedTreeId) + "</select></div>" +
        "<div class=\"aicm-field\"><label>親組織</label><select id=\"new-unit-parent-id\">" + parentUnitOptions(selectedTree, "") + "</select></div>" +
        "<div class=\"aicm-field\"><label>組織名</label><input id=\"new-unit-name\" value=\"新しい組織要員\"></div>" +
        "<div class=\"aicm-field\"><label>AIロール</label><select id=\"new-unit-role\">" + roleOptions("Worker") + "</select></div>" +
        "<div class=\"aicm-field\"><label>ロボット名</label><input id=\"new-unit-robot-name\" value=\"新ロボット\"></div>" +
        "<div class=\"aicm-field\"><label>AIWorker選択</label><select id=\"new-unit-aiworker-id\">" + aiworkerOptions("aiw-worker-001", "Worker") + "</select></div>" +
      "</div>" +
      "<div class=\"aicm-field\"><label>目的</label><textarea id=\"new-unit-purpose\">目的を設定してください</textarea></div>" +
      "<div class=\"aicm-field\"><label>成果物責任</label><input id=\"new-unit-deliverable\" value=\"成果物を設定してください\"></div>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-action=\"add-org-unit\">組織要員を追加</button></div>" +
    "</details>";
  }

  function renderOrgEditPanel(active) {
    const rows = (active.organization_trees || []).map(function (tree, treeIndex) {
      const unitRows = tree.units.map(function (unit, unitIndex) {
        return "<div class=\"aicm-org-row\">" +
          "<div class=\"aicm-grid-3\">" +
            "<div class=\"aicm-field\"><label>親組織</label><select data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"parent_unit_id\">" + parentUnitOptions(tree, unit.parent_unit_id) + "</select></div>" +
            "<div class=\"aicm-field\"><label>組織名</label><input data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"unit_name\" value=\"" + escapeHtml(unit.unit_name) + "\"></div>" +
            "<div class=\"aicm-field\"><label>AIロール</label><select data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"ai_role\">" + roleOptions(unit.ai_role) + "</select></div>" +
          "</div>" +
          "<div class=\"aicm-grid-3\">" +
            "<div class=\"aicm-field\"><label>ロボット名</label><input data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"robot_name\" value=\"" + escapeHtml(unit.robot_name || "") + "\"></div>" +
            "<div class=\"aicm-field\"><label>AIWorker選択</label><select data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"aiworker_id\">" + aiworkerOptions(unit.aiworker_id, unit.ai_role) + "</select></div>" +
            "<div class=\"aicm-field\"><label>成果物責任</label><input data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"deliverable\" value=\"" + escapeHtml(unit.deliverable) + "\"></div>" +
          "</div>" +
          "<div class=\"aicm-field\"><label>目的</label><textarea data-tree=\"" + treeIndex + "\" data-unit=\"" + unitIndex + "\" data-field=\"purpose\">" + escapeHtml(unit.purpose) + "</textarea></div>" +
          "<p><span class=\"aicm-robot-label\">" + escapeHtml(robotLabel(unit)) + "</span></p>" +
          "<div class=\"aicm-actions\"><button class=\"aicm-button danger\" data-delete-unit=\"" + treeIndex + ":" + unitIndex + "\">組織要員を削除</button></div>" +
        "</div>";
      }).join("");

      return "<details class=\"aicm-collapse\"><summary>組織変更: " + escapeHtml(tree.tree_name) + "</summary>" +
        "<div class=\"aicm-tree-row\">" +
          "<div class=\"aicm-grid-2\">" +
            "<div class=\"aicm-field\"><label>ツリー名</label><input data-tree=\"" + treeIndex + "\" data-tree-field=\"tree_name\" value=\"" + escapeHtml(tree.tree_name) + "\"></div>" +
            "<div class=\"aicm-field\"><label>ツリー目的</label><input data-tree=\"" + treeIndex + "\" data-tree-field=\"tree_purpose\" value=\"" + escapeHtml(tree.tree_purpose) + "\"></div>" +
          "</div>" +
          (unitRows || "<p class=\"aicm-muted\">まだ組織要員がありません。</p>") +
          "<div class=\"aicm-actions\"><button class=\"aicm-button danger\" data-delete-tree=\"" + treeIndex + "\">組織ツリーを削除</button></div>" +
        "</div>" +
      "</details>";
    }).join("");

    return "<details class=\"aicm-collapse\"><summary>組織変更</summary>" +
      (rows || "<p class=\"aicm-muted\">組織ツリーは未作成です。</p>") +
      "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-action=\"save-org-edit\">組織変更を保存</button></div>" +
    "</details>";
  }

  function renderRoleAndTask(active) {
    return "<details class=\"aicm-collapse\" open><summary>ロール進行</summary>" + renderRoleProgress(active) + "</details>" +
      "<details class=\"aicm-collapse\" open><summary>現在のタスク</summary>" +
        "<p><strong>タスク:</strong> " + escapeHtml(active.current_task.task_title) + "</p>" +
        "<p><strong>状態:</strong> " + escapeHtml(active.current_task.task_state) + "</p>" +
        "<p><strong>担当:</strong> " + escapeHtml(active.current_task.task_owner_role) + " / " + escapeHtml(aiworkerName(active.current_task.selected_aiworker_id)) + "</p>" +
      "</details>";
  }

  function renderDashboard(active) {
    return "<section class=\"aicm-dashboard\">" +
      "<div class=\"aicm-card\">" +
        "<h2>1. 会社</h2>" +
        "<details class=\"aicm-collapse\" open><summary>会社一覧</summary>" + renderCompanyList(active) + "</details>" +
        "<details class=\"aicm-collapse\" open><summary>会社概要</summary>" +
          "<p><strong>会社名:</strong> " + escapeHtml(active.company_name) + "</p>" +
          "<p><strong>事業領域:</strong> " + escapeHtml(active.business_domain) + "</p>" +
          "<p><strong>ロボット命名:</strong> 各作業ロボット単位</p>" +
          "<p><strong>課金:</strong> システム用のため対象外</p>" +
        "</details>" +
        renderCompanyAddPanel() +
        renderCompanyEditPanel(active) +
      "</div>" +
      "<div class=\"aicm-card\">" +
        "<h2>2. 進行</h2>" +
        renderRoleAndTask(active) +
      "</div>" +
      "<div class=\"aicm-card\">" +
        "<h2>3. 組織</h2>" +
        renderOrgTrees(active) +
        renderOrgTreeAddPanel() +
        renderOrgUnitAddPanel(active) +
        renderOrgEditPanel(active) +
      "</div>" +
      "<div class=\"aicm-card\">" +
        "<h2>4. 納品</h2>" +
        "<details class=\"aicm-collapse\" open><summary>人間確認ゲート</summary>" +
          "<p><strong>納品:</strong> " + escapeHtml(active.delivery.delivery_title) + "</p>" +
          "<p><strong>状態:</strong> " + escapeHtml(active.delivery.delivery_status) + "</p>" +
          "<p><strong>人間操作:</strong> 納品時のみ人間確認</p>" +
          "<div class=\"aicm-actions\">" +
            "<button class=\"aicm-button primary\" data-action=\"accept-delivery\">納品を受領</button>" +
            "<button class=\"aicm-button\" data-action=\"request-delivery-revision\">納品前差し戻し</button>" +
          "</div>" +
        "</details>" +
      "</div>" +
    "</section>";
  }

  function allUnits(active) {
    return (active.organization_trees || []).flatMap(function (tree) {
      return tree.units.map(function (unit) {
        return { tree: tree, unit: unit };
      });
    });
  }

  function attachmentLines(attachments) {
    if (!attachments || !attachments.length) {
      return "- none";
    }
    return attachments.map(function (file) {
      return "- " + file.name + " / " + file.size + " bytes / " + (file.type || "unknown");
    }).join("\n");
  }

  function buildHandoff(active, type, attachments) {
    const task = active.current_task;
    const orgLines = allUnits(active).map(function (row) {
      return "- " + row.tree.tree_name + " / " + row.unit.unit_name + " / " + robotLabel(row.unit) + " / AIWorker=" + aiworkerName(row.unit.aiworker_id) + " / parent=" + (row.unit.parent_unit_id || "root");
    });

    return [
      "# ============================================================",
      "# AICompanyManager 引き継ぎワンブロック",
      "# ============================================================",
      "",
      "handoff_type: " + type,
      "app_name: AICompanyManager",
      "display_name: AI企業運営アプリ",
      "company_id: " + active.company_id,
      "company_name: " + active.company_name,
      "business_domain: " + active.business_domain,
      "",
      "task:",
      "- title: " + task.task_title,
      "- state: " + task.task_state,
      "- owner_role: " + task.task_owner_role,
      "- selected_aiworker: " + aiworkerName(task.selected_aiworker_id),
      "- input_materials: " + task.input_materials,
      "- output_expectation: " + task.output_expectation,
      "",
      "organization_trees:",
      orgLines.join("\n"),
      "",
      "attachments:",
      attachmentLines(attachments),
      "",
      "robot_display_rule:",
      "- 名前@ロール",
      "",
      "next:",
      "- このワンブロックを次チャットに貼って続行する",
      "- 添付ファイルがある場合は、同じファイルも次チャットへ追加する",
      "- タスク引き継ぎの場合は task を優先する",
      "",
      "safety:",
      "- DB WRITE: NOT EXECUTED",
      "- RLS APPLY: NOT EXECUTED",
      "- LIVE AIWORKEROS CALL: NOT EXECUTED"
    ].join("\n");
  }

  function renderAttachmentPendingList() {
    if (!state.pendingAttachments.length) {
      return "<p class=\"aicm-muted\">追加ファイルは未選択です。</p>";
    }

    return state.pendingAttachments.map(function (file, index) {
      return "<div class=\"aicm-attachment-row\">" +
        "<strong>" + escapeHtml(file.name) + "</strong>" +
        "<p class=\"aicm-muted\">" + escapeHtml(file.size + " bytes / " + (file.type || "unknown")) + "</p>" +
        "<button class=\"aicm-button danger\" data-remove-pending-file=\"" + index + "\">外す</button>" +
      "</div>";
    }).join("");
  }

  function renderHandoffs(active) {
    const handoffRows = active.handoffs.map(function (item, index) {
      return "<details class=\"aicm-collapse\">" +
        "<summary>" + escapeHtml(item.title) + " / " + escapeHtml(item.type) + " / files=" + escapeHtml((item.attachments || []).length) + "</summary>" +
        "<textarea class=\"aicm-output\" readonly>" + escapeHtml(item.body) + "</textarea>" +
        "<div class=\"aicm-actions\"><button class=\"aicm-button danger\" data-delete-handoff=\"" + index + "\">この引き継ぎを削除</button></div>" +
      "</details>";
    }).join("");

    return "<section class=\"aicm-card\">" +
      "<h2>引き継ぎ</h2>" +
      "<p class=\"aicm-muted\">ChatGPTの追加ファイルのように、複数ファイルを選択して引き継ぎ情報へ含められます。現在はローカルmockのためファイル本体はアップロードせず、ファイル情報を記録します。</p>" +
      "<div class=\"aicm-grid-2\">" +
        "<div class=\"aicm-field\"><label>引き継ぎ種別</label><select id=\"handoff-type\">" +
          "<option value=\"company_policy\">会社方針</option>" +
          "<option value=\"task\">タスク</option>" +
          "<option value=\"design_in_progress\">設計途中</option>" +
          "<option value=\"development_in_progress\">開発途中</option>" +
          "<option value=\"delivery_preparation\">納品前</option>" +
          "<option value=\"issue_fix\">不具合修正</option>" +
        "</select></div>" +
        "<div class=\"aicm-field\"><label>タイトル</label><input id=\"handoff-title\" value=\"" + escapeHtml(active.current_task.task_title) + "\"></div>" +
      "</div>" +
      "<details class=\"aicm-collapse\" open><summary>追加ファイル</summary>" +
        "<div class=\"aicm-field\"><label>ファイル選択</label><input id=\"handoff-files\" type=\"file\" multiple></div>" +
        "<div id=\"pending-file-list\">" + renderAttachmentPendingList() + "</div>" +
      "</details>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-action=\"create-handoff\">引き継ぎを追加</button></div>" +
      "<details class=\"aicm-collapse\" open><summary>作成済み引き継ぎ</summary>" +
        (handoffRows || "<p class=\"aicm-muted\">まだ引き継ぎはありません。</p>") +
      "</details>" +
    "</section>";
  }

  function render() {
    if (!state.data) {
      state.data = initialData();
    }

    const active = company();
    if (!active) {
      return;
    }

    let root = document.getElementById("aicm-root");
    if (!root) {
      document.body.innerHTML = "<div id=\"aicm-root\"></div>";
      root = document.getElementById("aicm-root");
    }

    const mainBody = state.tab === "handoffs" ? renderHandoffs(active) : renderDashboard(active);

    root.innerHTML = "<main class=\"aicm-shell\">" +
      "<header class=\"aicm-header\">" +
        "<div><h1 class=\"aicm-title\">AI企業運営アプリ</h1>" +
        "<p class=\"aicm-subtitle\">会社追加・会社変更・組織ツリー追加・組織要員追加・組織変更は会社ダッシュボード内。引き継ぎは追加ファイル対応。</p></div>" +
        "<span class=\"aicm-badge\">Phase Y</span>" +
      "</header>" +
      "<nav class=\"aicm-tabs\">" +
        "<button class=\"aicm-tab " + (state.tab === "dashboard" ? "active" : "") + "\" data-tab=\"dashboard\">会社ダッシュボード</button>" +
        "<button class=\"aicm-tab " + (state.tab === "handoffs" ? "active" : "") + "\" data-tab=\"handoffs\">引き継ぎ</button>" +
      "</nav>" +
      mainBody +
    "</main>";

    bindEvents();
  }

  function applyOrgFormToState(active) {
    document.querySelectorAll("[data-tree-field]").forEach(function (field) {
      const treeIndex = Number(field.getAttribute("data-tree"));
      const key = field.getAttribute("data-tree-field");
      active.organization_trees[treeIndex][key] = field.value;
    });

    document.querySelectorAll("[data-unit]").forEach(function (field) {
      const treeIndex = Number(field.getAttribute("data-tree"));
      const unitIndex = Number(field.getAttribute("data-unit"));
      const key = field.getAttribute("data-field");
      active.organization_trees[treeIndex].units[unitIndex][key] = field.value;
    });
  }

  function bindEvents() {
    document.querySelectorAll("[data-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.tab = button.getAttribute("data-tab");
        render();
      });
    });

    document.querySelectorAll("[data-company-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.companyId = button.getAttribute("data-company-id");
        render();
      });
    });

    const fileInput = document.getElementById("handoff-files");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        state.pendingAttachments = Array.prototype.slice.call(fileInput.files || []).map(function (file) {
          return { name: file.name, size: file.size, type: file.type || "unknown", last_modified: file.lastModified || null };
        });
        render();
      });
    }

    document.querySelectorAll("[data-remove-pending-file]").forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(button.getAttribute("data-remove-pending-file"));
        state.pendingAttachments.splice(index, 1);
        render();
      });
    });

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        const active = company();
        const action = button.getAttribute("data-action");

        if (action === "add-company") {
          const newCompany = {
            company_id: makeId("company"),
            company_name: document.getElementById("new-company-name").value || "新会社",
            business_domain: document.getElementById("new-company-domain").value || "新規事業",
            company_policy: document.getElementById("new-company-policy").value || "新会社の方針を設定してください。",
            delivery_policy: document.getElementById("new-company-delivery-policy").value || "納品時のみ人間確認",
            organization_trees: [],
            role_progress: [
              { role: "President", status: "未着手", detail: "方針待ち" },
              { role: "Manager", status: "未着手", detail: "分解待ち" },
              { role: "Leader", status: "未着手", detail: "統合待ち" },
              { role: "Worker", status: "未着手", detail: "作業待ち" }
            ],
            current_task: {
              task_title: "新会社の初期設定",
              task_state: "設定中",
              task_owner_role: "President",
              selected_aiworker_id: "aiw-president-001",
              input_materials: "会社名、事業領域、組織ツリー",
              output_expectation: "運営開始可能な会社設定"
            },
            delivery: { delivery_title: "未作成", delivery_status: "未納品" },
            handoffs: []
          };
          state.data.companies.push(newCompany);
          state.companyId = newCompany.company_id;
          saveState();
          render();
        }

        if (action === "save-company-edit") {
          active.company_name = document.getElementById("set-company-name").value;
          active.business_domain = document.getElementById("set-business-domain").value;
          active.company_policy = document.getElementById("set-company-policy").value;
          active.delivery_policy = document.getElementById("set-delivery-policy").value;
          saveState();
          render();
        }

        if (action === "add-org-tree") {
          active.organization_trees.push({
            tree_id: makeId("tree"),
            tree_name: document.getElementById("new-tree-name").value || "新しい組織ツリー",
            tree_purpose: document.getElementById("new-tree-purpose").value || "目的を設定してください",
            units: []
          });
          saveState();
          render();
        }

        if (action === "add-org-unit") {
          const treeId = document.getElementById("new-unit-tree-id").value;
          const tree = findTree(active, treeId);
          if (!tree) {
            return;
          }
          const role = document.getElementById("new-unit-role").value || "Worker";
          tree.units.push({
            unit_id: makeId("unit"),
            parent_unit_id: document.getElementById("new-unit-parent-id").value || "",
            unit_name: document.getElementById("new-unit-name").value || "新しい組織要員",
            purpose: document.getElementById("new-unit-purpose").value || "目的を設定してください",
            ai_role: role,
            robot_name: document.getElementById("new-unit-robot-name").value || "新ロボット",
            aiworker_id: document.getElementById("new-unit-aiworker-id").value || "aiw-worker-001",
            deliverable: document.getElementById("new-unit-deliverable").value || "成果物を設定してください"
          });
          saveState();
          render();
        }

        if (action === "save-org-edit") {
          applyOrgFormToState(active);
          saveState();
          render();
        }

        if (action === "create-handoff") {
          const type = document.getElementById("handoff-type").value;
          const title = document.getElementById("handoff-title").value || active.current_task.task_title;
          const attachments = clone(state.pendingAttachments);
          active.handoffs.push({
            type: type,
            title: title,
            attachments: attachments,
            body: buildHandoff(active, type, attachments),
            created_at_label: "mock"
          });
          state.pendingAttachments = [];
          saveState();
          render();
        }

        if (action === "accept-delivery") {
          active.delivery.delivery_status = "受領済み mock";
          saveState();
          render();
        }

        if (action === "request-delivery-revision") {
          active.delivery.delivery_status = "納品前差し戻し mock";
          saveState();
          render();
        }
      });
    });

    document.querySelectorAll("[data-delete-unit]").forEach(function (button) {
      button.addEventListener("click", function () {
        const active = company();
        const parts = button.getAttribute("data-delete-unit").split(":");
        const treeIndex = Number(parts[0]);
        const unitIndex = Number(parts[1]);
        const tree = active.organization_trees[treeIndex];
        const deleted = tree.units[unitIndex];
        tree.units.splice(unitIndex, 1);
        tree.units.forEach(function (unit) {
          if (unit.parent_unit_id === deleted.unit_id) {
            unit.parent_unit_id = "";
          }
        });
        saveState();
        render();
      });
    });

    document.querySelectorAll("[data-delete-tree]").forEach(function (button) {
      button.addEventListener("click", function () {
        const active = company();
        const treeIndex = Number(button.getAttribute("data-delete-tree"));
        active.organization_trees.splice(treeIndex, 1);
        saveState();
        render();
      });
    });

    document.querySelectorAll("[data-delete-handoff]").forEach(function (button) {
      button.addEventListener("click", function () {
        const active = company();
        const index = Number(button.getAttribute("data-delete-handoff"));
        active.handoffs.splice(index, 1);
        saveState();
        render();
      });
    });
  }

  window.AICM_PHASE_Y_UI = { render: render };

  document.addEventListener("DOMContentLoaded", function () {
    document.body.innerHTML = "<div id=\"aicm-root\"></div>";
    render();
  });
})();

/*
Phase Y check marker:
<input id="handoff-files" type="file" multiple>
*/
