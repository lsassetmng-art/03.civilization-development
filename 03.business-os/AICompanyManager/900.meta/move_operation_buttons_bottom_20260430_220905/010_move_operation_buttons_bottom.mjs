import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_OPERATION_BUTTONS_BOTTOM_AUS_AUV_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

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
      if (depth === 0) return { start, end: i + 1, text: source.slice(start, i + 1) };
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function listFunctions(source) {
  const names = [];
  const re = /function\s+([A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(source)) !== null) names.push(m[1]);
  return Array.from(new Set(names));
}

function looksLikeEditOrCreateScreen(fnText) {
  const hasOperation =
    fnText.includes("変更を保存") ||
    fnText.includes("企業を作成") ||
    fnText.includes("AI企業を作成") ||
    fnText.includes("部門を作成") ||
    fnText.includes("課を作成");

  const hasTarget =
    fnText.includes("企業名") ||
    fnText.includes("部門名") ||
    fnText.includes("課名");

  const hasRole =
    fnText.includes("社長設定") ||
    fnText.includes("部長設定") ||
    fnText.includes("課長設定") ||
    fnText.includes("従業員設定");

  return hasOperation && hasTarget && hasRole;
}

function isPrimaryOperationButtonLine(line) {
  if (!line.includes("<button")) return false;

  if (line.includes("inline-worker-slot-add")) return false;
  if (line.includes("従業員行を追加")) return false;
  if (line.includes("AI企業を表示")) return false;
  if (line.includes("AI企業新規追加へ")) return false;
  if (line.includes("部門新規追加")) return false;
  if (line.includes("課新規追加")) return false;

  return (
    line.includes("変更を保存") ||
    line.includes("企業を作成") ||
    line.includes("AI企業を作成") ||
    line.includes("部門を作成") ||
    line.includes("課を作成")
  );
}

function hasBackButtonNearby(lines, start, end) {
  for (let i = Math.max(0, start - 3); i <= Math.min(lines.length - 1, end + 4); i++) {
    if (lines[i] && lines[i].includes("<button") && lines[i].includes("戻る")) return true;
  }
  return false;
}

function findOperationBlock(lines) {
  let primary = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isPrimaryOperationButtonLine(lines[i])) {
      primary = i;
      break;
    }
  }

  if (primary < 0) return null;

  let start = primary;
  for (let i = primary; i >= 0; i--) {
    if (lines[i].includes("<div") && (
      lines[i].includes("action") ||
      lines[i].includes("button") ||
      lines[i].includes("row") ||
      lines[i].includes("form")
    )) {
      start = i;
      break;
    }

    if (i < primary && lines[i].includes("<section")) {
      start = primary;
      break;
    }
  }

  let end = primary;
  for (let i = primary; i < lines.length; i++) {
    if (lines[i].includes("</div>")) {
      end = i;
      break;
    }
    if (i > primary && lines[i].includes("</section>")) {
      end = i - 1;
      break;
    }
  }

  if (!hasBackButtonNearby(lines, start, end)) {
    for (let i = end + 1; i < Math.min(lines.length, end + 5); i++) {
      if (lines[i].includes("<button") && lines[i].includes("戻る")) {
        end = i;
      }
      if (lines[i].includes("</div>")) {
        end = i;
        break;
      }
    }
  }

  return { start, end, primary };
}

function insertionIndex(lines) {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("].join") || lines[i].includes("].filter") || lines[i].includes("].map")) {
      return i;
    }
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("return renderShell([")) continue;
    if (lines[i].includes("return [")) continue;
    if (lines[i].includes(");")) return i;
  }

  return -1;
}

function moveButtonsToBottom(fnText) {
  if (fnText.includes(marker)) {
    return { text: fnText, moved: false, already: true, valid: true };
  }

  const lines = fnText.split("\n");
  const block = findOperationBlock(lines);
  if (!block) return { text: fnText, moved: false, already: false, valid: false };

  const opLines = lines.slice(block.start, block.end + 1);
  const remaining = lines.slice(0, block.start).concat(lines.slice(block.end + 1));

  const idx = insertionIndex(remaining);
  if (idx < 0) return { text: fnText, moved: false, already: false, valid: false };

  const wrapped = [
    "      // " + marker,
    "      '<section class=\"aicm-core-card aicm-operation-card\">',",
    "      '  <p class=\"aicm-eyebrow\">操作</p>',",
    ...opLines,
    "      '</section>',"
  ];

  const nextLines = remaining.slice(0, idx).concat(wrapped, remaining.slice(idx));
  const nextText = nextLines.join("\n");

  const rolePos = Math.max(
    nextText.lastIndexOf("社長設定"),
    nextText.lastIndexOf("部長設定"),
    nextText.lastIndexOf("課長設定"),
    nextText.lastIndexOf("従業員設定")
  );
  const opPos = nextText.lastIndexOf(marker);

  return {
    text: nextText,
    moved: true,
    already: false,
    valid: rolePos >= 0 && opPos > rolePos
  };
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

const names = listFunctions(src);
const candidates = [];
const moved = [];
const invalid = [];
let nextSrc = src;

for (const name of names) {
  const fn = extractFunction(nextSrc, name);
  if (!looksLikeEditOrCreateScreen(fn.text)) continue;

  candidates.push(name);
  const result = moveButtonsToBottom(fn.text);

  if (result.moved) {
    nextSrc = nextSrc.slice(0, fn.start) + result.text + nextSrc.slice(fn.end);
    moved.push(name);
    if (!result.valid) invalid.push(name);
  }
}

const renderShellAfterHash = hashText(extractFunction(nextSrc, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

src = nextSrc;
fs.writeFileSync(file, src);

const afterNames = listFunctions(src);
const bottomOk = [];
const stillBefore = [];

for (const name of afterNames) {
  const fn = extractFunction(src, name);
  if (!looksLikeEditOrCreateScreen(fn.text) && !fn.text.includes(marker)) continue;

  const rolePos = Math.max(
    fn.text.lastIndexOf("社長設定"),
    fn.text.lastIndexOf("部長設定"),
    fn.text.lastIndexOf("課長設定"),
    fn.text.lastIndexOf("従業員設定")
  );
  const opPos = fn.text.lastIndexOf(marker);
  if (opPos > rolePos && rolePos >= 0) bottomOk.push(name);
  else if (fn.text.includes(marker)) stillBefore.push(name);
}

console.log(JSON.stringify({
  changed: moved.length > 0,
  markerCount: count(src, marker),
  renderShellChanged: false,
  candidateCount: candidates.length,
  movedCount: moved.length,
  bottomOkCount: bottomOk.length,
  invalidCount: invalid.length + stillBefore.length,
  candidates,
  moved,
  bottomOk,
  invalid: invalid.concat(stillBefore),
  recommendedOnlyMarkerCount: count(src, "AICM_RECOMMENDED_ONLY_ROBOT_COMBOS_AUK_AUN_V1"),
  roleSettingOpenCount: count(src, "role-setting-open"),
  workerMultiCount: count(src, "従業員は複数設定できます"),
  workerAddActionCount: count(src, "inline-worker-slot-add"),
  confirmationMarkerCount: count(src, "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1"),
  directCompanyPostCount: count(src, 'aicmOrgPostJson("/api/aicm/v2/company/update"'),
  directDepartmentPostCount: count(src, 'aicmOrgPostJson("/api/aicm/v2/department/update"'),
  directSectionPostCount: count(src, 'aicmOrgPostJson("/api/aicm/v2/section/update"')
}));
