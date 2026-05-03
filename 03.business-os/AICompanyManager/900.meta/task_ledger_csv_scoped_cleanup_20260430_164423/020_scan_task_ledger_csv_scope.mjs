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

const csvCard = extractFunction(src, "renderCsvImportCard");

const values = {
  CSV_CARD_CHATGPT_PROMPT_COUNT: count(csvCard, "ChatGPT用プロンプト"),
  CSV_CARD_FILE_READ_COUNT: count(csvCard, "CSVファイル読込"),
  CSV_CARD_FILE_NAME_COUNT: count(csvCard, "ファイル名"),
  CSV_CARD_IMPORT_EXEC_COUNT: count(csvCard, "CSV取り込み実行"),
  CSV_CARD_TEMPLATE_COUNT: count(csvCard, "CSVテンプレ"),
  CSV_CARD_PREVIEW_COUNT: count(csvCard, "プレビュー"),
  CSV_CARD_TEXTAREA_COUNT: count(csvCard, "<textarea"),
  CSV_PANEL_TEXTAREA_CSS_COUNT: count(src, ".aicm-csv-panel textarea"),
  GLOBAL_TEXTAREA_COUNT_ALLOWED: count(src, "<textarea")
};

for (const [key, value] of Object.entries(values)) {
  console.log(key + "=" + value);
}

console.log("");
console.log("---- renderCsvImportCard ----");
console.log(csvCard);
