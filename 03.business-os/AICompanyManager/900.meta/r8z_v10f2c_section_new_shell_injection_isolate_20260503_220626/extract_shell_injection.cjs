const fs = require("fs");

const corePath = process.argv[2];
const outDir = process.argv[3];

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\n/);

function write(name, text) {
  fs.writeFileSync(`${outDir}/${name}`, text || "", "utf8");
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
      open,
      end,
      line: lineNo(start),
      text: src.slice(start, end)
    };
  }

  return null;
}

function around(index, beforeLines = 12, afterLines = 28) {
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

function hasWorkerTerms(text) {
  return /従業員設定|従業員設定ロボット|従業員|worker|Worker|robot|ロボット|placement|配置/i.test(text);
}

function hasSectionNewTerms(text) {
  return /section-new|renderSectionNew|課新規|新規課/.test(text);
}

function hasInjectionTerms(text) {
  return /innerHTML|insertAdjacentHTML|appendChild|insertBefore|replace\(|renderShell\(|render\(\)|__.*Wrapped|Original|inject|panel|visibility|status/i.test(text);
}

const summary = [];

const renderShell = findFunction("renderShell");
summary.push(`RENDER_SHELL_FOUND=${renderShell ? "true" : "false"}`);
summary.push(`RENDER_SHELL_LINE=${renderShell ? renderShell.line : 0}`);

if (renderShell) {
  write("020_renderShell_extract.txt", [
    `FUNCTION=renderShell`,
    `LINE=${renderShell.line}`,
    "",
    renderShell.text
  ].join("\n"));

  const calls = identifiersCalled(renderShell.text);
  const rows = ["called_name\tdefined\tline\tworker_related\tinjection_related"];
  for (const name of calls) {
    const fn = findFunction(name);
    const text = fn ? fn.text : "";
    rows.push([
      name,
      fn ? "true" : "false",
      fn ? String(fn.line) : "",
      hasWorkerTerms(name + "\n" + text) ? "true" : "false",
      hasInjectionTerms(name + "\n" + text) ? "true" : "false"
    ].join("\t"));
  }
  write("060_renderShell_call_graph.tsv", rows.join("\n") + "\n");

  summary.push(`RENDER_SHELL_HAS_WORKER_TEXT=${hasWorkerTerms(renderShell.text) ? "true" : "false"}`);
  summary.push(`RENDER_SHELL_CALL_COUNT=${calls.length}`);
} else {
  write("020_renderShell_extract.txt", "renderShell not found\n");
  write("060_renderShell_call_graph.tsv", "called_name\tdefined\tline\tworker_related\tinjection_related\n");
  summary.push(`RENDER_SHELL_HAS_WORKER_TEXT=false`);
  summary.push(`RENDER_SHELL_CALL_COUNT=0`);
}

const renderFn = findFunction("render");
summary.push(`RENDER_FUNC_FOUND=${renderFn ? "true" : "false"}`);
summary.push(`RENDER_FUNC_LINE=${renderFn ? renderFn.line : 0}`);

if (renderFn) {
  write("030_render_function_extract.txt", [
    `FUNCTION=render`,
    `LINE=${renderFn.line}`,
    "",
    renderFn.text
  ].join("\n"));
  summary.push(`RENDER_FUNC_HAS_SECTION_NEW=${renderFn.text.includes('state.screen === "section-new"') ? "true" : "false"}`);
  summary.push(`RENDER_FUNC_HAS_WORKER_TEXT=${hasWorkerTerms(renderFn.text) ? "true" : "false"}`);
} else {
  write("030_render_function_extract.txt", "render not found\n");
  summary.push(`RENDER_FUNC_HAS_SECTION_NEW=false`);
  summary.push(`RENDER_FUNC_HAS_WORKER_TEXT=false`);
}

const literalPatterns = [
  "従業員設定ロボット",
  "従業員設定",
  "従業員行を追加",
  "workerPlacement",
  "worker placement",
  "placement-new",
  "selectedSectionId",
  "section-new"
];

let literalOut = [];
for (const p of literalPatterns) {
  let idx = 0;
  let count = 0;
  while ((idx = src.indexOf(p, idx)) >= 0 && count < 25) {
    literalOut.push("============================================================");
    literalOut.push(`PATTERN=${p}`);
    literalOut.push(`LINE=${lineNo(idx)}`);
    literalOut.push("------------------------------------------------------------");
    literalOut.push(around(idx, 10, 24));
    idx += p.length;
    count += 1;
  }
}
write("040_worker_literal_scan.txt", literalOut.join("\n") + "\n");

const sectionNewRouteIdx = src.indexOf('state.screen === "section-new"');
write("050_section_new_route_scan.txt", sectionNewRouteIdx >= 0 ? around(sectionNewRouteIdx, 20, 70) : "section-new route not found\n");

const injectionPatterns = [
  "renderShell =",
  "var originalRenderShell",
  "renderShell(",
  "renderSectionNew =",
  "var originalRenderSectionNew",
  "render = function",
  "var originalRender",
  "innerHTML =",
  "insertAdjacentHTML",
  "appendChild",
  "insertBefore",
  "__r8",
  "__aicm",
  "inject"
];

let injOut = [];
for (const p of injectionPatterns) {
  let idx = 0;
  let count = 0;
  while ((idx = src.indexOf(p, idx)) >= 0 && count < 35) {
    const snippet = around(idx, 8, 18);
    if (hasWorkerTerms(snippet) || hasSectionNewTerms(snippet) || hasInjectionTerms(snippet)) {
      injOut.push("============================================================");
      injOut.push(`PATTERN=${p}`);
      injOut.push(`LINE=${lineNo(idx)}`);
      injOut.push("------------------------------------------------------------");
      injOut.push(snippet);
    }
    idx += p.length;
    count += 1;
  }
}
write("070_global_injection_scan.txt", injOut.join("\n") + "\n");

const clickPatterns = [
  'data-screen="section-new"',
  'data-core-action="go"',
  'section-new',
  'placement-new',
  'section-detail',
  'section-edit'
];

let clickOut = [];
for (const p of clickPatterns) {
  let idx = 0;
  let count = 0;
  while ((idx = src.indexOf(p, idx)) >= 0 && count < 30) {
    clickOut.push("============================================================");
    clickOut.push(`PATTERN=${p}`);
    clickOut.push(`LINE=${lineNo(idx)}`);
    clickOut.push("------------------------------------------------------------");
    clickOut.push(around(idx, 8, 20));
    idx += p.length;
    count += 1;
  }
}
write("080_section_new_click_route_scan.txt", clickOut.join("\n") + "\n");

const workerLiteralCount = (src.match(/従業員設定ロボット|従業員設定|従業員行を追加/g) || []).length;
const renderShellWorkerCallCount = fs.readFileSync(`${outDir}/060_renderShell_call_graph.tsv`, "utf8")
  .split(/\n/)
  .filter(line => line.split("\t")[3] === "true").length;

const shellInjectionCount = fs.readFileSync(`${outDir}/070_global_injection_scan.txt`, "utf8")
  .split("============================================================").length - 1;

const sectionNewRouteText = sectionNewRouteIdx >= 0 ? around(sectionNewRouteIdx, 5, 20) : "";
const sectionNewRouteCallsRenderSectionNew = sectionNewRouteText.includes("renderSectionNew");

summary.push(`WORKER_LITERAL_COUNT=${workerLiteralCount}`);
summary.push(`RENDER_SHELL_WORKER_CALL_COUNT=${renderShellWorkerCallCount}`);
summary.push(`GLOBAL_INJECTION_HIT_COUNT=${shellInjectionCount}`);
summary.push(`SECTION_NEW_ROUTE_CALLS_RENDER_SECTION_NEW=${sectionNewRouteCallsRenderSectionNew ? "true" : "false"}`);

let judgement = "UNKNOWN";

if (renderShell && hasWorkerTerms(renderShell.text)) {
  judgement = "FIX_RENDER_SHELL_EXCLUDE_WORKER_UI_FOR_SECTION_NEW";
} else if (renderShellWorkerCallCount > 0) {
  judgement = "FIX_RENDER_SHELL_CALLED_WORKER_FUNCTION_MODE_GUARD";
} else if (shellInjectionCount > 0) {
  judgement = "FIX_GLOBAL_INJECTION_SKIP_SECTION_NEW";
} else if (!sectionNewRouteCallsRenderSectionNew) {
  judgement = "FIX_SECTION_NEW_ROUTE_TARGET";
} else if (workerLiteralCount > 0) {
  judgement = "WORKER_UI_SOURCE_OUTSIDE_SECTION_NEW_NEED_LITERAL_FUNCTION_TARGET";
} else {
  judgement = "CAUSE_NOT_FOUND_UPLOAD_EXTRACTS";
}

summary.push(`FINAL_STATIC_JUDGEMENT=${judgement}`);

write("090_classification.txt", [
  `FINAL_STATIC_JUDGEMENT=${judgement}`,
  "",
  "Patch policy:",
  "- If renderShell itself injects worker UI, add screen-aware guard to renderShell, not HTML post-replacement.",
  "- If a global injection/wrapper appends worker UI, add if state.screen === 'section-new' return baseHtml.",
  "- If route target is wrong, fix action target only.",
  "- Do not wrap renderSectionNew.",
  "- Do not string-replace rendered HTML.",
  ""
].join("\n"));

write("100_node_summary.env", summary.join("\n") + "\n");
