import fs from "node:fs";

const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
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
      if (depth === 0) return source.slice(start, i + 1);
    }
  }

  throw new Error("Function end not found");
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const block = extractFunction(src, "renderTree");

const result = {
  RENDERTREE_DEPARTMENT_EDIT_LABEL_COUNT: count(block, "部門変更"),
  RENDERTREE_SECTION_EDIT_LABEL_COUNT: count(block, "課変更"),
  RENDERTREE_DEPARTMENT_ADD_COUNT: count(block, "部門新規追加"),
  RENDERTREE_SECTION_ADD_COUNT: count(block, "課新規追加"),
  RENDERTREE_DEPARTMENT_CARD_EDIT_COUNT: count(block, 'data-screen="department-edit">変更'),
  RENDERTREE_SECTION_CARD_EDIT_COUNT: count(block, 'data-screen="section-edit">変更')
};

for (const [key, value] of Object.entries(result)) {
  console.log(`${key}=${value}`);
}

console.log("");
console.log("---- renderTree excerpt ----");
console.log(block);
