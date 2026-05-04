const fs = require("fs");

const corePath = process.argv[2];
const extractOut = process.argv[3];
const finderOut = process.argv[4];

let src = fs.readFileSync(corePath, "utf8");

const targetName = "aicmR8zV9g5ExecuteDeleteConfirm";
const markerStart = "AICM_R8Z_V10L_C2G_B_R1_SIMPLE_DELETE_YES_POST_START";
const markerEnd = "AICM_R8Z_V10L_C2G_B_R1_SIMPLE_DELETE_YES_POST_END";

if (src.includes(markerStart) || src.includes(markerEnd)) {
  throw new Error("C2G_B_R1_MARKER_ALREADY_EXISTS");
}

function lineNo(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function findFunctionRange(source, name) {
  const declRe = new RegExp("(?:async\\s+)?function\\s+" + name + "\\s*\\(");
  const m = declRe.exec(source);
  if (!m) return null;

  const start = m.index;
  const braceStart = source.indexOf("{", start + m[0].length);
  if (braceStart < 0) throw new Error("BRACE_START_NOT_FOUND:" + name);

  let depth = 0;
  let quote = null;
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = braceStart; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1, braceStart, method: "brace-parser" };
    }
  }

  const nextFnRe = /\n(?:async\s+)?function\s+[A-Za-z0-9_$]+\s*\(/g;
  nextFnRe.lastIndex = start + m[0].length;
  const n = nextFnRe.exec(source);
  if (n && n.index > start) {
    return { start, end: n.index, braceStart, method: "fallback-next-function" };
  }

  throw new Error("FUNCTION_END_NOT_FOUND:" + name);
}

const range = findFunctionRange(src, targetName);
if (!range) throw new Error("TARGET_FUNCTION_NOT_FOUND:" + targetName);

const oldFn = src.slice(range.start, range.end);

const newFn = `// ${markerStart}
async function aicmR8zV9g5ExecuteDeleteConfirm() {
  var endpoint = "/api/aicm/v2/manager-major/update";

  function c2gBState() {
    try {
      if (typeof state !== "undefined" && state) return state;
    } catch (e) {}
    try {
      if (typeof window !== "undefined") return window.AICM_STATE || window.aicmState || window.state || {};
    } catch (e2) {}
    return {};
  }

  function c2gBSetMessage(kind, text) {
    if (typeof setMessage === "function") {
      setMessage(kind, text);
      return;
    }
    try { console.log(kind + ": " + text); } catch (e) {}
  }

  function c2gBParseJsonLoose(text) {
    if (!text) return null;
    var s = String(text);
    var first = s.indexOf("{");
    var last = s.lastIndexOf("}");
    if (first < 0 || last <= first) return null;
    try { return JSON.parse(s.slice(first, last + 1)); } catch (e) { return null; }
  }

  function c2gBReadPayloadFromDom() {
    try {
      if (typeof document === "undefined") return null;
      var nodes = Array.prototype.slice.call(document.querySelectorAll("textarea, pre, code, details, [data-payload-preview], [data-aicm-payload-preview]"));
      for (var i = 0; i < nodes.length; i += 1) {
        var t = nodes[i] && (nodes[i].value || nodes[i].innerText || nodes[i].textContent || "");
        if (!t || String(t).indexOf("{") < 0) continue;
        var parsed = c2gBParseJsonLoose(t);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {}
    return null;
  }

  function c2gBReadPayloadFromState() {
    var s = c2gBState();
    var candidates = [
      s.r8zV9g5DeletePayload,
      s.r8zV9g5DeleteConfirmPayload,
      s.r8zMgrMajorCardDeletePayload,
      s.r8zMgrMajorCardConfirmPayload,
      s.r8zMgrMajorCardPostBody,
      s.pendingPostBody,
      s.confirmPostBody,
      s.currentConfirmPayload
    ];
    for (var i = 0; i < candidates.length; i += 1) {
      var c = candidates[i];
      if (c && typeof c === "object") return JSON.parse(JSON.stringify(c));
      if (typeof c === "string") {
        var parsed = c2gBParseJsonLoose(c);
        if (parsed) return parsed;
      }
    }
    return null;
  }

  function c2gBPushId(out, v) {
    if (v == null) return;
    var s = String(v).trim();
    if (!s) return;
    if (out.indexOf(s) < 0) out.push(s);
  }

  function c2gBCollectIdsFromPayload(obj) {
    var out = [];
    if (!obj || typeof obj !== "object") return out;
    var keys = [
      "manager_major_item_id",
      "manager_major_item_ids",
      "major_item_id",
      "major_item_ids",
      "aicm_manager_major_item_id",
      "aicm_manager_major_item_ids",
      "target_manager_major_item_id",
      "target_manager_major_item_ids",
      "selected_manager_major_item_ids",
      "selectedMajorItemIds",
      "target_ids",
      "selected_ids",
      "ids"
    ];
    for (var i = 0; i < keys.length; i += 1) {
      var v = obj[keys[i]];
      if (Array.isArray(v)) {
        for (var j = 0; j < v.length; j += 1) c2gBPushId(out, v[j]);
      } else {
        c2gBPushId(out, v);
      }
    }
    return out;
  }

  function c2gBCollectIdsFromState() {
    var s = c2gBState();
    var out = [];
    var roots = [
      s.r8zMgrMajorCardSelectedMajorItemIds,
      s.selectedManagerMajorItemIds,
      s.selectedMajorItemIds,
      s.r8zMgrMajorCardDeleteTargetIds,
      s.r8zMgrMajorCardTargetIds,
      s.r8zMgrMajorCardSelectedRows,
      s.selectedManagerMajorRows,
      s.selectedMajorRows,
      s.r8zMgrMajorCardDeleteTargets,
      s.r8zMgrMajorCardConfirmTargets
    ];

    function scan(v) {
      if (!v) return;
      if (Array.isArray(v)) {
        for (var i = 0; i < v.length; i += 1) scan(v[i]);
        return;
      }
      if (typeof v === "string" || typeof v === "number") {
        c2gBPushId(out, v);
        return;
      }
      if (typeof v === "object") {
        var idKeys = ["manager_major_item_id", "major_item_id", "aicm_manager_major_item_id", "id", "managerMajorItemId", "majorItemId"];
        for (var k = 0; k < idKeys.length; k += 1) {
          if (v[idKeys[k]]) c2gBPushId(out, v[idKeys[k]]);
        }
      }
    }

    for (var r = 0; r < roots.length; r += 1) scan(roots[r]);
    return out;
  }

  function c2gBNormalizeDeletePayload(basePayload, ids) {
    var p = basePayload && typeof basePayload === "object" ? JSON.parse(JSON.stringify(basePayload)) : {};
    var uniqueIds = [];
    for (var i = 0; i < ids.length; i += 1) c2gBPushId(uniqueIds, ids[i]);

    p.action = p.action || "delete";
    p.action_code = p.action_code || "delete";
    p.operation = p.operation || "delete";
    p.operation_code = p.operation_code || "delete";
    p.delete_flag = true;
    p.deleted_flag = true;
    p.is_deleted = true;
    p.active_flag = false;
    p.confirmed_flag = true;
    p.confirm_source = "aicm_r8z_v10l_c2g_b_r1_simple_delete_yes";

    p.manager_major_item_ids = uniqueIds;
    p.major_item_ids = uniqueIds;
    p.target_manager_major_item_ids = uniqueIds;
    p.selected_manager_major_item_ids = uniqueIds;
    p.ids = uniqueIds;

    if (uniqueIds.length === 1) {
      p.manager_major_item_id = uniqueIds[0];
      p.major_item_id = uniqueIds[0];
      p.target_manager_major_item_id = uniqueIds[0];
      p.id = p.id || uniqueIds[0];
    }

    delete p.department_required;
    delete p.section_required;
    delete p.leader_required;
    return p;
  }

  try {
    var payload = c2gBReadPayloadFromDom() || c2gBReadPayloadFromState() || {};
    var ids = c2gBCollectIdsFromPayload(payload);
    if (!ids.length) ids = c2gBCollectIdsFromState();

    if (!ids.length) {
      c2gBSetMessage("error", "削除対象の大項目IDを取得できません。台帳で削除対象を選択してから再実行してください。");
      return;
    }

    payload = c2gBNormalizeDeletePayload(payload, ids);

    c2gBSetMessage("info", "削除を実行します。対象件数: " + ids.length);

    var response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    var text = await response.text();
    var data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

    if (!response.ok || (data && data.ok === false)) {
      var reason = data && (data.reason || data.message || data.error) ? (data.reason || data.message || data.error) : text;
      c2gBSetMessage("error", "削除APIが失敗しました: " + (reason || response.status));
      return;
    }

    c2gBSetMessage("ok", "削除しました。対象件数: " + ids.length);

    try {
      var s = c2gBState();
      s.screen = "task-ledger";
      s.r8zMgrMajorCardConfirm = null;
      s.r8zMgrMajorCardConfirmPayload = null;
    } catch (e2) {}

    try {
      if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {
        aicmRenderTaskLedgerSafeR8V4("c2g_b_r1_simple_delete_done");
      } else if (typeof aicmR8zMgrMajorCardRerender === "function") {
        aicmR8zMgrMajorCardRerender("c2g_b_r1_simple_delete_done");
      } else if (typeof location !== "undefined" && location.reload) {
        setTimeout(function() { location.reload(); }, 800);
      }
    } catch (e3) {}
  } catch (err) {
    c2gBSetMessage("error", "削除処理でエラー: " + (err && err.message ? err.message : String(err)));
  }
}
// ${markerEnd}`;

src = src.slice(0, range.start) + newFn + src.slice(range.end);
fs.writeFileSync(corePath, src);

const newRange = findFunctionRange(src, targetName);
const newExtract = src.slice(newRange.start, newRange.end);

fs.writeFileSync(finderOut, [
  "TARGET_FUNCTION=" + targetName,
  "FINDER_METHOD=" + range.method,
  "OLD_START_LINE=" + lineNo(fs.readFileSync(corePath, "utf8").slice(0, 0) || src, range.start),
  "OLD_END_LINE=" + lineNo(src, range.end),
  "NEW_START_LINE=" + lineNo(src, newRange.start),
  "NEW_END_LINE=" + lineNo(src, newRange.end),
  "OLD_LENGTH=" + oldFn.length,
  "NEW_LENGTH=" + newExtract.length
].join("\n") + "\n");

fs.writeFileSync(extractOut, newExtract + "\n");

if (!newExtract.includes("fetch(endpoint")) throw new Error("FETCH_NOT_FOUND_IN_NEW_FUNCTION");
if (!newExtract.includes("/api/aicm/v2/manager-major/update")) throw new Error("UPDATE_ENDPOINT_NOT_FOUND_IN_NEW_FUNCTION");
if (!newExtract.includes("delete_flag = true")) throw new Error("DELETE_FLAG_NOT_FOUND_IN_NEW_FUNCTION");
