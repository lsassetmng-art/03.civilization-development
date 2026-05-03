# AICompanyManager ChatGPT Review

generated_at: 2026-05-01 05:56:59 +0900
db_write: NO
api_post: NO

## 1. Server log
```text
AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794
```

## 2. Core scan
```text
1940-    return [
1941-      '<label>' + escapeHtml(roleCode.label) + 'ロボット',
1942-      '<select id="' + escapeHtml(id) + '">',
1943-      aicmInlineRobotOptions(roleCode.code),
1944-      '</select>',
1945-      '</label>',
1946-      '<label>' + escapeHtml(roleCode.label) + '社内通称',
1947-      '<input id="' + escapeHtml(id + "-nickname") + '" type="text" placeholder="例: ' + escapeHtml(roleCode.placeholder) + '">',
1948-      '</label>'
1949-    ].join("");
1950-  }
1951-
1952-function aicmAvdWorkerRows() {
1953-    if (typeof renderAicmWorkerInlineRows === "function") {
1954-      return renderAicmWorkerInlineRows();
1955-    }
1956-
1957-    return [
1958-      '<div class="aicm-inline-worker-row" data-worker-slot-index="0">',
1959-      '<label>従業員ロボット<select id="aicm-inline-worker-0-robot">' + aicmInlineRobotOptions("worker") + '</select></label>',
1960-      '<label>従業員社内通称<input id="aicm-inline-worker-0-nickname" type="text" placeholder="例: 作業担当A"></label>',
1961-      '</div>'
1962-    ].join("");
1963-  }
1964-
1965:function aicmAvdRoleSummaryRows(prefix) {
1966-    var rows = [];
1967-
1968-    function push(label, robotId, nicknameId) {
1969-      var robot = aicmAvdTextById(robotId);
1970-      var nickname = aicmAvdTextById(nicknameId);
1971-      rows.push([label + "ロボット", robot || "未設定"]);
1972-      rows.push([label + "社内通称", nickname || "未設定"]);
1973-    }
1974-
1975-    if (prefix === "company") {
1976-      push("社長", "aicm-company-president-robot", "aicm-company-president-robot-nickname");
1977-    }
1978-
1979-    if (prefix === "department") {
1980-      push("部長", "aicm-department-manager-robot", "aicm-department-manager-robot-nickname");
1981-    }
1982-
1983-    if (prefix === "section") {
1984-      push("課長", "aicm-section-leader-robot", "aicm-section-leader-robot-nickname");
1985-
1986-      var workerRows = [];
1987-      var index = 0;
1988-
1989-      while (true) {
1990-        var robotEl = document.getElementById("aicm-inline-worker-" + index + "-robot");

921-}
922-
923-function aicmAxcCatalogRowByValue(value) {
924-  var text = String(value || "").trim();
925-  if (!text) return null;
926-  var rows = typeof aicmRobotCatalogSafe === "function" ? aicmRobotCatalogSafe() : [];
927-  for (var i = 0; i < rows.length; i += 1) {
928-    var row = rows[i] || {};
929-    var values = [
930-      typeof aicmRobotValue === "function" ? aicmRobotValue(row) : "",
931-      row.robot_pool_id,
932-      row.business_robot_pool_id,
933-      row.aicm_robot_pool_id,
934-      row.worker_pool_id,
935-      row.placement_robot_pool_id,
936-      row.aiworker_model_code,
937-      row.model_code,
938-      row.robot_id
939-    ].map(function (item) { return String(item || "").trim(); });
940-
941-    if (values.indexOf(text) >= 0) return row;
942-  }
943-  return null;
944-}
945-
946:function aicmAxcSelectedRobotMeta(selectOrId) {
947-  var el = typeof selectOrId === "string" ? document.getElementById(selectOrId) : selectOrId;
948-  if (!el) return null;
949-
950-  var selectedValue = String(el.value || "").trim();
951-  var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
952-  var row = aicmAxcCatalogRowByValue(selectedValue) || {};
953-
954-  var robotPoolId = String(
955-    row.robot_pool_id ||
956-    row.business_robot_pool_id ||
957-    row.aicm_robot_pool_id ||
958-    row.worker_pool_id ||
959-    row.placement_robot_pool_id ||
960-    (aicmAxcUuidLike(selectedValue) ? selectedValue : "")
961-  ).trim();
962-
963-  var modelCode = String(
964-    row.aiworker_model_code ||
965-    row.model_code ||
966-    row.aiworkerModelCode ||
967-    (opt ? opt.getAttribute("data-model") || "" : "") ||
968-    (!aicmAxcUuidLike(selectedValue) ? selectedValue : "")
969-  ).trim();
970-
971-  if (!robotPoolId && !modelCode) return null;

1057-      "aicm-role-worker-section-nickname-" + String(index),
1058-      "aicm-role-worker-section-new-nickname-" + String(index)
1059-    ]);
1060-
1061-    if (!robotEl && !nickEl) break;
1062-
1063-    var worker = aicmAxcSelectedRobotMeta(robotEl);
1064-    var workerRow = aicmAxcBuildRolePlacement({
1065-      role_code: "Worker",
1066-      target_level_code: "section",
1067-      target_id: section.aicm_user_company_section_id,
1068-      aicm_user_company_department_id: section.aicm_user_company_department_id,
1069-      aicm_user_company_section_id: section.aicm_user_company_section_id,
1070-      robot_pool_id: worker ? worker.robot_pool_id : "",
1071-      aiworker_model_code: worker ? worker.aiworker_model_code : "",
1072-      internal_nickname: nickEl ? String(nickEl.value || "").trim() : ""
1073-    });
1074-    if (workerRow) rows.push(workerRow);
1075-
1076-    index += 1;
1077-  }
1078-
1079-  return rows;
1080-}
1081-
1082:async function aicmAxcSyncRolePlacementsForPayload(payload) {
1083-  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];
1084-  if (!rows.length) return { result: "ok", skipped: true };
1085-
1086-  var body = payload.body || {};
1087-  var companyId = body.aicm_user_company_id || "";
1088-  if (!companyId && state && state.selectedCompanyId) companyId = state.selectedCompanyId;
1089-
1090-  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
1091-    method: "POST",
1092-    body: JSON.stringify({
1093-      owner_civilization_id: ownerId(),
1094-      aicm_user_company_id: companyId,
1095-      role_placements: rows
1096-    })
1097-  });
1098-}
1099-
1100-
1101-function saveCompanyUpdateFromForm() {
1102-    var companyId = aicmAvdTextById("aicm-company-edit-id");
1103-
1104-    if (!companyId) {
1105-      setMessage("error", "変更対象の企業が見つかりません。");
1106-      return;
1107-    }
```

## 3. Server sync scan
```text
1082-  const text = String(value || "").trim();
1083-  return /^[0-9a-fA-F-]{36}$/.test(text) ? sqlLiteral(text) + "::uuid" : "NULL";
1084-}
1085-
1086-function aicmRoleSyncRole(value) {
1087-  const text = String(value || "").trim().toLowerCase();
1088-  if (text === "president") return "President";
1089-  if (text === "manager") return "Manager";
1090-  if (text === "leader") return "Leader";
1091-  if (text === "worker" || text === "employee") return "Worker";
1092-  throw new Error("invalid role_code");
1093-}
1094-
1095-function aicmRoleSyncTargetLevel(value) {
1096-  const text = String(value || "").trim().toLowerCase();
1097-  if (text === "company") return "company";
1098-  if (text === "department") return "department";
1099-  if (text === "section" || text === "organization") return "section";
1100-  throw new Error("invalid target_level_code");
1101-}
1102-
1103-function aicmRoleSyncRows(body) {
1104-  const rows = Array.isArray(body.role_placements) ? body.role_placements : [];
1105-  return rows.slice(0, 30).map((row, index) => {
1106-    const roleCode = aicmRoleSyncRole(row.role_code || row.roleCode);
1107-    const targetLevelCode = aicmRoleSyncTargetLevel(row.target_level_code || row.targetLevelCode);
1108-    return {
1109-      row_order: index,
1110-      role_code: roleCode,
1111-      target_level_code: targetLevelCode,
1112-      aicm_user_company_department_id: String(row.aicm_user_company_department_id || row.departmentId || "").trim(),
1113-      aicm_user_company_section_id: String(row.aicm_user_company_section_id || row.sectionId || row.organizationId || "").trim(),
1114-      target_id: String(row.target_id || row.targetId || "").trim(),
1115-      robot_pool_id: String(row.robot_pool_id || row.robotPoolId || "").trim(),
1116-      aiworker_model_code: String(row.aiworker_model_code || row.aiworkerModelCode || "").trim(),
1117-      internal_nickname: String(row.internal_nickname || row.internalNickname || "").trim()
1118-    };
1119-  });
1120-}
1121-
1122:function syncRoleSettings(body) {
1123-  const owner = requiredUuid(body.owner_civilization_id, "owner_civilization_id");
1124-  const companyId = requiredUuid(body.aicm_user_company_id, "aicm_user_company_id");
1125-  const submittedRows = aicmRoleSyncRows(body);
1126-
1127-  const targetKeys = [];
1128-  const insertRows = [];
1129-
1130-  for (const row of submittedRows) {
1131-    const targetId = row.target_id ||
1132-      (row.target_level_code === "company" ? companyId : "") ||
1133-      (row.target_level_code === "department" ? row.aicm_user_company_department_id : "") ||
1134-      (row.target_level_code === "section" ? row.aicm_user_company_section_id : "");
1135-
1136-    if (!targetId) continue;
1137-
1138-    const key = [row.target_level_code, targetId, row.role_code].join("|");
1139-
1140-    if (!targetKeys.some((item) => item.key === key)) {
1141-      targetKeys.push({
1142-        key,
1143-        target_level_code: row.target_level_code,
1144-        target_id: targetId,
1145-        role_code: row.role_code,
1146-        aicm_user_company_department_id: row.aicm_user_company_department_id,
1147-        aicm_user_company_section_id: row.aicm_user_company_section_id
1148-      });
1149-    }
1150-
1151-    if (!row.robot_pool_id && !row.aiworker_model_code) continue;
1152-
1153-    insertRows.push({
1154-      ...row,
1155-      target_id: targetId,
1156-      aiworker_model_code: row.aiworker_model_code || "unknown"
1157-    });
1158-  }
1159-
1160-  if (targetKeys.length === 0) {
1161-    return {
1162-      result: "ok",
```
