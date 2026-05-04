============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- V10L-C1 失敗サルベージ
- renderPmlwMajorRows(rows)

現在位置:
- C1 実行が code 3 で停止
- code 3 は C1 patch_core 内の STOP_FUNCTION_BOUNDARY_NOT_FOUND の可能性が高い
- つまり「関数は見つけたが、関数終端検出に失敗」して停止した疑い

今回:
1. 最新C1 run dirを探す
2. report / patch_log / patch_analysis を表示
3. core/server syntax確認
4. coreの現状marker確認
5. renderPmlwMajorRows(rows) の周辺を安全に抽出
6. 変更が入ったか/入っていないか分類
7. 次の安全な方針だけ出す

禁止:
- DB write
- API POST
- PATCH
- server restart

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
META=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_failed_run_salvage_20260504_113826
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. latest C1 failed run
============================================================
LATEST_C1_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/000_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR_REPORT.md
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/010_patch.log
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/020_patch_analysis.txt
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/aicm-production-core.before_v10l_c1.js
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/patch_core_v10l_c1.cjs

---- latest report tail ----
LATEST_REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/000_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR_REPORT.md
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目
- renderPmlwMajorRows(rows)

現在位置:
- DB/viewには大項目が存在する
- 画面にも登録済み大項目が表示される
- しかしB1系後付けUIは rows 本体に乗っておらず、0件扱いになった
- 保守性維持のため、DOM後付けではなく既存レンダラー本体へ戻す

今回:
1. core/server syntax確認
2. core backup
3. B1/B1B/B1C/B1D/B1E/B1F/B1G/B1H/B1I/B1J 系の後付けブロックを除去
4. renderPmlwMajorRows(rows) の関数本体だけを置換
5. rows 引数を正本データとして、上部集約ボタンを表示
6. 各大項目カード/行に選択チェックを表示
7. 個別の「課長へ送る」「削除」はレンダー元から出さない
8. 確認画面はタイトル一覧 + Yes / No のみ
9. Yesを押しても今回はDB更新/API POSTなし
10. server再起動
11. ブラウザ起動

保守性方針:
- DOM後付けでカード探索しない
- 既存レンダラーの rows を使う
- 変更対象は renderPmlwMajorRows(rows) と旧B1ブロック除去に限定
- server / DB / API route は触らない

禁止:
- DB write
- API POST
- server patch
- 実POST解放

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/aicm-production-core.before_v10l_c1.js

============================================================
4. patch core
============================================================

---- patch log ----
PATCH_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/010_patch.log
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
PATCH_DECISION=STOP_FUNCTION_BOUNDARY_NOT_FOUND

---- patch analysis ----
PATCH_ANALYSIS=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/020_patch_analysis.txt
BEFORE_RENDER_FUNC_COUNT=1
BEFORE_AICM_R8Z_V10L_B1_LEDGER_MULTI_SEND_CONFIRM_ONLY_COUNT=0
BEFORE_AICM_R8Z_V10L_B1B_LEDGER_MULTI_SEND_ACTUAL_RENDERER_COUNT=0
BEFORE_AICM_R8Z_V10L_B1C_LEDGER_MULTI_SEND_DOM_INJECTOR_COUNT=0
BEFORE_AICM_R8Z_V10L_B1D_COMPACT_TOP_LEADER_SEND_PANEL_COUNT=0
BEFORE_AICM_R8Z_V10L_B1E_MINIMAL_TOP_BUTTONS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1F_BUTTONS_AT_REGISTERED_MAJOR_TOP_COUNT=0
BEFORE_AICM_R8Z_V10L_B1G_SELECTED_MULTI_AND_ALL_BUTTONS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1H_SELECTED_ONLY_LEADER_SEND_CONTROLS_COUNT=0
BEFORE_AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_COUNT=2
BEFORE_AICM_R8Z_V10L_B1J_DOM_CARD_SELECTABLE_CONTROLS_COUNT=0
BEFORE_AICM_R8Z_V10L_C1_CANONICAL_RENDERER_REPAIR_COUNT=0
PATCH_DECISION=STOP_FUNCTION_BOUNDARY_NOT_FOUND

---- backup ----
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/aicm-production-core.before_v10l_c1.js
BACKUP_CORE_FOUND=YES

============================================================
3. syntax current
============================================================
CORE_SYNTAX=OK
SERVER_SYNTAX=OK

============================================================
4. core marker / renderer scan
============================================================
C1_MARKER_COUNT=0
B1I_MARKER_COUNT=2
B1J_MARKER_COUNT=0
B1H_MARKER_COUNT=0
RENDER_PMLW_MAJOR_ROWS_FUNCTION_COUNT=0
RENDER_PMLW_MAJOR_ROWS_BASE_COUNT=1
PMLW_MAJOR_LEADER_HANDOFF_BUTTON_COUNT=11
PMLW_MAJOR_DELETE_OPEN_BUTTON_COUNT=3
V10L_C1_ACTION_COUNT=0

============================================================
5. renderPmlwMajorRows boundary scan
============================================================
RENDER_FUNC_HITS=1

============================================================
HIT_0_LINE=4263
============================================================
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
  4287:       }
  4288: 
  4289:       return String(
  4290:         value(row, [
  4291:           "aicm_manager_major_work_item_id",
  4292:           "manager_major_work_item_id",
  4293:           "pmlw_major_item_id",
  4294:           "major_item_id",
  4295:           "id"
  4296:         ], "row-" + String(index))
  4297:       );
  4298:     }
  4299: 
  4300:     var list = Array.isArray(rows) ? rows : [];
  4301: 
  4302:     if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
  4303:       var company = selectedCompany();
  4304:       list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
  4305:     }
  4306: 
  4307:     if (!Array.isArray(list) || list.length === 0) {
  4308:       return [
  4309:         '<div class="aicm-empty-state">',
  4310:         '  <strong>登録済み大項目はまだありません</strong>',
  4311:         '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
  4312:         '</div>'
  4313:       ].join("");
  4314:     }
  4315: 
  4316:     return [
  4317:       '<div class="aicm-table-wrap">',
  4318:       '  <table class="aicm-table">',
  4319:       '    <thead>',
  4320:       '      <tr>',
  4321:       '        <th>大項目</th>',
  4322:       '        <th>部門</th>',
  4323:       '        <th>課</th>',
  4324:       '        <th>優先度</th>',
  4325:       '        <th>期限</th>',
  4326:       '        <th>状態</th>',
  4327:       '        <th>操作</th>',
  4328:       '      </tr>',
  4329:       '    </thead>',
  4330:       '    <tbody>',
  4331:       list.map(function (row, index) {
  4332:         var id = rowId(row, index);
  4333:         var title = value(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
  4334:         var description = value(row, ["major_item_description", "description", "note"], "");
  4335:         var department = value(row, ["department_name", "department_label"], "-");
  4336:         var section = value(row, ["section_name", "section_label"], "-");
  4337:         var priority = value(row, ["priority_code"], "normal");

============================================================
6. classify
============================================================
FINAL_JUDGEMENT=V10L_C1_FAILED_RUN_SALVAGE_DONE_REVIEW_REQUIRED
RUN_CAUSE=PATCH_DECISION=STOP_FUNCTION_BOUNDARY_NOT_FOUND
CORE_CHANGE_STATUS=C1_NOT_APPLIED_CORE_LIKELY_UNCHANGED_BY_C1
C1_MARKER_COUNT=0
B1I_MARKER_COUNT=2
B1J_MARKER_COUNT=0
RENDER_PMLW_MAJOR_ROWS_FUNCTION_COUNT=0
V10L_C1_ACTION_COUNT=0
BOUNDARY_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_failed_run_salvage_20260504_113826/030_render_function_boundary_scan.txt
CORE_SCAN=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_failed_run_salvage_20260504_113826/010_core_marker_and_renderer_scan.txt
LATEST_C1_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_failed_run_salvage_20260504_113826/000_R8Z_V10L_C1_FAILED_RUN_SALVAGE_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
7. next policy
============================================================
次方針:
- C1が STOP_FUNCTION_BOUNDARY_NOT_FOUND なら、関数境界を自動置換する方式をやめる
- まず renderPmlwMajorRows(rows) の実体を人間が見える形で抽出
- 次パッチは「関数丸ごと自動置換」ではなく、既存関数内の rows.map(...) と操作列だけに限定する
- B1I/B1J が残っている場合は、先に明示的に除去するが、除去だけを独立工程にする
