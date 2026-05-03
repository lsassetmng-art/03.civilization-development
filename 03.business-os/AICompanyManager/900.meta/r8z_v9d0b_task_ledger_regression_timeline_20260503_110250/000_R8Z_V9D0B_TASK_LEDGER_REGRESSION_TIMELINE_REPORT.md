============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳は以前は正常表示できていた
- その後スクショで isPendingMajor is not defined が出た
- いつ壊れたか不明
- ただしスクショ上のscript queryは r8u_manager_major_summary_20260502_204621 に見える
- つまり「最新coreが壊れている」のか「古いタブ/古いassetを見ている」のか未確定

今回の作業:
1. current core/server syntax確認
2. root HTMLとscript src確認
3. served coreとdisk coreの一致確認
4. current coreで isPendingMajor 参照/定義を確認
5. 900.meta内のbackup群から isPendingMajor の初出候補を探す
6. 直近V8/V9 reportを時系列で確認
7. 次を分岐:
   - current coreに参照だけある → 呼び出し混入元を戻す
   - current coreに無い → ブラウザが古いcore/別scriptを見ている
   - backupの一部から混入 → その直前backupを復旧候補にする

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core / root HTML
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
---- script src list ----
./assets/js/aicm-production-core.js?v=r8u_manager_major_summary_20260502_204621
DISK_SHA=85ddc0a14c3cf1f78a367c2a848558fe950d9ffd37cddd4c1d3cdc15856d91f7
SERVED_SHA=85ddc0a14c3cf1f78a367c2a848558fe950d9ffd37cddd4c1d3cdc15856d91f7
PASS: served core matches disk

============================================================
4. current core isPendingMajor scan
============================================================
---- current refs ----
4408:    function isPendingMajor(row) {
4449:      return isPendingMajor(row);
4959:      return isPendingMajor(row);

---- current nearby ----
4378-      }
4379-    }
4380-
4381-    function asArray(value) {
4382-      return Array.isArray(value) ? value : [];
4383-    }
4384-
4385-    function rowCompanyId(row) {
4386-      return String(
4387-        row && (
4388-          row.aicm_user_company_id ||
4389-          row.company_id ||
4390-          row.user_company_id ||
4391-          row.companyId ||
4392-          ""
4393-        ) || ""
4394-      );
4395-    }
4396-
4397-    function statusText(row, keys) {
4398-      for (var i = 0; i < keys.length; i += 1) {
4399-        var key = keys[i];
4400-        if (row && row[key] != null && String(row[key]) !== "") {
4401-          return String(row[key]).toLowerCase();
4402-        }
4403-      }
4404-
4405-      return "";
4406-    }
4407-
4408:    function isPendingMajor(row) {
4409-      var handoff = statusText(row, ["handoff_status_code", "handoff_status", "leader_handoff_status_code"]);
4410-      var decomposition = statusText(row, ["decomposition_status_code", "work_status_code", "status_code"]);
4411-
4412-      var closed = {
4413-        sent: true,
4414-        handed_off: true,
4415-        leader_handoff_done: true,
4416-        submitted: true,
4417-        delivered: true,
4418-        done: true,
4419-        completed: true,
4420-        complete: true,
4421-        cancelled: true,
4422-        canceled: true,
4423-        archived: true
4424-      };
4425-
4426-      if (closed[handoff]) return false;
4427-      if (closed[decomposition]) return false;
4428-
4429-      return true;
4430-    }
4431-
4432-    function rowOrder(row) {
4433-      var n = Number(row && (row.display_order || row.sort_order || row.row_order || 0));
4434-      return Number.isFinite(n) ? n : 0;
4435-    }
4436-
4437-    var rows = []
4438-      .concat(asArray(ctx.pmlw_major_items))
4439-      .concat(asArray(ctx.manager_major_items))
4440-      .concat(asArray(ctx.major_items));
4441-
4442-    rows = rows.filter(function (row) {
4443-      if (!row) return false;
4444-
4445-      var cid = rowCompanyId(row);
4446-
4447-      if (selectedId && cid && cid !== selectedId) return false;
4448-
4449:      return isPendingMajor(row);
4450-    });
4451-
4452-    rows.sort(function (a, b) {
4453-      var ao = rowOrder(a);
4454-      var bo = rowOrder(b);
4455-
4456-      if (ao !== bo) return ao - bo;
4457-
4458-      var an = String((a && (a.major_item_name || a.title || a.task_name || a.deliverable_name)) || "");
4459-      var bn = String((b && (b.major_item_name || b.title || b.task_name || b.deliverable_name)) || "");
4460-
4461-      return an.localeCompare(bn, "ja");
4462-    });
4463-
4464-    return rows;
4465-  }
4466-
4467-
4468-
4469-
4470-
4471-// AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER_START
4472-  function aicmIsPendingManagerMajorRowR8V6(row) {
4473-    if (!row || typeof row !== "object") return false;
4474-
4475-    var handoff = String(row.handoff_status_code || "").toLowerCase();
4476-    var decomposition = String(row.decomposition_status_code || "").toLowerCase();
4477-    var deleted = String(row.deleted_flag || row.is_deleted || "").toLowerCase();
4478-    var archived = String(row.archived_flag || row.is_archived || "").toLowerCase();
4479-
--
4926-        body: JSON.stringify({
4927-          aicm_manager_major_work_item_id: payload.majorId
4928-        })
4929-      });
4930-
4931-      var json = null;
4932-      try {
4933-        json = await response.json();
4934-      } catch (_) {
4935-        json = null;
4936-      }
4937-
4938-      if (!response.ok || (json && json.result && json.result !== "ok")) {
4939-        throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "大項目の削除に失敗しました。");
4940-      }
4941-
4942-      state.managerMajorDeleteConfirm = null;
4943-      setMessage("ok", "大項目を削除済みにしました。");
4944-      await aicmReloadTaskLedgerContext();
4945-      state.screen = "task-ledger";
4946-      render();
4947-    } catch (error) {
4948-      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");
4949-      render();
4950-    }
4951-  }
4952-// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_END
4953-
4954-
4955-  
4956:function aicmRenderManagerMajorRows(rows) {
4957-    var sourceRows = Array.isArray(rows) ? rows : [];
4958-    var pendingRows = sourceRows.filter(function (row) {
4959:      return isPendingMajor(row);
4960-    });
4961-
4962-    var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();
4963-
4964-    if (!pendingRows.length) {
4965-      return [
4966-        confirmCard,
4967-        '<div class="aicm-core-empty">',
4968-        '  <strong>登録済み大項目はまだありません</strong>',
4969-        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
4970-        '</div>'
4971-      ].join("");
4972-    }
4973-
4974-    var pageSize = aicmMajorItemPageSizeR8O();
4975-    var totalRows = pendingRows.length;
4976-    var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
4977-    var page = aicmMajorItemCurrentPageR8O(totalRows);
4978-    var start = (page - 1) * pageSize;
4979-    var pageRows = pendingRows.slice(start, start + pageSize);
4980-
4981-    var pager = [
4982-      '<div class="aicm-dashboard-action-row">',
4983-      '  <button type="button" data-core-action="pmlw-major-page-prev"' + (page <= 1 ? ' disabled' : '') + '>前ページ</button>',
4984-      '  <span class="aicm-selected-note">ページ ' + escapeHtml(String(page)) + ' / ' + escapeHtml(String(totalPages)) + '　表示 ' + escapeHtml(String(start + 1)) + '-' + escapeHtml(String(start + pageRows.length)) + ' / ' + escapeHtml(String(totalRows)) + '件</span>',
4985-      '  <button type="button" data-core-action="pmlw-major-page-next"' + (page >= totalPages ? ' disabled' : '') + '>次ページ</button>',
4986-      '</div>'
4987-    ].join("");
4988-
4989-    var cards = pageRows.map(function (row, index) {
--
4999-        '  <dl class="aicm-core-detail-list">',
5000-        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
5001-        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
5002-        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
5003-        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
5004-        '  </dl>',
5005-        '  <div class="aicm-dashboard-action-row">',
5006-        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
5007-        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
5008-        '  </div>',
5009-        '</article>'
5010-      ].join("");
5011-    }).join("");
5012-
5013-    return [
5014-      confirmCard,
5015-      pager,
5016-      '<div class="aicm-manager-major-list">',
5017-      cards,
5018-      '</div>',
5019-      pager
5020-    ].join("");
5021-  }
5022-
5023-    function aicmRenderTaskLedgerSafeR8V4(sourceLabel) {
5024-    state.screen = "task-ledger";
5025-
5026-    try {
5027-      if (!root) return;
5028-
5029:      var html = renderTaskLedgerPlaceholder();
5030-      root.innerHTML = html;
5031-
5032-      return true;
5033-    } catch (error) {
5034-      var message = error && error.message ? error.message : String(error || "unknown error");
5035-      var stack = error && error.stack ? String(error.stack) : "";
5036-
5037-      if (typeof console !== "undefined" && console && console.error) {
5038-        console.error("AICM task-ledger render failed", {
5039-          sourceLabel: sourceLabel || "",
5040-          message: message,
5041-          stack: stack
5042-        });
5043-      }
5044-
5045-      if (root) {
5046-        root.innerHTML = renderShell([
5047-          '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
5048-          '  <p class="aicm-eyebrow">TASK LEDGER RENDER ERROR</p>',
5049-          '  <h2>部門別タスク台帳の描画でエラーが発生しました</h2>',
5050-          '  <p class="aicm-selected-note">クリック処理と画面遷移は動いています。以下はブラウザ側の描画エラーです。</p>',
5051-          '  <dl class="aicm-core-detail-list">',
5052-          '    <dt>source</dt><dd>' + escapeHtml(sourceLabel || "") + '</dd>',
5053-          '    <dt>message</dt><dd>' + escapeHtml(message) + '</dd>',
5054-          '  </dl>',
5055-          stack ? '<pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(stack) + '</pre>' : '',
5056-          '  <div class="aicm-dashboard-action-row">',
5057-          '    <button type="button" data-core-action="task-ledger-refresh">再読み込み</button>',
5058-          '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
5059-          '  </div>',
--
5922-
5923-    var json = null;
5924-    try {
5925-      json = await response.json();
5926-    } catch (_) {
5927-      json = null;
5928-    }
5929-
5930-    if (!response.ok || (json && json.result && json.result !== "ok")) {
5931-      throw new Error(json && (json.error_message || json.message || json.error) ? (json.error_message || json.message || json.error) : "Worker自動実行に失敗しました。");
5932-    }
5933-
5934-    return json || {};
5935-  }
5936-
5937-  function aicmWorkerAutoExecutionMessageR8ZI(result) {
5938-    var executed = result && typeof result.executed_count !== "undefined" ? Number(result.executed_count || 0) : 0;
5939-    var failed = result && typeof result.failed_count !== "undefined" ? Number(result.failed_count || 0) : 0;
5940-
5941-    if (failed > 0) {
5942-      return "Leader自動分解後、Worker自動実行で一部エラーがありました。成功 " + String(executed) + "件 / 失敗 " + String(failed) + "件。";
5943-    }
5944-
5945-    return "Leader自動分解後、Worker自動実行requestを " + String(executed) + "件作成しました。";
5946-  }
5947-// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_END
5948-
5949-// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_END
5950-
5951-
5952:function renderTaskLedgerPlaceholder() {
5953-    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: screen
5954-    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
5955-    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
5956-    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);
5957-    
5958-
5959-    // AICM_R8V_REMOVE_LEADER_INBOX_UI_START
5960-  // Leader受信箱 routine section removed.
5961-  // Manager大項目サマリの Leader受信済み 件数/詳細を正面表示として使う。
5962-// AICM_R8V_REMOVE_LEADER_INBOX_UI_END
5963-return renderShell([
5964-      '<section class="aicm-core-card">',
5965-      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
5966-      '  <h2>部門別タスク台帳</h2>',
5967-      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
5968-      '  <p class="aicm-selected-note">未実行のManager大項目だけをDB/contextから表示します。CSV取り込みは部長/Manager分解済み大項目の新規追加です。</p>',
5969-'  <div class="aicm-dashboard-action-row">',
5970-      '    <button type="button" data-core-action="task-ledger-refresh">登録済み大項目をリロード</button>',
5971-      '  </div>',
5972-      '</section>',
5973-      aicmRenderManagerMajorSummarySectionR8U(),
5974-      aicmRenderLeaderAutoFlowStatusR8W(),
5975-      renderCsvImportCard(company),
5976-      '<section class="aicm-core-card">',
5977-      '  <p class="aicm-eyebrow">Manager大項目</p>',
5978-      '  <h2>登録済み大項目</h2>',
5979:      aicmRenderManagerMajorRows(rows),
5980-      '</section>'
5981-    ].join(""));
5982-  }
5983-// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_START
5984-  function aicmR8ZCText(value) {
5985-    if (value === null || typeof value === "undefined") return "";
5986-    return String(value).trim();
5987-  }
5988-
5989-  function aicmR8ZCHtml(value) {
5990-    if (typeof escapeHtml === "function") return escapeHtml(aicmR8ZCText(value));
5991-    return aicmR8ZCText(value)
5992-      .replace(/&/g, "&amp;")
5993-      .replace(/</g, "&lt;")
5994-      .replace(/>/g, "&gt;")
5995-      .replace(/"/g, "&quot;")
5996-      .replace(/'/g, "&#39;");
5997-  }
5998-
5999-  function aicmR8ZCContextArray(names) {
6000-    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
6001-
6002-    for (var i = 0; i < names.length; i += 1) {
6003-      var key = names[i];
6004-
6005-      if (Array.isArray(ctx[key])) return ctx[key];
6006-      if (Array.isArray(state && state[key])) return state[key];
6007-    }
6008-
6009-    return [];
--
6163-
6164-  function aicmInjectPmlwAutoOutputsPanelR8ZC(html) {
6165-    var panel = aicmRenderPmlwAutoOutputsPanelR8ZC();
6166-    var source = String(html || "");
6167-
6168-    // AICM_R8Z_C2_OUTPUT_PANEL_POSITION_V1
6169-    // Prefer showing this directly after Manager大項目サマリ and before CSV/import/list sections.
6170-    var anchors = [
6171-      '<section class="aicm-core-card aicm-csv-panel">',
6172-      '<section class="aicm-core-card"><p class="aicm-eyebrow">Manager大項目</p>',
6173-      '<section class="aicm-core-card">\n  <p class="aicm-eyebrow">Manager大項目</p>',
6174-      '<p class="aicm-eyebrow">CSV取り込み</p>'
6175-    ];
6176-
6177-    for (var i = 0; i < anchors.length; i += 1) {
6178-      var anchor = anchors[i];
6179-      var index = source.indexOf(anchor);
6180-
6181-      if (index >= 0) {
6182-        return source.slice(0, index) + panel + source.slice(index);
6183-      }
6184-    }
6185-
6186-    if (source.indexOf('</main>') >= 0) {
6187-      return source.replace('</main>', panel + '</main>');
6188-    }
6189-
6190-    return source + panel;
6191-  }
6192-
6193:  var aicmRenderTaskLedgerPlaceholderBeforeR8ZC = renderTaskLedgerPlaceholder;
6194-
6195:  renderTaskLedgerPlaceholder = function renderTaskLedgerPlaceholder() {
6196-    return aicmInjectPmlwAutoOutputsPanelR8ZC(
6197-      aicmRenderTaskLedgerPlaceholderBeforeR8ZC()
6198-    );
6199-  };
6200-// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END
6201-
6202-
6203-// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_START
6204-  function aicmR8ZNText(value) {
6205-    if (value === null || typeof value === "undefined") return "";
6206-    return String(value).trim();
6207-  }
6208-
6209-  function aicmR8ZNHtml(value) {
6210-    var text = aicmR8ZNText(value);
6211-    if (typeof escapeHtml === "function") return escapeHtml(text);
6212-    return text
6213-      .replace(/&/g, "&amp;")
6214-      .replace(/</g, "&lt;")
6215-      .replace(/>/g, "&gt;")
6216-      .replace(/"/g, "&quot;")
6217-      .replace(/'/g, "&#039;");
6218-  }
6219-
6220-  function aicmR8ZNMetadata(row) {
6221-    var meta = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
6222-    if (typeof meta === "string") {
6223-      try {
6224-        meta = JSON.parse(meta);
6225-      } catch (_) {
--
6413-      '</section>'
6414-    ].join("");
6415-  }
6416-
6417-  (function aicmInstallR8ZNWorkerRuntimeStatusPanel() {
6418-    try {
6419-      if (typeof aicmRenderR8ZCOutputVisibilityPanel === "function" && !aicmRenderR8ZCOutputVisibilityPanel.__r8znWrapped) {
6420-        var originalR8ZCOutputPanel = aicmRenderR8ZCOutputVisibilityPanel;
6421-        var wrappedR8ZCOutputPanel = function () {
6422-          var baseHtml = "";
6423-          try {
6424-            baseHtml = originalR8ZCOutputPanel.apply(this, arguments) || "";
6425-          } catch (error) {
6426-            baseHtml = [
6427-              '<section class="aicm-core-card">',
6428-              '  <p class="aicm-eyebrow">Leader以降の出力</p>',
6429-              '  <p class="aicm-core-message aicm-core-message-error">Leader以降の出力パネル描画に失敗しました。</p>',
6430-              '</section>'
6431-            ].join("");
6432-          }
6433-
6434-          return String(baseHtml || "") + aicmRenderR8ZNWorkerRuntimeStatusPanel();
6435-        };
6436-
6437-        wrappedR8ZCOutputPanel.__r8znWrapped = true;
6438-        wrappedR8ZCOutputPanel.__r8znOriginal = originalR8ZCOutputPanel;
6439-        aicmRenderR8ZCOutputVisibilityPanel = wrappedR8ZCOutputPanel;
6440-        return;
6441-      }
6442-
6443:      if (typeof renderTaskLedgerPlaceholder === "function" && !renderTaskLedgerPlaceholder.__r8znWrapped) {
6444:        var originalTaskLedgerPlaceholder = renderTaskLedgerPlaceholder;
6445:        var wrappedTaskLedgerPlaceholder = function () {
6446-          var base = originalTaskLedgerPlaceholder.apply(this, arguments);
6447-          return String(base || "") + aicmRenderR8ZNWorkerRuntimeStatusPanel();
6448-        };
6449-
6450:        wrappedTaskLedgerPlaceholder.__r8znWrapped = true;
6451:        wrappedTaskLedgerPlaceholder.__r8znOriginal = originalTaskLedgerPlaceholder;
6452:        renderTaskLedgerPlaceholder = wrappedTaskLedgerPlaceholder;
6453-      }
6454-    } catch (error) {
6455-      if (typeof console !== "undefined" && console.warn) {
6456-        console.warn("AICM R8Z-N worker runtime status panel install skipped", error);
6457-      }
6458-    }
6459-  })();
6460-// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_END
6461-
6462-
6463-
6464-  
6465-// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1
6466-// Human review queue UI.
6467-// Human review only shows delivery summaries / exception summaries.
6468-// AI review remains internal; the UI displays ai_review_result_text summary only.
6469-
6470-function aicmHumanReviewOwnerId() {
6471-    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
6472-    if (state && state.owner_civilization_id) return state.owner_civilization_id;
6473-    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
6474-    return "00000000-0000-4000-8000-000000000001";
6475-  }
6476-
6477-  function aicmHumanReviewRows() {
6478-    var ctx = state.context || state || {};
6479-    var rows = ctx.review_wait_items || state.review_wait_items || [];
6480-    return Array.isArray(rows) ? rows : [];
6481-  }
6482-
--
7575-    ].join("");
7576-  }
7577-
7578-function render() {
7579-    if (!root) return;
7580-
7581-    var html = "";
7582-
7583-    if (state.screen === "company-new") {
7584-      html = renderCompanyNew();
7585-    } else if (state.screen === "department-new") {
7586-      html = renderDepartmentNew();
7587-    } else if (state.screen === "section-new") {
7588-      html = renderSectionNew();
7589-    } else if (state.screen === "placement-new") {
7590-      html = renderPlacementNew();
7591-    } else if (state.screen === "worker-runtime-confirm") {
7592-      // AICM_WORKBENCH_CONFIRM_STATE_AXT_R3_V1
7593-      html = renderWorkerRuntimeConfirm();
7594-    } else if (state.screen === "worker-runtime-request") {
7595-      html = renderWorkerRuntimeRequest();
7596-    } else if (state.screen === "settings") {
7597-      html = renderSettings();
7598-    } else if (state.screen === "department-edit") {
7599-      html = renderDepartmentEditPlaceholder();
7600-    } else if (state.screen === "section-edit") {
7601-      html = renderSectionEditPlaceholder();
7602-    } else if (state.screen === "ai-business-start") {
7603-      html = renderAicmBusinessStartScreen();
7604-    } else if (state.screen === "task-ledger") {
7605:      html = renderTaskLedgerPlaceholder();
7606-    } else if (state.screen === "review-list") {
7607-      html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL
7608-    } else {
7609-      html = renderDashboard();
7610-    }
7611-
7612-    
7613-    // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
7614-    if (
7615-      state &&
7616-      (
7617-        state.screen === "company-edit" ||
7618-        state.screen === "company-change" ||
7619-        state.screen === "company-update"
7620-      )
7621-    ) {
7622-      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
7623-      html = renderCompanyEditPlaceholder();
7624-    }
7625-
7626-
7627-    // AICM_EDIT_SCREEN_RENDER_OVERRIDE_ATE_ATH
7628-    if (state && state.screen === "company-edit") {
7629-      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
7630-      html = renderCompanyEditPlaceholder();
7631-    }
7632-
7633-    if (state && state.screen === "department-edit") {
7634-      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
7635-      html = renderDepartmentEditPlaceholder();
CURRENT_REF_COUNT=3
CURRENT_DEF_COUNT=1

============================================================
5. current served core isPendingMajor scan
============================================================
4408:    function isPendingMajor(row) {
4449:      return isPendingMajor(row);
4959:      return isPendingMajor(row);
SERVED_REF_COUNT=3
SERVED_DEF_COUNT=1

============================================================
6. backup timeline scan
============================================================
BACKUP_FILE_COUNT=143
---- newest backup candidates ----
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/aicm-production-core.before_axo_preserve_unsaved.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_dashboard_menu_correction_20260430_131944/aicm-production-core.before_aog_aoj.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/production_dashboard_overview_action_correction_20260430_132906/aicm-production-core.before_aok_aon.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/aicm-production-core.before_nav_cause_fix.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v2_fix_global_button_navigation_20260502_175006/aicm-production-core.before_r8_nav_v2.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v3_clean_task_ledger_open_20260502_180150/aicm-production-core.before_r8_nav_v3_clean.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v4_safe_task_ledger_render_20260502_180737/aicm-production-core.before_r8_nav_v4_safe_render.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/aicm-production-core.before_restore_isPendingMajor.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5_verify_restore_and_cache_bust_20260502_181812/aicm-production-core.before_verify_v5.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/aicm-production-core.before_v5b.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6_clean_pending_major_helper_20260502_182558/aicm-production-core.before_r8_v6_clean.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/aicm-production-core.before_r8_v6c.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7_clean2_delete_action_helper_20260502_184204/aicm-production-core.before_r8_v7_clean2.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d2_delete_confirm_visible_20260502_184726/aicm-production-core.before_r8_v7d2.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d_delete_confirm_visible_20260502_184510/aicm-production-core.before_r8_v7d.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8b_delete_owner_payload_20260502_192606/aicm-production-core.before_r8_v8b.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8c_delete_owner_payload_20260502_192943/aicm-production-core.before_r8_v8c.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_line_anchor_patch_20260502_112651/aicm-production-core.before_r8o_r8p_r8q_line_anchor.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_20260502_104139/aicm-production-core.before_r8o_r8p_r8q.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_anchor_patch_20260502_105057/aicm-production-core.before_r8o_r8p_r8q_anchor.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_anchor_patch_20260503_071242/aicm-production-core.before_r8o_r8p_r8q_anchor.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/aicm-production-core.before_r8s.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8t_leader_inbox_display_20260502_203259/aicm-production-core.before_r8t.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/aicm-production-core.before_r8u.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/aicm-production-core.before_r8v.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/aicm-production-core.before_r8w.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_a_leader_auto_decomposition_route_rollback_20260502_212324/aicm-production-core.before_r8z_a.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_a_retry_quote_safe_route_rollback_20260502_212603/aicm-production-core.before_r8z_a_retry.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_b_core_auto_call_integration_20260502_212835/aicm-production-core.before_r8z_b.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c2_move_output_panel_below_summary_20260502_214258/aicm-production-core.before_r8z_c2.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_output_visibility_panel_20260502_213342/aicm-production-core.before_r8z_c.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_retry_output_visibility_panel_20260502_213508/aicm-production-core.before_r8z_c_retry.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_e_hydrate_child_outputs_20260502_220456/aicm-production-core.before_r8z_e.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_canonical_context_normalize_20260502_220929/aicm-production-core.before_r8z_f.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_retry_canonical_context_normalize_20260502_221108/aicm-production-core.before_r8z_f_retry.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/aicm-production-core.before_r8z_i.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/aicm-production-core.before_r8z_n.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_o_production_summary_ui_20260502_231710/aicm-production-core.before_r8z_o.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4_review_list_render_route_fix_20260503_060534/aicm-production-core.before_r8z_v4.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4b_review_list_stable_renderer_20260503_060751/aicm-production-core.before_r8z_v4b.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5b_stable_context_hydration_20260503_062219/aicm-production-core.before_r8z_v5b.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5c_review_list_append_override_20260503_062512/aicm-production-core.before_r8z_v5c.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5d_review_list_append_override_20260503_063542/aicm-production-core.before_r8z_v5d.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v7_review_list_route_bridge_20260503_070352/aicm-production-core.before_r8z_v7.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/030_served_aicm-production-core.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/aicm-production-core.before_r8z_v8g.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8h_v7_merge_finalizer_rerender_fix_20260503_103314/aicm-production-core.before_r8z_v8h.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/aicm-production-core.before_r8z_v8k.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8l_v7_fetch_timeout_xhr_fallback_20260503_104355/aicm-production-core.before_r8z_v8l.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-production-core.before_r8z_v9.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/aicm-production-core.before_r8z_v9c.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/recommended_only_robot_combos_20260430_213730/aicm-production-core.before_auk_aun.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/recover_explicit_edit_db_connect_20260430_221802/aicm-production-core.before_ava_avd_redo.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/recover_explicit_edit_db_connect_20260430_221802/aicm-production-core.broken_before_ava_avd_redo.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_isolated_async_after_explicit_edit_20260430_222331/aicm-production-core.before_ave_avh.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_isolated_async_shell_only_20260430_222557/aicm-production-core.before_avi_avl.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_last_clean_core_forbidden_marker_20260430_111700/aicm-production-core.before_anm_anp.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_r8l_display_diagnostic_20260502_075948/aicm-production-core.before_remove_r8l.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_r8l_snapshot_diagnostic_20260502_090410/aicm-production-core.before_remove_r8l_snapshot.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_recommended_literal_20260430_214013/aicm-production-core.before_auo_aur.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_role_setting_open_comment_literal_20260430_212151/aicm-production-core.before_aug_auj.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_stale_role_setting_open_20260430_211923/aicm-production-core.before_auc_auf.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/repair_remove_r8l_display_diagnostic_20260502_080221/aicm-production-core.broken_before_repair.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/restore_company_overview_scope_20260430_194951/aicm-production-core.before_ask_asn.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_catalog_multi_worker_inline_20260430_210015/aicm-production-core.before_atu_atx.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_filter_recommended_roles_20260501_070240/aicm-production-core.before_axp_robot_filter.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_availability_label_20260501_070936/aicm-production-core.before_axq_availability_label.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/robot_option_unlimited_force_20260501_071225/aicm-production-core.before_axq_r1_unlimited_force.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/role_placement_readback_fix_20260501_065031/aicm-production-core.before_axn_readback_fix.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/runtime_status_panel_filter_20260501_104437/aicm-production-core.before_axt_r9_r2_filter.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/scoped_org_toolbar_edit_button_removal_fix_20260430_134104/aicm-production-core.before_aos_aov.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/task_ledger_chatgpt_prompt_first_csv_ui_20260430_143659/aicm-production-core.before_apm_app.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/task_ledger_csv_scoped_cleanup_20260430_164423/aicm-production-core.before_aqx_ara.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/task_ledger_csv_wording_restore_20260430_163818/aicm-production-core.before_aqt_aqw.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_async_async_fix_20260501_062138/aicm-production-core.before_axi_async_async_fix.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/workbench_runtime_code_normalize_20260501_103132/aicm-production-core.before_axt_r7_normalize.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_20260501_103822/aicm-production-core.before_axt_r9_payload_display.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_payload_display_retry_20260501_104003/aicm-production-core.before_axt_r9_r1_payload_display.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_nav_repair_20260501_073315/aicm-production-core.before_axt_r1_nav_repair.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/worker_runtime_ui_screen_20260501_073008/aicm-production-core.before_axt_worker_runtime_ui.js
HIT_FILE_COUNT=57

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5_remove_old_duplicate_render_20260502_071343/aicm-production-core.before_maint_r5.js
MTIME=2026-05-01T22:13:44.347Z
REF_COUNT=2
DEF_COUNT=1
  4356:function isPendingMajor(row) {
  4397:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5c_exact_old_render_cleanup_20260502_072350/aicm-production-core.before_maint_r5c.js
MTIME=2026-05-01T22:23:51.554Z
REF_COUNT=2
DEF_COUNT=1
  4356:function isPendingMajor(row) {
  4397:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r5d_old_render_neighbor_cleanup_20260502_072734/aicm-production-core.before_maint_r5d.js
MTIME=2026-05-01T22:27:35.666Z
REF_COUNT=2
DEF_COUNT=1
  4356:function isPendingMajor(row) {
  4397:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8l_browser_state_rows_log_20260502_074430/aicm-production-core.before_maint_r8l.js
MTIME=2026-05-01T22:44:31.550Z
REF_COUNT=2
DEF_COUNT=1
  4264:function isPendingMajor(row) {
  4305:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/axu_csv_maint_r8m_context_hydration_20260502_074809/aicm-production-core.before_maint_r8m.js
MTIME=2026-05-01T22:48:10.426Z
REF_COUNT=2
DEF_COUNT=1
  4264:function isPendingMajor(row) {
  4305:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/clean_remove_r8l_debug_iife_20260502_102842/aicm-production-core.before_clean_remove_r8l_iife.js
MTIME=2026-05-01T22:48:10.694Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_r8l_display_diagnostic_20260502_075948/aicm-production-core.before_remove_r8l.js
MTIME=2026-05-01T22:48:10.694Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/remove_r8l_snapshot_diagnostic_20260502_090410/aicm-production-core.before_remove_r8l_snapshot.js
MTIME=2026-05-01T22:48:10.694Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/repair_remove_r8l_display_diagnostic_20260502_080221/aicm-production-core.broken_before_repair.js
MTIME=2026-05-01T22:48:10.694Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_line_anchor_patch_20260502_112651/aicm-production-core.before_r8o_r8p_r8q_line_anchor.js
MTIME=2026-05-02T01:28:43.471Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_20260502_104139/aicm-production-core.before_r8o_r8p_r8q.js
MTIME=2026-05-02T01:28:43.471Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_anchor_patch_20260502_105057/aicm-production-core.before_r8o_r8p_r8q_anchor.js
MTIME=2026-05-02T01:28:43.471Z
REF_COUNT=2
DEF_COUNT=1
  4291:function isPendingMajor(row) {
  4332:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_cause_fix_task_ledger_20260502_171821/aicm-production-core.before_nav_cause_fix.js
MTIME=2026-05-02T02:26:52.831Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v2_fix_global_button_navigation_20260502_175006/aicm-production-core.before_r8_nav_v2.js
MTIME=2026-05-02T08:18:22.010Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v3_clean_task_ledger_open_20260502_180150/aicm-production-core.before_r8_nav_v3_clean.js
MTIME=2026-05-02T08:50:07.486Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v4_safe_task_ledger_render_20260502_180737/aicm-production-core.before_r8_nav_v4_safe_render.js
MTIME=2026-05-02T09:01:51.050Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_nav_v5_restore_is_pending_major_20260502_181057/aicm-production-core.before_restore_isPendingMajor.js
MTIME=2026-05-02T09:07:38.234Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5_verify_restore_and_cache_bust_20260502_181812/aicm-production-core.before_verify_v5.js
MTIME=2026-05-02T09:10:58.898Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v5b_restore_is_pending_major_cache_bust_20260502_182005/aicm-production-core.before_v5b.js
MTIME=2026-05-02T09:10:58.898Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6_clean_pending_major_helper_20260502_182558/aicm-production-core.before_r8_v6_clean.js
MTIME=2026-05-02T09:20:06.726Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v6c_clean_pending_major_helper_20260502_182749/aicm-production-core.before_r8_v6c.js
MTIME=2026-05-02T09:20:06.726Z
REF_COUNT=3
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);
  4518:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7_clean2_delete_action_helper_20260502_184204/aicm-production-core.before_r8_v7_clean2.js
MTIME=2026-05-02T09:27:50.494Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d2_delete_confirm_visible_20260502_184726/aicm-production-core.before_r8_v7d2.js
MTIME=2026-05-02T09:42:05.790Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v7d_delete_confirm_visible_20260502_184510/aicm-production-core.before_r8_v7d.js
MTIME=2026-05-02T09:42:05.790Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8b_delete_owner_payload_20260502_192606/aicm-production-core.before_r8_v8b.js
MTIME=2026-05-02T09:47:26.946Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8_v8c_delete_owner_payload_20260502_192943/aicm-production-core.before_r8_v8c.js
MTIME=2026-05-02T09:47:26.946Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8s_leader_handoff_confirm_flow_20260502_201858/aicm-production-core.before_r8s.js
MTIME=2026-05-02T10:29:44.053Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8t_leader_inbox_display_20260502_203259/aicm-production-core.before_r8t.js
MTIME=2026-05-02T11:18:59.358Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8u_manager_major_summary_20260502_204621/aicm-production-core.before_r8u.js
MTIME=2026-05-02T11:33:01.710Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8v_remove_leader_inbox_ui_20260502_205909/aicm-production-core.before_r8v.js
MTIME=2026-05-02T11:46:22.906Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8w_leader_auto_flow_display_20260502_210659/aicm-production-core.before_r8w.js
MTIME=2026-05-02T11:59:10.482Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_a_leader_auto_decomposition_route_rollback_20260502_212324/aicm-production-core.before_r8z_a.js
MTIME=2026-05-02T12:07:00.650Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_a_retry_quote_safe_route_rollback_20260502_212603/aicm-production-core.before_r8z_a_retry.js
MTIME=2026-05-02T12:07:00.650Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_b_core_auto_call_integration_20260502_212835/aicm-production-core.before_r8z_b.js
MTIME=2026-05-02T12:07:00.650Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_output_visibility_panel_20260502_213342/aicm-production-core.before_r8z_c.js
MTIME=2026-05-02T12:28:36.614Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c_retry_output_visibility_panel_20260502_213508/aicm-production-core.before_r8z_c_retry.js
MTIME=2026-05-02T12:28:36.614Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c2_move_output_panel_below_summary_20260502_214258/aicm-production-core.before_r8z_c2.js
MTIME=2026-05-02T12:35:09.542Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_e_hydrate_child_outputs_20260502_220456/aicm-production-core.before_r8z_e.js
MTIME=2026-05-02T12:42:59.818Z
REF_COUNT=2
DEF_COUNT=1
  4289:function isPendingMajor(row) {
  4330:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_canonical_context_normalize_20260502_220929/aicm-production-core.before_r8z_f.js
MTIME=2026-05-02T13:04:57.622Z
REF_COUNT=2
DEF_COUNT=1
  4293:function isPendingMajor(row) {
  4334:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_f_retry_canonical_context_normalize_20260502_221108/aicm-production-core.before_r8z_f_retry.js
MTIME=2026-05-02T13:04:57.622Z
REF_COUNT=2
DEF_COUNT=1
  4293:function isPendingMajor(row) {
  4334:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/aicm-production-core.before_r8z_i.js
MTIME=2026-05-02T13:11:09.278Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/aicm-production-core.before_r8z_n.js
MTIME=2026-05-02T13:28:59.913Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_o_production_summary_ui_20260502_231710/aicm-production-core.before_r8z_o.js
MTIME=2026-05-02T13:57:58.729Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4_review_list_render_route_fix_20260503_060534/aicm-production-core.before_r8z_v4.js
MTIME=2026-05-02T21:05:34.743Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4b_review_list_stable_renderer_20260503_060751/aicm-production-core.before_r8z_v4b.js
MTIME=2026-05-02T21:07:51.735Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5b_stable_context_hydration_20260503_062219/aicm-production-core.before_r8z_v5b.js
MTIME=2026-05-02T21:22:20.627Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5c_review_list_append_override_20260503_062512/aicm-production-core.before_r8z_v5c.js
MTIME=2026-05-02T21:25:13.275Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5d_review_list_append_override_20260503_063542/aicm-production-core.before_r8z_v5d.js
MTIME=2026-05-02T21:35:43.271Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v7_review_list_route_bridge_20260503_070352/aicm-production-core.before_r8z_v7.js
MTIME=2026-05-02T22:03:53.393Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_anchor_patch_20260503_071242/aicm-production-core.before_r8o_r8p_r8q_anchor.js
MTIME=2026-05-02T22:03:53.677Z
REF_COUNT=2
DEF_COUNT=1
  4404:function isPendingMajor(row) {
  4445:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/030_served_aicm-production-core.js
MTIME=2026-05-02T22:17:01.397Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/aicm-production-core.before_r8z_v8g.js
MTIME=2026-05-03T01:30:48.074Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8h_v7_merge_finalizer_rerender_fix_20260503_103314/aicm-production-core.before_r8z_v8h.js
MTIME=2026-05-03T01:33:15.250Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/aicm-production-core.before_r8z_v8k.js
MTIME=2026-05-03T01:41:07.938Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8l_v7_fetch_timeout_xhr_fallback_20260503_104355/aicm-production-core.before_r8z_v8l.js
MTIME=2026-05-03T01:43:56.166Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-production-core.before_r8z_v9.js
MTIME=2026-05-03T01:53:38.950Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

FILE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/aicm-production-core.before_r8z_v9c.js
MTIME=2026-05-03T01:57:37.126Z
REF_COUNT=3
DEF_COUNT=1
  4408:function isPendingMajor(row) {
  4449:return isPendingMajor(row);
  4959:return isPendingMajor(row);

============================================================
7. marker scan current core
============================================================
8588:    var text = aicmR8ZOText(value);
8598:  function aicmR8ZOContext() {
8602:  function aicmR8ZOArray() {
8603:    var ctx = aicmR8ZOContext();
8612:  function aicmR8ZOLower(value) {
8613:    return aicmR8ZOText(value).toLowerCase();
8616:  function aicmR8ZOMajorStatus(row) {
8617:    var handoff = aicmR8ZOLower(row && row.handoff_status_code);
8618:    var decomposition = aicmR8ZOLower(row && row.decomposition_status_code);
8669:  function aicmR8ZOWorkerStatus(row) {
8670:    var work = aicmR8ZOLower(row && row.work_status_code);
8671:    var review = aicmR8ZOLower(row && row.review_status_code);
8715:  function aicmR8ZOCountBy(rows, classifier) {
8724:  function aicmR8ZOMajorRowsBy(code) {
8725:    return aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items").filter(function(row) {
8726:      return aicmR8ZOMajorStatus(row) === code;
8730:  function aicmR8ZOWorkerRowsBy(code) {
8731:    return aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits").filter(function(row) {
8732:      return aicmR8ZOWorkerStatus(row) === code;
8736:  function aicmR8ZOTitle(row) {
8737:    return aicmR8ZOText(
8749:  function aicmR8ZODescription(row) {
8750:    return aicmR8ZOText(
8762:  function aicmR8ZOStatusText(row) {
8763:    var work = aicmR8ZOText(row && row.work_status_code);
8764:    var review = aicmR8ZOText(row && row.review_status_code);
8765:    var handoff = aicmR8ZOText(row && row.handoff_status_code);
8766:    var decomposition = aicmR8ZOText(row && row.decomposition_status_code);
8783:  function aicmR8ZODetailRows(filter) {
8784:    if (filter === "worker_running") return aicmR8ZOWorkerRowsBy("worker_running");
8785:    if (filter === "review_waiting") return aicmR8ZOWorkerRowsBy("review_waiting");
8786:    if (filter === "worker_completed") return aicmR8ZOWorkerRowsBy("worker_completed");
8787:    if (filter === "worker_needs_check") return aicmR8ZOWorkerRowsBy("worker_needs_check");
8788:    return aicmR8ZOMajorRowsBy(filter);
8791:  function aicmR8ZOFilterLabel(filter) {
8807:  function aicmR8ZOSummaryButton(code, label, count, note) {
8809:      '<button type="button" data-core-action="manager-major-summary-filter" data-summary-filter="' + aicmR8ZOEscape(code) + '" style="text-align:left;display:block;">',
8810:      '  <span class="aicm-eyebrow">' + aicmR8ZOEscape(label) + '</span>',
8811:      '  <strong style="display:block;font-size:30px;margin:6px 0;">' + aicmR8ZOEscape(String(count || 0)) + '件</strong>',
8812:      note ? '  <span style="display:block;color:#64748b;font-weight:800;">' + aicmR8ZOEscape(note) + '</span>' : '',
8817:  function aicmR8ZORenderDetail(filter) {
8820:    var rows = aicmR8ZODetailRows(filter);
8821:    var label = aicmR8ZOFilterLabel(filter);
8824:      var title = aicmR8ZOTitle(row);
8825:      var description = aicmR8ZODescription(row);
8826:      var worker = aicmR8ZOText(row && (row.assigned_worker_label || row.assigned_leader_label || row.leader_robot_label || row.responsible_robot_label));
8827:      var priority = aicmR8ZOText(row && row.priority_code) || "-";
8828:      var due = aicmR8ZOText(row && row.due_date) || "-";
8829:      var status = aicmR8ZOStatusText(row);
8833:        '  <p class="aicm-eyebrow">詳細 #' + aicmR8ZOEscape(String(index + 1)) + '</p>',
8834:        '  <h3>' + aicmR8ZOEscape(title) + '</h3>',
8835:        description ? '  <p class="aicm-selected-note">' + aicmR8ZOEscape(description) + '</p>' : '',
8837:        '    <dt>状態</dt><dd>' + aicmR8ZOEscape(status) + '</dd>',
8838:        '    <dt>担当</dt><dd>' + aicmR8ZOEscape(worker || "-") + '</dd>',
8839:        '    <dt>優先度</dt><dd>' + aicmR8ZOEscape(priority) + '</dd>',
8840:        '    <dt>期限</dt><dd>' + aicmR8ZOEscape(due) + '</dd>',
8849:      '  <h2>' + aicmR8ZOEscape(label) + ' の詳細</h2>',
8850:      '  <p class="aicm-selected-note">対象: <strong>' + aicmR8ZOEscape(String(rows.length)) + '件</strong></p>',
8859:  function aicmRenderManagerMajorSummaryPanelR8U() {
8860:    var majorRows = aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items");
8861:    var workerRows = aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits");
8862:    var majorCounts = aicmR8ZOCountBy(majorRows, aicmR8ZOMajorStatus);
8863:    var workerCounts = aicmR8ZOCountBy(workerRows, aicmR8ZOWorkerStatus);
8870:      '  <p class="aicm-selected-note">合計: <strong>' + aicmR8ZOEscape(String(majorRows.length)) + '件</strong> / Worker作業単位: <strong>' + aicmR8ZOEscape(String(workerRows.length)) + '件</strong></p>',
8872:      aicmR8ZOSummaryButton("unhandoff", "未引き継ぎ", majorCounts.unhandoff || 0, "課長へ送る前"),
8873:      aicmR8ZOSummaryButton("auto_waiting", "自動処理待ち", majorCounts.auto_waiting || 0, "Leader以降の開始待ち"),
8874:      aicmR8ZOSummaryButton("manager_completed", "分解済み", majorCounts.manager_completed || 0, "Worker作業単位まで作成"),
8875:      aicmR8ZOSummaryButton("worker_running", "Worker実行中", workerCounts.worker_running || 0, "AIWorkerOS受付済み"),
8876:      aicmR8ZOSummaryButton("review_waiting", "レビュー待ち", workerCounts.review_waiting || 0, "承認待ちへ表示予定"),
8877:      aicmR8ZOSummaryButton("archived", "削除済み", majorCounts.archived || 0, "非表示・保管扱い"),
8880:      aicmR8ZORenderDetail(filter),
8889:  function aicmRenderPmlwAutoOutputsPanelR8ZC() {
8893:  function aicmRenderR8ZNWorkerRuntimeStatusPanel() {
8896:// AICM_R8Z_O_PRODUCTION_SUMMARY_UI_END
9083:// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START
9256:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: expose callback on globalThis as well as window
9258:      if (typeof globalThis !== "undefined" && typeof window !== "undefined" && window.__aicmR8zV9ReviewContextCallback) {
9259:        globalThis.__aicmR8zV9ReviewContextCallback = window.__aicmR8zV9ReviewContextCallback;
9261:    } catch (_r8zV9cGlobalBindError) {}
9387:// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END
9389:// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START
9505:  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper begin
9506:  function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
9558:    appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
9561:  // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: helper end
9576:    // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: runtime debug start
9577:    appState.aicmR8zV8kDebug = "fetch-start";
9578:    appState.aicmR8zV8kFetchStartedAt = new Date().toISOString();
9579:    appState.aicmR8zV8kOwner = owner;
9580:    appState.aicmR8zV8kCompany = company;
9581:    appState.aicmR8zV8kPayloadCount = -1;
9582:    appState.aicmR8zV8kMergedCount = -1;
9583:    appState.aicmR8zV8kError = "";
9585:      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9586:      state.aicmR8zV8kFetchStartedAt = appState.aicmR8zV8kFetchStartedAt;
9587:      state.aicmR8zV8kOwner = owner;
9588:      state.aicmR8zV8kCompany = company;
9589:      state.aicmR8zV8kPayloadCount = -1;
9590:      state.aicmR8zV8kMergedCount = -1;
9591:      state.aicmR8zV8kError = "";
9593:    // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: runtime debug end
9600:    // AICM_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK: timeout + XMLHttpRequest fallback begin
9602:      setTimeout(function aicmR8zV8lFetchTimeoutXhrFallback() {
9604:          var alreadyMerged = Number(appState && appState.aicmR8zV8kMergedCount);
9609:          appState.aicmR8zV8kDebug = "fetch-timeout-xhr-start";
9610:          appState.aicmR8zV8kError = "";
9611:          appState.aicmR8zV8lFallbackStartedAt = new Date().toISOString();
9614:            state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9615:            state.aicmR8zV8kError = "";
9616:            state.aicmR8zV8lFallbackStartedAt = appState.aicmR8zV8lFallbackStartedAt;
9620:            appState.aicmR8zV8kDebug = "xhr-unavailable";
9621:            appState.aicmR8zV8kError = "XMLHttpRequest is undefined";
9624:              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9625:              state.aicmR8zV8kError = appState.aicmR8zV8kError;
9638:          xhr.onreadystatechange = function aicmR8zV8lXhrReadyStateChange() {
9643:                appState.aicmR8zV8kDebug = "xhr-error";
9644:                appState.aicmR8zV8kError = "status=" + String(xhr.status);
9648:                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9649:                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
9661:                appState.aicmR8zV8kDebug = "xhr-parse-error";
9662:                appState.aicmR8zV8kError = String(parseError && parseError.message ? parseError.message : parseError);
9666:                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9667:                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
9680:              var mergedRows = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9682:              appState.aicmR8zV8kDebug = "xhr-merged";
9683:              appState.aicmR8zV8kPayloadCount = payloadRows.length;
9684:              appState.aicmR8zV8kMergedCount = Array.isArray(mergedRows) ? mergedRows.length : -2;
9685:              appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9686:              appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9687:              appState.aicmR8zV8kMergedAt = new Date().toISOString();
9695:                state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9696:                state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9697:                state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9698:                state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9699:                state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9700:                state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9706:                setTimeout(function aicmR8zV8lRerenderAfterXhrMerge() {
9723:                appState.aicmR8zV8kDebug = "xhr-runtime-error";
9724:                appState.aicmR8zV8kError = String(runtimeError && runtimeError.message ? runtimeError.message : runtimeError);
9727:                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9728:                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
9736:          xhr.onerror = function aicmR8zV8lXhrError() {
9738:              appState.aicmR8zV8kDebug = "xhr-network-error";
9739:              appState.aicmR8zV8kError = "XMLHttpRequest onerror";
9742:                state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9743:                state.aicmR8zV8kError = appState.aicmR8zV8kError;
9753:            appState.aicmR8zV8kDebug = "xhr-fallback-error";
9754:            appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
9757:              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9758:              state.aicmR8zV8kError = appState.aicmR8zV8kError;
9765:    } catch (_r8zV8lScheduleError) {}
9766:    // AICM_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK: timeout + XMLHttpRequest fallback end
9779:          // AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE: merge payload review_wait_items into appState/state
9780:          var aicmR8zV8kMergedRows = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9781:          // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: payload/merge debug
9783:            var aicmR8zV8kPayloadRows = [];
9784:            if (payload && Array.isArray(payload.review_wait_items)) aicmR8zV8kPayloadRows = payload.review_wait_items;
9785:            else if (payload && payload.context && Array.isArray(payload.context.review_wait_items)) aicmR8zV8kPayloadRows = payload.context.review_wait_items;
9786:            else if (payload && payload.data && Array.isArray(payload.data.review_wait_items)) aicmR8zV8kPayloadRows = payload.data.review_wait_items;
9788:            appState.aicmR8zV8kDebug = "payload-merged";
9789:            appState.aicmR8zV8kPayloadCount = aicmR8zV8kPayloadRows.length;
9790:            appState.aicmR8zV8kMergedCount = Array.isArray(aicmR8zV8kMergedRows) ? aicmR8zV8kMergedRows.length : -2;
9791:            appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9792:            appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9793:            appState.aicmR8zV8kMergedAt = new Date().toISOString();
9796:              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9797:              state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9798:              state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9799:              state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9800:              state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9801:              state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9803:          } catch (_r8zV8kMergeDebugError) {}
9805:          // AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER: force finalizer and one-shot rerender after review_wait_items merge
9825:          } catch (_r8zV8hFinalizeError) {}
9828:            setTimeout(function aicmR8zV8hReviewListRerender() {
9834:              } catch (_r8zV8hRenderError) {}
9841:              } catch (_r8zV8hWindowRenderError) {}
9843:          } catch (_r8zV8hScheduleError) {}
9874:  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper begin
9875:  function aicmR8zV9ReviewRowsFromPayload(payload) {
9886:  function aicmR8zV9MergeReviewPayload(appState, payload) {
9890:    var rows = aicmR8zV9ReviewRowsFromPayload(payload);
9892:    if (typeof aicmR8zV8gMergeReviewWaitItemsFromPayload === "function") {
9894:        var mergedByV8g = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9895:        if (Array.isArray(mergedByV8g)) rows = mergedByV8g;
9931:    appState.aicmR8zV9Hydrating = false;
9932:    appState.aicmR8zV9Hydrated = true;
9933:    appState.aicmR8zV9Rows = rows.length;
9935:    appState.aicmR8zV8kDebug = "v9-script-merged";
9936:    appState.aicmR8zV8kPayloadCount = rows.length;
9937:    appState.aicmR8zV8kMergedCount = rows.length;
9938:    appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9939:    appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9940:    appState.aicmR8zV8kMergedAt = new Date().toISOString();
9945:      state.aicmR8zV9Hydrating = false;
9946:      state.aicmR8zV9Hydrated = true;
9947:      state.aicmR8zV9Rows = rows.length;
9948:      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9949:      state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9950:      state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9951:      state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9952:      state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9953:      state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9959:  function aicmR8zV9RerenderReviewList() {
9974:  function aicmR8zV9ReviewListScriptHydrate(appState) {
9985:    if (appState.aicmR8zV9Hydrating) return;
10007:      appState.aicmR8zV8kDebug = "v9-document-unavailable";
10008:      appState.aicmR8zV8kError = "document/body unavailable";
10012:    appState.aicmR8zV9Hydrating = true;
10014:    appState.aicmR8zV8kDebug = "v9-script-start";
10015:    appState.aicmR8zV8kPayloadCount = -1;
10016:    appState.aicmR8zV8kMergedCount = -1;
10017:    appState.aicmR8zV8kError = "";
10018:    appState.aicmR8zV9StartedAt = new Date().toISOString();
10021:      state.aicmR8zV9Hydrating = true;
10023:      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10024:      state.aicmR8zV8kPayloadCount = -1;
10025:      state.aicmR8zV8kMergedCount = -1;
10026:      state.aicmR8zV8kError = "";
10027:      state.aicmR8zV9StartedAt = appState.aicmR8zV9StartedAt;
10035:    window.__aicmR8zV9ReviewContextCallback = function aicmR8zV9ReviewContextCallback(payload) {
10037:        aicmR8zV9MergeReviewPayload(appState, payload);
10039:        appState.aicmR8zV8kDebug = "v9-merge-error";
10040:        appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
10041:        appState.aicmR8zV9Hydrating = false;
10046:        setTimeout(aicmR8zV9RerenderReviewList, 0);
10048:        aicmR8zV9RerenderReviewList();
10055:    params.set("callback", "window.__aicmR8zV9ReviewContextCallback"); // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE
10063:    script.onerror = function aicmR8zV9ScriptError() {
10064:      appState.aicmR8zV8kDebug = "v9-script-error";
10065:      appState.aicmR8zV8kError = "context-script load failed";
10066:      appState.aicmR8zV9Hydrating = false;
10070:        state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10071:        state.aicmR8zV8kError = appState.aicmR8zV8kError;
10072:        state.aicmR8zV9Hydrating = false;
10076:      aicmR8zV9RerenderReviewList();
10079:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: loaded-without-callback diagnostics
10080:    script.onload = function aicmR8zV9cScriptLoaded() {
10082:        setTimeout(function aicmR8zV9cCheckCallbackCompletion() {
10084:            var merged = Number(appState && appState.aicmR8zV8kMergedCount);
10086:            if (appState && appState.aicmR8zV9Hydrated) return;
10088:            appState.aicmR8zV8kDebug = "v9-script-loaded-no-callback";
10089:            appState.aicmR8zV8kError = String(
10090:              (typeof window !== "undefined" && window.__aicmR8zV9ReviewContextError)
10091:                ? window.__aicmR8zV9ReviewContextError
10094:            appState.aicmR8zV9Hydrating = false;
10098:              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10099:              state.aicmR8zV8kError = appState.aicmR8zV8kError;
10100:              state.aicmR8zV9Hydrating = false;
10123:  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
10129:    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
10138:      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
10139:      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
10140:      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
10141:      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
10142:      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
10143:      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
10144:      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
10153:      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
10216:// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END

============================================================
8. recent reports
============================================================

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/000_R8Z_V9D0B_TASK_LEDGER_REGRESSION_TIMELINE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/000_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9c_20260503_105736
PASS_COUNT=14
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=V9C_WINDOW_CALLBACK_READY_BROWSER_OPENED
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9b_restart_active_patched_server_20260503_105519/000_R8Z_V9B_RESTART_ACTIVE_PATCHED_SERVER_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9b_20260503_105519
PASS_COUNT=13
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=V9B_ACTIVE_PATCHED_SERVER_READY_BROWSER_OPENED
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/000_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=YES
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v9_20260503_105338
PASS_COUNT=16
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=V9_PATCH_APPLIED_BUT_VERIFY_INCOMPLETE
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=YES

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_reopen_screen_after_server_drop_20260503_104657/000_R8Z_REOPEN_SCREEN_AFTER_SERVER_DROP_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_reopen_20260503_104657
FINAL_JUDGEMENT=SERVER_RESTARTED_BROWSER_OPENED
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_reopen_20260503_104657
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8l_v7_fetch_timeout_xhr_fallback_20260503_104355/000_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8l_20260503_104355
PASS_COUNT=11
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=V8L_XHR_FALLBACK_READY_FOR_BROWSER_CHECK
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/000_R8Z_V8K_VISIBLE_RUNTIME_DEBUG_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8k_20260503_104107
PASS_COUNT=11
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=VISIBLE_RUNTIME_DEBUG_READY_FOR_BROWSER_CHECK
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8j_v7_marker_execution_position_isolate_20260503_103942/000_R8Z_V8J_V7_MARKER_EXECUTION_POSITION_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=6
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=ACTIVE_V7_HAS_MARKERS_NEXT_RUNTIME_DEBUG_FLAG
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8i_browser_asset_cache_isolate_20260503_103806/000_R8Z_V8I_BROWSER_ASSET_CACHE_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=12
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=BROWSER_CORE_SHOULD_BE_LATEST_NEXT_CHECK_V8H_EXECUTION_POSITION
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8h_v7_merge_finalizer_rerender_fix_20260503_103314/000_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER_FIX_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8h_20260503_103314
PASS_COUNT=12
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=CORE_V7_MERGE_FINALIZER_RERENDER_PATCH_READY_FOR_BROWSER_CHECK
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/000_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE_FIX_REPORT.md
  FINAL_JUDGEMENT=PATCH_V7_ADD_REVIEW_WAIT_ITEMS_MERGE
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8g_20260503_103047
PASS_COUNT=11
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=CORE_V7_REVIEW_WAIT_ITEMS_MERGE_PATCH_READY_FOR_BROWSER_CHECK
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO
CORE_PATCH=YES

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f3_v7_hydrate_finalizer_rerender_isolate_20260503_102934/000_R8Z_V8F3_V7_HYDRATE_FINALIZER_RERENDER_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=7
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=PATCH_V7_ADD_REVIEW_WAIT_ITEMS_MERGE
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f2_core_v7_hydration_snippet_isolate_20260503_102820/000_R8Z_V8F2_CORE_V7_HYDRATION_SNIPPET_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=5
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=CORE_V7_FINALIZER_EXISTS_INSPECT_SNIP_FOR_RERENDER_OR_WRONG_SCOPE
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8f_browser_hydration_log_isolate_20260503_102715/000_R8Z_V8F_BROWSER_HYDRATION_LOG_ISOLATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8e5_20260503_102501
FINAL_JUDGEMENT=READY_FOR_BROWSER_RELOAD_REVIEW_LIST_CHECK

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e5_restart_server_browser_gate_20260503_102501/000_R8Z_V8E5_RESTART_SERVER_BROWSER_GATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v8e5_20260503_102501
PASS_COUNT=7
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=READY_FOR_BROWSER_RELOAD_REVIEW_LIST_CHECK
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e4_browser_check_gate_20260503_102401/000_R8Z_V8E4_BROWSER_CHECK_GATE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e3_correct_context_parameter_recheck_20260503_080058/000_R8Z_V8E3_CORRECT_CONTEXT_PARAMETER_RECHECK_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=9
WARN_COUNT=0
FAIL_COUNT=0
FINAL_JUDGEMENT=CONTEXT_ALREADY_EXPOSES_TARGET_WITH_CORRECT_PARAM_BROWSER_CHECK
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e2_runtime_error_isolate_and_safe_rollback_20260503_075932/000_R8Z_V8E2_RUNTIME_ERROR_ISOLATE_AND_SAFE_ROLLBACK_REPORT.md
DB_WRITE=NO
API_POST=NO
CORE_PATCH=NO
PASS_COUNT=12
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=V8E_ROLLED_BACK_BUT_CONTEXT_API_STILL_NOT_200_CHECK_SERVER_LOG
DB_WRITE=NO
API_POST=NO
CORE_PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e_safe_custom_http_context_response_exposure_fix_20260503_075527/000_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_RESPONSE_EXPOSURE_FIX_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO
PASS_COUNT=10
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=SERVER_PATCH_APPLIED_BUT_CONTEXT_API_NOT_200
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8d_custom_http_context_response_exposure_fix_20260503_075127/000_R8Z_V8D_CUSTOM_HTTP_CONTEXT_RESPONSE_EXPOSURE_FIX_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO
FINAL_JUDGEMENT=SERVER_PATCH_SYNTAX_FAILED_ROLLED_BACK

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c2_server_context_route_actual_shape_20260503_074848/000_R8Z_V8C2_SERVER_CONTEXT_ROUTE_ACTUAL_SHAPE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
  FINAL_JUDGEMENT=NO_CONTEXT_AND_DB_COUNT_UNCLEAR_CHECK_DB_VIEW_OR_IDS
FINAL_JUDGEMENT=DB_TARGET_FOUND_CONTEXT_EXPOSURE_OR_FILTER_MISMATCH
PASS_COUNT=6
WARN_COUNT=1
FAIL_COUNT=0
FINAL_JUDGEMENT=CONTEXT_ROUTE_IS_CUSTOM_HTTP_STYLE_PREPARE_V8D_TARGETED_PATCH
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c_server_context_review_wait_exposure_fix_20260503_074656/000_R8Z_V8C_SERVER_CONTEXT_REVIEW_WAIT_EXPOSURE_FIX_REPORT.md
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO
FINAL_JUDGEMENT=PATCH_SKIPPED_CONTEXT_ROUTE_PATTERN_NOT_FOUND

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8b_db_view_id_direct_locate_20260503_072714/000_R8Z_V8B_DB_VIEW_ID_DIRECT_LOCATE_REPORT.md
  FINAL_JUDGEMENT=NO_CONTEXT_AND_DB_COUNT_UNCLEAR_CHECK_DB_VIEW_OR_IDS
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=6
WARN_COUNT=2
FAIL_COUNT=0
FINAL_JUDGEMENT=DB_TARGET_FOUND_CONTEXT_EXPOSURE_OR_FILTER_MISMATCH
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8a_context_shape_isolate_20260503_071948/000_R8Z_V8A_CONTEXT_SHAPE_ISOLATE_REPORT.md
- 直前確認では FINAL_JUDGEMENT=CONTEXT_API_OR_RESPONSE_SHAPE_CHECK_REQUIRED
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=7
WARN_COUNT=4
FAIL_COUNT=0
FINAL_JUDGEMENT=NO_CONTEXT_AND_DB_COUNT_UNCLEAR_CHECK_DB_VIEW_OR_IDS
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/000_R8Z_V8_V9_REVIEW_LIST_HYDRATION_ROOT_CAUSE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS_COUNT=11
WARN_COUNT=2
FAIL_COUNT=0
FINAL_JUDGEMENT=CONTEXT_API_OR_RESPONSE_SHAPE_CHECK_REQUIRED
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_20260503_071553/000_R8Z_V8_V9_REVIEW_LIST_HYDRATION_ROOT_CAUSE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v7_review_list_route_bridge_20260503_070352/000_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v6_review_list_root_cause_investigation_20260503_070156/000_R8Z_V6_REVIEW_LIST_ROOT_CAUSE_INVESTIGATION_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5d_review_list_append_override_20260503_063542/000_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4b_review_list_stable_renderer_20260503_060751/000_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/000_R8Z_V3_REVIEW_VISIBILITY_ROOT_CAUSE_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v2_worker_output_to_human_review_bridge_fixed_20260503_055255/000_R8Z_V2_WORKER_OUTPUT_TO_HUMAN_REVIEW_BRIDGE_FIXED_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_u2_owner_context_screen_confirm_20260503_054722/000_R8Z_U2_OWNER_CONTEXT_SCREEN_CONFIRM_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_t_db_source_collector_persist_apply_20260503_054352/000_R8Z_T_DB_SOURCE_COLLECTOR_PERSIST_APPLY_REPORT.md

### /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_s_db_source_collector_rollback_20260503_053051/000_R8Z_S_DB_SOURCE_COLLECTOR_ROLLBACK_REPORT.md

============================================================
9. classification
============================================================
CURRENT_REF_COUNT=3
CURRENT_DEF_COUNT=1
SERVED_REF_COUNT=3
SERVED_DEF_COUNT=1
BACKUP_HIT_FILE_COUNT=57
FINAL_JUDGEMENT=CURRENT_CORE_HAS_HELPER_AND_REF_SCOPE_OR_CACHE_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/000_R8Z_V9D0B_TASK_LEDGER_REGRESSION_TIMELINE_REPORT.md
CURRENT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/020_current_core_scan.txt
BACKUP_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/031_backup_isPendingMajor_scan.txt
MARKER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/040_marker_scan.txt
RECENT_REPORTS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/050_recent_reports.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- CURRENT_CORE_HAS_BROKEN_ISPENDING_CALLSITE_FIND_CALLER_OR_ROLLBACK:
  helper追加ではなく、isPendingMajorを呼んでいるcallsiteを既存の正しい判定へ戻す。
  直前backupとの差分で混入元を確認。

- CURRENT_CORE_OK_BROWSER_TAB_USED_OLD_R8U_ASSET_OR_OLD_URL:
  current coreは壊れていない。古いタブ/古いscript queryを見ていた可能性。
  最新URLを開き直し、必要ならChromeタブを閉じる。

- SERVED_CORE_STALE_OR_BROWSER_OLD_SCRIPT_RESTART_SERVER_CACHEBUST:
  server再起動・served core一致確認。

- CURRENT_CORE_HAS_HELPER_AND_REF_SCOPE_OR_CACHE_CHECK:
  既にhelperがあるならscope外定義か古いasset。定義場所/呼出場所を確認。

============================================================
DONE
============================================================
CURRENT_REF_COUNT=3
CURRENT_DEF_COUNT=1
SERVED_REF_COUNT=3
SERVED_DEF_COUNT=1
BACKUP_HIT_FILE_COUNT=57
FINAL_JUDGEMENT=CURRENT_CORE_HAS_HELPER_AND_REF_SCOPE_OR_CACHE_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/000_R8Z_V9D0B_TASK_LEDGER_REGRESSION_TIMELINE_REPORT.md
CURRENT_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/020_current_core_scan.txt
BACKUP_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/031_backup_isPendingMajor_scan.txt
MARKER_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/040_marker_scan.txt
RECENT_REPORTS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d0b_task_ledger_regression_timeline_20260503_110250/050_recent_reports.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO
