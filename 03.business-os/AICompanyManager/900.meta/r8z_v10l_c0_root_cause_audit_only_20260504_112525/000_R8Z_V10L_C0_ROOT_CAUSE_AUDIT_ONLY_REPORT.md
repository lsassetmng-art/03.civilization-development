============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目
- 課長へ送る / 削除 の集約UI

現在位置:
- 上部ボタンは表示された
- しかし「選択 0 / 未送信 0 / 全件 0」
- 画面には登録済み大項目カードが表示されている
- つまり、UI追加側が見ているデータ元と、実カード描画元がズレている疑いが強い

今回:
1. DB read-onlyで大項目/中項目/作業単位の件数を確認
2. core内の「登録済み大項目」「MANAGER大項目 #」の実レンダラーを特定
3. 実レンダラーが使う配列名・row変数・id列を抽出
4. normalizeContextが何をstate.contextへ入れているか確認
5. イベントハンドラがどのdata-core-actionを処理しているか確認
6. server getContextがどのkeyで大項目を返しているか確認
7. パッチ方針ではなく、原因だけ分類する

禁止:
- DB write
- API POST
- PATCH
- server restart
- DOM直当て追加パッチ

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525
DB_REVIEW=佐藤(DB担当)
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

============================================================
2. syntax
============================================================
CORE_SYNTAX=OK
SERVER_SYNTAX=OK

============================================================
3. DB read-only counts
============================================================
key	value
manager_major_table_count	38
(1 row)
key	value
leader_middle_table_count	4
(1 row)
key	value
worker_work_unit_table_count	4
(1 row)
key	value
pmlw_major_view_count	38
(1 row)
key	value
task_ledger_view_count	1
(1 row)
key	value
major_status_counts	archived:3 | decomposed:4 | not_started:31
(1 row)
key	value
major_handoff_counts	archived:3 | completed:4 | draft:31
(1 row)
key	value
major_with_middle_count	4
(1 row)
key	value
major_without_middle_count	34
(1 row)

============================================================
4. core source scan
============================================================
---- key string counts ----
登録済み大項目_COUNT=10
MANAGER大項目_COUNT=0
課長へ送る_COUNT=33
削除_COUNT=39
data-core-action_COUNT=140
checkbox_COUNT=3
pmlw_major_items_COUNT=18
manager_major_items_COUNT=14
majorItems_COUNT=9
taskLedger_COUNT=18

---- registered major string locations ----
4217:        '  <strong>登録済み大項目はまだありません</strong>',
4310:        '  <strong>登録済み大項目はまだありません</strong>',
4983:      '  <h2>登録済み大項目を削除しますか？</h2>',
5096:        '  <strong>登録済み大項目はまだありません</strong>',
5111:      '  <button type="button" data-core-action="pmlw-major-page-prev"' + (page <= 1 ? ' disabled' : '') + '>前ページ</button>',
5113:      '  <button type="button" data-core-action="pmlw-major-page-next"' + (page >= totalPages ? ' disabled' : '') + '>次ページ</button>',
6098:      '    <button type="button" data-core-action="task-ledger-refresh">登録済み大項目をリロード</button>',
6106:      '  <h2>登録済み大項目</h2>',
8292:      '  <p class="aicm-selected-note">CSVは、Manager/部長による大項目分解結果を代替入力するルートです。CSV取り込み後、登録済み大項目から課長へ引き継ぎます。</p>',
13745:        t === "登録済み大項目" ||
13747:        t.indexOf("登録済み大項目") >= 0 ||
13770:    return bodyText.indexOf("部門別タスク台帳") >= 0 && bodyText.indexOf("登録済み大項目") >= 0;


---- leader send / delete action locations ----
887:      '    <option value="archived"' + ((department.department_status || '') === 'archived' ? ' selected' : '') + '>archived</option>',
944:      '    <option value="archived"' + ((section.section_status || '') === 'archived' ? ' selected' : '') + '>archived</option>',
2862:      '<p class="aicm-core-empty">編集・削除は次工程で追加します。</p>'
3017:        '<p class="aicm-core-empty">編集/削除は未設定。作成系の確認後に実装します。</p>'
3970:      archived: "削除済",
4127:      title: "課長へ送る確認",
4178:// 保険表示: テーブル内ボタンが出ない場合でも、Manager大項目ごとの「課長へ送る」を出す。
4204:          '  <button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
4253:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + escapeHtml(aicmAxuR1MajorId(row)) + '">課長へ送る</button></td>',
4349:          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
4427:        archived: true
4481:    var deleted = String(row.deleted_flag || row.is_deleted || "").toLowerCase();
4482:    var archived = String(row.archived_flag || row.is_archived || "").toLowerCase();
4484:    if (deleted === "true" || deleted === "1") return false;
4485:    if (archived === "true" || archived === "1") return false;
4488:      handoff === "archived" ||
4489:      handoff === "deleted" ||
4535:        if (typeof setMessage === "function") setMessage("error", "課長へ送る対象のManager大項目IDを特定できません。");
4591:        title: "課長へ送る確認",
4626:          setMessage("error", error && error.message ? error.message : "課長へ送る確認の表示に失敗しました。");
4763:      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");
4773:      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");
4784:      '  <p class="aicm-eyebrow">課長へ送る確認</p>',
4795:      '    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>',
4805:    setMessage("ok", "課長へ送るをキャンセルしました。");
4817:    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");
4824:      setMessage("error", "課長へ送る対象がありません。");
4905:      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
4951:    if (handoff === "archived" || handoff === "deleted") return "削除済";
4982:      '  <p class="aicm-eyebrow">削除確認</p>',
4983:      '  <h2>登録済み大項目を削除しますか？</h2>',
4984:      '  <p class="aicm-selected-note">この操作は確認後にDBへ保存されます。物理DELETEではなく、既存APIで削除済み扱いにします。</p>',
4993:      '    <button type="button" data-core-action="pmlw-major-delete-execute">削除を確定</button>',
4994:      '    <button type="button" data-core-action="pmlw-major-delete-cancel">キャンセル</button>',
5021:      setMessage("ok", "削除確認を表示しました。内容を確認してから確定してください。");
5024:      setMessage("error", error && error.message ? error.message : "削除確認を表示できません。");
5031:    setMessage("ok", "削除をキャンセルしました。");
5039:      setMessage("error", "削除確認対象がありません。");
5045:      var response = await fetch("/api/aicm/v2/manager-major/archive", {
5063:        throw new Error(json && (json.error || json.message) ? (json.error || json.message) : "大項目の削除に失敗しました。");
5067:      setMessage("ok", "大項目を削除済みにしました。");
5072:      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");
5134:        '    <button type="button" data-core-action="pmlw-major-leader-handoff" data-major-id="' + escapeHtml(majorId) + '">課長へ送る</button>',
5135:        '    <button type="button" data-core-action="pmlw-major-delete-open" data-major-id="' + escapeHtml(majorId) + '">削除</button>',
5404:    if (handoff === "archived" || decomposition === "archived") return false;
5546:    var deleted = aicmSummaryTextR8U(row && (row.deleted_flag || row.is_deleted)).toLowerCase();
5547:    var archived = aicmSummaryTextR8U(row && (row.archived_flag || row.is_archived)).toLowerCase();
5549:    if (deleted === "true" || deleted === "1") return "archived";
5550:    if (archived === "true" || archived === "1") return "archived";
5551:    if (handoff === "archived" || decomposition === "archived" || handoff === "deleted" || decomposition === "deleted") return "archived";
5596:      { code: "archived", label: "削除済み", note: "削除済みまたはアーカイブ済みの件数。" },
5811:      if (handoff === "archived" || decomposition === "archived") return false;
5812:      if (handoff === "deleted" || decomposition === "deleted") return false;
5988:      var response = await fetch("/api/aicm/v2/leader-auto-decomposition/run", {
6200:      return '<p class="aicm-core-empty">成果物要件はまだありません。課長へ送る確定後、Leader自動分解が成功するとここに出ます。</p>';
6520:        '  <p>課長へ送る後、Leader自動分解とWorker作業単位作成が完了するとここに表示されます。</p>',
6600: * Restore only delete-confirm execute/cancel click bridge.
6602: * User click on delete-confirm execute will POST/archive the selected Manager大項目.
6659:  // AICM_R8Z_V9G8B_DELETE_EXECUTE_LEGACY_GUARD_DISABLE: V9G5 owns confirmed delete via manager-major/update fallback.
6663:    if (typeof setMessage === "function") setMessage("error", "削除確認情報が見つかりません。もう一度削除を押してください。");
6672:    if (typeof setMessage === "function") setMessage("error", "削除対象のManager大項目IDを特定できません。");
6678:    if (typeof setMessage === "function") setMessage("info", "削除を実行しています。");
6685:        if (typeof console !== "undefined" && console.warn) console.warn("existing delete execute R8P failed; fallback follows", existingError1);
6694:        if (typeof console !== "undefined" && console.warn) console.warn("existing manager delete execute R8P failed; fallback follows", existingError2);
6701:      decomposition_status_code: "archived",
6702:      handoff_status_code: "archived",
6728:            : "削除更新に失敗しました。"
6751:      if (typeof console !== "undefined" && console.warn) console.warn("delete context reload skipped", reloadError);
6754:    if (typeof setMessage === "function") setMessage("ok", "Manager大項目を削除しました。");
6757:      aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_done");
6765:      setMessage("error", error && error.message ? error.message : "削除に失敗しました。");
6768:      aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_error");
6778:  if (typeof setMessage === "function") setMessage("info", "削除をキャンセルしました。");
6781:    aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_cancel");
6806:              action === "pmlw-major-delete-execute" ||
6807:              action === "manager-major-delete-execute" ||
6808:              action === "major-delete-execute" ||
6809:              action === "delete-major-confirm" ||
6810:              action === "r8z-v9g-delete-execute" ||
6811:              action === "r8z-v9g5-delete-execute";
6814:              action === "pmlw-major-delete-cancel" ||
6815:              action === "manager-major-delete-cancel" ||
6816:              action === "major-delete-cancel" ||
6817:              action === "delete-major-cancel" ||
6818:              action === "r8z-v9g-delete-cancel" ||
6819:              action === "r8z-v9g5-delete-cancel";
6823:            if (!isDeleteExecuteAction && hasDeleteState && /削除/.test(label) && /確定|実行|削除する|はい/.test(label)) {
6845:              if (typeof setMessage === "function") setMessage("error", error && error.message ? error.message : "削除操作でエラーが発生しました。");
6855:        console.warn("AICM R8Z-V9G5 delete confirm execute bridge install skipped", error);
6863: * Manager大項目 -> 課長へ送る confirmation card.
6872:      throw new Error("課長へ送る確認情報が見つかりません。もう一度「課長へ送る」を押してください。");
6914:      setMessage("info", "課長へ送る処理を実行しています。");
6939:            : "課長へ送る更新に失敗しました。"
7030:      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");
7044: * Display-only repair for Manager大項目 -> 課長へ送る confirmation card.
7090:    '  <p class="aicm-eyebrow">課長へ送る確認</p>',
7100:    '    <button type="button" data-core-action="r8z-v9f4b-leader-handoff-confirm-execute" data-major-id="' + esc(majorId) + '">確認して課長へ送る</button>',
7192:                setMessage("error", error && error.message ? error.message : "課長へ送る確認の操作に失敗しました。");
9262:    if (action === "pmlw-major-delete-open") {
9267:    if (action === "pmlw-major-delete-cancel") {
9272:    if (action === "pmlw-major-delete-execute") {
9318:    if (action === "pmlw-major-delete-open") {
9323:    if (action === "pmlw-major-delete-cancel") {
9328:    if (action === "pmlw-major-delete-execute") {
9350:      var card = document.getElementById("aicm-manager-major-delete-confirm");
9380:    var deleteTarget = aicmResolveMajorDeleteActionTargetR8V7C2(ev, btn);
9382:    if (!deleteTarget || !deleteTarget.getAttribute) {
9383:      setMessage("error", "削除対象のボタンを特定できません。");
9389:      setMessage("error", "削除確認処理が見つかりません。");
9394:    aicmOpenMajorItemDeleteConfirmR8P(deleteTarget);
9411:    setMessage("ok", "削除をキャンセルしました。");
9421:    setMessage("error", "削除確定処理が見つかりません。");
9479:      handoff === "archived" ||
9480:      handoff === "deleted" ||
9481:      decomposition === "archived" ||
9482:      decomposition === "deleted"
9484:      return "archived";
9637:    if (decomposition === "archived" || handoff === "archived") return "削除済み";
9660:      archived: "削除済み"
9730:      aicmR8ZOSummaryButton("unhandoff", "未引き継ぎ", majorCounts.unhandoff || 0, "課長へ送る前"),
9735:      aicmR8ZOSummaryButton("archived", "削除済み", majorCounts.archived || 0, "非表示・保管扱い"),
10159:    if (status === "archived") return "アーカイブ";
10726:    if (status === "archived") return "アーカイブ";
11107:  // It does not touch task ledger / leader handoff / delete paths.
13573:// - 課長へ送る: selected rows only
13574:// - 削除: selected rows only
13844:        label.indexOf("課長へ送る") >= 0 ||
13845:        label.indexOf("Leaderへ送る") >= 0 ||
13846:        label.indexOf("リーダーへ送る") >= 0 ||
13847:        label === "削除" ||
13848:        label.indexOf("削除") >= 0
13916:      '<button type="button" data-core-action="v10l-b1i-send-selected">課長へ送る</button>',
13917:      '<button type="button" data-core-action="v10l-b1i-delete-selected">削除</button>',
13939:    var isDelete = kind === "delete";
13940:    var title = isDelete ? "選択した大項目を削除しますか？" : "選択した大項目を課長へ送りますか？";
14014:    var actionName = kind === "delete" ? "削除" : "課長へ送る";
14048:    if (selected[id]) delete selected[id];
14091:    if (action === "v10l-b1i-delete-selected") {
14093:      showConfirm("delete");
14140:      else delete selectedMap()[id];


---- current V10L/B1 markers ----
13570:// AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_START
14158:// AICM_R8Z_V10L_B1I_SELECTED_SEND_DELETE_UNIFIED_CONTROLS_END

============================================================
5. extract likely renderer/context/event/server blocks
============================================================
CORE_HAS_REGISTERED_MAJOR=true
CORE_HAS_MANAGER_MAJOR_CARD_LABEL=false
CORE_PMLW_MAJOR_ITEMS_COUNT=18
CORE_MANAGER_MAJOR_ITEMS_COUNT=14
CORE_MAJOR_ITEMS_CAMEL_COUNT=11
CORE_TASK_LEDGER_COUNT=20
CORE_HAS_CURRENT_B1I=true
SERVER_GETCONTEXT_HAS_PMLW_MAJOR=true
SERVER_GETCONTEXT_HAS_VW_PMLW_MAJOR=true
SERVER_HAS_LEADER_AUTO_ROUTE=true
SERVER_HAS_MANAGER_ARCHIVE_ROUTE=true
LIKELY_CAUSE=UNKNOWN_NEED_REVIEW_EXTRACTS_PLUS_PREVIOUS_PATCH_PRESENT
NEXT_ACTION=READ_EXTRACTS_THEN_PATCH_EXISTING_RENDERER_NOT_DOM_HACK

============================================================
6. important extracts preview
============================================================
---- renderer extract head ----


============================================================
PATTERN: 登録済み大項目
============================================================

---- hit 1 line 4217 ----
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

---- hit 2 line 4310 ----
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

---- context extract head ----


============================================================
PATTERN: function normalizeContext
============================================================

---- hit 1 line 136 ----
    66:     try {
    67:       return window.localStorage.getItem(key) || "";
    68:     } catch (error) {
    69:       return "";
    70:     }
    71:   }
    72: 
    73:   function writeStorage(key, value) {
    74:     try {
    75:       if (value === null || value === undefined || value === "") {
    76:         window.localStorage.removeItem(key);
    77:       } else {
    78:         window.localStorage.setItem(key, String(value));
    79:       }
    80:     } catch (error) {
    81:       /* storage unavailable */
    82:     }
    83:   }
    84: 
    85:   function list(value) {
    86:     return Array.isArray(value) ? value : [];
    87:   }
    88: 
    89:   function text(value) {
    90:     return value === null || value === undefined ? "" : String(value);
    91:   }
    92: 
    93:   function escapeHtml(value) {
    94:     return text(value)
    95:       .replace(/&/g, "&amp;")
    96:       .replace(/</g, "&lt;")
    97:       .replace(/>/g, "&gt;")
    98:       .replace(/"/g, "&quot;")
    99:       .replace(/'/g, "&#39;");
   100:   }
   101: 
   102:   function publicErrorMessage(error) {
   103:     var message = error && error.message ? String(error.message) : String(error || "不明なエラーです。");
   104:     message = message.replace(new RegExp("post" + "gres(?:ql)?://" + "[^\\s\'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
   105:     if (message.length > 500) {
   106:       message = message.slice(0, 500) + "...";
   107:     }
   108:     return message;
   109:   }
   110: 
   111:   function endpointWithOwner() {
   112:     return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
   113:   }
   114: 
   115:   function requestJson(url, body) {
   116:     var options = body ? {
   117:       method: "POST",
   118:       headers: { "content-type": "application/json" },
   119:       body: JSON.stringify(body)
   120:     } : {
   121:       method: "GET"
   122:     };
   123: 
   124:     return window.fetch(url, options)
   125:       .then(function (response) {
   126:         return response.json().then(function (json) {
   127:           if (!response.ok || !json || json.result !== "ok") {
   128:             throw new Error(json && json.error_message ? json.error_message : "API error");
   129:           }
   130:           return json;
   131:         });
   132:       });
   133:   }
   134: 
   135:   
   136: function normalizeContext(json) {
   137:     json = json || {};
   138:     return {
   139:       companies: Array.isArray(json.companies) ? json.companies : [],
   140:       departments: Array.isArray(json.departments) ? json.departments : [],
   141:       sections: Array.isArray(json.sections) ? json.sections : [],
   142:       placements: Array.isArray(json.placements) ? json.placements : [],
   143:       taskLedger: Array.isArray(json.task_ledger) ? json.task_ledger : [],
   144:       robotCatalog: Array.isArray(json.robot_catalog) ? json.robot_catalog : []
   145:     };
   146:   }
   147: 
   148:   function getCompany(companyId) {
   149:     return state.context.companies.find(function (company) {
   150:       return company.aicm_user_company_id === companyId;
   151:     }) || null;
   152:   }
   153: 
   154:   function getDepartment(departmentId) {
   155:     return state.context.departments.find(function (department) {
   156:       return department.aicm_user_company_department_id === departmentId;
   157:     }) || null;
   158:   }
   159: 
   160:   function getSection(sectionId) {
   161:     return state.context.sections.find(function (section) {
   162:       return section.aicm_user_company_section_id === sectionId;
   163:     }) || null;
   164:   }
   165: 
   166:   function companyDepartments(companyId) {
   167:     return state.context.departments.filter(function (department) {
   168:       return department.aicm_user_company_id === companyId;
   169:     });
   170:   }
   171: 
   172:   function departmentSections(departmentId) {
   173:     return state.context.sections.filter(function (section) {
   174:       return section.aicm_user_company_department_id === departmentId;
   175:     });
   176:   }
   177: 
   178:   function companyPlacements(companyId) {
   179:     return state.context.placements.filter(function (placement) {
   180:       return placement.aicm_user_company_id === companyId;
   181:     });
   182:   }
   183: 
   184:   function selectedCompany() {
   185:     return getCompany(state.selectedCompanyId);
   186:   }
   187: 
   188:   function selectedDepartment() {
   189:     return getDepartment(state.selectedDepartmentId);
   190:   }
   191: 
   192:   function selectedSection() {
   193:     return getSection(state.selectedSectionId);
   194:   }
   195: 
   196:   function hasCompany(companyId) {
   197:     return !!getCompany(companyId);
   198:   }

---- event extract head ----


============================================================
PATTERN: addEventListener\("click"
============================================================

---- hit 1 line 6793 ----
  6723: 
  6724:       if (!response.ok || (json && json.result && json.result !== "ok")) {
  6725:         throw new Error(
  6726:           json && (json.error_message || json.message || json.error)
  6727:             ? (json.error_message || json.message || json.error)
  6728:             : "削除更新に失敗しました。"
  6729:         );
  6730:       }
  6731: 
  6732:       result = json || {};
  6733:     }
  6734: 
  6735:     state.managerMajorDeleteConfirm = null;
  6736:     state.screen = "task-ledger";
  6737: 
  6738:     try {
  6739:       if (typeof aicmReloadTaskLedgerContext === "function") {
  6740:         await aicmReloadTaskLedgerContext();
  6741:       } else if (typeof refreshContext === "function") {
  6742:         await refreshContext();
  6743:       } else if (typeof loadContext === "function") {
  6744:         await loadContext();
  6745:       } else {
  6746:         var responseReload = await fetch("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner) + "&v=r8z_v9g5_" + Date.now());
  6747:         var contextJson = await responseReload.json();
  6748:         if (contextJson && contextJson.result === "ok") state.context = contextJson;
  6749:       }
  6750:     } catch (reloadError) {
  6751:       if (typeof console !== "undefined" && console.warn) console.warn("delete context reload skipped", reloadError);
  6752:     }
  6753: 
  6754:     if (typeof setMessage === "function") setMessage("ok", "Manager大項目を削除しました。");
  6755: 
  6756:     if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
  6757:       aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_done");
  6758:     } else if (typeof render === "function") {
  6759:       render();
  6760:     }
  6761: 
  6762:     return result || {};
  6763:   } catch (error) {
  6764:     if (typeof setMessage === "function") {
  6765:       setMessage("error", error && error.message ? error.message : "削除に失敗しました。");
  6766:     }
  6767:     if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
  6768:       aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_execute_error");
  6769:     } else if (typeof render === "function") {
  6770:       render();
  6771:     }
  6772:     throw error;
  6773:   }
  6774: }
  6775: 
  6776: function aicmR8zV9g5CancelDeleteConfirm() {
  6777:   if (state) state.managerMajorDeleteConfirm = null;
  6778:   if (typeof setMessage === "function") setMessage("info", "削除をキャンセルしました。");
  6779: 
  6780:   if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
  6781:     aicmRenderTaskLedgerSafeR8V4("r8z_v9g5_delete_cancel");
  6782:   } else if (typeof render === "function") {
  6783:     render();
  6784:   }
  6785: }
  6786: 
  6787: (function aicmInstallR8zV9g5DeleteConfirmExecuteBridge() {
  6788:   try {
  6789:     if (typeof document !== "undefined" && document.addEventListener && typeof window !== "undefined") {
  6790:       if (!window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled) {
  6791:         window.__aicmR8zV9g5DeleteConfirmExecuteBridgeInstalled = true;
  6792: 
  6793:         document.addEventListener("click", function aicmR8zV9g5DeleteConfirmClickBridge(ev) {
  6794:           try {
  6795:             var target = ev && ev.target;
  6796:             var btn = target && typeof target.closest === "function"
  6797:               ? target.closest("[data-core-action], button")
  6798:               : null;
  6799: 
  6800:             if (!btn || !btn.getAttribute) return;
  6801: 
  6802:             var action = aicmR8zV9g5Text(btn.getAttribute("data-core-action"));
  6803:             var label = aicmR8zV9g5Text(btn.textContent || btn.innerText || "");
  6804: 
  6805:             var isDeleteExecuteAction =
  6806:               action === "pmlw-major-delete-execute" ||
  6807:               action === "manager-major-delete-execute" ||
  6808:               action === "major-delete-execute" ||
  6809:               action === "delete-major-confirm" ||
  6810:               action === "r8z-v9g-delete-execute" ||
  6811:               action === "r8z-v9g5-delete-execute";
  6812: 
  6813:             var isDeleteCancelAction =
  6814:               action === "pmlw-major-delete-cancel" ||
  6815:               action === "manager-major-delete-cancel" ||
  6816:               action === "major-delete-cancel" ||
  6817:               action === "delete-major-cancel" ||
  6818:               action === "r8z-v9g-delete-cancel" ||
  6819:               action === "r8z-v9g5-delete-cancel";
  6820: 
  6821:             var hasDeleteState = !!aicmR8zV9g5DeleteConfirmState();
  6822: 
  6823:             if (!isDeleteExecuteAction && hasDeleteState && /削除/.test(label) && /確定|実行|削除する|はい/.test(label)) {
  6824:               isDeleteExecuteAction = true;
  6825:             }
  6826: 
  6827:             if (!isDeleteCancelAction && hasDeleteState && /キャンセル|戻る|いいえ/.test(label)) {
  6828:               isDeleteCancelAction = true;
  6829:             }
  6830: 
  6831:             if (isDeleteExecuteAction) {
  6832:               ev.preventDefault();
  6833:               ev.stopPropagation();
  6834:               aicmR8zV9g5ExecuteDeleteConfirm(btn);
  6835:               return;
  6836:             }
  6837: 
  6838:             if (isDeleteCancelAction) {
  6839:               ev.preventDefault();
  6840:               ev.stopPropagation();
  6841:               aicmR8zV9g5CancelDeleteConfirm();
  6842:             }
  6843:           } catch (error) {
  6844:             try {
  6845:               if (typeof setMessage === "function") setMessage("error", error && error.message ? error.message : "削除操作でエラーが発生しました。");
  6846:               if (typeof render === "function") render();
  6847:             } catch (_) {}
  6848:           }
  6849:         }, true);
  6850:       }
  6851:     }
  6852:   } catch (error) {
  6853:     try {
  6854:       if (typeof console !== "undefined" && console.warn) {
  6855:         console.warn("AICM R8Z-V9G5 delete confirm execute bridge install skipped", error);

---- server context extract head ----


============================================================
PATTERN: function getContext
============================================================

---- hit 1 line 726 ----
   651:     "  UPDATE business.aicm_user_company",
   652:     "  SET company_name = " + sqlLiteral(name) + ",",
   653:     "      business_domain = " + aicmOrgUpdateTextSql(body.business_domain || body.businessDomain) + ",",
   654:     "      company_common_rules_text = " + aicmOrgUpdateTextSql(body.company_common_rules_text || body.companyCommonRulesText) + ",",
   655:     "      president_policy_instruction_text = " + aicmOrgUpdateTextSql(body.president_policy_instruction_text || body.presidentPolicyInstructionText) + ",",
   656:     "      updated_at = now()",
   657:     "  WHERE aicm_user_company_id = " + sqlLiteral(companyId) + "::uuid",
   658:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   659:     "  RETURNING *",
   660:     ")",
   661:     "SELECT jsonb_build_object(",
   662:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   663:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   664:     "  'company', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   665:     ")::text;"
   666:   ].join("\n");
   667: 
   668:   return runPsqlJson(sql);
   669: }
   670: 
   671: function updateDepartment(body) {
   672:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   673:   const departmentId = requiredUuid(body.aicm_user_company_department_id, "aicm_user_company_department_id");
   674:   const name = requiredText(body.department_name || body.departmentName, "department_name");
   675:   const status = aicmOrgUpdateStatus(body.department_status || body.department_status_code, ["active", "inactive", "archived"], "active");
   676: 
   677:   const sql = [
   678:     "WITH updated AS (",
   679:     "  UPDATE business.aicm_user_company_department",
   680:     "  SET department_name = " + sqlLiteral(name) + ",",
   681:     "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
   682:     "      department_status = " + sqlLiteral(status) + ",",
   683:     "      updated_at = now()",
   684:     "  WHERE aicm_user_company_department_id = " + sqlLiteral(departmentId) + "::uuid",
   685:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   686:     "  RETURNING *",
   687:     ")",
   688:     "SELECT jsonb_build_object(",
   689:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   690:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   691:     "  'department', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   692:     ")::text;"
   693:   ].join("\n");
   694: 
   695:   return runPsqlJson(sql);
   696: }
   697: 
   698: function updateSection(body) {
   699:   const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
   700:   const sectionId = requiredUuid(body.aicm_user_company_section_id, "aicm_user_company_section_id");
   701:   const name = requiredText(body.section_name || body.sectionName, "section_name");
   702:   const status = aicmOrgUpdateStatus(body.section_status || body.section_status_code, ["active", "inactive", "archived"], "active");
   703: 
   704:   const sql = [
   705:     "WITH updated AS (",
   706:     "  UPDATE business.aicm_user_company_section",
   707:     "  SET section_name = " + sqlLiteral(name) + ",",
   708:     "      purpose = " + aicmOrgUpdateTextSql(body.purpose) + ",",
   709:     "      section_status = " + sqlLiteral(status) + ",",
   710:     "      updated_at = now()",
   711:     "  WHERE aicm_user_company_section_id = " + sqlLiteral(sectionId) + "::uuid",
   712:     "    AND owner_civilization_id = " + sqlLiteral(owner) + "::uuid",
   713:     "  RETURNING *",
   714:     ")",
   715:     "SELECT jsonb_build_object(",
   716:     "  'result', CASE WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok' ELSE 'not_found' END,",
   717:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   718:     "  'section', COALESCE((SELECT to_jsonb(updated) FROM updated), '{}'::jsonb)",
   719:     ")::text;"
   720:   ].join("\n");
   721: 
   722:   return runPsqlJson(sql);
   723: }
   724: 
   725: 
   726: function getContext(ownerCivilizationId) {
   727:   const owner = requiredUuid(ownerCivilizationId, "owner_civilization_id");
   728: 
   729:   const sql = [
   730:     "SELECT jsonb_build_object(",
   731:     "  'result', 'ok',",
   732:     "  'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
   733:     "  'owner_civilization_id', " + sqlLiteral(owner) + ",",
   734:     "  'companies', (",
   735:     "    SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC), '[]'::jsonb)",
   736:     "    FROM business.aicm_user_company c",
   737:     "    WHERE c.owner_civilization_id::text = " + sqlLiteral(owner),
   738:     "      AND c.company_status = 'active'",
   739:     "  ),",
   740:     "  'departments', (",
   741:     "    SELECT COALESCE(jsonb_agg(to_jsonb(d) ORDER BY d.display_order, d.created_at), '[]'::jsonb)",
   742:     "    FROM business.aicm_user_company_department d",
   743:     "    WHERE d.owner_civilization_id::text = " + sqlLiteral(owner),
   744:     "      AND d.department_status = 'active'",
   745:     "  ),",
   746:     "  'sections', (",
   747:     "    SELECT COALESCE(jsonb_agg(to_jsonb(s) ORDER BY s.display_order, s.created_at), '[]'::jsonb)",
   748:     "    FROM business.aicm_user_company_section s",
   749:     "    WHERE s.owner_civilization_id::text = " + sqlLiteral(owner),
   750:     "      AND s.section_status = 'active'",
   751:     "  ),",
   752:     "  'placements', (",
   753:     "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC), '[]'::jsonb)",
   754:     "    FROM business.vw_aicm_user_company_worker_placement_display p",
   755:     "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
   756:     "      AND p.status_code = 'active'",
   757:     "  ),",
   758:     "  'task_ledger', (",
   759:     "    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.display_order, t.created_at DESC), '[]'::jsonb)",
   760:     "    FROM business.vw_aicm_user_company_department_task_ledger_display t",
   761:     "    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),
   762:     "      AND t.task_status_code <> 'archived'",
   763:     "  ),",
   764:     // AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQP_AQS_V1
   765:     "  'pmlw_president_policies', (",
   766:     "    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",
   767:     "    FROM business.vw_aicm_pmlw_president_policy_display p",
   768:     "    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),
   769:     "  ),",
   770:     "  'pmlw_major_items', (",
   771:     "    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",
   772:     "    FROM business.vw_aicm_pmlw_major_work_display m",
   773:     "    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),
   774:     "  ),",
   775:     "  'pmlw_middle_items', (",
   776:     "    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",
   777:     "    FROM business.vw_aicm_pmlw_leader_middle_display l",
   778:     "    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),
   779:     "  ),",
   780:     "  'pmlw_deliverable_requirements', (",
   781:     "    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",
   782:     "    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",
   783:     "    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),

============================================================
7. final classification
============================================================
FINAL_JUDGEMENT=V10L_C0_CAUSE_AUDIT_INCOMPLETE_CHECK_REPORT
DB_MAJOR_COUNT=38
DB_MAJOR_VIEW_COUNT=38
DB_MAJOR_WITHOUT_MIDDLE=34
CORE_RENDER_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/030_core_registered_major_renderer_extract.txt
CORE_CONTEXT_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/040_core_context_normalize_extract.txt
CORE_EVENT_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/050_core_event_handler_extract.txt
SERVER_CONTEXT_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/060_server_context_extract.txt
CLASSIFY=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/070_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/000_R8Z_V10L_C0_ROOT_CAUSE_AUDIT_ONLY_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO
SERVER_RESTART=NO

WHAT_TO_SEND_BACK:
- このDONE末尾
- 可能なら以下の4ファイルの先頭〜該当箇所:
  1. /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/030_core_registered_major_renderer_extract.txt
  2. /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/040_core_context_normalize_extract.txt
  3. /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/050_core_event_handler_extract.txt
  4. /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c0_root_cause_audit_only_20260504_112525/060_server_context_extract.txt

判断方針:
- 既存レンダラーが特定できたら、DOM後付けではなく、そのレンダラー本体に選択UIを入れる
- データ元がcontextと違うなら、まずnormalizeContextかrendererの配列参照を正規化する
- 各カードの個別ボタン削除も、DOM非表示ではなくレンダー元から出さない形に寄せる
