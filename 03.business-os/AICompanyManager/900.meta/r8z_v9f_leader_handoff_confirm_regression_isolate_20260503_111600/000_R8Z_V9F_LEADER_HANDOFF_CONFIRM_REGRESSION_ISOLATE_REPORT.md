============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 台帳表示は復旧
- 課長へ送るで確認カードが出ない
- レビュー待ちは変わらず
- ここでレビュー待ちV9系の追加パッチは一旦停止

今回:
1. core/server syntax確認
2. git status確認
3. served core と disk core の一致確認
4. 課長へ送るボタン action の存在確認
5. click handler の存在確認
6. confirmation state の存在確認
7. confirmation card renderer の存在確認
8. task-ledger画面に confirmation card が差し込まれているか確認
9. V9/V9E系が全体renderに触っていないか確認
10. 次の最小修正方針を判定

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
PHASE=R8Z-V9F leader handoff confirm regression isolate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. git status
============================================================
GIT_ROOT=/data/data/com.termux/files/home/03.civilization-development
 M 03.business-os/AICompanyManager/assets/js/aicm-production-core.js
?? 03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/
?? 03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/
?? 03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/

============================================================
4. served core check
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=64e6ba6bcdc72a001229916bdd848ea723f59f063ed8aa3deafd6285503f520a
SERVED_SHA=64e6ba6bcdc72a001229916bdd848ea723f59f063ed8aa3deafd6285503f520a
PASS: served core matches disk

============================================================
5. leader handoff action scan
============================================================
---- pmlw-major-leader-handoff refs ----
4180-    if (!rows.length) return "";
4181-
4182-    return [
4183-      '<section class="aicm-core-card aicm-axu-r1b-leader-handoff-panel">',
4184-      '  <p class="aicm-eyebrow">Manager大項目</p>',
4185-      '  <h2>課長への引渡し</h2>',
4186-      '  <p class="aicm-selected-note">Manager大項目を課長/Leaderへ送ります。Worker Runtime request はまだ作成しません。</p>',
4187-      rows.map(function (row) {
4188-        var majorId = typeof aicmAxuR1MajorId === "function" ? aicmAxuR1MajorId(row) : "";
4189-        var title = row.major_item_name || row.deliverable_name || row.task_name || "Manager大項目";
4190-        var leader = row.assigned_leader_label || row.leader_label || "Leader未設定";
4191-        var status = row.decomposition_status_code || "-";
4192-        var handoff = row.handoff_status_code || "-";
4193-
4194-        return [
4195-          '<article class="aicm-org-update-row">',
4196-          '  <div>',
4197-          '    <strong>' + escapeHtml(title) + '</strong>',
4198-          '    <p>Leader: ' + escapeHtml(leader) + ' / 状態: ' + escapeHtml(status) + ' / 引渡し: ' + escapeHtml(handoff) + '</p>',
4199-          '  </div>',
4200:          '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
4201-          '</article>'
4202-        ].join("");
4203-      }).join(""),
4204-      '</section>'
4205-    ].join("");
4206-  }
4207-
4208-
4209-function renderPmlwMajorRowsBaseAxuR1B(rows) {
4210-    if (!rows.length) {
4211-      return [
4212-        '<div class="aicm-empty-state">',
4213-        '  <strong>登録済み大項目はまだありません</strong>',
4214-        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
4215-        '</div>'
4216-      ].join("");
4217-    }
4218-
4219-    return [
4220-      '<div class="aicm-table-wrap">',
--
4229-      '        <th>分解状態</th>',
4230-      '        <th>引渡し</th>',
4231-      '        <th>優先度</th>',
4232-      '        <th>期限</th>',
4233-      '        <th>操作</th>',
4234-      '      </tr>',
4235-      '    </thead>',
4236-      '    <tbody>',
4237-      rows.map(function (row) {
4238-        return [
4239-          '      <tr>',
4240-          '        <td>' + escapeHtml(pmlwValue(row.policy_title, row.source_route_code || "-")) + '</td>',
4241-          '        <td><strong>' + escapeHtml(pmlwValue(row.major_item_name, "-")) + '</strong><small>' + escapeHtml(pmlwValue(row.major_item_description, "")) + '</small></td>',
4242-          '        <td>' + escapeHtml(pmlwValue(row.department_name, "未割当")) + '</td>',
4243-          '        <td>' + escapeHtml(pmlwValue(row.section_name, "未割当")) + '</td>',
4244-          '        <td>' + escapeHtml(pmlwValue(row.assigned_leader_label, "-")) + '</td>',
4245-          '        <td>' + escapeHtml(pmlwStatusLabel(row.decomposition_status_code)) + '</td>',
4246-          '        <td>' + escapeHtml(pmlwStatusLabel(row.handoff_status_code)) + '</td>',
4247-          '        <td>' + escapeHtml(pmlwStatusLabel(row.priority_code)) + '</td>',
4248-          '        <td>' + escapeHtml(pmlwValue(row.due_date, "-")) + '</td>',
4249:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(aicmAxuR1MajorId(row)) + '">課長へ送る</button></td>',
4250-          '      </tr>'
4251-        ].join("");
4252-      }).join(""),
4253-      '    </tbody>',
4254-      '  </table>',
4255-      '</div>'
4256-    ].join("");
4257-  }
4258-
4259-function renderPmlwMajorRows(rows) {
4260-    // AICM_AXU_CSV_R8_RENDER_PMLW_MAJOR_ROWS_REPAIR_V1
4261-    function h(value) {
4262-      if (typeof escapeHtml === "function") return escapeHtml(value);
4263-      return String(value == null ? "" : value)
4264-        .replace(/&/g, "&amp;")
4265-        .replace(/</g, "&lt;")
4266-        .replace(/>/g, "&gt;")
4267-        .replace(/"/g, "&quot;")
4268-        .replace(/'/g, "&#39;");
4269-    }
--
4325-      '    </thead>',
4326-      '    <tbody>',
4327-      list.map(function (row, index) {
4328-        var id = rowId(row, index);
4329-        var title = value(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
4330-        var description = value(row, ["major_item_description", "description", "note"], "");
4331-        var department = value(row, ["department_name", "department_label"], "-");
4332-        var section = value(row, ["section_name", "section_label"], "-");
4333-        var priority = value(row, ["priority_code"], "normal");
4334-        var dueDate = value(row, ["due_date"], "-");
4335-        var status = value(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");
4336-
4337-        return [
4338-          '      <tr>',
4339-          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
4340-          '        <td>' + h(department) + '</td>',
4341-          '        <td>' + h(section) + '</td>',
4342-          '        <td>' + h(priority) + '</td>',
4343-          '        <td>' + h(dueDate || "-") + '</td>',
4344-          '        <td>' + h(status || "-") + '</td>',
4345:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
4346-          '      </tr>'
4347-        ].join("");
4348-      }).join(""),
4349-      '    </tbody>',
4350-      '  </table>',
4351-      '</div>'
4352-    ].join("");
4353-  }
4354-
4355-
4356-  
4357-
4358-
4359-
4360-
4361-
4362-
4363-
4364-  
4365-function aicmGetManagerMajorRowsForSelectedCompany(companyId) {
--
4651-    }
4652-  }
4653-
4654-  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
4655-    var payload = state.managerMajorLeaderHandoffConfirm || null;
4656-    if (!payload) return "";
4657-
4658-    return [
4659-      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
4660-      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671:      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672:      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678-  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679-    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681-    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685-  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
--
4990-      '</div>'
4991-    ].join("");
4992-
4993-    var cards = pageRows.map(function (row, index) {
4994-      var majorId = aicmAxuR1MajorId(row);
4995-      var summary = aicmMajorItemSummaryR8O(row);
4996-      var displayNo = start + index + 1;
4997-
4998-      return [
4999-        '<article class="aicm-core-card aicm-major-item-row">',
5000-        '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(displayNo)) + '</p>',
5001-        '  <h3>' + escapeHtml(summary.title) + '</h3>',
5002-        summary.description ? '  <p class="aicm-selected-note">' + escapeHtml(summary.description) + '</p>' : '',
5003-        '  <dl class="aicm-core-detail-list">',
5004-        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
5005-        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
5006-        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
5007-        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
5008-        '  </dl>',
5009-        '  <div class="aicm-dashboard-action-row">',
5010:        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
5011-        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
5012-        '  </div>',
5013-        '</article>'
5014-      ].join("");
5015-    }).join("");
5016-
5017-    return [
5018-      confirmCard,
5019-      pager,
5020-      '<div class="aicm-manager-major-list">',
5021-      cards,
5022-      '</div>',
5023-      pager
5024-    ].join("");
5025-  }
5026-
5027-    function aicmRenderTaskLedgerSafeR8V4(sourceLabel) {
5028-    state.screen = "task-ledger";
5029-
5030-    try {
--
8372-// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_START
8373-    if (action === "task-ledger-open") {
8374-      aicmOpenTaskLedgerScreenR8V3Clean();
8375-      return;
8376-    }
8377-// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_END
8378-
8379-    
8380-// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_START
8381-    if (action === "pmlw-major-page-prev") {
8382-      aicmMoveMajorItemPageFromActionR8V7C2(-1);
8383-      return;
8384-    }
8385-
8386-    if (action === "pmlw-major-page-next") {
8387-      aicmMoveMajorItemPageFromActionR8V7C2(1);
8388-      return;
8389-    }
8390-
8391-    // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_START
8392:    if (action === "pmlw-major-leader-handoff") {
8393-      aicmOpenMajorLeaderHandoffConfirmR8S(event, button);
8394-      return;
8395-    }
8396-
8397:    if (action === "pmlw-major-leader-handoff-cancel") {
8398-      aicmCancelMajorLeaderHandoffConfirmR8S();
8399-      return;
8400-    }
8401-
8402:    if (action === "pmlw-major-leader-handoff-execute") {
8403-      aicmExecuteMajorLeaderHandoffConfirmR8S();
8404-      return;
8405-    }
8406-// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_END
8407-
8408-    if (action === "pmlw-major-delete-open") {
8409-      aicmOpenMajorDeleteConfirmFromActionR8V7C2(event, button);
8410-      return;
8411-    }
8412-
8413-    if (action === "pmlw-major-delete-cancel") {
8414-      aicmCancelMajorDeleteConfirmFromActionR8V7C2();
8415-      return;
8416-    }
8417-
8418-    if (action === "pmlw-major-delete-execute") {
8419-      aicmExecuteMajorDeleteConfirmFromActionR8V7C2();
8420-      return;
8421-    }
8422-// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_END

---- 課長へ送る labels ----
4111-    var leaderLabel = aicmAxuR1LeaderLabel(row);
4112-
4113-    if (!majorId) {
4114-      throw new Error("Manager大項目IDを特定できません。");
4115-    }
4116-
4117-    if (!leaderLabel) {
4118-      throw new Error("課長/Leaderが未設定です。課変更でLeaderを設定するか、Manager大項目のLeader欄を設定してください。");
4119-    }
4120-
4121-    return {
4122-      kind: "manager-major-leader-handoff",
4123:      title: "課長へ送る確認",
4124-      endpoint: "/api/aicm/v2/manager-major/update",
4125-      backScreen: "task-ledger",
4126-      body: {
4127-        owner_civilization_id: aicmAxuR1OwnerId(),
4128-        aicm_manager_major_work_item_id: majorId,
4129-        assigned_leader_label: leaderLabel,
4130-        decomposition_status_code: "assigned_to_leader",
4131-        handoff_status_code: "handed_off",
4132-        note: aicmAxuR1Text(row.note)
4133-      }
4134-    };
4135-  }
--
4162-
4163-      var payload = aicmAxuR1BuildLeaderHandoffPayload(row);
4164-      aicmAxuR1ShowLeaderHandoffConfirm(payload);
4165-    } catch (error) {
4166-      setMessage("error", error && error.message ? error.message : "課長への引渡し確認を表示できません。");
4167-      if (typeof render === "function") render();
4168-    }
4169-  }
4170-
4171-
4172-
4173-// AICM_AXU_R1B_LEADER_HANDOFF_BUTTON_VISIBLE_V1
4174:// 保険表示: テーブル内ボタンが出ない場合でも、Manager大項目ごとの「課長へ送る」を出す。
4175-function aicmAxuR1BLeaderHandoffStandalonePanel() {
4176-    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
4177-      ? state.context.pmlw_major_items
4178-      : [];
4179-
4180-    if (!rows.length) return "";
4181-
4182-    return [
4183-      '<section class="aicm-core-card aicm-axu-r1b-leader-handoff-panel">',
4184-      '  <p class="aicm-eyebrow">Manager大項目</p>',
4185-      '  <h2>課長への引渡し</h2>',
4186-      '  <p class="aicm-selected-note">Manager大項目を課長/Leaderへ送ります。Worker Runtime request はまだ作成しません。</p>',
--
4188-        var majorId = typeof aicmAxuR1MajorId === "function" ? aicmAxuR1MajorId(row) : "";
4189-        var title = row.major_item_name || row.deliverable_name || row.task_name || "Manager大項目";
4190-        var leader = row.assigned_leader_label || row.leader_label || "Leader未設定";
4191-        var status = row.decomposition_status_code || "-";
4192-        var handoff = row.handoff_status_code || "-";
4193-
4194-        return [
4195-          '<article class="aicm-org-update-row">',
4196-          '  <div>',
4197-          '    <strong>' + escapeHtml(title) + '</strong>',
4198-          '    <p>Leader: ' + escapeHtml(leader) + ' / 状態: ' + escapeHtml(status) + ' / 引渡し: ' + escapeHtml(handoff) + '</p>',
4199-          '  </div>',
4200:          '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
4201-          '</article>'
4202-        ].join("");
4203-      }).join(""),
4204-      '</section>'
4205-    ].join("");
4206-  }
4207-
4208-
4209-function renderPmlwMajorRowsBaseAxuR1B(rows) {
4210-    if (!rows.length) {
4211-      return [
4212-        '<div class="aicm-empty-state">',
--
4237-      rows.map(function (row) {
4238-        return [
4239-          '      <tr>',
4240-          '        <td>' + escapeHtml(pmlwValue(row.policy_title, row.source_route_code || "-")) + '</td>',
4241-          '        <td><strong>' + escapeHtml(pmlwValue(row.major_item_name, "-")) + '</strong><small>' + escapeHtml(pmlwValue(row.major_item_description, "")) + '</small></td>',
4242-          '        <td>' + escapeHtml(pmlwValue(row.department_name, "未割当")) + '</td>',
4243-          '        <td>' + escapeHtml(pmlwValue(row.section_name, "未割当")) + '</td>',
4244-          '        <td>' + escapeHtml(pmlwValue(row.assigned_leader_label, "-")) + '</td>',
4245-          '        <td>' + escapeHtml(pmlwStatusLabel(row.decomposition_status_code)) + '</td>',
4246-          '        <td>' + escapeHtml(pmlwStatusLabel(row.handoff_status_code)) + '</td>',
4247-          '        <td>' + escapeHtml(pmlwStatusLabel(row.priority_code)) + '</td>',
4248-          '        <td>' + escapeHtml(pmlwValue(row.due_date, "-")) + '</td>',
4249:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(aicmAxuR1MajorId(row)) + '">課長へ送る</button></td>',
4250-          '      </tr>'
4251-        ].join("");
4252-      }).join(""),
4253-      '    </tbody>',
4254-      '  </table>',
4255-      '</div>'
4256-    ].join("");
4257-  }
4258-
4259-function renderPmlwMajorRows(rows) {
4260-    // AICM_AXU_CSV_R8_RENDER_PMLW_MAJOR_ROWS_REPAIR_V1
4261-    function h(value) {
--
4333-        var priority = value(row, ["priority_code"], "normal");
4334-        var dueDate = value(row, ["due_date"], "-");
4335-        var status = value(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");
4336-
4337-        return [
4338-          '      <tr>',
4339-          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
4340-          '        <td>' + h(department) + '</td>',
4341-          '        <td>' + h(section) + '</td>',
4342-          '        <td>' + h(priority) + '</td>',
4343-          '        <td>' + h(dueDate || "-") + '</td>',
4344-          '        <td>' + h(status || "-") + '</td>',
4345:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
4346-          '      </tr>'
4347-        ].join("");
4348-      }).join(""),
4349-      '    </tbody>',
4350-      '  </table>',
4351-      '</div>'
4352-    ].join("");
4353-  }
4354-
4355-
4356-  
4357-
--
4627-
4628-      state.managerMajorLeaderHandoffConfirm = {
4629-        majorId: majorId,
4630-        title: summary.title,
4631-        description: summary.description,
4632-        leader: summary.leader,
4633-        leaderRaw: summary.leaderRaw,
4634-        due: summary.due,
4635-        status: summary.status
4636-      };
4637-
4638-      state.screen = "task-ledger";
4639:      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
4640-      render();
4641-
4642-      setTimeout(function () {
4643-        try {
4644-          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");
4645-          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
4646-        } catch (_) {}
4647-      }, 50);
4648-    } catch (error) {
4649:      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4650-      render();
4651-    }
4652-  }
4653-
4654-  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
4655-    var payload = state.managerMajorLeaderHandoffConfirm || null;
4656-    if (!payload) return "";
4657-
4658-    return [
4659-      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
4660:      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671:      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678-  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679-    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681:    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685-  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
4693:    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4694-    return parts.join(" / ");
4695-  }
4696-
4697-  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {
4698-    var payload = state.managerMajorLeaderHandoffConfirm || null;
4699-    if (!payload || !payload.majorId) {
4700:      setMessage("error", "課長へ送る対象がありません。");
4701-      render();
4702-      return;
4703-    }
4704-
4705-    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
4706-    if (!ownerCivilizationId) {
4707-      setMessage("error", "owner_civilization_idを特定できません。");
4708-      render();
4709-      return;
4710-    }
4711-
4712-    try {
--
4769-          "error",
4770-          "課長へ送信しましたが、Leader自動分解に失敗しました: " +
4771-          (aicmR8zBAutoResult && aicmR8zBAutoResult.message ? aicmR8zBAutoResult.message : "原因不明")
4772-        );
4773-      }
4774-      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_END
4775-
4776-await aicmReloadTaskLedgerContext();
4777-      } else {
4778-        render();
4779-      }
4780-    } catch (error) {
4781:      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
4782-      render();
4783-    }
4784-  }
4785-// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_END
4786-
4787-
4788-// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_START
4789-  function aicmMajorItemPageSizeR8O() {
4790-    return 20;
4791-  }
4792-
4793-  function aicmMajorItemCurrentPageR8O(totalRows) {
--
4998-      return [
4999-        '<article class="aicm-core-card aicm-major-item-row">',
5000-        '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(displayNo)) + '</p>',
5001-        '  <h3>' + escapeHtml(summary.title) + '</h3>',
5002-        summary.description ? '  <p class="aicm-selected-note">' + escapeHtml(summary.description) + '</p>' : '',
5003-        '  <dl class="aicm-core-detail-list">',
5004-        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
5005-        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
5006-        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
5007-        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
5008-        '  </dl>',
5009-        '  <div class="aicm-dashboard-action-row">',
5010:        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
5011-        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
5012-        '  </div>',
5013-        '</article>'
5014-      ].join("");
5015-    }).join("");
5016-
5017-    return [
5018-      confirmCard,
5019-      pager,
5020-      '<div class="aicm-manager-major-list">',
5021-      cards,
5022-      '</div>',
--
6064-    for (var i = 0; i < names.length; i += 1) {
6065-      var value = aicmR8ZCText(row && row[names[i]]);
6066-      if (value) return value;
6067-    }
6068-
6069-    return "-";
6070-  }
6071-
6072-  function aicmRenderPmlwRequirementRowsR8ZC(rows) {
6073-    var list = Array.isArray(rows) ? rows.slice(0, 8) : [];
6074-
6075-    if (!list.length) {
6076:      return '<p class="aicm-core-empty">成果物要件はまだありません。課長へ送る確定後、Leader自動分解が成功するとここに出ます。</p>';
6077-    }
6078-
6079-    return [
6080-      '<div class="aicm-ledger-list">',
6081-      list.map(function (row) {
6082-        var name = aicmR8ZCStatusText(row, ["deliverable_name", "requirement_name", "title"]);
6083-        var type = aicmR8ZCStatusText(row, ["deliverable_type_code", "deliverable_type"]);
6084-        var status = aicmR8ZCStatusText(row, ["requirement_status_code", "status_code"]);
6085-        var priority = aicmR8ZCStatusText(row, ["priority_code"]);
6086-        var due = aicmR8ZCStatusText(row, ["due_date"]);
6087-        var desc = aicmR8ZCStatusText(row, ["deliverable_description", "description", "required_quality_text"]);
6088-
--
6384-        '    <div><dt>AIWorkerOS受付</dt><dd>' + aicmR8ZNHtml(accepted) + '</dd></div>',
6385-        '    <div><dt>source_request_ref</dt><dd>' + aicmR8ZNHtml(sourceRef) + '</dd></div>',
6386-        '    <div><dt>updated_at</dt><dd>' + aicmR8ZNHtml(updatedAt) + '</dd></div>',
6387-        '  </dl>',
6388-        '</article>'
6389-      ].join("");
6390-    }).join("");
6391-
6392-    if (!rows.length) {
6393-      cards = [
6394-        '<div class="aicm-empty-state">',
6395-        '  <strong>Worker作業単位はまだありません。</strong>',
6396:        '  <p>課長へ送る後、Leader自動分解とWorker作業単位作成が完了するとここに表示されます。</p>',
6397-        '</div>'
6398-      ].join("");
6399-    }
6400-
6401-    return [
6402-      '<section id="aicm-r8z-n-worker-runtime-status" class="aicm-core-card">',
6403-      '  <p class="aicm-eyebrow">Worker実行状況</p>',
6404-      '  <h2>AIWorkerOS実行受付状況</h2>',
6405-      '  <p class="aicm-selected-note">Worker作業単位がAIWorkerOS runtimeへ依頼されたか、request_idと受付状態で確認します。ここは表示専用です。</p>',
6406-      '  <div class="aicm-dashboard-action-row">',
6407-      '    <span>合計: <strong>' + aicmR8ZNHtml(summary.total) + '</strong></span>',
6408-      '    <span>実行待ち: <strong>' + aicmR8ZNHtml(summary.todo) + '</strong></span>',
--
8864-    var majorRows = aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items");
8865-    var workerRows = aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits");
8866-    var majorCounts = aicmR8ZOCountBy(majorRows, aicmR8ZOMajorStatus);
8867-    var workerCounts = aicmR8ZOCountBy(workerRows, aicmR8ZOWorkerStatus);
8868-    var filter = state && state.managerMajorSummaryFilter ? String(state.managerMajorSummaryFilter) : "";
8869-
8870-    return [
8871-      '<section class="aicm-core-card aicm-manager-major-summary-card">',
8872-      '  <p class="aicm-eyebrow">本番サマリ</p>',
8873-      '  <h2>部門別タスク台帳サマリ</h2>',
8874-      '  <p class="aicm-selected-note">合計: <strong>' + aicmR8ZOEscape(String(majorRows.length)) + '件</strong> / Worker作業単位: <strong>' + aicmR8ZOEscape(String(workerRows.length)) + '件</strong></p>',
8875-      '  <div class="aicm-dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">',
8876:      aicmR8ZOSummaryButton("unhandoff", "未引き継ぎ", majorCounts.unhandoff || 0, "課長へ送る前"),
8877-      aicmR8ZOSummaryButton("auto_waiting", "自動処理待ち", majorCounts.auto_waiting || 0, "Leader以降の開始待ち"),
8878-      aicmR8ZOSummaryButton("manager_completed", "分解済み", majorCounts.manager_completed || 0, "Worker作業単位まで作成"),
8879-      aicmR8ZOSummaryButton("worker_running", "Worker実行中", workerCounts.worker_running || 0, "AIWorkerOS受付済み"),
8880-      aicmR8ZOSummaryButton("review_waiting", "レビュー待ち", workerCounts.review_waiting || 0, "承認待ちへ表示予定"),
8881-      aicmR8ZOSummaryButton("archived", "削除済み", majorCounts.archived || 0, "非表示・保管扱い"),
8882-      '  </div>',
8883-      '  <p class="aicm-selected-note">件数カードを押すと、その分類の詳細だけ確認できます。request_id などの開発者情報は通常表示しません。</p>',
8884-      aicmR8ZORenderDetail(filter),
8885-      '</section>'
8886-    ].join("");
8887-  }
8888-
ACTION_BUTTON_COUNT=4
ACTION_REF_COUNT=9

============================================================
6. confirmation state / card scan
============================================================
---- managerMajorLeaderHandoffConfirm refs ----
4610-      due: String(due),
4611-      status: String(status),
4612-      leader: String(leader),
4613-      leaderRaw: leaderRaw
4614-    };
4615-  }
4616-
4617-  function aicmOpenMajorLeaderHandoffConfirmR8S(ev, btn) {
4618-    try {
4619-      var target = aicmLeaderHandoffActionTargetR8S(ev, btn);
4620-      var majorId = aicmLeaderHandoffMajorIdFromTargetR8S(target);
4621-      if (!majorId) throw new Error("Manager大項目IDを特定できません。");
4622-
4623-      var row = aicmFindMajorForLeaderHandoffR8S(majorId);
4624-      if (!row) throw new Error("Manager大項目を特定できません。");
4625-
4626-      var summary = aicmLeaderHandoffSummaryR8S(row);
4627-
4628:      state.managerMajorLeaderHandoffConfirm = {
4629-        majorId: majorId,
4630-        title: summary.title,
4631-        description: summary.description,
4632-        leader: summary.leader,
4633-        leaderRaw: summary.leaderRaw,
4634-        due: summary.due,
4635-        status: summary.status
4636-      };
4637-
4638-      state.screen = "task-ledger";
4639-      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
4640-      render();
4641-
4642-      setTimeout(function () {
4643-        try {
4644-          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");
4645-          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
4646-        } catch (_) {}
4647-      }, 50);
4648-    } catch (error) {
4649-      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4650-      render();
4651-    }
4652-  }
4653-
4654-  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
4655:    var payload = state.managerMajorLeaderHandoffConfirm || null;
4656-    if (!payload) return "";
4657-
4658-    return [
4659-      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
4660-      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678-  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679:    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681-    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685-  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
4693-    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4694-    return parts.join(" / ");
4695-  }
4696-
4697-  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {
4698:    var payload = state.managerMajorLeaderHandoffConfirm || null;
4699-    if (!payload || !payload.majorId) {
4700-      setMessage("error", "課長へ送る対象がありません。");
4701-      render();
4702-      return;
4703-    }
4704-
4705-    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
4706-    if (!ownerCivilizationId) {
4707-      setMessage("error", "owner_civilization_idを特定できません。");
4708-      render();
4709-      return;
4710-    }
4711-
4712-    try {
4713-      var body = {
4714-        owner_civilization_id: ownerCivilizationId,
4715-        aicm_manager_major_work_item_id: payload.majorId,
4716-        decomposition_status_code: "assigned_to_leader",
--
4726-        headers: {
4727-          "content-type": "application/json"
4728-        },
4729-        body: JSON.stringify(body)
4730-      });
4731-
4732-      var rawText = await response.text();
4733-      var json = null;
4734-      try {
4735-        json = rawText ? JSON.parse(rawText) : null;
4736-      } catch (_) {
4737-        json = null;
4738-      }
4739-
4740-      if (!response.ok || (json && json.result && json.result !== "ok")) {
4741-        throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));
4742-      }
4743-
4744:      state.managerMajorLeaderHandoffConfirm = null;
4745-      state.screen = "task-ledger";
4746-      setMessage("ok", "課長へ送信しました。");
4747-
4748-      if (typeof aicmReloadTaskLedgerContext === "function") {
4749-        
4750-      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_START
4751-      var aicmR8zBMajorIdForAuto = "";
4752-      try {
4753-        aicmR8zBMajorIdForAuto = aicmR8ZBText(
4754-          (payload && (payload.majorId || payload.aicm_manager_major_work_item_id || payload.manager_major_work_item_id)) || ""
4755-        );
4756-      } catch (_) {
4757-        aicmR8zBMajorIdForAuto = "";
4758-      }
4759-
4760-      var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);
4761-      var aicmR8zIWorkerAutoResult = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto);
4762-      if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
--
5820-    var createdRequirement = Number(json.created_deliverable_requirement_count || 0);
5821-    var createdWorker = Number(json.created_worker_work_unit_count || 0);
5822-    var skipped = Number(json.skipped_count || 0);
5823-
5824-    if (createdMiddle || createdRequirement || createdWorker) {
5825-      return "課長へ送信し、Leader中項目/成果物要件/Worker作業単位を自動作成しました。";
5826-    }
5827-
5828-    if (skipped) {
5829-      return "課長へ送信しました。Leader自動分解は既存データがあるためスキップしました。";
5830-    }
5831-
5832-    return "課長へ送信しました。Leader自動分解の対象はありませんでした。";
5833-  }
5834-
5835-  async function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId) {
5836-    var safeMajorId = aicmR8ZBText(majorId);
5837-
5838:    if (!safeMajorId && state && state.managerMajorLeaderHandoffConfirm) {
5839-      safeMajorId = aicmR8ZBText(
5840:        state.managerMajorLeaderHandoffConfirm.majorId ||
5841:        state.managerMajorLeaderHandoffConfirm.aicm_manager_major_work_item_id ||
5842:        state.managerMajorLeaderHandoffConfirm.manager_major_work_item_id
5843-      );
5844-    }
5845-
5846-    var companyId = aicmR8ZBCompanyId();
5847-    var ownerId = aicmR8ZBOwnerId();
5848-
5849-    if (!safeMajorId) {
5850-      return {
5851-        ok: false,
5852-        message: "Leader自動分解対象のManager大項目IDを特定できません。"
5853-      };
5854-    }
5855-
5856-    if (!companyId) {
5857-      return {
5858-        ok: false,
5859-        message: "Leader自動分解対象のAI企業IDを特定できません。"
5860-      };

---- leader handoff confirm/card/render refs ----
4105-  }
4106-
4107-function aicmAxuR1BuildLeaderHandoffPayload(row) {
4108-    row = row || {};
4109-
4110-    var majorId = aicmAxuR1MajorId(row);
4111-    var leaderLabel = aicmAxuR1LeaderLabel(row);
4112-
4113-    if (!majorId) {
4114-      throw new Error("Manager大項目IDを特定できません。");
4115-    }
4116-
4117-    if (!leaderLabel) {
4118-      throw new Error("課長/Leaderが未設定です。課変更でLeaderを設定するか、Manager大項目のLeader欄を設定してください。");
4119-    }
4120-
4121-    return {
4122-      kind: "manager-major-leader-handoff",
4123:      title: "課長へ送る確認",
4124-      endpoint: "/api/aicm/v2/manager-major/update",
4125-      backScreen: "task-ledger",
4126-      body: {
4127-        owner_civilization_id: aicmAxuR1OwnerId(),
4128-        aicm_manager_major_work_item_id: majorId,
4129-        assigned_leader_label: leaderLabel,
4130-        decomposition_status_code: "assigned_to_leader",
4131-        handoff_status_code: "handed_off",
4132-        note: aicmAxuR1Text(row.note)
4133-      }
4134-    };
4135-  }
4136-
4137:function aicmAxuR1ShowLeaderHandoffConfirm(payload) {
4138-    if (typeof aicmAvdShowDbConfirm === "function") {
4139-      aicmAvdShowDbConfirm(payload);
4140-      return;
4141-    }
4142-
4143-    if (typeof aicmOrgShowUpdateConfirm === "function") {
4144-      aicmOrgShowUpdateConfirm(payload);
4145-      return;
4146-    }
4147-
4148-    state.pendingOrgUpdate = payload;
4149-    state.screen = "task-ledger";
4150-
4151-    if (typeof render === "function") render();
4152-  }
4153-
4154:function aicmAxuR1OpenLeaderHandoffConfirm(button) {
4155-    try {
4156-      var majorId = button && button.getAttribute ? button.getAttribute("data-pmlw-major-id") : "";
4157-      var row = aicmAxuR1FindMajorById(majorId);
4158-
4159-      if (!row) {
4160-        throw new Error("Manager大項目を特定できません。");
4161-      }
4162-
4163-      var payload = aicmAxuR1BuildLeaderHandoffPayload(row);
4164:      aicmAxuR1ShowLeaderHandoffConfirm(payload);
4165-    } catch (error) {
4166-      setMessage("error", error && error.message ? error.message : "課長への引渡し確認を表示できません。");
4167-      if (typeof render === "function") render();
4168-    }
4169-  }
4170-
4171-
4172-
4173-// AICM_AXU_R1B_LEADER_HANDOFF_BUTTON_VISIBLE_V1
4174-// 保険表示: テーブル内ボタンが出ない場合でも、Manager大項目ごとの「課長へ送る」を出す。
4175-function aicmAxuR1BLeaderHandoffStandalonePanel() {
4176-    var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
4177-      ? state.context.pmlw_major_items
4178-      : [];
4179-
4180-    if (!rows.length) return "";
4181-
4182-    return [
--
4599-
4600-    var title = base && base.title ? base.title : (row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
4601-    var description = base && base.description ? base.description : (row && (row.major_item_description || row.task_description || row.note)) || "";
4602-    var due = base && base.due ? base.due : (row && row.due_date ? String(row.due_date) : "未設定");
4603-    var status = base && base.status ? base.status : ((row && row.handoff_status_code) || "draft");
4604-    var leaderRaw = aicmLeaderHandoffTextR8S(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label));
4605-    var leader = leaderRaw || "未設定（課へ引き継ぎ）";
4606-
4607-    return {
4608-      title: String(title),
4609-      description: String(description),
4610-      due: String(due),
4611-      status: String(status),
4612-      leader: String(leader),
4613-      leaderRaw: leaderRaw
4614-    };
4615-  }
4616-
4617:  function aicmOpenMajorLeaderHandoffConfirmR8S(ev, btn) {
4618-    try {
4619-      var target = aicmLeaderHandoffActionTargetR8S(ev, btn);
4620-      var majorId = aicmLeaderHandoffMajorIdFromTargetR8S(target);
4621-      if (!majorId) throw new Error("Manager大項目IDを特定できません。");
4622-
4623-      var row = aicmFindMajorForLeaderHandoffR8S(majorId);
4624-      if (!row) throw new Error("Manager大項目を特定できません。");
4625-
4626-      var summary = aicmLeaderHandoffSummaryR8S(row);
4627-
4628:      state.managerMajorLeaderHandoffConfirm = {
4629-        majorId: majorId,
4630-        title: summary.title,
4631-        description: summary.description,
4632-        leader: summary.leader,
4633-        leaderRaw: summary.leaderRaw,
4634-        due: summary.due,
4635-        status: summary.status
4636-      };
4637-
4638-      state.screen = "task-ledger";
4639:      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
4640-      render();
4641-
4642-      setTimeout(function () {
4643-        try {
4644-          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");
4645-          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
4646-        } catch (_) {}
4647-      }, 50);
4648-    } catch (error) {
4649:      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4650-      render();
4651-    }
4652-  }
4653-
4654:  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
4655:    var payload = state.managerMajorLeaderHandoffConfirm || null;
4656-    if (!payload) return "";
4657-
4658-    return [
4659-      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
4660:      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678:  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679:    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681-    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685-  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
4693-    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4694-    return parts.join(" / ");
4695-  }
4696-
4697:  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {
4698:    var payload = state.managerMajorLeaderHandoffConfirm || null;
4699-    if (!payload || !payload.majorId) {
4700-      setMessage("error", "課長へ送る対象がありません。");
4701-      render();
4702-      return;
4703-    }
4704-
4705-    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
4706-    if (!ownerCivilizationId) {
4707-      setMessage("error", "owner_civilization_idを特定できません。");
4708-      render();
4709-      return;
4710-    }
4711-
4712-    try {
4713-      var body = {
4714-        owner_civilization_id: ownerCivilizationId,
4715-        aicm_manager_major_work_item_id: payload.majorId,
4716-        decomposition_status_code: "assigned_to_leader",
--
4726-        headers: {
4727-          "content-type": "application/json"
4728-        },
4729-        body: JSON.stringify(body)
4730-      });
4731-
4732-      var rawText = await response.text();
4733-      var json = null;
4734-      try {
4735-        json = rawText ? JSON.parse(rawText) : null;
4736-      } catch (_) {
4737-        json = null;
4738-      }
4739-
4740-      if (!response.ok || (json && json.result && json.result !== "ok")) {
4741-        throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));
4742-      }
4743-
4744:      state.managerMajorLeaderHandoffConfirm = null;
4745-      state.screen = "task-ledger";
4746-      setMessage("ok", "課長へ送信しました。");
4747-
4748-      if (typeof aicmReloadTaskLedgerContext === "function") {
4749-        
4750-      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_START
4751-      var aicmR8zBMajorIdForAuto = "";
4752-      try {
4753-        aicmR8zBMajorIdForAuto = aicmR8ZBText(
4754-          (payload && (payload.majorId || payload.aicm_manager_major_work_item_id || payload.manager_major_work_item_id)) || ""
4755-        );
4756-      } catch (_) {
4757-        aicmR8zBMajorIdForAuto = "";
4758-      }
4759-
4760-      var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);
4761-      var aicmR8zIWorkerAutoResult = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto);
4762-      if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
--
5820-    var createdRequirement = Number(json.created_deliverable_requirement_count || 0);
5821-    var createdWorker = Number(json.created_worker_work_unit_count || 0);
5822-    var skipped = Number(json.skipped_count || 0);
5823-
5824-    if (createdMiddle || createdRequirement || createdWorker) {
5825-      return "課長へ送信し、Leader中項目/成果物要件/Worker作業単位を自動作成しました。";
5826-    }
5827-
5828-    if (skipped) {
5829-      return "課長へ送信しました。Leader自動分解は既存データがあるためスキップしました。";
5830-    }
5831-
5832-    return "課長へ送信しました。Leader自動分解の対象はありませんでした。";
5833-  }
5834-
5835-  async function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId) {
5836-    var safeMajorId = aicmR8ZBText(majorId);
5837-
5838:    if (!safeMajorId && state && state.managerMajorLeaderHandoffConfirm) {
5839-      safeMajorId = aicmR8ZBText(
5840:        state.managerMajorLeaderHandoffConfirm.majorId ||
5841:        state.managerMajorLeaderHandoffConfirm.aicm_manager_major_work_item_id ||
5842:        state.managerMajorLeaderHandoffConfirm.manager_major_work_item_id
5843-      );
5844-    }
5845-
5846-    var companyId = aicmR8ZBCompanyId();
5847-    var ownerId = aicmR8ZBOwnerId();
5848-
5849-    if (!safeMajorId) {
5850-      return {
5851-        ok: false,
5852-        message: "Leader自動分解対象のManager大項目IDを特定できません。"
5853-      };
5854-    }
5855-
5856-    if (!companyId) {
5857-      return {
5858-        ok: false,
5859-        message: "Leader自動分解対象のAI企業IDを特定できません。"
5860-      };
--
8375-      return;
8376-    }
8377-// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_END
8378-
8379-    
8380-// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_START
8381-    if (action === "pmlw-major-page-prev") {
8382-      aicmMoveMajorItemPageFromActionR8V7C2(-1);
8383-      return;
8384-    }
8385-
8386-    if (action === "pmlw-major-page-next") {
8387-      aicmMoveMajorItemPageFromActionR8V7C2(1);
8388-      return;
8389-    }
8390-
8391-    // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_START
8392-    if (action === "pmlw-major-leader-handoff") {
8393:      aicmOpenMajorLeaderHandoffConfirmR8S(event, button);
8394-      return;
8395-    }
8396-
8397-    if (action === "pmlw-major-leader-handoff-cancel") {
8398:      aicmCancelMajorLeaderHandoffConfirmR8S();
8399-      return;
8400-    }
8401-
8402-    if (action === "pmlw-major-leader-handoff-execute") {
8403:      aicmExecuteMajorLeaderHandoffConfirmR8S();
8404-      return;
8405-    }
8406-// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_END
8407-
8408-    if (action === "pmlw-major-delete-open") {
8409-      aicmOpenMajorDeleteConfirmFromActionR8V7C2(event, button);
8410-      return;
8411-    }
8412-
8413-    if (action === "pmlw-major-delete-cancel") {
8414-      aicmCancelMajorDeleteConfirmFromActionR8V7C2();
8415-      return;
8416-    }
8417-
8418-    if (action === "pmlw-major-delete-execute") {
8419-      aicmExecuteMajorDeleteConfirmFromActionR8V7C2();
8420-      return;
8421-    }
CONFIRM_STATE_REF_COUNT=9
CONFIRM_TITLE_COUNT=4
CONFIRM_CARD_LIKE_COUNT=5

============================================================
7. click handler scan
============================================================
---- core action dispatch nearby ----
4190-        var leader = row.assigned_leader_label || row.leader_label || "Leader未設定";
4191-        var status = row.decomposition_status_code || "-";
4192-        var handoff = row.handoff_status_code || "-";
4193-
4194-        return [
4195-          '<article class="aicm-org-update-row">',
4196-          '  <div>',
4197-          '    <strong>' + escapeHtml(title) + '</strong>',
4198-          '    <p>Leader: ' + escapeHtml(leader) + ' / 状態: ' + escapeHtml(status) + ' / 引渡し: ' + escapeHtml(handoff) + '</p>',
4199-          '  </div>',
4200:          '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
4201-          '</article>'
4202-        ].join("");
4203-      }).join(""),
4204-      '</section>'
4205-    ].join("");
4206-  }
4207-
4208-
4209-function renderPmlwMajorRowsBaseAxuR1B(rows) {
4210-    if (!rows.length) {
--
4239-          '      <tr>',
4240-          '        <td>' + escapeHtml(pmlwValue(row.policy_title, row.source_route_code || "-")) + '</td>',
4241-          '        <td><strong>' + escapeHtml(pmlwValue(row.major_item_name, "-")) + '</strong><small>' + escapeHtml(pmlwValue(row.major_item_description, "")) + '</small></td>',
4242-          '        <td>' + escapeHtml(pmlwValue(row.department_name, "未割当")) + '</td>',
4243-          '        <td>' + escapeHtml(pmlwValue(row.section_name, "未割当")) + '</td>',
4244-          '        <td>' + escapeHtml(pmlwValue(row.assigned_leader_label, "-")) + '</td>',
4245-          '        <td>' + escapeHtml(pmlwStatusLabel(row.decomposition_status_code)) + '</td>',
4246-          '        <td>' + escapeHtml(pmlwStatusLabel(row.handoff_status_code)) + '</td>',
4247-          '        <td>' + escapeHtml(pmlwStatusLabel(row.priority_code)) + '</td>',
4248-          '        <td>' + escapeHtml(pmlwValue(row.due_date, "-")) + '</td>',
4249:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(aicmAxuR1MajorId(row)) + '">課長へ送る</button></td>',
4250-          '      </tr>'
4251-        ].join("");
4252-      }).join(""),
4253-      '    </tbody>',
4254-      '  </table>',
4255-      '</div>'
4256-    ].join("");
4257-  }
4258-
4259-function renderPmlwMajorRows(rows) {
--
4335-        var status = value(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");
4336-
4337-        return [
4338-          '      <tr>',
4339-          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
4340-          '        <td>' + h(department) + '</td>',
4341-          '        <td>' + h(section) + '</td>',
4342-          '        <td>' + h(priority) + '</td>',
4343-          '        <td>' + h(dueDate || "-") + '</td>',
4344-          '        <td>' + h(status || "-") + '</td>',
4345:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
4346-          '      </tr>'
4347-        ].join("");
4348-      }).join(""),
4349-      '    </tbody>',
4350-      '  </table>',
4351-      '</div>'
4352-    ].join("");
4353-  }
4354-
4355-
--
4363-
4364-  
4365-function aicmGetManagerMajorRowsForSelectedCompany(companyId) {
4366-    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: rows
4367-    var ctx = state && state.context ? state.context : {};
4368-    var selectedId = String(companyId || "");
4369-
--
4513-  }
4514-
4515-  function aicmLeaderHandoffOwnerIdR8S(payload) {
4516-    var p = payload && typeof payload === "object" ? payload : {};
4517-    if (p.owner_civilization_id) return aicmLeaderHandoffTextR8S(p.owner_civilization_id);
4518-    if (p.ownerCivilizationId) return aicmLeaderHandoffTextR8S(p.ownerCivilizationId);
4519-    if (state && state.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.ownerCivilizationId);
4520-    if (state && state.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.owner_civilization_id);
4521-    if (state && state.context && state.context.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.context.owner_civilization_id);
4522-    if (state && state.context && state.context.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.context.ownerCivilizationId);
4523-    if (typeof aicmHumanReviewOwnerId === "function") return aicmLeaderHandoffTextR8S(aicmHumanReviewOwnerId());
4524-    return "00000000-0000-4000-8000-000000000001";
4525-  }
4526-
4527-  function aicmLeaderHandoffActionTargetR8S(ev, btn) {
4528-    if (typeof aicmActionTargetSafe === "function") {
4529-      var safeTarget = aicmActionTargetSafe(ev, btn);
4530-      if (safeTarget && safeTarget.getAttribute) return safeTarget;
4531-    }
4532-
4533-    if (btn && btn.getAttribute) return btn;
4534-
4535-    if (ev && ev.target) {
4536-      if (ev.target.closest) {
4537:        var closest = ev.target.closest("[data-core-action]");
4538-        if (closest && closest.getAttribute) return closest;
4539-      }
4540-
4541-      if (ev.target.getAttribute) return ev.target;
4542-    }
4543-
4544-    return null;
4545-  }
4546-
4547-  function aicmLeaderHandoffMajorIdFromTargetR8S(target) {
4548-    if (!target || !target.getAttribute) return "";
4549-    return aicmLeaderHandoffTextR8S(
4550-      target.getAttribute("data-major-id") ||
4551-      target.getAttribute("data-pmlw-major-id") ||
4552-      target.getAttribute("data-manager-major-id") ||
4553-      ""
4554-    );
4555-  }
4556-
4557-  function aicmFindMajorForLeaderHandoffR8S(majorId) {
4558-    var id = aicmLeaderHandoffTextR8S(majorId);
4559-    if (!id) return null;
4560-
4561-    if (typeof aicmAxuR1FindMajorById === "function") {
--
4647-      }, 50);
4648-    } catch (error) {
4649-      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4650-      render();
4651-    }
4652-  }
4653-
4654-  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
4655-    var payload = state.managerMajorLeaderHandoffConfirm || null;
4656-    if (!payload) return "";
4657-
4658-    return [
4659-      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
4660-      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671:      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672:      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678-  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679-    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681-    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685-  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
4693-    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4694-    return parts.join(" / ");
4695-  }
--
5000-        '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(displayNo)) + '</p>',
5001-        '  <h3>' + escapeHtml(summary.title) + '</h3>',
5002-        summary.description ? '  <p class="aicm-selected-note">' + escapeHtml(summary.description) + '</p>' : '',
5003-        '  <dl class="aicm-core-detail-list">',
5004-        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
5005-        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
5006-        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
5007-        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
5008-        '  </dl>',
5009-        '  <div class="aicm-dashboard-action-row">',
5010:        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
5011:        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
5012-        '  </div>',
5013-        '</article>'
5014-      ].join("");
5015-    }).join("");
5016-
5017-    return [
5018-      confirmCard,
5019-      pager,
5020-      '<div class="aicm-manager-major-list">',

---- aicmLeaderHandoff functions ----
4485-      handoff === "deleted" ||
4486-      handoff === "cancelled" ||
4487-      handoff === "canceled" ||
4488-      handoff === "sent" ||
4489-      handoff === "handed_off" ||
4490-      handoff === "completed" ||
4491-      handoff === "done"
4492-    ) {
4493-      return false;
4494-    }
4495-
4496-    if (
4497-      decomposition === "completed" ||
4498-      decomposition === "complete" ||
4499-      decomposition === "done"
4500-    ) {
4501-      return false;
4502-    }
4503-
4504-    return true;
4505-  }
4506-// AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER_END
4507-
4508-
4509:  // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_START
4510:  function aicmLeaderHandoffTextR8S(value) {
4511-    if (value === null || typeof value === "undefined") return "";
4512-    return String(value).trim();
4513-  }
4514-
4515:  function aicmLeaderHandoffOwnerIdR8S(payload) {
4516-    var p = payload && typeof payload === "object" ? payload : {};
4517:    if (p.owner_civilization_id) return aicmLeaderHandoffTextR8S(p.owner_civilization_id);
4518:    if (p.ownerCivilizationId) return aicmLeaderHandoffTextR8S(p.ownerCivilizationId);
4519:    if (state && state.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.ownerCivilizationId);
4520:    if (state && state.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.owner_civilization_id);
4521:    if (state && state.context && state.context.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.context.owner_civilization_id);
4522:    if (state && state.context && state.context.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.context.ownerCivilizationId);
4523:    if (typeof aicmHumanReviewOwnerId === "function") return aicmLeaderHandoffTextR8S(aicmHumanReviewOwnerId());
4524-    return "00000000-0000-4000-8000-000000000001";
4525-  }
4526-
4527:  function aicmLeaderHandoffActionTargetR8S(ev, btn) {
4528-    if (typeof aicmActionTargetSafe === "function") {
4529-      var safeTarget = aicmActionTargetSafe(ev, btn);
4530-      if (safeTarget && safeTarget.getAttribute) return safeTarget;
4531-    }
4532-
4533-    if (btn && btn.getAttribute) return btn;
4534-
4535-    if (ev && ev.target) {
4536-      if (ev.target.closest) {
4537-        var closest = ev.target.closest("[data-core-action]");
4538-        if (closest && closest.getAttribute) return closest;
4539-      }
4540-
4541-      if (ev.target.getAttribute) return ev.target;
4542-    }
4543-
4544-    return null;
4545-  }
4546-
4547:  function aicmLeaderHandoffMajorIdFromTargetR8S(target) {
4548-    if (!target || !target.getAttribute) return "";
4549:    return aicmLeaderHandoffTextR8S(
4550-      target.getAttribute("data-major-id") ||
4551-      target.getAttribute("data-pmlw-major-id") ||
4552-      target.getAttribute("data-manager-major-id") ||
4553-      ""
4554-    );
4555-  }
4556-
4557-  function aicmFindMajorForLeaderHandoffR8S(majorId) {
4558:    var id = aicmLeaderHandoffTextR8S(majorId);
4559-    if (!id) return null;
4560-
4561-    if (typeof aicmAxuR1FindMajorById === "function") {
4562-      var found = aicmAxuR1FindMajorById(id);
4563-      if (found) return found;
4564-    }
4565-
4566-    var ctx = state && state.context ? state.context : {};
4567-    var rows = [];
4568-    function add(list) {
4569-      if (Array.isArray(list)) rows = rows.concat(list);
4570-    }
4571-
4572-    add(ctx.pmlw_major_items);
4573-    add(ctx.pmlwMajorItems);
4574-    add(ctx.manager_major_items);
4575-    add(ctx.managerMajorItems);
4576-    add(ctx.major_items);
4577-    add(ctx.majorItems);
4578-
4579-    for (var i = 0; i < rows.length; i += 1) {
4580-      var row = rows[i] || {};
4581:      var rowId = aicmLeaderHandoffTextR8S(
4582-        row.aicm_manager_major_work_item_id ||
4583-        row.manager_major_work_item_id ||
4584-        row.majorId ||
4585-        row.major_id ||
4586-        row.id
4587-      );
4588-      if (rowId === id) return row;
4589-    }
4590-
4591-    return null;
4592-  }
4593-
4594:  function aicmLeaderHandoffSummaryR8S(row) {
4595-    var base = null;
4596-    if (typeof aicmMajorItemSummaryR8O === "function") {
4597-      base = aicmMajorItemSummaryR8O(row);
4598-    }
4599-
4600-    var title = base && base.title ? base.title : (row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
4601-    var description = base && base.description ? base.description : (row && (row.major_item_description || row.task_description || row.note)) || "";
4602-    var due = base && base.due ? base.due : (row && row.due_date ? String(row.due_date) : "未設定");
4603-    var status = base && base.status ? base.status : ((row && row.handoff_status_code) || "draft");
4604:    var leaderRaw = aicmLeaderHandoffTextR8S(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label));
4605-    var leader = leaderRaw || "未設定（課へ引き継ぎ）";
4606-
4607-    return {
4608-      title: String(title),
4609-      description: String(description),
4610-      due: String(due),
4611-      status: String(status),
4612-      leader: String(leader),
4613-      leaderRaw: leaderRaw
4614-    };
4615-  }
4616-
4617-  function aicmOpenMajorLeaderHandoffConfirmR8S(ev, btn) {
4618-    try {
4619:      var target = aicmLeaderHandoffActionTargetR8S(ev, btn);
4620:      var majorId = aicmLeaderHandoffMajorIdFromTargetR8S(target);
4621-      if (!majorId) throw new Error("Manager大項目IDを特定できません。");
4622-
4623-      var row = aicmFindMajorForLeaderHandoffR8S(majorId);
4624-      if (!row) throw new Error("Manager大項目を特定できません。");
4625-
4626:      var summary = aicmLeaderHandoffSummaryR8S(row);
4627-
4628-      state.managerMajorLeaderHandoffConfirm = {
4629-        majorId: majorId,
4630-        title: summary.title,
4631-        description: summary.description,
4632-        leader: summary.leader,
4633-        leaderRaw: summary.leaderRaw,
4634-        due: summary.due,
4635-        status: summary.status
4636-      };
4637-
4638-      state.screen = "task-ledger";
4639-      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
4640-      render();
4641-
4642-      setTimeout(function () {
4643-        try {
4644-          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");
4645-          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
4646-        } catch (_) {}
4647-      }, 50);
4648-    } catch (error) {
4649-      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4650-      render();
--
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678-  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679-    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681-    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685:  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
4693-    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4694-    return parts.join(" / ");
4695-  }
4696-
4697-  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {
4698-    var payload = state.managerMajorLeaderHandoffConfirm || null;
4699-    if (!payload || !payload.majorId) {
4700-      setMessage("error", "課長へ送る対象がありません。");
4701-      render();
4702-      return;
4703-    }
4704-
4705:    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
4706-    if (!ownerCivilizationId) {
4707-      setMessage("error", "owner_civilization_idを特定できません。");
4708-      render();
4709-      return;
4710-    }
4711-
4712-    try {
4713-      var body = {
4714-        owner_civilization_id: ownerCivilizationId,
4715-        aicm_manager_major_work_item_id: payload.majorId,
4716-        decomposition_status_code: "assigned_to_leader",
4717-        handoff_status_code: "handed_off"
4718-      };
4719-
4720-      if (payload.leaderRaw) {
4721-        body.assigned_leader_label = payload.leaderRaw;
4722-      }
4723-
4724-      var response = await fetch("/api/aicm/v2/manager-major/update", {
4725-        method: "POST",
4726-        headers: {
4727-          "content-type": "application/json"
4728-        },
4729-        body: JSON.stringify(body)
4730-      });
4731-
4732-      var rawText = await response.text();
4733-      var json = null;
4734-      try {
4735-        json = rawText ? JSON.parse(rawText) : null;
4736-      } catch (_) {
4737-        json = null;
4738-      }
4739-
4740-      if (!response.ok || (json && json.result && json.result !== "ok")) {
4741:        throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));
4742-      }
4743-
4744-      state.managerMajorLeaderHandoffConfirm = null;
4745-      state.screen = "task-ledger";
4746-      setMessage("ok", "課長へ送信しました。");
4747-
4748-      if (typeof aicmReloadTaskLedgerContext === "function") {
4749-        
4750-      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_START
4751-      var aicmR8zBMajorIdForAuto = "";
4752-      try {
4753-        aicmR8zBMajorIdForAuto = aicmR8ZBText(
4754-          (payload && (payload.majorId || payload.aicm_manager_major_work_item_id || payload.manager_major_work_item_id)) || ""
4755-        );
4756-      } catch (_) {
4757-        aicmR8zBMajorIdForAuto = "";
4758-      }
4759-
4760-      var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);
4761-      var aicmR8zIWorkerAutoResult = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto);
4762-      if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
4763-        setMessage("ok", aicmWorkerAutoExecutionMessageR8ZI(aicmR8zIWorkerAutoResult));
4764-      }
4765-      if (aicmR8zBAutoResult && aicmR8zBAutoResult.ok) {
4766-        setMessage("ok", aicmR8zBAutoResult.message || "課長へ送信し、Leader自動分解を実行しました。");
4767-      } else {
4768-        setMessage(
4769-          "error",
4770-          "課長へ送信しましたが、Leader自動分解に失敗しました: " +
4771-          (aicmR8zBAutoResult && aicmR8zBAutoResult.message ? aicmR8zBAutoResult.message : "原因不明")
4772-        );
4773-      }
4774-      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_END
4775-
4776-await aicmReloadTaskLedgerContext();
4777-      } else {
4778-        render();
4779-      }
4780-    } catch (error) {
4781-      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
4782-      render();
4783-    }
4784-  }
4785:// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_HELPER_END
4786-
4787-
4788-// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_START
4789-  function aicmMajorItemPageSizeR8O() {
4790-    return 20;
4791-  }
4792-
4793-  function aicmMajorItemCurrentPageR8O(totalRows) {
4794-    var pageSize = aicmMajorItemPageSizeR8O();
4795-    var total = Number(totalRows || 0);
4796-    var totalPages = Math.max(1, Math.ceil(total / pageSize));
4797-    var page = Number(state.managerMajorPage || 1);
4798-
4799-    if (!Number.isFinite(page) || page < 1) page = 1;
4800-    if (page > totalPages) page = totalPages;
4801-
4802-    state.managerMajorPage = page;
4803-    return page;
4804-  }
4805-
4806-  function aicmMajorItemSetPageR8O(delta) {
4807-    var current = Number(state.managerMajorPage || 1);
4808-    if (!Number.isFinite(current) || current < 1) current = 1;
4809-    state.managerMajorPage = current + Number(delta || 0);
--
8367-
8368-    
8369-
8370-
8371-    
8372-// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_START
8373-    if (action === "task-ledger-open") {
8374-      aicmOpenTaskLedgerScreenR8V3Clean();
8375-      return;
8376-    }
8377-// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_ACTION_HANDLER_END
8378-
8379-    
8380-// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_START
8381-    if (action === "pmlw-major-page-prev") {
8382-      aicmMoveMajorItemPageFromActionR8V7C2(-1);
8383-      return;
8384-    }
8385-
8386-    if (action === "pmlw-major-page-next") {
8387-      aicmMoveMajorItemPageFromActionR8V7C2(1);
8388-      return;
8389-    }
8390-
8391:    // AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_START
8392-    if (action === "pmlw-major-leader-handoff") {
8393-      aicmOpenMajorLeaderHandoffConfirmR8S(event, button);
8394-      return;
8395-    }
8396-
8397-    if (action === "pmlw-major-leader-handoff-cancel") {
8398-      aicmCancelMajorLeaderHandoffConfirmR8S();
8399-      return;
8400-    }
8401-
8402-    if (action === "pmlw-major-leader-handoff-execute") {
8403-      aicmExecuteMajorLeaderHandoffConfirmR8S();
8404-      return;
8405-    }
8406:// AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW_ACTION_HANDLER_END
8407-
8408-    if (action === "pmlw-major-delete-open") {
8409-      aicmOpenMajorDeleteConfirmFromActionR8V7C2(event, button);
8410-      return;
8411-    }
8412-
8413-    if (action === "pmlw-major-delete-cancel") {
8414-      aicmCancelMajorDeleteConfirmFromActionR8V7C2();
8415-      return;
8416-    }
8417-
8418-    if (action === "pmlw-major-delete-execute") {
8419-      aicmExecuteMajorDeleteConfirmFromActionR8V7C2();
8420-      return;
8421-    }
8422-// AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER_ACTION_HANDLER_END
8423-
8424-    // AICM_R8T_LEADER_INBOX_DISPLAY_ACTION_HANDLER_START
8425-    if (action === "leader-inbox-middle-breakdown-open") {
8426-      setMessage("ok", "中項目分解は次工程で実装します。まずLeader受信箱の表示を確認してください。");
8427-      render();
8428-      return;
8429-    }
8430-// AICM_R8T_LEADER_INBOX_DISPLAY_ACTION_HANDLER_END
HANDLER_REF_COUNT=40
STATE_ASSIGN_COUNT=3
RENDER_AFTER_ASSIGN_COUNT=9

============================================================
8. task-ledger render insertion scan
============================================================
---- renderTaskLedgerPlaceholder nearby ----
4921-      var response = await fetch("/api/aicm/v2/manager-major/archive", {
4922-        method: "POST",
4923-        headers: {
4924-          "content-type": "application/json"
4925-        },
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
4959-      // AICM_R8Z_V9D1_IS_PENDING_MAJOR_SCOPE_CALLSITE_FIX: use existing visible canonical helper, not the scope-local isPendingMajor
4960-      if (typeof aicmIsPendingManagerMajorRowR8V6 === "function") {
4961-        return aicmIsPendingManagerMajorRowR8V6(row);
4962-      }
4963-      return !!row;
4964-    });
4965-
4966-    var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();
4967-
4968-    if (!pendingRows.length) {
4969-      return [
4970-        confirmCard,
4971-        '<div class="aicm-core-empty">',
4972-        '  <strong>登録済み大項目はまだありません</strong>',
4973-        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
4974-        '</div>'
4975-      ].join("");
4976-    }
4977-
4978-    var pageSize = aicmMajorItemPageSizeR8O();
4979-    var totalRows = pendingRows.length;
4980-    var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
4981-    var page = aicmMajorItemCurrentPageR8O(totalRows);
4982-    var start = (page - 1) * pageSize;
4983-    var pageRows = pendingRows.slice(start, start + pageSize);
4984-
4985-    var pager = [
4986-      '<div class="aicm-dashboard-action-row">',
4987-      '  <button type="button" data-core-action="pmlw-major-page-prev"' + (page <= 1 ? ' disabled' : '') + '>前ページ</button>',
4988-      '  <span class="aicm-selected-note">ページ ' + escapeHtml(String(page)) + ' / ' + escapeHtml(String(totalPages)) + '　表示 ' + escapeHtml(String(start + 1)) + '-' + escapeHtml(String(start + pageRows.length)) + ' / ' + escapeHtml(String(totalRows)) + '件</span>',
4989-      '  <button type="button" data-core-action="pmlw-major-page-next"' + (page >= totalPages ? ' disabled' : '') + '>次ページ</button>',
4990-      '</div>'
4991-    ].join("");
--
5544-    }).join("");
5545-
5546-    var more = rows.length > limit ? '<p class="aicm-selected-note">表示は先頭' + escapeHtml(String(limit)) + '件です。全件確認は次工程で詳細画面化します。</p>' : '';
5547-
5548-    return [
5549-      '<div class="aicm-ledger-list">',
5550-      cards,
5551-      '</div>',
5552-      more
5553-    ].join("");
5554-  }
5555-
5556-  function aicmRenderManagerMajorSummaryDetailR8U(summary) {
5557-    var filter = aicmSummaryTextR8U(state && state.managerMajorSummaryFilterR8U);
5558-    if (!filter) {
5559-      return '<p class="aicm-selected-note">件数カードを押すと、その分類の詳細をここで確認できます。</p>';
5560-    }
5561-
5562-    var bucket = summary.map[filter] || summary.map.other;
5563-    var label = bucket ? bucket.label : "詳細";
5564-    var rows = bucket ? bucket.rows : [];
5565-
5566-    return [
5567-      '<section class="aicm-core-card" style="border:1px solid #c7d2fe;">',
5568-      '  <p class="aicm-eyebrow">サマリ詳細</p>',
5569-      '  <h3>' + escapeHtml(label) + ' の詳細</h3>',
5570-      '  <p class="aicm-selected-note">対象: <strong>' + escapeHtml(String(rows.length)) + '件</strong></p>',
5571-      '  <div class="aicm-dashboard-action-row">',
5572-      '    <button type="button" data-core-action="manager-major-summary-filter-clear">詳細表示を閉じる</button>',
5573-      '  </div>',
5574-      aicmRenderManagerMajorSummaryDetailRowsR8U(rows, label),
5575-      '</section>'
5576-    ].join("");
5577-  }
5578-
5579:  function aicmRenderManagerMajorSummarySectionR8U() {
5580-    var summary = aicmManagerMajorSummaryCountsR8U();
5581-    var cards = summary.buckets.map(function (bucket) {
5582-      var selected = aicmSummaryTextR8U(state && state.managerMajorSummaryFilterR8U) === bucket.code;
5583-      return [
5584-        '<button type="button" data-core-action="manager-major-summary-filter" data-summary-filter="' + escapeHtml(bucket.code) + '" style="text-align:left;display:block;">',
5585-        '  <span style="display:block;font-size:12px;color:#64748b;font-weight:900;">' + escapeHtml(bucket.label) + '</span>',
5586-        '  <strong style="display:block;font-size:24px;margin-top:4px;">' + escapeHtml(String(bucket.count)) + '件</strong>',
5587-        '  <span style="display:block;font-size:12px;margin-top:4px;color:#64748b;">' + escapeHtml(selected ? "選択中" : bucket.note) + '</span>',
5588-        '</button>'
5589-      ].join("");
5590-    }).join("");
5591-
5592-    return [
5593-      '<section class="aicm-core-card">',
5594-      '  <p class="aicm-eyebrow">Manager大項目サマリ</p>',
5595-      '  <h2>大項目 件数サマリ</h2>',
5596-      '  <p class="aicm-selected-note">Manager大項目から現在の状態別件数を表示します。件数カードを押すと詳細を確認できます。</p>',
5597-      '  <p class="aicm-selected-note">合計: <strong>' + escapeHtml(String(summary.total)) + '件</strong></p>',
5598-      '  <div class="aicm-dashboard-action-row">',
5599-      cards,
5600-      '  </div>',
5601-      aicmRenderManagerMajorSummaryDetailR8U(summary),
5602-      '</section>'
5603-    ].join("");
5604-  }
5605-
5606-  function aicmManagerMajorSummaryActionTargetR8U(ev, btn) {
5607-    if (typeof aicmActionTargetSafe === "function") {
5608-      var safeTarget = aicmActionTargetSafe(ev, btn);
5609-      if (safeTarget && safeTarget.getAttribute) return safeTarget;
5610-    }
5611-
5612-    if (btn && btn.getAttribute) return btn;
5613-
5614-    if (ev && ev.target && ev.target.closest) {
--
5732-
5733-    var limit = 5;
5734-    var visible = rows.slice(0, limit);
5735-    var cards = visible.map(function (row, index) {
5736-      var title = aicmLeaderAutoTextR8W(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";
5737-      var description = aicmLeaderAutoTextR8W(row && (row.major_item_description || row.task_description || row.note));
5738-      var leader = aicmLeaderAutoTextR8W(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "自動割当";
5739-      var due = aicmLeaderAutoTextR8W(row && row.due_date) || "未設定";
5740-      var status = aicmLeaderAutoFlowStatusLabelR8W(row);
5741-
5742-      return [
5743-        '<article class="aicm-ledger-row">',
5744-        '  <p class="aicm-eyebrow">自動処理対象 #' + escapeHtml(String(index + 1)) + '</p>',
5745-        '  <h3>' + escapeHtml(title) + '</h3>',
5746-        description ? '  <p class="aicm-selected-note">' + escapeHtml(description) + '</p>' : '',
5747-        '  <dl class="aicm-ledger-meta">',
5748-        '    <div><dt>自動状態</dt><dd>' + escapeHtml(status) + '</dd></div>',
5749-        '    <div><dt>課長/Leader</dt><dd>' + escapeHtml(leader) + '</dd></div>',
5750-        '    <div><dt>優先度</dt><dd>' + escapeHtml(aicmLeaderAutoPriorityLabelR8W(row && row.priority_code)) + '</dd></div>',
5751-        '    <div><dt>期限</dt><dd>' + escapeHtml(due) + '</dd></div>',
5752-        '  </dl>',
5753-        '</article>'
5754-      ].join("");
5755-    }).join("");
5756-
5757-    var more = rows.length > limit ? '<p class="aicm-selected-note">ほか ' + escapeHtml(String(rows.length - limit)) + '件はサマリ詳細で確認できます。</p>' : '';
5758-
5759-    return [
5760-      '<div class="aicm-ledger-list">',
5761-      cards,
5762-      '</div>',
5763-      more
5764-    ].join("");
5765-  }
5766-
5767:  function aicmRenderLeaderAutoFlowStatusR8W() {
5768-    var rows = aicmLeaderAutoFlowRowsR8W();
5769-
5770-    return [
5771-      '<section class="aicm-core-card">',
5772-      '  <p class="aicm-eyebrow">Leader以降自動処理</p>',
5773-      '  <h2>課長以降は自動処理</h2>',
5774-      '  <p class="aicm-selected-note">課長へ送ったManager大項目は、ユーザー操作なしでLeader分解・Worker展開へ進む前提です。ここでは自動処理対象の状態だけを確認します。</p>',
5775-      '  <p class="aicm-selected-note">自動分解対象: <strong>' + escapeHtml(String(rows.length)) + '件</strong></p>',
5776-      aicmRenderLeaderAutoFlowRowsR8W(rows),
5777-      '</section>'
5778-    ].join("");
5779-  }
5780-// AICM_R8W_LEADER_AUTO_FLOW_DISPLAY_HELPER_END
5781-
5782-// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_START
5783-  function aicmR8ZBText(value) {
5784-    if (value === null || typeof value === "undefined") return "";
5785-    return String(value).trim();
5786-  }
5787-
5788-  function aicmR8ZBOwnerId() {
5789-    if (state && state.ownerCivilizationId) return aicmR8ZBText(state.ownerCivilizationId);
5790-    if (state && state.owner_civilization_id) return aicmR8ZBText(state.owner_civilization_id);
5791-    if (state && state.context && state.context.owner_civilization_id) return aicmR8ZBText(state.context.owner_civilization_id);
5792-    if (typeof aicmHumanReviewOwnerId === "function") {
5793-      try {
5794-        var ownerFromReview = aicmHumanReviewOwnerId();
5795-        if (ownerFromReview) return aicmR8ZBText(ownerFromReview);
5796-      } catch (_) {}
5797-    }
5798-    return "00000000-0000-4000-8000-000000000001";
5799-  }
5800-
5801-  function aicmR8ZBCompanyId() {
5802-    if (state && state.selectedCompanyId) return aicmR8ZBText(state.selectedCompanyId);
--
5921-      headers: {
5922-        "content-type": "application/json"
5923-      },
5924-      body: JSON.stringify(body)
5925-    });
5926-
5927-    var json = null;
5928-    try {
5929-      json = await response.json();
5930-    } catch (_) {
5931-      json = null;
5932-    }
5933-
5934-    if (!response.ok || (json && json.result && json.result !== "ok")) {
5935-      throw new Error(json && (json.error_message || json.message || json.error) ? (json.error_message || json.message || json.error) : "Worker自動実行に失敗しました。");
5936-    }
5937-
5938-    return json || {};
5939-  }
5940-
5941-  function aicmWorkerAutoExecutionMessageR8ZI(result) {
5942-    var executed = result && typeof result.executed_count !== "undefined" ? Number(result.executed_count || 0) : 0;
5943-    var failed = result && typeof result.failed_count !== "undefined" ? Number(result.failed_count || 0) : 0;
5944-
5945-    if (failed > 0) {
5946-      return "Leader自動分解後、Worker自動実行で一部エラーがありました。成功 " + String(executed) + "件 / 失敗 " + String(failed) + "件。";
5947-    }
5948-
5949-    return "Leader自動分解後、Worker自動実行requestを " + String(executed) + "件作成しました。";
5950-  }
5951-// AICM_R8Z_I_WORKER_AUTO_EXECUTION_CORE_END
5952-
5953-// AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_END
5954-
5955-
5956:function renderTaskLedgerPlaceholder() {
5957-    // AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: screen
5958-    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
5959-    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
5960-    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);
5961-    
5962-
5963-    // AICM_R8V_REMOVE_LEADER_INBOX_UI_START
5964-  // Leader受信箱 routine section removed.
5965-  // Manager大項目サマリの Leader受信済み 件数/詳細を正面表示として使う。
5966-// AICM_R8V_REMOVE_LEADER_INBOX_UI_END
5967-return renderShell([
5968-      '<section class="aicm-core-card">',
5969-      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
5970-      '  <h2>部門別タスク台帳</h2>',
5971-      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
5972-      '  <p class="aicm-selected-note">未実行のManager大項目だけをDB/contextから表示します。CSV取り込みは部長/Manager分解済み大項目の新規追加です。</p>',
5973-'  <div class="aicm-dashboard-action-row">',
5974-      '    <button type="button" data-core-action="task-ledger-refresh">登録済み大項目をリロード</button>',
5975-      '  </div>',
5976-      '</section>',
5977:      aicmRenderManagerMajorSummarySectionR8U(),
5978:      aicmRenderLeaderAutoFlowStatusR8W(),
5979-      renderCsvImportCard(company),
5980-      '<section class="aicm-core-card">',
5981-      '  <p class="aicm-eyebrow">Manager大項目</p>',
5982-      '  <h2>登録済み大項目</h2>',
5983:      aicmRenderManagerMajorRows(rows),
5984-      '</section>'
5985-    ].join(""));
5986-  }
5987-// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_START
5988-  function aicmR8ZCText(value) {
5989-    if (value === null || typeof value === "undefined") return "";
5990-    return String(value).trim();
5991-  }
5992-
5993-  function aicmR8ZCHtml(value) {
5994-    if (typeof escapeHtml === "function") return escapeHtml(aicmR8ZCText(value));
5995-    return aicmR8ZCText(value)
5996-      .replace(/&/g, "&amp;")
5997-      .replace(/</g, "&lt;")
5998-      .replace(/>/g, "&gt;")
5999-      .replace(/"/g, "&quot;")
6000-      .replace(/'/g, "&#39;");
6001-  }
6002-
6003-  function aicmR8ZCContextArray(names) {
6004-    var ctx = state && state.context && typeof state.context === "object" ? state.context : {};
6005-
6006-    for (var i = 0; i < names.length; i += 1) {
6007-      var key = names[i];
6008-
6009-      if (Array.isArray(ctx[key])) return ctx[key];
6010-      if (Array.isArray(state && state[key])) return state[key];
6011-    }
6012-
6013-    return [];
6014-  }
6015-
6016-  function aicmR8ZCSelectedCompanyId() {
6017-    if (state && state.selectedCompanyId) return aicmR8ZCText(state.selectedCompanyId);
6018-
--
6164-      '</section>'
6165-    ].join("");
6166-  }
6167-
6168-  function aicmInjectPmlwAutoOutputsPanelR8ZC(html) {
6169-    var panel = aicmRenderPmlwAutoOutputsPanelR8ZC();
6170-    var source = String(html || "");
6171-
6172-    // AICM_R8Z_C2_OUTPUT_PANEL_POSITION_V1
6173-    // Prefer showing this directly after Manager大項目サマリ and before CSV/import/list sections.
6174-    var anchors = [
6175-      '<section class="aicm-core-card aicm-csv-panel">',
6176-      '<section class="aicm-core-card"><p class="aicm-eyebrow">Manager大項目</p>',
6177-      '<section class="aicm-core-card">\n  <p class="aicm-eyebrow">Manager大項目</p>',
6178-      '<p class="aicm-eyebrow">CSV取り込み</p>'
6179-    ];
6180-
6181-    for (var i = 0; i < anchors.length; i += 1) {
6182-      var anchor = anchors[i];
6183-      var index = source.indexOf(anchor);
6184-
6185-      if (index >= 0) {
6186-        return source.slice(0, index) + panel + source.slice(index);
6187-      }
6188-    }
6189-
6190-    if (source.indexOf('</main>') >= 0) {
6191-      return source.replace('</main>', panel + '</main>');
6192-    }
6193-
6194-    return source + panel;
6195-  }
6196-
6197-  var aicmRenderTaskLedgerPlaceholderBeforeR8ZC = renderTaskLedgerPlaceholder;
6198-
6199:  renderTaskLedgerPlaceholder = function renderTaskLedgerPlaceholder() {
6200-    return aicmInjectPmlwAutoOutputsPanelR8ZC(
6201-      aicmRenderTaskLedgerPlaceholderBeforeR8ZC()
6202-    );
6203-  };
6204-// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END
6205-
6206-
6207-// AICM_R8Z_N_WORKER_RUNTIME_STATUS_PANEL_START
6208-  function aicmR8ZNText(value) {
6209-    if (value === null || typeof value === "undefined") return "";
6210-    return String(value).trim();
6211-  }
6212-
6213-  function aicmR8ZNHtml(value) {
6214-    var text = aicmR8ZNText(value);
6215-    if (typeof escapeHtml === "function") return escapeHtml(text);
6216-    return text
6217-      .replace(/&/g, "&amp;")
6218-      .replace(/</g, "&lt;")
6219-      .replace(/>/g, "&gt;")
6220-      .replace(/"/g, "&quot;")
6221-      .replace(/'/g, "&#039;");
6222-  }
6223-
6224-  function aicmR8ZNMetadata(row) {
6225-    var meta = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
6226-    if (typeof meta === "string") {
6227-      try {
6228-        meta = JSON.parse(meta);
6229-      } catch (_) {
6230-        meta = {};
6231-      }
6232-    }
6233-    if (!meta || typeof meta !== "object") meta = {};
6234-    return meta;
--
8854-      '  <p class="aicm-selected-note">対象: <strong>' + aicmR8ZOEscape(String(rows.length)) + '件</strong></p>',
8855-      '  <div class="aicm-dashboard-action-row">',
8856-      '    <button type="button" data-core-action="manager-major-summary-filter-clear">詳細表示を閉じる</button>',
8857-      '  </div>',
8858-      body,
8859-      '</section>'
8860-    ].join("");
8861-  }
8862-
8863-  function aicmRenderManagerMajorSummaryPanelR8U() {
8864-    var majorRows = aicmR8ZOArray("pmlw_major_items", "managerMajorItems", "manager_major_items");
8865-    var workerRows = aicmR8ZOArray("pmlw_worker_work_units", "pmlwWorkerWorkUnits");
8866-    var majorCounts = aicmR8ZOCountBy(majorRows, aicmR8ZOMajorStatus);
8867-    var workerCounts = aicmR8ZOCountBy(workerRows, aicmR8ZOWorkerStatus);
8868-    var filter = state && state.managerMajorSummaryFilter ? String(state.managerMajorSummaryFilter) : "";
8869-
8870-    return [
8871-      '<section class="aicm-core-card aicm-manager-major-summary-card">',
8872-      '  <p class="aicm-eyebrow">本番サマリ</p>',
8873-      '  <h2>部門別タスク台帳サマリ</h2>',
8874-      '  <p class="aicm-selected-note">合計: <strong>' + aicmR8ZOEscape(String(majorRows.length)) + '件</strong> / Worker作業単位: <strong>' + aicmR8ZOEscape(String(workerRows.length)) + '件</strong></p>',
8875-      '  <div class="aicm-dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">',
8876-      aicmR8ZOSummaryButton("unhandoff", "未引き継ぎ", majorCounts.unhandoff || 0, "課長へ送る前"),
8877-      aicmR8ZOSummaryButton("auto_waiting", "自動処理待ち", majorCounts.auto_waiting || 0, "Leader以降の開始待ち"),
8878-      aicmR8ZOSummaryButton("manager_completed", "分解済み", majorCounts.manager_completed || 0, "Worker作業単位まで作成"),
8879-      aicmR8ZOSummaryButton("worker_running", "Worker実行中", workerCounts.worker_running || 0, "AIWorkerOS受付済み"),
8880-      aicmR8ZOSummaryButton("review_waiting", "レビュー待ち", workerCounts.review_waiting || 0, "承認待ちへ表示予定"),
8881-      aicmR8ZOSummaryButton("archived", "削除済み", majorCounts.archived || 0, "非表示・保管扱い"),
8882-      '  </div>',
8883-      '  <p class="aicm-selected-note">件数カードを押すと、その分類の詳細だけ確認できます。request_id などの開発者情報は通常表示しません。</p>',
8884-      aicmR8ZORenderDetail(filter),
8885-      '</section>'
8886-    ].join("");
8887-  }
8888-
8889:  function aicmRenderLeaderAutoFlowStatusR8W() {
8890-    return "";
8891-  }
8892-
8893-  function aicmRenderPmlwAutoOutputsPanelR8ZC() {
8894-    return "";
8895-  }
8896-
8897-  function aicmRenderR8ZNWorkerRuntimeStatusPanel() {
8898-    return "";
8899-  }
8900-// AICM_R8Z_O_PRODUCTION_SUMMARY_UI_END
8901-
8902-
8903-function handleRootChange(event) {
8904-    var field = event.target;
8905-    var fileKind = field.getAttribute("data-core-file") || "";
8906-    if (fileKind === "task-ledger-csv") {
8907-      aicmCsvReadSelectedFile(field);
8908-      return;
8909-    }
8910-
8911-    var fieldName = field.getAttribute("data-core-field") || "";
8912-
8913-    if (fieldName === "selectedCompanyId") {
8914-      setSelectedCompany(field.value);
8915-      render();
8916-      return;
8917-    }
8918-
8919-    if (fieldName === "selectedDepartmentId") {
8920-      setSelectedDepartment(field.value);
8921-      render();
8922-    }
8923-  }
8924-

---- confirm card insertion candidates ----
4105-  }
4106-
4107-function aicmAxuR1BuildLeaderHandoffPayload(row) {
4108-    row = row || {};
4109-
4110-    var majorId = aicmAxuR1MajorId(row);
4111-    var leaderLabel = aicmAxuR1LeaderLabel(row);
4112-
4113-    if (!majorId) {
4114-      throw new Error("Manager大項目IDを特定できません。");
4115-    }
4116-
4117-    if (!leaderLabel) {
4118-      throw new Error("課長/Leaderが未設定です。課変更でLeaderを設定するか、Manager大項目のLeader欄を設定してください。");
4119-    }
4120-
4121-    return {
4122-      kind: "manager-major-leader-handoff",
4123:      title: "課長へ送る確認",
4124-      endpoint: "/api/aicm/v2/manager-major/update",
4125-      backScreen: "task-ledger",
4126-      body: {
4127-        owner_civilization_id: aicmAxuR1OwnerId(),
4128-        aicm_manager_major_work_item_id: majorId,
4129-        assigned_leader_label: leaderLabel,
4130-        decomposition_status_code: "assigned_to_leader",
4131-        handoff_status_code: "handed_off",
4132-        note: aicmAxuR1Text(row.note)
4133-      }
4134-    };
4135-  }
4136-
4137-function aicmAxuR1ShowLeaderHandoffConfirm(payload) {
4138-    if (typeof aicmAvdShowDbConfirm === "function") {
4139-      aicmAvdShowDbConfirm(payload);
4140-      return;
4141-    }
--
4610-      due: String(due),
4611-      status: String(status),
4612-      leader: String(leader),
4613-      leaderRaw: leaderRaw
4614-    };
4615-  }
4616-
4617-  function aicmOpenMajorLeaderHandoffConfirmR8S(ev, btn) {
4618-    try {
4619-      var target = aicmLeaderHandoffActionTargetR8S(ev, btn);
4620-      var majorId = aicmLeaderHandoffMajorIdFromTargetR8S(target);
4621-      if (!majorId) throw new Error("Manager大項目IDを特定できません。");
4622-
4623-      var row = aicmFindMajorForLeaderHandoffR8S(majorId);
4624-      if (!row) throw new Error("Manager大項目を特定できません。");
4625-
4626-      var summary = aicmLeaderHandoffSummaryR8S(row);
4627-
4628:      state.managerMajorLeaderHandoffConfirm = {
4629-        majorId: majorId,
4630-        title: summary.title,
4631-        description: summary.description,
4632-        leader: summary.leader,
4633-        leaderRaw: summary.leaderRaw,
4634-        due: summary.due,
4635-        status: summary.status
4636-      };
4637-
4638-      state.screen = "task-ledger";
4639:      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
4640-      render();
4641-
4642-      setTimeout(function () {
4643-        try {
4644-          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");
4645-          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });
4646-        } catch (_) {}
4647-      }, 50);
4648-    } catch (error) {
4649:      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4650-      render();
4651-    }
4652-  }
4653-
4654:  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {
4655:    var payload = state.managerMajorLeaderHandoffConfirm || null;
4656-    if (!payload) return "";
4657-
4658-    return [
4659-      '<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">',
4660:      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4661-      '  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>',
4662-      '  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、その後Leader中項目/成果物要件/Worker作業単位を自動作成します。</p>',
4663-      '  <dl class="aicm-core-detail-list">',
4664-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4665-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4666-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4667-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4668-      '  </dl>',
4669-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4670-      '  <div class="aicm-dashboard-action-row">',
4671-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4672-      '    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>',
4673-      '  </div>',
4674-      '</section>'
4675-    ].join("");
4676-  }
4677-
4678-  function aicmCancelMajorLeaderHandoffConfirmR8S() {
4679:    state.managerMajorLeaderHandoffConfirm = null;
4680-    state.screen = "task-ledger";
4681-    setMessage("ok", "課長へ送るをキャンセルしました。");
4682-    render();
4683-  }
4684-
4685-  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {
4686-    var parts = [];
4687-    if (response && response.status) parts.push("HTTP " + response.status);
4688-    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));
4689-    if (json && json.error_message) parts.push(String(json.error_message));
4690-    if (json && json.error) parts.push(String(json.error));
4691-    if (json && json.message) parts.push(String(json.message));
4692-    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));
4693-    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4694-    return parts.join(" / ");
4695-  }
4696-
4697-  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {
4698:    var payload = state.managerMajorLeaderHandoffConfirm || null;
4699-    if (!payload || !payload.majorId) {
4700-      setMessage("error", "課長へ送る対象がありません。");
4701-      render();
4702-      return;
4703-    }
4704-
4705-    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);
4706-    if (!ownerCivilizationId) {
4707-      setMessage("error", "owner_civilization_idを特定できません。");
4708-      render();
4709-      return;
4710-    }
4711-
4712-    try {
4713-      var body = {
4714-        owner_civilization_id: ownerCivilizationId,
4715-        aicm_manager_major_work_item_id: payload.majorId,
4716-        decomposition_status_code: "assigned_to_leader",
--
4726-        headers: {
4727-          "content-type": "application/json"
4728-        },
4729-        body: JSON.stringify(body)
4730-      });
4731-
4732-      var rawText = await response.text();
4733-      var json = null;
4734-      try {
4735-        json = rawText ? JSON.parse(rawText) : null;
4736-      } catch (_) {
4737-        json = null;
4738-      }
4739-
4740-      if (!response.ok || (json && json.result && json.result !== "ok")) {
4741-        throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));
4742-      }
4743-
4744:      state.managerMajorLeaderHandoffConfirm = null;
4745-      state.screen = "task-ledger";
4746-      setMessage("ok", "課長へ送信しました。");
4747-
4748-      if (typeof aicmReloadTaskLedgerContext === "function") {
4749-        
4750-      // AICM_R8Z_B_LEADER_AUTO_DECOMPOSITION_CORE_CALL_START
4751-      var aicmR8zBMajorIdForAuto = "";
4752-      try {
4753-        aicmR8zBMajorIdForAuto = aicmR8ZBText(
4754-          (payload && (payload.majorId || payload.aicm_manager_major_work_item_id || payload.manager_major_work_item_id)) || ""
4755-        );
4756-      } catch (_) {
4757-        aicmR8zBMajorIdForAuto = "";
4758-      }
4759-
4760-      var aicmR8zBAutoResult = await aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(aicmR8zBMajorIdForAuto);
4761-      var aicmR8zIWorkerAutoResult = await aicmRunWorkerAutoExecutionAfterDecompositionR8ZI(aicmR8zBMajorIdForAuto);
4762-      if (typeof aicmWorkerAutoExecutionMessageR8ZI === "function") {
--
4834-  function aicmMajorItemSummaryR8O(row) {
4835-    var title = row && (row.major_item_name || row.deliverable_name || row.task_name) || "Manager大項目";
4836-    var description = row && (row.major_item_description || row.task_description || row.note) || "";
4837-    var leader = row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label) || "未設定";
4838-    var due = row && row.due_date ? String(row.due_date) : "未設定";
4839-    var priority = aicmMajorItemPriorityLabelR8O(row && row.priority_code);
4840-    var status = aicmMajorItemStatusLabelR8O(row);
4841-
4842-    return {
4843-      title: String(title),
4844-      description: String(description),
4845-      leader: String(leader),
4846-      due: String(due),
4847-      priority: String(priority),
4848-      status: String(status)
4849-    };
4850-  }
4851-
4852:  function aicmRenderMajorItemDeleteConfirmCardR8P() {
4853-    var payload = state.managerMajorDeleteConfirm || null;
4854-    if (!payload) return "";
4855-
4856-    return [
4857-      '<section class="aicm-core-card" style="border:2px solid #f97316;">',
4858-      '  <p class="aicm-eyebrow">削除確認</p>',
4859-      '  <h2>登録済み大項目を削除しますか？</h2>',
4860-      '  <p class="aicm-selected-note">この操作は確認後にDBへ保存されます。物理DELETEではなく、既存APIで削除済み扱いにします。</p>',
4861-      '  <dl class="aicm-core-detail-list">',
4862-      '    <dt>大項目</dt><dd>' + escapeHtml(payload.title || "") + '</dd>',
4863-      '    <dt>課長/Leader</dt><dd>' + escapeHtml(payload.leader || "未設定") + '</dd>',
4864-      '    <dt>状態</dt><dd>' + escapeHtml(payload.status || "") + '</dd>',
4865-      '    <dt>期限</dt><dd>' + escapeHtml(payload.due || "未設定") + '</dd>',
4866-      '  </dl>',
4867-      payload.description ? '<p class="aicm-selected-note">' + escapeHtml(payload.description) + '</p>' : '',
4868-      '  <div class="aicm-dashboard-action-row">',
4869-      '    <button type="button" data-core-action="pmlw-major-delete-execute">削除を確定</button>',
4870-      '    <button type="button" data-core-action="pmlw-major-delete-cancel">キャンセル</button>',
--
4948-      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");
4949-      render();
4950-    }
4951-  }
4952-// AICM_R8O_R8P_R8Q_MAJOR_ITEM_PAGING_DELETE_PROMPT_V1_END
4953-
4954-
4955-  
4956-function aicmRenderManagerMajorRows(rows) {
4957-    var sourceRows = Array.isArray(rows) ? rows : [];
4958-    var pendingRows = sourceRows.filter(function (row) {
4959-      // AICM_R8Z_V9D1_IS_PENDING_MAJOR_SCOPE_CALLSITE_FIX: use existing visible canonical helper, not the scope-local isPendingMajor
4960-      if (typeof aicmIsPendingManagerMajorRowR8V6 === "function") {
4961-        return aicmIsPendingManagerMajorRowR8V6(row);
4962-      }
4963-      return !!row;
4964-    });
4965-
4966:    var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();
4967-
4968-    if (!pendingRows.length) {
4969-      return [
4970:        confirmCard,
4971-        '<div class="aicm-core-empty">',
4972-        '  <strong>登録済み大項目はまだありません</strong>',
4973-        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
4974-        '</div>'
4975-      ].join("");
4976-    }
4977-
4978-    var pageSize = aicmMajorItemPageSizeR8O();
4979-    var totalRows = pendingRows.length;
4980-    var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
4981-    var page = aicmMajorItemCurrentPageR8O(totalRows);
4982-    var start = (page - 1) * pageSize;
4983-    var pageRows = pendingRows.slice(start, start + pageSize);
4984-
4985-    var pager = [
4986-      '<div class="aicm-dashboard-action-row">',
4987-      '  <button type="button" data-core-action="pmlw-major-page-prev"' + (page <= 1 ? ' disabled' : '') + '>前ページ</button>',
4988-      '  <span class="aicm-selected-note">ページ ' + escapeHtml(String(page)) + ' / ' + escapeHtml(String(totalPages)) + '　表示 ' + escapeHtml(String(start + 1)) + '-' + escapeHtml(String(start + pageRows.length)) + ' / ' + escapeHtml(String(totalRows)) + '件</span>',
--
5000-        '  <p class="aicm-eyebrow">Manager大項目 #' + escapeHtml(String(displayNo)) + '</p>',
5001-        '  <h3>' + escapeHtml(summary.title) + '</h3>',
5002-        summary.description ? '  <p class="aicm-selected-note">' + escapeHtml(summary.description) + '</p>' : '',
5003-        '  <dl class="aicm-core-detail-list">',
5004-        '    <dt>課長/Leader</dt><dd>' + escapeHtml(summary.leader) + '</dd>',
5005-        '    <dt>優先度</dt><dd>' + escapeHtml(summary.priority) + '</dd>',
5006-        '    <dt>期限</dt><dd>' + escapeHtml(summary.due) + '</dd>',
5007-        '    <dt>状態</dt><dd>' + escapeHtml(summary.status) + '</dd>',
5008-        '  </dl>',
5009-        '  <div class="aicm-dashboard-action-row">',
5010-        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
5011-        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
5012-        '  </div>',
5013-        '</article>'
5014-      ].join("");
5015-    }).join("");
5016-
5017-    return [
5018:      confirmCard,
5019-      pager,
5020-      '<div class="aicm-manager-major-list">',
5021-      cards,
5022-      '</div>',
5023-      pager
5024-    ].join("");
5025-  }
5026-
5027-    function aicmRenderTaskLedgerSafeR8V4(sourceLabel) {
5028-    state.screen = "task-ledger";
5029-
5030-    try {
5031-      if (!root) return;
5032-
5033-      var html = renderTaskLedgerPlaceholder();
5034-      root.innerHTML = html;
5035-
5036-      return true;
--
5820-    var createdRequirement = Number(json.created_deliverable_requirement_count || 0);
5821-    var createdWorker = Number(json.created_worker_work_unit_count || 0);
5822-    var skipped = Number(json.skipped_count || 0);
5823-
5824-    if (createdMiddle || createdRequirement || createdWorker) {
5825-      return "課長へ送信し、Leader中項目/成果物要件/Worker作業単位を自動作成しました。";
5826-    }
5827-
5828-    if (skipped) {
5829-      return "課長へ送信しました。Leader自動分解は既存データがあるためスキップしました。";
5830-    }
5831-
5832-    return "課長へ送信しました。Leader自動分解の対象はありませんでした。";
5833-  }
5834-
5835-  async function aicmRunLeaderAutoDecompositionAfterHandoffR8ZB(majorId) {
5836-    var safeMajorId = aicmR8ZBText(majorId);
5837-
5838:    if (!safeMajorId && state && state.managerMajorLeaderHandoffConfirm) {
5839-      safeMajorId = aicmR8ZBText(
5840:        state.managerMajorLeaderHandoffConfirm.majorId ||
5841:        state.managerMajorLeaderHandoffConfirm.aicm_manager_major_work_item_id ||
5842:        state.managerMajorLeaderHandoffConfirm.manager_major_work_item_id
5843-      );
5844-    }
5845-
5846-    var companyId = aicmR8ZBCompanyId();
5847-    var ownerId = aicmR8ZBOwnerId();
5848-
5849-    if (!safeMajorId) {
5850-      return {
5851-        ok: false,
5852-        message: "Leader自動分解対象のManager大項目IDを特定できません。"
5853-      };
5854-    }
5855-
5856-    if (!companyId) {
5857-      return {
5858-        ok: false,
5859-        message: "Leader自動分解対象のAI企業IDを特定できません。"
5860-      };
TASK_LEDGER_RENDER_COUNT=2
CONFIRM_CARD_INSERTION_COUNT=23

============================================================
9. V9/V9E review-list side-effect scan
============================================================
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
4956-function aicmRenderManagerMajorRows(rows) {
4957-    var sourceRows = Array.isArray(rows) ? rows : [];
4958-    var pendingRows = sourceRows.filter(function (row) {
4959:      // AICM_R8Z_V9D1_IS_PENDING_MAJOR_SCOPE_CALLSITE_FIX: use existing visible canonical helper, not the scope-local isPendingMajor
4960-      if (typeof aicmIsPendingManagerMajorRowR8V6 === "function") {
4961-        return aicmIsPendingManagerMajorRowR8V6(row);
4962-      }
4963-      return !!row;
4964-    });
4965-
4966-    var confirmCard = aicmRenderMajorItemDeleteConfirmCardR8P();
4967-
4968-    if (!pendingRows.length) {
4969-      return [
4970-        confirmCard,
4971-        '<div class="aicm-core-empty">',
4972-        '  <strong>登録済み大項目はまだありません</strong>',
4973-        '  <p>CSV取り込み後、未実行/未引き継ぎのManager大項目だけが表示されます。</p>',
4974-        '</div>'
4975-      ].join("");
4976-    }
4977-
4978-    var pageSize = aicmMajorItemPageSizeR8O();
4979-    var totalRows = pendingRows.length;
4980-    var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
4981-    var page = aicmMajorItemCurrentPageR8O(totalRows);
4982-    var start = (page - 1) * pageSize;
4983-    var pageRows = pendingRows.slice(start, start + pageSize);
--
9236-      window.render();
9237-      return;
9238-    }
9239-    if (typeof window.renderApp === "function") {
9240-      window.renderApp();
9241-      return;
9242-    }
9243-    if (typeof window.aicmRender === "function") {
9244-      window.aicmRender();
9245-    }
9246-  }
9247-
9248-  function r8zV5dHydrateIfNeeded() {
9249-    var state = r8zV5dState();
9250-    if (state.aicmR8zV5dHydrating) return;
9251-    if (r8zV5dReviewRows().length > 0) return;
9252-
9253-    var owner = r8zV5dOwnerId();
9254-    var company = r8zV5dCompanyId();
9255-
9256-    if (!owner || !company || typeof fetch !== "function") return;
9257-
9258-    state.aicmR8zV5dHydrating = true;
9259-
9260:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: expose callback on globalThis as well as window
9261-    try {
9262-      if (typeof globalThis !== "undefined" && typeof window !== "undefined" && window.__aicmR8zV9ReviewContextCallback) {
9263-        globalThis.__aicmR8zV9ReviewContextCallback = window.__aicmR8zV9ReviewContextCallback;
9264-      }
9265-    } catch (_r8zV9cGlobalBindError) {}
9266-
9267-    var params = new URLSearchParams();
9268-    params.set("owner_civilization_id", owner);
9269-    params.set("aicm_user_company_id", company);
9270-    params.set("v", "r8z_v5d_" + Date.now());
9271-
9272-    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
9273-      .then(function (res) {
9274-        return res.text().then(function (bodyText) {
9275-          var payload = {};
9276-          try {
9277-            payload = bodyText ? JSON.parse(bodyText) : {};
9278-          } catch (error) {
9279-            payload = {};
9280-          }
9281-
9282-          if (res.ok && payload && payload.result === "ok") {
9283-            r8zV5dNormalizeContext(payload);
9284-          } else {
--
9854-            appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
9855-          }
9856-        });
9857-      })
9858-      .catch(function (error) {
9859-        appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
9860-      })
9861-      .finally(function () {
9862-        appState.aicmR8zV7Hydrating = false;
9863-        if (appState.screen === "review-list") rerender();
9864-      });
9865-  }
9866-
9867-  function statusLabel(row) {
9868-    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
9869-    if (status === "pending") return "承認待ち";
9870-    if (status === "approved") return "承認済み";
9871-    if (status === "returned") return "差し戻し";
9872-    if (status === "archived") return "アーカイブ";
9873-    return status;
9874-  }
9875-
9876-  
9877-
9878:  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper begin
9879-  function aicmR8zV9ReviewRowsFromPayload(payload) {
9880-    payload = payload && typeof payload === "object" ? payload : {};
9881-    if (Array.isArray(payload.review_wait_items)) return payload.review_wait_items;
9882-    if (payload.context && Array.isArray(payload.context.review_wait_items)) return payload.context.review_wait_items;
9883-    if (payload.data && Array.isArray(payload.data.review_wait_items)) return payload.data.review_wait_items;
9884-    if (Array.isArray(payload.human_review_wait_items)) return payload.human_review_wait_items;
9885-    if (Array.isArray(payload.reviewWaitItems)) return payload.reviewWaitItems;
9886-    if (Array.isArray(payload.humanReviewWaitItems)) return payload.humanReviewWaitItems;
9887-    return [];
9888-  }
9889-
9890-  function aicmR8zV9MergeReviewPayload(appState, payload) {
9891-    appState = appState || {};
9892-    payload = payload && typeof payload === "object" ? payload : {};
9893-
9894-    var rows = aicmR8zV9ReviewRowsFromPayload(payload);
9895-
9896-    if (typeof aicmR8zV8gMergeReviewWaitItemsFromPayload === "function") {
9897-      try {
9898-        var mergedByV8g = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
9899-        if (Array.isArray(mergedByV8g)) rows = mergedByV8g;
9900-      } catch (_) {}
9901-    }
9902-
--
9939-    appState.aicmR8zV8kDebug = "v9-script-merged";
9940-    appState.aicmR8zV8kPayloadCount = rows.length;
9941-    appState.aicmR8zV8kMergedCount = rows.length;
9942-    appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
9943-    appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
9944-    appState.aicmR8zV8kMergedAt = new Date().toISOString();
9945-
9946-    if (typeof state !== "undefined" && state && state !== appState) {
9947-      state.aicmR8zV7Hydrating = false;
9948-      state.aicmR8zV7HydrationError = "";
9949-      state.aicmR8zV9Hydrating = false;
9950-      state.aicmR8zV9Hydrated = true;
9951-      state.aicmR8zV9Rows = rows.length;
9952-      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
9953-      state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
9954-      state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
9955-      state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
9956-      state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
9957-      state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
9958-    }
9959-
9960-    return rows;
9961-  }
9962-
9963:  function aicmR8zV9RerenderReviewList() {
9964:    // AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY
9965:    // AICM_R8Z_V9E2_LOCAL_RENDER_STATIC_GATE_CORRECTION
9966-    // Keep review-list hydration local. Avoid the app-wide renderer because it can re-enter
9967-    // task-ledger/dashboard paths and surface unrelated screen regressions.
9968-    try {
9969-      var appState = (typeof state !== "undefined" && state) ? state : {};
9970-      var screen = String(appState.screen || "");
9971-
9972-      if (screen && screen !== "review-list") {
9973-        appState.aicmR8zV8kDebug = "v9-local-skip-non-review";
9974-        appState.aicmR8zV8kError = "screen=" + screen;
9975-        return;
9976-      }
9977-
9978-      if (typeof root === "undefined" || !root) {
9979-        appState.aicmR8zV8kDebug = "v9-local-root-missing";
9980-        appState.aicmR8zV8kError = "root is unavailable";
9981-        return;
9982-      }
9983-
9984-      if (typeof window === "undefined" || typeof window.aicmR8zV7RenderReviewList !== "function") {
9985:        appState.aicmR8zV8kDebug = "v9-local-renderer-missing";
9986-        appState.aicmR8zV8kError = "aicmR8zV7RenderReviewList is unavailable";
9987-        return;
9988-      }
9989-
9990-      appState.screen = "review-list";
9991:      appState.aicmR8zV8kDebug = "v9-local-render-start";
9992-
9993-      root.innerHTML = window.aicmR8zV7RenderReviewList(appState);
9994-
9995:      appState.aicmR8zV8kDebug = "v9-local-render-done";
9996-      appState.aicmR8zV8kError = "";
9997-    } catch (error) {
9998-      try {
9999-        if (typeof state !== "undefined" && state) {
10000:          state.aicmR8zV8kDebug = "v9-local-render-error";
10001-          state.aicmR8zV8kError = String(error && error.message ? error.message : error);
10002-        }
10003-      } catch (_) {}
10004-    }
10005-  }
10006-
10007-  function aicmR8zV9ReviewListScriptHydrate(appState) {
10008-    appState = appState || {};
10009-
10010-    var existingRows = [];
10011-    try {
10012-      existingRows = typeof rows === "function" ? rows(appState) : [];
10013-    } catch (_) {
10014-      existingRows = [];
10015-    }
10016-
10017-    if (Array.isArray(existingRows) && existingRows.length > 0) return;
10018-    if (appState.aicmR8zV9Hydrating) return;
10019-
10020-    var owner = "";
10021-    var company = "";
10022-
10023-    try {
10024-      owner = typeof ownerId === "function" ? ownerId(appState) : "";
--
10055-      state.aicmR8zV7Hydrating = true;
10056-      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10057-      state.aicmR8zV8kPayloadCount = -1;
10058-      state.aicmR8zV8kMergedCount = -1;
10059-      state.aicmR8zV8kError = "";
10060-      state.aicmR8zV9StartedAt = appState.aicmR8zV9StartedAt;
10061-    }
10062-
10063-    try {
10064-      var oldScript = document.getElementById("aicm-r8z-v9-context-script");
10065-      if (oldScript && oldScript.parentNode) oldScript.parentNode.removeChild(oldScript);
10066-    } catch (_) {}
10067-
10068-    window.__aicmR8zV9ReviewContextCallback = function aicmR8zV9ReviewContextCallback(payload) {
10069-      try {
10070-        aicmR8zV9MergeReviewPayload(appState, payload);
10071-      } catch (error) {
10072-        appState.aicmR8zV8kDebug = "v9-merge-error";
10073-        appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
10074-        appState.aicmR8zV9Hydrating = false;
10075-        appState.aicmR8zV7Hydrating = false;
10076-      }
10077-
10078-      try {
10079:        setTimeout(aicmR8zV9RerenderReviewList, 0);
10080-      } catch (_) {
10081:        aicmR8zV9RerenderReviewList();
10082-      }
10083-    };
10084-
10085-    var params = new URLSearchParams();
10086-    params.set("owner_civilization_id", owner);
10087-    if (company) params.set("aicm_user_company_id", company);
10088:    params.set("callback", "window.__aicmR8zV9ReviewContextCallback"); // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE
10089-    params.set("v", "r8z_v9_" + Date.now());
10090-
10091-    var script = document.createElement("script");
10092-    script.id = "aicm-r8z-v9-context-script";
10093-    script.async = true;
10094-    script.src = "/api/aicm/v2/context-script?" + params.toString();
10095-
10096-    script.onerror = function aicmR8zV9ScriptError() {
10097-      appState.aicmR8zV8kDebug = "v9-script-error";
10098-      appState.aicmR8zV8kError = "context-script load failed";
10099-      appState.aicmR8zV9Hydrating = false;
10100-      appState.aicmR8zV7Hydrating = false;
10101-
10102-      if (typeof state !== "undefined" && state && state !== appState) {
10103-        state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10104-        state.aicmR8zV8kError = appState.aicmR8zV8kError;
10105-        state.aicmR8zV9Hydrating = false;
10106-        state.aicmR8zV7Hydrating = false;
10107-      }
10108-
10109:      aicmR8zV9RerenderReviewList();
10110-    };
10111-
10112:    // AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE: loaded-without-callback diagnostics
10113-    script.onload = function aicmR8zV9cScriptLoaded() {
10114-      try {
10115-        setTimeout(function aicmR8zV9cCheckCallbackCompletion() {
10116-          try {
10117-            var merged = Number(appState && appState.aicmR8zV8kMergedCount);
10118-            if (Number.isFinite(merged) && merged >= 0) return;
10119-            if (appState && appState.aicmR8zV9Hydrated) return;
10120-
10121-            appState.aicmR8zV8kDebug = "v9-script-loaded-no-callback";
10122-            appState.aicmR8zV8kError = String(
10123-              (typeof window !== "undefined" && window.__aicmR8zV9ReviewContextError)
10124-                ? window.__aicmR8zV9ReviewContextError
10125-                : "script loaded but callback did not merge"
10126-            );
10127-            appState.aicmR8zV9Hydrating = false;
10128-            appState.aicmR8zV7Hydrating = false;
10129-
10130-            if (typeof state !== "undefined" && state && state !== appState) {
10131-              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
10132-              state.aicmR8zV8kError = appState.aicmR8zV8kError;
10133-              state.aicmR8zV9Hydrating = false;
10134-              state.aicmR8zV7Hydrating = false;
10135-            }
10136-
10137-            try {
10138-              if (typeof render === "function") {
10139-                render();
10140-                return;
10141-              }
10142-            } catch (_) {}
10143-
10144-            try {
10145-              if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
10146-                window.aicmRender();
10147-              }
10148-            } catch (_) {}
10149-          } catch (_) {}
10150-        }, 600);
10151-      } catch (_) {}
10152-    };
10153-
10154-    document.body.appendChild(script);
10155-  }
10156:  // AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE: helper end
10157-
10158-window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
10159-    appState = appState || {};
10160-    var list = rows(appState);
10161-
10162-    if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
10163-    if (!list.length) hydrateIfNeeded(appState);
10164-
10165-    var debug = [
10166-      "selectedCompanyId=" + companyId(appState),
10167-      "owner=" + ownerId(appState),
10168-      "rows=" + String(list.length),
10169-      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
10170-      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",
10171-      // AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG: visible debug fields
10172-      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),
10173-      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),
10174-      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),
10175-      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),
10176-      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),
10177-      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""
10178-    ].filter(Boolean).join(" / ");
10179-
10180-    var html = [
V9E_MARKER_COUNT=1
V9E2_MARKER_COUNT=1
V9D1_MARKER_COUNT=1

============================================================
10. classification
============================================================
ACTION_BUTTON_COUNT=4
ACTION_REF_COUNT=9
CONFIRM_STATE_REF_COUNT=9
CONFIRM_TITLE_COUNT=4
CONFIRM_CARD_LIKE_COUNT=5
HANDLER_REF_COUNT=40
STATE_ASSIGN_COUNT=3
TASK_LEDGER_RENDER_COUNT=2
CONFIRM_CARD_INSERTION_COUNT=23
V9D1_MARKER_COUNT=1
V9E_MARKER_COUNT=1
V9E2_MARKER_COUNT=1
FINAL_JUDGEMENT=CONFIRM_EXISTS_NEXT_BROWSER_EVENT_OR_RENDER_ROUTE_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/000_R8Z_V9F_LEADER_HANDOFF_CONFIRM_REGRESSION_ISOLATE_REPORT.md
SCAN_ACTION=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/030_action_scan.txt
SCAN_CONFIRM=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/031_confirm_scan.txt
SCAN_HANDLER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/032_handler_scan.txt
SCAN_RENDER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/033_render_scan.txt
SCAN_V9=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/034_v9_scan.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- LEADER_HANDOFF_BUTTON_MARKUP_MISSING:
  Manager大項目カードのボタン生成だけを復旧。

- LEADER_HANDOFF_CLICK_HANDLER_OR_STATE_ASSIGN_MISSING:
  data-core-action="pmlw-major-leader-handoff" のdispatchから
  state.managerMajorLeaderHandoffConfirm へ入れる1点だけを復旧。

- LEADER_HANDOFF_CONFIRM_CARD_RENDERER_MISSING:
  確認カード描画関数、またはtask-ledgerへの差し込みだけを復旧。

- CONFIRM_EXISTS_NEXT_BROWSER_EVENT_OR_RENDER_ROUTE_CHECK:
  静的には存在する。ブラウザクリック時にhandlerへ届いているか、
  renderが呼ばれているかだけを見る。ここでまだpatchしない。

- レビュー待ち:
  課長へ送る確認カード復旧後に再開。

============================================================
DONE
============================================================
ACTION_BUTTON_COUNT=4
ACTION_REF_COUNT=9
CONFIRM_STATE_REF_COUNT=9
CONFIRM_TITLE_COUNT=4
CONFIRM_CARD_LIKE_COUNT=5
HANDLER_REF_COUNT=40
STATE_ASSIGN_COUNT=3
TASK_LEDGER_RENDER_COUNT=2
CONFIRM_CARD_INSERTION_COUNT=23
V9D1_MARKER_COUNT=1
V9E_MARKER_COUNT=1
V9E2_MARKER_COUNT=1
FINAL_JUDGEMENT=CONFIRM_EXISTS_NEXT_BROWSER_EVENT_OR_RENDER_ROUTE_CHECK
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/000_R8Z_V9F_LEADER_HANDOFF_CONFIRM_REGRESSION_ISOLATE_REPORT.md
SCAN_ACTION=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/030_action_scan.txt
SCAN_CONFIRM=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/031_confirm_scan.txt
SCAN_HANDLER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/032_handler_scan.txt
SCAN_RENDER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/033_render_scan.txt
SCAN_V9=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f_leader_handoff_confirm_regression_isolate_20260503_111600/034_v9_scan.txt
DB_WRITE=NO
API_POST=NO
PATCH=NO
