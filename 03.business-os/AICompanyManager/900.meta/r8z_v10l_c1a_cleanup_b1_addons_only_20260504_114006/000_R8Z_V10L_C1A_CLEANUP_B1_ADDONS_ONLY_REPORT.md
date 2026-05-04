============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目
- B1I後付けUIブロック

現在位置:
- C1はSTOP_FUNCTION_BOUNDARY_NOT_FOUNDで未適用
- C1_MARKER_COUNT=0
- B1I_MARKER_COUNT=2
- B1J_MARKER_COUNT=0
- つまり現在の不具合UIはB1I後付けブロック由来

今回:
1. core/server syntax確認
2. core backup
3. B1/B1B/B1C/B1D/B1E/B1F/B1G/B1H/B1I/B1J系の後付けブロックを除去
4. renderer本体はまだ触らない
5. renderPmlwMajorRows / 関連action の現物を抽出
6. syntax確認
7. server再起動
8. ブラウザ起動

保守性方針:
- DOM後付けを撤去
- 正本レンダラー修正の前に状態をクリーン化
- renderer本体パッチは次工程
- server / DB / API route は触らない

禁止:
- DB write
- API POST
- renderer置換
- server patch

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/aicm-production-core.before_v10l_c1a.js

============================================================
4. remove B1 addon blocks only
============================================================
REMOVED_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY=false
REMOVED_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER=false
REMOVED_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR=false
REMOVED_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL=false
REMOVED_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS=false
REMOVED_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP=false
REMOVED_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS=false
REMOVED_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS=false
REMOVED_AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS=true
REMOVED_AICM_R8Z_V10L_B1J_DOM_CARD_SELECTABLE_CONTROLS=false
REMOVED_AICM_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR=false

BEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
AFTER_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
BEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0
AFTER_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0
BEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0
AFTER_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0
BEFORE_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0
AFTER_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0
BEFORE_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0
AFTER_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=0
AFTER_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=0
BEFORE_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0
AFTER_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_COUNT=0
AFTER_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_COUNT=2
AFTER_AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1J_DOM_CARD_SELECTABLE_CONTROLS_COUNT=0
AFTER_AICM_R8Z_V10L_B1J_DOM_CARD_SELECTABLE_CONTROLS_COUNT=0
BEFORE_AICM_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR_COUNT=0
AFTER_AICM_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR_COUNT=0
PATCH_CHANGED=true
PATCH_DECISION=CLEANUP_APPLIED

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after cleanup

============================================================
6. verify cleanup
============================================================
B1I_MARKER_COUNT=0
B1J_MARKER_COUNT=0
C1_MARKER_COUNT=0
V10L_C1_ACTION_COUNT=0
V10L_B1I_ACTION_COUNT=0
V10L_B1J_ACTION_COUNT=0
PMLW_LEADER_HANDOFF_ACTION_COUNT=11
PMLW_DELETE_OPEN_ACTION_COUNT=3
RENDER_PMLW_TEXT_COUNT=2
REGISTERED_MAJOR_TEXT_COUNT=7
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
7. extract current renderer/action source
============================================================
RENDERER_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/040_renderer_exact_extract.txt
ROUTE_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/050_route_action_extract.txt

---- renderer extract head ----

============================================================
PATTERN: function\s+renderPmlwMajorRows
============================================================

---- hit 1 line 4213 ----
  4073:     if (!leaders.length) return null;
  4074: 
  4075:     if (sectionId) {
  4076:       for (var i = 0; i < leaders.length; i += 1) {
  4077:         if (aicmAxuR1Text(leaders[i].aicm_user_company_section_id) === sectionId) return leaders[i];
  4078:       }
  4079:     }
  4080: 
  4081:     if (departmentId) {
  4082:       for (var j = 0; j < leaders.length; j += 1) {
  4083:         if (aicmAxuR1Text(leaders[j].aicm_user_company_department_id) === departmentId) return leaders[j];
  4084:       }
  4085:     }
  4086: 
  4087:     return leaders[0] || null;
  4088:   }
  4089: 
  4090: function aicmAxuR1LeaderLabel(row) {
  4091:     row = row || {};
  4092: 
  4093:     var existing = aicmAxuR1Text(row.assigned_leader_label);
  4094:     if (existing) return existing;
  4095: 
  4096:     var leader = aicmAxuR1BestLeaderForMajor(row);
  4097:     if (!leader) return "";
  4098: 
  4099:     var nickname = aicmAxuR1Text(leader.internal_nickname || leader.placement_nickname || leader.robot_internal_nickname);
  4100:     var role = aicmAxuR1Text(leader.role_code || "Leader");
  4101:     var model = aicmAxuR1Text(leader.aiworker_model_code || leader.model_code || leader.model_no);
  4102:     var display = aicmAxuR1Text(leader.display_label || leader.robot_pool_display_name || leader.robot_pool_label);
  4103: 
  4104:     if (nickname) return nickname + "@" + role;
  4105:     if (display) return display;
  4106:     if (model) return model + "@" + role;
  4107: 
  4108:     return role;
  4109:   }
  4110: 
  4111: function aicmAxuR1BuildLeaderHandoffPayload(row) {
  4112:     row = row || {};
  4113: 
  4114:     var majorId = aicmAxuR1MajorId(row);
  4115:     var leaderLabel = aicmAxuR1LeaderLabel(row);
  4116: 
  4117:     if (!majorId) {
  4118:       throw new Error("Manager大項目IDを特定できません。");
  4119:     }
  4120: 
  4121:     if (!leaderLabel) {
  4122:       throw new Error("課長/Leaderが未設定です。課変更でLeaderを設定するか、Manager大項目のLeader欄を設定してください。");
  4123:     }
  4124: 
  4125:     return {
  4126:       kind: "manager-major-leader-handoff",
  4127:       title: "課長へ送る確認",
  4128:       endpoint: "/api/aicm/v2/manager-major/update",
  4129:       backScreen: "task-ledger",
  4130:       body: {
  4131:         owner_civilization_id: aicmAxuR1OwnerId(),
  4132:         aicm_manager_major_work_item_id: majorId,
  4133:         assigned_leader_label: leaderLabel,
  4134:         decomposition_status_code: "assigned_to_leader",
  4135:         handoff_status_code: "handed_off",
  4136:         note: aicmAxuR1Text(row.note)
  4137:       }
  4138:     };
  4139:   }
  4140: 
  4141: function aicmAxuR1ShowLeaderHandoffConfirm(payload) {
  4142:     if (typeof aicmAvdShowDbConfirm === "function") {
  4143:       aicmAvdShowDbConfirm(payload);
  4144:       return;
  4145:     }
  4146: 
  4147:     if (typeof aicmOrgShowUpdateConfirm === "function") {
  4148:       aicmOrgShowUpdateConfirm(payload);
  4149:       return;
  4150:     }
  4151: 
  4152:     state.pendingOrgUpdate = payload;
  4153:     state.screen = "task-ledger";
  4154: 
  4155:     if (typeof render === "function") render();
  4156:   }
  4157: 
  4158: function aicmAxuR1OpenLeaderHandoffConfirm(button) {
  4159:     try {
  4160:       var majorId = button && button.getAttribute ? button.getAttribute("data-pmlw-major-id") : "";
  4161:       var row = aicmAxuR1FindMajorById(majorId);
  4162: 
  4163:       if (!row) {
  4164:         throw new Error("Manager大項目を特定できません。");
  4165:       }
  4166: 
  4167:       var payload = aicmAxuR1BuildLeaderHandoffPayload(row);
  4168:       aicmAxuR1ShowLeaderHandoffConfirm(payload);
  4169:     } catch (error) {
  4170:       setMessage("error", error && error.message ? error.message : "課長への引渡し確認を表示できません。");
  4171:       if (typeof render === "function") render();
  4172:     }
  4173:   }
  4174: 
  4175: 
  4176: 
  4177: // AICM_AXU_R1B_LEADER_HANDOFF_BUTTON_VISIBLE_V1
  4178: // 保険表示: テーブル内ボタンが出ない場合でも、Manager大項目ごとの「課長へ送る」を出す。
  4179: function aicmAxuR1BLeaderHandoffStandalonePanel() {
  4180:     var rows = state && state.context && Array.isArray(state.context.pmlw_major_items)
  4181:       ? state.context.pmlw_major_items
  4182:       : [];
  4183: 
  4184:     if (!rows.length) return "";
  4185: 
  4186:     return [
  4187:       '<section class="aicm-core-card aicm-axu-r1b-leader-handoff-panel">',
  4188:       '  <p class="aicm-eyebrow">Manager大項目</p>',
  4189:       '  <h2>課長への引渡し</h2>',
  4190:       '  <p class="aicm-selected-note">Manager大項目を課長/Leaderへ送ります。Worker Runtime request はまだ作成しません。</p>',
  4191:       rows.map(function (row) {
  4192:         var majorId = typeof aicmAxuR1MajorId === "function" ? aicmAxuR1MajorId(row) : "";
  4193:         var title = row.major_item_name || row.deliverable_name || row.task_name || "Manager大項目";
  4194:         var leader = row.assigned_leader_label || row.leader_label || "Leader未設定";
  4195:         var status = row.decomposition_status_code || "-";
  4196:         var handoff = row.handoff_status_code || "-";
  4197: 
  4198:         return [
  4199:           '<article class="aicm-org-update-row">',
  4200:           '  <div>',
  4201:           '    <strong>' + escapeHtml(title) + '</strong>',
  4202:           '    <p>Leader: ' + escapeHtml(leader) + ' / 状態: ' + escapeHtml(status) + ' / 引渡し: ' + escapeHtml(handoff) + '</p>',
  4203:           '  </div>',
  4204:           '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
  4205:           '</article>'
  4206:         ].join("");
  4207:       }).join(""),
  4208:       '</section>'
  4209:     ].join("");
  4210:   }
  4211: 
  4212: 
  4213: function renderPmlwMajorRowsBaseAxuR1B(rows) {
  4214:     if (!rows.length) {
  4215:       return [
  4216:         '<div class="aicm-empty-state">',
  4217:         '  <strong>登録済み大項目はまだありません</strong>',
  4218:         '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
  4219:         '</div>'
  4220:       ].join("");
  4221:     }
  4222: 
  4223:     return [
  4224:       '<div class="aicm-table-wrap">',
  4225:       '  <table class="aicm-core-table">',
  4226:       '    <thead>',
  4227:       '      <tr>',
  4228:       '        <th>方針元</th>',
  4229:       '        <th>大項目</th>',
  4230:       '        <th>部門</th>',
  4231:       '        <th>課</th>',
  4232:       '        <th>Leader</th>',
  4233:       '        <th>分解状態</th>',
  4234:       '        <th>引渡し</th>',
  4235:       '        <th>優先度</th>',
  4236:       '        <th>期限</th>',
  4237:       '        <th>操作</th>',
  4238:       '      </tr>',
  4239:       '    </thead>',
  4240:       '    <tbody>',
  4241:       rows.map(function (row) {
  4242:         return [
  4243:           '      <tr>',
  4244:           '        <td>' + escapeHtml(pmlwValue(row.policy_title, row.source_route_code || "-")) + '</td>',
  4245:           '        <td><strong>' + escapeHtml(pmlwValue(row.major_item_name, "-")) + '</strong><small>' + escapeHtml(pmlwValue(row.major_item_description, "")) + '</small></td>',
  4246:           '        <td>' + escapeHtml(pmlwValue(row.department_name, "未割当")) + '</td>',
  4247:           '        <td>' + escapeHtml(pmlwValue(row.section_name, "未割当")) + '</td>',
  4248:           '        <td>' + escapeHtml(pmlwValue(row.assigned_leader_label, "-")) + '</td>',
  4249:           '        <td>' + escapeHtml(pmlwStatusLabel(row.decomposition_status_code)) + '</td>',
  4250:           '        <td>' + escapeHtml(pmlwStatusLabel(row.handoff_status_code)) + '</td>',
  4251:           '        <td>' + escapeHtml(pmlwStatusLabel(row.priority_code)) + '</td>',
  4252:           '        <td>' + escapeHtml(pmlwValue(row.due_date, "-")) + '</td>',
  4253:           '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(aicmAxuR1MajorId(row)) + '">課長へ送る</button></td>',
  4254:           '      </tr>'
  4255:         ].join("");
  4256:       }).join(""),
  4257:       '    </tbody>',
  4258:       '  </table>',
  4259:       '</div>'
  4260:     ].join("");
  4261:   }
  4262: 
  4263: function renderPmlwMajorRows(rows) {
  4264:     // AICM_AXU_CSV_R8_RENDER_PMLW_MAJOR_ROWS_REPAIR_V1
  4265:     function h(value) {
  4266:       if (typeof escapeHtml === "function") return escapeHtml(value);
  4267:       return String(value == null ? "" : value)
  4268:         .replace(/&/g, "&amp;")
  4269:         .replace(/</g, "&lt;")
  4270:         .replace(/>/g, "&gt;")
  4271:         .replace(/"/g, "&quot;")
  4272:         .replace(/'/g, "&#39;");
  4273:     }
  4274: 
  4275:     function value(row, keys, fallback) {
  4276:       for (var i = 0; i < keys.length; i += 1) {
  4277:         var key = keys[i];
  4278:         if (row && row[key] != null && String(row[key]) !== "") return row[key];
  4279:       }
  4280:       return fallback == null ? "" : fallback;
  4281:     }
  4282: 
  4283:     function rowId(row, index) {
  4284:       if (typeof aicmAxuR1MajorId === "function") {
  4285:         var id = aicmAxuR1MajorId(row);
  4286:         if (id) return id;

============================================================
8. restart server
============================================================

============================================================
9. final
============================================================
FINAL_JUDGEMENT=V10L_C1A_B1_ADDONS_CLEANED_READY_FOR_RENDERER_MINIMAL_PATCH
ROOT_HTTP=200
SERVED_HTTP=200
B1I_MARKER_COUNT=0
B1J_MARKER_COUNT=0
C1_MARKER_COUNT=0
V10L_C1_ACTION_COUNT=0
V10L_B1I_ACTION_COUNT=0
V10L_B1J_ACTION_COUNT=0
SERVED_B1I_MARKER_COUNT=0
SERVED_B1J_MARKER_COUNT=0
SERVED_C1_MARKER_COUNT=0
RENDERER_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/040_renderer_exact_extract.txt
ROUTE_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/050_route_action_extract.txt
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c1a_20260504_114006
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/000_R8Z_V10L_C1A_CLEANUP_B1_ADDONS_ONLY_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/aicm-production-core.before_v10l_c1a.js
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/020_patch_analysis.txt
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. 部門別タスク台帳を開く
2. B1I由来の「大項目操作 選択0/未送信0/全件0」パネルが消えていること
3. 既存の登録済み大項目表示に戻っていること
4. 今回は選択UI完成ではなく、保守性を戻すcleanup工程
5. 次工程は /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/040_renderer_exact_extract.txt を元に、既存レンダラー内の最小差分だけを当てる

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/aicm-production-core.before_v10l_c1a.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
