const fs = require("fs");

const corePath = process.argv[2];
const outPath = process.argv[3];

const src = fs.readFileSync(corePath, "utf8");
const lines = src.split(/\n/);

function lineOf(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function getLineRange(centerLine, before, after) {
  const start = Math.max(1, centerLine - before);
  const end = Math.min(lines.length, centerLine + after);
  const out = [];
  for (let i = start; i <= end; i += 1) {
    out.push(String(i).padStart(6, " ") + ": " + lines[i - 1]);
  }
  return out.join("\n");
}

function nearestBefore(index, patterns) {
  let best = null;

  for (const p of patterns) {
    const re = new RegExp(p, "g");
    let m;
    while ((m = re.exec(src))) {
      if (m.index < index) {
        if (!best || m.index > best.index) {
          best = {
            pattern: p,
            index: m.index,
            line: lineOf(m.index),
            text: src.slice(m.index, Math.min(src.length, m.index + 300)).split("\n")[0]
          };
        }
      }
    }
  }

  return best;
}

function nearestAfter(index, patterns) {
  let best = null;

  for (const p of patterns) {
    const re = new RegExp(p, "g");
    let m;
    while ((m = re.exec(src))) {
      if (m.index > index) {
        if (!best || m.index < best.index) {
          best = {
            pattern: p,
            index: m.index,
            line: lineOf(m.index),
            text: src.slice(m.index, Math.min(src.length, m.index + 300)).split("\n")[0]
          };
        }
      }
    }
  }

  return best;
}

function literalContext(index) {
  const before = src.slice(Math.max(0, index - 3000), index);
  const after = src.slice(index, Math.min(src.length, index + 3000));

  return {
    lastButtonBefore: before.lastIndexOf("<button"),
    nextButtonAfter: after.indexOf("<button"),
    lastDisabledBefore: before.lastIndexOf("disabled"),
    nextDisabledAfter: after.indexOf("disabled"),
    lastDataCoreBefore: before.lastIndexOf("data-core-action"),
    nextDataCoreAfter: after.indexOf("data-core-action"),
    lastBacktickBefore: before.lastIndexOf("`"),
    nextBacktickAfter: after.indexOf("`"),
    lastReturnBefore: before.lastIndexOf("return"),
    nextReturnAfter: after.indexOf("return"),
    lastJoinBefore: before.lastIndexOf(".join"),
    nextJoinAfter: after.indexOf(".join")
  };
}

function extract(label) {
  const idx = src.indexOf(label);
  if (idx < 0) {
    return `LABEL=${label}\nFOUND=false\n`;
  }

  const line = lineOf(idx);
  const fn = nearestBefore(idx, [
    "function\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*\\(",
    "async\\s+function\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*\\(",
    "const\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*=\\s*\\(",
    "let\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*=\\s*\\(",
    "var\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*=\\s*\\("
  ]);

  const beforeAnchor = nearestBefore(idx, [
    "<button",
    "disabled",
    "data-core-action",
    "return",
    "\\.map\\s*\\(",
    "\\.join\\s*\\(",
    "html\\s*=",
    "cards\\s*=",
    "actions\\s*=",
    "buttons\\s*=",
    "primary",
    "secondary"
  ]);

  const afterAnchor = nearestAfter(idx, [
    "</button>",
    "<button",
    "disabled",
    "data-core-action",
    "\\.join\\s*\\(",
    "return"
  ]);

  const ctx = literalContext(idx);

  let out = "";
  out += "============================================================\n";
  out += `LABEL=${label}\n`;
  out += "============================================================\n";
  out += "FOUND=true\n";
  out += `LABEL_LINE=${line}\n`;
  out += `NEAREST_FUNCTION_LINE=${fn ? fn.line : 0}\n`;
  out += `NEAREST_FUNCTION_TEXT=${fn ? fn.text : ""}\n`;
  out += `BEFORE_ANCHOR_LINE=${beforeAnchor ? beforeAnchor.line : 0}\n`;
  out += `BEFORE_ANCHOR_PATTERN=${beforeAnchor ? beforeAnchor.pattern : ""}\n`;
  out += `BEFORE_ANCHOR_TEXT=${beforeAnchor ? beforeAnchor.text : ""}\n`;
  out += `AFTER_ANCHOR_LINE=${afterAnchor ? afterAnchor.line : 0}\n`;
  out += `AFTER_ANCHOR_PATTERN=${afterAnchor ? afterAnchor.pattern : ""}\n`;
  out += `AFTER_ANCHOR_TEXT=${afterAnchor ? afterAnchor.text : ""}\n`;
  Object.keys(ctx).forEach((k) => {
    out += `${k}=${ctx[k]}\n`;
  });
  out += "\n---- numbered source window ----\n";
  out += getLineRange(line, 90, 110);
  out += "\n";
  return out;
}

let out = "";
out += extract("承認を実行する（次工程）");
out += "\n\n";
out += extract("差し戻しを実行する（次工程）");

fs.writeFileSync(outPath, out, "utf8");
