const fs = require("fs");

const [,, corePath, verifyOut, extractOut, anchorOut] = process.argv;
let src = fs.readFileSync(corePath, "utf8");

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_D2_EXECUTE_PAYLOAD_VALIDATION_GATE";
const targetDeclaration = "function aicmExecuteLeaderHandoffConfirmR8S";
const payloadVar = "postBody";
const fetchNeedle = "fetch(";

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c += 1;
    from = idx + needle.length;
  }
  return c;
}

function makeLineWindow(lines, centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return { start, end, text: out.join("\n") };
}

if (count(src, marker) > 0) {
  throw new Error("C2F_D2_MARKER_ALREADY_EXISTS");
}

const lines = src.split(/\r?\n/);

const declLineIndex = lines.findIndex(line => line.includes(targetDeclaration));
if (declLineIndex < 0) throw new Error("TARGET_DECLARATION_NOT_FOUND");

let postBodyDeclLineIndex = -1;
for (let i = declLineIndex; i < Math.min(lines.length, declLineIndex + 120); i += 1) {
  if ((lines[i] || "").includes("const " + payloadVar) || (lines[i] || "").includes("let " + payloadVar) || (lines[i] || "").includes("var " + payloadVar)) {
    postBodyDeclLineIndex = i;
    break;
  }
}

if (postBodyDeclLineIndex < 0) throw new Error("POST_BODY_DECLARATION_NOT_FOUND");

let fetchLineIndex = -1;
for (let i = postBodyDeclLineIndex; i < Math.min(lines.length, postBodyDeclLineIndex + 80); i += 1) {
  if ((lines[i] || "").includes(fetchNeedle)) {
    fetchLineIndex = i;
    break;
  }
}

if (fetchLineIndex < 0) throw new Error("FETCH_ANCHOR_NOT_FOUND_AFTER_POST_BODY");

const declLineNo = declLineIndex + 1;
const postBodyDeclLineNo = postBodyDeclLineIndex + 1;
const fetchLineNo = fetchLineIndex + 1;
const beforeWindow = makeLineWindow(lines, fetchLineNo, 22, 18);

const insertedBlock = [
"    // " + marker + "_START",
"    // Execute-path payload validation gate.",
"    // Validates the existing postBody variable immediately before the network request.",
"    // This phase intentionally keeps API POST locked until explicit approval.",
"    try {",
"      function aicmC2fD2Text(value) {",
"        if (value === null || typeof value === \"undefined\") return \"\";",
"        return String(value).trim();",
"      }",
"",
"      function aicmC2fD2IsObject(value) {",
"        return value !== null && typeof value === \"object\" && !Array.isArray(value);",
"      }",
"",
"      function aicmC2fD2FindFirst(obj, keys, depth) {",
"        if (depth > 6 || obj === null || typeof obj === \"undefined\") return \"\";",
"        if (Array.isArray(obj)) {",
"          for (var aicmC2fD2AI = 0; aicmC2fD2AI < obj.length; aicmC2fD2AI += 1) {",
"            var aicmC2fD2AValue = aicmC2fD2FindFirst(obj[aicmC2fD2AI], keys, depth + 1);",
"            if (aicmC2fD2AValue) return aicmC2fD2AValue;",
"          }",
"          return \"\";",
"        }",
"        if (!aicmC2fD2IsObject(obj)) return \"\";",
"        for (var aicmC2fD2KI = 0; aicmC2fD2KI < keys.length; aicmC2fD2KI += 1) {",
"          var aicmC2fD2Key = keys[aicmC2fD2KI];",
"          if (Object.prototype.hasOwnProperty.call(obj, aicmC2fD2Key)) {",
"            var aicmC2fD2Direct = aicmC2fD2Text(obj[aicmC2fD2Key]);",
"            if (aicmC2fD2Direct) return aicmC2fD2Direct;",
"          }",
"        }",
"        var aicmC2fD2ObjKeys = Object.keys(obj);",
"        for (var aicmC2fD2OI = 0; aicmC2fD2OI < aicmC2fD2ObjKeys.length; aicmC2fD2OI += 1) {",
"          var aicmC2fD2Nested = aicmC2fD2FindFirst(obj[aicmC2fD2ObjKeys[aicmC2fD2OI]], keys, depth + 1);",
"          if (aicmC2fD2Nested) return aicmC2fD2Nested;",
"        }",
"        return \"\";",
"      }",
"",
"      function aicmC2fD2FindArray(obj, keys, depth) {",
"        if (depth > 6 || obj === null || typeof obj === \"undefined\") return [];",
"        if (Array.isArray(obj)) {",
"          return obj;",
"        }",
"        if (!aicmC2fD2IsObject(obj)) return [];",
"        for (var aicmC2fD2KI = 0; aicmC2fD2KI < keys.length; aicmC2fD2KI += 1) {",
"          var aicmC2fD2Key = keys[aicmC2fD2KI];",
"          if (Object.prototype.hasOwnProperty.call(obj, aicmC2fD2Key) && Array.isArray(obj[aicmC2fD2Key])) {",
"            return obj[aicmC2fD2Key];",
"          }",
"        }",
"        var aicmC2fD2ObjKeys = Object.keys(obj);",
"        for (var aicmC2fD2OI = 0; aicmC2fD2OI < aicmC2fD2ObjKeys.length; aicmC2fD2OI += 1) {",
"          var aicmC2fD2NestedArray = aicmC2fD2FindArray(obj[aicmC2fD2ObjKeys[aicmC2fD2OI]], keys, depth + 1);",
"          if (aicmC2fD2NestedArray.length) return aicmC2fD2NestedArray;",
"        }",
"        return [];",
"      }",
"",
"      var aicmC2fD2Payload = " + payloadVar + " || {};",
"      var aicmC2fD2Missing = [];",
"",
"      var aicmC2fD2Ids = aicmC2fD2FindArray(aicmC2fD2Payload, [",
"        \"selected_manager_major_item_ids\",",
"        \"manager_major_item_ids\",",
"        \"managerMajorItemIds\",",
"        \"selectedIds\",",
"        \"ids\"",
"      ], 0).filter(function (value) { return aicmC2fD2Text(value); });",
"",
"      var aicmC2fD2SingleId = aicmC2fD2FindFirst(aicmC2fD2Payload, [",
"        \"manager_major_item_id\",",
"        \"managerMajorItemId\",",
"        \"pmlw_major_item_id\",",
"        \"major_item_id\",",
"        \"majorItemId\",",
"        \"id\",",
"        \"uuid\"",
"      ], 0);",
"",
"      var aicmC2fD2Department = aicmC2fD2FindFirst(aicmC2fD2Payload, [",
"        \"department_id\",",
"        \"departmentId\",",
"        \"department_label\",",
"        \"departmentLabel\",",
"        \"department_name\",",
"        \"departmentName\"",
"      ], 0);",
"",
"      var aicmC2fD2Section = aicmC2fD2FindFirst(aicmC2fD2Payload, [",
"        \"section_id\",",
"        \"sectionId\",",
"        \"section_label\",",
"        \"sectionLabel\",",
"        \"section_name\",",
"        \"sectionName\"",
"      ], 0);",
"",
"      var aicmC2fD2Leader = aicmC2fD2FindFirst(aicmC2fD2Payload, [",
"        \"leader_label\",",
"        \"leaderLabel\",",
"        \"assigned_leader_label\",",
"        \"leader_name\",",
"        \"leaderName\"",
"      ], 0);",
"",
"      var aicmC2fD2LeaderPlacement = aicmC2fD2FindFirst(aicmC2fD2Payload, [",
"        \"leader_placement_id\",",
"        \"leaderPlacementId\",",
"        \"assigned_leader_placement_id\",",
"        \"placement_id\",",
"        \"placementId\"",
"      ], 0);",
"",
"      if (!aicmC2fD2Ids.length && !aicmC2fD2SingleId) aicmC2fD2Missing.push(\"対象大項目IDがありません\");",
"      if (!aicmC2fD2Department) aicmC2fD2Missing.push(\"部門がありません\");",
"      if (!aicmC2fD2Section) aicmC2fD2Missing.push(\"課がありません\");",
"      if (!aicmC2fD2Leader) aicmC2fD2Missing.push(\"Leaderがありません\");",
"      if (!aicmC2fD2LeaderPlacement) aicmC2fD2Missing.push(\"Leader配置IDがありません\");",
"",
"      var aicmC2fD2Summary = {",
"        ok: aicmC2fD2Missing.length === 0,",
"        missing: aicmC2fD2Missing,",
"        selected_count: aicmC2fD2Ids.length || (aicmC2fD2SingleId ? 1 : 0),",
"        department: aicmC2fD2Department || \"\",",
"        section: aicmC2fD2Section || \"\",",
"        leader: aicmC2fD2Leader || \"\",",
"        leader_placement_id: aicmC2fD2LeaderPlacement || \"\",",
"        api_post: \"LOCKED_BY_C2F_D2_EXECUTE_GATE\",",
"        db_write: \"NO\"",
"      };",
"",
"      if (typeof state !== \"undefined\" && state && typeof state === \"object\") {",
"        state.managerMajorLeaderHandoffConfirm = state.managerMajorLeaderHandoffConfirm || {};",
"        state.managerMajorLeaderHandoffConfirm.executeValidation = aicmC2fD2Summary;",
"        state.managerMajorLeaderHandoffConfirm.executeLocked = true;",
"      }",
"",
"      if (typeof window !== \"undefined\" && window && typeof window.alert === \"function\") {",
"        window.alert(",
"          aicmC2fD2Missing.length",
"            ? \"実行前チェックNG: \" + aicmC2fD2Missing.join(\" / \")",
"            : \"実行前チェックOK。API POSTはまだ未解放です。\"",
"        );",
"      }",
"",
"      if (typeof aicmR8zMgrMajorCardRerender === \"function\") {",
"        try {",
"          aicmR8zMgrMajorCardRerender(\"c2f-d2-execute-payload-validation-gate\");",
"        } catch (_) {}",
"      }",
"",
"      return {",
"        ok: false,",
"        reason: aicmC2fD2Missing.length ? \"C2F_D2_PRE_POST_VALIDATION_NG\" : \"C2F_D2_API_POST_LOCKED_PENDING_APPROVAL\",",
"        validation: aicmC2fD2Summary",
"      };",
"    } catch (aicmC2fD2Error) {",
"      if (typeof window !== \"undefined\" && window && typeof window.alert === \"function\") {",
"        window.alert(\"実行前チェックでエラーが発生しました。API POSTは実行していません。\");",
"      }",
"      return {",
"        ok: false,",
"        reason: \"C2F_D2_VALIDATION_ERROR_POST_NOT_EXECUTED\",",
"        message: String(aicmC2fD2Error && aicmC2fD2Error.message ? aicmC2fD2Error.message : aicmC2fD2Error)",
"      };",
"    }",
"    // " + marker + "_END",
""
].join("\n");

lines.splice(fetchLineIndex, 0, insertedBlock);

src = lines.join("\n");
fs.writeFileSync(corePath, src);

const afterLines = src.split(/\r?\n/);
const insertedLineCount = insertedBlock.split(/\n/).length;
const fetchLineAfter = fetchLineNo + insertedLineCount;
const afterWindow = makeLineWindow(afterLines, fetchLineNo, 20, 180);

const forbiddenNetworkPatternCount =
  count(insertedBlock, "fetch" + "(") +
  count(insertedBlock, "XMLHttpRequest");

const forbiddenUnlockCount =
  count(insertedBlock, "API_POST=YES") +
  count(insertedBlock, "api_post: \"YES\"") +
  count(insertedBlock, "api_post:\"YES\"");

const anchorReport = [];
anchorReport.push("AICompanyManager V10L-C2F-D2 anchor result");
anchorReport.push("DB_WRITE=NO");
anchorReport.push("API_POST=NO");
anchorReport.push("CORE_PATCH=YES");
anchorReport.push("SERVER_PATCH=NO");
anchorReport.push("");
anchorReport.push("TARGET_FUNCTION=aicmExecuteLeaderHandoffConfirmR8S");
anchorReport.push("DECLARATION_LINE=" + declLineNo);
anchorReport.push("POST_BODY_DECLARATION_LINE=" + postBodyDeclLineNo);
anchorReport.push("FETCH_LINE_BEFORE_PATCH=" + fetchLineNo);
anchorReport.push("FETCH_LINE_AFTER_PATCH=" + fetchLineAfter);
anchorReport.push("INSERTED_LINE_COUNT=" + insertedLineCount);
anchorReport.push("");
anchorReport.push("BEFORE_WINDOW");
anchorReport.push("============================================================");
anchorReport.push(beforeWindow.text);
anchorReport.push("");
anchorReport.push("AFTER_WINDOW");
anchorReport.push("============================================================");
anchorReport.push(afterWindow.text);
fs.writeFileSync(anchorOut, anchorReport.join("\n") + "\n");

const extract = [];
extract.push("AICompanyManager V10L-C2F-D2 patch extract");
extract.push("DB_WRITE=NO");
extract.push("API_POST=NO");
extract.push("CORE_PATCH=YES");
extract.push("SERVER_PATCH=NO");
extract.push("");
extract.push("INSERTED_BLOCK");
extract.push("============================================================");
extract.push(insertedBlock);
fs.writeFileSync(extractOut, extract.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-D2 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES");
verify.push("");
verify.push("TARGET_FUNCTION=aicmExecuteLeaderHandoffConfirmR8S");
verify.push("PAYLOAD_VAR=postBody");
verify.push("DECLARATION_LINE=" + declLineNo);
verify.push("POST_BODY_DECLARATION_LINE=" + postBodyDeclLineNo);
verify.push("FETCH_LINE_BEFORE_PATCH=" + fetchLineNo);
verify.push("FETCH_LINE_AFTER_PATCH=" + fetchLineAfter);
verify.push("C2F_D2_MARKER_TOTAL_COUNT=" + count(src, marker));
verify.push("C2F_D2_START_COUNT=" + count(src, marker + "_START"));
verify.push("C2F_D2_END_COUNT=" + count(src, marker + "_END"));
verify.push("LOCKED_BY_C2F_D2_COUNT=" + count(src, "LOCKED_BY_C2F_D2_EXECUTE_GATE"));
verify.push("VALIDATION_NG_REASON_COUNT=" + count(src, "C2F_D2_PRE_POST_VALIDATION_NG"));
verify.push("PENDING_APPROVAL_REASON_COUNT=" + count(src, "C2F_D2_API_POST_LOCKED_PENDING_APPROVAL"));
verify.push("FORBIDDEN_NETWORK_PATTERN_IN_INSERTED_BLOCK=" + forbiddenNetworkPatternCount);
verify.push("FORBIDDEN_UNLOCK_PATTERN_IN_INSERTED_BLOCK=" + forbiddenUnlockCount);
verify.push("C2F_B3_MARKER_COUNT=" + count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE"));
verify.push("ROUTE_UI_LABEL_COUNT=" + count(src, "一括引き渡し先"));
verify.push("SECTION_APPLY_LABEL_COUNT=" + count(src, "課を適用"));
verify.push("LEADER_APPLY_LABEL_COUNT=" + count(src, "Leaderを適用"));
verify.push("ANCHOR_OUT=" + anchorOut);
verify.push("EXTRACT_OUT=" + extractOut);

if (count(src, marker) !== 2) throw new Error("C2F_D2_MARKER_TOTAL_COUNT_NOT_2");
if (count(src, marker + "_START") !== 1) throw new Error("C2F_D2_START_COUNT_NOT_1");
if (count(src, marker + "_END") !== 1) throw new Error("C2F_D2_END_COUNT_NOT_1");
if (forbiddenNetworkPatternCount !== 0) throw new Error("NETWORK_PATTERN_FOUND_IN_INSERTED_BLOCK");
if (forbiddenUnlockCount !== 0) throw new Error("UNLOCK_PATTERN_FOUND_IN_INSERTED_BLOCK");
if (count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2F_B3_EXACT_ANCHOR_PRE_POST_GATE") !== 0) throw new Error("C2F_B3_MARKER_RETURNED");
if (count(src, "課を適用") < 1) throw new Error("SECTION_APPLY_UI_MISSING");
if (count(src, "Leaderを適用") < 1) throw new Error("LEADER_APPLY_UI_MISSING");

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");
