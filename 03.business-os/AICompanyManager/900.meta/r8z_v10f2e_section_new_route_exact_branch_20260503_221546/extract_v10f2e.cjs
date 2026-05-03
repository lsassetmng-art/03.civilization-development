const fs = require("fs");

const core = process.argv[2];
const renderOut = process.argv[3];
const sectionNewOut = process.argv[4];
const clickOut = process.argv[5];
const routeOut = process.argv[6];

const src = fs.readFileSync(core, "utf8");
const lines = src.split(/\n/);

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function around(index, before = 25, after = 80) {
  const ln = lineNo(index);
  const start = Math.max(1, ln - before);
  const end = Math.min(lines.length, ln + after);
  const out = [];
  for (let i = start; i <= end; i++) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return out.join("\n");
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
  const re = new RegExp("function\\s+" + name + "\\s*\\(", "g");
  const m = re.exec(src);
  if (!m) return null;
  const open = src.indexOf("{", m.index);
  const end = scanBraceEnd(open);
  return {
    name,
    start: m.index,
    end,
    line: lineNo(m.index),
    text: src.slice(m.index, end)
  };
}

const renderFn = findFunction("render");
const renderSectionNew = findFunction("renderSectionNew");

let renderText = "";
if (renderFn) {
  const idx = renderFn.text.indexOf('state.screen === "section-new"');
  renderText = [
    "RENDER_FOUND=true",
    "RENDER_LINE=" + renderFn.line,
    "SECTION_NEW_IN_RENDER=" + (idx >= 0 ? "true" : "false"),
    "RENDER_CALLS_RENDER_SECTION_NEW=" + (renderFn.text.includes("renderSectionNew()") || renderFn.text.includes("renderSectionNew(") ? "true" : "false"),
    "",
    idx >= 0 ? around(renderFn.start + idx, 30, 90) : renderFn.text.slice(0, 8000)
  ].join("\n");
} else {
  renderText = "RENDER_FOUND=false\n";
}
fs.writeFileSync(renderOut, renderText);

fs.writeFileSync(sectionNewOut, renderSectionNew ? [
  "RENDER_SECTION_NEW_FOUND=true",
  "RENDER_SECTION_NEW_LINE=" + renderSectionNew.line,
  "",
  renderSectionNew.text
].join("\n") : "RENDER_SECTION_NEW_FOUND=false\n");

const patterns = [
  'data-screen="section-new"',
  "data-screen='section-new'",
  'state.screen = "section-new"',
  "state.screen='section-new'",
  "section-new",
  "renderSectionNew",
  "renderSectionEditPlaceholder",
  "renderSectionEdit",
  "renderPlacementNew",
  "placement-new"
];

let click = [];
for (const p of patterns) {
  let idx = 0;
  let count = 0;
  while ((idx = src.indexOf(p, idx)) >= 0 && count < 25) {
    click.push("============================================================");
    click.push("PATTERN=" + p);
    click.push("LINE=" + lineNo(idx));
    click.push("------------------------------------------------------------");
    click.push(around(idx, 12, 32));
    idx += p.length;
    count++;
  }
}
fs.writeFileSync(clickOut, click.join("\n") + "\n");

let route = [];
const routeTerms = [
  'state.screen === "section-new"',
  'state.screen === "section-edit"',
  'state.screen === "placement-new"',
  'state.screen === "department-edit"',
  'state.screen === "department-new"'
];

for (const p of routeTerms) {
  const idx = src.indexOf(p);
  route.push("============================================================");
  route.push("PATTERN=" + p);
  route.push("LINE=" + (idx >= 0 ? lineNo(idx) : 0));
  route.push("------------------------------------------------------------");
  route.push(idx >= 0 ? around(idx, 10, 35) : "NOT_FOUND");
}
fs.writeFileSync(routeOut, route.join("\n") + "\n");

const sectionNewIdx = renderFn ? renderFn.text.indexOf('state.screen === "section-new"') : -1;
let branchSnippet = "";
if (renderFn && sectionNewIdx >= 0) {
  branchSnippet = renderFn.text.slice(Math.max(0, sectionNewIdx - 400), Math.min(renderFn.text.length, sectionNewIdx + 1200));
}

const final =
  "RENDER_FOUND=" + (!!renderFn) + "\n" +
  "RENDER_SECTION_NEW_FOUND=" + (!!renderSectionNew) + "\n" +
  "RENDER_SECTION_NEW_LINE=" + (renderSectionNew ? renderSectionNew.line : 0) + "\n" +
  "SECTION_NEW_IN_RENDER=" + (sectionNewIdx >= 0) + "\n" +
  "SECTION_NEW_BRANCH_CALLS_RENDER_SECTION_NEW=" + (/renderSectionNew\s*\(/.test(branchSnippet)) + "\n" +
  "SECTION_NEW_BRANCH_CALLS_SECTION_EDIT=" + (/renderSectionEdit|renderSectionEditPlaceholder/.test(branchSnippet)) + "\n" +
  "SECTION_NEW_BRANCH_CALLS_PLACEMENT=" + (/renderPlacement|placement/i.test(branchSnippet)) + "\n" +
  "SECTION_NEW_BRANCH_SNIPPET=" + JSON.stringify(branchSnippet.slice(0, 900)) + "\n";

process.stdout.write(final);
