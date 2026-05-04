const fs = require("fs");

const [,, corePath, verifyOut, extractOut] = process.argv;
let src = fs.readFileSync(corePath, "utf8");

const deleteTargets = [
  {
    name: "C2D5R2A",
    marker: "AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY",
    labels: ["C2D5R2A 課を適用 debug"]
  },
  {
    name: "C2D7",
    marker: "AICM_R8Z_MGR_MAJOR_CARD_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG",
    labels: ["C2D7 handler entry debug"]
  }
];

const keepMarkers = [
  "AICM_R8Z_MGR_MAJOR_CARD_C2D9_BRIDGE_CLICK_CALLBACK_ROUTE_ACTION_FIX",
  "AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY",
  "AICM_R8Z_MGR_MAJOR_CARD_C2D12_LEADER_GENERIC_OPTION_FILTER"
];

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c++;
    from = idx + needle.length;
  }
  return c;
}

function removeStartEndBlocks(text, marker, log) {
  let lines = text.split("\n");

  while (true) {
    const start = lines.findIndex(line => line.includes(marker + "_START"));
    if (start < 0) break;

    let end = -1;
    for (let i = start; i < lines.length; i++) {
      if (lines[i].includes(marker + "_END")) {
        end = i;
        break;
      }
    }

    if (end < 0) {
      log.push(`WARN ${marker} START_WITHOUT_END line=${start + 1}`);
      break;
    }

    log.push(`REMOVE markerBlock=${marker} lines=${start + 1}-${end + 1} count=${end - start + 1}`);
    lines.splice(start, end - start + 1);
  }

  return lines.join("\n");
}

function findHtmlBlock(lines, labelIndex, label) {
  const tags = ["details", "section", "article", "div"];
  const minStart = Math.max(0, labelIndex - 80);
  const maxEnd = Math.min(lines.length - 1, labelIndex + 160);

  for (const tag of tags) {
    const openNeedle = "<" + tag;
    const closeNeedle = "</" + tag + ">";

    let start = -1;
    for (let i = labelIndex; i >= minStart; i--) {
      if (lines[i].includes(openNeedle)) {
        start = i;
        break;
      }
    }
    if (start < 0) continue;

    let end = -1;
    for (let j = labelIndex; j <= maxEnd; j++) {
      if (lines[j].includes(closeNeedle)) {
        end = j;
        break;
      }
    }
    if (end < start || end < 0) continue;

    const len = end - start + 1;
    if (len > 180) continue;

    const block = lines.slice(start, end + 1).join("\n");
    if (!block.includes(label)) continue;

    return { start, end, tag, len };
  }

  return null;
}

function removeRemainingDebugLinesAndBlocks(text, targets, log) {
  let lines = text.split("\n");

  for (let guard = 0; guard < 500; guard++) {
    let hit = null;

    for (const target of targets) {
      const needles = [target.marker, ...target.labels];
      for (let i = 0; i < lines.length; i++) {
        if (needles.some(n => lines[i].includes(n))) {
          hit = { target, lineIndex: i, line: lines[i], needles };
          break;
        }
      }
      if (hit) break;
    }

    if (!hit) break;

    const label = hit.target.labels.find(l => hit.line.includes(l)) || hit.target.marker;
    const block = findHtmlBlock(lines, hit.lineIndex, label);

    if (block) {
      log.push(`REMOVE ${hit.target.name} htmlBlock<${block.tag}> lines=${block.start + 1}-${block.end + 1} count=${block.len}`);
      lines.splice(block.start, block.end - block.start + 1);
      continue;
    }

    log.push(`REMOVE ${hit.target.name} singleDebugLine line=${hit.lineIndex + 1} text=${hit.line.trim().slice(0, 180)}`);
    lines.splice(hit.lineIndex, 1);
  }

  return lines.join("\n");
}

function findFunctionRange(text, name) {
  const re = new RegExp("(?:async\\s+)?function\\s+" + name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&") + "\\s*\\(", "m");
  const m = re.exec(text);
  if (!m) return null;

  const start = m.index;
  const open = text.indexOf("{", start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let esc = false;

  for (let i = open; i < text.length; i++) {
    const ch = text[i];

    if (quote) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === quote) quote = null;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        const startLine = text.slice(0, start).split(/\r?\n/).length;
        const endLine = text.slice(0, i).split(/\r?\n/).length;
        return { start, end: i, startLine, endLine, text: text.slice(start, i + 1) };
      }
    }
  }

  return null;
}

const before = {};
for (const t of deleteTargets) {
  before[t.name + "_marker"] = count(src, t.marker);
  for (const l of t.labels) before[t.name + "_label"] = count(src, l);
}
for (const m of keepMarkers) before["keep_" + m] = count(src, m);

const log = [];

for (const t of deleteTargets) {
  src = removeStartEndBlocks(src, t.marker, log);
}
src = removeRemainingDebugLinesAndBlocks(src, deleteTargets, log);
src = src.replace(/\n{4,}/g, "\n\n\n");

fs.writeFileSync(corePath, src);

const after = {};
for (const t of deleteTargets) {
  after[t.name + "_marker"] = count(src, t.marker);
  for (const l of t.labels) after[t.name + "_label"] = count(src, l);
}
for (const m of keepMarkers) after["keep_" + m] = count(src, m);

const h = findFunctionRange(src, "h");

const extract = [];
extract.push("AICompanyManager V10L-C2E-R3R1 delete debug logic extract");
extract.push("DB_WRITE=NO");
extract.push("API_POST=NO");
extract.push("CORE_PATCH=YES_DELETE_DEBUG");
extract.push("SERVER_PATCH=NO");
extract.push("");
extract.push("REMOVAL_LOG");
for (const line of log) extract.push("- " + line);
extract.push("");
extract.push("BEFORE=" + JSON.stringify(before, null, 2));
extract.push("AFTER=" + JSON.stringify(after, null, 2));
extract.push("");
extract.push("FUNCTION_H_AFTER_DELETE");
extract.push("LINES=" + (h ? h.startLine + "-" + h.endLine : "NOT_FOUND"));
extract.push(h ? h.text : "FUNCTION_H_NOT_FOUND");
fs.writeFileSync(extractOut, extract.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2E-R3R1 verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES_DELETE_DEBUG");
verify.push("");
verify.push("REMOVAL_LOG_COUNT=" + log.length);

for (const t of deleteTargets) {
  verify.push(t.name + "_MARKER_BEFORE=" + before[t.name + "_marker"]);
  verify.push(t.name + "_MARKER_AFTER=" + after[t.name + "_marker"]);
  verify.push(t.name + "_VISIBLE_LABEL_BEFORE=" + before[t.name + "_label"]);
  verify.push(t.name + "_VISIBLE_LABEL_AFTER=" + after[t.name + "_label"]);
}

for (const m of keepMarkers) {
  const key = m.replace(/[^A-Za-z0-9]+/g, "_");
  verify.push("KEEP_MARKER_BEFORE_" + key + "=" + before["keep_" + m]);
  verify.push("KEEP_MARKER_AFTER_" + key + "=" + after["keep_" + m]);
}

verify.push("FORMAL_ROUTE_UI_COUNT=" + count(src, "一括引き渡し先"));
verify.push("DEPARTMENT_LABEL_COUNT=" + count(src, "部門"));
verify.push("SECTION_LABEL_COUNT=" + count(src, "課"));
verify.push("LEADER_LABEL_COUNT=" + count(src, "Leader"));
verify.push("C2E_R2B_WRAPPER_MARKER_COUNT=" + count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2E_R2B_SAFE_DEBUG_PANEL_DISPLAY_FILTER"));
verify.push("EXTRACT_OUT=" + extractOut);

for (const t of deleteTargets) {
  if (after[t.name + "_marker"] !== 0) throw new Error(t.name + "_MARKER_STILL_PRESENT");
  if (after[t.name + "_label"] !== 0) throw new Error(t.name + "_VISIBLE_LABEL_STILL_PRESENT");
}

for (const m of keepMarkers) {
  if (after["keep_" + m] < 1) throw new Error("KEEP_MARKER_MISSING_" + m);
}

if (count(src, "一括引き渡し先") < 1) throw new Error("FORMAL_ROUTE_UI_MISSING");
if (count(src, "部門") < 1) throw new Error("DEPARTMENT_LABEL_MISSING");
if (count(src, "課") < 1) throw new Error("SECTION_LABEL_MISSING");
if (count(src, "Leader") < 1) throw new Error("LEADER_LABEL_MISSING");
if (count(src, "AICM_R8Z_MGR_MAJOR_CARD_C2E_R2B_SAFE_DEBUG_PANEL_DISPLAY_FILTER") !== 0) throw new Error("UNSAFE_R2B_WRAPPER_MARKER_STILL_PRESENT");

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");
