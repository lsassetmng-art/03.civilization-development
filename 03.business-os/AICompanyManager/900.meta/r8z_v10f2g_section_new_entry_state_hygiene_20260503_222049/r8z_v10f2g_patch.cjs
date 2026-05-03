const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];
const analysisPath = process.argv[4];

const marker = "AICM_R8Z_V10F2G_SECTION_NEW_ENTRY_STATE_HYGIENE";
const log = [];
const analysis = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, "SKIP_ALREADY_EXISTS\n");
  process.exit(0);
}

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex, source = src) {
  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openIndex; i < source.length; i += 1) {
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
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) quote = "";
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

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function findFunction(name, source = src) {
  const patterns = [
    new RegExp("function\\s+" + name + "\\s*\\(", "g"),
    new RegExp(name + "\\s*=\\s*function\\s*\\(", "g")
  ];

  for (const re of patterns) {
    const m = re.exec(source);
    if (!m) continue;
    const open = source.indexOf("{", m.index);
    const end = scanBraceEnd(open, source);
    if (open >= 0 && end > open) {
      return { name, start: m.index, open, end, line: lineNo(m.index), text: source.slice(m.index, end) };
    }
  }

  return null;
}

const helper = `

  // ${marker}_HELPER_START
  function aicmR8zV10f2gClearSectionNewEntryState(nextScreen) {
    var screen = String(nextScreen === undefined || nextScreen === null ? "" : nextScreen).trim();
    if (screen !== "section-new") return;

    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        state.selectedSectionId = "";
        state.selectedSection = null;
        state.currentSection = null;
        state.editingSectionId = "";
        state.sectionEditId = "";
        state.placementEditingSectionId = "";
        state.workerPlacementSectionId = "";
        state.sectionPlacementDraft = [];
        state.workerPlacementDraft = [];
        state.sectionNewDraft = state.sectionNewDraft && typeof state.sectionNewDraft === "object" ? state.sectionNewDraft : {};
        state.sectionNewDraft.workerPlacements = [];
        state.sectionNewDraft.placements = [];
        state.aicmR8zV10f2gSectionNewStateCleared = true;
        state.aicmR8zV10f2gSectionNewStateClearedAt = new Date().toISOString();
      }

      if (typeof window !== "undefined" && window.state && window.state !== state && typeof window.state === "object") {
        window.state.selectedSectionId = "";
        window.state.selectedSection = null;
        window.state.currentSection = null;
        window.state.editingSectionId = "";
        window.state.sectionEditId = "";
        window.state.placementEditingSectionId = "";
        window.state.workerPlacementSectionId = "";
        window.state.sectionPlacementDraft = [];
        window.state.workerPlacementDraft = [];
        window.state.sectionNewDraft = window.state.sectionNewDraft && typeof window.state.sectionNewDraft === "object" ? window.state.sectionNewDraft : {};
        window.state.sectionNewDraft.workerPlacements = [];
        window.state.sectionNewDraft.placements = [];
        window.state.aicmR8zV10f2gSectionNewStateCleared = true;
        window.state.aicmR8zV10f2gSectionNewStateClearedAt = new Date().toISOString();
      }
    } catch (error) {
      if (typeof console !== "undefined" && console && console.warn) {
        console.warn("AICM V10F2G section-new state hygiene skipped", error);
      }
    }
  }
  // ${marker}_HELPER_END
`;

function insertHelperBeforeRender(source) {
  const renderFn = findFunction("render", source);
  if (!renderFn) {
    const sectionNewFn = findFunction("renderSectionNew", source);
    if (!sectionNewFn) return { ok: false, source, line: 0, anchor: "none" };
    return {
      ok: true,
      source: source.slice(0, sectionNewFn.start) + helper + source.slice(sectionNewFn.start),
      line: sectionNewFn.line,
      anchor: "renderSectionNew"
    };
  }

  return {
    ok: true,
    source: source.slice(0, renderFn.start) + helper + source.slice(renderFn.start),
    line: renderFn.line,
    anchor: "render"
  };
}

function findGoAssignmentCandidate(source) {
  const goPatterns = [
    'action === "go"',
    "action === 'go'",
    'case "go"',
    "case 'go'"
  ];

  const candidates = [];

  for (const pattern of goPatterns) {
    let idx = 0;
    while ((idx = source.indexOf(pattern, idx)) >= 0) {
      const windowText = source.slice(idx, idx + 1800);
      const re = /state\.screen\s*=\s*([^;\n]+);/g;
      let m;
      while ((m = re.exec(windowText))) {
        const start = idx + m.index;
        const end = start + m[0].length;
        candidates.push({
          pattern,
          start,
          end,
          line: lineNo(start),
          assignment: m[0],
          expr: m[1].trim()
        });
      }
      idx += pattern.length;
    }
  }

  const seen = new Set();
  return candidates.filter(c => {
    if (seen.has(c.start)) return false;
    seen.add(c.start);
    return true;
  });
}

let patched = src;
let helperInsert = insertHelperBeforeRender(patched);

if (!helperInsert.ok) {
  log.push("ERROR: helper insert anchor not found");
  analysis.push("PATCH_DECISION=HELPER_INSERT_ANCHOR_NOT_FOUND");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

patched = helperInsert.source;
src = patched;

analysis.push("HELPER_INSERTED=true");
analysis.push("HELPER_ANCHOR=" + helperInsert.anchor);
analysis.push("HELPER_INSERT_LINE=" + helperInsert.line);

const goCandidates = findGoAssignmentCandidate(src);
analysis.push("GO_ASSIGNMENT_CANDIDATE_COUNT=" + goCandidates.length);

for (const c of goCandidates.slice(0, 20)) {
  analysis.push([
    "GO_CANDIDATE",
    "pattern=" + c.pattern,
    "line=" + c.line,
    "assignment=" + c.assignment.replace(/\s+/g, " ")
  ].join("\t"));
}

let patchMode = "";

if (goCandidates.length === 1) {
  const c = goCandidates[0];
  const call = "\n      aicmR8zV10f2gClearSectionNewEntryState(state.screen); // " + marker + "_GO_CALL";
  patched = src.slice(0, c.end) + call + src.slice(c.end);
  patchMode = "GO_HANDLER";
  analysis.push("PATCH_DECISION=GO_HANDLER_CALL_INSERTED");
  analysis.push("GO_CALL_LINE=" + c.line);
} else {
  const renderFn = findFunction("render", src);
  if (!renderFn) {
    log.push("ERROR: render function not found for fallback");
    analysis.push("PATCH_DECISION=GO_NOT_UNIQUE_AND_RENDER_NOT_FOUND");
    fs.writeFileSync(patchLog, log.join("\n") + "\n");
    fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
    process.exit(3);
  }

  const branchIndexLocal = renderFn.text.indexOf('state.screen === "section-new"');
  if (branchIndexLocal < 0) {
    log.push("ERROR: section-new branch not found for fallback");
    analysis.push("PATCH_DECISION=GO_NOT_UNIQUE_AND_SECTION_NEW_BRANCH_NOT_FOUND");
    fs.writeFileSync(patchLog, log.join("\n") + "\n");
    fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
    process.exit(4);
  }

  const branchStartGlobal = renderFn.start + branchIndexLocal;
  const windowText = src.slice(branchStartGlobal, branchStartGlobal + 900);
  const renderSectionNewMatch = /html\s*=\s*renderSectionNew\s*\([^;]*\);/.exec(windowText);

  if (!renderSectionNewMatch) {
    log.push("ERROR: renderSectionNew assignment not found in section-new branch");
    analysis.push("PATCH_DECISION=GO_NOT_UNIQUE_AND_RENDER_SECTION_NEW_ASSIGNMENT_NOT_FOUND");
    fs.writeFileSync(patchLog, log.join("\n") + "\n");
    fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
    process.exit(5);
  }

  const insertAt = branchStartGlobal + renderSectionNewMatch.index;
  const call = "      aicmR8zV10f2gClearSectionNewEntryState(\"section-new\"); // " + marker + "_RENDER_BRANCH_CALL\n";
  patched = src.slice(0, insertAt) + call + src.slice(insertAt);
  patchMode = "RENDER_BRANCH";
  analysis.push("PATCH_DECISION=RENDER_BRANCH_CALL_INSERTED");
  analysis.push("RENDER_BRANCH_CALL_LINE=" + lineNo(insertAt));
}

fs.writeFileSync(corePath, patched, "utf8");

log.push("PATCH_APPLIED: section-new entry state hygiene");
log.push("PATCH_MODE=" + patchMode);
fs.writeFileSync(patchLog, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
