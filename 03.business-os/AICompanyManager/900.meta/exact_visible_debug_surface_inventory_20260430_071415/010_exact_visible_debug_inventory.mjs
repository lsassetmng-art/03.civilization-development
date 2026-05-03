import fs from "node:fs";
import path from "node:path";

const appRoot = process.argv[2];
const indexFile = process.argv[3];
const blocksOut = process.argv[4];
const summaryOut = process.argv[5];

const html = fs.readFileSync(indexFile, "utf8");
const indexLines = html.split(/\n/);

const visibleDebugLabel = /BusinessOS DB|会社バインド|DB会社|会社ID|デバッグ|debug|Debug|diagnostic|Diagnostic|診断|検証|Smoke|smoke|payload preview|Payload Preview|プレビュー|preview|rescue|Rescue|白画面|visible consistency|authoritative|開発|dev-only|DEV_ONLY/i;
const domWrite = /innerHTML|insertAdjacentHTML|appendChild|prepend|before|after|createElement|textContent|className|style\.|document\.body|aicm-card|aicm-panel|aicm-debug|aicm-muted|button|select|input|textarea|section|div/i;
const productionNeed = /company_id|company-select|selected|current|sessionStorage|localStorage|fetch|api|MutationObserver|addEventListener|state|context|binding|sync|payload|save|delete|department|organization|robot|placement/i;

function activeScriptFiles() {
  const rows = [];
  for (let i = 0; i < indexLines.length; i += 1) {
    const line = indexLines[i];
    if (!/<script[^>]+src=/.test(line)) continue;
    if (/<!--/.test(line)) continue;
    const m = line.match(/src=["']([^"']+)["']/);
    if (!m) continue;

    let src = m[1].replace(/\?.*$/, "");
    if (src.startsWith("./")) src = src.slice(2);
    const full = path.resolve(appRoot, src);
    rows.push({ indexLine: i + 1, src: m[1], srcClean: src, full });
  }
  return rows;
}

function findFunctionStart(lines, hitIndex) {
  for (let i = hitIndex; i >= 0; i -= 1) {
    if (/^\s*function\s+[A-Za-z0-9_$]+\s*\(/.test(lines[i])) return i;
    if (/^\s*(?:const|let|var)\s+[A-Za-z0-9_$]+\s*=\s*function\s*\(/.test(lines[i])) return i;
    if (/^\s*(?:const|let|var)\s+[A-Za-z0-9_$]+\s*=\s*\([^)]*\)\s*=>/.test(lines[i])) return i;
    if (/^\s*[A-Za-z0-9_$]+\s*:\s*function\s*\(/.test(lines[i])) return i;
  }
  return Math.max(0, hitIndex - 20);
}

function nameFromLine(line) {
  let m = line.match(/function\s+([A-Za-z0-9_$]+)\s*\(/);
  if (m) return m[1];
  m = line.match(/(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/);
  if (m) return m[1];
  m = line.match(/^\s*([A-Za-z0-9_$]+)\s*:\s*function\s*\(/);
  if (m) return m[1];
  return "UNKNOWN_BLOCK";
}

function findBlockEnd(lines, start) {
  let depth = 0;
  let seen = false;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    for (let j = 0; j < line.length; j += 1) {
      const ch = line[j];
      if (ch === "{") { depth += 1; seen = true; }
      if (ch === "}") {
        depth -= 1;
        if (seen && depth <= 0) return Math.min(lines.length - 1, i + 5);
      }
    }
    if (!seen && i > start + 20) return Math.min(lines.length - 1, start + 80);
  }
  return Math.min(lines.length - 1, start + 120);
}

const scripts = activeScriptFiles();
const blockMap = new Map();

for (const script of scripts) {
  if (!fs.existsSync(script.full)) continue;

  const src = fs.readFileSync(script.full, "utf8");
  const lines = src.split(/\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!visibleDebugLabel.test(line)) continue;

    let nearbyDom = false;
    let nearbyProduction = false;

    const from = Math.max(0, i - 8);
    const to = Math.min(lines.length - 1, i + 8);

    for (let j = from; j <= to; j += 1) {
      if (domWrite.test(lines[j])) nearbyDom = true;
      if (productionNeed.test(lines[j])) nearbyProduction = true;
    }

    if (!nearbyDom) continue;

    const start = findFunctionStart(lines, i);
    const end = findBlockEnd(lines, start);
    const blockName = nameFromLine(lines[start]);
    const key = `${script.srcClean}:${start}:${end}:${blockName}`;

    if (!blockMap.has(key)) {
      blockMap.set(key, {
        script,
        start,
        end,
        blockName,
        hits: [],
        productionHits: 0,
        domHits: 0,
        labelHits: 0
      });
    }

    const block = blockMap.get(key);
    block.hits.push(i);

    for (let j = start; j <= end; j += 1) {
      if (visibleDebugLabel.test(lines[j])) block.labelHits += 1;
      if (domWrite.test(lines[j])) block.domHits += 1;
      if (productionNeed.test(lines[j])) block.productionHits += 1;
    }
  }
}

const blocks = Array.from(blockMap.values()).sort((a, b) => {
  return b.labelHits + b.domHits - (a.labelHits + a.domHits);
});

const out = [];
const summary = [];

summary.push([
  "script",
  "block",
  "range",
  "label_hits",
  "dom_hits",
  "production_hits",
  "risk",
  "recommended_action"
].join("\t"));

out.push("============================================================");
out.push("VISIBLE DEBUG SURFACE BLOCKS");
out.push("============================================================");
out.push("");

for (const block of blocks) {
  const risk = block.productionHits > 0 ? "coupled_do_not_disable_whole_file" : "debug_only_candidate";
  const action = block.productionHits > 0
    ? "split_or_gate_this_visible_debug_block_only"
    : "move_to_debug_only_or_disable_block";

  summary.push([
    block.script.srcClean,
    block.blockName,
    `${block.start + 1}-${block.end + 1}`,
    block.labelHits,
    block.domHits,
    block.productionHits,
    risk,
    action
  ].join("\t"));

  out.push("------------------------------------------------------------");
  out.push(`SCRIPT=${block.script.srcClean}`);
  out.push(`INDEX_LINE=${block.script.indexLine}`);
  out.push(`BLOCK=${block.blockName}`);
  out.push(`RANGE=${block.start + 1}-${block.end + 1}`);
  out.push(`LABEL_HITS=${block.labelHits}`);
  out.push(`DOM_HITS=${block.domHits}`);
  out.push(`PRODUCTION_HITS=${block.productionHits}`);
  out.push(`RISK=${risk}`);
  out.push(`ACTION=${action}`);
  out.push(`HIT_LINES=${block.hits.map(n => n + 1).join(",")}`);
  out.push("------------------------------------------------------------");

  const lines = fs.readFileSync(block.script.full, "utf8").split(/\n/);
  for (let i = block.start; i <= block.end; i += 1) {
    out.push(String(i + 1).padStart(5, " ") + ": " + lines[i]);
  }
  out.push("");
}

fs.writeFileSync(blocksOut, out.join("\n"));
fs.writeFileSync(summaryOut, summary.join("\n") + "\n");
