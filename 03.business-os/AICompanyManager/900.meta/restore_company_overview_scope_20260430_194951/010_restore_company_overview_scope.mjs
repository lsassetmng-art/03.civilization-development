import fs from "node:fs";
import crypto from "node:crypto";

const currentFile = process.argv[2];
const sourceFile = process.argv[3];

let current = fs.readFileSync(currentFile, "utf8");
const source = fs.readFileSync(sourceFile, "utf8");

const marker = "AICM_COMPANY_OVERVIEW_SCOPE_ASK_ASN_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function extractFunction(sourceText, functionName) {
  const needle = "function " + functionName + "(";
  const start = sourceText.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = sourceText.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < sourceText.length; i++) {
    const ch = sourceText[i];
    const next = sourceText[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
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
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
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
        return {
          start,
          end: i + 1,
          text: sourceText.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function replaceFunction(sourceText, functionName, replacementText) {
  if (functionName === "renderShell") {
    throw new Error("STOP: renderShell replacement prohibited");
  }

  const fn = extractFunction(sourceText, functionName);
  return sourceText.slice(0, fn.start) + replacementText + sourceText.slice(fn.end);
}

function insertBeforeFunction(sourceText, functionName, insertion) {
  if (sourceText.includes(marker)) return sourceText;

  const pos = sourceText.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("Insertion anchor not found: " + functionName);

  return sourceText.slice(0, pos) + insertion + "\n\n  " + sourceText.slice(pos);
}

function findActionBlockByAction(sourceText, action) {
  const token = `action === "${action}"`;
  const tokenPos = sourceText.indexOf(token);
  if (tokenPos < 0) return null;

  const ifPos = sourceText.lastIndexOf("if", tokenPos);
  const braceStart = sourceText.indexOf("{", tokenPos);

  if (ifPos < 0 || braceStart < 0) {
    throw new Error("Action block malformed: " + action);
  }

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < sourceText.length; i++) {
    const ch = sourceText[i];
    const next = sourceText[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
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
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return { start: ifPos, end: i + 1 };
    }
  }

  throw new Error("Action block end not found: " + action);
}

function insertActionBeforeGo(sourceText, action, blockText) {
  if (sourceText.includes(`action === "${action}"`)) return sourceText;

  const goBlock = findActionBlockByAction(sourceText, "go");
  if (!goBlock) throw new Error("go action anchor not found");

  return sourceText.slice(0, goBlock.start) + blockText + "\n\n    " + sourceText.slice(goBlock.start);
}

function addCompanyEditRenderer(sourceText) {
  if (sourceText.includes("function renderCompanyEditPlaceholder(")) return sourceText;

  const insertion = `
// ${marker}
// Company overview must stay as overview.
// Company update uses this dedicated renderer.

function renderCompanyEditPlaceholder() {
    return renderAicmCompanyUpdateScreen();
  }`;

  return insertBeforeFunction(sourceText, "renderCompanyOverview", insertion);
}

function patchCompanyEditScreenRoute(sourceText) {
  let after = sourceText;

  after = after.replace(
    /(case\s+["']company-(?:edit|change|update)["']\s*:\s*return\s+)renderCompanyOverview\(\)/g,
    "$1renderCompanyEditPlaceholder()"
  );

  after = after.replace(
    /(screen\s*===\s*["']company-(?:edit|change|update)["'][\s\S]{0,220}?return\s+)renderCompanyOverview\(\)/g,
    "$1renderCompanyEditPlaceholder()"
  );

  after = after.replace(
    /(state\.screen\s*===\s*["']company-(?:edit|change|update)["'][\s\S]{0,220}?return\s+)renderCompanyOverview\(\)/g,
    "$1renderCompanyEditPlaceholder()"
  );

  return after;
}

const renderShellBeforeHash = hashText(extractFunction(current, "renderShell").text);

const sourceOverview = extractFunction(source, "renderCompanyOverview").text;

if (sourceOverview.includes("renderAicmCompanyUpdateScreen")) {
  throw new Error("STOP: source renderCompanyOverview already points to update screen");
}

if (!sourceOverview.includes("会社概要")) {
  throw new Error("STOP: source renderCompanyOverview does not look like overview");
}

current = replaceFunction(current, "renderCompanyOverview", sourceOverview);
current = addCompanyEditRenderer(current);
current = patchCompanyEditScreenRoute(current);

const renderShellAfterHash = hashText(extractFunction(current, "renderShell").text);

if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(currentFile, current);

const currentOverview = extractFunction(current, "renderCompanyOverview").text;
const companyEditFn = extractFunction(current, "renderCompanyEditPlaceholder").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(current, marker),
  renderShellChanged: false,
  overviewHasCompanySummaryLabel: currentOverview.includes("会社概要"),
  overviewToUpdateCount: count(currentOverview, "renderAicmCompanyUpdateScreen"),
  companyEditRendererCount: count(current, "function renderCompanyEditPlaceholder("),
  companyEditCallsUpdateCount: count(companyEditFn, "renderAicmCompanyUpdateScreen"),
  globalOverviewToUpdateCount: count(current, "function renderCompanyOverview() {\n    return renderAicmCompanyUpdateScreen();")
}));
