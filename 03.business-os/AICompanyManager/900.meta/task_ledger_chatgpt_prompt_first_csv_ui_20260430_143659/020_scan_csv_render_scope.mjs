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

const block = extractFunction(src, "renderCsvImportCard");

const result = {
  CSV_RENDER_TEXTAREA_COUNT: count(block, "textarea"),
  CSV_RENDER_PREVIEW_LABEL_COUNT: count(block, "プレビュー"),
  CSV_RENDER_TEMPLATE_LABEL_COUNT: count(block, "CSVファイルテンプレ") + count(block, "CSV作成テンプレ") + count(block, "CSVテンプレ"),
  CSV_RENDER_CHATGPT_LABEL_COUNT: count(block, "ChatGPT用プロンプト"),
  CSV_RENDER_FILE_READ_COUNT: count(block, "CSVファイル読込"),
  CSV_RENDER_FILE_NAME_COUNT: count(block, "ファイル名"),
  CSV_RENDER_IMPORT_EXEC_COUNT: count(block, "CSV取り込み実行")
};

for (const [key, value] of Object.entries(result)) {
  console.log(`${key}=${value}`);
}

console.log("");
console.log("---- renderCsvImportCard excerpt ----");
console.log(block);
