const fs = require("fs");

const corePath = process.argv[2];
const outDir = process.argv[3];

const src = fs.readFileSync(corePath, "utf8");

function write(name, text) {
  fs.writeFileSync(`${outDir}/${name}`, text || "", "utf8");
}

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex) {
  let depth = 0;
  let quote = "";
  let template = false;
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openIndex; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

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
      if (ch === quote) {
        quote = "";
        template = false;
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
      template = ch === "`";
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

function findFunction(name) {
  const patterns = [
    new RegExp(`function\\s+${name}\\s*\\(`, "g"),
    new RegExp(`${name}\\s*=\\s*function\\s*\\(`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*function\\s*\\(`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*=>`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*[^\\n=]*=>`, "g")
  ];

  for (const re of patterns) {
    const m = re.exec(src);
    if (!m) continue;

    const start = m.index;
    const open = src.indexOf("{", start);
    if (open < 0) continue;

    const end = scanBraceEnd(open);
    if (end < 0) continue;

    return {
      name,
      start,
      end,
      line: lineNo(start),
      text: src.slice(start, end)
    };
  }

  return null;
}

function around(index, beforeLines = 18, afterLines = 40) {
  const lines = src.split(/\n/);
  const ln = lineNo(index);
  const start = Math.max(1, ln - beforeLines);
  const end = Math.min(lines.length, ln + afterLines);
  const out = [];

  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }

  return out.join("\n");
}

function identifiersCalled(text) {
  const set = new Set();
  const re = /\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  const skip = new Set([
    "if","for","while","switch","catch","function","return",
    "String","Number","Boolean","Array","Object","Date","JSON","Math",
    "parseInt","parseFloat","isNaN","isFinite","encodeURIComponent",
    "setTimeout","clearTimeout","alert","confirm","console"
  ]);

  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    if (!skip.has(name)) set.add(name);
  }

  return Array.from(set).sort();
}

const sectionNew = findFunction("renderSectionNew");

let summary = [];
summary.push(`SECTION_NEW_FUNC_FOUND=${sectionNew ? "true" : "false"}`);
summary.push(`SECTION_NEW_LINE=${sectionNew ? sectionNew.line : 0}`);

if (sectionNew) {
  write("020_renderSectionNew_extract.txt", [
    `FUNCTION=renderSectionNew`,
    `LINE=${sectionNew.line}`,
    `START=${sectionNew.start}`,
    `END=${sectionNew.end}`,
    "",
    sectionNew.text
  ].join("\n"));

  const calls = identifiersCalled(sectionNew.text);
  summary.push(`SECTION_NEW_CALL_COUNT=${calls.length}`);
  summary.push(`SECTION_NEW_CALLS=${calls.join(",")}`);

  const callRows = [];
  callRows.push(["called_name","defined","line","worker_related","placement_related","state_related"].join("\t"));

  const workerTerms = /worker|placement|robot|従業員|配置|ロボット|staff|member/i;
  const stateTerms = /selectedSectionId|selectedSection|currentSection|editingSectionId|sectionEditId|placements|state\.placements|sectionNew|newSection|draft/i;

  const workerFuncTexts = [];

  for (const name of calls) {
    const fn = findFunction(name);
    const text = fn ? fn.text : "";
    const workerRelated = workerTerms.test(name) || workerTerms.test(text);
    const placementRelated = /placement|placements|配置/i.test(name) || /placement|placements|配置/i.test(text);
    const stateRelated = stateTerms.test(text);

    callRows.push([
      name,
      fn ? "true" : "false",
      fn ? String(fn.line) : "",
      workerRelated ? "true" : "false",
      placementRelated ? "true" : "false",
      stateRelated ? "true" : "false"
    ].join("\t"));

    if (fn && (workerRelated || placementRelated || stateRelated)) {
      workerFuncTexts.push([
        "============================================================",
        `FUNCTION=${name}`,
        `LINE=${fn.line}`,
        `WORKER_RELATED=${workerRelated}`,
        `PLACEMENT_RELATED=${placementRelated}`,
        `STATE_RELATED=${stateRelated}`,
        "------------------------------------------------------------",
        fn.text.slice(0, 18000)
      ].join("\n"));
    }
  }

  write("030_section_new_call_graph.tsv", callRows.join("\n") + "\n");
  write("040_worker_related_function_extract.txt", workerFuncTexts.join("\n\n") + "\n");

  const sectionNewText = sectionNew.text;
  summary.push(`SECTION_NEW_HAS_WORKER_TEXT=${/従業員|worker|Worker|robot|ロボット|placement|配置/i.test(sectionNewText) ? "true" : "false"}`);
  summary.push(`SECTION_NEW_READS_SELECTED_SECTION=${/selectedSectionId|selectedSection|currentSection|editingSectionId|sectionEditId/.test(sectionNewText) ? "true" : "false"}`);
  summary.push(`SECTION_NEW_READS_PLACEMENTS=${/placements|placement|state\.placements/.test(sectionNewText) ? "true" : "false"}`);
  summary.push(`SECTION_NEW_HAS_DRAFT=${/sectionNewDraft|newSectionDraft|sectionNewWorkerRows|newSectionWorkerRows|draft/.test(sectionNewText) ? "true" : "false"}`);
} else {
  write("020_renderSectionNew_extract.txt", "renderSectionNew not found\n");
  write("030_section_new_call_graph.tsv", "called_name\tdefined\tline\tworker_related\tplacement_related\tstate_related\n");
  write("040_worker_related_function_extract.txt", "");
  summary.push(`SECTION_NEW_CALL_COUNT=0`);
  summary.push(`SECTION_NEW_CALLS=`);
  summary.push(`SECTION_NEW_HAS_WORKER_TEXT=false`);
  summary.push(`SECTION_NEW_READS_SELECTED_SECTION=false`);
  summary.push(`SECTION_NEW_READS_PLACEMENTS=false`);
  summary.push(`SECTION_NEW_HAS_DRAFT=false`);
}

const statePatterns = [
  "selectedSectionId",
  "selectedSection",
  "currentSection",
  "editingSectionId",
  "sectionEditId",
  "state.placements",
  "placements",
  "sectionNewDraft",
  "newSectionDraft",
  "sectionNewWorkerRows",
  "newSectionWorkerRows",
  "sectionPlacementDraft",
  "workerPlacementDraft"
];

let stateOut = [];
for (const p of statePatterns) {
  let idx = 0;
  let count = 0;
  while ((idx = src.indexOf(p, idx)) >= 0 && count < 12) {
    stateOut.push("============================================================");
    stateOut.push(`PATTERN=${p}`);
    stateOut.push(`LINE=${lineNo(idx)}`);
    stateOut.push("------------------------------------------------------------");
    stateOut.push(around(idx, 8, 14));
    idx += p.length;
    count += 1;
  }
}
write("050_state_usage_extract.txt", stateOut.join("\n") + "\n");

const renderRouteIdx = src.indexOf('state.screen === "section-new"');
write("060_render_route_extract.txt", renderRouteIdx >= 0 ? around(renderRouteIdx, 20, 60) : "section-new render route not found\n");

const actionTerms = [
  'data-screen="section-new"',
  'data-core-action="section-new',
  'section-new',
  'renderSectionNew',
  'section-create',
  'section-save',
  'section-add',
  'section-new-save'
];

let actionOut = [];
for (const p of actionTerms) {
  let idx = 0;
  let count = 0;
  while ((idx = src.indexOf(p, idx)) >= 0 && count < 10) {
    actionOut.push("============================================================");
    actionOut.push(`PATTERN=${p}`);
    actionOut.push(`LINE=${lineNo(idx)}`);
    actionOut.push("------------------------------------------------------------");
    actionOut.push(around(idx, 10, 18));
    idx += p.length;
    count += 1;
  }
}
write("070_section_new_action_extract.txt", actionOut.join("\n") + "\n");

const graphPath = `${outDir}/030_section_new_call_graph.tsv`;
let graph = "";
try { graph = fs.readFileSync(graphPath, "utf8"); } catch (_) {}

const workerRelatedCount = graph.split(/\n/).filter(line => /\ttrue\t|\ttrue$/.test(line) && line.includes("\ttrue")).length;
const placementRelatedCount = graph.split(/\n/).filter(line => line.split("\t")[4] === "true").length;
const stateRelatedCount = graph.split(/\n/).filter(line => line.split("\t")[5] === "true").length;

summary.push(`WORKER_RELATED_CALL_COUNT=${workerRelatedCount}`);
summary.push(`PLACEMENT_RELATED_CALL_COUNT=${placementRelatedCount}`);
summary.push(`STATE_RELATED_CALL_COUNT=${stateRelatedCount}`);

let judgement = "UNKNOWN";
if (!sectionNew) {
  judgement = "RENDER_SECTION_NEW_NOT_FOUND";
} else {
  const text = sectionNew.text;
  if (/selectedSectionId|selectedSection|currentSection|editingSectionId|sectionEditId/.test(text)) {
    judgement = "FIX_RENDER_SECTION_NEW_REMOVE_SELECTED_SECTION_READS";
  } else if (/placements|placement|state\.placements/.test(text)) {
    judgement = "FIX_RENDER_SECTION_NEW_PASS_EMPTY_PLACEMENTS_FOR_NEW";
  } else if (stateRelatedCount > 0 && (workerRelatedCount > 0 || placementRelatedCount > 0)) {
    judgement = "FIX_WORKER_RENDERER_ADD_MODE_NEW_EMPTY_DRAFT";
  } else if (/従業員|worker|Worker|robot|ロボット|placement|配置/i.test(text)) {
    judgement = "FIX_SECTION_NEW_LOCAL_WORKER_DRAFT_ONLY";
  } else {
    judgement = "SECTION_NEW_CALL_PATH_NEEDS_MANUAL_SNIP_REVIEW";
  }
}

summary.push(`FINAL_STATIC_JUDGEMENT=${judgement}`);

write("080_classification.txt", [
  `FINAL_STATIC_JUDGEMENT=${judgement}`,
  "",
  "Recommended high-maintainability patch policy:",
  "- Do not post-process HTML.",
  "- Do not wrap renderSectionNew just to replace output.",
  "- Add explicit mode='new' / mode='edit' to worker placement renderer if shared.",
  "- section-new must pass empty draft rows, not selected section placements.",
  "- section-edit/detail may continue reading selected section placements.",
  "- section-new entry should initialize sectionNewDraft, not reuse selectedSectionId.",
  ""
].join("\n"));

write("090_node_summary.env", summary.join("\n") + "\n");
