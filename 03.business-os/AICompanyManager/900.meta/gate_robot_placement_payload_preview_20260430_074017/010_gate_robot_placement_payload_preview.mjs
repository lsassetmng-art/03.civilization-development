import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_GATE_ROBOT_PLACEMENT_PAYLOAD_PREVIEW_AKR_AKU_V1";

if (src.includes(MARK)) {
  console.log("already patched");
  process.exit(0);
}

function findFunctionRange(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) return null;

  const open = source.indexOf("{", start);
  if (open < 0) return null;

  let i = open + 1;
  let depth = 1;
  let quote = "";
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (; i < source.length; i += 1) {
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
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        quote = "";
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

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;

    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start, open, end: i + 1 };
    }
  }

  return null;
}

function gateFunction(source, functionName) {
  const range = findFunctionRange(source, functionName);
  if (!range) {
    return { source, changed: false, reason: functionName + " not found" };
  }

  const gate = `
    /* ${MARK}
     * 本番UIではロボット配置 payload preview / debug panel を描画しない。
     * payload build / validation / normalizer は残す。
     * デバッグ表示が必要な時だけ console 等で:
     * window.AICM_DEV_DEBUG_SURFACE_ENABLED = true
     */
    if (!window.AICM_DEV_DEBUG_SURFACE_ENABLED) {
      return;
    }
`;

  const next = source.slice(0, range.open + 1) + gate + source.slice(range.open + 1);
  return { source: next, changed: true, reason: "gated " + functionName };
}

const targets = ["renderPreview", "renderAll"];
const logs = [];

for (const fn of targets) {
  const result = gateFunction(src, fn);
  src = result.source;
  logs.push(result.reason);
}

if (!src.includes(MARK)) {
  throw new Error("no render function was gated; marker missing");
}

fs.writeFileSync(file, src);
console.log(logs.join("\\n"));
