(function () {
  "use strict";

  const STORAGE_KEY = "AICM_PHASE_Y_STATE";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function baseData() {
    const source = window.AICM_PHASE_V_DATA || { aiworkers: [], companies: [] };
    const data = clone(source);
    normalize(data);
    return data;
  }

  function normalize(data) {
    data.aiworkers = data.aiworkers || [];
    data.companies = data.companies || [];

    data.companies.forEach(function (company) {
      company.rule_files = company.rule_files || [];
      company.organization_trees = company.organization_trees || [];
      company.handoffs = company.handoffs || [];

      company.organization_trees.forEach(function (tree) {
        tree.rule_files = tree.rule_files || [];
        tree.units = tree.units || [];
        tree.units.forEach(function (unit) {
          unit.rule_files = unit.rule_files || [];
          unit.robot_name = unit.robot_name || unit.unit_name || "未命名";
          unit.ai_role = unit.ai_role || "Worker";
          unit.parent_unit_id = unit.parent_unit_id || "";
        });
      });
    });
  }

  function readData() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        normalize(data);
        return data;
      }
    } catch (error) {
      return baseData();
    }
    return baseData();
  }

  function writeData(data) {
    normalize(data);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getActiveCompanyId() {
    const active = document.querySelector(".aicm-company-button.active[data-company-id]");
    if (active) {
      return active.getAttribute("data-company-id");
    }
    const data = readData();
    return data.companies[0] ? data.companies[0].company_id : "";
  }

  function getCompany(data, companyId) {
    return data.companies.find(function (company) {
      return company.company_id === companyId;
    }) || data.companies[0];
  }

  function aiworkerName(data, id) {
    const worker = data.aiworkers.find(function (item) {
      return item.aiworker_id === id;
    });
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

  function aiworkerOptions(data, selectedId) {
    return data.aiworkers.map(function (worker) {
      const selected = worker.aiworker_id === selectedId ? " selected" : "";
      return "<option value=\"" + escapeHtml(worker.aiworker_id) + "\"" + selected + ">" +
        escapeHtml(worker.display_name + " / " + worker.role_family + " / " + worker.series) +
        "</option>";
    }).join("");
  }

  function parentUnitOptions(tree, selected) {
    const rows = ["<option value=\"\">ルート</option>"];
    (tree.units || []).forEach(function (unit) {
      rows.push("<option value=\"" + escapeHtml(unit.unit_id) + "\"" + (unit.unit_id === selected ? " selected" : "") + ">" +
        escapeHtml(unit.unit_name + " / " + robotLabel(unit)) +
        "</option>");
    });
    return rows.join("");
  }

  function treeOptions(company, selectedTreeId) {
    return (company.organization_trees || []).map(function (tree) {
      const selected = tree.tree_id === selectedTreeId ? " selected" : "";
      return "<option value=\"" + escapeHtml(tree.tree_id) + "\"" + selected + ">" + escapeHtml(tree.tree_name) + "</option>";
    }).join("");
  }

  function fileMetaList(files) {
    return Array.prototype.slice.call(files || []).map(function (file) {
      return {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || "unknown",
        last_modified: file.lastModified || null
      };
    });
  }

  function renderRuleFiles(files, deleteAttrPrefix) {
    if (!files || !files.length) {
      return "<p class=\"aicm-muted\">添付ファイルはありません。</p>";
    }

    return files.map(function (file, index) {
      return "<div class=\"aicm-attachment-row\">" +
        "<strong>" + escapeHtml(file.file_name) + "</strong>" +
        "<p class=\"aicm-muted\">" + escapeHtml(file.file_size + " bytes / " + (file.file_type || "unknown")) + "</p>" +
        "<button class=\"aicm-button danger\" " + deleteAttrPrefix + "=\"" + index + "\">削除</button>" +
      "</div>";
    }).join("");
  }

  function companySelector(data, activeId) {
    return data.companies.map(function (company) {
      const active = company.company_id === activeId ? " active" : "";
      return "<button class=\"aicm-company-button" + active + "\" data-aa-company-id=\"" + escapeHtml(company.company_id) + "\">" +
        "<strong>" + escapeHtml(company.company_name) + "</strong><br>" +
        "<span class=\"aicm-muted\">" + escapeHtml(company.business_domain) + "</span>" +
        "</button>";
    }).join("");
  }

  function removeInlineOperationPanels() {
    const removeSummaries = [
      "会社追加",
      "会社変更",
      "会社削除",
      "組織ツリー追加",
      "組織要員追加",
      "組織変更",
      "組織削除"
    ];

    document.querySelectorAll("details.aicm-collapse").forEach(function (details) {
      const summary = details.querySelector("summary");
      if (!summary) {
        return;
      }
      const text = summary.textContent.trim();
      if (removeSummaries.indexOf(text) >= 0) {
        details.remove();
      }
    });
  }

  function injectDashboardOperationRoutes() {
    const dashboard = document.querySelector(".aicm-dashboard");
    if (!dashboard) {
      return;
    }

    removeInlineOperationPanels();

    const firstCard = dashboard.querySelector(".aicm-card");
    if (!firstCard || document.getElementById("aicm-operation-route-panel")) {
      return;
    }

    const panel = document.createElement("details");
    panel.className = "aicm-collapse";
    panel.id = "aicm-operation-route-panel";
    panel.open = true;
    panel.innerHTML = [
      "<summary>操作画面</summary>",
      "<p class=\"aicm-muted\">会社追加・変更・削除、組織追加・変更・削除は別画面で行います。</p>",
      "<div class=\"aicm-actions\">",
      "<button class=\"aicm-button primary\" data-aa-screen=\"company-operation\">会社操作へ</button>",
      "<button class=\"aicm-button primary\" data-aa-screen=\"organization-operation\">組織操作へ</button>",
      "</div>"
    ].join("");

    firstCard.appendChild(panel);
  }

  function renderCompanyOperation(companyId) {
    const data = readData();
    const active = getCompany(data, companyId);
    const activeId = active ? active.company_id : "";

    const root = document.getElementById("aicm-root") || document.body;

    root.innerHTML = "<main class=\"aicm-shell\">" +
      "<header class=\"aicm-header\">" +
        "<div><h1 class=\"aicm-title\">会社操作</h1>" +
        "<p class=\"aicm-subtitle\">会社追加・会社変更・会社削除・会社ごとの社内規則/ルール添付</p></div>" +
        "<span class=\"aicm-badge\">Phase AA</span>" +
      "</header>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button\" data-aa-back-dashboard=\"1\">会社ダッシュボードへ戻る</button></div>" +
      "<section class=\"aicm-dashboard\">" +
        "<div class=\"aicm-card\">" +
          "<h2>対象会社</h2>" +
          "<div class=\"aicm-company-list\">" + companySelector(data, activeId) + "</div>" +
        "</div>" +
        "<div class=\"aicm-card\">" +
          "<h2>会社追加</h2>" +
          "<div class=\"aicm-field\"><label>会社名</label><input id=\"aa-new-company-name\" value=\"新会社\"></div>" +
          "<div class=\"aicm-field\"><label>事業領域</label><input id=\"aa-new-company-domain\" value=\"新規事業\"></div>" +
          "<div class=\"aicm-field\"><label>会社方針</label><textarea id=\"aa-new-company-policy\">新会社の方針を設定してください。</textarea></div>" +
          "<div class=\"aicm-field\"><label>納品ルール</label><input id=\"aa-new-company-delivery-policy\" value=\"納品時のみ人間確認\"></div>" +
          "<button class=\"aicm-button primary\" data-aa-action=\"add-company\">会社を追加</button>" +
        "</div>" +
        "<div class=\"aicm-card\">" +
          "<h2>会社変更・削除</h2>" +
          "<div class=\"aicm-field\"><label>会社名</label><input id=\"aa-edit-company-name\" value=\"" + escapeHtml(active.company_name) + "\"></div>" +
          "<div class=\"aicm-field\"><label>事業領域</label><input id=\"aa-edit-company-domain\" value=\"" + escapeHtml(active.business_domain) + "\"></div>" +
          "<div class=\"aicm-field\"><label>会社方針</label><textarea id=\"aa-edit-company-policy\">" + escapeHtml(active.company_policy || "") + "</textarea></div>" +
          "<div class=\"aicm-field\"><label>納品ルール</label><input id=\"aa-edit-company-delivery-policy\" value=\"" + escapeHtml(active.delivery_policy || "納品時のみ人間確認") + "\"></div>" +
          "<div class=\"aicm-actions\">" +
            "<button class=\"aicm-button primary\" data-aa-action=\"save-company\">会社変更を保存</button>" +
            "<button class=\"aicm-button danger\" data-aa-action=\"delete-company\">会社を削除</button>" +
          "</div>" +
          "<p id=\"aa-company-message\" class=\"aicm-muted\"></p>" +
        "</div>" +
        "<div class=\"aicm-card\">" +
          "<h2>会社ルール添付</h2>" +
          "<p class=\"aicm-muted\">社内規則、会社ルール、運用ルールなどを会社ごとに添付します。mockではファイル情報のみ保存します。</p>" +
          "<div class=\"aicm-field\"><label>社内規則・ルールファイル</label><input id=\"aa-company-rule-files\" type=\"file\" multiple></div>" +
          "<div class=\"aicm-actions\"><button class=\"aicm-button primary\" data-aa-action=\"add-company-rule-files\">会社ルールファイルを追加</button></div>" +
          "<div>" + renderRuleFiles(active.rule_files || [], "data-aa-delete-company-rule-file") + "</div>" +
        "</div>" +
      "</section>" +
    "</main>";

    bindCompanyOperation(activeId);
  }

  function renderOrganizationOperation(companyId) {
    const data = readData();
    const active = getCompany(data, companyId);
    const activeId = active ? active.company_id : "";
    const firstTree = active.organization_trees[0] || null;
    const root = document.getElementById("aicm-root") || document.body;

    const treeRows = active.organization_trees.map(function (tree, treeIndex) {
      const unitRows = tree.units.map(function (unit, unitIndex) {
        return "<div class=\"aicm-org-row\">" +
          "<div class=\"aicm-grid-3\">" +
            "<div class=\"aicm-field\"><label>親組織</label><select data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"parent_unit_id\">" + parentUnitOptions(tree, unit.parent_unit_id) + "</select></div>" +
            "<div class=\"aicm-field\"><label>組織名</label><input data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"unit_name\" value=\"" + escapeHtml(unit.unit_name) + "\"></div>" +
            "<div class=\"aicm-field\"><label>AIロール</label><select data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"ai_role\">" + roleOptions(unit.ai_role) + "</select></div>" +
          "</div>" +
          "<div class=\"aicm-grid-3\">" +
            "<div class=\"aicm-field\"><label>ロボット名</label><input data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"robot_name\" value=\"" + escapeHtml(unit.robot_name || "") + "\"></div>" +
            "<div class=\"aicm-field\"><label>AIWorker</label><select data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"aiworker_id\">" + aiworkerOptions(data, unit.aiworker_id) + "</select></div>" +
            "<div class=\"aicm-field\"><label>成果物責任</label><input data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"deliverable\" value=\"" + escapeHtml(unit.deliverable || "") + "\"></div>" +
          "</div>" +
          "<div class=\"aicm-field\"><label>目的</label><textarea data-aa-tree=\"" + treeIndex + "\" data-aa-unit=\"" + unitIndex + "\" data-aa-field=\"purpose\">" + escapeHtml(unit.purpose || "") + "</textarea></div>" +
          "<p><span class=\"aicm-robot-label\">" + escapeHtml(robotLabel(unit)) + "</span></p>" +
          "<details class=\"aicm-collapse\"><summary>組織ルール添付</summary>" +
            "<div class=\"aicm-field\"><label>組織ルールファイル</label><input data-aa-unit-rule-files=\"" + treeIndex + ":" + unitIndex + "\" type=\"file\" multiple></div>" +
            "<button class=\"aicm-button primary\" data-aa-add-unit-rule-files=\"" + treeIndex + ":" + unitIndex + "\">組織ルールファイルを追加</button>" +
            renderRuleFiles(unit.rule_files || [], "data-aa-delete-unit-rule-file=\"" + treeIndex + ":" + unitIndex + ":") +
          "</details>" +
          "<button class=\"aicm-button danger\" data-aa-delete-unit=\"" + treeIndex + ":" + unitIndex + "\">組織要員を削除</button>" +
        "</div>";
      }).join("");

      return "<details class=\"aicm-collapse\" open>" +
        "<summary>" + escapeHtml(tree.tree_name) + "</summary>" +
        "<div class=\"aicm-tree-row\">" +
          "<div class=\"aicm-grid-2\">" +
            "<div class=\"aicm-field\"><label>ツリー名</label><input data-aa-tree=\"" + treeIndex + "\" data-aa-tree-field=\"tree_name\" value=\"" + escapeHtml(tree.tree_name) + "\"></div>" +
            "<div class=\"aicm-field\"><label>ツリー目的</label><input data-aa-tree=\"" + treeIndex + "\" data-aa-tree-field=\"tree_purpose\" value=\"" + escapeHtml(tree.tree_purpose) + "\"></div>" +
          "</div>" +
          "<details class=\"aicm-collapse\"><summary>組織ツリールール添付</summary>" +
            "<div class=\"aicm-field\"><label>組織ツリールールファイル</label><input data-aa-tree-rule-files=\"" + treeIndex + "\" type=\"file\" multiple></div>" +
            "<button class=\"aicm-button primary\" data-aa-add-tree-rule-files=\"" + treeIndex + "\">組織ツリールールファイルを追加</button>" +
            renderRuleFiles(tree.rule_files || [], "data-aa-delete-tree-rule-file=\"" + treeIndex + ":") +
          "</details>" +
          "<h3>組織要員</h3>" +
          (unitRows || "<p class=\"aicm-muted\">組織要員はまだありません。</p>") +
          "<button class=\"aicm-button danger\" data-aa-delete-tree=\"" + treeIndex + "\">組織ツリーを削除</button>" +
        "</div>" +
      "</details>";
    }).join("");

    root.innerHTML = "<main class=\"aicm-shell\">" +
      "<header class=\"aicm-header\">" +
        "<div><h1 class=\"aicm-title\">組織操作</h1>" +
        "<p class=\"aicm-subtitle\">組織追加・組織変更・組織削除・組織ごとのルール添付</p></div>" +
        "<span class=\"aicm-badge\">Phase AA</span>" +
      "</header>" +
      "<div class=\"aicm-actions\"><button class=\"aicm-button\" data-aa-back-dashboard=\"1\">会社ダッシュボードへ戻る</button></div>" +
      "<section class=\"aicm-dashboard\">" +
        "<div class=\"aicm-card\">" +
          "<h2>対象会社</h2>" +
          "<div class=\"aicm-company-list\">" + companySelector(data, activeId) + "</div>" +
        "</div>" +
        "<div class=\"aicm-card\">" +
          "<h2>組織ツリー追加</h2>" +
          "<div class=\"aicm-field\"><label>ツリー名</label><input id=\"aa-new-tree-name\" value=\"新しい組織ツリー\"></div>" +
          "<div class=\"aicm-field\"><label>ツリー目的</label><input id=\"aa-new-tree-purpose\" value=\"目的を設定してください\"></div>" +
          "<button class=\"aicm-button primary\" data-aa-action=\"add-tree\">組織ツリーを追加</button>" +
        "</div>" +
        "<div class=\"aicm-card\">" +
          "<h2>組織要員追加</h2>" +
          "<div class=\"aicm-field\"><label>追加先ツリー</label><select id=\"aa-new-unit-tree\">" + treeOptions(active, firstTree ? firstTree.tree_id : "") + "</select></div>" +
          "<div class=\"aicm-field\"><label>親組織</label><select id=\"aa-new-unit-parent\">" + parentUnitOptions(firstTree || { units: [] }, "") + "</select></div>" +
          "<div class=\"aicm-field\"><label>組織名</label><input id=\"aa-new-unit-name\" value=\"新しい組織要員\"></div>" +
          "<div class=\"aicm-field\"><label>AIロール</label><select id=\"aa-new-unit-role\">" + roleOptions("Worker") + "</select></div>" +
          "<div class=\"aicm-field\"><label>ロボット名</label><input id=\"aa-new-unit-robot-name\" value=\"新ロボット\"></div>" +
          "<div class=\"aicm-field\"><label>AIWorker</label><select id=\"aa-new-unit-aiworker\">" + aiworkerOptions(data, "aiw-worker-001") + "</select></div>" +
          "<div class=\"aicm-field\"><label>目的</label><textarea id=\"aa-new-unit-purpose\">目的を設定してください</textarea></div>" +
          "<div class=\"aicm-field\"><label>成果物責任</label><input id=\"aa-new-unit-deliverable\" value=\"成果物を設定してください\"></div>" +
          "<button class=\"aicm-button primary\" data-aa-action=\"add-unit\">組織要員を追加</button>" +
        "</div>" +
        "<div class=\"aicm-card\">" +
          "<h2>組織変更・削除・ルール添付</h2>" +
          (treeRows || "<p class=\"aicm-muted\">組織ツリーは未作成です。</p>") +
          "<button class=\"aicm-button primary\" data-aa-action=\"save-organization\">組織変更を保存</button>" +
        "</div>" +
      "</section>" +
    "</main>";

    bindOrganizationOperation(activeId);
  }

  function bindCompanyOperation(activeId) {
    document.querySelectorAll("[data-aa-company-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        renderCompanyOperation(button.getAttribute("data-aa-company-id"));
      });
    });

    document.querySelector("[data-aa-back-dashboard]")?.addEventListener("click", function () {
      window.location.reload();
    });

    document.querySelector("[data-aa-action='add-company']")?.addEventListener("click", function () {
      const data = readData();
      const company = {
        company_id: makeId("company"),
        company_name: document.getElementById("aa-new-company-name").value || "新会社",
        business_domain: document.getElementById("aa-new-company-domain").value || "新規事業",
        company_policy: document.getElementById("aa-new-company-policy").value || "",
        delivery_policy: document.getElementById("aa-new-company-delivery-policy").value || "納品時のみ人間確認",
        rule_files: [],
        organization_trees: [],
        handoffs: [],
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
          input_materials: "会社設定",
          output_expectation: "運営開始可能な会社設定"
        },
        delivery: { delivery_title: "未作成", delivery_status: "未納品" }
      };
      data.companies.push(company);
      writeData(data);
      renderCompanyOperation(company.company_id);
    });

    document.querySelector("[data-aa-action='save-company']")?.addEventListener("click", function () {
      const data = readData();
      const company = getCompany(data, activeId);
      company.company_name = document.getElementById("aa-edit-company-name").value;
      company.business_domain = document.getElementById("aa-edit-company-domain").value;
      company.company_policy = document.getElementById("aa-edit-company-policy").value;
      company.delivery_policy = document.getElementById("aa-edit-company-delivery-policy").value;
      writeData(data);
      renderCompanyOperation(company.company_id);
    });

    document.querySelector("[data-aa-action='delete-company']")?.addEventListener("click", function () {
      const data = readData();
      const message = document.getElementById("aa-company-message");
      if (data.companies.length <= 1) {
        message.textContent = "最後の1社は削除できません。";
        return;
      }
      data.companies = data.companies.filter(function (company) {
        return company.company_id !== activeId;
      });
      writeData(data);
      renderCompanyOperation(data.companies[0].company_id);
    });

    document.querySelector("[data-aa-action='add-company-rule-files']")?.addEventListener("click", function () {
      const data = readData();
      const company = getCompany(data, activeId);
      const input = document.getElementById("aa-company-rule-files");
      company.rule_files = (company.rule_files || []).concat(fileMetaList(input.files));
      writeData(data);
      renderCompanyOperation(activeId);
    });

    document.querySelectorAll("[data-aa-delete-company-rule-file]").forEach(function (button) {
      button.addEventListener("click", function () {
        const data = readData();
        const company = getCompany(data, activeId);
        const index = Number(button.getAttribute("data-aa-delete-company-rule-file"));
        company.rule_files.splice(index, 1);
        writeData(data);
        renderCompanyOperation(activeId);
      });
    });
  }

  function bindOrganizationOperation(activeId) {
    document.querySelectorAll("[data-aa-company-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        renderOrganizationOperation(button.getAttribute("data-aa-company-id"));
      });
    });

    document.querySelector("[data-aa-back-dashboard]")?.addEventListener("click", function () {
      window.location.reload();
    });

    document.querySelector("[data-aa-action='add-tree']")?.addEventListener("click", function () {
      const data = readData();
      const company = getCompany(data, activeId);
      company.organization_trees.push({
        tree_id: makeId("tree"),
        tree_name: document.getElementById("aa-new-tree-name").value || "新しい組織ツリー",
        tree_purpose: document.getElementById("aa-new-tree-purpose").value || "",
        rule_files: [],
        units: []
      });
      writeData(data);
      renderOrganizationOperation(activeId);
    });

    document.querySelector("[data-aa-action='add-unit']")?.addEventListener("click", function () {
      const data = readData();
      const company = getCompany(data, activeId);
      const treeId = document.getElementById("aa-new-unit-tree").value;
      const tree = company.organization_trees.find(function (item) { return item.tree_id === treeId; });
      if (!tree) {
        return;
      }
      tree.units.push({
        unit_id: makeId("unit"),
        parent_unit_id: document.getElementById("aa-new-unit-parent").value || "",
        unit_name: document.getElementById("aa-new-unit-name").value || "新しい組織要員",
        purpose: document.getElementById("aa-new-unit-purpose").value || "",
        ai_role: document.getElementById("aa-new-unit-role").value || "Worker",
        robot_name: document.getElementById("aa-new-unit-robot-name").value || "新ロボット",
        aiworker_id: document.getElementById("aa-new-unit-aiworker").value || "aiw-worker-001",
        deliverable: document.getElementById("aa-new-unit-deliverable").value || "",
        rule_files: []
      });
      writeData(data);
      renderOrganizationOperation(activeId);
    });

    document.querySelector("[data-aa-action='save-organization']")?.addEventListener("click", function () {
      const data = readData();
      const company = getCompany(data, activeId);

      document.querySelectorAll("[data-aa-tree-field]").forEach(function (field) {
        const treeIndex = Number(field.getAttribute("data-aa-tree"));
        const key = field.getAttribute("data-aa-tree-field");
        company.organization_trees[treeIndex][key] = field.value;
      });

      document.querySelectorAll("[data-aa-unit]").forEach(function (field) {
        const treeIndex = Number(field.getAttribute("data-aa-tree"));
        const unitIndex = Number(field.getAttribute("data-aa-unit"));
        const key = field.getAttribute("data-aa-field");
        company.organization_trees[treeIndex].units[unitIndex][key] = field.value;
      });

      writeData(data);
      renderOrganizationOperation(activeId);
    });

    document.querySelectorAll("[data-aa-delete-tree]").forEach(function (button) {
      button.addEventListener("click", function () {
        const data = readData();
        const company = getCompany(data, activeId);
        const treeIndex = Number(button.getAttribute("data-aa-delete-tree"));
        company.organization_trees.splice(treeIndex, 1);
        writeData(data);
        renderOrganizationOperation(activeId);
      });
    });

    document.querySelectorAll("[data-aa-delete-unit]").forEach(function (button) {
      button.addEventListener("click", function () {
        const data = readData();
        const company = getCompany(data, activeId);
        const parts = button.getAttribute("data-aa-delete-unit").split(":");
        const treeIndex = Number(parts[0]);
        const unitIndex = Number(parts[1]);
        const tree = company.organization_trees[treeIndex];
        const deleted = tree.units[unitIndex];
        tree.units.splice(unitIndex, 1);
        tree.units.forEach(function (unit) {
          if (unit.parent_unit_id === deleted.unit_id) {
            unit.parent_unit_id = "";
          }
        });
        writeData(data);
        renderOrganizationOperation(activeId);
      });
    });

    document.querySelectorAll("[data-aa-add-tree-rule-files]").forEach(function (button) {
      button.addEventListener("click", function () {
        const data = readData();
        const company = getCompany(data, activeId);
        const treeIndex = Number(button.getAttribute("data-aa-add-tree-rule-files"));
        const input = document.querySelector("[data-aa-tree-rule-files='" + treeIndex + "']");
        company.organization_trees[treeIndex].rule_files =
          (company.organization_trees[treeIndex].rule_files || []).concat(fileMetaList(input.files));
        writeData(data);
        renderOrganizationOperation(activeId);
      });
    });

    document.querySelectorAll("[data-aa-add-unit-rule-files]").forEach(function (button) {
      button.addEventListener("click", function () {
        const data = readData();
        const company = getCompany(data, activeId);
        const parts = button.getAttribute("data-aa-add-unit-rule-files").split(":");
        const treeIndex = Number(parts[0]);
        const unitIndex = Number(parts[1]);
        const input = document.querySelector("[data-aa-unit-rule-files='" + treeIndex + ":" + unitIndex + "']");
        company.organization_trees[treeIndex].units[unitIndex].rule_files =
          (company.organization_trees[treeIndex].units[unitIndex].rule_files || []).concat(fileMetaList(input.files));
        writeData(data);
        renderOrganizationOperation(activeId);
      });
    });
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!target) {
      return;
    }

    if (target.getAttribute("data-aa-screen") === "company-operation") {
      renderCompanyOperation(getActiveCompanyId());
    }

    if (target.getAttribute("data-aa-screen") === "organization-operation") {
      renderOrganizationOperation(getActiveCompanyId());
    }
  });

  const observer = new MutationObserver(function () {
    injectDashboardOperationRoutes();
  });

  document.addEventListener("DOMContentLoaded", function () {
    injectDashboardOperationRoutes();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.AICM_PHASE_AA_OPERATION_SCREENS = {
    renderCompanyOperation: renderCompanyOperation,
    renderOrganizationOperation: renderOrganizationOperation,
    injectDashboardOperationRoutes: injectDashboardOperationRoutes
  };
})();

/*
Phase AA route check markers:
<button class="aicm-button primary" data-aa-screen="company-operation">会社操作へ</button>
<button class="aicm-button primary" data-aa-screen="organization-operation">組織操作へ</button>
*/
