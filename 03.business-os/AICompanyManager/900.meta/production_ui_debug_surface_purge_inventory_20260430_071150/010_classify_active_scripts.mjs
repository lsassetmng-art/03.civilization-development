import fs from "node:fs";
import path from "node:path";

const appRoot = process.argv[2];
const indexFile = process.argv[3];
const outTsv = process.argv[4];
const debugHitsOut = process.argv[5];
const coupledHitsOut = process.argv[6];

const html = fs.readFileSync(indexFile, "utf8");
const lines = html.split(/\n/);

const activeScripts = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (!/<script[^>]+src=/.test(line)) continue;
  if (/<!--/.test(line)) continue;

  const m = line.match(/src=["']([^"']+)["']/);
  if (!m) continue;

  let src = m[1].replace(/\?.*$/, "");
  let full;

  if (src.startsWith("./")) src = src.slice(2);

  if (src.startsWith("../")) {
    full = path.resolve(appRoot, src);
  } else {
    full = path.resolve(appRoot, src);
  }

  activeScripts.push({
    lineNo: i + 1,
    src: m[1],
    srcClean: src,
    full
  });
}

const debugRegex = /debug|diagnostic|diag|card|panel|binding|company.*id|会社ID|会社バインド|BusinessOS DB|smoke|test|preview|visible|rescue|guard|console|dev|development|authoritative|status/i;
const productionRegex = /company_id|company-select|selected|current|sessionStorage|localStorage|fetch|api|8794|8795|8796|MutationObserver|addEventListener|CustomEvent|state|context|binding|sync|payload|save|delete|department|organization|robot|placement/i;
const dangerousDomRegex = /document\.body|body\.innerHTML|root\.innerHTML|innerHTML|insertAdjacentHTML|appendChild|prepend|before|after|remove\(|style\.display|MutationObserver|stopImmediatePropagation|preventDefault/i;

const rows = [];
const debugHits = [];
const coupledHits = [];

rows.push([
  "line",
  "src",
  "exists",
  "debug_hits",
  "production_hits",
  "dangerous_dom_hits",
  "classification",
  "recommended_action"
].join("\t"));

for (const item of activeScripts) {
  let exists = fs.existsSync(item.full) ? "yes" : "no";
  let debugCount = 0;
  let productionCount = 0;
  let dangerousCount = 0;
  let classification = "unknown";
  let recommended = "review";

  if (exists === "yes") {
    const src = fs.readFileSync(item.full, "utf8");
    const jsLines = src.split(/\n/);

    for (let i = 0; i < jsLines.length; i += 1) {
      const l = jsLines[i];

      if (debugRegex.test(l)) {
        debugCount += 1;
        debugHits.push(`${item.srcClean}:${i + 1}: ${l}`);
      }

      if (productionRegex.test(l)) {
        productionCount += 1;
      }

      if (dangerousDomRegex.test(l)) {
        dangerousCount += 1;
      }

      if (debugRegex.test(l) && productionRegex.test(l)) {
        coupledHits.push(`${item.srcClean}:${i + 1}: ${l}`);
      }
    }
  }

  if (debugCount === 0 && productionCount > 0) {
    classification = "production_or_core";
    recommended = "keep";
  } else if (debugCount > 0 && productionCount === 0) {
    classification = "debug_only_candidate";
    recommended = "move_to_debug_only_or_disable_from_production";
  } else if (debugCount > 0 && productionCount > 0) {
    classification = "coupled_debug_and_production";
    recommended = "split_core_and_debug_before_disabling";
  } else if (exists === "no") {
    classification = "missing_file";
    recommended = "check_index_reference";
  } else {
    classification = "neutral_or_static";
    recommended = "review";
  }

  rows.push([
    item.lineNo,
    item.src,
    exists,
    debugCount,
    productionCount,
    dangerousCount,
    classification,
    recommended
  ].join("\t"));
}

fs.writeFileSync(outTsv, rows.join("\n") + "\n");
fs.writeFileSync(debugHitsOut, debugHits.join("\n") + "\n");
fs.writeFileSync(coupledHitsOut, coupledHits.join("\n") + "\n");
