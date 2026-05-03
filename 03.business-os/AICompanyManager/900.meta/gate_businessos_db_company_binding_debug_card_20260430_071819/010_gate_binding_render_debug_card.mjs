import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_GATE_BUSINESSOS_DB_COMPANY_BINDING_DEBUG_CARD_AKN_AKQ_V1";

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

const range = findFunctionRange(src, "render");

if (!range) {
  throw new Error("function render not found in binding JS");
}

const bodyStart = range.open + 1;

const gate = `
    /* ${MARK}
     * 本番UIでは BusinessOS DB 会社バインドのデバッグカードを描画しない。
     * このファイルの会社状態/binding/observer補助は残す。
     * デバッグ表示が必要な時だけ console 等で:
     * window.AICM_DEV_DEBUG_SURFACE_ENABLED = true
     */
    if (!window.AICM_DEV_DEBUG_SURFACE_ENABLED) {
      return;
    }
`;

src = src.slice(0, bodyStart) + gate + src.slice(bodyStart);

fs.writeFileSync(file, src);
console.log("render function gated");
