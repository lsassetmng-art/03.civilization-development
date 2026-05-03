const fs = require("fs");

const core = process.argv[2];
const goOut = process.argv[3];
const clickOut = process.argv[4];
const selectedOut = process.argv[5];
const placementOut = process.argv[6];
const branchOut = process.argv[7];
const classifyOut = process.argv[8];

const src = fs.readFileSync(core, "utf8");
const lines = src.split(/\n/);

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function around(index, before = 14, after = 34) {
  const ln = lineNo(index);
  const start = Math.max(1, ln - before);
  const end = Math.min(lines.length, ln + after);
  const out = [];
  for (let i = start; i <= end; i++) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return out.join("\n");
}

function scanPatterns(patterns, limit = 30) {
  const out = [];
  for (const p of patterns) {
    let idx = 0;
    let count = 0;
    while ((idx = src.indexOf(p, idx)) >= 0 && count < limit) {
      out.push("============================================================");
      out.push("PATTERN=" + p);
      out.push("LINE=" + lineNo(idx));
      out.push("------------------------------------------------------------");
      out.push(around(idx));
      idx += p.length;
      count++;
    }
  }
  return out.join("\n") + "\n";
}

function scanBraceEnd(openIndex) {
  let depth = 0, quote = "", escape = false, lineComment = false, blockComment = false;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i], next = src[i + 1];

    if (lineComment) { if (ch === "\n") lineComment = false; continue; }
    if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; i++; } continue; }

    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") { lineComment = true; i++; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

function findFunction(name) {
  const patterns = [
    new RegExp("function\\s+" + name + "\\s*\\(", "g"),
    new RegExp(name + "\\s*=\\s*function\\s*\\(", "g")
  ];

  for (const re of patterns) {
    const m = re.exec(src);
    if (!m) continue;
    const open = src.indexOf("{", m.index);
    const end = scanBraceEnd(open);
    if (open >= 0 && end > open) {
      return { name, start: m.index, line: lineNo(m.index), text: src.slice(m.index, end) };
    }
  }
  return null;
}

fs.writeFileSync(goOut, scanPatterns([
  'data-core-action="go"',
  "data-core-action='go'",
  'case "go"',
  "case 'go'",
  'action === "go"',
  "action === 'go'",
  "data-screen",
  "dataset.screen",
  "targetScreen",
  "nextScreen",
  "state.screen ="
], 35));

fs.writeFileSync(clickOut, scanPatterns([
  'data-screen="section-new"',
  "data-screen='section-new'",
  'section-new',
  '課新規',
  '新規追加',
  'section-detail',
  'section-edit',
  'placement-new'
], 35));

fs.writeFileSync(selectedOut, scanPatterns([
  "selectedSectionId =",
  "state.selectedSectionId",
  "selectedSection =",
  "state.selectedSection",
  "currentSection =",
  "state.currentSection",
  "editingSectionId",
  "sectionEditId",
  "placementEditingSectionId",
  "workerPlacementSectionId"
], 40));

fs.writeFileSync(placementOut, scanPatterns([
  "従業員設定",
  "従業員設定ロボット",
  "従業員行を追加",
  "placement",
  "placements",
  "worker",
  "robot",
  "insertAdjacentHTML",
  "appendChild",
  "insertBefore",
  "innerHTML ="
], 45));

const renderFn = findFunction("render");
let branchText = "";
if (renderFn) {
  const idx = renderFn.text.indexOf('state.screen === "section-new"');
  branchText = idx >= 0
    ? renderFn.text.slice(Math.max(0, idx - 900), Math.min(renderFn.text.length, idx + 2600))
    : renderFn.text.slice(0, 5000);
}
fs.writeFileSync(branchOut, branchText);

const goText = fs.readFileSync(goOut, "utf8");
const selectedText = fs.readFileSync(selectedOut, "utf8");
const placementText = fs.readFileSync(placementOut, "utf8");

const hasGoHandler = /action === ["']go["']|case ["']go["']|data-core-action=["']go["']/.test(goText);
const sectionNewButtonHasDataScreen = /data-screen=["']section-new["']/.test(goText) || /data-screen=["']section-new["']/.test(fs.readFileSync(clickOut, "utf8"));
const goHandlerSetsScreen = /state\.screen\s*=|screen\s*=/.test(goText);
const goHandlerClearsSelectedSection =
  /selectedSectionId\s*=\s*["']["']|state\.selectedSectionId\s*=\s*["']["']|selectedSection\s*=\s*null|state\.selectedSection\s*=\s*null|currentSection\s*=\s*null|state\.currentSection\s*=\s*null/.test(goText);

const sectionNewBranchClearsSelectedSection =
  /selectedSectionId\s*=\s*["']["']|selectedSection\s*=\s*null|currentSection\s*=\s*null/.test(branchText);

const hasGlobalPlacementInjection =
  /insertAdjacentHTML|appendChild|insertBefore|innerHTML\s*=/.test(placementText) &&
  /従業員設定|従業員設定ロボット|placement|worker|robot/i.test(placementText);

let judgement = "UNKNOWN";
if (hasGoHandler && sectionNewButtonHasDataScreen && !goHandlerClearsSelectedSection) {
  judgement = "FIX_SECTION_NEW_GO_HANDLER_CLEAR_SELECTED_SECTION_STATE";
} else if (!sectionNewBranchClearsSelectedSection) {
  judgement = "FIX_SECTION_NEW_RENDER_BRANCH_CLEAR_SELECTED_SECTION_STATE";
} else if (hasGlobalPlacementInjection) {
  judgement = "FIX_GLOBAL_PLACEMENT_INJECTION_SKIP_SECTION_NEW";
} else {
  judgement = "CAUSE_NEEDS_RUNTIME_STATE_DEBUG";
}

const summary = [
  "HAS_GO_HANDLER=" + hasGoHandler,
  "SECTION_NEW_BUTTON_HAS_DATA_SCREEN=" + sectionNewButtonHasDataScreen,
  "GO_HANDLER_SETS_SCREEN=" + goHandlerSetsScreen,
  "GO_HANDLER_CLEARS_SELECTED_SECTION=" + goHandlerClearsSelectedSection,
  "SECTION_NEW_BRANCH_CLEARS_SELECTED_SECTION=" + sectionNewBranchClearsSelectedSection,
  "HAS_GLOBAL_PLACEMENT_INJECTION=" + hasGlobalPlacementInjection,
  "FINAL_STATIC_JUDGEMENT=" + judgement
].join("\n") + "\n";

fs.writeFileSync(classifyOut, summary);
process.stdout.write(summary);
