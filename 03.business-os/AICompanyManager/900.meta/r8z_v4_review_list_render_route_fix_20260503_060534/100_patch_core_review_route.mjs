import fs from "fs";

const corePath = process.env.CORE;
const patchOut = process.env.PATCH_OUT;

const src = fs.readFileSync(corePath, "utf8");

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = "";
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1] || "";

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
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function getFunctions(text) {
  const out = [];
  const re = /function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const open = text.indexOf("{", m.index);
    const close = findMatchingBrace(text, open);
    if (open >= 0 && close > open) {
      out.push({
        name,
        start: m.index,
        open,
        close,
        body: text.slice(open + 1, close)
      });
    }
  }
  return out;
}

const funcs = getFunctions(src);

const candidates = funcs.filter((fn) => {
  const body = fn.body;
  return (
    body.includes("ctx.review_wait_items") &&
    body.includes("state.review_wait_items") &&
    body.includes("delivery_summary_text") &&
    body.includes("human-review-approve") &&
    body.includes("human-review-return")
  );
});

if (candidates.length !== 1) {
  fs.writeFileSync(patchOut, JSON.stringify({
    status: "FAILED",
    reason: "review renderer candidate count invalid",
    candidate_count: candidates.length,
    candidates: candidates.map((c) => c.name)
  }, null, 2));
  throw new Error("review renderer candidate count invalid: " + candidates.length);
}

const rendererName = candidates[0].name;

if (rendererName === "renderReviewListPlaceholder") {
  fs.writeFileSync(patchOut, JSON.stringify({
    status: "FAILED",
    reason: "detected renderer is placeholder",
    rendererName
  }, null, 2));
  throw new Error("detected renderer is placeholder");
}

const before = {
  placeholderRouteCount: (src.match(/html\s*=\s*renderReviewListPlaceholder\s*\(\s*\)\s*;/g) || []).length,
  rendererRouteCount: (src.match(new RegExp("html\\\\s*=\\\\s*" + rendererName + "\\\\s*\\\\(\\\\s*\\\\)\\\\s*;", "g")) || []).length,
  rendererName
};

let next = src;

const routeRegex = /(\}\s*else\s+if\s*\(\s*state\.screen\s*===\s*["']review-list["']\s*\)\s*\{\s*)html\s*=\s*renderReviewListPlaceholder\s*\(\s*\)\s*;/;

if (routeRegex.test(next)) {
  next = next.replace(routeRegex, "$1html = " + rendererName + "();");
} else if (new RegExp("state\\.screen\\s*===\\s*[\"']review-list[\"'][\\s\\S]{0,160}html\\s*=\\s*" + rendererName + "\\s*\\(").test(next)) {
  // already patched
} else {
  fs.writeFileSync(patchOut, JSON.stringify({
    status: "FAILED",
    reason: "review-list route placeholder call not found and renderer route not already present",
    rendererName,
    before
  }, null, 2));
  throw new Error("review-list route placeholder call not found");
}

const after = {
  placeholderRouteCount: (next.match(/html\s*=\s*renderReviewListPlaceholder\s*\(\s*\)\s*;/g) || []).length,
  rendererRouteCount: (next.match(new RegExp("html\\\\s*=\\\\s*" + rendererName + "\\\\s*\\\\(\\\\s*\\\\)\\\\s*;", "g")) || []).length,
  rendererName,
  changed: next !== src
};

if (after.rendererRouteCount < 1) {
  fs.writeFileSync(patchOut, JSON.stringify({
    status: "FAILED",
    reason: "renderer route count invalid after patch",
    before,
    after
  }, null, 2));
  throw new Error("renderer route count invalid after patch");
}

fs.writeFileSync(corePath, next);

fs.writeFileSync(patchOut, JSON.stringify({
  status: "PATCHED",
  before,
  after,
  rendererName,
  core_file_write: "YES",
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
}, null, 2));

console.log(JSON.stringify({
  status: "PATCHED",
  rendererName,
  before,
  after
}, null, 2));
