# AICompanyManager Role Save Failure Review

generated_at: 2026-05-01 06:28:45 +0900
patch: NO
api_post: NO
db_persistent_write: NO
db_rollback_smoke: YES

## Summary

- OWNER_ID=00000000-0000-4000-8000-000000000001
- COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
- ROBOT_POOL_ID=9f7316fc-6f2f-46a8-bc81-ce1598450ce5
- AIWORKER_MODEL_CODE=BYD2-003
- INDEX_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## Node check
```text
============================================================
node --check
============================================================
SERVER_NODE_CHECK_CODE=0
CORE_NODE_CHECK_CODE=0
```

## DB lookup
```text
OWNER_COMPANY|00000000-0000-4000-8000-000000000001|8b9be487-7b74-4517-9b59-6c84a82ae6aa|ウルフ
ROBOT_BYD2_003|9f7316fc-6f2f-46a8-bc81-ce1598450ce5|BYD2-003|ASIC Leader3
ROBOT_FIRST_ACTIVE|39542e29-5097-450c-94e3-ddc02d5c0fa5|HD-R2S|Sniper
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
ROBOT_POOL_ID=9f7316fc-6f2f-46a8-bc81-ce1598450ce5
AIWORKER_MODEL_CODE=BYD2-003
```

## Rollback smoke
```text
============================================================
AXJ rollback smoke: placement sync SQL
============================================================
BEGIN
                                                 jsonb_build_object                                                 
--------------------------------------------------------------------------------------------------------------------
 {"result": "ok", "placement_id": "62413f3f-d0c3-4fcf-af01-0267f85f71d8", "archived_count": 0, "inserted_count": 1}
(1 row)

ROLLBACK
============================================================
AXJ rollback smoke completed and rolled back
============================================================
ROLLBACK_CODE=0
```

## Code scan
```text
============================================================
Core request functions
============================================================
90-    return value === null || value === undefined ? "" : String(value);
91-  }
92-
93-  function escapeHtml(value) {
94-    return text(value)
95-      .replace(/&/g, "&amp;")
96-      .replace(/</g, "&lt;")
97-      .replace(/>/g, "&gt;")
98-      .replace(/"/g, "&quot;")
99-      .replace(/'/g, "&#39;");
100-  }
101-
102-  function publicErrorMessage(error) {
103-    var message = error && error.message ? String(error.message) : String(error || "不明なエラーです。");
104-    message = message.replace(new RegExp("post" + "gres(?:ql)?://" + "[^\\s\'\\\"]+", "g"), "[DB_CONNECTION_REDACTED]");
105-    if (message.length > 500) {
106-      message = message.slice(0, 500) + "...";
107-    }
108-    return message;
109-  }
110-
111-  function endpointWithOwner() {
112-    return API.context + "?owner_civilization_id=" + encodeURIComponent(state.ownerCivilizationId);
113-  }
114-
115:  function requestJson(url, body) {
116-    var options = body ? {
117-      method: "POST",
118-      headers: { "content-type": "application/json" },
119-      body: JSON.stringify(body)
120-    } : {
121-      method: "GET"
122-    };
123-
124-    return window.fetch(url, options)
125-      .then(function (response) {
126-        return response.json().then(function (json) {
127-          if (!response.ok || !json || json.result !== "ok") {
128-            throw new Error(json && json.error_message ? json.error_message : "API error");
129-          }
130-          return json;
131-        });
132-      });
133-  }
134-
135-  
136-function normalizeContext(json) {
137-    json = json || {};
138-    return {
139-      companies: Array.isArray(json.companies) ? json.companies : [],
140-      departments: Array.isArray(json.departments) ? json.departments : [],
--
236-      state.selectedSectionId = "";
237-      writeStorage(STORAGE.selectedDepartmentId, "");
238-      writeStorage(STORAGE.selectedSectionId, "");
239-    }
240-  }
241-
242-  function syncSelectionAfterContextLoad() {
243-    if (hasCompany(state.selectedCompanyId)) {
244-      setSelectedCompany(state.selectedCompanyId);
245-      return;
246-    }
247-
248-    if (state.context.companies[0]) {
249-      setSelectedCompany(state.context.companies[0].aicm_user_company_id);
250-      return;
251-    }
252-
253-    setSelectedCompany("");
254-  }
255-
256-  function loadContext() {
257-    state.loading = true;
258-    state.errorMessage = "";
259-    render();
260-
261:    return requestJson(endpointWithOwner())
262-      .then(function (json) {
263-        state.context = normalizeContext(json);
264-        writeStorage(STORAGE.contextCache, JSON.stringify(state.context));
265-        syncSelectionAfterContextLoad();
266-        state.loading = false;
267-        state.booted = true;
268-        render();
269-      })
270-      .catch(function (error) {
271-        state.loading = false;
272-        state.errorMessage = publicErrorMessage(error);
273-        render();
274-      });
275-  }
276-
277-  function createCompany(payload) {
278:    return requestJson(API.createCompany, {
279-      owner_civilization_id: state.ownerCivilizationId,
280-      company_name: payload.companyName,
281-      business_domain: payload.businessDomain
282-    }).then(function (json) {
283-      if (json.company && json.company.aicm_user_company_id) {
284-        state.selectedCompanyId = json.company.aicm_user_company_id;
285-        writeStorage(STORAGE.selectedCompanyId, state.selectedCompanyId);
286-      }
287-      state.noticeMessage = "AI企業を作成しました。";
288-      return loadContext();
289-    });
290-  }
291-
292-  function createDepartment(payload) {
293-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
294-      throw new Error("先にv2のAI企業を作成・選択してください。");
295-    }
296-
297:    return requestJson(API.createDepartment, {
298-      owner_civilization_id: state.ownerCivilizationId,
299-      aicm_user_company_id: state.selectedCompanyId,
300-      department_name: payload.departmentName,
301-      purpose: payload.purpose
302-    }).then(function (json) {
303-      if (json.department && json.department.aicm_user_company_department_id) {
304-        state.selectedDepartmentId = json.department.aicm_user_company_department_id;
305-        writeStorage(STORAGE.selectedDepartmentId, state.selectedDepartmentId);
306-      }
307-      state.noticeMessage = "部門を作成しました。";
308-      return loadContext();
309-    });
310-  }
311-
312-  function createSection(payload) {
313-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
314-      throw new Error("先にv2のAI企業を作成・選択してください。");
315-    }
316-
317-    if (!state.selectedDepartmentId || !hasDepartment(state.selectedDepartmentId)) {
318-      throw new Error("先にv2の部門を作成・選択してください。");
319-    }
320-
321:    return requestJson(API.createSection, {
322-      owner_civilization_id: state.ownerCivilizationId,
323-      aicm_user_company_id: state.selectedCompanyId,
324-      aicm_user_company_department_id: state.selectedDepartmentId,
325-      section_name: payload.sectionName,
326-      purpose: payload.purpose
327-    }).then(function (json) {
328-      if (json.section && json.section.aicm_user_company_section_id) {
329-        state.selectedSectionId = json.section.aicm_user_company_section_id;
330-        writeStorage(STORAGE.selectedSectionId, state.selectedSectionId);
331-      }
332-      state.noticeMessage = "課を作成しました。";
333-      return loadContext();
334-    });
335-  }
336-
337-  function createPlacement(payload) {
338-    if (!state.selectedCompanyId || !hasCompany(state.selectedCompanyId)) {
339-      throw new Error("先にv2のAI企業を作成・選択してください。");
340-    }
341-
342:    return requestJson(API.createPlacement, {
343-      owner_civilization_id: state.ownerCivilizationId,
344-      aicm_user_company_id: state.selectedCompanyId,
345-      aicm_user_company_department_id: payload.departmentId || "",
346-      aicm_user_company_section_id: payload.sectionId || "",
347-      target_level_code: payload.targetLevelCode,
348-      target_id: payload.targetId,
349-      role_code: payload.roleCode,
350-      robot_pool_id: payload.robotPoolId,
351-      aiworker_model_code: payload.aiworkerModelCode,
352-      internal_nickname: payload.internalNickname
353-    }).then(function () {
354-      state.noticeMessage = "Worker配置を作成しました。";
355-      return loadContext();
356-    });
357-  }
358-
359-  
360-function setMessage(kind, message) {
361-    if (kind === "ok") {
362-      state.noticeMessage = String(message || "");
363-      state.errorMessage = "";
364-      return;
365-    }
366-
367-    state.errorMessage = String(message || "");
--
573-    });
574-  }
575-
576-  function aicmOrgSectionsForCompany(companyId) {
577-    return aicmOrgSections().filter(function (row) {
578-      return !companyId || row.aicm_user_company_id === companyId;
579-    });
580-  }
581-
582-  function aicmOrgSectionsForDepartment(departmentId) {
583-    return aicmOrgSections().filter(function (row) {
584-      return !departmentId || row.aicm_user_company_department_id === departmentId;
585-    });
586-  }
587-
588-  function aicmOrgValue(id) {
589-    var el = document.getElementById(id);
590-    return el ? String(el.value || "").trim() : "";
591-  }
592-
593-  function aicmOrgSetScreen(screen) {
594-    state.screen = screen;
595-    if (typeof render === "function") render();
596-  }
597-
598:  async function aicmOrgPostJson(path, body) {
599-    var response = await fetch(path, {
600-      method: "POST",
601-      headers: { "Content-Type": "application/json" },
602-      body: JSON.stringify(body || {})
603-    });
604-
605-    var text = await response.text();
606-    var json = {};
607-
608-    try {
609-      json = text ? JSON.parse(text) : {};
610-    } catch (_) {
611-      json = { result: "error", message: text || "Invalid server response" };
612-    }
613-
614-    if (!response.ok || (json.result && json.result !== "ok")) {
615-      throw new Error(json.message || json.error || ("API failed: " + path));
616-    }
617-
618-    return json;
619-  }
620-
621-  async function aicmOrgReloadContext() {
622-    if (typeof aicmPmlwReloadContext === "function") {
623-      await aicmPmlwReloadContext();
--
854-      '</section>'
855-    ].join(""));
856-  }
857-
858-
859-  function aicmOrgShowUpdateConfirm(payload) {
860-    state.pendingOrgUpdate = payload || null;
861-    var root = document.getElementById("aicm-root");
862-    if (!root) {
863-      setMessage("error", "確認画面を表示できません。");
864-      return;
865-    }
866-
867-    root.innerHTML = renderAicmOrgUpdateConfirmation(payload || {});
868-  }
869-
870-  async function executeAicmOrgUpdateConfirm() {
871-    var payload = state.pendingOrgUpdate || null;
872-
873-    if (!payload || !payload.endpoint || !payload.body) {
874-      setMessage("error", "確認対象がありません。");
875-      return;
876-    }
877-
878-    try {
879:      await aicmOrgPostJson(payload.endpoint, payload.body);
880-            // AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE
881-      await aicmAxcSyncRolePlacementsForPayload(payload);
882-state.pendingOrgUpdate = null;
883-
884-      if (payload.kind === "department") state.editingDepartmentId = "";
885-      if (payload.kind === "section") state.editingSectionId = "";
886-
887-      setMessage("ok", aicmOrgUpdateLabel(payload.kind) + "を保存しました。");
888-      await aicmOrgReloadContext();
889-    } catch (error) {
890-      setMessage("error", error && error.message ? error.message : "保存に失敗しました。");
891-    }
892-  }
893-
894-  function cancelAicmOrgUpdateConfirm() {
895-    var payload = state.pendingOrgUpdate || {};
896-    state.pendingOrgUpdate = null;
897-
898-    if (payload.returnScreen) {
899-      state.screen = payload.returnScreen;
900-    }
901-
902-    if (typeof render === "function") render();
903-  }
904-
--
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
1082-async function aicmAxcSyncRolePlacementsForPayload(payload) {
1083-  // AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1
1084-  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];
1085-
1086-  if (!rows.length) {
1087-    return { result: "ok", skipped: true };
1088-  }
1089-
1090-  var body = payload.body || {};
1091-  var companyId = body.aicm_user_company_id || "";
1092-
1093-  if (!companyId && state && state.selectedCompanyId) {
1094-    companyId = state.selectedCompanyId;
1095-  }
1096-
1097:  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
1098-    owner_civilization_id: ownerId(),
1099-    aicm_user_company_id: companyId,
1100-    role_placements: rows
1101-  });
1102-}
1103-
1104-
1105-function saveCompanyUpdateFromForm() {
1106-    var companyId = aicmAvdTextById("aicm-company-edit-id");
1107-
1108-    if (!companyId) {
1109-      setMessage("error", "変更対象の企業が見つかりません。");
1110-      return;
1111-    }
1112-
1113-    var body = {
1114-      owner_civilization_id: aicmAvdOwnerId(),
1115-      aicm_user_company_id: companyId,
1116-      company_name: aicmAvdTextById("aicm-company-edit-name"),
1117-      business_domain: aicmAvdTextById("aicm-company-edit-domain"),
1118-      company_status: aicmAvdTextById("aicm-company-edit-status") || "active"
1119-    };
1120-
1121-    var rows = [
1122-      ["操作", "企業変更"],

============================================================
Confirm execute function
============================================================
825-    if (!keys.length) return '<p class="aicm-core-empty">表示できる変更項目がありません。</p>';
826-
827-    return keys.map(function (key) {
828-      return [
829-        '<div class="aicm-confirm-row">',
830-        '  <strong>' + escapeHtml(key) + '</strong>',
831-        '  <p>' + escapeHtml(String(body[key] || "")) + '</p>',
832-        '</div>'
833-      ].join("");
834-    }).join("");
835-  }
836-
837-  
838-function renderAicmOrgUpdateConfirmation(payload) {
839-    payload = payload || {};
840-
841-    return renderShell([
842-      '<section class="aicm-core-card">',
843-      '  <p class="aicm-eyebrow">確認画面</p>',
844-      '  <h2>' + escapeHtml(payload.title || "変更内容の確認") + '</h2>',
845-      '  <p class="aicm-selected-note">この操作はDBへ保存されます。内容を確認してから確定してください。</p>',
846-      '</section>',
847-      aicmAvdSummaryHtml(payload),
848-      '<section class="aicm-core-card aicm-operation-card">',
849-      '  <p class="aicm-eyebrow">操作</p>',
850-      '  <div class="aicm-dashboard-action-row">',
851-      '    <button type="button" data-core-action="org-update-confirm-execute">確定して保存</button>',
852-      '    <button type="button" data-core-action="org-update-confirm-cancel">戻る</button>',
853-      '  </div>',
854-      '</section>'
855-    ].join(""));
856-  }
857-
858-
859-  function aicmOrgShowUpdateConfirm(payload) {
860-    state.pendingOrgUpdate = payload || null;
861-    var root = document.getElementById("aicm-root");
862-    if (!root) {
863-      setMessage("error", "確認画面を表示できません。");
864-      return;
865-    }
866-
867-    root.innerHTML = renderAicmOrgUpdateConfirmation(payload || {});
868-  }
869-
870:  async function executeAicmOrgUpdateConfirm() {
871-    var payload = state.pendingOrgUpdate || null;
872-
873-    if (!payload || !payload.endpoint || !payload.body) {
874-      setMessage("error", "確認対象がありません。");
875-      return;
876-    }
877-
878-    try {
879-      await aicmOrgPostJson(payload.endpoint, payload.body);
880-            // AICM_AXC_EXECUTE_ROLE_PLACEMENT_SYNC_AFTER_MAIN_UPDATE
881-      await aicmAxcSyncRolePlacementsForPayload(payload);
882-state.pendingOrgUpdate = null;
883-
884-      if (payload.kind === "department") state.editingDepartmentId = "";
885-      if (payload.kind === "section") state.editingSectionId = "";
886-
887-      setMessage("ok", aicmOrgUpdateLabel(payload.kind) + "を保存しました。");
888-      await aicmOrgReloadContext();
889-    } catch (error) {
890-      setMessage("error", error && error.message ? error.message : "保存に失敗しました。");
891-    }
892-  }
893-
894-  function cancelAicmOrgUpdateConfirm() {
895-    var payload = state.pendingOrgUpdate || {};
896-    state.pendingOrgUpdate = null;
897-
898-    if (payload.returnScreen) {
899-      state.screen = payload.returnScreen;
900-    }
901-
902-    if (typeof render === "function") render();
903-  }
904-
905-
906-  
907-
908-// AICM_ROLE_SETTINGS_SYNC_AXC_V1
909-// Role settings are saved through a dedicated placement sync endpoint after the main entity update succeeds.
910-// Main company/department/section fields remain separate from robot placement truth.
911-function aicmAxcUuidLike(value) {
912-  return /^[0-9a-fA-F-]{36}$/.test(String(value || "").trim());
913-}
914-
915-function aicmAxcFindElement(ids) {

============================================================
Placement sync client function
============================================================
1037-    aicm_user_company_department_id: section.aicm_user_company_department_id,
1038-    aicm_user_company_section_id: section.aicm_user_company_section_id,
1039-    robot_pool_id: leader ? leader.robot_pool_id : "",
1040-    aiworker_model_code: leader ? leader.aiworker_model_code : "",
1041-    internal_nickname: aicmAxcInputValue("aicm-section-leader-robot-nickname")
1042-  });
1043-  if (leaderRow) rows.push(leaderRow);
1044-
1045-  var index = 0;
1046-  while (index < 30) {
1047-    var robotEl = aicmAxcFindElement([
1048-      "aicm-inline-worker-" + String(index) + "-robot",
1049-      "aicm-role-worker-robot-" + String(index),
1050-      "aicm-role-worker-section-robot-" + String(index),
1051-      "aicm-role-worker-section-new-robot-" + String(index)
1052-    ]);
1053-
1054-    var nickEl = aicmAxcFindElement([
1055-      "aicm-inline-worker-" + String(index) + "-nickname",
1056-      "aicm-role-worker-nickname-" + String(index),
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
1083-  // AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1
1084-  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];
1085-
1086-  if (!rows.length) {
1087-    return { result: "ok", skipped: true };
1088-  }
1089-
1090-  var body = payload.body || {};
1091-  var companyId = body.aicm_user_company_id || "";
1092-
1093-  if (!companyId && state && state.selectedCompanyId) {
1094-    companyId = state.selectedCompanyId;
1095-  }
1096-
1097-  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
1098-    owner_civilization_id: ownerId(),
1099-    aicm_user_company_id: companyId,
1100-    role_placements: rows
1101-  });
1102-}
1103-
1104-
1105-function saveCompanyUpdateFromForm() {
1106-    var companyId = aicmAvdTextById("aicm-company-edit-id");
1107-
1108-    if (!companyId) {
1109-      setMessage("error", "変更対象の企業が見つかりません。");
1110-      return;
1111-    }
1112-
1113-    var body = {
1114-      owner_civilization_id: aicmAvdOwnerId(),
1115-      aicm_user_company_id: companyId,
1116-      company_name: aicmAvdTextById("aicm-company-edit-name"),
1117-      business_domain: aicmAvdTextById("aicm-company-edit-domain"),
1118-      company_status: aicmAvdTextById("aicm-company-edit-status") || "active"
1119-    };
1120-
1121-    var rows = [
1122-      ["操作", "企業変更"],
1123-      ["企業名", body.company_name],
1124-      ["事業領域", body.business_domain || "未設定"],
1125-      ["状態", body.company_status]
1126-    ].concat(aicmAvdRoleSummaryRows("company"));
1127-

============================================================
Placement sync server function
============================================================
1052-    "  FROM company_ok",
1053-    "  RETURNING *",
1054-    ")",
1055-    "SELECT CASE",
1056-    "  WHEN EXISTS (SELECT 1 FROM inserted) THEN",
1057-    "    (SELECT jsonb_build_object(",
1058-    "      'result', 'ok',",
1059-    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
1060-    "      'placement', to_jsonb(inserted)",
1061-    "    ) FROM inserted)::text",
1062-    "  ELSE",
1063-    "    jsonb_build_object(",
1064-    "      'result', 'error',",
1065-    "      'api_identifier', " + sqlLiteral(SERVER_MARK) + ",",
1066-    "      'error_message', '先にv2のAI企業を作成・選択してください。'",
1067-    "    )::text",
1068-    "END;"
1069-  ].join("\n");
1070-
1071-  return runPsqlJson(sql);
1072-}
1073-
1074-
1075-
1076-// AICM_ROLE_SETTINGS_SYNC_AXC_V1
1077-// Synchronize President / Manager / Leader / Worker role settings.
1078-// Canonical table: business.aicm_user_company_worker_placement.
1079-// This endpoint archives current active placements for each submitted target+role,
1080-// then recreates submitted active rows. This prevents duplicate single-slot assignments.
1081-function aicmRoleSyncOptionalUuidSql(value) {
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
1163-      api_identifier: SERVER_MARK,
1164-      archived_count: 0,
1165-      inserted_count: 0,
1166-      placements: [],
1167-      note: "no role placement targets"
1168-    };
1169-  }
1170-
1171-  const targetValues = targetKeys.map((row, index) => [
1172-    "(",
1173-    String(index),
1174-    ", " + sqlLiteral(row.target_level_code),
1175-    ", " + sqlLiteral(row.target_id) + "::uuid",
1176-    ", " + sqlLiteral(row.role_code),
1177-    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
1178-    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
1179-    ")"
1180-  ].join("")).join(",\n    ");
1181-
1182-  const insertValues = insertRows.length ? insertRows.map((row, index) => [
1183-    "(",
1184-    String(index),
1185-    ", " + sqlLiteral(row.target_level_code),
1186-    ", " + sqlLiteral(row.target_id) + "::uuid",
1187-    ", " + sqlLiteral(row.role_code),
1188-    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_department_id),
1189-    ", " + aicmRoleSyncOptionalUuidSql(row.aicm_user_company_section_id),
1190-    ", " + aicmRoleSyncOptionalUuidSql(row.robot_pool_id),
1191-    ", " + sqlLiteral(row.aiworker_model_code),
1192-    ", " + sqlLiteral(row.internal_nickname),

============================================================
Placement sync route
============================================================
1373-    }
1374-
1375-    if (route === "/api/aicm/v2/section/create" && req.method === "POST") {
1376-      const payload = createSection(await readBody(req));
1377-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
1378-      return true;
1379-    }
1380-
1381-    
1382-    if (route === "/api/aicm/v2/task-ledger/create" && req.method === "POST") {
1383-      const payload = createTaskLedger(await readBody(req));
1384-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
1385-      return true;
1386-    }
1387-
1388:    if (route === "/api/aicm/v2/placement/sync-role-settings" && req.method === "POST") {
1389-      const payload = syncRoleSettings(await readBody(req));
1390-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
1391-      return true;
1392-    }
1393-
1394-if (route === "/api/aicm/v2/placement/create" && req.method === "POST") {
1395-      const payload = createPlacement(await readBody(req));
1396-      sendJson(res, payload && payload.result === "ok" ? 200 : 400, payload);
1397-      return true;
1398-    }
1399-
1400-    if (route.startsWith("/api/aicm/v2/")) {
1401-      sendJson(res, 404, {
1402-        result: "error",
1403-        api_identifier: SERVER_MARK,

============================================================
Bad old patterns
============================================================
117:      method: "POST",
119:      body: JSON.stringify(body)
600:      method: "POST",
602:      body: JSON.stringify(body || {})
2571:        method: "POST",
2573:        body: JSON.stringify(payload)
2858:      method: "POST",
2860:      body: JSON.stringify(body || {})
3207:          method: "POST",
3209:          body: JSON.stringify(row.payload)
3378:      method: "POST",
3380:      body: JSON.stringify(body || {})
```

## Server tail
```text
LATEST_SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/white_screen_async_async_fix_20260501_062138/040_server.log

AICompanyManager clean v2 API server candidate listening on http://127.0.0.1:8794
```

## HTTP
```text
SERVER_PIDS=15928
INDEX_HTTP_CODE=200
CONTEXT_HTTP_CODE=200
```
